'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { 
  Cloud, 
  Thermometer, 
  Droplets, 
  Wind, 
  Newspaper, 
  ExternalLink, 
  Clock,
  Info
} from 'lucide-react'

interface WeatherData {
  destination: string
  travelDates: Array<{
    date: string
    dayOfWeek: string
    temperature: {
      min: number
      max: number
      average: number
    }
    humidity: number
    description: string
    icon: string
    windSpeed: number
    precipitation: number
  }>
  units: string
}

interface NewsData {
  destination: string
  travelDates: {
    startDate: string
    endDate: string
  }
  news: Array<{
    title: string
    description: string
    url: string
    publishedAt: string
    source: string
    imageUrl: string | null
    relevance: 'high' | 'medium' | 'low'
  }>
  totalResults: number
}

interface WeatherAndNewsProps {
  weather: WeatherData | null
  news: NewsData | null
}

export default function WeatherAndNews({ weather, news }: WeatherAndNewsProps) {
  const [activeTab, setActiveTab] = useState('weather')

  const getWeatherIcon = (iconCode: string) => {
    const iconMap: { [key: string]: string } = {
      '01d': '☀️', '01n': '🌙', '02d': '⛅', '02n': '☁️',
      '03d': '☁️', '03n': '☁️', '04d': '☁️', '04n': '☁️',
      '09d': '🌧️', '09n': '🌧️', '10d': '🌦️', '10n': '🌧️',
      '11d': '⛈️', '11n': '⛈️', '13d': '🌨️', '13n': '🌨️',
      '50d': '🌫️', '50n': '🌫️'
    }
    return iconMap[iconCode] || '🌤️'
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    })
  }

  const formatNewsDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getRelevanceColor = (relevance: string) => {
    switch (relevance) {
      case 'high': return 'bg-green-100 text-green-800 border-green-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }

  const hasWeatherData = weather && weather.travelDates && weather.travelDates.length > 0
  const hasNewsData = news && news.news && news.news.length > 0

  return (
    <Card className="bg-gradient-to-r from-blue-50 to-green-50 border-blue-200">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-semibold text-blue-900 flex items-center gap-2">
          <Info className="w-5 h-5" />
          Destination Information
        </CardTitle>
        <CardDescription className="text-blue-700">
          Weather forecast and local news for your trip
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="weather" className="flex items-center gap-2">
              <Cloud className="w-4 h-4" />
              Weather
              {hasWeatherData && <span className="text-xs">({weather.travelDates.length} days)</span>}
            </TabsTrigger>
            <TabsTrigger value="news" className="flex items-center gap-2">
              <Newspaper className="w-4 h-4" />
              News
              {hasNewsData && <span className="text-xs">({news.news.length})</span>}
            </TabsTrigger>
          </TabsList>

          {/* Weather Tab */}
          <TabsContent value="weather" className="mt-4">
            {!hasWeatherData ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">🌤️</div>
                <p className="text-gray-600">Weather forecast will be available here</p>
                <p className="text-sm text-gray-500 mt-2">Check back soon for detailed weather information</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {weather.travelDates.map((day, index) => (
                    <div key={index} className="bg-white rounded-lg p-3 border border-blue-100 shadow-sm">
                      <div className="text-center mb-2">
                        <div className="text-xl mb-1">{getWeatherIcon(day.icon)}</div>
                        <div className="font-medium text-gray-900 text-sm">{day.dayOfWeek}</div>
                        <div className="text-xs text-gray-600">{formatDate(day.date)}</div>
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <Thermometer className="w-3 h-3 text-red-500" />
                            <span className="text-xs text-gray-600">Temp</span>
                          </div>
                          <div className="text-right">
                            <div className="font-medium text-gray-900 text-sm">
                              {Math.round(day.temperature.max)}°{weather.units === 'metric' ? 'C' : 'F'}
                            </div>
                            <div className="text-xs text-gray-500">
                              {Math.round(day.temperature.min)}°{weather.units === 'metric' ? 'C' : 'F'}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <Droplets className="w-3 h-3 text-blue-500" />
                            <span className="text-xs text-gray-600">Humidity</span>
                          </div>
                          <span className="font-medium text-gray-900 text-sm">{day.humidity}%</span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <Wind className="w-3 h-3 text-gray-500" />
                            <span className="text-xs text-gray-600">Wind</span>
                          </div>
                          <span className="font-medium text-gray-900 text-sm">
                            {Math.round(day.windSpeed)} {weather.units === 'metric' ? 'm/s' : 'mph'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="mt-2 pt-2 border-t border-gray-100">
                        <div className="text-xs text-gray-700 capitalize text-center">
                          {day.description}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="p-3 bg-blue-100 rounded-lg">
                  <div className="text-sm text-blue-800">
                    <strong>Weather Tips:</strong> Pack accordingly for {weather.travelDates[0]?.description} weather. 
                    {weather.travelDates.some(day => day.precipitation > 0) && ' Bring an umbrella for rainy days.'}
                    {weather.travelDates.some(day => day.temperature.max > 25) && ' Don\'t forget sunscreen for warm days.'}
                    {weather.travelDates.some(day => day.temperature.min < 10) && ' Pack warm clothes for cooler temperatures.'}
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          {/* News Tab */}
          <TabsContent value="news" className="mt-4">
            {!hasNewsData ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">📰</div>
                <p className="text-gray-600">Loading local news...</p>
                <p className="text-sm text-gray-500 mt-2">Please wait while we fetch the latest news</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {news.news.slice(0, 4).map((article, index) => (
                    <div key={index} className="bg-white rounded-lg p-3 border border-green-100 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-start gap-2">
                        {article.imageUrl && (
                          <div className="flex-shrink-0">
                            <img 
                              src={article.imageUrl} 
                              alt={article.title}
                              className="w-12 h-12 object-cover rounded"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none'
                              }}
                            />
                          </div>
                        )}
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getRelevanceColor(article.relevance)}`}>
                              {article.relevance === 'high' ? 'High' : 
                               article.relevance === 'medium' ? 'Med' : 'Low'}
                            </span>
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatNewsDate(article.publishedAt)}
                            </span>
                          </div>
                          
                          <h3 className="font-medium text-gray-900 mb-1 text-sm line-clamp-2">
                            {article.title}
                          </h3>
                          
                          <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                            {truncateText(article.description, 100)}
                          </p>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500 font-medium">
                              {article.source}
                            </span>
                            
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => window.open(article.url, '_blank')}
                              className="text-xs h-6 px-2"
                            >
                              <ExternalLink className="w-3 h-3 mr-1" />
                              Read
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="p-3 bg-green-100 rounded-lg">
                  <div className="text-sm text-green-800">
                    <strong>Travel Tips:</strong> Stay informed about local events, weather alerts, and any travel advisories. 
                    {news.news.some(article => article.relevance === 'high') && ' High-relevance articles are marked for important updates.'}
                  </div>
                </div>
                
                {news.totalResults > news.news.length && (
                  <div className="text-center">
                    <p className="text-sm text-gray-600">
                      Showing {news.news.length} of {news.totalResults} articles
                    </p>
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
