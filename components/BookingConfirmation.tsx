'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  CheckCircle, 
  Clock, 
  Calendar, 
  MapPin, 
  User, 
  Phone, 
  Mail, 
  Download, 
  Share2, 
  RefreshCw,
  AlertCircle,
  Plane,
  Hotel,
  Car,
  Calendar as CalendarIcon
} from 'lucide-react'

interface BookingConfirmation {
  bookingId: string
  confirmationNumber: string
  status: 'confirmed' | 'pending' | 'failed'
  totalAmount: number
  currency: string
  bookingDetails: {
    type: 'flight' | 'hotel' | 'activity' | 'car-rental'
    itemId: string
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
  cancellationPolicy: string
  contactInfo: {
    email: string
    phone: string
  }
  createdAt: string
  expiresAt?: string
}

interface BookingConfirmationProps {
  bookingId?: string
  userId?: string
  onClose?: () => void
}

export default function BookingConfirmation({ 
  bookingId, 
  userId, 
  onClose 
}: BookingConfirmationProps) {
  const [booking, setBooking] = useState<BookingConfirmation | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (bookingId && userId) {
      fetchBookingDetails()
    }
  }, [bookingId, userId])

  const fetchBookingDetails = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/bookings/process?bookingId=${bookingId}&userId=${userId}`)
      const data = await response.json()
      
      if (data.success) {
        setBooking(data.booking)
      } else {
        setError(data.error || 'Failed to fetch booking details')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getBookingTypeIcon = (type: string) => {
    switch (type) {
      case 'flight':
        return Plane
      case 'hotel':
        return Hotel
      case 'car-rental':
        return Car
      case 'activity':
        return CalendarIcon
      default:
        return CalendarIcon
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const handleDownloadConfirmation = () => {
    if (!booking) return
    
    // In production, generate and download PDF
    const confirmationData = {
      confirmationNumber: booking.confirmationNumber,
      bookingId: booking.bookingId,
      type: booking.bookingDetails.type,
      destination: booking.bookingDetails.tripDetails.destination,
      dates: `${formatDate(booking.bookingDetails.tripDetails.startDate)} - ${formatDate(booking.bookingDetails.tripDetails.endDate)}`,
      traveler: `${booking.bookingDetails.travelerInfo.firstName} ${booking.bookingDetails.travelerInfo.lastName}`,
      total: formatPrice(booking.totalAmount, booking.currency),
      status: booking.status
    }
    
    // Create and download JSON file (in production, generate PDF)
    const dataStr = JSON.stringify(confirmationData, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `booking-confirmation-${booking.confirmationNumber}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  const handleShareConfirmation = () => {
    if (!booking) return
    
    const shareText = `Booking Confirmation: ${booking.confirmationNumber}\nDestination: ${booking.bookingDetails.tripDetails.destination}\nDates: ${formatDate(booking.bookingDetails.tripDetails.startDate)} - ${formatDate(booking.bookingDetails.tripDetails.endDate)}\nTotal: ${formatPrice(booking.totalAmount, booking.currency)}`
    
    if (navigator.share) {
      navigator.share({
        title: 'Travel Booking Confirmation',
        text: shareText,
        url: window.location.href
      })
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(shareText)
      alert('Confirmation details copied to clipboard!')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mr-3" />
        <span className="text-gray-600">Loading booking confirmation...</span>
      </div>
    )
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-red-600" />
            <div>
              <h3 className="font-semibold text-red-900">Error Loading Booking</h3>
              <p className="text-red-700">{error}</p>
            </div>
          </div>
          <Button 
            onClick={fetchBookingDetails}
            variant="outline" 
            className="mt-4 border-red-300 text-red-700 hover:bg-red-100"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (!booking) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <CalendarIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Booking Found</h3>
            <p className="text-gray-600">
              Please check your booking ID and try again.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const BookingTypeIcon = getBookingTypeIcon(booking.bookingDetails.type)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Booking Confirmation</h2>
          <p className="text-gray-600">
            Your travel booking has been confirmed
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleDownloadConfirmation}>
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
          <Button variant="outline" onClick={handleShareConfirmation}>
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
        </div>
      </div>

      {/* Main Confirmation Card */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div>
                <CardTitle className="text-green-900">
                  Booking Confirmed!
                </CardTitle>
                <CardDescription className="text-green-700">
                  Confirmation Number: {booking.confirmationNumber}
                </CardDescription>
              </div>
            </div>
            <Badge className={getStatusColor(booking.status)}>
              {booking.status.toUpperCase()}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Booking Details */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <BookingTypeIcon className="w-5 h-5 text-blue-600" />
                <span className="font-medium capitalize">
                  {booking.bookingDetails.type.replace('-', ' ')}
                </span>
              </div>
              
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="w-4 h-4" />
                <span>{booking.bookingDetails.tripDetails.destination}</span>
              </div>
              
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>
                  {formatDate(booking.bookingDetails.tripDetails.startDate)} - {formatDate(booking.bookingDetails.tripDetails.endDate)}
                </span>
              </div>
              
              <div className="flex items-center gap-2 text-gray-600">
                <User className="w-4 h-4" />
                <span>{booking.bookingDetails.tripDetails.travelers} traveler(s)</span>
              </div>
            </div>

            {/* Pricing */}
            <div className="space-y-4">
              <div className="text-right">
                <div className="text-3xl font-bold text-green-600">
                  {formatPrice(booking.totalAmount, booking.currency)}
                </div>
                <div className="text-sm text-gray-600">Total Amount</div>
              </div>
              
              {booking.expiresAt && (
                <div className="flex items-center gap-2 text-orange-600">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">
                    Expires: {formatDate(booking.expiresAt)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Traveler Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Traveler Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-600">Name</div>
              <div className="font-medium">
                {booking.bookingDetails.travelerInfo.firstName} {booking.bookingDetails.travelerInfo.lastName}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Email</div>
              <div className="font-medium">{booking.bookingDetails.travelerInfo.email}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Phone</div>
              <div className="font-medium">{booking.bookingDetails.travelerInfo.phone}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Date of Birth</div>
              <div className="font-medium">{formatDate(booking.bookingDetails.travelerInfo.dateOfBirth)}</div>
            </div>
            {booking.bookingDetails.travelerInfo.passportNumber && (
              <div>
                <div className="text-sm text-gray-600">Passport Number</div>
                <div className="font-medium">{booking.bookingDetails.travelerInfo.passportNumber}</div>
              </div>
            )}
            {booking.bookingDetails.travelerInfo.driverLicenseNumber && (
              <div>
                <div className="text-sm text-gray-600">Driver License</div>
                <div className="font-medium">{booking.bookingDetails.travelerInfo.driverLicenseNumber}</div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Preferences */}
      {(booking.bookingDetails.preferences.seatPreference || 
        booking.bookingDetails.preferences.mealPreference || 
        booking.bookingDetails.preferences.roomPreference || 
        booking.bookingDetails.preferences.specialRequests) && (
        <Card>
          <CardHeader>
            <CardTitle>Preferences & Special Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {booking.bookingDetails.preferences.seatPreference && (
                <div>
                  <div className="text-sm text-gray-600">Seat Preference</div>
                  <div className="font-medium">{booking.bookingDetails.preferences.seatPreference}</div>
                </div>
              )}
              {booking.bookingDetails.preferences.mealPreference && (
                <div>
                  <div className="text-sm text-gray-600">Meal Preference</div>
                  <div className="font-medium">{booking.bookingDetails.preferences.mealPreference}</div>
                </div>
              )}
              {booking.bookingDetails.preferences.roomPreference && (
                <div>
                  <div className="text-sm text-gray-600">Room Preference</div>
                  <div className="font-medium">{booking.bookingDetails.preferences.roomPreference}</div>
                </div>
              )}
              {booking.bookingDetails.preferences.specialRequests && (
                <div>
                  <div className="text-sm text-gray-600">Special Requests</div>
                  <div className="font-medium">{booking.bookingDetails.preferences.specialRequests}</div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cancellation Policy */}
      <Card>
        <CardHeader>
          <CardTitle>Important Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <div className="text-sm text-gray-600">Cancellation Policy</div>
              <div className="font-medium">{booking.cancellationPolicy}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Booking Created</div>
              <div className="font-medium">{formatDate(booking.createdAt)}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Contact Information</div>
              <div className="font-medium">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  {booking.contactInfo.email}
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  {booking.contactInfo.phone}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-3">
        <Button onClick={onClose} className="flex-1">
          Close
        </Button>
        <Button variant="outline" onClick={handleDownloadConfirmation}>
          <Download className="w-4 h-4 mr-2" />
          Download Confirmation
        </Button>
      </div>
    </div>
  )
}
