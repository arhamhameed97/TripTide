'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar, 
  MapPin, 
  DollarSign, 
  BarChart3, 
  FileText, 
  Map, 
  MessageSquare, 
  Cloud, 
  Newspaper,
  Home,
  ShoppingBag,
  Target,
  TrendingUp,
  ExternalLink
} from 'lucide-react'

interface NavigationItem {
  id: string
  label: string
  icon: React.ReactNode
  section: string
  isExternal?: boolean
}

interface SidebarNavigationProps {
  className?: string
}

export default function SidebarNavigation({ className = '' }: SidebarNavigationProps) {
  const router = useRouter()
  const [isExpanded, setIsExpanded] = useState(true)
  const [activeSection, setActiveSection] = useState('')

  const navigationItems: NavigationItem[] = [
    {
      id: 'destination-info',
      label: 'Destination Info',
      icon: <MapPin className="w-4 h-4" />,
      section: 'destination-info'
    },
    {
      id: 'travel-dates',
      label: 'Travel Dates',
      icon: <Calendar className="w-4 h-4" />,
      section: 'travel-dates'
    },
    {
      id: 'weather-news',
      label: 'Weather & News',
      icon: <Cloud className="w-4 h-4" />,
      section: 'weather-news'
    },
    {
      id: 'itinerary-table',
      label: 'Itinerary',
      icon: <FileText className="w-4 h-4" />,
      section: 'itinerary-table'
    },
    {
      id: 'itinerary-feedback',
      label: 'Improve Itinerary',
      icon: <Target className="w-4 h-4" />,
      section: 'itinerary-feedback'
    },
    {
      id: 'trip-map',
      label: 'Trip Map',
      icon: <Map className="w-4 h-4" />,
      section: 'trip-map'
    },
    {
      id: 'budget-status',
      label: 'Budget Status',
      icon: <DollarSign className="w-4 h-4" />,
      section: 'budget-status'
    },
    {
      id: 'comprehensive-budget',
      label: 'Budget Summary',
      icon: <BarChart3 className="w-4 h-4" />,
      section: 'comprehensive-budget'
    },
    {
      id: 'travel-services',
      label: 'Travel Services',
      icon: <ShoppingBag className="w-4 h-4" />,
      section: 'travel-services'
    },
    {
      id: 'accommodation',
      label: 'Accommodation',
      icon: <Home className="w-4 h-4" />,
      section: 'accommodation'
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: <TrendingUp className="w-4 h-4" />,
      section: 'analytics'
    }
  ]

  // Track active section based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      const sections = navigationItems.map(item => item.section)
      const scrollPosition = window.scrollY + 100 // Offset for better UX

      for (let i = sections.length - 1; i >= 0; i--) {
        const element = document.getElementById(sections[i])
        if (element && element.offsetTop <= scrollPosition) {
          setActiveSection(sections[i])
          break
        }
      }
    }

    window.addEventListener('scroll', handleScroll)
    handleScroll() // Initial check

    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToSection = (sectionId: string, isExternal: boolean = false) => {
    if (isExternal) {
      // Navigate to external page
      router.push('/travel-services')
      return
    }
    
    const element = document.getElementById(sectionId)
    if (element) {
      const offsetTop = element.offsetTop - 80 // Account for any fixed headers
      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
      })
    }
  }

  return (
    <div className={`fixed left-0 top-0 h-full z-50 transition-all duration-300 ${
      isExpanded ? 'w-64' : 'w-16'
    } ${className}`}>
      <div className="h-full bg-white dark:bg-gray-800 shadow-lg border-r border-gray-200 dark:border-gray-700 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            {isExpanded && (
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Navigation
              </h2>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {isExpanded ? (
                <ChevronLeft className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto py-4">
          <nav className="space-y-1 px-2">
            {navigationItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.section, item.isExternal)}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-all duration-200 group ${
                  activeSection === item.section && !item.isExternal
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
                title={!isExpanded ? item.label : undefined}
              >
                <div className={`flex-shrink-0 ${
                  activeSection === item.section && !item.isExternal
                    ? 'text-blue-600 dark:text-blue-400' 
                    : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300'
                }`}>
                  {item.icon}
                </div>
                {isExpanded && (
                  <span className="text-sm font-medium truncate flex-1">
                    {item.label}
                  </span>
                )}
                {isExpanded && item.isExternal && (
                  <ExternalLink className="w-3 h-3 text-gray-400 flex-shrink-0" />
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Footer */}
        {isExpanded && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
              Quick Navigation
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
