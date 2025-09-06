'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { TrendingUp, TrendingDown, Minus, ArrowRight, DollarSign, AlertTriangle } from 'lucide-react'

interface BudgetBreakdown {
  accommodation: number
  food: number
  activities: number
  transport: number
  shopping: number
  misc: number
}

interface BudgetComparisonViewProps {
  originalBudget: BudgetBreakdown
  updatedBudget: BudgetBreakdown
  totalBudget: number
  onRevert: () => void
  onProceed: () => void
}

export default function BudgetComparisonView({
  originalBudget,
  updatedBudget,
  totalBudget,
  onRevert,
  onProceed
}: BudgetComparisonViewProps) {
  const [showDetails, setShowDetails] = useState(false)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const calculateChanges = () => {
    const changes: Record<string, { original: number; updated: number; difference: number; percentage: number }> = {}
    
    Object.keys(originalBudget).forEach(key => {
      const original = originalBudget[key as keyof BudgetBreakdown]
      const updated = updatedBudget[key as keyof BudgetBreakdown]
      const difference = updated - original
      const percentage = ((difference / original) * 100) || 0
      
      changes[key] = {
        original,
        updated,
        difference,
        percentage
      }
    })
    
    return changes
  }

  const getChangeIcon = (difference: number) => {
    if (difference > 0) return <TrendingUp className="w-4 h-4 text-green-600" />
    if (difference < 0) return <TrendingDown className="w-4 h-4 text-red-600" />
    return <Minus className="w-4 h-4 text-gray-400" />
  }

  const getChangeColor = (difference: number) => {
    if (difference > 0) return 'text-green-600'
    if (difference < 0) return 'text-red-600'
    return 'text-gray-600'
  }

  const getChangeBgColor = (difference: number) => {
    if (difference > 0) return 'bg-green-50'
    if (difference < 0) return 'bg-red-50'
    return 'bg-gray-50'
  }

  const calculateTotalChanges = () => {
    const changes = calculateChanges()
    let totalIncrease = 0
    let totalDecrease = 0
    
    Object.values(changes).forEach(change => {
      if (change.difference > 0) {
        totalIncrease += change.difference
      } else if (change.difference < 0) {
        totalDecrease += Math.abs(change.difference)
      }
    })
    
    return { totalIncrease, totalDecrease }
  }

  const changes = calculateChanges()
  const { totalIncrease, totalDecrease } = calculateTotalChanges()
  const hasChanges = Object.values(changes).some(change => change.difference !== 0)

  if (!hasChanges) {
    return (
      <Card className="bg-gray-50 border-gray-200">
        <CardContent className="p-6 text-center">
          <div className="text-gray-500 mb-2">No budget changes detected</div>
          <div className="text-sm text-gray-400">Your budget allocation remains the same</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4 text-center">
            <div className="text-sm text-blue-600 mb-1">Total Budget</div>
            <div className="text-2xl font-bold text-blue-700">{formatCurrency(totalBudget)}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4 text-center">
            <div className="text-sm text-green-600 mb-1">Budget Increases</div>
            <div className="text-2xl font-bold text-green-700">{formatCurrency(totalIncrease)}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-4 text-center">
            <div className="text-sm text-red-600 mb-1">Budget Decreases</div>
            <div className="text-2xl font-bold text-red-700">{formatCurrency(totalDecrease)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Comparison */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">Budget Comparison</CardTitle>
              <CardDescription>
                Side-by-side view of your budget changes
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDetails(!showDetails)}
            >
              {showDetails ? 'Hide Details' : 'Show Details'}
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Category Changes */}
          <div className="space-y-4">
            {Object.entries(changes).map(([category, change]) => {
              if (change.difference === 0) return null
              
              return (
                <div key={category} className={`p-4 rounded-lg border ${getChangeBgColor(change.difference)}`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {getChangeIcon(change.difference)}
                      <span className="font-medium capitalize">{category}</span>
                    </div>
                    <div className={`text-sm font-medium ${getChangeColor(change.difference)}`}>
                      {change.difference > 0 ? '+' : ''}{formatCurrency(change.difference)}
                      <span className="ml-1">
                        ({change.percentage > 0 ? '+' : ''}{change.percentage.toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="text-center">
                      <div className="text-gray-500 mb-1">Original</div>
                      <div className="font-medium">{formatCurrency(change.original)}</div>
                      <div className="text-xs text-gray-400">
                        {((change.original / totalBudget) * 100).toFixed(1)}% of total
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-gray-500 mb-1">Updated</div>
                      <div className="font-medium">{formatCurrency(change.updated)}</div>
                      <div className="text-xs text-gray-400">
                        {((change.updated / totalBudget) * 100).toFixed(1)}% of total
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Detailed Breakdown */}
          {showDetails && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h4 className="font-medium text-gray-900 mb-4">Detailed Breakdown</h4>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Original Budget */}
                <div>
                  <h5 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Original Budget Allocation
                  </h5>
                  <div className="space-y-2">
                    {Object.entries(originalBudget).map(([category, amount]) => (
                      <div key={category} className="flex justify-between items-center text-sm">
                        <span className="capitalize">{category}:</span>
                        <div className="text-right">
                          <div className="font-medium">{formatCurrency(amount)}</div>
                          <div className="text-xs text-gray-500">
                            {((amount / totalBudget) * 100).toFixed(1)}%
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Updated Budget */}
                <div>
                  <h5 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                    <ArrowRight className="w-4 h-4" />
                    Updated Budget Allocation
                  </h5>
                  <div className="space-y-2">
                    {Object.entries(updatedBudget).map(([category, amount]) => (
                      <div key={category} className="flex justify-between items-center text-sm">
                        <span className="capitalize">{category}:</span>
                        <div className="text-right">
                          <div className="font-medium">{formatCurrency(amount)}</div>
                          <div className="text-xs text-gray-500">
                            {((amount / totalBudget) * 100).toFixed(1)}%
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          onClick={onRevert}
          variant="outline"
          className="flex-1"
        >
          Revert Changes
        </Button>
        <Button
          onClick={onProceed}
          className="flex-1"
        >
          Proceed with Changes
        </Button>
      </div>

      {/* Warning if significant changes */}
      {(totalIncrease > totalBudget * 0.1 || totalDecrease > totalBudget * 0.1) && (
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <h5 className="font-medium text-yellow-800 mb-1">Significant Budget Changes Detected</h5>
                <p className="text-sm text-yellow-700">
                  You've made substantial changes to your budget allocation. This may significantly impact your travel experience and the types of activities and accommodations available.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}



