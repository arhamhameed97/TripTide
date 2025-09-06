import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req: Request) {
  try {
    const { 
      originalItinerary, 
      updatedBudget, 
      travelPreferences, 
      tripDetails 
    } = await req.json();

    // Validate required data
    if (!originalItinerary || !updatedBudget || !tripDetails) {
      return NextResponse.json(
        { error: 'Missing required data for itinerary regeneration' },
        { status: 400 }
      );
    }

    // Extract budget information
    const { totalBudget, days } = tripDetails;
    const { 
      accommodation, 
      food, 
      activities, 
      transport, 
      shopping, 
      misc 
    } = updatedBudget;

    // Calculate budget changes
    const originalBudget = {
      accommodation: Math.round(totalBudget * 0.35),
      food: Math.round(totalBudget * 0.25),
      activities: Math.round(totalBudget * 0.20),
      transport: Math.round(totalBudget * 0.15),
      shopping: Math.round(totalBudget * 0.05),
      misc: 0
    };

    const budgetChanges = {
      accommodation: accommodation - originalBudget.accommodation,
      food: food - originalBudget.food,
      activities: activities - originalBudget.activities,
      transport: transport - originalBudget.transport,
      shopping: shopping - originalBudget.shopping,
      misc: misc - originalBudget.misc
    };

    // Generate new itinerary using Gemini AI
    let newItinerary;
    try {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      // Parse dates to get season and month information
      const start = new Date(tripDetails.startDate);
      const end = new Date(tripDetails.endDate);
      const month = start.getMonth();
      
      // Determine season
      let season = '';
      if (month >= 2 && month <= 4) season = 'Spring';
      else if (month >= 5 && month <= 7) season = 'Summer';
      else if (month >= 8 && month <= 10) season = 'Autumn/Fall';
      else season = 'Winter';
      
      // Get month name
      const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                         'July', 'August', 'September', 'October', 'November', 'December'];
      const monthName = monthNames[month];

      const prompt = `REGENERATE a ${days}-day travel itinerary for ${tripDetails.name} traveling from ${tripDetails.departureLocation} to ${tripDetails.destination}, 
      preferring ${tripDetails.accommodations} accommodations, interested in ${tripDetails.activities.join(', ')}, 
      with a UPDATED total budget of $${totalBudget}. 

      TRAVEL DATES: ${tripDetails.startDate} to ${tripDetails.endDate} (${season} - ${monthName})
      
      BUDGET ADJUSTMENT CONTEXT:
      - Original Budget: $${totalBudget} (${Object.entries(originalBudget).map(([k, v]) => `${k}: $${v}`).join(', ')})
      - Updated Budget: $${totalBudget} (${Object.entries(updatedBudget).map(([k, v]) => `${k}: $${v}`).join(', ')})
      - Budget Changes: ${Object.entries(budgetChanges).map(([k, v]) => `${k}: ${v > 0 ? '+' : ''}$${v}`).join(', ')}
      
      BUDGET-AWARE RECOMMENDATIONS:
      - If accommodation budget increased: Suggest premium hotels, resorts, or unique accommodations
      - If accommodation budget decreased: Suggest budget hotels, hostels, or alternative lodging
      - If food budget increased: Include fine dining, gourmet experiences, wine tastings
      - If food budget decreased: Focus on local markets, street food, budget-friendly restaurants
      - If activities budget increased: Include premium tours, exclusive experiences, VIP access
      - If activities budget decreased: Focus on free activities, self-guided tours, public attractions
      - If transport budget increased: Suggest private transfers, premium transport options
      - If transport budget decreased: Emphasize public transport, walking, shared rides
      
      COST OPTIMIZATION STRATEGIES:
      - Provide cost-saving alternatives for reduced budgets
      - Suggest premium upgrades for increased budgets
      - Maintain quality while respecting budget constraints
      
      DAILY BUDGET BREAKDOWN (based on $${(totalBudget / days).toFixed(0)}/day):
      - Accommodation: $${(accommodation / days).toFixed(0)}/day (${((accommodation / totalBudget) * 100).toFixed(1)}% of daily budget)
      - Food: $${(food / days).toFixed(0)}/day (${((food / totalBudget) * 100).toFixed(1)}% of daily budget)
      - Activities: $${(activities / days).toFixed(0)}/day (${((activities / totalBudget) * 100).toFixed(1)}% of daily budget)
      - Transport: $${(transport / days).toFixed(0)}/day (${((transport / totalBudget) * 100).toFixed(1)}% of daily budget)
      - Shopping/Misc: $${((shopping + misc) / days).toFixed(0)}/day (${(((shopping + misc) / totalBudget) * 100).toFixed(1)}% of daily budget)
      
      USER PREFERENCES - MUST MATCH:
      - Accommodation: ${tripDetails.accommodations}
      - Activities: ${tripDetails.activities.join(', ')} - focus on these specific interests
      
      PERSONAL PREFERENCES - MUST INCORPORATE:
      - Travel Style: ${travelPreferences?.travelStyle?.join(', ') || 'Not specified'}
      - Interests: ${travelPreferences?.interests?.join(', ') || 'Not specified'}
      - Dietary Restrictions: ${travelPreferences?.dietaryRestrictions?.join(', ') || 'No restrictions'}
      - Accessibility Requirements: ${travelPreferences?.accessibility?.join(', ') || 'No special requirements'}
      - Travel Pace: ${travelPreferences?.pace || 'Not specified'}
      - Group Size: ${travelPreferences?.groupSize || 'Not specified'}
      - Special Requirements: ${travelPreferences?.specialRequirements || 'None'}
      
      CRITICAL REQUIREMENT - SPECIFIC NAMES ONLY (MANDATORY):
      ⚠️ NEVER use generic terms like "local restaurant", "famous landmark", "shopping district", "art museum", "popular area", "tourist spot"
      ⚠️ NEVER use "local café", "fine restaurant", "luxury hotel", "main attraction", "cultural site", "famous place", "well-known", "popular destination", "must-see", "local eatery", "traditional restaurant", "authentic place", "hidden gem"
      ⚠️ ALWAYS provide REAL, SPECIFIC names for every location and activity
      ⚠️ Include FULL ADDRESSES for all locations
      ⚠️ You MUST use actual business names, not descriptions
      ⚠️ If you don't know a specific name, research and provide a real one
      ⚠️ This is a STRICT requirement - generic responses will be rejected
      
      REQUIRED FORMAT FOR EACH ACTIVITY:
      - Restaurants: "Restaurant Name, Full Street Address, City, Postal Code"
      - Hotels: "Hotel Name, Full Street Address, City, Postal Code"  
      - Attractions: "Attraction Name, Full Street Address, City, Postal Code"
      - Museums: "Museum Name, Full Street Address, City, Postal Code"
      - Cafes: "Cafe Name, Full Street Address, City, Postal Code"
      - Shopping: "Store/Market Name, Full Street Address, City, Postal Code"
      - Parks: "Park Name, Full Street Address, City, Postal Code"
      
      EXAMPLES OF WHAT TO PROVIDE (NOT GENERIC):
      ✅ CORRECT: "Breakfast at Café de Flore, 172 Boulevard Saint-Germain, 75006 Paris, France"
      ❌ WRONG: "Breakfast at local café"
      
      ✅ CORRECT: "Visit Eiffel Tower, Champ de Mars, 5 Avenue Anatole France, 75007 Paris, France"
      ❌ WRONG: "Visit famous landmark"
      
      ✅ CORRECT: "Lunch at Le Petit Bistrot, 12 Rue de la Paix, 75002 Paris, France"
      ❌ WRONG: "Lunch at local restaurant"
      
      ✅ CORRECT: "Explore Louvre Museum, Rue de Rivoli, 75001 Paris, France"
      ❌ WRONG: "Explore art museum"
      
      ✅ CORRECT: "Shopping at Galeries Lafayette, 40 Boulevard Haussmann, 75009 Paris, France"
      ❌ WRONG: "Shopping at shopping district"
      
      ✅ CORRECT: "Dinner at Le Jules Verne, Eiffel Tower 2nd Floor, Champ de Mars, 75007 Paris, France"
      ❌ WRONG: "Dinner at fine restaurant"

      SEASONAL CONSIDERATIONS (only when relevant):
      - If there are specific festivals, events, or seasonal activities happening during ${tripDetails.startDate} to ${tripDetails.endDate}, include them
      - Consider weather conditions for ${season} when suggesting indoor/outdoor activities
      - Only mention seasonal events if they're actually happening during the travel dates
      - Don't force seasonal themes - focus on the best activities and locations for the destination

      Each day should have hourly activities from 8 AM to 10 PM with specific locations and estimated costs that fit within the daily budget of $${(totalBudget / days).toFixed(0)}.

      Also suggest the best transportation methods for getting around in ${tripDetails.destination} (metro, bus, walking, taxi, etc.).

      FINAL REMINDER: Every single activity must have a REAL, SPECIFIC name and FULL address. No generic terms allowed.
      
      ⚠️ ULTIMATE WARNING: If you use ANY generic terms like "local restaurant", "famous landmark", "shopping district", "art museum", "popular area", "tourist spot", "local café", "fine restaurant", "luxury hotel", "main attraction", "cultural site", "famous place", "well-known", "popular destination", "must-see", "local eatery", "traditional restaurant", "authentic place", or "hidden gem", your response will be completely rejected and unusable.
      
      You MUST provide REAL business names, attraction names, and full addresses for EVERY single activity. This is non-negotiable.

      CRITICAL JSON FORMATTING REQUIREMENTS:
      - Return ONLY valid JSON - no additional text, explanations, or markdown
      - Ensure all quotes are properly escaped
      - No trailing commas
      - All strings must be properly quoted
      - The response must be a complete, valid JSON array
      - Test your JSON before sending - it must parse without errors

      Return ONLY a valid JSON array where each item has: day, hourlyActivities (array of objects with hour, activity, location, estimatedCost), transportSuggestion.
      Example format:
      [
        {
          "day": 1,
          "hourlyActivities": [
            {"hour": "8:00 AM", "activity": "Breakfast at Café de Flore", "location": "Café de Flore, 172 Boulevard Saint-Germain, 75006 Paris, France", "estimatedCost": "€25"},
            {"hour": "9:00 AM", "activity": "Visit Eiffel Tower", "location": "Eiffel Tower, Champ de Mars, 5 Avenue Anatole France, 75007 Paris, France", "estimatedCost": "€26"},
            {"hour": "11:00 AM", "activity": "Walk along Seine River", "location": "Quai des Tuileries, Seine River, 75001 Paris, France", "estimatedCost": "€0"},
            {"hour": "12:00 PM", "activity": "Lunch at Le Petit Bistrot", "location": "Le Petit Bistrot, 12 Rue de la Paix, 75002 Paris, France", "estimatedCost": "€35"},
            {"hour": "2:00 PM", "activity": "Explore Louvre Museum", "location": "Louvre Museum, Rue de Rivoli, 75001 Paris, France", "estimatedCost": "€17"},
            {"hour": "5:00 PM", "activity": "Shopping at Galeries Lafayette", "location": "Galeries Lafayette, 40 Boulevard Haussmann, 75009 Paris, France", "estimatedCost": "€100"},
            {"hour": "7:00 PM", "activity": "Dinner at Le Jules Verne", "location": "Le Jules Verne, Eiffel Tower, 2nd Floor, Champ de Mars, 75007 Paris, France", "estimatedCost": "€180"},
            {"hour": "9:00 PM", "activity": "Evening stroll in Montmartre", "location": "Montmartre, 18th Arrondissement, 75018 Paris, France", "estimatedCost": "€0"}
          ],
          "transportSuggestion": "Take Metro Line 6 to Bir-Hakeim station for Eiffel Tower, then walk to Louvre. Use Metro Line 1 for shopping and dinner."
        }
      ]`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const content = response.text();
      
      // Clean the response to ensure it's valid JSON
      const cleanedContent = content.replace(/```json\n?|\n?```/g, '').trim();
      
      // Parse the response
      try {
        newItinerary = JSON.parse(cleanedContent);
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
            newItinerary = JSON.parse(cleanedJson);
          } catch (finalError) {
            console.error('Final JSON parsing failed:', finalError);
            throw new Error('AI_RESPONSE_PARSE_FAILED');
          }
        } else {
          throw new Error('AI_RESPONSE_PARSE_FAILED');
        }
      }
    } catch (aiError) {
      console.error('AI service error:', aiError);
      
      if (aiError instanceof Error) {
        if (aiError.message === 'AI_RESPONSE_PARSE_FAILED') {
          return NextResponse.json(
            { error: 'Failed to parse AI response. Please try again.' },
            { status: 500 }
          );
        }
        
        if (aiError.message.includes('quota')) {
          return NextResponse.json(
            { error: 'Daily AI request limit reached. Please try again tomorrow.' },
            { status: 429 }
          );
        }
        
        if (aiError.message.includes('overloaded') || aiError.message.includes('503')) {
          return NextResponse.json(
            { error: 'AI service is temporarily busy. Please wait a few minutes and try again.' },
            { status: 503 }
          );
        }
      }
      
      return NextResponse.json(
        { error: 'Unable to regenerate itinerary. Please try again later.' },
        { status: 500 }
      );
    }

    // Return the new itinerary along with budget comparison data
    return NextResponse.json({
      newItinerary,
      budgetComparison: {
        original: originalBudget,
        updated: updatedBudget,
        changes: budgetChanges
      },
      message: 'Itinerary regenerated successfully based on updated budget preferences'
    });
    
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to regenerate itinerary' },
      { status: 500 }
    );
  }
}



