'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Cloud, Thermometer, Droplets, Wind } from 'lucide-react'

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

interface WeatherForecastProps {
  weather: WeatherData | null
}

export default function WeatherForecast({ weather }: WeatherForecastProps) {
  // Debug logging
  console.log('WeatherForecast Debug:', {
    weather,
    hasWeather: !!weather,
    hasTravelDates: weather?.travelDates,
    travelDatesLength: weather?.travelDates?.length,
    destination: weather?.destination
  })

  if (!weather || !weather.travelDates || !weather.travelDates.length) {
    // Show fallback weather data if no weather is available
    return (
      <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-semibold text-blue-900 flex items-center gap-2">
            <Cloud className="w-5 h-5" />
            Weather Forecast
          </CardTitle>
          <CardDescription className="text-blue-700">
            Weather data is being loaded...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="text-4xl mb-4">🌤️</div>
            <p className="text-gray-600">Weather forecast will be available here</p>
            <p className="text-sm text-gray-500 mt-2">Check back soon for detailed weather information</p>
            {weather && (
              <div className="mt-4 p-3 bg-gray-100 rounded text-left text-xs">
                <p><strong>Debug Info:</strong></p>
                <p>Weather object: {JSON.stringify(weather, null, 2)}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  const getWeatherIcon = (iconCode: string) => {
    const iconMap: { [key: string]: string } = {
      '01d': '☀️', // clear sky day
      '01n': '🌙', // clear sky night
      '02d': '⛅', // few clouds day
      '02n': '☁️', // few clouds night
      '03d': '☁️', // scattered clouds
      '03n': '☁️',
      '04d': '☁️', // broken clouds
      '04n': '☁️',
      '09d': '🌧️', // shower rain
      '09n': '🌧️',
      '10d': '🌦️', // rain day
      '10n': '🌧️', // rain night
      '11d': '⛈️', // thunderstorm
      '11n': '⛈️',
      '13d': '🌨️', // snow
      '13n': '🌨️',
      '50d': '🌫️', // mist
      '50n': '🌫️'
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

  return (
    <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-semibold text-blue-900 flex items-center gap-2">
          <Cloud className="w-5 h-5" />
          Weather Forecast for {weather.destination}
        </CardTitle>
        <CardDescription className="text-blue-700">
          Daily weather conditions during your trip
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {weather.travelDates.map((day, index) => (
            <div key={index} className="bg-white rounded-lg p-4 border border-blue-100 shadow-sm">
              <div className="text-center mb-3">
                <div className="text-2xl mb-1">{getWeatherIcon(day.icon)}</div>
                <div className="font-medium text-gray-900">{day.dayOfWeek}</div>
                <div className="text-sm text-gray-600">{formatDate(day.date)}</div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Thermometer className="w-4 h-4 text-red-500" />
                    <span className="text-sm text-gray-600">Temperature</span>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-gray-900">
                      {Math.round(day.temperature.max)}°{weather.units === 'metric' ? 'C' : 'F'}
                    </div>
                    <div className="text-xs text-gray-500">
                      {Math.round(day.temperature.min)}°{weather.units === 'metric' ? 'C' : 'F'}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Droplets className="w-4 h-4 text-blue-500" />
                    <span className="text-sm text-gray-600">Humidity</span>
                  </div>
                  <span className="font-medium text-gray-900">{day.humidity}%</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Wind className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Wind</span>
                  </div>
                  <span className="font-medium text-gray-900">
                    {Math.round(day.windSpeed)} {weather.units === 'metric' ? 'm/s' : 'mph'}
                  </span>
                </div>
                
                {day.precipitation > 0 && (
                  <div className="text-center pt-2 border-t border-gray-100">
                    <div className="text-sm text-blue-600 font-medium">
                      💧 {day.precipitation}mm rain expected
                    </div>
                  </div>
                )}
              </div>
              
              <div className="mt-3 pt-2 border-t border-gray-100">
                <div className="text-sm text-gray-700 capitalize text-center">
                  {day.description}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 p-3 bg-blue-100 rounded-lg">
          <div className="text-sm text-blue-800">
            <strong>Weather Tips:</strong> Pack accordingly for {weather.travelDates[0]?.description} weather. 
            {weather.travelDates.some(day => day.precipitation > 0) && ' Bring an umbrella for rainy days.'}
            {weather.travelDates.some(day => day.temperature.max > 25) && ' Don\'t forget sunscreen for warm days.'}
            {weather.travelDates.some(day => day.temperature.min < 10) && ' Pack warm clothes for cooler temperatures.'}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
