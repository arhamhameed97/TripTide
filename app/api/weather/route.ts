import { NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const destination = searchParams.get('destination');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    console.log('Weather API called with:', { destination, startDate, endDate });

    if (!destination || !startDate || !endDate) {
      console.error('Missing parameters:', { destination, startDate, endDate });
      return NextResponse.json(
        { error: 'Missing required parameters: destination, startDate, endDate' },
        { status: 400 }
      );
    }

    // Extract city name from destination (e.g., "Paris, France" -> "Paris")
    const cityName = destination.split(',')[0].trim();
    console.log('Extracted city name:', cityName);

    try {
      // Use OpenWeatherMap API for weather forecast
      const weatherResponse = await axios.get(
        `https://api.openweathermap.org/data/2.5/forecast`,
        {
          params: {
            q: cityName,
            appid: process.env.OPENWEATHER_API_KEY || 'demo_key',
            units: 'metric', // Celsius
            cnt: 40 // 5 days forecast (8 readings per day)
          }
        }
      );

      const weatherData = weatherResponse.data;
      
      // Process and format weather data for the travel dates
      const startDateObj = new Date(startDate);
      const endDateObj = new Date(endDate);
      const travelDates = [];
      
      // Generate array of dates between start and end
      for (let d = new Date(startDateObj); d <= endDateObj; d.setDate(d.getDate() + 1)) {
        travelDates.push(new Date(d));
      }

      // Filter weather data for travel dates
      const travelWeather = travelDates.map(date => {
        const dateStr = date.toISOString().split('T')[0];
        const dayForecasts = weatherData.list.filter((forecast: any) => {
          const forecastDate = new Date(forecast.dt * 1000).toISOString().split('T')[0];
          return forecastDate === dateStr;
        });

        if (dayForecasts.length > 0) {
          // Calculate daily averages
          const temps = dayForecasts.map((f: any) => f.main.temp);
          const humidity = dayForecasts.map((f: any) => f.main.humidity);
          const descriptions = dayForecasts.map((f: any) => f.weather[0].description);
          
          // Get most common weather description
          const mostCommonDesc = descriptions.reduce((acc: any, curr: string) => {
            acc[curr] = (acc[curr] || 0) + 1;
            return acc;
          }, {});
          
          const weatherDesc = Object.keys(mostCommonDesc).reduce((a, b) => 
            mostCommonDesc[a] > mostCommonDesc[b] ? a : b
          );

          return {
            date: dateStr,
            dayOfWeek: date.toLocaleDateString('en-US', { weekday: 'long' }),
            temperature: {
              min: Math.min(...temps),
              max: Math.max(...temps),
              average: temps.reduce((a: number, b: number) => a + b, 0) / temps.length
            },
            humidity: Math.round(humidity.reduce((a: number, b: number) => a + b, 0) / humidity.length),
            description: weatherDesc,
            icon: dayForecasts[0].weather[0].icon,
            windSpeed: dayForecasts[0].wind.speed,
            precipitation: dayForecasts[0].rain ? dayForecasts[0].rain['3h'] || 0 : 0
          };
        } else {
          // Fallback data if no forecast available
          return {
            date: dateStr,
            dayOfWeek: date.toLocaleDateString('en-US', { weekday: 'long' }),
            temperature: { min: 15, max: 25, average: 20 },
            humidity: 60,
            description: 'Partly cloudy',
            icon: '02d',
            windSpeed: 5,
            precipitation: 0
          };
        }
      });

      return NextResponse.json({
        destination: cityName,
        travelDates: travelWeather,
        units: 'metric'
      });

    } catch (weatherError) {
      console.error('Weather API error:', weatherError);
      
      // Generate fallback travel dates
      const startDateObj = new Date(startDate);
      const endDateObj = new Date(endDate);
      const fallbackTravelDates = [];
      
      for (let d = new Date(startDateObj); d <= endDateObj; d.setDate(d.getDate() + 1)) {
        fallbackTravelDates.push(new Date(d));
      }
      
      // Fallback weather data
      const fallbackWeather = fallbackTravelDates.map(date => ({
        date: date.toISOString().split('T')[0],
        dayOfWeek: date.toLocaleDateString('en-US', { weekday: 'long' }),
        temperature: { min: 15, max: 25, average: 20 },
        humidity: 60,
        description: 'Partly cloudy',
        icon: '02d',
        windSpeed: 5,
        precipitation: 0
      }));

      return NextResponse.json({
        destination: cityName,
        travelDates: fallbackWeather,
        units: 'metric',
        note: 'Using fallback weather data'
      });
    }

  } catch (error) {
    console.error('Weather API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch weather data' },
      { status: 500 }
    );
  }
}
