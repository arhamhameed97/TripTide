'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Calendar, CalendarDays, Clock, MapPin, Users, Star, ExternalLink, Filter, Search, Heart, Share2, Bookmark } from 'lucide-react'

interface LocalEvent {
  id: string
  title: string
  description: string
  category: 'festival' | 'concert' | 'exhibition' | 'sports' | 'food' | 'cultural' | 'business' | 'family'
  date: string
  time: string
  duration: string
  location: string
  address: string
  coordinates: [number, number]
  price: {
    min: number
    max: number
    currency: string
    free: boolean
  }
  organizer: string
  image: string
  rating: number
  reviewCount: number
  capacity: number
  availableSpots: number
  tags: string[]
  website: string
  ticketUrl: string
  featured: boolean
}

interface LocalEventsCalendarProps {
  destination: string
  startDate: string
  endDate: string
  interests: string[]
  compact?: boolean
}

export default function LocalEventsCalendar({ 
  destination, 
  startDate, 
  endDate, 
  interests,
  compact = false
}: LocalEventsCalendarProps) {
  const [activeTab, setActiveTab] = useState('all')
  const [events, setEvents] = useState<LocalEvent[]>([])
  const [filteredEvents, setFilteredEvents] = useState<LocalEvent[]>([])
  const [loading, setLoading] = useState(false)
  const [favorites, setFavorites] = useState<string[]>([])
  const [filters, setFilters] = useState({
    category: 'all',
    priceRange: [0, 1000],
    dateRange: 'all',
    searchQuery: ''
  })

  // Generate events based on travel dates
  const generateEventsForTravelDates = (startDate: string, endDate: string, destination: string): LocalEvent[] => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const events: LocalEvent[] = []
    
    // Event templates
    const eventTemplates = [
      {
        title: `${destination} Food Festival`,
        description: `A celebration of local cuisine featuring top restaurants and food trucks from around the area.`,
        category: 'food' as const,
        time: '11:00 AM',
        duration: '8 hours',
        location: 'Downtown Square',
        price: { min: 25, max: 75, currency: 'USD', free: false },
        organizer: 'Local Food & Wine',
        rating: 4.6,
        reviewCount: 1247,
        capacity: 5000,
        tags: ['Food', 'Local', 'Outdoor', 'Family-friendly'],
        featured: true
      },
      {
        title: 'Sunset Concert Series',
        description: 'Live music performance with stunning views of the city skyline at sunset.',
        category: 'concert' as const,
        time: '6:30 PM',
        duration: '2 hours',
        location: 'City Park',
        price: { min: 0, max: 0, currency: 'USD', free: true },
        organizer: 'City Parks & Recreation',
        rating: 4.8,
        reviewCount: 892,
        capacity: 2000,
        tags: ['Music', 'Free', 'Outdoor', 'Sunset'],
        featured: true
      },
      {
        title: 'Contemporary Art Exhibition',
        description: 'Exhibition featuring works from emerging local artists and international contemporary art.',
        category: 'exhibition' as const,
        time: '10:00 AM',
        duration: '6 hours',
        location: 'Art Museum',
        price: { min: 15, max: 25, currency: 'USD', free: false },
        organizer: 'Local Art Museum',
        rating: 4.4,
        reviewCount: 567,
        capacity: 800,
        tags: ['Art', 'Culture', 'Indoor', 'Educational'],
        featured: false
      },
      {
        title: 'Business Networking Meetup',
        description: 'Networking event for entrepreneurs and professionals in the local business scene.',
        category: 'business' as const,
        time: '7:00 PM',
        duration: '3 hours',
        location: 'Business Center',
        price: { min: 20, max: 50, currency: 'USD', free: false },
        organizer: 'Local Business Network',
        rating: 4.2,
        reviewCount: 234,
        capacity: 150,
        tags: ['Networking', 'Business', 'Professional'],
        featured: false
      },
      {
        title: 'Cultural Heritage Tour',
        description: 'Guided tour showcasing the rich cultural heritage and historical landmarks.',
        category: 'cultural' as const,
        time: '2:00 PM',
        duration: '3 hours',
        location: 'Historic District',
        price: { min: 30, max: 50, currency: 'USD', free: false },
        organizer: 'Heritage Society',
        rating: 4.7,
        reviewCount: 1892,
        capacity: 300,
        tags: ['History', 'Tour', 'Cultural', 'Educational'],
        featured: true
      },
      {
        title: 'Family Fun Day',
        description: 'A day full of activities for the whole family including games, crafts, and entertainment.',
        category: 'family' as const,
        time: '10:00 AM',
        duration: '6 hours',
        location: 'Community Center',
        price: { min: 10, max: 25, currency: 'USD', free: false },
        organizer: 'Community Events',
        rating: 4.5,
        reviewCount: 456,
        capacity: 1000,
        tags: ['Family', 'Kids', 'Activities', 'Fun'],
        featured: false
      }
    ]
    
    // Generate events for each day of travel
    const currentDate = new Date(start)
    let eventId = 1
    
    while (currentDate <= end) {
      // Randomly select 1-3 events per day
      const eventsPerDay = Math.floor(Math.random() * 3) + 1
      const selectedTemplates = eventTemplates
        .sort(() => 0.5 - Math.random())
        .slice(0, eventsPerDay)
      
      selectedTemplates.forEach(template => {
        const eventDate = new Date(currentDate)
        const availableSpots = Math.floor(Math.random() * template.capacity * 0.8) + Math.floor(template.capacity * 0.2)
        
        events.push({
          id: `event-${eventId++}`,
          ...template,
          date: eventDate.toISOString().split('T')[0],
          address: `${template.location}, ${destination}`,
          coordinates: [37.7749 + (Math.random() - 0.5) * 0.1, -122.4194 + (Math.random() - 0.5) * 0.1], // Approximate SF coordinates with variation
          availableSpots,
          image: '/api/placeholder/400/250',
          website: `https://${template.organizer.toLowerCase().replace(/\s+/g, '')}.com`,
          ticketUrl: `https://tickets.${template.organizer.toLowerCase().replace(/\s+/g, '')}.com`
        })
      })
      
      currentDate.setDate(currentDate.getDate() + 1)
    }
    
    return events
  }

  // Mock events data - now generated based on travel dates
  const mockEvents: LocalEvent[] = generateEventsForTravelDates(startDate, endDate, destination)

  useEffect(() => {
    const generatedEvents = generateEventsForTravelDates(startDate, endDate, destination)
    setEvents(generatedEvents)
    setFilteredEvents(generatedEvents)
  }, [startDate, endDate, destination])

  useEffect(() => {
    let filtered = events

    // Filter by travel dates - only show events that fall within the user's travel period
    const travelStartDate = new Date(startDate)
    const travelEndDate = new Date(endDate)
    
    filtered = filtered.filter(event => {
      const eventDate = new Date(event.date)
      return eventDate >= travelStartDate && eventDate <= travelEndDate
    })

    // Filter by category
    if (filters.category !== 'all') {
      filtered = filtered.filter(event => event.category === filters.category)
    }

    // Filter by price range
    filtered = filtered.filter(event => 
      event.price.min >= filters.priceRange[0] && 
      event.price.max <= filters.priceRange[1]
    )

    // Filter by search query
    if (filters.searchQuery) {
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
        event.description.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
        event.tags.some(tag => tag.toLowerCase().includes(filters.searchQuery.toLowerCase()))
      )
    }

    setFilteredEvents(filtered)
  }, [events, filters, startDate, endDate])

  const handleFavorite = (eventId: string) => {
    setFavorites(prev => 
      prev.includes(eventId) 
        ? prev.filter(id => id !== eventId)
        : [...prev, eventId]
    )
  }

  const handleBookEvent = (event: LocalEvent) => {
    window.open(event.ticketUrl, '_blank')
  }

  const formatPrice = (price: { min: number; max: number; currency: string; free: boolean }) => {
    if (price.free) return 'Free'
    if (price.min === price.max) {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: price.currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(price.min)
    }
    return `${new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: price.currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price.min)} - ${new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: price.currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price.max)}`
  }

  const getCategoryIcon = (category: string) => {
    const iconMap: { [key: string]: any } = {
      festival: Calendar,
      concert: Users,
      exhibition: Star,
      sports: Users,
      food: Users,
      cultural: Star,
      business: Users,
      family: Users
    }
    return iconMap[category] || Calendar
  }

  const getCategoryColor = (category: string) => {
    const colorMap: { [key: string]: string } = {
      festival: 'bg-purple-100 text-purple-800',
      concert: 'bg-blue-100 text-blue-800',
      exhibition: 'bg-green-100 text-green-800',
      sports: 'bg-orange-100 text-orange-800',
      food: 'bg-red-100 text-red-800',
      cultural: 'bg-yellow-100 text-yellow-800',
      business: 'bg-gray-100 text-gray-800',
      family: 'bg-pink-100 text-pink-800'
    }
    return colorMap[category] || 'bg-gray-100 text-gray-800'
  }

  const renderEventCard = (event: LocalEvent) => {
    const CategoryIcon = getCategoryIcon(event.category)
    
    return (
      <Card key={event.id} className={`hover:shadow-lg transition-shadow ${event.featured ? 'ring-2 ring-blue-200' : ''}`}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge className={getCategoryColor(event.category)}>
                  <CategoryIcon className="w-3 h-3 mr-1" />
                  {event.category.charAt(0).toUpperCase() + event.category.slice(1)}
                </Badge>
                {event.featured && (
                  <Badge className="bg-yellow-100 text-yellow-800">
                    Featured
                  </Badge>
                )}
              </div>
              <CardTitle className="text-lg font-semibold">{event.title}</CardTitle>
              <CardDescription className="text-sm text-gray-600 mt-1">
                {event.description}
              </CardDescription>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-green-600">
                {formatPrice(event.price)}
              </div>
              <div className="text-sm text-gray-500">
                {event.availableSpots} spots left
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-3">
            {/* Date and Time */}
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <CalendarDays className="w-4 h-4" />
                <span>{new Date(event.date).toLocaleDateString('en-US', { 
                  weekday: 'short', 
                  month: 'short', 
                  day: 'numeric' 
                })}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{event.time} ({event.duration})</span>
              </div>
            </div>

            {/* Location */}
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="w-4 h-4" />
              <span>{event.location}</span>
            </div>

            {/* Rating and Reviews */}
            <div className="flex items-center gap-2">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.floor(event.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600">
                {event.rating} ({event.reviewCount} reviews)
              </span>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              {event.tags.map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <Button 
                onClick={() => handleBookEvent(event)}
                className="flex-1"
                disabled={event.availableSpots === 0}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                {event.availableSpots === 0 ? 'Sold Out' : 'Get Tickets'}
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleFavorite(event.id)}
              >
                <Heart className={`w-4 h-4 ${favorites.includes(event.id) ? 'text-red-500 fill-current' : ''}`} />
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const categories = [
    { value: 'all', label: 'All Events' },
    { value: 'festival', label: 'Festivals' },
    { value: 'concert', label: 'Concerts' },
    { value: 'exhibition', label: 'Exhibitions' },
    { value: 'sports', label: 'Sports' },
    { value: 'food', label: 'Food & Dining' },
    { value: 'cultural', label: 'Cultural' },
    { value: 'business', label: 'Business' },
    { value: 'family', label: 'Family' }
  ]

  if (compact) {
    return (
      <div className="space-y-4">
        {/* Compact Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Local Events</h3>
            <p className="text-sm text-gray-600">
              {filteredEvents.length} events during your stay
            </p>
          </div>
        </div>

        {/* Compact Search */}
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search events..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              value={filters.searchQuery}
              onChange={(e) => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
            />
          </div>
          <select
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            value={filters.category}
            onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
          >
            {categories.map(category => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
        </div>

        {/* Compact Events List */}
        <div className="space-y-3">
          {filteredEvents.length > 0 ? (
            filteredEvents.slice(0, 5).map(event => (
              <div key={event.id} className="border border-gray-200 rounded-lg p-3 hover:shadow-sm transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className={getCategoryColor(event.category)}>
                        {event.category.charAt(0).toUpperCase() + event.category.slice(1)}
                      </Badge>
                      {event.featured && (
                        <Badge className="bg-yellow-100 text-yellow-800 text-xs">Featured</Badge>
                      )}
                    </div>
                    <h4 className="font-medium text-gray-900 text-sm">{event.title}</h4>
                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">{event.description}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
                      <span>{new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                      <span>{event.time}</span>
                      <span>{event.location}</span>
                    </div>
                  </div>
                  <div className="text-right ml-3">
                    <div className="text-sm font-semibold text-green-600">
                      {formatPrice(event.price)}
                    </div>
                    <Button 
                      size="sm" 
                      className="mt-2 text-xs"
                      onClick={() => handleBookEvent(event)}
                      disabled={event.availableSpots === 0}
                    >
                      {event.availableSpots === 0 ? 'Sold Out' : 'Book'}
                    </Button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-6">
              <Calendar className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">No events found for your dates</p>
            </div>
          )}
        </div>

        {filteredEvents.length > 5 && (
          <div className="text-center">
            <Button variant="outline" size="sm">
              View All {filteredEvents.length} Events
            </Button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Local Events Calendar</h2>
          <p className="text-gray-600">
            Discover exciting events happening in {destination} from {new Date(startDate).toLocaleDateString()} to {new Date(endDate).toLocaleDateString()}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
          <Button variant="outline" size="sm">
            <Bookmark className="w-4 h-4 mr-2" />
            Saved ({favorites.length})
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search events..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={filters.searchQuery}
            onChange={(e) => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
          />
        </div>
        <select
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          value={filters.category}
          onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
        >
          {categories.map(category => (
            <option key={category.value} value={category.value}>
              {category.label}
            </option>
          ))}
        </select>
      </div>

      {/* Events Grid */}
      <div className="grid gap-6">
        {filteredEvents.length > 0 ? (
          filteredEvents.map(renderEventCard)
        ) : (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No events found</h3>
                <p className="text-gray-600">
                  Try adjusting your filters or search terms to find more events.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Event Summary */}
      <Card className="bg-purple-50 border-purple-200">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-purple-900">Event Summary</h3>
              <p className="text-sm text-purple-700">
                {filteredEvents.length} events found during your travel dates ({new Date(startDate).toLocaleDateString()} - {new Date(endDate).toLocaleDateString()})
              </p>
            </div>
            <Button className="bg-purple-600 hover:bg-purple-700">
              View All Events
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
