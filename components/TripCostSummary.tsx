'use client'

import { Calculator, DollarSign, TrendingUp, AlertTriangle, CheckCircle, XCircle } from 'lucide-react'

interface HourlyActivity {
  hour: string
  activity: string
  location: string
  estimatedCost: string
}

interface ItineraryDay {
  day: number
  hourlyActivities: HourlyActivity[]
  transportSuggestion?: string
  hotel?: {
    name: string
    price: string
    link: string
  }
  flight?: {
    airline: string
    price: string
    link: string
  }
}

interface TripCostSummaryProps {
  itinerary: ItineraryDay[]
  totalBudget: number
  days: number
  budgetCategory: string
}

export default function TripCostSummary({ 
  itinerary, 
  totalBudget, 
  days, 
  budgetCategory 
}: TripCostSummaryProps) {
  
  // Calculate total estimated costs from itinerary
  const calculateTotalCosts = () => {
    let totalEstimatedCost = 0
    let accommodationCost = 0
    let foodCost = 0
    let activityCost = 0
    let transportCost = 0
    let shoppingCost = 0

    itinerary.forEach((day) => {
      // Add hotel cost if available
      if (day.hotel?.price) {
        const hotelPrice = parseFloat(day.hotel.price.replace(/[^0-9.]/g, '')) || 0
        accommodationCost += hotelPrice
        totalEstimatedCost += hotelPrice
      }

      // Add flight cost if available (only for first day)
      if (day.day === 1 && day.flight?.price) {
        const flightPrice = parseFloat(day.flight.price.replace(/[^0-9.]/g, '')) || 0
        transportCost += flightPrice
        totalEstimatedCost += flightPrice
      }

      // Process hourly activities
      day.hourlyActivities.forEach((activity) => {
        const cost = parseFloat(activity.estimatedCost.replace(/[^0-9.]/g, '')) || 0
        
        // Categorize activities based on keywords
        const activityLower = activity.activity.toLowerCase()
        const locationLower = activity.location.toLowerCase()
        
        if (activityLower.includes('breakfast') || activityLower.includes('lunch') || 
            activityLower.includes('dinner') || activityLower.includes('restaurant') ||
            activityLower.includes('cafe') || activityLower.includes('food') ||
            locationLower.includes('restaurant') || locationLower.includes('cafe')) {
          foodCost += cost
        } else if (activityLower.includes('museum') || activityLower.includes('visit') ||
                   activityLower.includes('explore') || activityLower.includes('tour') ||
                   activityLower.includes('park') || activityLower.includes('beach') ||
                   activityLower.includes('hike') || activityLower.includes('walk')) {
          activityCost += cost
        } else if (activityLower.includes('shopping') || activityLower.includes('market') ||
                   activityLower.includes('store') || activityLower.includes('mall')) {
          shoppingCost += cost
        } else if (activityLower.includes('metro') || activityLower.includes('bus') ||
                   activityLower.includes('taxi') || activityLower.includes('train') ||
                   activityLower.includes('transport')) {
          transportCost += cost
        } else {
          // Default to activities if unclear
          activityCost += cost
        }
        
        totalEstimatedCost += cost
      })
    })

    return {
      totalEstimatedCost,
      accommodationCost,
      foodCost,
      activityCost,
      transportCost,
      shoppingCost
    }
  }

  const costs = calculateTotalCosts()
  const remainingBudget = totalBudget - costs.totalEstimatedCost
  const isWithinBudget = remainingBudget >= 0
  const budgetUtilization = (costs.totalEstimatedCost / totalBudget) * 100

  const getBudgetStatusColor = () => {
    if (budgetUtilization <= 80) return 'text-green-600'
    if (budgetUtilization <= 100) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getBudgetStatusIcon = () => {
    if (budgetUtilization <= 80) return <CheckCircle className="w-5 h-5 text-green-600" />
    if (budgetUtilization <= 100) return <AlertTriangle className="w-5 h-5 text-yellow-600" />
    return <XCircle className="w-5 h-5 text-red-600" />
  }

  const getBudgetStatusMessage = () => {
    if (budgetUtilization <= 80) return 'Great! You\'re well within budget'
    if (budgetUtilization <= 100) return 'You\'re at your budget limit'
    return 'You\'re over budget'
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  return (
    <div className="bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 p-6 rounded-xl border border-green-200 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-green-100 rounded-lg">
          <Calculator className="w-6 h-6 text-green-600" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900">Trip Cost Summary</h3>
          <p className="text-gray-600">Actual estimated costs vs. your budget</p>
        </div>
      </div>

      {/* Budget Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-5 h-5 text-green-600" />
            <span className="font-medium text-gray-700">Total Budget</span>
          </div>
          <div className="text-2xl font-bold text-green-600">{formatCurrency(totalBudget)}</div>
          <div className="text-sm text-gray-500">For {days} days</div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <span className="font-medium text-gray-700">Estimated Total</span>
          </div>
          <div className={`text-2xl font-bold ${getBudgetStatusColor()}`}>
            {formatCurrency(costs.totalEstimatedCost)}
          </div>
          <div className="text-sm text-gray-500">
            {budgetUtilization.toFixed(1)}% of budget
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            {getBudgetStatusIcon()}
            <span className="font-medium text-gray-700">Status</span>
          </div>
          <div className={`text-lg font-bold ${getBudgetStatusColor()}`}>
            {isWithinBudget ? 'Within Budget' : 'Over Budget'}
          </div>
          <div className="text-sm text-gray-500">
            {getBudgetStatusMessage()}
          </div>
        </div>
      </div>

      {/* Cost Breakdown */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6">
        <h4 className="font-semibold text-gray-900 mb-3">Detailed Cost Breakdown</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="text-sm font-medium text-green-700">Accommodation</div>
            <div className="text-lg font-bold text-green-600">{formatCurrency(costs.accommodationCost)}</div>
            <div className="text-xs text-green-600">
              {costs.accommodationCost > 0 ? `${((costs.accommodationCost / costs.totalEstimatedCost) * 100).toFixed(1)}% of total` : 'No accommodation costs'}
            </div>
          </div>
          
          <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-sm font-medium text-blue-700">Food & Dining</div>
            <div className="text-lg font-bold text-blue-600">{formatCurrency(costs.foodCost)}</div>
            <div className="text-xs text-blue-600">
              {costs.foodCost > 0 ? `${((costs.foodCost / costs.totalEstimatedCost) * 100).toFixed(1)}% of total` : 'No food costs'}
            </div>
          </div>
          
          <div className="text-center p-3 bg-purple-50 rounded-lg border border-purple-200">
            <div className="text-sm font-medium text-purple-700">Activities</div>
            <div className="text-lg font-bold text-purple-600">{formatCurrency(costs.activityCost)}</div>
            <div className="text-xs text-purple-600">
              {costs.activityCost > 0 ? `${((costs.activityCost / costs.totalEstimatedCost) * 100).toFixed(1)}% of total` : 'No activity costs'}
            </div>
          </div>
          
          <div className="text-center p-3 bg-orange-50 rounded-lg border border-orange-200">
            <div className="text-sm font-medium text-orange-700">Transport</div>
            <div className="text-lg font-bold text-orange-600">{formatCurrency(costs.transportCost)}</div>
            <div className="text-xs text-orange-600">
              {costs.transportCost > 0 ? `${((costs.transportCost / costs.totalEstimatedCost) * 100).toFixed(1)}% of total` : 'No transport costs'}
            </div>
          </div>
          
          <div className="text-center p-3 bg-red-50 rounded-lg border border-red-200">
            <div className="text-sm font-medium text-red-700">Shopping</div>
            <div className="text-lg font-bold text-red-600">{formatCurrency(costs.shoppingCost)}</div>
            <div className="text-xs text-red-600">
              {costs.shoppingCost > 0 ? `${((costs.shoppingCost / costs.totalEstimatedCost) * 100).toFixed(1)}% of total` : 'No shopping costs'}
            </div>
          </div>

          <div className="text-center p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div className="text-sm font-medium text-gray-700">Remaining</div>
            <div className={`text-lg font-bold ${isWithinBudget ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(Math.abs(remainingBudget))}
            </div>
            <div className="text-xs text-gray-600">
              {isWithinBudget ? 'Available' : 'Over budget'}
            </div>
          </div>
        </div>
      </div>

      {/* Budget Status */}
      <div className={`p-4 rounded-lg border ${
        budgetUtilization <= 80 ? 'bg-green-50 border-green-200' :
        budgetUtilization <= 100 ? 'bg-yellow-50 border-yellow-200' :
        'bg-red-50 border-red-200'
      }`}>
        <div className="flex items-start gap-3">
          {getBudgetStatusIcon()}
          <div>
            <h5 className={`font-medium mb-2 ${
              budgetUtilization <= 80 ? 'text-green-800' :
              budgetUtilization <= 100 ? 'text-yellow-800' :
              'text-red-800'
            }`}>
              Budget Status: {getBudgetStatusMessage()}
            </h5>
            <p className={`text-sm ${
              budgetUtilization <= 80 ? 'text-green-700' :
              budgetUtilization <= 100 ? 'text-yellow-700' :
              'text-red-700'
            }`}>
              {isWithinBudget 
                ? `You have ${formatCurrency(remainingBudget)} remaining from your ${formatCurrency(totalBudget)} budget.`
                : `You're ${formatCurrency(Math.abs(remainingBudget))} over your ${formatCurrency(totalBudget)} budget.`
              }
            </p>
            {budgetUtilization > 100 && (
              <ul className="text-sm text-red-700 mt-2 space-y-1">
                <li>• Consider reducing accommodation costs</li>
                <li>• Look for budget-friendly dining options</li>
                <li>• Choose free or low-cost activities</li>
                <li>• Use public transportation when possible</li>
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
