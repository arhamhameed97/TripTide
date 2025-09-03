export interface BudgetConstraints {
  totalBudget: number
  dailyBudget: number
  categoryLimits: {
    accommodation: { max: number; daily: number }
    food: { max: number; daily: number }
    activities: { max: number; daily: number }
    transport: { max: number; daily: number }
    shopping: { max: number; daily: number }
    misc: { max: number; daily: number }
  }
  overageTolerance: number // 10% = 0.1
}

export interface BudgetViolation {
  day: number
  activity?: number
  category?: string
  cost?: number
  limit?: number
  overage?: number
  percentage?: number
  type?: 'daily_overage' | 'category_overage'
  spent?: number
}

export interface BudgetValidationResult {
  isValid: boolean
  violations: BudgetViolation[]
  totalViolations: number
  warnings: string[]
}

export interface BudgetItem {
  activity: string
  estimatedCost: number
  budgetCategory: string
  budgetRemaining: number
  costValidation: 'within_budget' | 'over_budget' | 'at_limit'
  alternative?: string | null
}

export interface BudgetWarning {
  type: string
  message: string
  severity: 'warning' | 'error' | 'info'
  alternatives: string[]
}

// Calculate budget constraints based on total budget and trip duration
export const calculateBudgetConstraints = (totalBudget: number, days: number): BudgetConstraints => {
  const dailyBudget = totalBudget / days
  
  return {
    totalBudget,
    dailyBudget,
    categoryLimits: {
      accommodation: { 
        max: totalBudget * 0.35, 
        daily: (totalBudget * 0.35) / days 
      },
      food: { 
        max: totalBudget * 0.25, 
        daily: (totalBudget * 0.25) / days 
      },
      activities: { 
        max: totalBudget * 0.20, 
        daily: (totalBudget * 0.20) / days 
      },
      transport: { 
        max: totalBudget * 0.15, 
        daily: (totalBudget * 0.15) / days 
      },
      shopping: { 
        max: totalBudget * 0.05, 
        daily: (totalBudget * 0.05) / days 
      },
      misc: { 
        max: 0, 
        daily: 0 
      }
    },
    overageTolerance: 0.1 // 10% tolerance
  }
}

// Validate budget input and provide warnings
export const validateBudgetInput = (
  totalBudget: number, 
  days: number, 
  accommodations: string
): { isValid: boolean; warnings: BudgetWarning[]; alternatives: string[] } => {
  const warnings: BudgetWarning[] = []
  const alternatives: string[] = []
  
  const dailyBudget = totalBudget / days
  
  // Check if daily budget is too low for basic needs
  if (dailyBudget < 30) {
    warnings.push({
      type: 'overall_budget_low',
      message: `Your daily budget of $${dailyBudget.toFixed(0)} is very low for most destinations.`,
      severity: 'error',
      alternatives: [
        'Extend trip duration to reduce daily costs',
        'Choose budget-friendly destinations',
        'Travel during off-peak seasons',
        'Use budget accommodation and transport'
      ]
    })
    alternatives.push(...warnings[0].alternatives)
  }
  
  // Check accommodation budget
  const accommodationBudget = (totalBudget * 0.35) / days
  if (accommodationBudget < 15) {
    warnings.push({
      type: 'accommodation_budget_low',
      message: `Your accommodation budget of $${accommodationBudget.toFixed(0)}/day is limited.`,
      severity: 'warning',
      alternatives: [
        'Hostels or budget hotels',
        'Shared accommodations',
        'Alternative neighborhoods',
        'Off-peak travel dates'
      ]
    })
  }
  
  // Check food budget
  const foodBudget = (totalBudget * 0.25) / days
  if (foodBudget < 15) {
    warnings.push({
      type: 'food_budget_low',
      message: `Your food budget of $${foodBudget.toFixed(0)}/day allows for basic dining.`,
      severity: 'warning',
      alternatives: [
        'Street food and local markets',
        'Grocery stores for some meals',
        'Budget-friendly restaurants',
        'Lunch specials and happy hours'
      ]
    })
  }
  
  // Check activities budget
  const activitiesBudget = (totalBudget * 0.20) / days
  if (activitiesBudget < 10) {
    warnings.push({
      type: 'activities_budget_low',
      message: `Your activities budget of $${activitiesBudget.toFixed(0)}/day is limited.`,
      severity: 'warning',
      alternatives: [
        'Free museums and attractions',
        'Self-guided walking tours',
        'Public parks and gardens',
        'Local events and festivals'
      ]
    })
  }
  
  return {
    isValid: warnings.filter(w => w.severity === 'error').length === 0,
    warnings,
    alternatives
  }
}

