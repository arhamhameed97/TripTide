'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, BookOpen, MapPin, Clock } from 'lucide-react'
import LocalEventsCalendar from '@/components/LocalEventsCalendar'
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
  const [activeTab, setActiveTab] = useState('events')

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-xl">
          <MapPin className="w-5 h-5 text-blue-600" />
          Travel Services
        </CardTitle>
        <p className="text-sm text-gray-600">
          Discover local events and book your trip essentials
        </p>
      </CardHeader>
      
      <CardContent className="pt-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="events" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Local Events
            </TabsTrigger>
            <TabsTrigger value="booking" className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Book Your Trip
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="events" className="mt-0">
            <div className="max-h-96 overflow-y-auto">
              <LocalEventsCalendar
                destination={destination}
                startDate={startDate}
                endDate={endDate}
                interests={interests}
                compact={true}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="booking" className="mt-0">
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
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
