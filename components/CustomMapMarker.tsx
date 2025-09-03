'use client'

import { useEffect, useRef } from 'react'
import L from 'leaflet'

interface CustomMapMarkerProps {
  position: [number, number]
  type: 'hotel' | 'restaurant' | 'activity' | 'transport' | 'shopping' | 'attraction'
  children?: React.ReactNode
}

export default function CustomMapMarker({ position, type, children }: CustomMapMarkerProps) {
  const markerRef = useRef<L.Marker | null>(null)

  const getMarkerIcon = (type: string) => {
    const iconSize = [25, 25]
    const iconAnchor = [12, 25]
    
    const colors = {
      hotel: '#3B82F6',
      restaurant: '#EF4444',
      attraction: '#10B981',
      shopping: '#F59E0B',
      transport: '#8B5CF6',
      activity: '#6B7280'
    }

    const icons = {
      hotel: '🏨',
      restaurant: '🍽️',
      attraction: '🏛️',
      shopping: '🛍️',
      transport: '🚇',
      activity: '🎯'
    }

    return L.divIcon({
      className: 'custom-marker',
      html: `
        <div style="
          background: ${colors[type as keyof typeof colors]};
          border: 2px solid white;
          border-radius: 50%;
          width: ${iconSize[0]}px;
          height: ${iconSize[1]}px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          color: white;
        ">
          ${icons[type as keyof typeof icons]}
        </div>
      `,
      iconSize: iconSize as [number, number],
      iconAnchor: iconAnchor as [number, number]
    })
  }

  useEffect(() => {
    if (!markerRef.current) {
      markerRef.current = L.marker(position, {
        icon: getMarkerIcon(type)
      })
    }

    return () => {
      if (markerRef.current) {
        markerRef.current.remove()
        markerRef.current = null
      }
    }
  }, [position, type])

  return null
}
