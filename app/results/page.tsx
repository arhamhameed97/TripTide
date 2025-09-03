'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import ItineraryTable from '@/components/ItineraryTable'
import ComprehensiveBudgetSummary from '@/components/ComprehensiveBudgetSummary'
import BudgetValidationDisplay from '@/components/BudgetValidationDisplay'
import WeatherForecast from '@/components/WeatherForecast'
import LocalNews from '@/components/LocalNews'
import AccommodationPanel from '@/components/AccommodationPanel'
import TripMap from '@/components/TripMap'
import BookingIntegration from '@/components/BookingIntegration'
import LocalEventsCalendar from '@/components/LocalEventsCalendar'
import AnalyticsDashboard from '@/components/AnalyticsDashboard'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, RefreshCw, Calendar } from 'lucide-react'
import { BudgetWarning, BudgetViolation } from '@/lib/budgetValidation'

// Force dynamic rendering to prevent SSR issues with the map
export const dynamic = 'force-dynamic'

interface HourlyActivity {
  hour: string
  activity: string
  location: string
  estimatedCost: string
  budgetCategory?: string
  budgetRemaining?: number
  costValidation?: 'within_budget' | 'over_budget' | 'at_limit'
  alternative?: string | null
  coordinates?: [number, number] // Add coordinates field
}

