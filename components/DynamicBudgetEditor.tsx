'use client'

import { useState, useEffect } from 'react'
import { Calculator, DollarSign, TrendingUp, Edit3, Save, X, RefreshCw, AlertTriangle, CheckCircle, XCircle, Palette, Lock, Unlock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import BudgetTemplates from './BudgetTemplates'

interface BudgetCategory {
  name: string
  color: string
  bgColor: string
  borderColor: string
  icon: string
}

interface BudgetBreakdown {
  accommodation: number
  food: number
  activities: number
  transport: number
  shopping: number
  misc: number
}

interface DynamicBudgetEditorProps {
  totalBudget: number
  days: number
  onBudgetUpdate: (newBreakdown: BudgetBreakdown) => void
  showTemplates?: boolean
  onRegenerateItinerary?: (updatedBudget: BudgetBreakdown) => void
}

const budgetCategories: BudgetCategory[] = [
  { name: 'Accommodation', color: 'text-green-600', bgColor: 'bg-green-50', borderColor: 'border-green-200', icon: '🏨' },
  { name: 'Food & Dining', color: 'text-blue-600', bgColor: 'bg-blue-50', borderColor: 'border-blue-200', icon: '🍽️' },
  { name: 'Activities', color: 'text-purple-600', bgColor: 'bg-purple-50', borderColor: 'border-purple-200', icon: '🎯' },
  { name: 'Transport', color: 'text-orange-600', bgColor: 'bg-orange-50', borderColor: 'border-orange-200', icon: '🚗' },
  { name: 'Shopping', color: 'text-red-600', bgColor: 'bg-red-50', borderColor: 'border-red-200', icon: '🛍️' },
  { name: 'Miscellaneous', color: 'text-gray-600', bgColor: 'bg-gray-50', borderColor: 'border-gray-200', icon: '📦' }
]

export default function DynamicBudgetEditor({ 
  totalBudget, 
  days, 
  onBudgetUpdate 
}: DynamicBudgetEditorProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [budgetBreakdown, setBudgetBreakdown] = useState<BudgetBreakdown>({
    accommodation: Math.round(totalBudget * 0.35),
    food: Math.round(totalBudget * 0.25),
    activities: Math.round(totalBudget * 0.20),
    transport: Math.round(totalBudget * 0.15),
    shopping: Math.round(totalBudget * 0.05),
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
    onBudgetUpdate(tempBreakdown)
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
    if (budgetUtilization <= 80) return 'text-green-600'
    if (budgetUtilization <= 100) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getBudgetStatusIcon = () => {
    if (budgetUtilization <= 80) return <CheckCircle className="w-5 h-5 text-green-600" />
    if (budgetUtilization <= 100) return <AlertTriangle className="w-5 h-5 text-yellow-600" />
    return <XCircle className="w-5 h-5 text-red-600" />
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6 rounded-xl border border-blue-200 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Calculator className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Dynamic Budget Editor</h3>
            <p className="text-gray-600">Customize your budget breakdown</p>
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

      {/* Budget Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-5 h-5 text-blue-600" />
            <span className="font-medium text-gray-700">Total Budget</span>
          </div>
          <div className="text-2xl font-bold text-blue-600">{formatCurrency(totalBudget)}</div>
          <div className="text-sm text-gray-500">For {days} days</div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-purple-600" />
            <span className="font-medium text-gray-700">Daily Budget</span>
          </div>
          <div className="text-2xl font-bold text-purple-600">{formatCurrency(dailyBudget)}</div>
          <div className="text-sm text-gray-500">Per day</div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            {getBudgetStatusIcon()}
            <span className="font-medium text-gray-700">Status</span>
          </div>
          <div className={`text-lg font-bold ${getBudgetStatusColor()}`}>
            {isOverBudget ? 'Over Budget' : 'Within Budget'}
          </div>
          <div className="text-sm text-gray-500">
            {budgetUtilization.toFixed(1)}% allocated
          </div>
        </div>
      </div>

      {/* Budget Breakdown Editor */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold text-gray-900">Budget Breakdown</h4>
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {budgetCategories.map((category) => (
            <div key={category.name} className={`p-4 rounded-lg border ${category.bgColor} ${category.borderColor}`}>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">{category.icon}</span>
                <Label className={`font-medium ${category.color}`}>
                  {category.name}
                </Label>
              </div>
              
              {isEditing ? (
                <div className="space-y-2">
                  <Input
                    type="number"
                    value={tempBreakdown[category.name.toLowerCase().replace(/\s+/g, '') as keyof BudgetBreakdown] || 0}
                    onChange={(e) => handleInputChange(
                      category.name.toLowerCase().replace(/\s+/g, '') as keyof BudgetBreakdown, 
                      e.target.value
                    )}
                    className="text-center font-bold"
                    min="0"
                    max={totalBudget}
                  />
                  <div className="text-xs text-gray-500 text-center">
                    {tempBreakdown[category.name.toLowerCase().replace(/\s+/g, '') as keyof BudgetBreakdown] > 0 
                      ? `${((tempBreakdown[category.name.toLowerCase().replace(/\s+/g, '') as keyof BudgetBreakdown] / totalBudget) * 100).toFixed(1)}% of budget`
                      : 'Not allocated'
                    }
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <div className={`text-xl font-bold ${category.color}`}>
                    {formatCurrency(budgetBreakdown[category.name.toLowerCase().replace(/\s+/g, '') as keyof BudgetBreakdown] || 0)}
                  </div>
                  <div className="text-xs text-gray-500">
                    {budgetBreakdown[category.name.toLowerCase().replace(/\s+/g, '') as keyof BudgetBreakdown] > 0 
                      ? `${((budgetBreakdown[category.name.toLowerCase().replace(/\s+/g, '') as keyof BudgetBreakdown] / totalBudget) * 100).toFixed(1)}% of budget`
                      : 'Not allocated'
                    }
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Budget Summary */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-sm font-medium text-gray-700">Total Allocated</div>
              <div className={`text-lg font-bold ${totalAllocated > totalBudget ? 'text-red-600' : 'text-green-600'}`}>
                {formatCurrency(totalAllocated)}
              </div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-700">Remaining</div>
              <div className={`text-lg font-bold ${isOverBudget ? 'text-red-600' : 'text-green-600'}`}>
                {formatCurrency(Math.abs(remainingBudget))}
              </div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-700">Utilization</div>
              <div className={`text-lg font-bold ${getBudgetStatusColor()}`}>
                {budgetUtilization.toFixed(1)}%
              </div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-700">Status</div>
              <div className={`text-sm font-bold ${isOverBudget ? 'text-red-600' : 'text-green-600'}`}>
                {isOverBudget ? 'Over Budget' : 'Good'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Budget Tips */}
      {isOverBudget && (
        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
            <div>
              <h5 className="font-medium text-red-800 mb-2">Budget Adjustment Needed</h5>
              <p className="text-sm text-red-700 mb-3">
                You're currently {formatCurrency(Math.abs(remainingBudget))} over your budget. Consider:
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
