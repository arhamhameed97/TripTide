'use client'

import { useState, useEffect } from 'react'
import { Calculator, DollarSign, TrendingUp, Edit3, Save, X, RefreshCw, AlertTriangle, CheckCircle, XCircle, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

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

interface BudgetRecommendations {
  dailyBudget: number
  accommodationBudget: number
  activityBudget: number
  foodBudget: number
  transportBudget: number
  shoppingBudget: number
}

interface BudgetBreakdown {
  accommodation: number
  food: number
  activities: number
  transport: number
  shopping: number
  misc: number
}

interface ComprehensiveBudgetSummaryProps {
  totalBudget: number
  days: number
  itinerary: ItineraryDay[]
  budgetRecommendations: BudgetRecommendations
  unifiedBudgetData?: {
    totalActualCost: number
    accommodationCost: number
    foodCost: number
    activityCost: number
    transportCost: number
    shoppingCost: number
    totalBudgetUtilization: number
    dailyBudgetUtilization: number
    dailyBudget: number
    totalBudget: number
    days: number
  }
}

export default function ComprehensiveBudgetSummary({ 
  totalBudget, 
  days, 
  itinerary,
  budgetRecommendations,
  unifiedBudgetData
}: ComprehensiveBudgetSummaryProps) {
  const [isEditing, setIsEditing] = useState(false)
  // Calculate actual costs from itinerary
  const calculateActualCosts = () => {
    let totalEstimatedCost = 0
    let accommodationCost = 0
    let foodCost = 0
    let activityCost = 0
    let transportCost = 0
    let shoppingCost = 0

    itinerary.forEach((day) => {
      // Add hotel cost if available (only count once per unique hotel for total stay)
      if (day.hotel?.price && day.day === 1) {
        const hotelPrice = parseFloat(day.hotel.price.replace(/[^0-9.]/g, '')) || 0
        accommodationCost += hotelPrice * days // Total for entire stay
        totalEstimatedCost += hotelPrice * days
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

  // Use unified budget data if available, otherwise calculate from itinerary
  const actualCosts = unifiedBudgetData ? {
    totalEstimatedCost: unifiedBudgetData.totalActualCost,
    accommodationCost: unifiedBudgetData.accommodationCost,
    foodCost: unifiedBudgetData.foodCost,
    activityCost: unifiedBudgetData.activityCost,
    transportCost: unifiedBudgetData.transportCost,
    shoppingCost: unifiedBudgetData.shoppingCost
  } : calculateActualCosts()

  // Initialize budget breakdown with actual costs from AI itinerary
  const [budgetBreakdown, setBudgetBreakdown] = useState<BudgetBreakdown>({
    accommodation: Math.round(actualCosts.accommodationCost),
    food: Math.round(actualCosts.foodCost),
    activities: Math.round(actualCosts.activityCost),
    transport: Math.round(actualCosts.transportCost),
    shopping: Math.round(actualCosts.shoppingCost),
    misc: 0
  })
  const [tempBreakdown, setTempBreakdown] = useState<BudgetBreakdown>({ ...budgetBreakdown })
  const [showResetWarning, setShowResetWarning] = useState(false)

  // Calculate daily budget
  const dailyBudget = Math.round(totalBudget / days)

  // Calculate totals
  const totalAllocated = Object.values(tempBreakdown).reduce((sum, value) => sum + value, 0)
  const remainingBudget = totalBudget - totalAllocated
  const isOverBudget = remainingBudget < 0
  const budgetUtilization = (totalAllocated / totalBudget) * 100

  // Use unified budget utilization if available
  const actualRemainingBudget = totalBudget - actualCosts.totalEstimatedCost
  const actualBudgetUtilization = unifiedBudgetData ? unifiedBudgetData.totalBudgetUtilization : (actualCosts.totalEstimatedCost / totalBudget) * 100

  // Get recommended budget percentages
  const getRecommendedPercentages = () => {
    return { accommodation: 0.35, food: 0.25, activities: 0.20, transport: 0.15, shopping: 0.05, misc: 0 }
  }

  const resetToRecommended = () => {
    const percentages = getRecommendedPercentages()
    const newBreakdown = {
      accommodation: Math.round(totalBudget * percentages.accommodation),
      food: Math.round(totalBudget * percentages.food),
      activities: Math.round(totalBudget * percentages.activities),
      transport: Math.round(totalBudget * percentages.transport),
      shopping: Math.round(totalBudget * percentages.shopping),
      misc: Math.round(totalBudget * percentages.misc)
    }
    setTempBreakdown(newBreakdown)
    setShowResetWarning(false)
  }

  const handleInputChange = (category: keyof BudgetBreakdown, value: string) => {
    const numValue = parseInt(value) || 0
    setTempBreakdown(prev => ({
      ...prev,
      [category]: numValue
    }))
  }

  const handleSave = () => {
    setBudgetBreakdown({ ...tempBreakdown })
    setIsEditing(false)
  }

  const handleCancel = () => {
    setTempBreakdown({ ...budgetBreakdown })
    setIsEditing(false)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const getBudgetStatusColor = () => {
    if (actualBudgetUtilization <= 80) return 'text-green-600'
    if (actualBudgetUtilization <= 100) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getBudgetStatusIcon = () => {
    if (actualBudgetUtilization <= 80) return <CheckCircle className="w-5 h-5 text-green-600" />
    if (actualBudgetUtilization <= 100) return <AlertTriangle className="w-5 h-5 text-yellow-600" />
    return <XCircle className="w-5 h-5 text-red-600" />
  }

  const getSavingsTip = () => {
    if (dailyBudget <= 150) {
      return "Consider staying in hostels or budget hotels to save on accommodation costs."
    } else if (dailyBudget <= 300) {
      return "Mix budget and mid-range options to get the best value for your money."
    } else {
      return "Your budget allows for premium experiences and luxury accommodations."
    }
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-6 rounded-xl border border-blue-200 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Calculator className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Comprehensive Budget Summary</h3>
            <p className="text-gray-600">Your ${totalBudget.toLocaleString()} budget breakdown and actual costs</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          {!isEditing ? (
            <Button 
              onClick={() => setIsEditing(true)}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Edit3 className="w-4 h-4" />
              Edit Budget
            </Button>
          ) : (
            <>
              <Button 
                onClick={handleSave}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
              >
                <Save className="w-4 h-4" />
                Save
              </Button>
              <Button 
                onClick={handleCancel}
                variant="outline"
                className="flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Cancel
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Budget Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
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
            <span className="font-medium text-gray-700">Daily Budget</span>
          </div>
          <div className="text-2xl font-bold text-blue-600">{formatCurrency(dailyBudget)}</div>
          <div className="text-sm text-gray-500">Per day</div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <Calculator className="w-5 h-5 text-purple-600" />
            <span className="font-medium text-gray-700">Actual Spent</span>
          </div>
          <div className={`text-2xl font-bold ${getBudgetStatusColor()}`}>
            {formatCurrency(actualCosts.totalEstimatedCost)}
          </div>
          <div className="text-sm text-gray-500">
            {actualBudgetUtilization.toFixed(1)}% of budget
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            {getBudgetStatusIcon()}
            <span className="font-medium text-gray-700">Status</span>
          </div>
          <div className={`text-lg font-bold ${getBudgetStatusColor()}`}>
            {actualBudgetUtilization <= 100 ? 'Within Budget' : 'Over Budget'}
          </div>
          <div className="text-sm text-gray-500">
            {actualRemainingBudget >= 0 ? 'Good' : 'Over budget'}
          </div>
        </div>
      </div>

      {/* Comprehensive Budget Table */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold text-gray-900">Budget Breakdown & Actual Costs</h4>
          {isEditing && (
            <Button 
              onClick={() => setShowResetWarning(true)}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Reset to Recommended
            </Button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-700">Category</th>
                <th className="text-center py-3 px-4 font-medium text-gray-700">Planned Budget</th>
                <th className="text-center py-3 px-4 font-medium text-gray-700">Daily Planned</th>
                <th className="text-center py-3 px-4 font-medium text-gray-700">Actual Spent</th>
                <th className="text-center py-3 px-4 font-medium text-gray-700">Difference</th>
                <th className="text-center py-3 px-4 font-medium text-gray-700">Status</th>
                {isEditing && <th className="text-center py-3 px-4 font-medium text-gray-700">Edit</th>}
              </tr>
            </thead>
            <tbody>
              {[
                { key: 'accommodation', label: 'Accommodation', icon: '🏨', color: 'text-green-600', bgColor: 'bg-green-50' },
                { key: 'food', label: 'Food & Dining', icon: '🍽️', color: 'text-blue-600', bgColor: 'bg-blue-50' },
                { key: 'activities', label: 'Activities', icon: '🎯', color: 'text-purple-600', bgColor: 'bg-purple-50' },
                { key: 'transport', label: 'Transport', icon: '🚗', color: 'text-orange-600', bgColor: 'bg-orange-50' },
                { key: 'shopping', label: 'Shopping', icon: '🛍️', color: 'text-red-600', bgColor: 'bg-red-50' },
                { key: 'misc', label: 'Miscellaneous', icon: '📦', color: 'text-gray-600', bgColor: 'bg-gray-50' }
              ].map((category) => {
                const plannedAmount = tempBreakdown[category.key as keyof BudgetBreakdown]
                const dailyPlanned = Math.round(plannedAmount / days)
                const actualAmount = actualCosts[`${category.key}Cost` as keyof typeof actualCosts] || 0
                const difference = actualAmount - plannedAmount
                const isOverBudget = difference > 0

                return (
                  <tr key={category.key} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{category.icon}</span>
                        <span className="font-medium text-gray-700">{category.label}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="font-semibold text-gray-900">{formatCurrency(plannedAmount)}</span>
                      <div className="text-xs text-gray-500">
                        {((plannedAmount / totalBudget) * 100).toFixed(1)}% of total
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="font-medium text-gray-700">{formatCurrency(dailyPlanned)}</span>
                      <div className="text-xs text-gray-500">per day</div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="font-semibold text-gray-900">{formatCurrency(actualAmount)}</span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`font-semibold ${isOverBudget ? 'text-red-600' : 'text-green-600'}`}>
                        {isOverBudget ? '+' : ''}{formatCurrency(Math.abs(difference))}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        isOverBudget ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {isOverBudget ? 'Over' : 'Under'}
                      </span>
                    </td>
                    {isEditing && (
                      <td className="py-3 px-4 text-center">
                        <Input
                          type="number"
                          value={plannedAmount}
                          onChange={(e) => handleInputChange(category.key as keyof BudgetBreakdown, e.target.value)}
                          className="w-20 text-center font-bold"
                          min="0"
                          max={totalBudget}
                        />
                      </td>
                    )}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Budget Summary Row */}
        <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-sm font-medium text-gray-700">Total Planned</div>
              <div className={`text-lg font-bold ${totalAllocated > totalBudget ? 'text-red-600' : 'text-green-600'}`}>
                {formatCurrency(totalAllocated)}
              </div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-700">Total Actual</div>
              <div className={`text-lg font-bold ${getBudgetStatusColor()}`}>
                {formatCurrency(actualCosts.totalEstimatedCost)}
              </div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-700">Remaining</div>
              <div className={`text-lg font-bold ${actualRemainingBudget >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(Math.abs(actualRemainingBudget))}
              </div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-700">Utilization</div>
              <div className={`text-lg font-bold ${getBudgetStatusColor()}`}>
                {actualBudgetUtilization.toFixed(1)}%
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Budget Tips */}
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-6">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <h5 className="font-medium text-blue-800 mb-2">Budget Tips</h5>
            <p className="text-sm text-blue-700">{getSavingsTip()}</p>
            <ul className="text-sm text-blue-700 mt-2 space-y-1">
              <li>• Book accommodations in advance for better rates</li>
              <li>• Use public transportation when possible</li>
              <li>• Look for free activities and attractions</li>
              <li>• Eat at local restaurants for authentic experiences</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Budget Status Alert */}
      {actualBudgetUtilization > 100 && (
        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
            <div>
              <h5 className="font-medium text-red-800 mb-2">Budget Adjustment Needed</h5>
              <p className="text-sm text-red-700 mb-3">
                You're currently {formatCurrency(Math.abs(actualRemainingBudget))} over your budget. Consider:
              </p>
              <ul className="text-sm text-red-700 space-y-1">
                <li>• Reducing accommodation costs</li>
                <li>• Choosing budget-friendly dining options</li>
                <li>• Selecting free or low-cost activities</li>
                <li>• Using public transportation</li>
                <li>• Limiting shopping expenses</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Reset Warning Modal */}
      {showResetWarning && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md mx-4">
            <h4 className="font-semibold text-gray-900 mb-3">Reset Budget Breakdown?</h4>
            <p className="text-gray-600 mb-4">
              This will reset your budget to the recommended percentages. 
              Any custom adjustments will be lost.
            </p>
            <div className="flex gap-3">
              <Button 
                onClick={resetToRecommended}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Yes, Reset
              </Button>
              <Button 
                onClick={() => setShowResetWarning(false)}
                variant="outline"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


