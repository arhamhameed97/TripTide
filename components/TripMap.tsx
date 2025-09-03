'use client'

import { useEffect, useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MapPin, Hotel, Utensils, Camera, Car, Plane, Building, ShoppingBag, Coffee, Route, Maximize2, Minimize2 } from 'lucide-react'
import dynamic from 'next/dynamic'
import L from 'leaflet'
import { getLocationCoordinates } from '@/lib/coordinates'

// Dynamically import the map components to avoid SSR issues
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
)
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
)
const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
)
const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
)
const Polyline = dynamic(
  () => import('react-leaflet').then((mod) => mod.Polyline),
  { ssr: false }
)

interface HourlyActivity {
  hour: string
  activity: string
  location: string
  estimatedCost: string
  budgetCategory?: string
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

interface TripMapProps {
  itinerary: ItineraryDay[]
  tripData: {
    destination: string
    departureLocation: string
    days: number
  }
}

interface MapPoint {
  id: string
  name: string
  location: string
  type: 'hotel' | 'restaurant' | 'activity' | 'transport' | 'shopping' | 'attraction'
  day: number
  hour?: string
  cost?: string
  coordinates: [number, number]
  description: string
  icon: string
  color: string
  isAICoordinates?: boolean // Add flag to indicate if coordinates are AI-provided
}

export default function TripMap({ itinerary, tripData }: TripMapProps) {
  const [mapPoints, setMapPoints] = useState<MapPoint[]>([])
  const [selectedDay, setSelectedDay] = useState<number | null>(null)
  const [selectedType, setSelectedType] = useState<string | 'all'>('all')
  const [isMapLoaded, setIsMapLoaded] = useState(false)
  const [showRoutes, setShowRoutes] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isClient, setIsClient] = useState(false)

  // Ensure we're on the client side
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Function to categorize activity type
  const categorizeActivity = (activity: string, location: string): string => {
    const activityLower = activity.toLowerCase()
    const locationLower = location.toLowerCase()

    if (activityLower.includes('hotel') || activityLower.includes('accommodation') || 
        activityLower.includes('check-in') || activityLower.includes('check out')) {
      return 'hotel'
    }
    if (activityLower.includes('breakfast') || activityLower.includes('lunch') || 
        activityLower.includes('dinner') || activityLower.includes('restaurant') ||
        activityLower.includes('cafe') || activityLower.includes('food') ||
        activityLower.includes('eat') || activityLower.includes('meal')) {
      return 'restaurant'
    }
    if (activityLower.includes('museum') || activityLower.includes('gallery') ||
        activityLower.includes('monument') || activityLower.includes('palace') ||
        activityLower.includes('temple') || activityLower.includes('church') ||
        activityLower.includes('cathedral') || activityLower.includes('historic') ||
        activityLower.includes('sightseeing') || activityLower.includes('landmark') ||
        locationLower.includes('museum') || locationLower.includes('palace')) {
      return 'attraction'
    }
    if (activityLower.includes('shopping') || activityLower.includes('market') ||
        activityLower.includes('mall') || activityLower.includes('souvenir') ||
        locationLower.includes('market') || locationLower.includes('bazaar') ||
        locationLower.includes('shop')) {
      return 'shopping'
    }
    if (activityLower.includes('transport') || activityLower.includes('taxi') ||
        activityLower.includes('bus') || activityLower.includes('train') ||
        activityLower.includes('metro') || activityLower.includes('subway') ||
        activityLower.includes('flight') || activityLower.includes('airport') ||
        locationLower.includes('airport') || locationLower.includes('station')) {
      return 'transport'
    }
    return 'activity'
  }

  // Function to get icon and color for point type
  const getPointStyle = (type: string): { icon: string; color: string } => {
    switch (type) {
      case 'hotel':
        return { icon: '🏨', color: '#3B82F6' }
      case 'restaurant':
        return { icon: '🍽️', color: '#EF4444' }
      case 'attraction':
        return { icon: '🏛️', color: '#10B981' }
      case 'shopping':
        return { icon: '🛍️', color: '#F59E0B' }
      case 'transport':
        return { icon: '🚇', color: '#8B5CF6' }
      case 'activity':
      default:
        return { icon: '🎯', color: '#6B7280' }
    }
  }

  // Function to validate and convert coordinates
  const validateCoordinates = (coords: any): [number, number] | null => {
    if (!coords || !Array.isArray(coords) || coords.length !== 2) {
      return null;
    }
    
    const [lat, lng] = coords;
    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);
    
    if (isNaN(latNum) || isNaN(lngNum)) {
      return null;
    }
    
    // Validate latitude range (-90 to 90)
    if (latNum < -90 || latNum > 90) {
      return null;
    }
    
