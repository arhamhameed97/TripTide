'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { MapPin, Train, Calculator, Calendar, DollarSign, Sparkles } from 'lucide-react'
import ItineraryCalendar from './ItineraryCalendar'

interface HourlyActivity {
  hour: string
  activity: string
  location: string
  estimatedCost: string
  coordinates?: [number, number] // Add coordinates field
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
  transport?: {
    method: string[]
    cost: string
    tip: string
  }
}

interface ItineraryTableProps {
  itinerary: ItineraryDay[]
  originalItinerary?: ItineraryDay[]
  tripData: {
    name: string
    departureLocation: string
    destination: string
    days: number
    startDate: string
    endDate: string
  }
  onItineraryUpdate?: (updatedItinerary: ItineraryDay[]) => void
}

export default function ItineraryTable({ itinerary, originalItinerary, tripData, onItineraryUpdate }: ItineraryTableProps) {
  const [activeView, setActiveView] = useState<'table' | 'calendar'>('table')
  const [localItinerary, setLocalItinerary] = useState<ItineraryDay[]>(itinerary)

  // Sync local itinerary with prop changes (for AI updates)
  useEffect(() => {
    setLocalItinerary(itinerary)
    console.log('ItineraryTable: Itinerary updated', { 
      itineraryLength: itinerary.length, 
      originalLength: originalItinerary?.length,
      hasOriginal: !!originalItinerary 
    })
  }, [itinerary, originalItinerary])

  // Function to check if an activity has been modified
  const isActivityModified = (dayIndex: number, activityIndex: number) => {
    if (!originalItinerary || !originalItinerary[dayIndex] || !originalItinerary[dayIndex].hourlyActivities) {
      return false
    }
    
    const originalActivity = originalItinerary[dayIndex].hourlyActivities[activityIndex]
    const currentActivity = localItinerary[dayIndex]?.hourlyActivities[activityIndex]
    
    if (!originalActivity || !currentActivity) {
      return false
    }
    
    // Check if any key properties have changed
    const isChanged = (
      originalActivity.activity !== currentActivity.activity ||
      originalActivity.location !== currentActivity.location ||
      originalActivity.estimatedCost !== currentActivity.estimatedCost ||
      originalActivity.hour !== currentActivity.hour
    )
    
    // Debug logging
    if (isChanged) {
      console.log('Activity modified:', {
        dayIndex,
        activityIndex,
        original: originalActivity,
        current: currentActivity
      })
    }
    
    return isChanged
  }

  // Handle itinerary updates from calendar
  const handleItineraryUpdate = (updatedItinerary: ItineraryDay[]) => {
    setLocalItinerary(updatedItinerary)
    if (onItineraryUpdate) {
      onItineraryUpdate(updatedItinerary)
    }
  }

  // Check if itinerary data is valid
  if (!localItinerary || !Array.isArray(localItinerary) || localItinerary.length === 0) {
    return (
      <div className="space-y-6">
        <Card className="bg-gradient-to-r from-primary to-primary/80 text-white">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">
              {tripData.name}'s {tripData.days}-Day Trip
            </CardTitle>
            <CardDescription className="text-white/90">
              From {tripData.departureLocation} to {tripData.destination}
            </CardDescription>
          </CardHeader>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-red-600">Invalid Itinerary Data</CardTitle>
            <CardDescription>
              The itinerary data is missing or corrupted. Please try generating a new itinerary.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => window.location.href = '/'}>
              Plan Another Trip
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Trip Summary Card */}
      <Card className="bg-gradient-to-r from-primary to-primary/80 text-white">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            {tripData.name}'s {tripData.days}-Day Trip
          </CardTitle>
          <CardDescription className="text-white/90">
            From {tripData.departureLocation} to {tripData.destination}
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Itinerary Display with Tabs */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Hourly Itinerary</CardTitle>
          <CardDescription>
            View your itinerary in table format or drag-and-drop calendar view
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeView} onValueChange={(value) => setActiveView(value as 'table' | 'calendar')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="table" className="flex items-center gap-2">
                <Calculator className="w-4 h-4" />
                Table View
              </TabsTrigger>
              <TabsTrigger value="calendar" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Calendar View
              </TabsTrigger>
            </TabsList>

            <TabsContent value="table" className="space-y-6">
              {/* Legend for modified activities */}
              {originalItinerary && originalItinerary.length > 0 && (
                <div className="flex items-center gap-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-blue-500" />
                    <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                      AI Updated Activities
                    </span>
                  </div>
                  <div className="text-xs text-blue-600 dark:text-blue-400">
                    Activities highlighted with sparkle icons and blue background have been modified based on your feedback
                  </div>
                </div>
              )}
              
              <div className="space-y-6">
                {localItinerary.map((day) => {
              // Check if day data is valid
              if (!day || !day.hourlyActivities || !Array.isArray(day.hourlyActivities)) {
                return (
                  <div key={day?.day || 'unknown'} className="border rounded-lg overflow-hidden">
                    <div className="bg-muted/50 px-4 py-3 border-b">
                      <h3 className="font-semibold text-lg text-primary">Day {day?.day || 'Unknown'}</h3>
                    </div>
                    <div className="px-4 py-6 text-center text-muted-foreground">
                      <p>Day data is incomplete or missing</p>
                    </div>
                  </div>
                )
              }

              return (
                <div key={day.day} className="border rounded-lg overflow-hidden">
                  <div className="bg-muted/50 px-4 py-3 border-b">
                    <h3 className="font-semibold text-lg text-primary">Day {day.day}</h3>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-muted/30">
                          <th className="px-4 py-3 text-left font-semibold text-sm border-r">Time</th>
                          <th className="px-4 py-3 text-left font-semibold text-sm border-r">Activity</th>
                          <th className="px-4 py-3 text-left font-semibold text-sm border-r">Location</th>
                          <th className="px-4 py-3 text-left font-semibold text-sm">Estimated Cost</th>
                        </tr>
                      </thead>
                      <tbody>
                        {day.hourlyActivities.map((activity, index) => {
                          // Check if activity data is valid
                          if (!activity) {
                            return (
                              <tr key={`invalid-${index}`} className="bg-red-50">
                                <td colSpan={4} className="px-4 py-3 text-center text-red-600 text-sm">
                                  Invalid activity data
                                </td>
                              </tr>
                            )
                          }

                          const isModified = isActivityModified(day.day - 1, index)

                          return (
                            <tr
                              key={index}
                              className={`hover:bg-muted/20 transition-colors ${
                                isModified 
                                  ? 'bg-gradient-to-r from-blue-50 to-purple-50 border-l-4 border-blue-400 dark:from-blue-900/20 dark:to-purple-900/20 dark:border-blue-500' 
                                  : index % 2 === 0 ? 'bg-background' : 'bg-muted/10'
                              }`}
                            >
                              <td className="px-4 py-3 border-r font-medium text-sm">
                                {activity.hour || 'Time not specified'}
                              </td>
                              <td className="px-4 py-3 border-r">
                                <div className="flex items-start space-x-2">
                                  <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                                  <span className="text-sm">{activity.activity || 'Activity not specified'}</span>
                                  {isModified && (
                                    <Sparkles className="w-3 h-3 text-blue-500 mt-1 flex-shrink-0" title="AI Updated" />
                                  )}
                                </div>
                              </td>
                              <td className="px-4 py-3 border-r text-sm text-muted-foreground">
                                {activity.location || 'Location not specified'}
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center space-x-2">
                                  <DollarSign className="w-4 h-4 text-green-600" />
                                  <span className="text-sm font-medium text-green-600">
                                    {activity.estimatedCost || 'Cost not specified'}
                                  </span>
                                </div>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Transport Suggestion for the day */}
                  {day.transportSuggestion && (
                    <div className="px-4 py-3 bg-blue-50 border-t">
                      <div className="flex items-center space-x-2">
                        <Train className="w-4 h-4 text-blue-600" />
                        <span className="text-sm text-blue-700">
                          💡 {day.transportSuggestion}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
              </div>
            </TabsContent>

            <TabsContent value="calendar">
              <ItineraryCalendar 
                itinerary={localItinerary} 
                tripData={tripData}
                onItineraryUpdate={handleItineraryUpdate}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>


    </div>
  )
}
