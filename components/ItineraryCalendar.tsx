'use client'

import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MapPin, DollarSign, Clock, GripVertical } from 'lucide-react'

interface HourlyActivity {
  hour: string
  activity: string
  location: string
  estimatedCost: string
  coordinates?: [number, number]
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

interface ItineraryCalendarProps {
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

interface CalendarEvent {
  id: string
  day: number
  hour: string
  activity: HourlyActivity
  startTime: number
  duration: number
}

export default function ItineraryCalendar({ 
  itinerary, 
  tripData, 
  onItineraryUpdate 
}: ItineraryCalendarProps) {
  const [draggedEvent, setDraggedEvent] = useState<CalendarEvent | null>(null)
  const [dragOverSlot, setDragOverSlot] = useState<string | null>(null)
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [selectedDay, setSelectedDay] = useState(1)
  const dragRef = useRef<HTMLDivElement>(null)

  // Generate calendar events from itinerary
  useEffect(() => {
    const calendarEvents: CalendarEvent[] = []
    
    itinerary.forEach(day => {
      day.hourlyActivities.forEach((activity, index) => {
        const hour = activity.hour
        const startTime = parseHourToMinutes(hour)
        
        calendarEvents.push({
          id: `day-${day.day}-${index}`,
          day: day.day,
          hour: hour,
          activity: activity,
          startTime: startTime,
          duration: 60 // Default 1 hour duration
        })
      })
    })
    
    setEvents(calendarEvents)
  }, [itinerary])

  // Parse hour string to minutes for sorting
  const parseHourToMinutes = (hour: string): number => {
    const timeMatch = hour.match(/(\d{1,2}):?(\d{2})?\s*(AM|PM|am|pm)?/i)
    if (!timeMatch) return 0
    
    let hours = parseInt(timeMatch[1])
    const minutes = parseInt(timeMatch[2] || '0')
    const period = timeMatch[3]?.toUpperCase()
    
    if (period === 'PM' && hours !== 12) hours += 12
    if (period === 'AM' && hours === 12) hours = 0
    
    return hours * 60 + minutes
  }

  // Format minutes back to hour string
  const formatMinutesToHour = (minutes: number): string => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    const period = hours >= 12 ? 'PM' : 'AM'
    const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours
    
    return `${displayHours}:${mins.toString().padStart(2, '0')} ${period}`
  }

  // Generate time slots for the day
  const generateTimeSlots = () => {
    const slots = []
    for (let hour = 6; hour < 24; hour++) {
      const timeString = formatMinutesToHour(hour * 60)
      slots.push({
        time: timeString,
        minutes: hour * 60,
        id: `slot-${selectedDay}-${hour}`
      })
    }
    return slots
  }

  // Get events for selected day
  const getDayEvents = (day: number) => {
    return events.filter(event => event.day === day)
      .sort((a, b) => a.startTime - b.startTime)
  }

  // Handle drag start
  const handleDragStart = (event: React.DragEvent, calendarEvent: CalendarEvent) => {
    setDraggedEvent(calendarEvent)
    event.dataTransfer.effectAllowed = 'move'
    
    // Create a custom drag image
    if (dragRef.current) {
      event.dataTransfer.setDragImage(dragRef.current, 0, 0)
    }
  }

  // Handle drag over
  const handleDragOver = (event: React.DragEvent, slotId: string) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
    setDragOverSlot(slotId)
  }

  // Handle drag leave
  const handleDragLeave = () => {
    setDragOverSlot(null)
  }

