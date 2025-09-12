'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BookOpen, MapPin, ExternalLink, ArrowRight } from 'lucide-react'
import BookingIntegration from '@/components/BookingIntegration'
import { useRouter } from 'next/navigation'

interface TravelServicesTabsProps {
  destination: string
  startDate: string
  endDate: string
  travelers: number
  budget: number
  departureLocation: string
  interests: string[]
}

export default function TravelServicesTabs({
  destination,
  startDate,
  endDate,
  travelers,
  budget,
  departureLocation,
  interests
}: TravelServicesTabsProps) {
  const router = useRouter()

  const handleExploreServices = () => {
    router.push('/travel-services')
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl">
              <MapPin className="w-5 h-5 text-blue-600" />
              Travel Services
            </CardTitle>
            <p className="text-sm text-gray-600">
              Book your trip essentials
            </p>
          </div>
          <Button
            onClick={handleExploreServices}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Explore All Services
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-blue-900 dark:text-blue-100">Enhanced Booking Experience</h3>
              <p className="text-sm text-blue-700 dark:text-blue-300">Access our full suite of travel services</p>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-green-600 dark:text-green-400">${budget}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Available Budget</div>
            </div>
          </div>
        </div>
        
        <div className="max-h-96 overflow-y-auto">
          <BookingIntegration
            destination={destination}
            startDate={startDate}
            endDate={endDate}
            travelers={travelers}
            budget={budget}
            departureLocation={departureLocation}
          />
        </div>
      </CardContent>
    </Card>
  )
}
