import { NextRequest, NextResponse } from 'next/server'

interface FlightSearchParams {
  origin: string
  destination: string
  departureDate: string
  returnDate?: string
  passengers: number
  cabinClass: string
  budget?: number
}

interface FlightBooking {
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
  departureTime: string
  arrivalTime: string
  airline: string
  flightNumber: string
  origin: string
  destination: string
  stops: number
  aircraft: string
  cabinClass: string
  baggageAllowance: string
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const origin = searchParams.get('origin')
    const destination = searchParams.get('destination')
    const departureDate = searchParams.get('departureDate')
    const returnDate = searchParams.get('returnDate')
    const passengers = parseInt(searchParams.get('passengers') || '1')
    const cabinClass = searchParams.get('cabinClass') || 'economy'
    const budget = parseInt(searchParams.get('budget') || '1000')

    if (!origin || !destination || !departureDate) {
      return NextResponse.json(
        { error: 'Missing required parameters: origin, destination, departureDate' },
        { status: 400 }
      )
    }

    // In production, integrate with real flight APIs like:
    // - Amadeus API
    // - Skyscanner API
    // - Google Flights API
    // - Kayak API
    // - Expedia API

    const flights = await fetchRealFlightData(origin, destination, departureDate, passengers, cabinClass, budget, returnDate || undefined)

    return NextResponse.json({
      success: true,
      data: flights,
      meta: {
        origin,
        destination,
        departureDate,
        returnDate,
        passengers,
        cabinClass,
        totalResults: flights.length
      }
    })

  } catch (error) {
    console.error('Flight booking API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch flight data' },
      { status: 500 }
    )
  }
}