  // Handle drop
  const handleDrop = (event: React.DragEvent, targetSlotId: string) => {
    event.preventDefault()
    
    if (!draggedEvent) return
    
    const [_, dayStr, hourStr] = targetSlotId.split('-')
    const targetDay = parseInt(dayStr)
    const targetHour = parseInt(hourStr)
    const targetMinutes = targetHour * 60
    
    // Update the event
    const updatedEvents = events.map(event => {
      if (event.id === draggedEvent.id) {
        return {
          ...event,
          day: targetDay,
          hour: formatMinutesToHour(targetMinutes),
          startTime: targetMinutes
        }
      }
      return event
    })
    
    setEvents(updatedEvents)
    
    // Update the itinerary data
    const updatedItinerary = itinerary.map(day => {
      if (day.day === targetDay) {
        // Remove the old activity and add it at the new time
        const filteredActivities = day.hourlyActivities.filter((_, index) => 
          `day-${day.day}-${index}` !== draggedEvent.id
        )
        
        // Add the activity at the new time slot
        const newActivity = {
          ...draggedEvent.activity,
          hour: formatMinutesToHour(targetMinutes)
        }
        
        // Insert at the correct position based on time
        const sortedActivities = [...filteredActivities, newActivity]
          .sort((a, b) => parseHourToMinutes(a.hour) - parseHourToMinutes(b.hour))
        
        return {
          ...day,
          hourlyActivities: sortedActivities
        }
      } else if (day.day === draggedEvent.day) {
        // Remove from original day
        const filteredActivities = day.hourlyActivities.filter((_, index) => 
          `day-${day.day}-${index}` !== draggedEvent.id
        )
        return {
          ...day,
          hourlyActivities: filteredActivities
        }
      }
      return day
    })
    
    // Call the update callback
    if (onItineraryUpdate) {
      onItineraryUpdate(updatedItinerary)
    }
    
    setDraggedEvent(null)
    setDragOverSlot(null)
  }

  // Get event at specific time slot
  const getEventAtSlot = (day: number, minutes: number) => {
    return events.find(event => 
      event.day === day && 
      Math.abs(event.startTime - minutes) < 30 // Within 30 minutes
    )
  }

  // Render calendar event
  const renderEvent = (event: CalendarEvent) => {
    const cost = parseFloat(event.activity.estimatedCost.replace(/[^0-9.-]/g, '')) || 0
    
    return (
      <div
        key={event.id}
        draggable
        onDragStart={(e) => handleDragStart(e, event)}
        className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow cursor-move group"
      >
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center space-x-2">
            <GripVertical className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
            <Clock className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-medium text-gray-900">
              {event.hour}
            </span>
          </div>
          <Badge variant="secondary" className="text-xs">
            <DollarSign className="w-3 h-3 mr-1" />
            ${cost.toFixed(0)}
          </Badge>
        </div>
        
        <div className="space-y-1">
          <h4 className="font-medium text-sm text-gray-900 line-clamp-2">
            {event.activity.activity}
          </h4>
          <div className="flex items-center space-x-1 text-xs text-gray-500">
            <MapPin className="w-3 h-3" />
            <span className="line-clamp-1">{event.activity.location}</span>
          </div>
        </div>
      </div>
    )
  }

  const timeSlots = generateTimeSlots()
  const dayEvents = getDayEvents(selectedDay)

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Calendar View
          </CardTitle>
          <CardDescription>
            Drag and drop activities to reschedule them. Click on a day to view its schedule.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Day Selector */}
          <div className="flex flex-wrap gap-2 mb-6">
            {itinerary.map((day) => (
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

          {/* Calendar Grid */}
          <div className="border rounded-lg overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
              {timeSlots.map((slot) => {
                const event = getEventAtSlot(selectedDay, slot.minutes)
                const isDragOver = dragOverSlot === slot.id
                
                return (
                  <div
                    key={slot.id}
                    className={`min-h-[120px] border-2 border-dashed rounded-lg p-3 transition-colors ${
                      isDragOver 
                        ? 'border-blue-400 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onDragOver={(e) => handleDragOver(e, slot.id)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, slot.id)}
                  >
                    <div className="text-sm font-medium text-gray-600 mb-2">
                      {slot.time}
                    </div>
                    
                    {event ? (
                      renderEvent(event)
                    ) : (
                      <div className="text-xs text-gray-400 italic">
                        Drop activity here
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Instructions */}
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">How to use:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Click on a day button to view its schedule</li>
              <li>• Drag activities from one time slot to another</li>
              <li>• Drop activities on empty slots to reschedule them</li>
              <li>• Changes are automatically saved</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Hidden drag reference */}
      <div
        ref={dragRef}
        className="hidden"
      >
        <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-lg">
          <div className="text-sm font-medium">Moving activity...</div>
        </div>
      </div>
    </div>
  )
}

