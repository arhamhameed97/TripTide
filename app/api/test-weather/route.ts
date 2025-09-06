import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  try {
    // Test weather API with sample data
    const testDestination = 'Paris, France';
    const testStartDate = '2024-12-20';
    const testEndDate = '2024-12-27';
    
    console.log('Testing weather API with:', { testDestination, testStartDate, testEndDate });
    
    const weatherResponse = await fetch(`http://localhost:3000/api/weather?destination=${encodeURIComponent(testDestination)}&startDate=${testStartDate}&endDate=${testEndDate}`);
    
    if (weatherResponse.ok) {
      const weatherData = await weatherResponse.json();
      return NextResponse.json({
        success: true,
        weatherData,
        message: 'Weather API test successful'
      });
    } else {
      const errorText = await weatherResponse.text();
      return NextResponse.json({
        success: false,
        error: errorText,
        status: weatherResponse.status,
        message: 'Weather API test failed'
      });
    }
  } catch (error) {
    console.error('Weather test error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Weather API test failed'
    });
  }
}