// Validate individual activity against budget constraints
export const validateActivityBudget = (
  activity: BudgetItem, 
  constraints: BudgetConstraints
): { isValid: boolean; overage?: number; percentage?: number } => {
  const category = activity.budgetCategory as keyof typeof constraints.categoryLimits
  const cost = activity.estimatedCost
  const limit = constraints.categoryLimits[category]?.daily || 0
  const maxAllowed = limit * (1 + constraints.overageTolerance)
  
  if (cost > maxAllowed) {
    const overage = cost - limit
    const percentage = ((cost - limit) / limit) * 100
    return {
      isValid: false,
      overage,
      percentage
    }
  }
  
  return { isValid: true }
}

// Validate entire itinerary against budget constraints
export const validateItineraryBudget = (
  itinerary: any[], 
  constraints: BudgetConstraints
): BudgetValidationResult => {
  const violations: BudgetViolation[] = []
  const warnings: string[] = []
  
  itinerary.forEach((day, dayIndex) => {
    let dailySpending = 0
    const categorySpending: { [key: string]: number } = {
      accommodation: 0,
      food: 0,
      activities: 0,
      transport: 0,
      shopping: 0,
      misc: 0
    }
    
    day.hourlyActivities?.forEach((activity: any, activityIndex: number) => {
      const category = activity.budgetCategory
      const cost = parseFloat(activity.estimatedCost) || 0
      
      if (category && categorySpending.hasOwnProperty(category)) {
        categorySpending[category] += cost
      }
      
      dailySpending += cost
      
      // Check individual activity budget
      if (category && constraints.categoryLimits[category as keyof typeof constraints.categoryLimits]) {
        const limit = constraints.categoryLimits[category as keyof typeof constraints.categoryLimits].daily
        const maxAllowed = limit * (1 + constraints.overageTolerance)
        
        if (cost > maxAllowed) {
          violations.push({
            day: dayIndex + 1,
            activity: activityIndex + 1,
            category,
            cost,
            limit,
            overage: cost - limit,
            percentage: ((cost - limit) / limit) * 100,
            type: 'category_overage'
          })
        }
      }
    })
    
    // Check daily budget limit
    if (dailySpending > constraints.dailyBudget) {
      violations.push({
        day: dayIndex + 1,
        type: 'daily_overage',
        spent: dailySpending,
        limit: constraints.dailyBudget,
        overage: dailySpending - constraints.dailyBudget
      })
    }
    
    // Check category daily limits
    Object.entries(categorySpending).forEach(([category, spent]) => {
      const limit = constraints.categoryLimits[category as keyof typeof constraints.categoryLimits].daily
      if (spent > limit) {
        violations.push({
          day: dayIndex + 1,
          type: 'category_overage',
          category,
          spent,
          limit,
          overage: spent - limit,
          percentage: ((spent - limit) / limit) * 100
        })
      }
    })
  })
  
  return {
    isValid: violations.length === 0,
    violations,
    totalViolations: violations.length,
    warnings
  }
}

// Generate budget-friendly alternatives for overpriced items
export const generateBudgetAlternatives = (
  category: string, 
  originalCost: number, 
  budgetLimit: number
): string[] => {
  const alternatives: { [key: string]: string[] } = {
    accommodation: [
      'Hostels or budget hotels',
      'Shared accommodations',
      'Alternative neighborhoods',
      'Off-peak travel dates'
    ],
    food: [
      'Street food and local markets',
      'Grocery stores for some meals',
      'Budget-friendly restaurants',
      'Lunch specials and happy hours'
    ],
    activities: [
      'Free museums and attractions',
      'Self-guided walking tours',
      'Public parks and gardens',
      'Local events and festivals'
    ],
    transport: [
      'Public transport',
      'Walking or cycling',
      'Shared rides',
      'Budget car rentals'
    ],
    shopping: [
      'Local markets',
      'Budget stores',
      'Second-hand shops',
      'Limit souvenir purchases'
    ]
  }
  
  return alternatives[category] || ['Look for budget alternatives', 'Consider free options', 'Reduce quantity or quality']
}

// Calculate budget utilization percentage
export const calculateBudgetUtilization = (spent: number, limit: number): number => {
  return (spent / limit) * 100
}

// Get budget status indicator data
export const getBudgetStatus = (utilization: number, overBudget: boolean) => {
  if (overBudget) {
    return {
      color: 'text-red-600 bg-red-50',
      icon: 'XCircle',
      status: 'Over Budget',
      severity: 'error'
    }
  }
  
  if (utilization > 90) {
    return {
      color: 'text-yellow-600 bg-yellow-50',
      icon: 'AlertTriangle',
      status: 'Near Budget Limit',
      severity: 'warning'
    }
  }
  
  return {
    color: 'text-green-600 bg-green-50',
    icon: 'CheckCircle',
    status: 'Within Budget',
    severity: 'success'
  }
}