interface ItineraryDay {
  day: number
  dailyBudget?: number
  budgetUtilization?: number
  budgetViolations?: BudgetViolation[]
  budgetWarnings?: BudgetWarning[]
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

interface BudgetSummary {
  totalBudget: number
  dailyBudget: number
  violations: BudgetViolation[]
  warnings: BudgetWarning[]
  isValid: boolean
}

export default function ResultsPage() {
  const router = useRouter()
  const [itinerary, setItinerary] = useState<ItineraryDay[]>([])
  const [tripData, setTripData] = useState({
    name: '',
    startDate: '',
    endDate: '',
    departureLocation: '',
    destination: '',
    days: 0,
    accommodations: '',
    activities: [],
    totalBudget: 0,
  })
  const [budgetRecommendations, setBudgetRecommendations] = useState(null)
  const [dynamicBudget, setDynamicBudget] = useState(null)
  const [budgetSummary, setBudgetSummary] = useState<BudgetSummary | null>(null)
  const [weatherData, setWeatherData] = useState(null)
  const [newsData, setNewsData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [unifiedBudgetData, setUnifiedBudgetData] = useState({
    totalActualCost: 0,
    accommodationCost: 0,
    foodCost: 0,
    activityCost: 0,
    transportCost: 0,
    shoppingCost: 0,
    totalBudgetUtilization: 0,
    dailyBudgetUtilization: 0,
    dailyBudget: 0,
    totalBudget: 0,
    days: 0
  })

  useEffect(() => {
    // Get itinerary and trip data from localStorage
    const storedItinerary = localStorage.getItem('itinerary')
    const storedTripData = localStorage.getItem('tripData')

    if (storedItinerary && storedTripData) {
      try {
        const parsedItinerary = JSON.parse(storedItinerary)
        const parsedTripData = JSON.parse(storedTripData)
        
        // Handle new API response format with weather and news
        let itineraryData = parsedItinerary
        if (parsedItinerary.itinerary) {
          // New format: { itinerary: [...], weather: {...}, news: {...} }
          itineraryData = parsedItinerary.itinerary
          setWeatherData(parsedItinerary.weather)
          setNewsData(parsedItinerary.news)
        }
        
        setItinerary(itineraryData)
        setTripData({
          name: parsedTripData.name,
          startDate: parsedTripData.startDate,
          endDate: parsedTripData.endDate,
          departureLocation: parsedTripData.departureLocation,
          destination: parsedTripData.destination,
          days: parsedTripData.days,
          accommodations: parsedTripData.accommodations,
          activities: parsedTripData.activities,
          totalBudget: parsedTripData.totalBudget || 0,
        })
        
        // Set budget recommendations if available
        if (parsedTripData.budgetRecommendations) {
          setBudgetRecommendations(parsedTripData.budgetRecommendations)
        }
        
        // Load dynamic budget if available
        const storedDynamicBudget = localStorage.getItem('dynamicBudget')
        if (storedDynamicBudget) {
          try {
            setDynamicBudget(JSON.parse(storedDynamicBudget))
          } catch (error) {
            console.error('Error parsing dynamic budget:', error)
          }
        }
        
        // Calculate actual costs from itinerary for budget summary
        const calculateActualCosts = () => {
          let totalEstimatedCost = 0
          let accommodationCost = 0
          let foodCost = 0
          let activityCost = 0
          let transportCost = 0
          let shoppingCost = 0

          itineraryData.forEach((day: any) => {
            // Add hotel cost if available (only count once for total stay)
            if (day.hotel?.price && day.day === 1) {
              const hotelPrice = parseFloat(day.hotel.price.replace(/[^0-9.]/g, '')) || 0
              accommodationCost += hotelPrice * parsedTripData.days // Total for entire stay
              totalEstimatedCost += hotelPrice * parsedTripData.days
            }

            // Add flight cost if available (only for first day)
            if (day.day === 1 && day.flight?.price) {
              const flightPrice = parseFloat(day.flight.price.replace(/[^0-9.]/g, '')) || 0
              transportCost += flightPrice
              totalEstimatedCost += flightPrice
            }

            // Process hourly activities
            day.hourlyActivities?.forEach((activity: any) => {
              const cost = parseFloat(activity.estimatedCost?.replace(/[^0-9.]/g, '')) || 0
              
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

        const actualCosts = calculateActualCosts()
        const totalBudget = parsedTripData.totalBudget || 0
        const days = parsedTripData.days || 1
        const dailyBudget = totalBudget / days
        const actualDailySpent = actualCosts.totalEstimatedCost / days
        const budgetUtilization = dailyBudget > 0 ? (actualDailySpent / dailyBudget) * 100 : 0
        const totalBudgetUtilization = (actualCosts.totalEstimatedCost / totalBudget) * 100

        // Set unified budget data for all components
        setUnifiedBudgetData({
          totalActualCost: actualCosts.totalEstimatedCost,
          accommodationCost: actualCosts.accommodationCost,
          foodCost: actualCosts.foodCost,
          activityCost: actualCosts.activityCost,
          transportCost: actualCosts.transportCost,
          shoppingCost: actualCosts.shoppingCost,
          totalBudgetUtilization,
          dailyBudgetUtilization: budgetUtilization,
          dailyBudget,
          totalBudget,
          days
        })
        
        // Extract budget summary if available in itinerary
        if (parsedItinerary.budgetSummary) {
          setBudgetSummary(parsedItinerary.budgetSummary)
        } else if (itineraryData.length > 0 && itineraryData[0].dailyBudget) {
          // Create budget summary from individual day data
          const allViolations = itineraryData.flatMap((day: any) => day.budgetViolations || [])
          const allWarnings = itineraryData.flatMap((day: any) => day.budgetWarnings || [])
          
          setBudgetSummary({
            totalBudget,
            dailyBudget,
            violations: allViolations,
            warnings: allWarnings,
            isValid: allViolations.length === 0
          })
        } else {
          // Create budget summary from actual costs
          const budgetUtilizationPercent = (actualCosts.totalEstimatedCost / totalBudget) * 100
          const isOverBudget = budgetUtilizationPercent > 100
          
                      // Create violations if over budget
            const violations: BudgetViolation[] = isOverBudget ? [{
              day: 1,
              category: 'overall',
              cost: actualCosts.totalEstimatedCost,
              limit: totalBudget,
              overage: actualCosts.totalEstimatedCost - totalBudget,
              percentage: budgetUtilizationPercent,
              type: 'daily_overage'
            }] : []
          
          setBudgetSummary({
            totalBudget,
            dailyBudget,
            violations,
            warnings: [],
            isValid: !isOverBudget
          })
        }
      } catch (error) {
        console.error('Error parsing stored data:', error)
        router.push('/')
        return
      }
    } else {
      // No data found, redirect to home
      router.push('/')
      return
    }

    setIsLoading(false)
  }, [router])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  const getSeason = (dateString: string) => {
    const date = new Date(dateString)
    const month = date.getMonth()
    if (month >= 2 && month <= 4) return 'Spring'
    else if (month >= 5 && month <= 7) return 'Summer'
    else if (month >= 8 && month <= 10) return 'Autumn/Fall'
    else return 'Winter'
  }



  if (isLoading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
        <div className="container mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <RefreshCw className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
              <p className="text-gray-600">Loading your itinerary...</p>
            </div>
          </div>
        </div>
      </main>
    )
  }

  if (!itinerary.length) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
        <div className="container mx-auto">
          <Card className="max-w-2xl mx-auto">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-red-600">
                No Itinerary Found
              </CardTitle>
              <CardDescription>
                It looks like there was an issue loading your itinerary. Please try generating a new one.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button onClick={() => router.push('/')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Planning
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="container mx-auto">
        {/* Back Button */}
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => router.push('/')}
            className="print:hidden"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Planning
          </Button>
        </div>

        {/* Travel Dates Summary */}
        {tripData.startDate && tripData.endDate && (
          <Card className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-xl font-semibold text-blue-900 flex items-center justify-center gap-2">
                <Calendar className="w-5 h-5" />
                Travel Dates
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-1">
                  <p className="font-medium text-blue-800">Departure</p>
                  <p className="text-blue-600">{formatDate(tripData.startDate)}</p>
                  <p className="text-xs text-blue-500">{getSeason(tripData.startDate)} Season</p>
                </div>
                <div className="space-y-1">
                  <p className="font-medium text-blue-800">Return</p>
                  <p className="text-blue-600">{formatDate(tripData.endDate)}</p>
                  <p className="text-xs text-blue-500">{getSeason(tripData.endDate)} Season</p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-blue-200">
                <p className="text-sm text-blue-700">
                  <span className="font-medium">Duration:</span> {tripData.days} day{tripData.days > 1 ? 's' : ''}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Budget Validation Display */}
        <div className="mb-6">
          {(() => {
            // Calculate actual budget utilization from itinerary data
            const totalSpent = itinerary.reduce((sum, day) => {
              return sum + (day.hourlyActivities?.reduce((daySum, activity) => {
                const cost = parseFloat(activity.estimatedCost?.replace(/[^0-9.-]/g, '')) || 0
                return daySum + cost
              }, 0) || 0)
            }, 0)
            
                          // Add hotel and flight costs
              const hotelCosts = itinerary.reduce((sum, day) => {
                return sum + (parseFloat(day.hotel?.price?.replace(/[^0-9.-]/g, '') || '0')) || 0
              }, 0)
              
              const flightCosts = itinerary.reduce((sum, day) => {
                return sum + (parseFloat(day.flight?.price?.replace(/[^0-9.-]/g, '') || '0')) || 0
              }, 0)
            
            const totalActualSpent = totalSpent + hotelCosts + flightCosts
            const totalBudget = tripData.totalBudget
            const dailyBudget = totalBudget / tripData.days
            
            // Calculate daily budget utilization (average across all days)
            const averageDailySpent = totalActualSpent / tripData.days
            const budgetUtilization = dailyBudget > 0 ? (averageDailySpent / dailyBudget) * 100 : 0
            
            // Create budget summary if not available
            const budgetData = budgetSummary || {
              violations: [],
              warnings: []
            }
            
            // Debug logging
            console.log('Budget Debug:', {
              totalBudget,
              totalActualSpent,
              dailyBudget,
              averageDailySpent,
              budgetUtilization,
              violations: budgetData.violations,
              warnings: budgetData.warnings,
              budgetSummary
            })
            
            return (
              <BudgetValidationDisplay
                dailyBudget={unifiedBudgetData.dailyBudget}
                budgetUtilization={unifiedBudgetData.totalBudgetUtilization}
                overBudgetItems={budgetData.violations || []}
                budgetWarnings={budgetData.warnings || []}
                totalBudget={unifiedBudgetData.totalBudget}
                days={unifiedBudgetData.days}
              />
            )
          })()}
        </div>

        {/* Comprehensive Budget Summary */}
        {budgetRecommendations && unifiedBudgetData.totalBudget > 0 && itinerary.length > 0 && (
          <div className="mb-6">
            <ComprehensiveBudgetSummary
              totalBudget={unifiedBudgetData.totalBudget}
              days={unifiedBudgetData.days}
              itinerary={itinerary}
              budgetRecommendations={budgetRecommendations}
              unifiedBudgetData={unifiedBudgetData}
            />
          </div>
        )}

        {/* Weather Forecast */}
        <div className="mb-6">
          {(() => {
            // Debug logging for weather data
            console.log('Results Page Weather Debug:', {
              weatherData,
              hasWeatherData: !!weatherData,
              weatherDataType: typeof weatherData,
              weatherDataKeys: weatherData ? Object.keys(weatherData) : null
            })
            
            return <WeatherForecast weather={weatherData} />
          })()}
        </div>

                            {/* Local News */}
                    <div className="mb-6">
                      <LocalNews news={newsData} />
                    </div>

                    {/* Accommodation Panel */}
                    <div className="mb-6">
                      {(() => {
                        // Extract unique hotels from itinerary
                                      const uniqueHotels = itinerary
                .filter(day => day.hotel)
                .map(day => day.hotel)
                .filter((hotel): hotel is NonNullable<typeof hotel> => hotel !== undefined)
                .filter((hotel, index, self) => 
                  self.findIndex(h => h.name === hotel.name) === index
                )
                        
                        return (
                          <AccommodationPanel
                            hotels={uniqueHotels}
                            days={unifiedBudgetData.days}
                            totalBudget={unifiedBudgetData.totalBudget}
                            actualAccommodationCost={unifiedBudgetData.accommodationCost}
                            totalActualCost={unifiedBudgetData.totalActualCost}
                          />
                        )
                      })()}
                                          </div>

                      {/* Trip Map */}
                      <div className="mb-6">
                        <TripMap itinerary={itinerary} tripData={tripData} />
                      </div>

                      {/* Booking Integration */}
                      <div className="mb-6">
                        <BookingIntegration
                          destination={tripData.destination}
                          startDate={tripData.startDate}
                          endDate={tripData.endDate}
                          travelers={2}
                          budget={tripData.totalBudget}
                          departureLocation={tripData.departureLocation}
                        />
                      </div>

                      {/* Local Events Calendar */}
                      <div className="mb-6">
                        <LocalEventsCalendar
                          destination={tripData.destination}
                          startDate={tripData.startDate}
                          endDate={tripData.endDate}
                          interests={tripData.activities}
                        />
                      </div>

                      {/* Analytics Dashboard */}
                      <div className="mb-6">
                        <AnalyticsDashboard
                          userId="user123"
                          currentTripData={tripData}
                        />
                      </div>

          {/* Itinerary Display */}
          <ItineraryTable itinerary={itinerary} tripData={tripData} />
      </div>
    </main>
  )
}