async function fetchRealFlightData(
  origin: string,
  destination: string,
  departureDate: string,
  passengers: number,
  cabinClass: string,
  budget: number,
  returnDate?: string
): Promise<FlightBooking[]> {
  // Enhanced mock data that simulates real flight API responses
  // In production, replace this with actual API calls

  const baseFlights: FlightBooking[] = [
    {
      id: 'flight-real-1',
      name: 'United Airlines Premium Economy',
      description: 'Premium economy service with extra legroom and enhanced amenities.',
      price: Math.floor(Math.random() * 200) + 350,
      originalPrice: Math.floor(Math.random() * 100) + 450,
      currency: 'USD',
      rating: 4.2,
      reviewCount: 1847,
      image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=400&h=300&fit=crop',
      amenities: ['Free WiFi', 'Entertainment', 'Meal Included', 'Extra Legroom', 'Priority Boarding'],
      availability: {
        available: true,
        lastUpdated: new Date().toISOString(),
        capacity: Math.floor(Math.random() * 30) + 20
      },
      bookingUrl: `https://www.united.com/en/us/flights-from-${origin.toLowerCase()}-to-${destination.toLowerCase()}?date=${departureDate}&passengers=${passengers}`,
      provider: 'United Airlines',
      location: `${origin} → ${destination}`,
      duration: '6h 15m',
      departureTime: '09:30 AM',
      arrivalTime: '12:45 PM',
      airline: 'United Airlines',
      flightNumber: 'UA1234',
      origin,
      destination,
      stops: 0,
      aircraft: 'Boeing 737-900',
      cabinClass: 'Premium Economy',
      baggageAllowance: '1 checked bag + 1 carry-on'
    },
    {
      id: 'flight-real-2',
      name: 'American Airlines Economy',
      description: 'Standard economy service with comfortable seating and in-flight entertainment.',
      price: Math.floor(Math.random() * 150) + 280,
      currency: 'USD',
      rating: 3.9,
      reviewCount: 2341,
      image: 'https://images.unsplash.com/photo-1556388158-158ea5ccacbd?w=400&h=300&fit=crop',
      amenities: ['Entertainment', 'Snack Service', 'USB Charging'],
      availability: {
        available: true,
        lastUpdated: new Date().toISOString(),
        capacity: Math.floor(Math.random() * 40) + 30
      },
      bookingUrl: `https://www.aa.com/flights-from-${origin.toLowerCase()}-to-${destination.toLowerCase()}?date=${departureDate}&passengers=${passengers}`,
      provider: 'American Airlines',
      location: `${origin} → ${destination}`,
      duration: '6h 45m',
      departureTime: '11:15 AM',
      arrivalTime: '02:00 PM',
      airline: 'American Airlines',
      flightNumber: 'AA5678',
      origin,
      destination,
      stops: 1,
      aircraft: 'Airbus A320',
      cabinClass: 'Economy',
      baggageAllowance: '1 carry-on + personal item'
    },
    {
      id: 'flight-real-3',
      name: 'Delta Air Lines Business Class',
      description: 'Business class service with lie-flat seats and premium dining experience.',
      price: Math.floor(Math.random() * 400) + 800,
      originalPrice: Math.floor(Math.random() * 200) + 1000,
      currency: 'USD',
      rating: 4.6,
      reviewCount: 892,
      image: 'https://images.unsplash.com/photo-1556388158-158ea5ccacbd?w=400&h=300&fit=crop',
      amenities: ['Lie-flat Seats', 'Premium Dining', 'Priority Check-in', 'Lounge Access', 'Free WiFi'],
      availability: {
        available: true,
        lastUpdated: new Date().toISOString(),
        capacity: Math.floor(Math.random() * 15) + 8
      },
      bookingUrl: `https://www.delta.com/flights-from-${origin.toLowerCase()}-to-${destination.toLowerCase()}?date=${departureDate}&passengers=${passengers}`,
      provider: 'Delta Air Lines',
      location: `${origin} → ${destination}`,
      duration: '6h 30m',
      departureTime: '08:45 AM',
      arrivalTime: '12:15 PM',
      airline: 'Delta Air Lines',
      flightNumber: 'DL9012',
      origin,
      destination,
      stops: 0,
      aircraft: 'Boeing 757-200',
      cabinClass: 'Business',
      baggageAllowance: '2 checked bags + 1 carry-on'
    },
    {
      id: 'flight-real-4',
      name: 'Southwest Airlines Economy',
      description: 'Budget-friendly service with no change fees and two free checked bags.',
      price: Math.floor(Math.random() * 100) + 220,
      currency: 'USD',
      rating: 4.1,
      reviewCount: 3456,
      image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=400&h=300&fit=crop',
      amenities: ['No Change Fees', '2 Free Checked Bags', 'Snack Service', 'Entertainment'],
      availability: {
        available: true,
        lastUpdated: new Date().toISOString(),
        capacity: Math.floor(Math.random() * 50) + 40
      },
      bookingUrl: `https://www.southwest.com/flights-from-${origin.toLowerCase()}-to-${destination.toLowerCase()}?date=${departureDate}&passengers=${passengers}`,
      provider: 'Southwest Airlines',
      location: `${origin} → ${destination}`,
      duration: '7h 15m',
      departureTime: '10:30 AM',
      arrivalTime: '01:45 PM',
      airline: 'Southwest Airlines',
      flightNumber: 'WN3456',
      origin,
      destination,
      stops: 1,
      aircraft: 'Boeing 737-800',
      cabinClass: 'Economy',
      baggageAllowance: '2 free checked bags + 1 carry-on'
    },
    {
      id: 'flight-real-5',
      name: 'JetBlue Mint Premium',
      description: 'Premium service with lie-flat seats and farm-to-tray dining experience.',
      price: Math.floor(Math.random() * 300) + 600,
      originalPrice: Math.floor(Math.random() * 150) + 750,
      currency: 'USD',
      rating: 4.7,
      reviewCount: 567,
      image: 'https://images.unsplash.com/photo-1556388158-158ea5ccacbd?w=400&h=300&fit=crop',
      amenities: ['Lie-flat Seats', 'Farm-to-tray Dining', 'Free WiFi', 'Entertainment', 'Priority Boarding'],
      availability: {
        available: true,
        lastUpdated: new Date().toISOString(),
        capacity: Math.floor(Math.random() * 12) + 6
      },
      bookingUrl: `https://www.jetblue.com/flights-from-${origin.toLowerCase()}-to-${destination.toLowerCase()}?date=${departureDate}&passengers=${passengers}`,
      provider: 'JetBlue Airways',
      location: `${origin} → ${destination}`,
      duration: '6h 00m',
      departureTime: '07:15 AM',
      arrivalTime: '11:15 AM',
      airline: 'JetBlue Airways',
      flightNumber: 'B6789',
      origin,
      destination,
      stops: 0,
      aircraft: 'Airbus A321neo',
      cabinClass: 'Mint Premium',
      baggageAllowance: '2 checked bags + 1 carry-on'
    }
  ]

  // Filter by budget and cabin class
  const filteredFlights = baseFlights
    .filter(flight => {
      const priceCheck = flight.price <= budget
      const cabinCheck = cabinClass === 'all' || flight.cabinClass.toLowerCase().includes(cabinClass.toLowerCase())
      return priceCheck && cabinCheck
    })
    .map(flight => ({
      ...flight,
      // Simulate dynamic pricing based on demand and date
      price: Math.max(flight.price * (0.7 + Math.random() * 0.6), flight.price * 0.7),
      availability: {
        ...flight.availability,
        capacity: Math.max(1, flight.availability.capacity || 10)
      }
    }))

  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800))

  return filteredFlights
}
