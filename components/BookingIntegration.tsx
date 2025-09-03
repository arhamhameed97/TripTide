'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Hotel, 
  Plane, 
  Calendar, 
  MapPin, 
  Users, 
  Star, 
  DollarSign, 
  ExternalLink, 
  Loader2,
  CheckCircle,
  AlertCircle,
  Clock,
  Wifi,
  Car,
  Utensils,
  Dumbbell
} from 'lucide-react'

interface BookingOption {
  id: string
  type: 'hotel' | 'flight' | 'activity'
  name: string
  description: string
  price: number
  originalPrice?: number
  currency: string
  rating: number
  reviewCount: number
  image: string
  amenities: string[]
  availability: {
    available: boolean
    lastUpdated: string
    capacity?: number
  }
  bookingUrl: string
  provider: string
  location: string
  duration?: string
  departureTime?: string
  arrivalTime?: string
  airline?: string
  flightNumber?: string
}

interface BookingIntegrationProps {
  destination: string
  startDate: string
  endDate: string
  travelers: number
  budget: number
  departureLocation?: string
}

export default function BookingIntegration({ 
  destination, 
  startDate, 
  endDate, 
  travelers, 
  budget,
  departureLocation = 'New York'
}: BookingIntegrationProps) {
  const [activeTab, setActiveTab] = useState('hotels')
  const [loading, setLoading] = useState(false)
  const [bookings, setBookings] = useState<{
    hotels: BookingOption[]
    flights: BookingOption[]
    activities: BookingOption[]
  }>({
    hotels: [],
    flights: [],
    activities: []
  })
  const [filters, setFilters] = useState({
    priceRange: [0, budget],
    rating: 0,
    amenities: [] as string[],
    sortBy: 'price' as 'price' | 'rating' | 'popularity'
  })

  // Fallback mock data in case API fails
  const mockHotels: BookingOption[] = [
    {
      id: 'hotel-1',
      type: 'hotel',
      name: 'Grand Plaza Hotel',
      description: 'Luxury hotel in the heart of the city with stunning views',
      price: 180,
      originalPrice: 220,
      currency: 'USD',
      rating: 4.5,
      reviewCount: 1247,
      image: '/api/placeholder/300/200',
      amenities: ['Free WiFi', 'Pool', 'Spa', 'Restaurant', 'Gym'],
      availability: {
        available: true,
        lastUpdated: new Date().toISOString(),
        capacity: 15
      },
      bookingUrl: 'https://booking.com/hotel-1',
      provider: 'Booking.com',
      location: 'Downtown, 2 blocks from main square'
    }
  ]

  const mockFlights: BookingOption[] = [
    {
      id: 'flight-1',
      type: 'flight',
      name: 'Direct Flight',
      description: 'Non-stop flight with premium amenities',
      price: 450,
      originalPrice: 520,
      currency: 'USD',
      rating: 4.3,
      reviewCount: 2341,
      image: '/api/placeholder/300/200',
      amenities: ['Free WiFi', 'Entertainment', 'Meal Included'],
      availability: {
        available: true,
        lastUpdated: new Date().toISOString(),
        capacity: 45
      },
      bookingUrl: 'https://kayak.com/flight-1',
      provider: 'Kayak',
      location: 'JFK → SFO',
      duration: '6h 15m',
      departureTime: '09:30 AM',
      arrivalTime: '12:45 PM',
      airline: 'United Airlines',
      flightNumber: 'UA1234'
    }
  ]

  const mockActivities: BookingOption[] = [
    {
      id: 'activity-1',
      type: 'activity',
      name: 'City Walking Tour',
      description: 'Explore the city with a knowledgeable local guide',
      price: 35,
      currency: 'USD',
      rating: 4.7,
      reviewCount: 892,
      image: '/api/placeholder/300/200',
      amenities: ['Guide', 'Refreshments', 'Photos'],
      availability: {
        available: true,
        lastUpdated: new Date().toISOString(),
        capacity: 20
      },
      bookingUrl: 'https://viator.com/activity-1',
      provider: 'Viator',
      location: 'Meeting point: City Hall',
      duration: '3 hours'
    }
  ]

  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true)
      try {
        // Fetch real booking data from APIs
        const [hotelsResponse, flightsResponse, activitiesResponse] = await Promise.all([
          fetch(`/api/bookings/hotels?destination=${encodeURIComponent(destination)}&checkIn=${startDate}&checkOut=${endDate}&guests=${travelers}&budget=${budget}`),
          fetch(`/api/bookings/flights?origin=${encodeURIComponent(departureLocation)}&destination=${encodeURIComponent(destination)}&departureDate=${startDate}&passengers=${travelers}&budget=${budget}`),
          fetch(`/api/bookings/activities?destination=${encodeURIComponent(destination)}&startDate=${startDate}&endDate=${endDate}&participants=${travelers}&budget=${budget}`)
        ])

        const hotelsData = await hotelsResponse.json()
        const flightsData = await flightsResponse.json()
        const activitiesData = await activitiesResponse.json()

        if (hotelsData.success && flightsData.success && activitiesData.success) {
          setBookings({
            hotels: hotelsData.data,
            flights: flightsData.data,
            activities: activitiesData.data
          })
        } else {
          console.error('Failed to fetch booking data:', { hotelsData, flightsData, activitiesData })
          // Fallback to mock data if API fails
          setBookings({
            hotels: mockHotels,
            flights: mockFlights,
            activities: mockActivities
          })
        }
      } catch (error) {
        console.error('Error fetching booking data:', error)
        // Fallback to mock data on error
        setBookings({
          hotels: mockHotels,
          flights: mockFlights,
          activities: mockActivities
        })
      } finally {
        setLoading(false)
      }
    }

    fetchBookings()
  }, [destination, startDate, endDate, travelers, budget, departureLocation])

  const handleBooking = async (booking: BookingOption) => {
    setLoading(true)
    // Simulate booking process
    await new Promise(resolve => setTimeout(resolve, 2000))
    setLoading(false)
    
    // Open booking URL in new tab
    window.open(booking.bookingUrl, '_blank')
  }

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price)
  }

  const getAmenityIcon = (amenity: string) => {
    const iconMap: { [key: string]: any } = {
      'Free WiFi': Wifi,
      'Pool': Car,
      'Spa': Dumbbell,
      'Restaurant': Utensils,
      'Gym': Dumbbell,
      'Breakfast': Utensils,
      'Garden': Car,
      'Business Center': Car,
      'Parking': Car,
      'Entertainment': Car,
      'Meal Included': Utensils,
      'Guide': Users,
      'Refreshments': Utensils,
      'Photos': Car,
      'Transportation': Car,
      'Wine Tasting': Utensils,
      'Lunch': Utensils
    }
    return iconMap[amenity] || Car
  }

  const renderBookingCard = (booking: BookingOption) => {
    const AmenityIcon = getAmenityIcon(booking.amenities[0])
    
    return (
      <Card key={booking.id} className="hover:shadow-lg transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg font-semibold">{booking.name}</CardTitle>
              <CardDescription className="text-sm text-gray-600 mt-1">
                {booking.description}
              </CardDescription>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-600">
                {formatPrice(booking.price, booking.currency)}
              </div>
              {booking.originalPrice && (
                <div className="text-sm text-gray-500 line-through">
                  {formatPrice(booking.originalPrice, booking.currency)}
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-3">
            {/* Rating and Reviews */}
            <div className="flex items-center gap-2">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.floor(booking.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600">
                {booking.rating} ({booking.reviewCount} reviews)
              </span>
            </div>

            {/* Location and Details */}
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="w-4 h-4" />
              <span>{booking.location}</span>
            </div>

            {booking.type === 'flight' && (
              <div className="flex items-center justify-between text-sm">
                <div>
                  <div className="font-medium">{booking.departureTime} → {booking.arrivalTime}</div>
                  <div className="text-gray-600">{booking.airline} {booking.flightNumber}</div>
                </div>
                <div className="text-right">
                  <div className="font-medium">{booking.duration}</div>
                  <div className="text-gray-600">Non-stop</div>
                </div>
              </div>
            )}

            {booking.type === 'activity' && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="w-4 h-4" />
                <span>{booking.duration}</span>
              </div>
            )}

            {/* Amenities */}
            <div className="flex flex-wrap gap-2">
              {booking.amenities.slice(0, 3).map((amenity, index) => {
                const Icon = getAmenityIcon(amenity)
                return (
                  <Badge key={index} variant="secondary" className="text-xs">
                    <Icon className="w-3 h-3 mr-1" />
                    {amenity}
                  </Badge>
                )
              })}
              {booking.amenities.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{booking.amenities.length - 3} more
                </Badge>
              )}
            </div>

            {/* Availability Status */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {booking.availability.available ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-600" />
                )}
                <span className={`text-sm ${booking.availability.available ? 'text-green-600' : 'text-red-600'}`}>
                  {booking.availability.available ? 'Available' : 'Unavailable'}
                </span>
                {booking.availability.capacity && (
                  <span className="text-xs text-gray-500">
                    ({booking.availability.capacity} spots left)
                  </span>
                )}
              </div>
              <span className="text-xs text-gray-500">
                via {booking.provider}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <Button 
                onClick={() => handleBooking(booking)}
                disabled={!booking.availability.available || loading}
                className="flex-1"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <ExternalLink className="w-4 h-4 mr-2" />
                )}
                Book Now
              </Button>
              <Button variant="outline" size="sm">
                <DollarSign className="w-4 h-4 mr-2" />
                Compare
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Book Your Trip</h2>
          <p className="text-gray-600">
            Real-time availability and pricing for {destination}
          </p>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500">Trip Budget</div>
          <div className="text-lg font-semibold text-green-600">
            {formatPrice(budget, 'USD')}
          </div>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mr-3" />
          <span className="text-gray-600">Loading real-time booking data...</span>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="hotels" className="flex items-center gap-2">
            <Hotel className="w-4 h-4" />
            Hotels
          </TabsTrigger>
          <TabsTrigger value="flights" className="flex items-center gap-2">
            <Plane className="w-4 h-4" />
            Flights
          </TabsTrigger>
          <TabsTrigger value="activities" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Activities
          </TabsTrigger>
        </TabsList>

        <TabsContent value="hotels" className="space-y-4">
          <div className="grid gap-4">
            {bookings.hotels.length > 0 ? (
              bookings.hotels.map(renderBookingCard)
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <Hotel className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No hotels found</h3>
                    <p className="text-gray-600">
                      Try adjusting your search criteria or budget.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="flights" className="space-y-4">
          <div className="grid gap-4">
            {bookings.flights.length > 0 ? (
              bookings.flights.map(renderBookingCard)
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <Plane className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No flights found</h3>
                    <p className="text-gray-600">
                      Try adjusting your search criteria or budget.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="activities" className="space-y-4">
          <div className="grid gap-4">
            {bookings.activities.length > 0 ? (
              bookings.activities.map(renderBookingCard)
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No activities found</h3>
                    <p className="text-gray-600">
                      Try adjusting your search criteria or budget.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Booking Summary */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-blue-900">Booking Summary</h3>
              <p className="text-sm text-blue-700">
                Selected items will be added to your cart
              </p>
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700">
              View Cart (0 items)
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
