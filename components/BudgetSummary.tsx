'use client'

import { Calculator, DollarSign, Info, TrendingUp } from 'lucide-react'

interface BudgetSummaryProps {
  totalBudget: number
  days: number
  budgetCategory: string
  budgetRecommendations: {
    dailyBudget: number
    accommodationBudget: number
    activityBudget: number
    foodBudget: number
    transportBudget: number
    shoppingBudget: number
  }
}

export default function BudgetSummary({ 
  totalBudget, 
  days, 
  budgetCategory, 
  budgetRecommendations 
}: BudgetSummaryProps) {
  const getBudgetCategoryColor = (category: string) => {
    switch (category) {
      case 'budget':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'luxury':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getBudgetCategoryLabel = (category: string) => {
    switch (category) {
      case 'budget':
        return 'Budget-Friendly'
      case 'medium':
        return 'Mid-Range'
      case 'luxury':
        return 'Luxury'
      default:
        return 'Standard'
    }
  }

  const getSavingsTip = () => {
    if (budgetCategory === 'budget') {
      return "Consider staying in hostels or budget hotels to save on accommodation costs."
    } else if (budgetCategory === 'medium') {
      return "Mix budget and mid-range options to get the best value for your money."
    } else {
      return "Your budget allows for premium experiences and luxury accommodations."
    }
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-6 rounded-xl border border-blue-200 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Calculator className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900">Trip Budget Summary</h3>
          <p className="text-gray-600">Your ${totalBudget.toLocaleString()} budget breakdown</p>
        </div>
      </div>

      {/* Budget Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-5 h-5 text-green-600" />
            <span className="font-medium text-gray-700">Total Budget</span>
          </div>
          <div className="text-2xl font-bold text-green-600">${totalBudget.toLocaleString()}</div>
          <div className="text-sm text-gray-500">For {days} days</div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <span className="font-medium text-gray-700">Daily Budget</span>
          </div>
          <div className="text-2xl font-bold text-blue-600">${budgetRecommendations.dailyBudget.toFixed(0)}</div>
          <div className="text-sm text-gray-500">Per day</div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <Info className="w-5 h-5 text-purple-600" />
            <span className="font-medium text-gray-700">Category</span>
          </div>
          <div className={`text-lg font-bold px-3 py-1 rounded-full border ${getBudgetCategoryColor(budgetCategory)}`}>
            {getBudgetCategoryLabel(budgetCategory)}
          </div>
        </div>
      </div>

      {/* Detailed Breakdown */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6">
        <h4 className="font-semibold text-gray-900 mb-3">Daily Budget Breakdown</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="text-sm font-medium text-green-700">Accommodation</div>
            <div className="text-lg font-bold text-green-600">${budgetRecommendations.accommodationBudget.toFixed(0)}</div>
            <div className="text-xs text-green-600">35% of daily</div>
          </div>
          
          <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-sm font-medium text-blue-700">Food</div>
            <div className="text-lg font-bold text-blue-600">${budgetRecommendations.foodBudget.toFixed(0)}</div>
            <div className="text-xs text-blue-600">25% of daily</div>
          </div>
          
          <div className="text-center p-3 bg-purple-50 rounded-lg border border-purple-200">
            <div className="text-sm font-medium text-purple-700">Activities</div>
            <div className="text-lg font-bold text-purple-600">${budgetRecommendations.activityBudget.toFixed(0)}</div>
            <div className="text-xs text-purple-600">20% of daily</div>
          </div>
          
          <div className="text-center p-3 bg-orange-50 rounded-lg border border-orange-200">
            <div className="text-sm font-medium text-orange-700">Transport</div>
            <div className="text-lg font-bold text-orange-600">${budgetRecommendations.transportBudget.toFixed(0)}</div>
            <div className="text-xs text-orange-600">15% of daily</div>
          </div>
          
          <div className="text-center p-3 bg-red-50 rounded-lg border border-red-200">
            <div className="text-sm font-medium text-red-700">Shopping</div>
            <div className="text-lg font-bold text-red-600">${budgetRecommendations.shoppingBudget.toFixed(0)}</div>
            <div className="text-xs text-red-600">5% of daily</div>
          </div>
        </div>
      </div>

      {/* Budget Tips */}
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
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
    </div>
  )
}
