'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Crown, Backpack, Scale, Mountain, Sparkles, Zap } from 'lucide-react'

interface BudgetBreakdown {
  accommodation: number
  food: number
  activities: number
  transport: number
  shopping: number
  misc: number
}

interface BudgetTemplate {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  breakdown: BudgetBreakdown
  color: string
  bgColor: string
}

interface BudgetTemplatesProps {
  totalBudget: number
  onTemplateSelect: (breakdown: BudgetBreakdown) => void
  currentBreakdown?: BudgetBreakdown
}

const budgetTemplates: BudgetTemplate[] = [
  {
    id: 'luxury',
    name: 'Luxury',
    description: 'Premium experiences with high-end accommodations and fine dining',
    icon: <Crown className="w-6 h-6" />,
    breakdown: {
      accommodation: 0.45,    // 45% - Premium hotels
      food: 0.30,            // 30% - Fine dining
      activities: 0.15,      // 15% - Premium experiences
      transport: 0.08,       // 8% - Private transport
      shopping: 0.02,        // 2% - High-end shopping
      misc: 0.00             // 0% - Miscellaneous
    },
    color: 'text-amber-600',
    bgColor: 'bg-amber-50'
  },
  {
    id: 'budget',
    name: 'Budget',
    description: 'Cost-effective travel with affordable accommodations and local experiences',
    icon: <Backpack className="w-6 h-6" />,
    breakdown: {
      accommodation: 0.25,    // 25% - Hostels/budget hotels
      food: 0.35,            // 35% - Street food/local restaurants
      activities: 0.25,      // 25% - Free/low-cost activities
      transport: 0.12,       // 12% - Public transport
      shopping: 0.03,        // 3% - Minimal shopping
      misc: 0.00             // 0% - Miscellaneous
    },
    color: 'text-green-600',
    bgColor: 'bg-green-50'
  },
  {
    id: 'balanced',
    name: 'Balanced',
    description: 'Well-rounded approach with moderate spending across all categories',
    icon: <Scale className="w-6 h-6" />,
    breakdown: {
      accommodation: 0.35,    // 35% - Standard hotels
      food: 0.25,            // 25% - Mix of dining options
      activities: 0.20,      // 20% - Balanced activity mix
      transport: 0.15,       // 15% - Mix of transport options
      shopping: 0.05,        // 5% - Moderate shopping
      misc: 0.00             // 0% - Miscellaneous
    },
    color: 'text-blue-600',
    bgColor: 'bg-blue-50'
  },
  {
    id: 'adventure',
    name: 'Adventure',
    description: 'Experience-focused with emphasis on activities and outdoor adventures',
    icon: <Mountain className="w-6 h-6" />,
    breakdown: {
      accommodation: 0.20,    // 20% - Basic accommodations
      food: 0.20,            // 20% - Quick meals
      activities: 0.40,      // 40% - Adventure activities
      transport: 0.15,       // 15% - Transport to activity locations
      shopping: 0.05,        // 5% - Gear/equipment
      misc: 0.00             // 0% - Miscellaneous
    },
    color: 'text-orange-600',
    bgColor: 'bg-orange-50'
  },
  {
    id: 'cultural',
    name: 'Cultural',
    description: 'Immersion-focused with emphasis on local experiences and cultural activities',
    icon: <Sparkles className="w-6 h-6" />,
    breakdown: {
      accommodation: 0.30,    // 30% - Local accommodations
      food: 0.25,            // 25% - Local cuisine experiences
      activities: 0.30,      // 30% - Cultural activities and tours
      transport: 0.10,       // 10% - Local transport
      shopping: 0.05,        // 5% - Local crafts and souvenirs
      misc: 0.00             // 0% - Miscellaneous
    },
    color: 'text-purple-600',
    bgColor: 'bg-purple-50'
  },
  {
    id: 'fast-paced',
    name: 'Fast-Paced',
    description: 'Efficient travel with premium transport and quick access to attractions',
    icon: <Zap className="w-6 h-6" />,
    breakdown: {
      accommodation: 0.30,    // 30% - Convenient hotels
      food: 0.20,            // 20% - Quick dining options
      activities: 0.25,      // 25% - Fast-track attractions
      transport: 0.20,       // 20% - Premium transport for speed
      shopping: 0.05,        // 5% - Minimal shopping
      misc: 0.00             // 0% - Miscellaneous
    },
    color: 'text-red-600',
    bgColor: 'bg-red-50'
  }
]

