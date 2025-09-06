import { NextRequest, NextResponse } from 'next/server'

interface BookingRequest {
  type: 'flight' | 'hotel' | 'activity' | 'car-rental'
  itemId: string
  userId: string
  paymentMethod: {
    type: 'stripe' | 'paypal'
    token: string
  }
  travelerInfo: {
    firstName: string
    lastName: string
    email: string
    phone: string
    dateOfBirth: string
    passportNumber?: string
    driverLicenseNumber?: string
  }
  tripDetails: {
    destination: string
    startDate: string
    endDate: string
    travelers: number
  }
  preferences: {
    seatPreference?: string
    mealPreference?: string
    roomPreference?: string
    specialRequests?: string
  }
}

interface BookingConfirmation {
  bookingId: string
  confirmationNumber: string
  status: 'confirmed' | 'pending' | 'failed'
  totalAmount: number
  currency: string
  bookingDetails: any
  cancellationPolicy: string
  contactInfo: {
    email: string
    phone: string
  }
  createdAt: string
  expiresAt?: string
}

interface PaymentResult {
  success: boolean
  transactionId?: string
  amount: number
  currency: string
  error?: string
}

export async function POST(request: NextRequest) {
  try {
    const bookingRequest: BookingRequest = await request.json()

    // Validate required fields
    if (!bookingRequest.type || !bookingRequest.itemId || !bookingRequest.userId) {
      return NextResponse.json(
        { error: 'Missing required fields: type, itemId, userId' },
        { status: 400 }
      )
    }

    // Process payment first
    const paymentResult = await processPayment(bookingRequest)
    
    if (!paymentResult.success) {
      return NextResponse.json(
        { 
          error: 'Payment failed', 
          details: paymentResult.error,
          bookingId: null 
        },
        { status: 402 }
      )
    }

    // Create the actual booking based on type
    const bookingResult = await createBooking(bookingRequest, paymentResult)

    if (!bookingResult.success) {
      // If booking fails, refund the payment
      await refundPayment(paymentResult.transactionId!)
      
      return NextResponse.json(
        { 
          error: 'Booking failed', 
          details: bookingResult.error,
          refundInitiated: true 
        },
        { status: 500 }
      )
    }

    // Store booking in database (in production, use a real database)
    const bookingConfirmation = await storeBooking(bookingResult.booking!)

    return NextResponse.json({
      success: true,
      booking: bookingConfirmation,
      payment: {
        transactionId: paymentResult.transactionId,
        amount: paymentResult.amount,
        currency: paymentResult.currency
      }
    })

  } catch (error) {
    console.error('Booking service error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function processPayment(bookingRequest: BookingRequest): Promise<PaymentResult> {
  try {
    // In production, integrate with Stripe or PayPal
    // For now, simulate payment processing
    
    const amount = await getBookingPrice(bookingRequest)
    
    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Simulate 95% success rate
    const success = Math.random() > 0.05
    
    if (success) {
      return {
        success: true,
        transactionId: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        amount,
        currency: 'USD'
      }
    } else {
      return {
        success: false,
        amount,
        currency: 'USD',
        error: 'Payment declined by bank'
      }
    }
  } catch (error) {
    return {
      success: false,
      amount: 0,
      currency: 'USD',
      error: 'Payment processing error'
    }
  }
}

async function getBookingPrice(bookingRequest: BookingRequest): Promise<number> {
  // In production, fetch actual price from the booking provider
  // For now, return mock prices based on type
  
  const basePrices = {
    'flight': 450,
    'hotel': 150,
    'activity': 75,
    'car-rental': 65
  }
  
  const basePrice = basePrices[bookingRequest.type] || 100
  const travelers = bookingRequest.tripDetails.travelers || 1
  
  // Add some variation and multiply by travelers for applicable types
  const variation = 0.8 + Math.random() * 0.4
  const finalPrice = Math.round(basePrice * variation)
  
  // For flights and activities, multiply by travelers
  if (bookingRequest.type === 'flight' || bookingRequest.type === 'activity') {
    return finalPrice * travelers
  }
  
  return finalPrice
}

async function createBooking(bookingRequest: BookingRequest, paymentResult: PaymentResult): Promise<{
  success: boolean
  booking?: BookingConfirmation
  error?: string
}> {
  try {
    // Simulate booking creation with different providers
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // Simulate 90% success rate for booking creation
    const success = Math.random() > 0.1
    
    if (!success) {
      return {
        success: false,
        error: 'Booking provider temporarily unavailable'
      }
    }
    
    const bookingId = `booking_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const confirmationNumber = generateConfirmationNumber()
    
    const booking: BookingConfirmation = {
      bookingId,
      confirmationNumber,
      status: 'confirmed',
      totalAmount: paymentResult.amount,
      currency: paymentResult.currency,
      bookingDetails: {
        type: bookingRequest.type,
        itemId: bookingRequest.itemId,
        travelerInfo: bookingRequest.travelerInfo,
        tripDetails: bookingRequest.tripDetails,
        preferences: bookingRequest.preferences
      },
      cancellationPolicy: getCancellationPolicy(bookingRequest.type),
      contactInfo: {
        email: bookingRequest.travelerInfo.email,
        phone: bookingRequest.travelerInfo.phone
      },
      createdAt: new Date().toISOString(),
      expiresAt: bookingRequest.type === 'flight' ? 
        new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() : undefined
    }
    
    return {
      success: true,
      booking
    }
  } catch (error) {
    return {
      success: false,
      error: 'Failed to create booking'
    }
  }
}

async function storeBooking(booking: BookingConfirmation): Promise<BookingConfirmation> {
  // In production, store in database
  // For now, simulate storage
  await new Promise(resolve => setTimeout(resolve, 200))
  
  // In a real app, you would:
  // 1. Store in PostgreSQL/MongoDB
  // 2. Send confirmation email
  // 3. Add to user's booking history
  // 4. Update inventory/availability
  
  return booking
}

async function refundPayment(transactionId: string): Promise<void> {
  // In production, process refund through payment provider
  console.log(`Refunding payment: ${transactionId}`)
  await new Promise(resolve => setTimeout(resolve, 500))
}

function generateConfirmationNumber(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

function getCancellationPolicy(type: string): string {
  const policies = {
    'flight': 'Free cancellation up to 24 hours before departure',
    'hotel': 'Free cancellation up to 48 hours before check-in',
    'activity': 'Free cancellation up to 24 hours before activity',
    'car-rental': 'Free cancellation up to 24 hours before pickup'
  }
  
  return policies[type as keyof typeof policies] || 'Cancellation policy varies by provider'
}

// GET endpoint to retrieve booking status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const bookingId = searchParams.get('bookingId')
    const userId = searchParams.get('userId')
    
    if (!bookingId || !userId) {
      return NextResponse.json(
        { error: 'Missing required parameters: bookingId, userId' },
        { status: 400 }
      )
    }
    
    // In production, fetch from database
    // For now, return mock data
    const booking = await getBookingById(bookingId, userId)
    
    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      booking
    })
    
  } catch (error) {
    console.error('Get booking error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function getBookingById(bookingId: string, userId: string): Promise<BookingConfirmation | null> {
  // In production, query database
  // For now, return null (simulating not found)
  return null
}
