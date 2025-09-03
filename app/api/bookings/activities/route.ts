import { NextRequest, NextResponse } from 'next/server'

interface ActivitySearchParams {
  destination: string
  startDate: string
  endDate: string
  participants: number
  category?: string
  budget?: number
}

interface ActivityBooking {
  id: string
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
  duration: string
  category: string
  meetingPoint: string
  includedItems: string[]
  excludedItems: string[]
  cancellationPolicy: string
  minimumAge?: number
  physicalLevel: string
  languages: string[]
  maxGroupSize: number
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const destination = searchParams.get('destination')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const participants = parseInt(searchParams.get('participants') || '2')
    const category = searchParams.get('category') || 'all'
    const budget = parseInt(searchParams.get('budget') || '500')

    if (!destination || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'Missing required parameters: destination, startDate, endDate' },
        { status: 400 }
      )
    }

    // In production, integrate with real activity APIs like:
    // - Viator API
    // - GetYourGuide API
    // - Klook API
    // - Airbnb Experiences API
    // - TripAdvisor API

    const activities = await fetchRealActivityData(destination, startDate, endDate, participants, category, budget)

    return NextResponse.json({
      success: true,
      data: activities,
      meta: {
        destination,
        startDate,
        endDate,
        participants,
        category,
        totalResults: activities.length
      }
    })

  } catch (error) {
    console.error('Activity booking API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch activity data' },
      { status: 500 }
    )
  }
}

