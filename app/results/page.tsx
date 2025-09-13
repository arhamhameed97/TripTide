'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import ItineraryTable from '@/components/ItineraryTable'
import ComprehensiveBudgetSummary from '@/components/ComprehensiveBudgetSummary'
import BudgetValidationDisplay from '@/components/BudgetValidationDisplay'
import WeatherAndNews from '@/components/WeatherAndNews'
import AccommodationPanel from '@/components/AccommodationPanel'
import TripMap from '@/components/TripMap'
import TravelServicesTabs from '@/components/TravelServicesTabs'
import AnalyticsDashboard from '@/components/AnalyticsDashboard'
import ItineraryFeedback from '@/components/ItineraryFeedback'
import SidebarNavigation from '@/components/SidebarNavigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, RefreshCw, Calendar, ShoppingBag, MapPin } from 'lucide-react'
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
  const [originalItinerary, setOriginalItinerary] = useState<ItineraryDay[]>([])
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
    personalPreferences: {},
  })
  const [budgetRecommendations, setBudgetRecommendations] = useState(null)
  const [dynamicBudget, setDynamicBudget] = useState(null)
  const [budgetSummary, setBudgetSummary] = useState<BudgetSummary | null>(null)
  const [weatherData, setWeatherData] = useState(null)
  const [newsData, setNewsData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdateTime, setLastUpdateTime] = useState(0)
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
        setOriginalItinerary(itineraryData) // Store original itinerary for comparison
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
          personalPreferences: parsedTripData.personalPreferences || {},
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
        
        // Calculate actual costs from itinerary for budget summary (robust mapping)
        const calculateActualCosts = () => {
          let totalEstimatedCost = 0
          let accommodationCost = 0
          let foodCost = 0
          let activityCost = 0
          let transportCost = 0
          let shoppingCost = 0

          const parseEstimatedCost = (value?: string) => {
            if (!value) return 0
            const lower = value.toLowerCase()
            if (lower.includes('free')) return 0
            const numbers = (value.match(/[0-9]+(?:\.[0-9]+)?/g) || []).map((n: string) => parseFloat(n))
            if (numbers.length === 0) return 0
            if (numbers.length === 1) return numbers[0]
            return numbers.reduce((a: number, b: number) => a + b, 0) / numbers.length
          }

          const countedFlights = new Set<string>()

          itineraryData.forEach((day: any) => {
            // Accommodation per night if present
            if (day.hotel?.price) {
              const nightly = parseEstimatedCost(day.hotel.price)
              accommodationCost += nightly
              totalEstimatedCost += nightly
            }

            // Flights counted once
            if (day.flight?.price) {
              const key = `${day.flight.airline}_${day.flight.price}`
              if (!countedFlights.has(key)) {
                countedFlights.add(key)
                const flightCost = parseEstimatedCost(day.flight.price)
                transportCost += flightCost
                totalEstimatedCost += flightCost
              }
            }

            // Process hourly activities
            day.hourlyActivities?.forEach((activity: any) => {
              const cost = parseEstimatedCost(activity.estimatedCost)

              const explicitCategory = activity.category || activity.budgetCategory
              if (explicitCategory) {
                const key = String(explicitCategory).toLowerCase()
                if (key.includes('accommod')) accommodationCost += cost
                else if (key.includes('food') || key.includes('dining') || key.includes('meal')) foodCost += cost
                else if (key.includes('transport') || key.includes('taxi') || key.includes('uber') || key.includes('train') || key.includes('bus') || key.includes('flight')) transportCost += cost
                else if (key.includes('shop')) shoppingCost += cost
                else activityCost += cost
                totalEstimatedCost += cost
                return
              }

              const activityLower = (activity.activity || '').toLowerCase()
              const locationLower = (activity.location || '').toLowerCase()

              if (activityLower.includes('hotel') || activityLower.includes('accommodation') ||
                  locationLower.includes('hotel') || locationLower.includes('resort') ||
                  locationLower.includes('bnb')) {
                accommodationCost += cost
              } else if (
                activityLower.includes('breakfast') || activityLower.includes('lunch') || activityLower.includes('dinner') ||
                activityLower.includes('restaurant') || activityLower.includes('cafe') || activityLower.includes('food') ||
                locationLower.includes('restaurant') || locationLower.includes('cafe')
              ) {
                foodCost += cost
              } else if (
                activityLower.includes('uber') || activityLower.includes('lyft') || activityLower.includes('taxi') ||
                activityLower.includes('metro') || activityLower.includes('subway') || activityLower.includes('bus') ||
                activityLower.includes('tram') || activityLower.includes('train') || activityLower.includes('ferry') ||
                activityLower.includes('transport') || activityLower.includes('flight')
              ) {
                transportCost += cost
              } else if (
                activityLower.includes('shopping') || activityLower.includes('market') || activityLower.includes('mall') ||
                activityLower.includes('souvenir') || activityLower.includes('gift') || locationLower.includes('mall')
              ) {
                shoppingCost += cost
              } else {
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

  // Effect to recalculate budget when itinerary changes (for ItineraryTable updates)
  useEffect(() => {
    if (lastUpdateTime > 0 && itinerary.length > 0 && tripData.totalBudget > 0) {
      const calculateActualCosts = () => {
        let totalEstimatedCost = 0
        let accommodationCost = 0
        let foodCost = 0
        let activityCost = 0
        let transportCost = 0
        let shoppingCost = 0

        itinerary.forEach((day: any) => {
          day.hourlyActivities?.forEach((activity: any) => {
            const cost = parseFloat(activity.estimatedCost?.replace(/[^0-9.-]/g, '')) || 0
            
            // Categorize costs based on activity type
            const activityLower = activity.activity.toLowerCase()
            const locationLower = activity.location.toLowerCase()
            
            if (activityLower.includes('hotel') || activityLower.includes('accommodation') || 
                locationLower.includes('hotel') || locationLower.includes('resort')) {
              accommodationCost += cost
            } else if (activityLower.includes('breakfast') || activityLower.includes('lunch') || 
                      activityLower.includes('dinner') || activityLower.includes('restaurant') ||
                      activityLower.includes('cafe') || activityLower.includes('food') ||
                      locationLower.includes('restaurant') || locationLower.includes('cafe')) {
              foodCost += cost
            } else if (activityLower.includes('shopping') || activityLower.includes('market') ||
                      locationLower.includes('mall') || locationLower.includes('shop')) {
              shoppingCost += cost
            } else if (activityLower.includes('transport') || activityLower.includes('taxi') ||
                      activityLower.includes('metro') || activityLower.includes('bus') ||
                      activityLower.includes('car rental') || activityLower.includes('flight')) {
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
      const totalBudget = tripData.totalBudget || 0
      const days = tripData.days || 1
      const dailyBudget = totalBudget / days
      const actualDailySpent = actualCosts.totalEstimatedCost / days
      const budgetUtilization = dailyBudget > 0 ? (actualDailySpent / dailyBudget) * 100 : 0
      const totalBudgetUtilization = (actualCosts.totalEstimatedCost / totalBudget) * 100

      // Update unified budget data
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

      // Update budget summary
      const budgetUtilizationPercent = (actualCosts.totalEstimatedCost / totalBudget) * 100
      const isOverBudget = budgetUtilizationPercent > 100
      
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

      console.log('Budget data recalculated after itinerary table update:', {
        totalCost: actualCosts.totalEstimatedCost,
        budgetUtilization: budgetUtilizationPercent,
        timestamp: new Date().toISOString()
      })
      
      // Show a brief notification that budget was updated
      console.log('✅ Budget and map data synchronized with itinerary table changes')
    }
  }, [lastUpdateTime, itinerary, tripData])

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
      {/* Sidebar Navigation */}
      <SidebarNavigation />
      
      {/* Main Content with left margin for sidebar */}
      <div className="ml-64">
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

        {/* Destination Information */}
        <div id="destination-info" className="mb-6">
          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-xl font-semibold text-green-900 flex items-center justify-center gap-2">
                <MapPin className="w-5 h-5" />
                Destination Information
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-1">
                  <p className="font-medium text-green-800">Destination</p>
                  <p className="text-green-600">{tripData.destination}</p>
                </div>
                <div className="space-y-1">
                  <p className="font-medium text-green-800">Departure From</p>
                  <p className="text-green-600">{tripData.departureLocation}</p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-green-200">
                <p className="text-sm text-green-700">
                  <span className="font-medium">Trip Duration:</span> {tripData.days} day{tripData.days > 1 ? 's' : ''}
                </p>
                <p className="text-sm text-green-700 mt-1">
                  <span className="font-medium">Accommodation:</span> {tripData.accommodations}
                </p>
                <p className="text-sm text-green-700 mt-1">
                  <span className="font-medium">Interests:</span> {tripData.activities.join(', ')}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Travel Dates Summary */}
        {tripData.startDate && tripData.endDate && (
          <Card id="travel-dates" className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
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

        {/* Weather Forecast and Local News - Combined */}
        <div id="weather-news" className="mb-6">
          <WeatherAndNews 
            weather={weatherData} 
            news={newsData}
            destination={tripData.destination}
            startDate={tripData.startDate}
            endDate={tripData.endDate}
            interests={tripData.activities}
          />
        </div>

        {/* Hourly Itinerary Display */}
        <div id="itinerary-table" className="mb-6">
          <ItineraryTable 
            itinerary={itinerary} 
            originalItinerary={originalItinerary}
            tripData={tripData}
            onItineraryUpdate={(updatedItinerary) => {
              setItinerary(updatedItinerary)
              // Update localStorage with the new itinerary
              localStorage.setItem('itinerary', JSON.stringify(updatedItinerary))
              
              // Trigger budget recalculation for ItineraryTable updates too
              // This ensures consistency when users manually edit activities
              if (updatedItinerary && tripData) {
                // Force a re-render by updating a timestamp
                setLastUpdateTime(Date.now())
              }
            }}
          />
        </div>

        {/* Dynamic Itinerary Feedback Section */}
        <div id="itinerary-feedback" className="mb-6">
          <ItineraryFeedback 
            itinerary={itinerary}
            tripData={tripData}
            onItineraryUpdate={(updatedItinerary) => {
              console.log('Results: Itinerary updated from feedback', {
                hasItinerary: !!updatedItinerary,
                itineraryLength: updatedItinerary?.length,
                firstDayActivities: updatedItinerary?.[0]?.hourlyActivities?.length
              })
              setItinerary(updatedItinerary)
              // Update localStorage with the new itinerary
              localStorage.setItem('itinerary', JSON.stringify(updatedItinerary))
              
              // Recalculate budget data with the updated itinerary
              if (updatedItinerary && tripData) {
                const calculateActualCosts = () => {
                  let totalEstimatedCost = 0
                  let accommodationCost = 0
                  let foodCost = 0
                  let activityCost = 0
                  let transportCost = 0
                  let shoppingCost = 0

                  updatedItinerary.forEach((day: any) => {
                    if (day.hourlyActivities) {
                      day.hourlyActivities.forEach((activity: any) => {
                        const cost = activity.cost || 0
                        totalEstimatedCost += cost

                        // Categorize costs
                        switch (activity.category) {
                          case 'accommodation':
                            accommodationCost += cost
                            break
                          case 'food':
                            foodCost += cost
                            break
                          case 'activity':
                            activityCost += cost
                            break
                          case 'transport':
                            transportCost += cost
                            break
                          case 'shopping':
                            shoppingCost += cost
                            break
                          default:
                            activityCost += cost
                        }
                      })
                    }
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
                const totalBudget = tripData.totalBudget
                const dailyBudget = totalBudget / tripData.days
                const budgetUtilizationPercent = (actualCosts.totalEstimatedCost / totalBudget) * 100
                const isOverBudget = actualCosts.totalEstimatedCost > totalBudget

                // Create unified budget data
                const budgetUtilization = dailyBudget > 0 ? (actualCosts.totalEstimatedCost / dailyBudget) * 100 : 0
                const totalBudgetUtilization = (actualCosts.totalEstimatedCost / totalBudget) * 100

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
                  days: tripData.days
                })

                // Create budget summary with violations
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

                console.log('Budget data recalculated after itinerary update:', {
                  totalCost: actualCosts.totalEstimatedCost,
                  budgetUtilization: budgetUtilizationPercent,
                  timestamp: new Date().toISOString()
                })
                
                // Show a brief notification that budget was updated
                console.log('✅ Budget and map data synchronized with itinerary changes')
              }
            }}
          />
        </div>

        {/* Trip Map */}
        <div id="trip-map" className="mb-6">
          <TripMap itinerary={itinerary} tripData={tripData} />
        </div>

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
              <div id="budget-status">
                <BudgetValidationDisplay
                dailyBudget={unifiedBudgetData.dailyBudget}
                budgetUtilization={unifiedBudgetData.totalBudgetUtilization}
                overBudgetItems={budgetData.violations || []}
                budgetWarnings={budgetData.warnings || []}
                totalBudget={unifiedBudgetData.totalBudget}
                days={unifiedBudgetData.days}
              />
              </div>
            )
          })()}
        </div>

        {/* Comprehensive Budget Summary */}
        {budgetRecommendations && unifiedBudgetData.totalBudget > 0 && itinerary.length > 0 && (
          <div id="comprehensive-budget" className="mb-6">
            <ComprehensiveBudgetSummary
              totalBudget={unifiedBudgetData.totalBudget}
              days={unifiedBudgetData.days}
              itinerary={itinerary}
              budgetRecommendations={budgetRecommendations}
              unifiedBudgetData={unifiedBudgetData}
            />
          </div>
        )}

        {/* Travel Services - Booking */}
        <div id="travel-services" className="mb-6">
          <TravelServicesTabs
            destination={tripData.destination}
            startDate={tripData.startDate}
            endDate={tripData.endDate}
            travelers={2}
            budget={tripData.totalBudget}
            departureLocation={tripData.departureLocation}
            interests={tripData.activities}
          />
        </div>

        {/* Accommodation Panel */}
        <div id="accommodation" className="mb-6">
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

        {/* Analytics Dashboard */}
        <div id="analytics" className="mb-6">
          <AnalyticsDashboard
            userId="user123"
            currentTripData={tripData}
          />
        </div>

        {/* Action Buttons - Print and Plan Another Trip */}
        <div className="mt-12 mb-6">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button 
                  variant="outline" 
                  className="w-full sm:w-auto bg-white border-gray-300 hover:bg-gray-50"
                  onClick={() => window.print()}
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  Print Itinerary
                </Button>
                <Button 
                  className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
                  onClick={() => router.push('/')}
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Plan Another Trip
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        </div>
      </div>
    </main>
  )
}
