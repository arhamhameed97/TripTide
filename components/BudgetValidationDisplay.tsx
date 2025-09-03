"use client"

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, XCircle, CheckCircle, Info } from 'lucide-react'
import { BudgetWarning, BudgetViolation, getBudgetStatus } from '@/lib/budgetValidation'

interface BudgetValidationDisplayProps {
  dailyBudget: number
  budgetUtilization: number
  overBudgetItems: BudgetViolation[]
  budgetWarnings: BudgetWarning[]
  totalBudget: number
  days: number
}

const BudgetWarningItem = ({ warning }: { warning: BudgetWarning }) => {
  const getIcon = () => {
    switch (warning.severity) {
      case 'error':
        return <XCircle className="w-5 h-5 text-red-600" />
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />
      case 'info':
        return <Info className="w-5 h-5 text-blue-600" />
      default:
        return <Info className="w-5 h-5 text-gray-600" />
    }
  }

  const getSeverityColor = () => {
    switch (warning.severity) {
      case 'error':
        return 'border-red-200 bg-red-50'
      case 'warning':
        return 'border-yellow-200 bg-yellow-50'
      case 'info':
        return 'border-blue-200 bg-blue-50'
      default:
        return 'border-gray-200 bg-gray-50'
    }
  }

  const getSeverityTextColor = () => {
    switch (warning.severity) {
      case 'error':
        return 'text-red-800'
      case 'warning':
        return 'text-yellow-800'
      case 'info':
        return 'text-blue-800'
      default:
        return 'text-gray-800'
    }
  }

  return (
    <div className={`border rounded-lg p-3 mb-3 ${getSeverityColor()}`}>
      <div className="flex items-start gap-3">
        {getIcon()}
        <div className="flex-1">
          <p className={`font-medium ${getSeverityTextColor()}`}>
            {warning.message}
          </p>
          {warning.alternatives.length > 0 && (
            <div className="mt-2">
              <p className={`text-sm font-medium ${getSeverityTextColor()}`}>
                Consider these alternatives:
              </p>
              <ul className="mt-1 space-y-1">
                {warning.alternatives.map((alternative, index) => (
                  <li key={index} className={`text-sm ${getSeverityTextColor()} flex items-center gap-2`}>
                    <span className="w-1.5 h-1.5 bg-current rounded-full"></span>
                    {alternative}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const BudgetViolationItem = ({ violation }: { violation: BudgetViolation }) => {
  if (violation.type === 'daily_overage') {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-2">
        <div className="flex items-center gap-2">
          <XCircle className="w-5 h-5 text-red-600" />
          <div>
            <p className="font-medium text-red-800">
              Day {violation.day}: Daily Budget Exceeded
            </p>
            <p className="text-sm text-red-700">
              Spent: ${violation.spent} | Limit: ${violation.limit} | 
              Over: ${violation.overage}
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-2">
      <div className="flex items-center gap-2">
        <XCircle className="w-5 h-5 text-red-600" />
        <div>
          <p className="font-medium text-red-800">
            Day {violation.day}, Activity {violation.activity}: {violation.category} Over Budget
          </p>
          <p className="text-sm text-red-700">
            Cost: ${violation.cost} | Limit: ${violation.limit} | 
            Over: ${violation.overage} ({violation.percentage?.toFixed(1)}%)
          </p>
        </div>
      </div>
    </div>
  )
}

const BudgetStatusIndicator = ({ utilization, overBudget }: { utilization: number; overBudget: boolean }) => {
  const status = getBudgetStatus(utilization, overBudget)
  
  // Debug logging
  console.log('BudgetStatusIndicator Debug:', {
    utilization,
    overBudget,
    status
  })
  
  const getIcon = () => {
    switch (status.icon) {
      case 'XCircle':
        return <XCircle className="w-6 h-6" />
      case 'AlertTriangle':
        return <AlertTriangle className="w-6 h-6" />
      case 'CheckCircle':
        return <CheckCircle className="w-6 h-6" />
      default:
        return <Info className="w-6 h-6" />
    }
  }

  return (
    <div className={`p-4 rounded-lg border ${status.color}`}>
      <div className="flex items-center gap-3">
        {getIcon()}
        <div>
          <p className="font-semibold text-lg">
            {status.status}
          </p>
          <p className="text-sm opacity-80">
            {utilization.toFixed(1)}% of daily budget used
          </p>
        </div>
      </div>
      
      {/* Budget utilization bar */}
      <div className="mt-3">
        <div className="flex justify-between text-sm mb-1">
          <span>Budget Usage</span>
          <span>{utilization.toFixed(1)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${
              overBudget 
                ? 'bg-red-500' 
                : utilization > 90 
                  ? 'bg-yellow-500' 
                  : 'bg-green-500'
            }`}
            style={{ width: `${Math.min(utilization, 100)}%` }}
          ></div>
        </div>
      </div>
    </div>
  )
}

export default function BudgetValidationDisplay({
  dailyBudget,
  budgetUtilization,
  overBudgetItems,
  budgetWarnings,
  totalBudget,
  days
}: BudgetValidationDisplayProps) {
  // Calculate total budget utilization (same logic as ComprehensiveBudgetSummary)
  const totalSpent = dailyBudget * days * (budgetUtilization / 100)
  const totalBudgetUtilization = (totalSpent / totalBudget) * 100
  
  // Use total budget utilization for consistency with ComprehensiveBudgetSummary
  const overBudget = overBudgetItems.length > 0 || totalBudgetUtilization > 100
  const hasWarnings = budgetWarnings.length > 0
  const hasViolations = overBudgetItems.length > 0
  
  // Debug logging
  console.log('BudgetValidationDisplay Debug:', {
    dailyBudget,
    budgetUtilization,
    totalSpent,
    totalBudgetUtilization,
    overBudgetItems: overBudgetItems.length,
    budgetWarnings: budgetWarnings.length,
    totalBudget,
    days,
    overBudget,
    hasWarnings,
    hasViolations
  })

  return (
    <div className="space-y-4">
      {/* Budget Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>Budget Status</span>
            {overBudget && (
              <Badge variant="destructive">Over Budget</Badge>
            )}
            {!overBudget && hasWarnings && (
              <Badge variant="secondary">Warnings</Badge>
            )}
            {!overBudget && !hasWarnings && (
              <Badge variant="default">On Track</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <BudgetStatusIndicator utilization={budgetUtilization} overBudget={overBudget} />
            
            <div className="space-y-3">
              <div className="text-sm">
                <p><strong>Total Budget:</strong> ${totalBudget.toLocaleString()}</p>
                <p><strong>Trip Duration:</strong> {days} days</p>
                <p><strong>Daily Budget:</strong> ${dailyBudget.toFixed(0)}</p>
                <p><strong>Current Usage:</strong> ${(dailyBudget * budgetUtilization / 100).toFixed(0)}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Budget Warnings */}
      {hasWarnings && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
              Budget Warnings & Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {budgetWarnings.map((warning, index) => (
                <BudgetWarningItem key={index} warning={warning} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Budget Violations */}
      {hasViolations && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-600" />
              Budget Violations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {overBudgetItems.map((violation, index) => (
                <BudgetViolationItem key={index} violation={violation} />
              ))}
            </div>
            
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">
                <strong>Action Required:</strong> These budget violations need to be addressed. 
                Consider adjusting your budget allocation or choosing more budget-friendly alternatives.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Budget Tips */}
      {!overBudget && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="w-5 h-5 text-blue-600" />
              Budget Management Tips
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-medium mb-2">Accommodation (35%)</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>• Consider hostels for budget travel</li>
                  <li>• Book during off-peak seasons</li>
                  <li>• Look for alternative neighborhoods</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Food (25%)</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>• Mix street food with restaurants</li>
                  <li>• Visit local markets</li>
                  <li>• Use grocery stores for some meals</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Activities (20%)</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>• Focus on free attractions</li>
                  <li>• Self-guided walking tours</li>
                  <li>• Public parks and gardens</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Transport (15%)</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>• Use public transportation</li>
                  <li>• Walk when possible</li>
                  <li>• Consider shared rides</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
