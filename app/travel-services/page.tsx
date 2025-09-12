'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  MapPin, 
  Calendar, 
  Clock, 
  Search, 
  Filter, 
  Star, 
  Users, 
  Music, 
  Camera, 
  Utensils, 
  ShoppingBag,
  Plane,
  Car,
  Hotel,
  ArrowLeft,
  ExternalLink,
  Loader2,
  RefreshCw
} from 'lucide-react'

interface Event {
  id: string
  title: string
  description: string
  date: string
  time: string
  location: string
  price: string
  category: string
  tags: string[]
  featured?: boolean
}

interface BookingService {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  price: string
  category: string
  available: boolean
}

export default function TravelServicesPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [activeTab, setActiveTab] = useState('booking')
  const [tripData, setTripData] = useState({
    destination: 'San Francisco, CA',
    startDate: '',
    endDate: '',
    travelers: 2,
    budget: 1500
  })
  const [loading, setLoading] = useState({
    flights: false,
    hotels: false,
    activities: false
  })
  const [realTimeData, setRealTimeData] = useState({
    flights: [],
    hotels: [],
    activities: []
  })
  const [error, setError] = useState('')

  // Load trip data from localStorage if available
  useEffect(() => {
    const storedTripData = localStorage.getItem('tripData')
    if (storedTripData) {
      try {
        const parsedTripData = JSON.parse(storedTripData)
        setTripData({
          destination: parsedTripData.destination || 'San Francisco, CA',
          startDate: parsedTripData.startDate || '',
          endDate: parsedTripData.endDate || '',
          travelers: 2,
          budget: parsedTripData.totalBudget || 1500
        })
      } catch (error) {
        console.error('Error parsing trip data:', error)
      }
    }
  }, [])

  // Load real-time data when trip data is available
  useEffect(() => {
    if (tripData.startDate && tripData.endDate) {
      loadRealTimeData()
    }
  }, [tripData])

  const loadRealTimeData = async () => {
    if (!tripData.startDate || !tripData.endDate) return

    setError('')
    
    // Load flights
    setLoading(prev => ({ ...prev, flights: true }))
    try {
      const flightsResponse = await fetch(`/api/bookings/flights?origin=NYC&destination=SFO&departureDate=${tripData.startDate}&returnDate=${tripData.endDate}&passengers=${tripData.travelers}&budget=${tripData.budget}`)
      const flightsData = await flightsResponse.json()
      if (flightsData.success) {
        setRealTimeData(prev => ({ ...prev, flights: flightsData.data }))
      }
    } catch (error) {
      console.error('Failed to load flights:', error)
      setError('Failed to load flight data')
    } finally {
      setLoading(prev => ({ ...prev, flights: false }))
    }

    // Load hotels
    setLoading(prev => ({ ...prev, hotels: true }))
    try {
      const hotelsResponse = await fetch(`/api/bookings/hotels?destination=${encodeURIComponent(tripData.destination)}&checkIn=${tripData.startDate}&checkOut=${tripData.endDate}&guests=${tripData.travelers}&budget=${tripData.budget}`)
      const hotelsData = await hotelsResponse.json()
      if (hotelsData.success) {
        setRealTimeData(prev => ({ ...prev, hotels: hotelsData.data }))
      }
    } catch (error) {
      console.error('Failed to load hotels:', error)
      setError('Failed to load hotel data')
    } finally {
      setLoading(prev => ({ ...prev, hotels: false }))
    }

    // Load activities
    setLoading(prev => ({ ...prev, activities: true }))
    try {
      const activitiesResponse = await fetch(`/api/bookings/activities?destination=${encodeURIComponent(tripData.destination)}&startDate=${tripData.startDate}&endDate=${tripData.endDate}&participants=${tripData.travelers}&budget=${tripData.budget}`)
      const activitiesData = await activitiesResponse.json()
      if (activitiesData.success) {
        setRealTimeData(prev => ({ ...prev, activities: activitiesData.data }))
      }
    } catch (error) {
      console.error('Failed to load activities:', error)
      setError('Failed to load activity data')
    } finally {
      setLoading(prev => ({ ...prev, activities: false }))
    }
  }

  // Sample events data
  const events: Event[] = [
    {
      id: '1',
      title: 'Sunset Concert Series',
      description: 'Live music performance with stunning views of the city skyline at sunset.',
      date: 'Sep 19',
      time: '6:30 PM',
      location: 'City Park',
      price: 'Free',
      category: 'music',
      tags: ['Concert', 'Featured'],
      featured: true
    },
    {
      id: '2',
      title: 'Family Fun Day',
      description: 'A day full of activities for the whole family including games, crafts, and entertainment.',
      date: 'Sep 19',
      time: '10:00 AM',
      location: 'Community Center',
      price: '$10-$25',
      category: 'family',
      tags: ['Family']
    },
    {
      id: '3',
      title: 'Food Festival',
      description: 'Taste the best local cuisine from top restaurants and food trucks.',
      date: 'Sep 20',
      time: '12:00 PM',
      location: 'Downtown Square',
      price: '$15-$35',
      category: 'food',
      tags: ['Food', 'Featured']
    },
    {
      id: '4',
      title: 'Art Gallery Opening',
      description: 'Exhibition featuring contemporary local artists and their latest works.',
      date: 'Sep 21',
      time: '7:00 PM',
      location: 'Modern Art Gallery',
      price: '$20',
      category: 'culture',
      tags: ['Art', 'Culture']
    },
    {
      id: '5',
      title: 'Photography Workshop',
      description: 'Learn professional photography techniques from award-winning photographers.',
      date: 'Sep 22',
      time: '9:00 AM',
      location: 'Photography Studio',
      price: '$45',
      category: 'workshop',
      tags: ['Workshop', 'Learning']
    },
    {
      id: '6',
      title: 'Night Market',
      description: 'Explore local crafts, souvenirs, and street food in a vibrant night market.',
      date: 'Sep 23',
      time: '6:00 PM',
      location: 'Historic District',
      price: 'Free',
      category: 'shopping',
      tags: ['Shopping', 'Market']
    }
  ]

  // Dynamic booking services based on real-time data
  const bookingServices: BookingService[] = [
    {
      id: '1',
      title: 'Flight Booking',
      description: `Find and book flights to ${tripData.destination}`,
      icon: <Plane className="w-6 h-6" />,
      price: realTimeData.flights.length > 0 ? `From $${Math.min(...realTimeData.flights.map((f: any) => f.price))}` : 'Loading...',
      category: 'transport',
      available: !loading.flights && realTimeData.flights.length > 0
    },
    {
      id: '2',
      title: 'Hotel Reservation',
      description: `Book accommodations in ${tripData.destination}`,
      icon: <Hotel className="w-6 h-6" />,
      price: realTimeData.hotels.length > 0 ? `From $${Math.min(...realTimeData.hotels.map((h: any) => h.price))}/night` : 'Loading...',
      category: 'accommodation',
      available: !loading.hotels && realTimeData.hotels.length > 0
    },
    {
      id: '3',
      title: 'Car Rental',
      description: 'Rent a car for convenient local transportation',
      icon: <Car className="w-6 h-6" />,
      price: 'From $45/day',
      category: 'transport',
      available: true
    },
    {
      id: '4',
      title: 'Restaurant Reservations',
      description: 'Book tables at top-rated local restaurants',
      icon: <Utensils className="w-6 h-6" />,
      price: 'Free booking',
      category: 'dining',
      available: true
    },
    {
      id: '5',
      title: 'Activity Bookings',
      description: `Reserve activities in ${tripData.destination}`,
      icon: <Camera className="w-6 h-6" />,
      price: realTimeData.activities.length > 0 ? `From $${Math.min(...realTimeData.activities.map((a: any) => a.price))}` : 'Loading...',
      category: 'activities',
      available: !loading.activities && realTimeData.activities.length > 0
    },
    {
      id: '6',
      title: 'Shopping Services',
      description: 'Get recommendations and book shopping experiences',
      icon: <ShoppingBag className="w-6 h-6" />,
      price: 'Free service',
      category: 'shopping',
      available: true
    }
  ]

  const categories = [
    { value: 'all', label: 'All Events' },
    { value: 'music', label: 'Music' },
    { value: 'family', label: 'Family' },
    { value: 'food', label: 'Food' },
    { value: 'culture', label: 'Culture' },
    { value: 'workshop', label: 'Workshop' },
    { value: 'shopping', label: 'Shopping' }
  ]

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || event.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'music': return <Music className="w-4 h-4" />
      case 'family': return <Users className="w-4 h-4" />
      case 'food': return <Utensils className="w-4 h-4" />
      case 'culture': return <Star className="w-4 h-4" />
      case 'workshop': return <Camera className="w-4 h-4" />
      case 'shopping': return <ShoppingBag className="w-4 h-4" />
      default: return <Calendar className="w-4 h-4" />
    }
  }

  const getTagColor = (tag: string) => {
    switch (tag.toLowerCase()) {
      case 'featured': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'concert': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'family': return 'bg-pink-100 text-pink-800 border-pink-200'
      case 'food': return 'bg-green-100 text-green-800 border-green-200'
      case 'art': return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'culture': return 'bg-indigo-100 text-indigo-800 border-indigo-200'
      case 'workshop': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'learning': return 'bg-teal-100 text-teal-800 border-teal-200'
      case 'shopping': return 'bg-cyan-100 text-cyan-800 border-cyan-200'
      case 'market': return 'bg-emerald-100 text-emerald-800 border-emerald-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="flex items-center space-x-2 text-white hover:bg-white/20"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Itinerary</span>
              </Button>
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-white/20 rounded-full">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold">Travel Services</h1>
                  <p className="text-blue-100">Book your trip essentials and discover local experiences</p>
                </div>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-6 text-sm">
              <div className="text-center">
                <div className="text-blue-100">Destination</div>
                <div className="font-semibold">{tripData.destination}</div>
              </div>
              <div className="text-center">
                <div className="text-blue-100">Budget</div>
                <div className="font-semibold">${tripData.budget}</div>
              </div>
              <div className="text-center">
                <div className="text-blue-100">Travelers</div>
                <div className="font-semibold">{tripData.travelers}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-white dark:bg-gray-800 shadow-lg rounded-xl">
            <TabsTrigger value="booking" className="flex items-center space-x-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <ShoppingBag className="w-4 h-4" />
              <span>Book Your Trip</span>
            </TabsTrigger>
            <TabsTrigger value="events" className="flex items-center space-x-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <Calendar className="w-4 h-4" />
              <span>Local Events</span>
            </TabsTrigger>
          </TabsList>

          {/* Local Events Tab */}
          <TabsContent value="events" className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Local Events</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{filteredEvents.length} events during your stay</p>
                </div>
              </div>

              {/* Search and Filter */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search events..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="pl-10 pr-8 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {categories.map(category => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Events List */}
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {filteredEvents.map((event) => (
                  <Card key={event.id} className="hover:shadow-md transition-shadow duration-200">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            {event.tags.map((tag, index) => (
                              <Badge key={index} className={getTagColor(tag)}>
                                {tag}
                              </Badge>
                            ))}
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                            {event.title}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                            {event.description}
                          </p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-4 h-4" />
                              <span>{event.date}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Clock className="w-4 h-4" />
                              <span>{event.time}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <MapPin className="w-4 h-4" />
                              <span>{event.location}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end space-y-2 ml-4">
                          <span className="text-lg font-semibold text-green-600 dark:text-green-400">
                            {event.price}
                          </span>
                          <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                            Book
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Book Your Trip Tab */}
          <TabsContent value="booking" className="space-y-6">
            {/* Trip Budget Overview */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200 dark:border-green-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-2">Trip Budget</h3>
                  <p className="text-green-700 dark:text-green-300">Total budget for your {tripData.destination} trip</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-green-600 dark:text-green-400">${tripData.budget}</div>
                  <div className="text-sm text-green-600 dark:text-green-400">Available to spend</div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border p-6">
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Book Your Trip</h2>
                  <Button
                    onClick={loadRealTimeData}
                    disabled={loading.flights || loading.hotels || loading.activities}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <RefreshCw className={`w-4 h-4 ${(loading.flights || loading.hotels || loading.activities) ? 'animate-spin' : ''}`} />
                    Refresh Data
                  </Button>
                </div>
                <p className="text-gray-600 dark:text-gray-300">Reserve your travel essentials and experiences for {tripData.destination}</p>
                {error && (
                  <div className="mt-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
                    <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                  </div>
                )}
              </div>

              {/* Booking Services Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {bookingServices.map((service) => (
                  <Card key={service.id} className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 shadow-md">
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <div className="p-4 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 rounded-xl">
                          <div className="text-blue-600 dark:text-blue-400">
                            {service.icon}
                          </div>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                            {service.title}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                            {service.description}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-lg font-bold text-green-600 dark:text-green-400">
                              {service.price}
                            </span>
                            <Button 
                              size="sm" 
                              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                              disabled={!service.available}
                            >
                              {service.price === 'Loading...' ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : service.available ? (
                                'Book Now'
                              ) : (
                                'Unavailable'
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Quick Actions */}
              <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button className="h-12 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Compare Prices
                  </Button>
                  <Button className="h-12 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white">
                    <Calendar className="w-4 h-4 mr-2" />
                    Set Reminders
                  </Button>
                  <Button className="h-12 bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white">
                    <Star className="w-4 h-4 mr-2" />
                    Save Favorites
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