export default function BudgetTemplates({ 
  totalBudget, 
  onTemplateSelect, 
  currentBreakdown 
}: BudgetTemplatesProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [showPreview, setShowPreview] = useState(false)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const calculateTemplateBudget = (template: BudgetTemplate) => {
    return {
      accommodation: Math.round(totalBudget * template.breakdown.accommodation),
      food: Math.round(totalBudget * template.breakdown.food),
      activities: Math.round(totalBudget * template.breakdown.activities),
      transport: Math.round(totalBudget * template.breakdown.transport),
      shopping: Math.round(totalBudget * template.breakdown.shopping),
      misc: Math.round(totalBudget * template.breakdown.misc)
    }
  }

  const handleTemplateSelect = (template: BudgetTemplate) => {
    setSelectedTemplate(template.id)
    setShowPreview(true)
  }

  const handleApplyTemplate = (template: BudgetTemplate) => {
    const calculatedBudget = calculateTemplateBudget(template)
    onTemplateSelect(calculatedBudget)
    setShowPreview(false)
    setSelectedTemplate(null)
  }

  const getCurrentTemplateMatch = () => {
    if (!currentBreakdown) return null
    
    // Find the template that most closely matches current breakdown
    let bestMatch = budgetTemplates[0]
    let bestScore = Infinity
    
    budgetTemplates.forEach(template => {
      const templateBudget = calculateTemplateBudget(template)
      let score = 0
      
      Object.keys(templateBudget).forEach(key => {
        const current = currentBreakdown[key as keyof BudgetBreakdown]
        const template = templateBudget[key as keyof BudgetBreakdown]
        score += Math.abs(current - template)
      })
      
      if (score < bestScore) {
        bestScore = score
        bestMatch = template
      }
    })
    
    return bestMatch
  }

  const currentTemplate = getCurrentTemplateMatch()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h3 className="text-xl font-bold text-gray-900 mb-2">Budget Templates</h3>
        <p className="text-gray-600">
          Choose from pre-defined budget allocation patterns or customize your own
        </p>
      </div>

      {/* Template Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {budgetTemplates.map((template) => {
          const calculatedBudget = calculateTemplateBudget(template)
          const isSelected = selectedTemplate === template.id
          const isCurrent = currentTemplate?.id === template.id
          
          return (
            <Card 
              key={template.id} 
              className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                isSelected ? 'ring-2 ring-blue-500' : ''
              } ${isCurrent ? 'border-blue-300 bg-blue-50' : ''}`}
              onClick={() => handleTemplateSelect(template)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${template.bgColor}`}>
                    <div className={template.color}>
                      {template.icon}
                    </div>
                  </div>
                  <div>
                    <CardTitle className={`text-lg ${template.color}`}>
                      {template.name}
                    </CardTitle>
                    {isCurrent && (
                      <span className="text-xs text-blue-600 font-medium">
                        Current Selection
                      </span>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <CardDescription className="text-sm mb-4">
                  {template.description}
                </CardDescription>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Accommodation:</span>
                    <span className="font-medium">{formatCurrency(calculatedBudget.accommodation)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Food:</span>
                    <span className="font-medium">{formatCurrency(calculatedBudget.food)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Activities:</span>
                    <span className="font-medium">{formatCurrency(calculatedBudget.activities)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Transport:</span>
                    <span className="font-medium">{formatCurrency(calculatedBudget.transport)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Shopping:</span>
                    <span className="font-medium">{formatCurrency(calculatedBudget.shopping)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Template Preview Modal */}
      {showPreview && selectedTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center gap-3 mb-4">
              <div className={`p-2 rounded-lg ${budgetTemplates.find(t => t.id === selectedTemplate)?.bgColor}`}>
                <div className={budgetTemplates.find(t => t.id === selectedTemplate)?.color}>
                  {budgetTemplates.find(t => t.id === selectedTemplate)?.icon}
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">
                  {budgetTemplates.find(t => t.id === selectedTemplate)?.name} Template
                </h4>
                <p className="text-sm text-gray-600">
                  {budgetTemplates.find(t => t.id === selectedTemplate)?.description}
                </p>
              </div>
            </div>
            
            <div className="space-y-3 mb-6">
              <div className="text-sm font-medium text-gray-700 mb-2">Budget Breakdown:</div>
              {(() => {
                const template = budgetTemplates.find(t => t.id === selectedTemplate)!
                const calculatedBudget = calculateTemplateBudget(template)
                
                return Object.entries(calculatedBudget).map(([category, amount]) => (
                  <div key={category} className="flex justify-between items-center">
                    <span className="capitalize">{category}:</span>
                    <div className="text-right">
                      <div className="font-medium">{formatCurrency(amount)}</div>
                      <div className="text-xs text-gray-500">
                        {((amount / totalBudget) * 100).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                ))
              })()}
            </div>
            
            <div className="flex gap-3">
              <Button 
                onClick={() => handleApplyTemplate(budgetTemplates.find(t => t.id === selectedTemplate)!)}
                className="flex-1"
              >
                Apply Template
              </Button>
              <Button 
                onClick={() => setShowPreview(false)}
                variant="outline"
                className="flex-1"
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

