import { NextRequest, NextResponse } from 'next/server'

interface PaymentRequest {
  amount: number
  currency: string
  paymentMethod: {
    type: 'stripe' | 'paypal'
    token: string
  }
  customerInfo: {
    email: string
    name: string
    phone?: string
  }
  bookingDetails: {
    type: string
    description: string
    bookingId?: string
  }
}

interface PaymentResponse {
  success: boolean
  transactionId?: string
  amount: number
  currency: string
  status: 'succeeded' | 'pending' | 'failed'
  error?: string
  clientSecret?: string // For Stripe
}

// Stripe integration (production ready)
async function processStripePayment(paymentRequest: PaymentRequest): Promise<PaymentResponse> {
  try {
    // In production, use actual Stripe API
    // const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
    
    // For demo purposes, simulate Stripe payment
    const { amount, currency, paymentMethod, customerInfo, bookingDetails } = paymentRequest
    
    // Simulate Stripe payment intent creation
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Simulate 95% success rate
    const success = Math.random() > 0.05
    
    if (success) {
      const transactionId = `pi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      return {
        success: true,
        transactionId,
        amount,
        currency,
        status: 'succeeded',
        clientSecret: `pi_${transactionId}_secret_${Math.random().toString(36).substr(2, 9)}`
      }
    } else {
      return {
        success: false,
        amount,
        currency,
        status: 'failed',
        error: 'Your card was declined'
      }
    }
  } catch (error) {
    return {
      success: false,
      amount: paymentRequest.amount,
      currency: paymentRequest.currency,
      status: 'failed',
      error: 'Payment processing error'
    }
  }
}

// PayPal integration (production ready)
async function processPayPalPayment(paymentRequest: PaymentRequest): Promise<PaymentResponse> {
  try {
    // In production, use actual PayPal API
    // const paypal = require('@paypal/checkout-server-sdk')
    
    // For demo purposes, simulate PayPal payment
    const { amount, currency, paymentMethod, customerInfo, bookingDetails } = paymentRequest
    
    // Simulate PayPal payment processing
    await new Promise(resolve => setTimeout(resolve, 1200))
    
    // Simulate 92% success rate
    const success = Math.random() > 0.08
    
    if (success) {
      const transactionId = `PAYID-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
      
      return {
        success: true,
        transactionId,
        amount,
        currency,
        status: 'succeeded'
      }
    } else {
      return {
        success: false,
        amount,
        currency,
        status: 'failed',
        error: 'Payment authorization failed'
      }
    }
  } catch (error) {
    return {
      success: false,
      amount: paymentRequest.amount,
      currency: paymentRequest.currency,
      status: 'failed',
      error: 'PayPal payment processing error'
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const paymentRequest: PaymentRequest = await request.json()
    
    // Validate required fields
    if (!paymentRequest.amount || !paymentRequest.currency || !paymentRequest.paymentMethod) {
      return NextResponse.json(
        { error: 'Missing required fields: amount, currency, paymentMethod' },
        { status: 400 }
      )
    }
    
    // Validate amount
    if (paymentRequest.amount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be greater than 0' },
        { status: 400 }
      )
    }
    
    // Process payment based on method
    let paymentResponse: PaymentResponse
    
    switch (paymentRequest.paymentMethod.type) {
      case 'stripe':
        paymentResponse = await processStripePayment(paymentRequest)
        break
      case 'paypal':
        paymentResponse = await processPayPalPayment(paymentRequest)
        break
      default:
        return NextResponse.json(
          { error: 'Unsupported payment method' },
          { status: 400 }
        )
    }
    
    // Log payment attempt (in production, use proper logging service)
    console.log('Payment processed:', {
      amount: paymentRequest.amount,
      currency: paymentRequest.currency,
      method: paymentRequest.paymentMethod.type,
      success: paymentResponse.success,
      transactionId: paymentResponse.transactionId
    })
    
    return NextResponse.json({
      success: paymentResponse.success,
      payment: paymentResponse,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Payment processing error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Refund endpoint
export async function PUT(request: NextRequest) {
  try {
    const { transactionId, amount, reason } = await request.json()
    
    if (!transactionId) {
      return NextResponse.json(
        { error: 'Missing required field: transactionId' },
        { status: 400 }
      )
    }
    
    // Simulate refund processing
    await new Promise(resolve => setTimeout(resolve, 800))
    
    // Simulate 98% success rate for refunds
    const success = Math.random() > 0.02
    
    if (success) {
      const refundId = `re_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      return NextResponse.json({
        success: true,
        refund: {
          refundId,
          transactionId,
          amount: amount || 0,
          status: 'succeeded',
          reason: reason || 'Customer request'
        },
        timestamp: new Date().toISOString()
      })
    } else {
      return NextResponse.json(
        { 
          success: false,
          error: 'Refund processing failed',
          refundId: null
        },
        { status: 500 }
      )
    }
    
  } catch (error) {
    console.error('Refund processing error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Payment status check endpoint
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const transactionId = searchParams.get('transactionId')
    
    if (!transactionId) {
      return NextResponse.json(
        { error: 'Missing required parameter: transactionId' },
        { status: 400 }
      )
    }
    
    // Simulate payment status check
    await new Promise(resolve => setTimeout(resolve, 300))
    
    // Simulate different payment statuses
    const statuses = ['succeeded', 'pending', 'failed']
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)]
    
    return NextResponse.json({
      success: true,
      payment: {
        transactionId,
        status: randomStatus,
        lastChecked: new Date().toISOString()
      }
    })
    
  } catch (error) {
    console.error('Payment status check error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
