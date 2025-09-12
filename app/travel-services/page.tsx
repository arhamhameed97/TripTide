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
  ExternalLink
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
  const [activeTab, setActiveTab] = useState('events')

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

  // Sample booking services data
  const bookingServices: BookingService[] = [
    {
      id: '1',
      title: 'Flight Booking',
      description: 'Find and book the best flights for your trip',
      icon: <Plane className="w-6 h-6" />,
      price: 'From $299',
      category: 'transport',
      available: true
    },
    {
      id: '2',
      title: 'Hotel Reservation',
      description: 'Book accommodations that fit your budget and preferences',
      icon: <Hotel className="w-6 h-6" />,
      price: 'From $89/night',
      category: 'accommodation',
      available: true
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
      description: 'Reserve spots for tours, activities, and experiences',
      icon: <Camera className="w-6 h-6" />,
      price: 'From $25',
      category: 'activities',
      available: true
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
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </Button>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                  <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Travel Services</h1>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Discover local events and book your trip essentials</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-white dark:bg-gray-800 shadow-sm">
            <TabsTrigger value="events" className="flex items-center space-x-2">
              <Calendar className="w-4 h-4" />
              <span>Local Events</span>
            </TabsTrigger>
            <TabsTrigger value="booking" className="flex items-center space-x-2">
              <ShoppingBag className="w-4 h-4" />
              <span>Book Your Trip</span>
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
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border p-6">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Book Your Trip</h2>
                <p className="text-sm text-gray-600 dark:text-gray-300">Reserve your travel essentials and experiences</p>
              </div>

              {/* Booking Services Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {bookingServices.map((service) => (
                  <Card key={service.id} className="hover:shadow-md transition-shadow duration-200">
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                          {service.icon}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                            {service.title}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                            {service.description}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-green-600 dark:text-green-400">
                              {service.price}
                            </span>
                            <Button 
                              size="sm" 
                              className="bg-blue-600 hover:bg-blue-700 text-white"
                              disabled={!service.available}
                            >
                              {service.available ? 'Book Now' : 'Unavailable'}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