    // Validate longitude range (-180 to 180)
    if (lngNum < -180 || lngNum > 180) {
      return null;
    }
    
    return [latNum, lngNum];
  };

  // Process itinerary data to create map points
  useEffect(() => {
    const points: MapPoint[] = []
    console.log('Processing itinerary for destination:', tripData.destination)

    itinerary.forEach((day, dayIndex) => {
      // Add hotel if available
      if (day.hotel) {
        // For hotels, we'll still use geocoding since they don't have coordinates in the current structure
        const coords = getLocationCoordinates(day.hotel.name, tripData.destination)
        const style = getPointStyle('hotel')
        console.log('Hotel location:', day.hotel.name, 'coordinates:', coords)
        points.push({
          id: `hotel-day-${day.day}`,
          name: day.hotel.name,
          location: day.hotel.name,
          type: 'hotel',
          day: day.day,
          cost: day.hotel.price,
          coordinates: coords,
          description: `Hotel accommodation for Day ${day.day}`,
          icon: style.icon,
          color: style.color
        })
      }

      // Add flight if available (only for first day)
      if (day.flight && day.day === 1) {
        const coords = getLocationCoordinates(tripData.departureLocation, tripData.destination)
        const style = getPointStyle('transport')
        console.log('Flight departure:', tripData.departureLocation, 'coordinates:', coords)
        points.push({
          id: `flight-departure`,
          name: `Flight: ${day.flight.airline}`,
          location: tripData.departureLocation,
          type: 'transport',
          day: day.day,
          cost: day.flight.price,
          coordinates: coords,
          description: `Departure flight from ${tripData.departureLocation}`,
          icon: style.icon,
          color: style.color
        })
      }

      // Add hourly activities
      day.hourlyActivities?.forEach((activity, activityIndex) => {
        const type = categorizeActivity(activity.activity, activity.location)
        // Use AI-provided coordinates if available and valid, otherwise fall back to geocoding
        let coords: [number, number];
        let isAICoordinates = false;
        
        if (activity.coordinates) {
          const validatedCoords = validateCoordinates(activity.coordinates);
          if (validatedCoords) {
            coords = validatedCoords;
            isAICoordinates = true;
            console.log('Using AI coordinates:', coords, 'for location:', activity.location);
          } else {
            coords = getLocationCoordinates(activity.location, tripData.destination);
            console.log('AI coordinates invalid, using geocoding:', coords, 'for location:', activity.location);
          }
        } else {
          coords = getLocationCoordinates(activity.location, tripData.destination);
          console.log('No AI coordinates, using geocoding:', coords, 'for location:', activity.location);
        }
        
        const style = getPointStyle(type)
        console.log('Activity location:', activity.location, 'coordinates:', coords, 'AI-provided:', isAICoordinates, 'Raw activity:', activity)
        
        points.push({
          id: `activity-day-${day.day}-${activityIndex}`,
          name: activity.activity,
          location: activity.location,
          type: type as any,
          day: day.day,
          hour: activity.hour,
          cost: activity.estimatedCost,
          coordinates: coords,
          description: `${activity.hour}: ${activity.activity} at ${activity.location}`,
          icon: style.icon,
          color: style.color,
          isAICoordinates
        })
      })
    })

    setMapPoints(points)
    setIsMapLoaded(true)
  }, [itinerary, tripData])

  // Filter points based on selected day and type
  const filteredPoints = useMemo(() => {
    return mapPoints.filter(point => {
      const dayMatch = selectedDay === null || point.day === selectedDay
      const typeMatch = selectedType === 'all' || point.type === selectedType
      return dayMatch && typeMatch
    })
  }, [mapPoints, selectedDay, selectedType])

  // Get unique days and types for filters
  const uniqueDays = useMemo(() => {
    return Array.from(new Set(mapPoints.map(point => point.day))).sort((a, b) => a - b)
  }, [mapPoints])

  const uniqueTypes = useMemo(() => {
    return Array.from(new Set(mapPoints.map(point => point.type)))
  }, [mapPoints])

  // Calculate map center based on destination
  const mapCenter = useMemo(() => {
    // Try to find the first valid AI coordinate to center the map
    const firstAICoord = mapPoints.find(point => point.isAICoordinates)?.coordinates;
    if (firstAICoord) {
      console.log('Using first AI coordinate for map center:', firstAICoord);
      return firstAICoord;
    }
    
    // Fall back to destination coordinates
    const destinationCoords = getLocationCoordinates(tripData.destination);
    console.log('Using destination coordinates for map center:', destinationCoords);
    return destinationCoords;
  }, [tripData.destination, mapPoints])

  // Generate route lines for each day
  const routeLines = useMemo(() => {
    if (!showRoutes) return []
    
    const lines: Array<{ day: number; coordinates: [number, number][] }> = []
    
    uniqueDays.forEach(day => {
      const dayPoints = mapPoints
        .filter(point => point.day === day)
        .sort((a, b) => {
          const hourA = parseInt(a.hour?.split(':')[0] || '0')
          const hourB = parseInt(b.hour?.split(':')[0] || '0')
          return hourA - hourB
        })
      
      if (dayPoints.length > 1) {
        lines.push({
          day,
          coordinates: dayPoints.map(point => point.coordinates)
        })
      }
    })
    
    return lines
  }, [mapPoints, uniqueDays, showRoutes])

  if (!isClient || !isMapLoaded) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Trip Map
          </CardTitle>
          <CardDescription>
            {!isClient ? 'Initializing map...' : 'Loading map of your destinations and activities...'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
            <div className="text-gray-500">{!isClient ? 'Initializing...' : 'Loading map...'}</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const mapContent = (
    <>
      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Day:</span>
          <Button
            variant={selectedDay === null ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedDay(null)}
          >
            All Days
          </Button>
          {uniqueDays.map(day => (
            <Button
              key={day}
              variant={selectedDay === day ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedDay(day)}
            >
              Day {day}
            </Button>
          ))}
        </div>
        
        <div className="flex items-center gap-2 ml-4">
          <span className="text-sm font-medium">Type:</span>
          <Button
            variant={selectedType === 'all' ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedType('all')}
          >
            All
          </Button>
          {uniqueTypes.map(type => (
            <Button
              key={type}
              variant={selectedType === type ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedType(type)}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </Button>
          ))}
        </div>

        <div className="flex items-center gap-2 ml-4">
          <Button
            variant={showRoutes ? "default" : "outline"}
            size="sm"
            onClick={() => setShowRoutes(!showRoutes)}
          >
            <Route className="w-4 h-4 mr-1" />
            {showRoutes ? 'Hide' : 'Show'} Routes
          </Button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-2 text-sm mb-4">
        <div className="flex items-center gap-1">
          <span className="text-blue-500">🏨</span>
          <span>Hotels</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-red-500">🍽️</span>
          <span>Restaurants</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-green-500">🏛️</span>
          <span>Attractions</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-yellow-500">🛍️</span>
          <span>Shopping</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-purple-500">🚇</span>
          <span>Transport</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-gray-500">🎯</span>
          <span>Activities</span>
        </div>
        <div className="flex items-center gap-1 ml-4">
          <span className="text-green-600">📍</span>
          <span>AI Coordinates</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-blue-600">📍</span>
          <span>Geocoded</span>
        </div>
      </div>

      {/* Statistics */}
      <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
        <span>Total Points: {filteredPoints.length}</span>
        <span>Hotels: {filteredPoints.filter(p => p.type === 'hotel').length}</span>
        <span>Restaurants: {filteredPoints.filter(p => p.type === 'restaurant').length}</span>
        <span>Attractions: {filteredPoints.filter(p => p.type === 'attraction').length}</span>
        <span>Activities: {filteredPoints.filter(p => p.type === 'activity').length}</span>
        <span className="text-green-600 font-medium">
          AI Coordinates: {filteredPoints.filter(p => p.isAICoordinates).length}
        </span>
        <span className="text-blue-600 font-medium">
          Geocoded: {filteredPoints.filter(p => !p.isAICoordinates).length}
        </span>
      </div>

      {/* Debug Info */}
      <div className="bg-gray-100 p-3 rounded-lg mb-4 text-xs">
        <h4 className="font-semibold mb-2">Debug Information:</h4>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <strong>Map Center:</strong> {mapCenter[0].toFixed(6)}, {mapCenter[1].toFixed(6)}
          </div>
          <div>
            <strong>Total Map Points:</strong> {mapPoints.length}
          </div>
          <div>
            <strong>AI Coordinates:</strong> {mapPoints.filter(p => p.isAICoordinates).length}
          </div>
          <div>
            <strong>Geocoded:</strong> {mapPoints.filter(p => !p.isAICoordinates).length}
          </div>
        </div>
        {mapPoints.length > 0 && (
          <div className="mt-2">
            <strong>Sample Points:</strong>
            <div className="max-h-32 overflow-y-auto">
              {mapPoints.slice(0, 5).map((point, index) => (
                <div key={index} className="text-xs">
                  {point.name}: [{point.coordinates[0].toFixed(6)}, {point.coordinates[1].toFixed(6)}] 
                  {point.isAICoordinates ? ' (AI)' : ' (Geocoded)'}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Map */}
      <div className="relative">
        <div className="absolute top-2 right-2 z-[1000]">
          <Button variant="outline" size="sm" onClick={() => setIsFullscreen(true)}>
            <Maximize2 className="w-4 h-4 mr-1" /> Fullscreen
          </Button>
        </div>
        
        <div className="h-96 rounded-lg overflow-hidden border">
          <MapContainer
            center={mapCenter}
            zoom={10}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {/* Render filtered points */}
            {filteredPoints.map(point => (
              <Marker
                key={point.id}
                position={point.coordinates}
                icon={L.divIcon({
                  className: 'custom-marker',
                  html: `
                    <div style="
                      background: ${point.color};
                      border: 3px solid ${point.isAICoordinates ? '#10B981' : '#3B82F6'};
                      border-radius: 50%;
                      width: 25px;
                      height: 25px;
                      display: flex;
                      align-items: center;
                      justify-content: center;
                      font-size: 12px;
                      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                      color: white;
                    ">
                      ${point.icon}
                    </div>
                  `,
                  iconSize: [25, 25],
                  iconAnchor: [12, 25]
                })}
              >
                <Popup>
                  <div className="p-2">
                    <h3 className="font-semibold text-sm">{point.name}</h3>
                    <p className="text-xs text-gray-600 mb-1">{point.location}</p>
                    <p className="text-xs text-gray-500 mb-1">Day {point.day}</p>
                    {point.hour && <p className="text-xs text-gray-500 mb-1">Time: {point.hour}</p>}
                    {point.cost && <p className="text-xs text-green-600 font-medium">Cost: {point.cost}</p>}
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {point.type.charAt(0).toUpperCase() + point.type.slice(1)}
                      </Badge>
                      {point.isAICoordinates && (
                        <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                          AI Coordinates
                        </Badge>
                      )}
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}

            {/* Render route lines */}
            {routeLines.map(line => (
              <Polyline
                key={`route-day-${line.day}`}
                positions={line.coordinates}
                color={`hsl(${line.day * 60}, 70%, 50%)`}
                weight={3}
                opacity={0.7}
              />
            ))}
          </MapContainer>
        </div>
      </div>
    </>
  )

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-white">
        <div className="h-full flex flex-col">
          <div className="flex justify-between items-center p-4 border-b">
            <h2 className="text-lg font-semibold">Trip Map - Fullscreen</h2>
            <Button variant="outline" size="sm" onClick={() => setIsFullscreen(false)}>
              <Minimize2 className="w-4 h-4 mr-1" /> Exit Fullscreen
            </Button>
          </div>
          <div className="flex-1 p-4">
            <div className="h-full">
              <MapContainer
                center={mapCenter}
                zoom={12}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                
                {/* Render filtered points */}
                {filteredPoints.map(point => (
                  <Marker
                    key={point.id}
                    position={point.coordinates}
                    icon={L.divIcon({
                      className: 'custom-marker',
                      html: `
                        <div style="
                          background: ${point.color};
                          border: 3px solid ${point.isAICoordinates ? '#10B981' : '#3B82F6'};
                          border-radius: 50%;
                          width: 30px;
                          height: 30px;
                          display: flex;
                          align-items: center;
                          justify-content: center;
                          font-size: 14px;
                          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                          color: white;
                        ">
                          ${point.icon}
                        </div>
                      `,
                      iconSize: [30, 30],
                      iconAnchor: [15, 30]
                    })}
                  >
                    <Popup>
                      <div className="p-3">
                        <h3 className="font-semibold">{point.name}</h3>
                        <p className="text-sm text-gray-600 mb-2">{point.location}</p>
                        <p className="text-sm text-gray-500 mb-1">Day {point.day}</p>
                        {point.hour && <p className="text-sm text-gray-500 mb-1">Time: {point.hour}</p>}
                        {point.cost && <p className="text-sm text-green-600 font-medium mb-2">Cost: {point.cost}</p>}
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">
                            {point.type.charAt(0).toUpperCase() + point.type.slice(1)}
                          </Badge>
                          {point.isAICoordinates && (
                            <Badge variant="secondary" className="bg-green-100 text-green-700">
                              AI Coordinates
                            </Badge>
                          )}
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                ))}

                {/* Render route lines */}
                {routeLines.map(line => (
                  <Polyline
                    key={`route-day-${line.day}`}
                    positions={line.coordinates}
                    color={`hsl(${line.day * 60}, 70%, 50%)`}
                    weight={4}
                    opacity={0.8}
                  />
                ))}
              </MapContainer>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          Trip Map
        </CardTitle>
        <CardDescription>
          Explore your destinations and activities on the map. {filteredPoints.length} locations found.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {mapContent}
      </CardContent>
    </Card>
  )
}
