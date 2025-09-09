import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req: Request) {
  try {
    const { 
      originalItinerary, 
      tripDetails,
      travelPreferences, 
      userFeedback,
      targetDays, // Array of day numbers to modify (e.g., [2, 3])
      modificationType // 'add_activity', 'modify_day', 'add_transport', etc.
    } = await req.json();

    // Validate required data
    if (!originalItinerary || !tripDetails || !userFeedback) {
      return NextResponse.json(
        { error: 'Missing required data for targeted itinerary update' },
        { status: 400 }
      );
    }

    // If no target days specified, default to all days (fallback to current behavior)
    const daysToModify = targetDays && targetDays.length > 0 ? targetDays : originalItinerary.map((day: any) => day.day);
    
    console.log('Targeted update - Days to modify:', daysToModify);
    console.log('User feedback:', userFeedback);

    // Check for API key
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
      console.error('GEMINI_API_KEY is missing or not configured');
      return NextResponse.json(
        { 
          error: 'AI service is not configured. Please set up your GEMINI_API_KEY in .env.local file. Get your API key from: https://makersuite.google.com/app/apikey',
          setupRequired: true
        },
        { status: 500 }
      );
    }

    // Initialize Google Gemini
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Extract trip information
    const { totalBudget, days } = tripDetails;
    const season = new Date(tripDetails.startDate).getMonth() >= 2 && new Date(tripDetails.startDate).getMonth() <= 4 ? 'Spring' :
                   new Date(tripDetails.startDate).getMonth() >= 5 && new Date(tripDetails.startDate).getMonth() <= 7 ? 'Summer' :
                   new Date(tripDetails.startDate).getMonth() >= 8 && new Date(tripDetails.startDate).getMonth() <= 10 ? 'Fall' : 'Winter';
    const monthName = new Date(tripDetails.startDate).toLocaleString('default', { month: 'long' });

    // Create a copy of the original itinerary to modify
    let updatedItinerary = JSON.parse(JSON.stringify(originalItinerary));

    // Build context about the original itinerary for the AI
    const originalItineraryContext = originalItinerary.map((day: any) => 
      `Day ${day.day}: ${day.hourlyActivities?.map((activity: any) => 
        `${activity.hour} - ${activity.activity} at ${activity.location}`
      ).join(', ') || 'No activities'}`
    ).join('\n');

    // Create targeted modification prompt
    const prompt = `You are a travel itinerary expert. I need you to make TARGETED modifications to specific days of an existing travel itinerary based on user feedback.

ORIGINAL ITINERARY:
${originalItineraryContext}

TRIP DETAILS:
- Traveler: ${tripDetails.name}
- Destination: ${tripDetails.destination}
- Dates: ${tripDetails.startDate} to ${tripDetails.endDate} (${season} - ${monthName})
- Total Budget: $${totalBudget}
- Days to modify: ${daysToModify.join(', ')}

USER FEEDBACK:
"${userFeedback}"

CRITICAL INSTRUCTIONS:
1. ONLY modify the days specified in "Days to modify" (${daysToModify.join(', ')})
2. PRESERVE ALL OTHER DAYS EXACTLY AS THEY ARE in the original itinerary
3. For modified days, maintain the same time structure and flow as the original
4. Make changes that directly address the user's feedback
5. Keep the same budget constraints and preferences

MODIFICATION GUIDELINES:
- If adding car rental: Include car rental pickup/dropoff activities and adjust transportation suggestions
- If adding specific activities: Integrate them naturally into the existing schedule
- If modifying timing: Adjust other activities accordingly but keep the day's overall structure
- If changing locations: Ensure they're logistically feasible with the rest of the day

REQUIRED FORMAT FOR EACH ACTIVITY:
- Restaurants: "Restaurant Name, Full Street Address, City, Postal Code"
- Hotels: "Hotel Name, Full Street Address, City, Postal Code"  
- Attractions: "Attraction Name, Full Street Address, City, Postal Code"
- Museums: "Museum Name, Full Street Address, City, Postal Code"
- Cafes: "Cafe Name, Full Street Address, City, Postal Code"
- Shopping: "Store/Market Name, Full Street Address, City, Postal Code"
- Parks: "Park Name, Full Street Address, City, Postal Code"
- Car Rental: "Car Rental Company Name, Full Street Address, City, Postal Code"

⚠️ CRITICAL: Use REAL, SPECIFIC business names and full addresses. NO generic terms allowed.

Return ONLY a valid JSON array containing ONLY the modified days. Each item should have: day, hourlyActivities (array of objects with hour, activity, location, estimatedCost), transportSuggestion.

Example format for modified days only:
[
  {
    "day": 2,
    "hourlyActivities": [
      {"hour": "8:00 AM", "activity": "Breakfast at Specific Restaurant", "location": "Restaurant Name, 123 Main St, City, State, ZIP", "estimatedCost": "$25"},
      {"hour": "9:00 AM", "activity": "Pick up rental car", "location": "Hertz Car Rental, 456 Airport Blvd, City, State, ZIP", "estimatedCost": "$80"},
      {"hour": "10:00 AM", "activity": "Drive to Specific Location", "location": "Destination Name, 789 Destination St, City, State, ZIP", "estimatedCost": "$15"}
    ],
    "transportSuggestion": "Use rental car for the day. Return car by 6 PM."
  }
]`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const content = response.text();
    
    // Clean the response to ensure it's valid JSON
    const cleanedContent = content.replace(/```json\n?|\n?```/g, '').trim();
    
    let modifiedDays;
    try {
      modifiedDays = JSON.parse(cleanedContent);
    } catch (parseError) {
      console.error('JSON parsing failed, trying to clean the response');
      
      // Try to extract JSON from the response more aggressively
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        let cleanedJson = jsonMatch[0].replace(/[^\x20-\x7E]/g, '');
        
        // Fix common JSON syntax issues
        cleanedJson = cleanedJson
          .replace(/,(\s*[}\]])/g, '$1')
          .replace(/([^"\\])\s*\n\s*([^"\\])/g, '$1 $2')
          .replace(/([^"\\])\s*,\s*(\s*[}\]])/g, '$1$2');
        
        try {
          modifiedDays = JSON.parse(cleanedJson);
        } catch (finalError) {
          console.error('Final JSON parsing failed:', finalError);
          return NextResponse.json(
            { error: 'Failed to parse AI response for targeted update' },
            { status: 500 }
          );
        }
      } else {
        return NextResponse.json(
          { error: 'No valid JSON found in AI response' },
          { status: 500 }
        );
      }
    }

    // Merge the modified days back into the original itinerary
    modifiedDays.forEach((modifiedDay: any) => {
      const dayIndex = updatedItinerary.findIndex((day: any) => day.day === modifiedDay.day);
      if (dayIndex !== -1) {
        updatedItinerary[dayIndex] = modifiedDay;
        console.log(`Updated day ${modifiedDay.day} with new activities`);
      }
    });

    console.log('Targeted update completed. Modified days:', modifiedDays.map((d: any) => d.day));

    return NextResponse.json({
      itinerary: updatedItinerary,
      modifiedDays: modifiedDays.map((d: any) => d.day),
      message: `Successfully updated ${modifiedDays.length} day(s) based on your feedback`
    });

  } catch (error) {
    console.error('Targeted itinerary update error:', error);
    return NextResponse.json(
      { error: 'Failed to update itinerary' },
      { status: 500 }
    );
  }
}
