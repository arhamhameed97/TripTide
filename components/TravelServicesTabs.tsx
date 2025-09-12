'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BookOpen, MapPin } from 'lucide-react'
import BookingIntegration from '@/components/BookingIntegration'

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
  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-xl">
          <MapPin className="w-5 h-5 text-blue-600" />
          Travel Services
        </CardTitle>
        <p className="text-sm text-gray-600">
          Book your trip essentials
        </p>
      </CardHeader>
      
      <CardContent className="pt-0">
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
