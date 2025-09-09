'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar, CalendarDays, Plane, MapPin, Loader2, DollarSign, Calculator, Info, User, Zap, ChevronDown, ChevronRight, Settings, Heart, Shield, Clock, Users } from 'lucide-react'

interface FormData {
  name: string
  startDate: string
  endDate: string
  departureLocation: string
  destination: string
  accommodations: string
  activities: string[]
  totalBudget: number
  personalPreferences: {
    travelStyle: string[]
    interests: string[]
    dietaryRestrictions: string[]
    accessibility: string[]
    pace: string
    groupSize: string
    specialRequirements: string
  }
}

interface BudgetRecommendations {
  accommodations: string[]
  activities: string[]
  dailyBudget: number
  accommodationBudget: number
  activityBudget: number
  foodBudget: number
  transportBudget: number
  shoppingBudget: number
}

interface TripFormProps {
  onPreferencesUpdate?: (preferences: any) => void
  currentFormData?: any
}

export default function TripForm({ onPreferencesUpdate, currentFormData }: TripFormProps) {
  const router = useRouter()
  const [formData, setFormData] = useState<FormData>({
    name: '',
    startDate: '',
    endDate: '',
    departureLocation: '',
    destination: '',
    accommodations: 'hotel',
    activities: [],
    totalBudget: 0,
    personalPreferences: {
      travelStyle: [],
      interests: [],
      dietaryRestrictions: [],
      accessibility: [],
      pace: '',
      groupSize: '',
      specialRequirements: ''
    }
  })
  const [isLoading, setIsLoading] = useState(false)
  const [budgetRecommendations, setBudgetRecommendations] = useState<BudgetRecommendations | null>(null)
  const [tripDuration, setTripDuration] = useState(0)
  const [showUpdateNotification, setShowUpdateNotification] = useState(false)
  const [expandedSections, setExpandedSections] = useState({
    basic: true,
    budget: false,
    preferences: false,
    advanced: false
  })

  // Template data for quick testing - Updated for NY to SF trip (2 days)
  const templateData: FormData = {
    name: 'John Doe',
    startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days from now
    endDate: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 9 days from now (2 days after start)
    departureLocation: 'New York, NY',
    destination: 'San Francisco, CA',
    accommodations: 'hotel',
    activities: ['culture', 'food', 'history', 'city'],
    totalBudget: 1500,
    personalPreferences: {
      travelStyle: ['Cultural', 'Adventure'],
      interests: ['Local Cuisine', 'Historical Sites', 'City Exploration', 'Cultural Experiences'],
      dietaryRestrictions: ['No restrictions'],
      accessibility: ['No special requirements'],
      pace: 'moderate',
      groupSize: 'couple',
      specialRequirements: 'Interested in American culture, local food, and historical landmarks. Need to rent a car for transportation during the trip.'
    }
  }

  const handleAutofill = () => {
    setFormData(templateData)
  }

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  // Detect if chatbot has already set preferences to avoid duplication
  const hasChatbotPreferences = () => {
    return formData.personalPreferences.travelStyle.length > 0 ||
           formData.personalPreferences.interests.length > 0 ||
           formData.personalPreferences.dietaryRestrictions.length > 0 ||
           formData.personalPreferences.accessibility.length > 0 ||
           formData.personalPreferences.pace !== '' ||
           formData.personalPreferences.groupSize !== '' ||
           formData.personalPreferences.specialRequirements !== ''
  }

  // Calculate budget recommendations when total budget or trip duration changes
  useEffect(() => {
    if (formData.totalBudget > 0 && tripDuration > 0) {
      const recommendations = calculateBudgetRecommendations(formData.totalBudget, tripDuration)
      setBudgetRecommendations(recommendations)
    }
  }, [formData.totalBudget, tripDuration])

  // Calculate trip duration when dates change
  useEffect(() => {
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate)
      const end = new Date(formData.endDate)
      const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24)) + 1
      setTripDuration(days)
    }
  }, [formData.startDate, formData.endDate])

  // Handle preference updates from chatbot
  useEffect(() => {
    if (currentFormData && Object.keys(currentFormData).length > 0) {
      setFormData(prev => {
        const updatedData = { ...prev }
        
        // Handle nested personalPreferences updates
        if (currentFormData.personalPreferences) {
          updatedData.personalPreferences = {
            ...prev.personalPreferences,
            ...currentFormData.personalPreferences
          }
        }
        
        // Handle direct field updates
        Object.keys(currentFormData).forEach(key => {
          if (key !== 'personalPreferences') {
            (updatedData as any)[key] = currentFormData[key]
          }
        })
        
        return updatedData
      })
      
      // Show notification
      setShowUpdateNotification(true)
      setTimeout(() => setShowUpdateNotification(false), 3000)
    }
  }, [currentFormData])

  const calculateBudgetRecommendations = (totalBudget: number, days: number): BudgetRecommendations => {
    const dailyBudget = totalBudget / days
    
    // Budget allocation percentages
    const accommodationPercent = 0.35 // 35% for accommodation
    const foodPercent = 0.25 // 25% for food
    const activitiesPercent = 0.20 // 20% for activities
    const transportPercent = 0.15 // 15% for transport
    const shoppingPercent = 0.05 // 5% for shopping/misc

    const accommodationBudget = (totalBudget * accommodationPercent) / days
    const foodBudget = (totalBudget * foodPercent) / days
    const activityBudget = (totalBudget * activitiesPercent) / days
    const transportBudget = (totalBudget * transportPercent) / days
    const shoppingBudget = (totalBudget * shoppingPercent) / days

    // Provide general recommendations based on daily budget
    const accommodationOptions = ['hostel', 'budget-hotel', 'guesthouse', 'hotel', 'apartment', 'bed-and-breakfast', 'resort', 'luxury-hotel', 'boutique-hotel', 'villa']
    const activityOptions = ['culture', 'nature', 'history', 'city', 'beach', 'food', 'adventure', 'art', 'music', 'shopping', 'luxury-experiences', 'fine-dining', 'exclusive-tours', 'spa-wellness']

    return {
      accommodations: accommodationOptions,
      activities: activityOptions,
      dailyBudget,
      accommodationBudget,
      activityBudget,
      foodBudget,
      transportBudget,
      shoppingBudget
    }
  }

  const handleInputChange = (field: keyof FormData, value: string | string[] | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handlePreferenceChange = (field: keyof FormData['personalPreferences'], value: string, isChecked?: boolean) => {
    setFormData(prev => {
      const currentPrefs = prev.personalPreferences
      
      if (field === 'travelStyle' || field === 'interests' || field === 'dietaryRestrictions' || field === 'accessibility') {
        // Handle array fields (checkboxes)
        if (isChecked) {
          return {
            ...prev,
            personalPreferences: {
              ...currentPrefs,
              [field]: [...currentPrefs[field], value]
            }
          }
        } else {
          return {
            ...prev,
            personalPreferences: {
              ...currentPrefs,
              [field]: currentPrefs[field].filter(item => item !== value)
            }
          }
        }
      } else {
        // Handle string fields (selects and textarea)
        return {
          ...prev,
          personalPreferences: {
            ...currentPrefs,
            [field]: value
          }
        }
      }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate budget
    if (formData.totalBudget <= 0) {
      alert('Please enter a valid total trip budget')
      return
    }

    if (formData.totalBudget < tripDuration * 50) {
      alert(`Your budget of $${formData.totalBudget} is too low for a ${tripDuration}-day trip. Minimum recommended: $${tripDuration * 50}`)
      return
    }

    if (formData.totalBudget > tripDuration * 1000) {
      alert(`Your budget of $${formData.totalBudget} is very high for a ${tripDuration}-day trip. Consider if this is correct.`)
      return
    }

    // Calculate number of days from start and end dates
    if (!formData.startDate || !formData.endDate) {
      alert('Please select both start and end dates')
      return
    }

    const startDate = new Date(formData.startDate)
    const endDate = new Date(formData.endDate)
    const timeDiff = endDate.getTime() - startDate.getTime()
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1 // +1 to include both start and end days

    if (daysDiff < 1) {
      alert('End date must be after start date')
      return
    }

    if (daysDiff > 30) {
      alert('Maximum trip duration is 30 days')
      return
    }

    setIsLoading(true)
    
    try {
      const response = await fetch('/api/generate-itinerary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          days: daysDiff,
          startDate: formData.startDate,
          endDate: formData.endDate
        }),
      })

      if (response.ok) {
        const itinerary = await response.json()
        
        // Store data in localStorage
        localStorage.setItem('itinerary', JSON.stringify(itinerary))
        localStorage.setItem('tripData', JSON.stringify({
          ...formData,
          days: daysDiff,
          budgetRecommendations
        }))
        
        // Redirect to results page
        router.push('/results')
      } else {
        const error = await response.json()
        let errorMessage = error.error || 'Failed to generate itinerary'
        
        // Provide more specific error messages based on status code
        if (response.status === 429) {
          errorMessage = 'Daily AI request limit reached. Please try again tomorrow.'
        } else if (response.status === 503) {
          errorMessage = 'AI service is temporarily busy. Please wait a few minutes and try again.'
        } else if (response.status === 500) {
          errorMessage = 'Unable to generate AI itinerary. Please try again later.'
        }
        
        alert(`Error: ${errorMessage}`)
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Network error. Please check your connection and try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const getMinEndDate = () => {
    if (!formData.startDate) return ''
    const minDate = new Date(formData.startDate)
    minDate.setDate(minDate.getDate() + 1)
    return minDate.toISOString().split('T')[0]
  }

  const getMaxStartDate = () => {
    const maxDate = new Date()
    maxDate.setFullYear(maxDate.getFullYear() + 2) // Allow booking up to 2 years in advance
    return maxDate.toISOString().split('T')[0]
  }

  const getMinStartDate = () => {
    const minDate = new Date()
    minDate.setDate(minDate.getDate() + 1) // Allow booking from tomorrow
    return minDate.toISOString().split('T')[0]
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Update Notification */}
      {showUpdateNotification && (
        <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg animate-in slide-in-from-right">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>AI Assistant updated your preferences!</span>
          </div>
        </div>
      )}

      {/* Quick Start Section */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-6 rounded-xl border border-blue-200 dark:border-blue-700 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Quick Start</h2>
            <p className="text-gray-600 dark:text-gray-300">Fill out basic details or use our template to get started quickly</p>
          </div>
          <Button
            type="button"
            onClick={handleAutofill}
            variant="outline"
            className="flex items-center gap-2 bg-white dark:bg-gray-800 border-blue-200 dark:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"
          >
            <Zap className="w-4 h-4" />
            Quick Fill Template
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <button
            type="button"
            onClick={() => toggleSection('basic')}
            className="w-full px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between hover:from-blue-100 hover:to-indigo-100 dark:hover:from-blue-800/30 dark:hover:to-indigo-800/30 transition-colors"
          >
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Basic Information</h3>
            </div>
            {expandedSections.basic ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </button>
          
          {expandedSections.basic && (
            <div className="p-6 space-y-6">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Traveler Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                />
              </div>

              {/* Travel Dates */}
              <div className="space-y-4">
                <Label className="text-base font-medium flex items-center gap-2">
                  <CalendarDays className="w-5 h-5" />
                  Travel Dates
                </Label>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      id="startDate"
                      type="date"
                      min={getMinStartDate()}
                      max={getMaxStartDate()}
                      value={formData.startDate}
                      onChange={(e) => handleInputChange('startDate', e.target.value)}
                      required
                      className="cursor-pointer"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="endDate">End Date</Label>
                    <Input
                      id="endDate"
                      type="date"
                      min={getMinEndDate()}
                      max={getMaxStartDate()}
                      value={formData.endDate}
                      onChange={(e) => handleInputChange('endDate', e.target.value)}
                      required
                      className="cursor-pointer"
                    />
                  </div>
                </div>
                
                {formData.startDate && formData.endDate && (
                  <div className="text-sm text-muted-foreground bg-muted/50 dark:bg-gray-800/50 p-3 rounded-lg">
                    <Calendar className="w-4 h-4 inline mr-2" />
                    Trip Duration: {tripDuration} day{tripDuration > 1 ? 's' : ''}
                  </div>
                )}
              </div>

              {/* Departure Location */}
              <div className="space-y-2">
                <Label htmlFor="departureLocation" className="flex items-center gap-2">
                  <Plane className="w-4 h-4" />
                  Departure Location
                </Label>
                <Input
                  id="departureLocation"
                  type="text"
                  placeholder="e.g., New York, NY or London, UK"
                  value={formData.departureLocation}
                  onChange={(e) => handleInputChange('departureLocation', e.target.value)}
                  required
                />
              </div>

              {/* Destination */}
              <div className="space-y-2">
                <Label htmlFor="destination" className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Destination
                </Label>
                <Input
                  id="destination"
                  type="text"
                  placeholder="e.g., Paris, France or Tokyo, Japan"
                  value={formData.destination}
                  onChange={(e) => handleInputChange('destination', e.target.value)}
                  required
                />
              </div>
            </div>
          )}
        </div>

        {/* Budget Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <button
            type="button"
            onClick={() => toggleSection('budget')}
            className="w-full px-6 py-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between hover:from-green-100 hover:to-emerald-100 dark:hover:from-green-800/30 dark:hover:to-emerald-800/30 transition-colors"
          >
            <div className="flex items-center gap-3">
              <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Budget & Accommodation</h3>
            </div>
            {expandedSections.budget ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </button>
          
          {expandedSections.budget && (
            <div className="p-6 space-y-6">
              {/* Total Trip Budget */}
              <div className="space-y-2">
                <Label htmlFor="totalBudget">What's your total budget for the entire trip?</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400">$</span>
                  <Input
                    id="totalBudget"
                    type="number"
                    min="100"
                    step="50"
                    placeholder="e.g., 1500"
                    value={formData.totalBudget || ''}
                    onChange={(e) => handleInputChange('totalBudget', Number(e.target.value))}
                    className="pl-8"
                    required
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Enter your total budget for the entire trip (not per day)
                </p>
              </div>

              {/* Budget Breakdown */}
              {budgetRecommendations && (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-4 rounded-lg border border-green-200 dark:border-green-700">
                  <div className="flex items-center gap-2 mb-3">
                    <Calculator className="w-4 h-4 text-green-600 dark:text-green-400" />
                    <span className="font-medium text-green-800 dark:text-green-200">Budget Breakdown</span>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                    <div className="bg-white dark:bg-gray-800 p-2 rounded border dark:border-gray-700">
                      <div className="font-medium text-green-700 dark:text-green-400">Daily Budget</div>
                      <div className="text-lg font-bold text-gray-900 dark:text-white">${budgetRecommendations.dailyBudget.toFixed(0)}</div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-2 rounded border dark:border-gray-700">
                      <div className="font-medium text-blue-700 dark:text-blue-400">Accommodation</div>
                      <div className="text-lg font-bold text-gray-900 dark:text-white">${budgetRecommendations.accommodationBudget.toFixed(0)}/day</div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-2 rounded border dark:border-gray-700">
                      <div className="font-medium text-purple-700 dark:text-purple-400">Food</div>
                      <div className="text-lg font-bold text-gray-900 dark:text-white">${budgetRecommendations.foodBudget.toFixed(0)}/day</div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-2 rounded border dark:border-gray-700">
                      <div className="font-medium text-orange-700 dark:text-orange-400">Activities</div>
                      <div className="text-lg font-bold text-gray-900 dark:text-white">${budgetRecommendations.activityBudget.toFixed(0)}/day</div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-2 rounded border dark:border-gray-700">
                      <div className="font-medium text-red-700 dark:text-red-400">Transport</div>
                      <div className="text-lg font-bold text-gray-900 dark:text-white">${budgetRecommendations.transportBudget.toFixed(0)}/day</div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-2 rounded border dark:border-gray-700">
                      <div className="font-medium text-gray-700 dark:text-gray-400">Shopping</div>
                      <div className="text-lg font-bold text-gray-900 dark:text-white">${budgetRecommendations.shoppingBudget.toFixed(0)}/day</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Accommodation Preferences */}
              <div className="space-y-2">
                <Label htmlFor="accommodations">Accommodation Type</Label>
                {budgetRecommendations && (
                  <p className="text-xs text-muted-foreground">
                    Recommended for your budget: {budgetRecommendations.accommodations.join(', ')}
                  </p>
                )}
                <Select
                  value={formData.accommodations}
                  onValueChange={(value) => handleInputChange('accommodations', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select accommodation type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hostel">Hostel (Budget)</SelectItem>
                    <SelectItem value="budget-hotel">Budget Hotel</SelectItem>
                    <SelectItem value="guesthouse">Guesthouse</SelectItem>
                    <SelectItem value="hotel">Standard Hotel</SelectItem>
                    <SelectItem value="apartment">Apartment</SelectItem>
                    <SelectItem value="bed-and-breakfast">Bed & Breakfast</SelectItem>
                    <SelectItem value="resort">Resort</SelectItem>
                    <SelectItem value="luxury-hotel">Luxury Hotel</SelectItem>
                    <SelectItem value="boutique-hotel">Boutique Hotel</SelectItem>
                    <SelectItem value="villa">Private Villa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>

        {/* Activity Preferences Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <button
            type="button"
            onClick={() => toggleSection('preferences')}
            className="w-full px-6 py-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between hover:from-purple-100 hover:to-pink-100 dark:hover:from-purple-800/30 dark:hover:to-pink-800/30 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Heart className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Activity Preferences</h3>
            </div>
            {expandedSections.preferences ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </button>
          
          {expandedSections.preferences && (
            <div className="p-6 space-y-6">
              <div className="space-y-2">
                <Label>What activities interest you?</Label>
                {budgetRecommendations && (
                  <p className="text-xs text-muted-foreground">
                    Recommended for your budget: {budgetRecommendations.activities.join(', ')}
                  </p>
                )}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    'beach', 'mountains', 'city', 'culture', 'food', 'adventure',
                    'shopping', 'nature', 'history', 'art', 'music', 'sports',
                    'luxury-experiences', 'fine-dining', 'exclusive-tours', 'spa-wellness'
                  ].map((activity) => (
                    <label key={activity} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.activities.includes(activity)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            handleInputChange('activities', [...formData.activities, activity])
                          } else {
                            handleInputChange('activities', formData.activities.filter(a => a !== activity))
                          }
                        }}
                        className="rounded border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-primary"
                      />
                      <span className="text-sm capitalize">{activity.replace('-', ' ')}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Advanced Preferences Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <button
            type="button"
            onClick={() => toggleSection('advanced')}
            className="w-full px-6 py-4 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between hover:from-orange-100 hover:to-red-100 dark:hover:from-orange-800/30 dark:hover:to-red-800/30 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Settings className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Advanced Preferences</h3>
              {hasChatbotPreferences() && (
                <span className="px-2 py-1 text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full">
                  AI Updated
                </span>
              )}
            </div>
            {expandedSections.advanced ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </button>
          
          {expandedSections.advanced && (
            <div className="p-6 space-y-6">
              {hasChatbotPreferences() && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4 mb-4">
                  <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                    <Shield className="w-4 h-4" />
                    <span className="text-sm font-medium">AI Assistant has already configured your preferences!</span>
                  </div>
                  <p className="text-xs text-green-600 dark:text-green-500 mt-1">
                    You can still modify these settings if needed, or continue with the AI-recommended preferences.
                  </p>
                </div>
              )}

              {/* Travel Style */}
              <div className="space-y-2">
                <Label>Travel Style</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {['Adventure', 'Relaxation', 'Cultural', 'Luxury', 'Budget-friendly', 'Family-friendly', 'Solo travel', 'Group travel', 'Business', 'Romantic'].map((style) => (
                    <label key={style} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.personalPreferences.travelStyle.includes(style)}
                        onChange={(e) => handlePreferenceChange('travelStyle', style, e.target.checked)}
                        className="rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <span className="text-sm">{style}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Interests */}
              <div className="space-y-2">
                <Label>Interests & Activities</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {['Museums', 'Nature', 'Shopping', 'Food & Dining', 'History', 'Art', 'Music', 'Sports', 'Photography', 'Nightlife', 'Wellness', 'Technology'].map((interest) => (
                    <label key={interest} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.personalPreferences.interests.includes(interest)}
                        onChange={(e) => handlePreferenceChange('interests', interest, e.target.checked)}
                        className="rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <span className="text-sm">{interest}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Dietary Restrictions */}
              <div className="space-y-2">
                <Label>Dietary Preferences</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {['Vegetarian', 'Vegan', 'Halal', 'Kosher', 'Gluten-free', 'Dairy-free', 'Nut-free', 'Seafood-free', 'No restrictions'].map((diet) => (
                    <label key={diet} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.personalPreferences.dietaryRestrictions.includes(diet)}
                        onChange={(e) => handlePreferenceChange('dietaryRestrictions', diet, e.target.checked)}
                        className="rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <span className="text-sm">{diet}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Accessibility */}
              <div className="space-y-2">
                <Label>Accessibility Requirements</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {['Wheelchair accessible', 'Elevator access', 'Ramp access', 'Audio guides', 'Visual guides', 'Sign language', 'No special requirements'].map((access) => (
                    <label key={access} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.personalPreferences.accessibility.includes(access)}
                        onChange={(e) => handlePreferenceChange('accessibility', access, e.target.checked)}
                        className="rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <span className="text-sm">{access}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Travel Pace */}
              <div className="space-y-2">
                <Label>Preferred Travel Pace</Label>
                <Select value={formData.personalPreferences.pace} onValueChange={(value) => handlePreferenceChange('pace', value, true)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your preferred pace" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="relaxed">Relaxed - Take it easy, lots of breaks</SelectItem>
                    <SelectItem value="moderate">Moderate - Balanced activity and rest</SelectItem>
                    <SelectItem value="active">Active - Packed schedule, maximize experiences</SelectItem>
                    <SelectItem value="intense">Intense - Non-stop adventure, minimal downtime</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Group Size */}
              <div className="space-y-2">
                <Label>Group Size</Label>
                <Select value={formData.personalPreferences.groupSize} onValueChange={(value) => handlePreferenceChange('groupSize', value, true)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select group size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="solo">Solo Traveler</SelectItem>
                    <SelectItem value="couple">Couple (2 people)</SelectItem>
                    <SelectItem value="small-group">Small Group (3-5 people)</SelectItem>
                    <SelectItem value="large-group">Large Group (6+ people)</SelectItem>
                    <SelectItem value="family">Family with Children</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Special Requirements */}
              <div className="space-y-2">
                <Label htmlFor="specialRequirements">Special Requirements or Requests</Label>
                <textarea
                  id="specialRequirements"
                  placeholder="Any special needs, allergies, or specific requests..."
                  value={formData.personalPreferences.specialRequirements}
                  onChange={(e) => handlePreferenceChange('specialRequirements', e.target.value, true)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
                  rows={3}
                />
              </div>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-center">
          <Button type="submit" className="w-full bg-white text-blue-600 hover:bg-gray-50" size="lg" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Your Perfect Itinerary...
              </>
            ) : (
              <>
                <Zap className="mr-2 h-4 w-4" />
                Generate Travel Itinerary
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
