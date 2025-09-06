'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ExternalLink, MapPin, Plane, Hotel, Car, Train, DollarSign, Calculator, Calendar } from 'lucide-react'
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

export default function ItineraryTable({ itinerary, tripData, onItineraryUpdate }: ItineraryTableProps) {
  const [activeView, setActiveView] = useState<'table' | 'calendar'>('table')
  const [localItinerary, setLocalItinerary] = useState<ItineraryDay[]>(itinerary)

  // Handle itinerary updates from calendar
  const handleItineraryUpdate = (updatedItinerary: ItineraryDay[]) => {
    setLocalItinerary(updatedItinerary)
    if (onItineraryUpdate) {
      onItineraryUpdate(updatedItinerary)
    }
  }

  // Calculate total costs with proper error handling
  const calculateTotalCosts = () => {
    let activitiesCost = 0
    let accommodationCost = 0
    let flightCost = 0
    let transportCost = 0

    // Safely calculate activities cost
    if (localItinerary && Array.isArray(localItinerary)) {
      localItinerary.forEach(day => {
        if (day && day.hourlyActivities && Array.isArray(day.hourlyActivities)) {
          day.hourlyActivities.forEach(activity => {
            if (activity && activity.estimatedCost) {
              const cost = parseFloat(activity.estimatedCost.replace(/[^0-9.-]+/g, '')) || 0
              activitiesCost += cost
            }
          })
        }
      })

      // Safely calculate accommodation cost
      localItinerary.forEach(day => {
        if (day && day.hotel && day.hotel.price) {
          const cost = parseFloat(day.hotel.price.replace(/[^0-9.-]+/g, '')) || 0
          accommodationCost += cost
        }
      })

      // Safely calculate flight cost
      if (localItinerary[0] && localItinerary[0].flight && localItinerary[0].flight.price) {
        const cost = parseFloat(localItinerary[0].flight.price.replace(/[^0-9.-]+/g, '')) || 0
        flightCost = cost
      }

      // Calculate transport cost (estimate based on days)
      const days = localItinerary.length
      transportCost = days * 25 // Rough estimate of $25 per day for local transport
    }

    return {
      activities: activitiesCost,
      accommodation: accommodationCost,
      flight: flightCost,
      transport: transportCost,
      total: activitiesCost + accommodationCost + flightCost + transportCost
    }
  }

  const totalCosts = calculateTotalCosts()

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

                          return (
                            <tr
                              key={index}
                              className={`hover:bg-muted/20 transition-colors ${
                                index % 2 === 0 ? 'bg-background' : 'bg-muted/10'
                              }`}
                            >
                              <td className="px-4 py-3 border-r font-medium text-sm">
                                {activity.hour || 'Time not specified'}
                              </td>
                              <td className="px-4 py-3 border-r">
                                <div className="flex items-start space-x-2">
                                  <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                                  <span className="text-sm">{activity.activity || 'Activity not specified'}</span>
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

      {/* Accommodation and Flight Details */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Accommodation Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Hotel className="w-5 h-5" />
              Accommodation
            </CardTitle>
          </CardHeader>
          <CardContent>
            {localItinerary[0]?.hotel ? (
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium">{localItinerary[0].hotel.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {localItinerary[0].hotel.price ? `$${localItinerary[0].hotel.price}/night` : 'Price not available'}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => localItinerary[0]?.hotel?.link && window.open(localItinerary[0].hotel.link, '_blank')}
                >
                  View Details <ExternalLink className="w-3 h-3 ml-1" />
                </Button>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Accommodation details not available</p>
            )}
          </CardContent>
        </Card>

        {/* Flight Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Plane className="w-5 h-5" />
              Flight
            </CardTitle>
          </CardHeader>
          <CardContent>
            {localItinerary[0]?.flight ? (
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium">{localItinerary[0].flight.airline}</h4>
                  <p className="text-sm text-muted-foreground">
                    {localItinerary[0].flight.price ? `$${localItinerary[0].flight.price}` : 'Price not available'}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => localItinerary[0]?.flight?.link && window.open(localItinerary[0].flight.link, '_blank')}
                >
                  Book Flight <ExternalLink className="w-3 h-3 ml-1" />
                </Button>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Flight details not available</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Transport Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Car className="w-5 h-5" />
            Transport Summary
          </CardTitle>
          <CardDescription>
            Getting around in {tripData.destination} - Cost estimates and recommendations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium text-sm">From {tripData.departureLocation} to {tripData.destination}</h4>
              <p className="text-sm text-muted-foreground">
                Flight options with real-time pricing from Amadeus API
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Local Transportation</h4>
              <p className="text-sm text-muted-foreground">
                AI-powered suggestions for getting around based on your budget and destination
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cost Summary Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            Trip Cost Summary
          </CardTitle>
          <CardDescription>
            Complete breakdown of estimated costs for your {tripData.days}-day trip
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-muted/50">
                  <th className="border border-border px-4 py-3 text-left font-semibold">Category</th>
                  <th className="border border-border px-4 py-3 text-left font-semibold">Description</th>
                  <th className="border border-border px-4 py-3 text-right font-semibold">Cost</th>
                </tr>
              </thead>
              <tbody>
                <tr className="hover:bg-muted/30">
                  <td className="border border-border px-4 py-3 font-medium">Activities</td>
                  <td className="border border-border px-4 py-3 text-sm text-muted-foreground">
                    Daily activities, attractions, and experiences
                  </td>
                  <td className="border border-border px-4 py-3 text-right font-medium text-green-600">
                    ${totalCosts.activities.toFixed(2)}
                  </td>
                </tr>
                <tr className="hover:bg-muted/30">
                  <td className="border border-border px-4 py-3 font-medium">Accommodation</td>
                  <td className="border border-border px-4 py-3 text-sm text-muted-foreground">
                    {tripData.days} nights at {localItinerary[0]?.hotel?.name || 'selected accommodation'}
                  </td>
                  <td className="border border-border px-4 py-3 text-right font-medium text-green-600">
                    ${totalCosts.accommodation.toFixed(2)}
                  </td>
                </tr>
                <tr className="hover:bg-muted/30">
                  <td className="border border-border px-4 py-3 font-medium">Flight</td>
                  <td className="border border-border px-4 py-3 text-sm text-muted-foreground">
                    Round-trip from {tripData.departureLocation} to {tripData.destination}
                  </td>
                  <td className="border border-border px-4 py-3 text-right font-medium text-green-600">
                    ${totalCosts.flight.toFixed(2)}
                  </td>
                </tr>
                <tr className="hover:bg-muted/30">
                  <td className="border border-border px-4 py-3 font-medium">Local Transport</td>
                  <td className="border border-border px-4 py-3 text-sm text-muted-foreground">
                    Public transport, taxis, and getting around locally
                  </td>
                  <td className="border border-border px-4 py-3 text-right font-medium text-green-600">
                    ${totalCosts.transport.toFixed(2)}
                  </td>
                </tr>
                <tr className="bg-primary/10 border-2 border-primary">
                  <td className="border border-primary px-4 py-3 font-bold text-lg" colSpan={2}>
                    Total Trip Cost
                  </td>
                  <td className="border border-primary px-4 py-3 text-right font-bold text-lg text-primary">
                    ${totalCosts.total.toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700">
              <strong>Note:</strong> These are estimated costs based on current pricing. Actual costs may vary due to seasonal changes, availability, and personal preferences. 
              Consider adding a 10-15% buffer for unexpected expenses.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
