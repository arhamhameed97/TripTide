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
}

export default function LocalEventsCalendar({ 
  destination, 
  startDate, 
  endDate, 
  interests 
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

  // Mock events data
  const mockEvents: LocalEvent[] = [
    {
      id: 'event-1',
      title: 'San Francisco Food Festival',
      description: 'A celebration of local cuisine featuring top restaurants and food trucks from around the Bay Area.',
      category: 'food',
      date: '2024-02-15',
      time: '11:00 AM',
      duration: '8 hours',
      location: 'Pier 39',
      address: 'Pier 39, San Francisco, CA 94133',
      coordinates: [37.8087, -122.4098],
      price: {
        min: 25,
        max: 75,
        currency: 'USD',
        free: false
      },
      organizer: 'SF Food & Wine',
      image: '/api/placeholder/400/250',
      rating: 4.6,
      reviewCount: 1247,
      capacity: 5000,
      availableSpots: 2341,
      tags: ['Food', 'Local', 'Outdoor', 'Family-friendly'],
      website: 'https://sffoodfestival.com',
      ticketUrl: 'https://tickets.sffoodfestival.com',
      featured: true
    },
    {
      id: 'event-2',
      title: 'Golden Gate Bridge Sunset Concert',
      description: 'Live music performance with stunning views of the Golden Gate Bridge at sunset.',
      category: 'concert',
      date: '2024-02-16',
      time: '6:30 PM',
      duration: '2 hours',
      location: 'Crissy Field',
      address: 'Crissy Field, San Francisco, CA 94129',
      coordinates: [37.8063, -122.4658],
      price: {
        min: 0,
        max: 0,
        currency: 'USD',
        free: true
      },
      organizer: 'SF Parks & Recreation',
      image: '/api/placeholder/400/250',
      rating: 4.8,
      reviewCount: 892,
      capacity: 2000,
      availableSpots: 1500,
      tags: ['Music', 'Free', 'Outdoor', 'Sunset'],
      website: 'https://sfparks.org',
      ticketUrl: 'https://sfparks.org/events',
      featured: true
    },
    {
      id: 'event-3',
      title: 'Contemporary Art Exhibition',
      description: 'Exhibition featuring works from emerging Bay Area artists and international contemporary art.',
      category: 'exhibition',
      date: '2024-02-17',
      time: '10:00 AM',
      duration: '6 hours',
      location: 'SFMOMA',
      address: '151 3rd St, San Francisco, CA 94103',
      coordinates: [37.7858, -122.4008],
      price: {
        min: 15,
        max: 25,
        currency: 'USD',
        free: false
      },
      organizer: 'San Francisco Museum of Modern Art',
      image: '/api/placeholder/400/250',
      rating: 4.4,
      reviewCount: 567,
      capacity: 800,
      availableSpots: 600,
      tags: ['Art', 'Culture', 'Indoor', 'Educational'],
      website: 'https://sfmoma.org',
      ticketUrl: 'https://tickets.sfmoma.org',
      featured: false
    },
    {
      id: 'event-4',
      title: 'Tech Startup Meetup',
      description: 'Networking event for tech entrepreneurs and investors in the Bay Area startup scene.',
      category: 'business',
      date: '2024-02-18',
      time: '7:00 PM',
      duration: '3 hours',
      location: 'WeWork SOMA',
      address: '415 Mission St, San Francisco, CA 94105',
      coordinates: [37.7897, -122.3972],
      price: {
        min: 20,
        max: 50,
        currency: 'USD',
        free: false
      },
      organizer: 'SF Tech Network',
      image: '/api/placeholder/400/250',
      rating: 4.2,
      reviewCount: 234,
      capacity: 150,
      availableSpots: 45,
      tags: ['Networking', 'Tech', 'Business', 'Professional'],
      website: 'https://sftechnetwork.com',
      ticketUrl: 'https://tickets.sftechnetwork.com',
      featured: false
    },
    {
      id: 'event-5',
      title: 'Alcatraz Night Tour',
      description: 'Special evening tour of Alcatraz Island with spooky stories and historical insights.',
      category: 'cultural',
      date: '2024-02-19',
      time: '5:30 PM',
      duration: '3 hours',
      location: 'Alcatraz Island',
      address: 'Alcatraz Island, San Francisco, CA 94133',
      coordinates: [37.8270, -122.4230],
      price: {
        min: 45,
        max: 65,
        currency: 'USD',
        free: false
      },
      organizer: 'National Park Service',
      image: '/api/placeholder/400/250',
      rating: 4.7,
      reviewCount: 1892,
      capacity: 300,
      availableSpots: 89,
      tags: ['History', 'Tour', 'Night', 'Unique'],
      website: 'https://nps.gov/alcatraz',
      ticketUrl: 'https://alcatrazcruises.com',
      featured: true
    }
  ]

  useEffect(() => {
    setEvents(mockEvents)
    setFilteredEvents(mockEvents)
  }, [])

  useEffect(() => {
    let filtered = events

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
  }, [events, filters])

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Local Events Calendar</h2>
          <p className="text-gray-600">
            Discover exciting events happening in {destination} during your stay
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
                {filteredEvents.length} events found for your dates
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
