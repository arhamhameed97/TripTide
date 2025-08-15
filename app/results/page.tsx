'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import ItineraryTable from '@/components/ItineraryTable'
import BudgetSummary from '@/components/BudgetSummary'
import TripCostSummary from '@/components/TripCostSummary'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, RefreshCw, Calendar } from 'lucide-react'

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
    budget: '',
    totalBudget: 0,
  })
  const [budgetRecommendations, setBudgetRecommendations] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Get itinerary and trip data from localStorage
    const storedItinerary = localStorage.getItem('itinerary')
    const storedTripData = localStorage.getItem('tripData')

    if (storedItinerary && storedTripData) {
      try {
        const parsedItinerary = JSON.parse(storedItinerary)
        const parsedTripData = JSON.parse(storedTripData)
        
        setItinerary(parsedItinerary)
        setTripData({
          name: parsedTripData.name,
          startDate: parsedTripData.startDate,
          endDate: parsedTripData.endDate,
          departureLocation: parsedTripData.departureLocation,
          destination: parsedTripData.destination,
          days: parsedTripData.days,
          accommodations: parsedTripData.accommodations,
          activities: parsedTripData.activities,
          budget: parsedTripData.budget,
          totalBudget: parsedTripData.totalBudget || 0,
        })
        
        // Set budget recommendations if available
        if (parsedTripData.budgetRecommendations) {
          setBudgetRecommendations(parsedTripData.budgetRecommendations)
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

        {/* Budget Summary */}
        {budgetRecommendations && tripData.totalBudget > 0 && (
          <div className="mb-6">
            <BudgetSummary
              totalBudget={tripData.totalBudget}
              days={tripData.days}
              budgetCategory={tripData.budget}
              budgetRecommendations={budgetRecommendations}
            />
          </div>
        )}

        {/* Trip Cost Summary */}
        {tripData.totalBudget > 0 && itinerary.length > 0 && (
          <div className="mb-6">
            <TripCostSummary
              itinerary={itinerary}
              totalBudget={tripData.totalBudget}
              days={tripData.days}
              budgetCategory={tripData.budget}
            />
          </div>
        )}

        {/* Itinerary Display */}
        <ItineraryTable itinerary={itinerary} tripData={tripData} />
      </div>
    </main>
  )
}
