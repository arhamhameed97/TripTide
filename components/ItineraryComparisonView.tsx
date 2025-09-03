'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  DollarSign,
  Clock,
  MapPin,
  Activity,
  RefreshCw,
  Loader2
} from 'lucide-react'

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
}

interface ItineraryComparisonViewProps {
  originalItinerary: ItineraryDay[]
  newItinerary: ItineraryDay[]
  budgetComparison: {
    original: any
    updated: any
    changes: any
  }
  onAcceptNew: () => void
  onKeepOriginal: () => void
  onRegenerate: () => void
  isRegenerating?: boolean
}

export default function ItineraryComparisonView({
  originalItinerary,
  newItinerary,
  budgetComparison,
  onAcceptNew,
  onKeepOriginal,
  onRegenerate,
  isRegenerating = false
}: ItineraryComparisonViewProps) {
  const [activeTab, setActiveTab] = useState('comparison')
  const [selectedDay, setSelectedDay] = useState(1)

  const formatCurrency = (cost: string) => {
    // Extract numeric value from cost string
    const numericValue = cost.replace(/[^\d.-]/g, '')
    if (numericValue) {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(parseFloat(numericValue))
    }
    return cost
  }

  const calculateDailyCost = (activities: HourlyActivity[]) => {
    let total = 0
    activities.forEach(activity => {
      const cost = parseFloat(activity.estimatedCost.replace(/[^\d.-]/g, '')) || 0
      total += cost
    })
    return total
  }

  const getActivityChanges = (day: number) => {
    const originalDay = originalItinerary.find(d => d.day === day)
    const newDay = newItinerary.find(d => d.day === day)
    
    if (!originalDay || !newDay) return { added: [], removed: [], modified: [] }
    
    const originalActivities = new Map(originalDay.hourlyActivities.map(a => [a.hour, a]))
    const newActivities = new Map(newDay.hourlyActivities.map(a => [a.hour, a]))
    
    const added: HourlyActivity[] = []
    const removed: HourlyActivity[] = []
    const modified: { original: HourlyActivity; new: HourlyActivity }[] = []
    
    // Find added and modified activities
    newActivities.forEach((newActivity, hour) => {
      const originalActivity = originalActivities.get(hour)
      if (!originalActivity) {
        added.push(newActivity)
      } else if (
        originalActivity.activity !== newActivity.activity ||
        originalActivity.location !== newActivity.location ||
        originalActivity.estimatedCost !== newActivity.estimatedCost
      ) {
        modified.push({ original: originalActivity, new: newActivity })
      }
    })
    
    // Find removed activities
    originalActivities.forEach((originalActivity, hour) => {
      if (!newActivities.has(hour)) {
        removed.push(originalActivity)
      }
    })
    
    return { added, removed, modified }
  }

  const getChangeType = (activity: HourlyActivity, changeType: 'added' | 'removed' | 'modified') => {
    switch (changeType) {
      case 'added':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Added</Badge>
      case 'removed':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Removed</Badge>
      case 'modified':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Modified</Badge>
      default:
        return null
    }
  }

  const renderActivity = (activity: HourlyActivity, changeType?: 'added' | 'removed' | 'modified') => {
    return (
      <div className={`p-3 rounded-lg border ${
        changeType === 'added' ? 'bg-green-50 border-green-200' :
        changeType === 'removed' ? 'bg-red-50 border-red-200' :
        changeType === 'modified' ? 'bg-blue-50 border-blue-200' :
        'bg-white border-gray-200'
      }`}>
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-500" />
            <span className="font-medium text-sm">{activity.hour}</span>
            {changeType && getChangeType(activity, changeType)}
          </div>
          <div className="flex items-center gap-1 text-sm font-medium text-green-600">
            <DollarSign className="w-3 h-3" />
            {formatCurrency(activity.estimatedCost)}
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-start gap-2">
            <Activity className="w-4 h-4 text-blue-500 mt-0.5" />
            <span className="text-sm">{activity.activity}</span>
          </div>
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 text-red-500 mt-0.5" />
            <span className="text-sm text-gray-600">{activity.location}</span>
          </div>
        </div>
      </div>
    )
  }

  const renderDayComparison = (day: number) => {
    const originalDay = originalItinerary.find(d => d.day === day)
    const newDay = newItinerary.find(d => d.day === day)
    const changes = getActivityChanges(day)
    
    if (!originalDay || !newDay) return null
    
    const originalCost = calculateDailyCost(originalDay.hourlyActivities)
    const newCost = calculateDailyCost(newDay.hourlyActivities)
    const costDifference = newCost - originalCost
    
    return (
      <div className="space-y-4">
        {/* Day Header with Cost Comparison */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold">Day {day}</h3>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-sm text-gray-600">Original Cost</div>
                <div className="font-medium">{formatCurrency(`$${originalCost}`)}</div>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400" />
              <div className="text-center">
                <div className="text-sm text-gray-600">New Cost</div>
                <div className={`font-medium ${costDifference > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {formatCurrency(`$${newCost}`)}
                </div>
              </div>
              <div className={`text-sm font-medium ${
                costDifference > 0 ? 'text-red-600' : costDifference < 0 ? 'text-green-600' : 'text-gray-600'
              }`}>
                {costDifference > 0 ? '+' : ''}{formatCurrency(`$${costDifference}`)}
              </div>
            </div>
          </div>
          
          {/* Transport Suggestion Changes */}
          {originalDay.transportSuggestion !== newDay.transportSuggestion && (
            <div className="bg-blue-50 p-3 rounded border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">Transport Updated</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="text-gray-600 mb-1">Original:</div>
                  <div className="text-gray-800">{originalDay.transportSuggestion}</div>
                </div>
                <div>
                  <div className="text-gray-600 mb-1">Updated:</div>
                  <div className="text-gray-800">{newDay.transportSuggestion}</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Activity Changes Summary */}
        {(changes.added.length > 0 || changes.removed.length > 0 || changes.modified.length > 0) && (
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <h4 className="font-medium text-yellow-800 mb-3">Changes Summary</h4>
            <div className="grid grid-cols-3 gap-4 text-center text-sm">
              <div>
                <div className="text-2xl font-bold text-green-600">{changes.added.length}</div>
                <div className="text-green-700">Added</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">{changes.removed.length}</div>
                <div className="text-red-700">Removed</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">{changes.modified.length}</div>
                <div className="text-blue-700">Modified</div>
              </div>
            </div>
          </div>
        )}

        {/* Activities Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Original Itinerary */}
          <div>
            <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Original Itinerary
            </h4>
            <div className="space-y-3">
              {originalDay.hourlyActivities.map((activity, index) => {
                const isRemoved = changes.removed.some(a => a.hour === activity.hour)
                const isModified = changes.modified.some(m => m.original.hour === activity.hour)
                
                if (isRemoved) {
                  return renderActivity(activity, 'removed')
                } else if (isModified) {
                  return renderActivity(activity, 'modified')
                } else {
                  return renderActivity(activity)
                }
              })}
            </div>
          </div>

          {/* New Itinerary */}
          <div>
            <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
              <ArrowRight className="w-4 h-4" />
              Updated Itinerary
            </h4>
            <div className="space-y-3">
              {newDay.hourlyActivities.map((activity, index) => {
                const isAdded = changes.added.some(a => a.hour === activity.hour)
                const isModified = changes.modified.some(m => m.new.hour === activity.hour)
                
                if (isAdded) {
                  return renderActivity(activity, 'added')
                } else if (isModified) {
                  return renderActivity(activity, 'modified')
                } else {
                  return renderActivity(activity)
                }
              })}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Itinerary Comparison</h2>
        <p className="text-gray-600">
          Compare your original itinerary with the regenerated version based on budget changes
        </p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="comparison">Day-by-Day Comparison</TabsTrigger>
          <TabsTrigger value="summary">Change Summary</TabsTrigger>
          <TabsTrigger value="budget">Budget Impact</TabsTrigger>
        </TabsList>

        {/* Day-by-Day Comparison Tab */}
        <TabsContent value="comparison" className="space-y-6">
          {/* Day Selector */}
          <div className="flex flex-wrap gap-2 justify-center">
            {originalItinerary.map((day) => (
              <Button
                key={day.day}
                variant={selectedDay === day.day ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedDay(day.day)}
              >
                Day {day.day}
              </Button>
            ))}
          </div>

          {/* Day Comparison */}
          {renderDayComparison(selectedDay)}
        </TabsContent>

        {/* Change Summary Tab */}
        <TabsContent value="summary" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Overall Changes Summary</CardTitle>
              <CardDescription>
                Overview of all changes across your itinerary
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {originalItinerary.map((day) => {
                  const changes = getActivityChanges(day.day)
                  const totalChanges = changes.added.length + changes.removed.length + changes.modified.length
                  
                  return (
                    <div key={day.day} className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-blue-600 mb-1">Day {day.day}</div>
                      <div className="text-sm text-gray-600 mb-2">
                        {totalChanges} change{totalChanges !== 1 ? 's' : ''}
                      </div>
                      <div className="space-y-1 text-xs">
                        <div className="text-green-600">+{changes.added.length} added</div>
                        <div className="text-red-600">-{changes.removed.length} removed</div>
                        <div className="text-blue-600">~{changes.modified.length} modified</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Budget Impact Tab */}
        <TabsContent value="budget" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Budget Impact Analysis</CardTitle>
              <CardDescription>
                How your budget changes affect the overall itinerary
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h4 className="font-medium text-blue-800 mb-2">Original Budget Allocation</h4>
                    {Object.entries(budgetComparison.original).map(([category, amount]) => (
                      <div key={category} className="flex justify-between text-sm">
                        <span className="capitalize">{category}:</span>
                        <span className="font-medium">{formatCurrency(`$${amount}`)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <h4 className="font-medium text-green-800 mb-2">Updated Budget Allocation</h4>
                    {Object.entries(budgetComparison.updated).map(([category, amount]) => (
                      <div key={category} className="flex justify-between text-sm">
                        <span className="capitalize">{category}:</span>
                        <span className="font-medium">{formatCurrency(`$${amount}`)}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <h4 className="font-medium text-yellow-800 mb-2">Key Changes</h4>
                  <div className="space-y-2">
                    {Object.entries(budgetComparison.changes).map(([category, change]) => {
                      const changeValue = change as number
                      if (changeValue === 0) return null
                      return (
                        <div key={category} className="flex justify-between text-sm">
                          <span className="capitalize">{category}:</span>
                          <span className={`font-medium ${changeValue > 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {changeValue > 0 ? '+' : ''}{formatCurrency(`$${changeValue}`)}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
        <Button
          onClick={onKeepOriginal}
          variant="outline"
          className="flex-1"
        >
          Keep Original Itinerary
        </Button>
        <Button
          onClick={onRegenerate}
          variant="outline"
          className="flex-1"
          disabled={isRegenerating}
        >
          {isRegenerating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Regenerating...
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4 mr-2" />
              Regenerate Again
            </>
          )}
        </Button>
        <Button
          onClick={onAcceptNew}
          className="flex-1"
        >
          Accept New Itinerary
        </Button>
      </div>
    </div>
  )
}

