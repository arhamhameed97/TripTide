'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface HotelInfo {
  name: string
  price: string
  link: string
  rating?: number
  amenities?: string[]
  address?: string
  phone?: string
  website?: string
  checkIn?: string
  checkOut?: string
  roomType?: string
  cancellationPolicy?: string
}

interface AccommodationPanelProps {
  hotels: HotelInfo[]
  days: number
  totalBudget: number
  actualAccommodationCost: number
  totalActualCost: number
  onBudgetUpdate?: (accommodationCost: number) => void
}

export default function AccommodationPanel({ 
  hotels, 
  days, 
  totalBudget,
  actualAccommodationCost,
  totalActualCost,
  onBudgetUpdate 
}: AccommodationPanelProps) {
  const [selectedHotel, setSelectedHotel] = useState<HotelInfo | null>(hotels[0] || null)

  const formatCurrency = (amount: string | number) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount.replace(/[^0-9.]/g, '')) : amount
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(numAmount)
  }

  // Use the actual costs from the comprehensive budget summary
  const totalCost = actualAccommodationCost
  const dailyCost = totalCost / days
  const budgetPercentage = (totalCost / totalBudget) * 100
  const totalBudgetUtilization = (totalActualCost / totalBudget) * 100

  const getBudgetStatusColor = () => {
    if (budgetPercentage <= 35) return 'text-green-600'
    if (budgetPercentage <= 50) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getBudgetStatusIcon = () => {
    if (budgetPercentage <= 35) return '✅'
    if (budgetPercentage <= 50) return '⚠️'
    return '❌'
  }

  const getBudgetTip = () => {
    if (budgetPercentage <= 35 && totalBudgetUtilization <= 100) {
      return "Great choice! This accommodation fits well within your budget and overall trip costs are manageable."
    } else if (budgetPercentage <= 50 && totalBudgetUtilization <= 100) {
      return "Consider looking for more budget-friendly accommodation options to save money for activities."
    } else if (totalBudgetUtilization > 100) {
      return "Your total trip costs exceed your budget. Consider reducing accommodation costs or increasing your budget."
    } else {
      return "This accommodation exceeds recommended budget allocation. Consider alternatives."
    }
  }

  if (!hotels.length) {
    return (
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-semibold text-purple-900 flex items-center gap-2">
            🏨 Accommodation Details
          </CardTitle>
          <CardDescription className="text-purple-700">
            Hotel information will be available here
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="text-4xl mb-4">🏨</div>
            <p className="text-gray-600">Accommodation details will be loaded here</p>
            <p className="text-sm text-gray-500 mt-2">Check back for hotel information and pricing</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-semibold text-purple-900 flex items-center gap-2">
          🏨 Accommodation Details
        </CardTitle>
        <CardDescription className="text-purple-700">
          Your {days}-night stay details and pricing breakdown
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Hotel Selection */}
        <div className="mb-6">
          <h4 className="font-medium text-gray-900 mb-3">Available Hotels</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {hotels.map((hotel, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedHotel?.name === hotel.name
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-purple-300'
                }`}
                onClick={() => setSelectedHotel(hotel)}
              >
                <div className="flex items-center justify-between mb-2">
                  <h5 className="font-medium text-gray-900 text-sm">{hotel.name}</h5>
                  {hotel.rating && (
                    <div className="flex items-center gap-1">
                      ⭐
                      <span className="text-xs text-gray-600">{hotel.rating}</span>
                    </div>
                  )}
                </div>
                <div className="text-lg font-bold text-purple-600">
                  {formatCurrency(hotel.price)}/night
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {formatCurrency(parseFloat(hotel.price.replace(/[^0-9.]/g, '')) * days)} total
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Selected Hotel Details */}
        {selectedHotel && (
          <div className="bg-white rounded-lg p-6 border border-gray-200 mb-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">{selectedHotel.name}</h3>
                {selectedHotel.address && (
                  <div className="flex items-center gap-1 text-gray-600 mb-2">
                    📍
                    <span className="text-sm">{selectedHotel.address}</span>
                  </div>
                )}
                {selectedHotel.rating && (
                  <div className="flex items-center gap-1 mb-2">
                    ⭐
                    <span className="text-sm font-medium">{selectedHotel.rating}/5</span>
                  </div>
                )}
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-purple-600">
                  {formatCurrency(selectedHotel.price)}
                </div>
                <div className="text-sm text-gray-500">per night</div>
              </div>
            </div>

            {/* Hotel Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <h5 className="font-medium text-gray-900 mb-2">Stay Details</h5>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    📅
                    <span>Check-in: {selectedHotel.checkIn || '2:00 PM'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    📅
                    <span>Check-out: {selectedHotel.checkOut || '11:00 AM'}</span>
                  </div>
                  {selectedHotel.roomType && (
                    <div className="flex items-center gap-2">
                      🏨
                      <span>Room: {selectedHotel.roomType}</span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h5 className="font-medium text-gray-900 mb-2">Contact Information</h5>
                <div className="space-y-2 text-sm">
                  {selectedHotel.phone && (
                    <div className="flex items-center gap-2">
                      📞
                      <span>{selectedHotel.phone}</span>
                    </div>
                  )}
                  {selectedHotel.website && (
                    <div className="flex items-center gap-2">
                      🌐
                      <span className="text-blue-600 hover:underline cursor-pointer">
                        Visit Website
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Amenities */}
            {selectedHotel.amenities && selectedHotel.amenities.length > 0 && (
              <div className="mb-4">
                <h5 className="font-medium text-gray-900 mb-2">Amenities</h5>
                <div className="flex flex-wrap gap-2">
                  {selectedHotel.amenities.map((amenity, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {amenity}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Cancellation Policy */}
            {selectedHotel.cancellationPolicy && (
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <h5 className="font-medium text-gray-900 mb-1">Cancellation Policy</h5>
                <p className="text-sm text-gray-600">{selectedHotel.cancellationPolicy}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button 
                onClick={() => window.open(selectedHotel.link, '_blank')}
                className="flex items-center gap-2"
              >
                🔗 Book Now
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                📍 View on Map
              </Button>
            </div>
          </div>
        )}

        {/* Budget Integration */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg border border-green-200">
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            💰 Budget Impact
          </h4>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center">
              <div className="text-lg font-bold text-green-600">{formatCurrency(dailyCost)}</div>
              <div className="text-xs text-gray-500">Daily Cost</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-blue-600">{formatCurrency(totalCost)}</div>
              <div className="text-xs text-gray-500">Total Cost</div>
            </div>
            <div className="text-center">
              <div className={`text-lg font-bold ${getBudgetStatusColor()}`}>
                {budgetPercentage.toFixed(1)}%
              </div>
              <div className="text-xs text-gray-500">of Budget</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-purple-600">{getBudgetStatusIcon()}</div>
              <div className="text-xs text-gray-500">Status</div>
            </div>
          </div>

          {/* Total Budget Overview */}
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200 mb-4">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-sm font-medium text-blue-700">Total Trip Cost</div>
                <div className="text-lg font-bold text-blue-800">{formatCurrency(totalActualCost)}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-blue-700">Overall Budget Usage</div>
                <div className={`text-lg font-bold ${totalBudgetUtilization > 100 ? 'text-red-600' : totalBudgetUtilization > 80 ? 'text-yellow-600' : 'text-green-600'}`}>
                  {totalBudgetUtilization.toFixed(1)}%
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-3 rounded-lg border border-green-200">
            <div className="flex items-start gap-2">
              <span className="text-sm">💡</span>
              <p className="text-sm text-gray-700">{getBudgetTip()}</p>
            </div>
          </div>

          {/* Budget Recommendations */}
          <div className="mt-3 text-xs text-gray-600">
            <strong>Recommended:</strong> Accommodation should be 25-35% of your total travel budget for optimal allocation.
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
