'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { MessageSquare, RefreshCw, Loader2, CheckCircle, AlertCircle, Wand2, Sparkles, Calendar, Target } from 'lucide-react'

interface ItineraryFeedbackProps {
  itinerary: any[]
  tripData: any
  onItineraryUpdate: (updatedItinerary: any[]) => void
}

export default function ItineraryFeedback({ itinerary, tripData, onItineraryUpdate }: ItineraryFeedbackProps) {
  const [feedback, setFeedback] = useState('')
  const [isRegenerating, setIsRegenerating] = useState(false)
  const [lastFeedback, setLastFeedback] = useState('')
  const [regenerationStatus, setRegenerationStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [modificationMode, setModificationMode] = useState<'all' | 'targeted'>('targeted')
  const [selectedDays, setSelectedDays] = useState<number[]>([])

  const handleSubmitFeedback = async () => {
    if (!feedback.trim()) return

    // Validate day selection for targeted mode
    if (modificationMode === 'targeted' && selectedDays.length === 0) {
      alert('Please select at least one day to modify')
      return
    }

    setIsRegenerating(true)
    setRegenerationStatus('idle')
    setLastFeedback(feedback)

    try {
      // Choose API endpoint based on modification mode
      const apiEndpoint = modificationMode === 'targeted' 
        ? '/api/targeted-itinerary-update' 
        : '/api/regenerate-itinerary'

      const requestBody = modificationMode === 'targeted' 
        ? {
            originalItinerary: itinerary,
            tripDetails: tripData,
            travelPreferences: tripData.personalPreferences,
            userFeedback: feedback.trim(),
            targetDays: selectedDays,
            modificationType: 'targeted_feedback'
          }
        : {
            originalItinerary: itinerary,
            tripDetails: tripData,
            travelPreferences: tripData.personalPreferences,
            userFeedback: feedback.trim(),
            modificationType: 'feedback'
          }

      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      if (response.ok) {
        const updatedItinerary = await response.json()
        
        console.log('ItineraryFeedback: API Response', {
          hasItinerary: !!updatedItinerary.itinerary,
          itineraryLength: updatedItinerary.itinerary?.length,
          message: updatedItinerary.message
        })
        
        // Update the itinerary in the parent component
        console.log('ItineraryFeedback: Calling onItineraryUpdate with:', {
          itineraryLength: updatedItinerary.itinerary?.length,
          modifiedDays: updatedItinerary.modifiedDays,
          message: updatedItinerary.message
        })
        onItineraryUpdate(updatedItinerary.itinerary)
        
        // Update localStorage
        localStorage.setItem('itinerary', JSON.stringify(updatedItinerary.itinerary))
        console.log('ItineraryFeedback: Updated localStorage with new itinerary')
        
        setRegenerationStatus('success')
        setFeedback('') // Clear the feedback input
        
        // Show success message for 3 seconds
        setTimeout(() => {
          setRegenerationStatus('idle')
        }, 3000)
      } else {
        const error = await response.json()
        console.error('Regeneration error:', error)
        setRegenerationStatus('error')
        
        // Show specific error message for API key setup
        if (error.setupRequired) {
          alert('Setup Required: Please configure your Google Gemini API key in the .env.local file. Get your API key from: https://makersuite.google.com/app/apikey')
        }
        
        // Show error message for 5 seconds
        setTimeout(() => {
          setRegenerationStatus('idle')
        }, 5000)
      }
    } catch (error) {
      console.error('Network error:', error)
      setRegenerationStatus('error')
      
      // Show error message for 5 seconds
      setTimeout(() => {
        setRegenerationStatus('idle')
      }, 5000)
    } finally {
      setIsRegenerating(false)
    }
  }

  const quickSuggestions = [
    { text: "Add car rental for day trips", icon: "🚗" },
    { text: "More cultural activities", icon: "🏛️" },
    { text: "Add restaurants", icon: "🍽️" },
    { text: "Less packed schedule", icon: "⏰" },
    { text: "Shopping time", icon: "🛍️" },
    { text: "Outdoor activities", icon: "🌲" }
  ]

  const handleQuickSuggestion = (suggestion: string) => {
    setFeedback(suggestion)
  }

  return (
    <Card className="mb-6 border-0 shadow-lg bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-blue-900/20 dark:via-gray-800 dark:to-purple-900/20">
      <CardHeader className="text-center pb-4">
        <div className="flex items-center justify-center gap-3 mb-2">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
            <Wand2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <CardTitle className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Improve Your Itinerary
          </CardTitle>
          <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-full">
            <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
        </div>
        <p className="text-gray-600 dark:text-gray-300 text-sm max-w-md mx-auto">
          Share your thoughts and we'll enhance your travel plan instantly
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Status Messages */}
        {regenerationStatus === 'success' && (
          <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-xl">
            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-green-800 dark:text-green-200">
                Itinerary updated successfully!
              </p>
              <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                Your changes have been applied to your travel plan.
              </p>
            </div>
          </div>
        )}

        {regenerationStatus === 'error' && (
          <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-red-800 dark:text-red-200">
                Unable to update itinerary
              </p>
              <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                Please try again or check your connection.
              </p>
            </div>
          </div>
        )}

        {/* Modification Mode Selection */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Modification Mode
          </Label>
          <div className="flex gap-2">
            <Button
              variant={modificationMode === 'targeted' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setModificationMode('targeted')}
              disabled={isRegenerating}
              className="flex items-center gap-2"
            >
              <Target className="w-4 h-4" />
              Targeted (Recommended)
            </Button>
            <Button
              variant={modificationMode === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setModificationMode('all')}
              disabled={isRegenerating}
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Regenerate All
            </Button>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {modificationMode === 'targeted' 
              ? 'Only modify selected days, preserving the rest of your itinerary'
              : 'Regenerate the entire itinerary from scratch'
            }
          </p>
        </div>

        {/* Day Selection (only show for targeted mode) */}
        {modificationMode === 'targeted' && (
          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Select Days to Modify
            </Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {itinerary.map((day, index) => (
                <Button
                  key={day.day}
                  variant={selectedDays.includes(day.day) ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    if (selectedDays.includes(day.day)) {
                      setSelectedDays(selectedDays.filter(d => d !== day.day))
                    } else {
                      setSelectedDays([...selectedDays, day.day])
                    }
                  }}
                  disabled={isRegenerating}
                  className="flex items-center gap-2"
                >
                  <Calendar className="w-3 h-3" />
                  Day {day.day}
                </Button>
              ))}
            </div>
            {selectedDays.length > 0 && (
              <p className="text-xs text-blue-600 dark:text-blue-400">
                Selected: {selectedDays.sort((a, b) => a - b).join(', ')}
              </p>
            )}
          </div>
        )}

        {/* Quick Suggestions */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Quick suggestions
          </Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {quickSuggestions.map((suggestion, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => handleQuickSuggestion(suggestion.text)}
                disabled={isRegenerating}
                className="h-auto py-3 px-3 text-left justify-start hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200"
              >
                <span className="text-lg mr-2">{suggestion.icon}</span>
                <span className="text-xs font-medium">{suggestion.text}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Feedback Input */}
        <div className="space-y-3">
          <Label htmlFor="itinerary-feedback" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Tell us what you'd like to change
          </Label>
          <Textarea
            id="itinerary-feedback"
            placeholder="Example: Add more museums and art galleries, include vegetarian restaurants, make the schedule more relaxed..."
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            className="min-h-[100px] resize-none border-gray-200 dark:border-gray-600 focus:border-blue-400 dark:focus:border-blue-500 focus:ring-blue-400 dark:focus:ring-blue-500"
            disabled={isRegenerating}
          />
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>Be specific for better results</span>
            {feedback.length > 0 && (
              <span className="text-blue-600 dark:text-blue-400">
                {feedback.length} characters
              </span>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-center pt-2">
          <Button
            onClick={handleSubmitFeedback}
            disabled={!feedback.trim() || isRegenerating || (modificationMode === 'targeted' && selectedDays.length === 0)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isRegenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {modificationMode === 'targeted' ? 'Updating Selected Days...' : 'Regenerating Itinerary...'}
              </>
            ) : (
              <>
                {modificationMode === 'targeted' ? (
                  <>
                    <Target className="w-4 h-4 mr-2" />
                    Update Selected Days
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Regenerate All
                  </>
                )}
              </>
            )}
          </Button>
        </div>

        {/* Helpful Tips */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/10 dark:to-purple-900/10 rounded-xl p-4 border border-blue-100 dark:border-blue-800/30">
          <div className="flex items-start gap-3">
            <div className="p-1 bg-blue-100 dark:bg-blue-900/30 rounded-full mt-0.5">
              <MessageSquare className="w-3 h-3 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-xs font-medium text-blue-800 dark:text-blue-200 mb-1">
                Pro tip
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-400 leading-relaxed">
                {modificationMode === 'targeted' 
                  ? 'Use "Targeted" mode to modify only specific days while preserving the rest of your itinerary. Perfect for adding car rentals, specific activities, or adjusting individual days.'
                  : 'Use "Regenerate All" to completely rebuild your itinerary from scratch. This will change all days based on your feedback.'
                }
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}