async function fetchRealActivityData(
  destination: string,
  startDate: string,
  endDate: string,
  participants: number,
  category: string,
  budget: number
): Promise<ActivityBooking[]> {
  // Enhanced mock data that simulates real activity API responses
  // In production, replace this with actual API calls

  const baseActivities: ActivityBooking[] = [
    {
      id: 'activity-real-1',
      name: 'Golden Gate Bridge & Sausalito Bike Tour',
      description: 'Explore San Francisco\'s most iconic landmark and charming Sausalito on this guided bike tour.',
      price: Math.floor(Math.random() * 30) + 45,
      originalPrice: Math.floor(Math.random() * 15) + 60,
      currency: 'USD',
      rating: 4.8,
      reviewCount: 1247,
      image: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=400&h=300&fit=crop',
      amenities: ['Professional Guide', 'Bike Rental', 'Helmet', 'Photos', 'Snacks'],
      availability: {
        available: true,
        lastUpdated: new Date().toISOString(),
        capacity: Math.floor(Math.random() * 20) + 15
      },
      bookingUrl: `https://www.viator.com/San-Francisco-attractions/Golden-Gate-Bridge/d651-a2202?date=${startDate}&participants=${participants}`,
      provider: 'Viator',
      location: 'Golden Gate Bridge & Sausalito',
      duration: '4 hours',
      category: 'Outdoor Adventure',
      meetingPoint: 'Fisherman\'s Wharf',
      includedItems: ['Professional guide', 'Bike and helmet rental', 'Photos', 'Snacks and water'],
      excludedItems: ['Hotel pickup and drop-off', 'Gratuities'],
      cancellationPolicy: 'Free cancellation up to 24 hours before',
      minimumAge: 12,
      physicalLevel: 'Moderate',
      languages: ['English', 'Spanish'],
      maxGroupSize: 15
    },
    {
      id: 'activity-real-2',
      name: 'Alcatraz Island Night Tour',
      description: 'Experience the infamous prison after dark with exclusive access and spooky stories.',
      price: Math.floor(Math.random() * 25) + 55,
      currency: 'USD',
      rating: 4.7,
      reviewCount: 892,
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
      amenities: ['Ferry Ticket', 'Audio Guide', 'Expert Guide', 'Exclusive Access'],
      availability: {
        available: true,
        lastUpdated: new Date().toISOString(),
        capacity: Math.floor(Math.random() * 15) + 10
      },
      bookingUrl: `https://www.alcatrazcruises.com/night-tour?date=${startDate}&participants=${participants}`,
      provider: 'Alcatraz Cruises',
      location: 'Alcatraz Island',
      duration: '3 hours',
      category: 'Historical Tour',
      meetingPoint: 'Pier 33',
      includedItems: ['Round-trip ferry', 'Audio guide', 'Expert guide', 'Exclusive night access'],
      excludedItems: ['Hotel pickup', 'Food and drinks'],
      cancellationPolicy: 'Free cancellation up to 48 hours before',
      minimumAge: 5,
      physicalLevel: 'Easy',
      languages: ['English'],
      maxGroupSize: 25
    },
    {
      id: 'activity-real-3',
      name: 'Napa Valley Wine Tasting Tour',
      description: 'Visit premium wineries in Napa Valley with transportation and expert wine education.',
      price: Math.floor(Math.random() * 50) + 120,
      originalPrice: Math.floor(Math.random() * 30) + 150,
      currency: 'USD',
      rating: 4.6,
      reviewCount: 567,
      image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400&h=300&fit=crop',
      amenities: ['Transportation', 'Wine Tasting', 'Lunch', 'Expert Guide', 'Hotel Pickup'],
      availability: {
        available: true,
        lastUpdated: new Date().toISOString(),
        capacity: Math.floor(Math.random() * 12) + 8
      },
      bookingUrl: `https://www.getyourguide.com/san-francisco-l61/napa-valley-wine-tasting-tour-t123456?date=${startDate}&participants=${participants}`,
      provider: 'GetYourGuide',
      location: 'Napa Valley',
      duration: '8 hours',
      category: 'Food & Wine',
      meetingPoint: 'San Francisco hotels',
      includedItems: ['Round-trip transportation', 'Wine tastings at 3 wineries', 'Gourmet lunch', 'Expert guide'],
      excludedItems: ['Additional wine purchases', 'Gratuities'],
      cancellationPolicy: 'Free cancellation up to 24 hours before',
      minimumAge: 21,
      physicalLevel: 'Easy',
      languages: ['English'],
      maxGroupSize: 12
    },
    {
      id: 'activity-real-4',
      name: 'San Francisco Food Tour',
      description: 'Taste your way through San Francisco\'s diverse neighborhoods and culinary scene.',
      price: Math.floor(Math.random() * 20) + 75,
      currency: 'USD',
      rating: 4.5,
      reviewCount: 1234,
      image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=300&fit=crop',
      amenities: ['Food Tastings', 'Expert Guide', 'Neighborhood Tour', 'Photos'],
      availability: {
        available: true,
        lastUpdated: new Date().toISOString(),
        capacity: Math.floor(Math.random() * 18) + 12
      },
      bookingUrl: `https://www.viator.com/San-Francisco-attractions/Food-Tours/d651-a2203?date=${startDate}&participants=${participants}`,
      provider: 'Viator',
      location: 'Chinatown & North Beach',
      duration: '3 hours',
      category: 'Food & Dining',
      meetingPoint: 'Chinatown Gate',
      includedItems: ['Food tastings at 6 locations', 'Expert guide', 'Neighborhood history', 'Photos'],
      excludedItems: ['Additional food and drinks', 'Hotel pickup'],
      cancellationPolicy: 'Free cancellation up to 24 hours before',
      minimumAge: 8,
      physicalLevel: 'Easy',
      languages: ['English'],
      maxGroupSize: 16
    },
    {
      id: 'activity-real-5',
      name: 'Tech Startup Walking Tour',
      description: 'Explore Silicon Valley\'s innovation hubs and learn about the tech industry\'s history.',
      price: Math.floor(Math.random() * 15) + 35,
      currency: 'USD',
      rating: 4.3,
      reviewCount: 456,
      image: 'https://images.unsplash.com/photo-1518186285589-2f7649de83e0?w=400&h=300&fit=crop',
      amenities: ['Expert Guide', 'Tech History', 'Startup Stories', 'Networking'],
      availability: {
        available: true,
        lastUpdated: new Date().toISOString(),
        capacity: Math.floor(Math.random() * 15) + 10
      },
      bookingUrl: `https://www.klook.com/activity/san-francisco/tech-startup-tour?date=${startDate}&participants=${participants}`,
      provider: 'Klook',
      location: 'Silicon Valley & San Francisco',
      duration: '4 hours',
      category: 'Educational',
      meetingPoint: 'Palo Alto Caltrain Station',
      includedItems: ['Expert tech guide', 'Startup stories', 'Tech history', 'Networking opportunities'],
      excludedItems: ['Transportation', 'Food and drinks'],
      cancellationPolicy: 'Free cancellation up to 24 hours before',
      minimumAge: 16,
      physicalLevel: 'Easy',
      languages: ['English'],
      maxGroupSize: 20
    }
  ]

  // Filter by category and budget
  const filteredActivities = baseActivities
    .filter(activity => {
      const priceCheck = activity.price <= budget
      const categoryCheck = category === 'all' || activity.category.toLowerCase().includes(category.toLowerCase())
      return priceCheck && categoryCheck
    })
    .map(activity => ({
      ...activity,
      // Simulate dynamic pricing based on demand
      price: Math.max(activity.price * (0.8 + Math.random() * 0.4), activity.price * 0.8),
      availability: {
        ...activity.availability,
        capacity: Math.max(1, activity.availability.capacity || 10)
      }
    }))

  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 600))

  return filteredActivities
}
