import { NextResponse } from 'next/server';
import axios from 'axios';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { 
  calculateBudgetConstraints, 
  validateBudgetInput, 
  validateItineraryBudget,
  generateBudgetAlternatives 
} from '@/lib/budgetValidation';

export async function POST(req: Request) {
  try {
    const { name, days, startDate, endDate, departureLocation, destination, accommodations, activities, totalBudget, personalPreferences } = await req.json();

    // Validate budget input and provide warnings
    const budgetValidation = validateBudgetInput(totalBudget, days, accommodations);
    
    if (!budgetValidation.isValid) {
      return NextResponse.json({
        error: 'Budget too low for selected preferences',
        details: budgetValidation.warnings,
        suggestions: budgetValidation.alternatives
      }, { status: 400 });
    }

    // Calculate strict budget constraints
    const budgetConstraints = calculateBudgetConstraints(totalBudget, days);
    const dailyBudget = budgetConstraints.dailyBudget;

    // 1. Try to get suggested activities from Google Gemini
    let itinerary;
    let aiSuccess = false;
    
    try {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      // Parse dates to get season and month information
      const start = new Date(startDate);
      const end = new Date(endDate);
      const month = start.getMonth(); // 0-11 (January = 0)
      
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

      const prompt = `Create a ${days}-day travel itinerary for ${name} traveling from ${departureLocation} to ${destination}, 
      preferring ${accommodations} accommodations, interested in ${activities.join(', ')}, 
      with a total budget of $${totalBudget}. 

      TRAVEL DATES: ${startDate} to ${endDate} (${season} - ${monthName})
      
      ⚠️ STRICT BUDGET ENFORCEMENT - MANDATORY COMPLIANCE ⚠️
      CRITICAL: ALL suggestions MUST stay within these EXACT budget limits
      NO EXCEPTIONS: Maximum 10% overage tolerance allowed

      BUDGET CONSTRAINTS (ABSOLUTE LIMITS):
      - Total Trip Budget: $${totalBudget} for ${days} days
      - Daily Budget: $${dailyBudget.toFixed(0)} per day (STRICT LIMIT)

      CATEGORY BUDGET LIMITS (CANNOT EXCEED):
      - Accommodation: MAX $${(totalBudget * 0.35 / days).toFixed(0)}/day (35% of daily budget)
      - Food: MAX $${(totalBudget * 0.25 / days).toFixed(0)}/day (25% of daily budget)
      - Activities: MAX $${(totalBudget * 0.20 / days).toFixed(0)}/day (20% of daily budget)
      - Transport: MAX $${(totalBudget * 0.15 / days).toFixed(0)}/day (15% of daily budget)
      - Shopping/Misc: MAX $${(totalBudget * 0.05 / days).toFixed(0)}/day (5% of daily budget)

      COST VALIDATION RULES:
      1. NO single activity can exceed 110% of its category's daily budget
      2. NO daily spending can exceed daily budget limit
      3. ALL suggested activities must have realistic, budget-appropriate costs
      4. If budget is too low for desired activities, suggest alternatives or free options
      5. Prioritize value-for-money over luxury when budget is constrained

      BUDGET-APPROPRIATE SUGGESTIONS:
      - Low Budget (<$50/day): Focus on free activities, public transport, street food, hostels
      - Medium Budget ($50-150/day): Mix of free and paid activities, mid-range restaurants, budget hotels
      - High Budget ($150+/day): Premium experiences, fine dining, luxury accommodations

      ACTIVITY COST VALIDATION - MANDATORY:
      For each activity, you MUST:
      1. Verify the suggested cost fits within category budget
      2. Provide realistic cost estimates based on destination and budget level
      3. If an activity is too expensive, suggest a budget alternative
      4. Include cost breakdown for transparency

      COST ESTIMATION GUIDELINES:
      - Restaurant costs: Must fit within food budget category
      - Activity costs: Must fit within activities budget category
      - Transport costs: Must fit within transport budget category
      - Accommodation costs: Must fit within accommodation budget category

      EXAMPLE COST VALIDATION:
      ✅ CORRECT: "Breakfast at Budget Café, 123 Main St, City, Country - $8 (within $25 food budget)"
      ❌ WRONG: "Breakfast at Luxury Restaurant, 456 High St, City, Country - $45 (EXCEEDS $25 food budget)"
      
      USER PREFERENCES - MUST MATCH:
      - Accommodation: ${accommodations} (${accommodations === 'hotel' ? 'Standard hotels' : accommodations === 'hostel' ? 'Budget hostels' : accommodations === 'apartment' ? 'Self-catering apartments' : accommodations === 'resort' ? 'Full-service resorts' : accommodations === 'budget-hotel' ? 'Budget hotels' : accommodations === 'guesthouse' ? 'Guesthouses' : accommodations === 'bed-and-breakfast' ? 'Bed & Breakfasts' : accommodations === 'luxury-hotel' ? 'Luxury hotels' : accommodations === 'boutique-hotel' ? 'Boutique hotels' : accommodations === 'villa' ? 'Private villas' : 'Boutique accommodations'})
      - Activities: ${activities.join(', ')} - focus on these specific interests
      
      PERSONAL PREFERENCES - MUST INCORPORATE:
      - Travel Style: ${personalPreferences?.travelStyle?.join(', ') || 'Not specified'} - tailor activities to match this style
      - Interests: ${personalPreferences?.interests?.join(', ') || 'Not specified'} - prioritize these specific interests
      - Dietary Restrictions: ${personalPreferences?.dietaryRestrictions?.join(', ') || 'No restrictions'} - ensure all food recommendations accommodate these
      - Accessibility Requirements: ${personalPreferences?.accessibility?.join(', ') || 'No special requirements'} - ensure all locations are accessible
      - Travel Pace: ${personalPreferences?.pace || 'Not specified'} - adjust activity density and timing accordingly
      - Group Size: ${personalPreferences?.groupSize || 'Not specified'} - consider group dynamics and needs
      - Special Requirements: ${personalPreferences?.specialRequirements || 'None'} - incorporate any specific needs or requests
      
      PERSONALIZATION GUIDELINES:
      - If user prefers 'Adventure' style: Include outdoor activities, adrenaline experiences, exploration
      - If user prefers 'Relaxation' style: Include spa activities, peaceful locations, leisurely pace
      - If user prefers 'Cultural' style: Focus on museums, historical sites, local traditions, art
      - If user prefers 'Luxury' style: Include premium experiences, exclusive access, high-end venues
      - If user prefers 'Budget-friendly' style: Focus on free activities, affordable options, local deals
      - If user prefers 'Family-friendly' style: Include child-appropriate activities, family restaurants, safe locations
      - If user prefers 'Solo travel' style: Include social activities, safe solo-friendly locations, group tours
      - If user prefers 'Business' style: Include professional venues, networking opportunities, convenient locations
      - If user prefers 'Romantic' style: Include intimate settings, romantic restaurants, couple activities
      
      - If user has dietary restrictions: Research and suggest restaurants that specifically accommodate these needs
      - If user has accessibility requirements: Ensure all suggested locations have proper accessibility features
      - If user prefers 'relaxed' pace: Space out activities with breaks, include rest periods
      - If user prefers 'intense' pace: Pack activities closely, minimize downtime, maximize experiences
      - If user is traveling with family: Include child-friendly activities, family restaurants, safe locations
      - If user is solo: Include social activities, safe solo-friendly locations, group tours where appropriate
      
      ACTIVITY RECOMMENDATIONS:
      - If user selected 'food': Include restaurants, food markets, cooking classes, wine tastings
      - If user selected 'culture': Include museums, historical sites, cultural experiences, art galleries
      - If user selected 'beach': Include waterfront activities, coastal walks, beach clubs, water sports
      - If user selected 'mountains': Include hiking trails, mountain activities, scenic viewpoints
      - If user selected 'adventure': Include outdoor activities, adventure sports, adrenaline experiences
      - If user selected 'shopping': Include local markets, boutiques, department stores
      - If user selected 'luxury-experiences': Include exclusive tours, private guides, VIP access, premium experiences
      - If user selected 'fine-dining': Include upscale restaurants, gourmet experiences, wine pairings
      - If user selected 'exclusive-tours': Include private tours, VIP access, behind-the-scenes experiences
      - If user selected 'spa-wellness': Include spa treatments, wellness activities, relaxation experiences
      
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
      - If there are specific festivals, events, or seasonal activities happening during ${startDate} to ${endDate}, include them
      - Consider weather conditions for ${season} when suggesting indoor/outdoor activities
      - Only mention seasonal events if they're actually happening during the travel dates
      - Don't force seasonal themes - focus on the best activities and locations for the destination

      Each day should have hourly activities from 8 AM to 10 PM with specific locations and estimated costs that fit within the daily budget of $${(totalBudget / days).toFixed(0)}.

      Also suggest the best transportation methods for getting around in ${destination} (metro, bus, walking, taxi, etc.).

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

      MANDATORY COORDINATES REQUIREMENT:
      ⚠️ For EVERY location, you MUST include the exact latitude and longitude coordinates
      ⚠️ Use decimal degrees format (e.g., 48.8584, 2.2945 for Eiffel Tower)
      ⚠️ These coordinates must be accurate for the specific address provided
      ⚠️ Do NOT use approximate coordinates - they must be precise for the exact location

      Return ONLY a valid JSON array where each item has: day, hourlyActivities (array of objects with hour, activity, location, estimatedCost, coordinates), transportSuggestion.
      Example format:
      [
        {
          "day": 1,
          "hourlyActivities": [
            {"hour": "8:00 AM", "activity": "Breakfast at Café de Flore", "location": "Café de Flore, 172 Boulevard Saint-Germain, 75006 Paris, France", "estimatedCost": "€25", "coordinates": [48.8534, 2.3348]},
            {"hour": "9:00 AM", "activity": "Visit Eiffel Tower", "location": "Eiffel Tower, Champ de Mars, 5 Avenue Anatole France, 75007 Paris, France", "estimatedCost": "€26", "coordinates": [48.8584, 2.2945]},
            {"hour": "11:00 AM", "activity": "Walk along Seine River", "location": "Quai des Tuileries, Seine River, 75001 Paris, France", "estimatedCost": "€0", "coordinates": [48.8611, 2.3364]},
            {"hour": "12:00 PM", "activity": "Lunch at Le Petit Bistrot", "location": "Le Petit Bistrot, 12 Rue de la Paix, 75002 Paris, France", "estimatedCost": "€35", "coordinates": [48.8698, 2.3297]},
            {"hour": "2:00 PM", "activity": "Explore Louvre Museum", "location": "Louvre Museum, Rue de Rivoli, 75001 Paris, France", "estimatedCost": "€17", "coordinates": [48.8606, 2.3376]},
            {"hour": "5:00 PM", "activity": "Shopping at Galeries Lafayette", "location": "Galeries Lafayette, 40 Boulevard Haussmann, 75009 Paris, France", "estimatedCost": "€100", "coordinates": [48.8738, 2.3322]},
            {"hour": "7:00 PM", "activity": "Dinner at Le Jules Verne", "location": "Le Jules Verne, Eiffel Tower, 2nd Floor, Champ de Mars, 75007 Paris, France", "estimatedCost": "€180", "coordinates": [48.8584, 2.2945]},
            {"hour": "9:00 PM", "activity": "Evening stroll in Montmartre", "location": "Montmartre, 18th Arrondissement, 75018 Paris, France", "estimatedCost": "€0", "coordinates": [48.8867, 2.3431]}
          ],
          "transportSuggestion": "Take Metro Line 6 to Bir-Hakeim station for Eiffel Tower, then walk to Louvre. Use Metro Line 1 for shopping and dinner."
        }
      ]`;

      let attempts = 0;
      const maxAttempts = 1; // Only ask AI once to conserve quota
      
      while (attempts < maxAttempts) {
        try {
          attempts++;
          console.log(`AI generation attempt ${attempts}/${maxAttempts}`);
          
          const result = await model.generateContent(prompt);
          const response = await result.response;
          const content = response.text();
          
          console.log(`AI Response (attempt ${attempts}):`, content.substring(0, 500) + '...');
          
          // Clean the response to ensure it's valid JSON
          const cleanedContent = content.replace(/```json\n?|\n?```/g, '').trim();
          
          // Parse the response directly - no validation needed
          try {
            itinerary = JSON.parse(cleanedContent);
            console.log(`Success on attempt ${attempts}`);
            console.log('AI Response parsed successfully:', JSON.stringify(itinerary, null, 2));
            aiSuccess = true;
            break;
          } catch (parseError) {
            console.error('JSON parsing failed, trying to clean the response');
            try {
              // Try to extract JSON from the response more aggressively
              const jsonMatch = content.match(/\[[\s\S]*\]/);
              if (jsonMatch) {
                let cleanedJson = jsonMatch[0].replace(/[^\x20-\x7E]/g, ''); // Remove non-printable characters
                
                // Try to fix common JSON syntax issues
                cleanedJson = cleanedJson
                  .replace(/,(\s*[}\]])/g, '$1') // Remove trailing commas
                  .replace(/([^"\\])\s*\n\s*([^"\\])/g, '$1 $2') // Fix line breaks in strings
                  .replace(/([^"\\])\s*,\s*(\s*[}\]])/g, '$1$2') // Fix trailing commas before brackets
                  .replace(/([^"\\])\s*,\s*(\s*[}\]])/g, '$1$2'); // Double check for trailing commas
                
                try {
                  itinerary = JSON.parse(cleanedJson);
                  console.log(`Successfully parsed JSON after cleaning and fixing syntax`);
                  aiSuccess = true;
                  break;
                } catch (finalError) {
                  console.error('Final JSON parsing failed after syntax fixes:', finalError);
                  // Try one more time with even more aggressive cleaning
                  const ultraCleaned = cleanedJson
                    .replace(/[^\x20-\x7E]/g, '') // Remove ALL non-printable characters
                    .replace(/,\s*}/g, '}') // Remove trailing commas before closing braces
                    .replace(/,\s*]/g, ']'); // Remove trailing commas before closing brackets
                  
                  try {
                    itinerary = JSON.parse(ultraCleaned);
                    console.log(`Successfully parsed JSON after ultra-cleaning`);
                    aiSuccess = true;
                    break;
                  } catch (ultraError) {
                    console.error('Ultra-cleaning also failed:', ultraError);
                    throw parseError; // Re-throw the original error
                  }
                }
              }
            } catch (cleanError) {
              console.error('Failed to clean and parse JSON:', cleanError);
              throw parseError; // Re-throw the original error
            }
          }
        } catch (parseError) {
          console.error(`Attempt ${attempts} failed:`, parseError);
          
          // Check if it's an API limit error
          if (parseError instanceof Error) {
            if (parseError.message.includes('quota') || parseError.message.includes('overloaded')) {
              console.error('API limit reached, cannot retry');
              throw new Error('API_LIMIT_REACHED');
            }
            
            if (parseError.message.includes('503') || parseError.message.includes('Service Unavailable')) {
              console.error('AI service overloaded, cannot retry');
              throw new Error('SERVICE_OVERLOADED');
            }
          }
          
          if (attempts === maxAttempts) {
            console.error('AI generation failed');
            throw new Error('AI_GENERATION_FAILED');
          }
          // Continue to next attempt (though this won't happen with maxAttempts = 1)
        }
      }
    } catch (aiError) {
      console.error('AI service error:', aiError);
      
      // Check for specific API errors
      if (aiError instanceof Error) {
        if (aiError.message === 'API_LIMIT_REACHED') {
          return NextResponse.json(
            { error: 'AI service quota exceeded. Please try again tomorrow or upgrade your plan.' }, 
            { status: 429 }
          );
        }
        
        if (aiError.message === 'SERVICE_OVERLOADED') {
          return NextResponse.json(
            { error: 'AI service is temporarily busy. Please wait a few minutes and try again.' }, 
            { status: 503 }
          );
        }
        
        if (aiError.message.includes('overloaded') || aiError.message.includes('503')) {
          return NextResponse.json(
            { error: 'AI service is temporarily busy. Please wait a few minutes and try again.' }, 
            { status: 503 }
          );
        }
        
        if (aiError.message.includes('quota')) {
          return NextResponse.json(
            { error: 'Daily AI request limit reached. Please try again tomorrow.' }, 
            { status: 429 }
          );
        }
      }
      
      // If AI fails for any other reason, return error - no fallback
      return NextResponse.json(
        { error: 'Unable to generate AI itinerary. Please try again later.' }, 
        { status: 500 }
      );
    }

    // If AI fails, create a basic fallback itinerary
    if (!aiSuccess || !itinerary) {
      console.log('Creating fallback itinerary due to AI failure');
      
      // Create a basic itinerary structure
      const fallbackItinerary = [];
      for (let day = 1; day <= days; day++) {
        fallbackItinerary.push({
          day: day,
          hourlyActivities: [
            {
              hour: "9:00 AM",
              activity: `Explore ${destination}`,
              location: `${destination} City Center`,
              estimatedCost: "$0",
              budgetCategory: "activities"
            },
            {
              hour: "12:00 PM",
              activity: "Local lunch",
              location: "Local restaurant in city center",
              estimatedCost: "$50",
              budgetCategory: "food"
            },
            {
              hour: "3:00 PM",
              activity: "Cultural site visit",
              location: "Main cultural attraction",
              estimatedCost: "$40",
              budgetCategory: "activities"
            },
            {
              hour: "7:00 PM",
              activity: "Dinner",
              location: "Local restaurant in city center",
              estimatedCost: "$60",
              budgetCategory: "food"
            }
          ],
          transportSuggestion: "Use public transportation or walking to explore the city"
        });
      }
      
      itinerary = fallbackItinerary;
      console.log('Fallback itinerary created successfully');
    }

    // Validate generated itinerary against budget constraints
    console.log('Budget validation debug:', {
      totalBudget,
      dailyBudget,
      budgetConstraints,
      itineraryLength: itinerary.length
    });
    
    const budgetValidationResult = validateItineraryBudget(itinerary, budgetConstraints);
    
    if (!budgetValidationResult.isValid) {
      console.log(`Budget validation failed: ${budgetValidationResult.totalViolations} violations found`);
      console.log('Violations:', budgetValidationResult.violations);
      
      // Add budget validation data to itinerary for frontend display
      itinerary = itinerary.map((day: any, dayIndex: number) => {
        const dayViolations = budgetValidationResult.violations.filter(v => v.day === dayIndex + 1);
        const dailySpending = day.hourlyActivities?.reduce((sum: number, activity: any) => {
          return sum + (parseFloat(activity.estimatedCost?.replace(/[^0-9.-]/g, '')) || 0);
        }, 0) || 0;
        
        return {
          ...day,
          dailyBudget: dailyBudget,
          budgetUtilization: (dailySpending / dailyBudget) * 100,
          budgetViolations: dayViolations,
          budgetWarnings: budgetValidation.warnings
        };
      });
      
      // Add overall budget summary
      itinerary.budgetSummary = {
        totalBudget,
        dailyBudget,
        violations: budgetValidationResult.violations,
        warnings: budgetValidation.warnings,
        isValid: false
      };
    } else {
      console.log('Budget validation passed - all activities within budget constraints');
      
      // Add budget validation data to itinerary for frontend display
      itinerary = itinerary.map((day: any, dayIndex: number) => {
        const dailySpending = day.hourlyActivities?.reduce((sum: number, activity: any) => {
          return sum + (parseFloat(activity.estimatedCost?.replace(/[^0-9.-]/g, '')) || 0);
        }, 0) || 0;
        
        return {
          ...day,
          dailyBudget: dailyBudget,
          budgetUtilization: (dailySpending / dailyBudget) * 100,
          budgetViolations: [],
          budgetWarnings: budgetValidation.warnings
        };
      });
      
      // Add overall budget summary
      itinerary.budgetSummary = {
        totalBudget,
        dailyBudget,
        violations: [],
        warnings: budgetValidation.warnings,
        isValid: true
      };
    }

    // 2. Fetch flights (Amadeus API) - now using departure location
    let flights = [];
    try {
      if (process.env.AMADEUS_CLIENT_ID && process.env.AMADEUS_CLIENT_SECRET) {
        // First get access token
        const tokenResponse = await axios.post('https://test.api.amadeus.com/v1/security/oauth2/token', 
          'grant_type=client_credentials&client_id=' + process.env.AMADEUS_CLIENT_ID + '&client_secret=' + process.env.AMADEUS_CLIENT_SECRET,
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            }
          }
        );

        const accessToken = tokenResponse.data.access_token;

        // Extract airport codes from departure and destination
        const departureCode = departureLocation.slice(0, 3).toUpperCase();
        const destinationCode = destination.slice(0, 3).toUpperCase();

        // Get flight offers
        const flightsRes = await axios.get('https://test.api.amadeus.com/v2/shopping/flight-offers', {
          params: { 
            originLocationCode: departureCode, 
            destinationLocationCode: destinationCode, 
            departureDate: startDate, 
            adults: 1, 
            max: 5 
          },
          headers: { 
            'Authorization': `Bearer ${accessToken}` 
          }
        });
        flights = flightsRes.data.data || [];
      }
    } catch (flightError) {
      console.error('Flight API error:', flightError);
      // Fallback flight data
      flights = [
        { validatingAirlineCodes: ['AA'], price: { total: '450' } },
        { validatingAirlineCodes: ['UA'], price: { total: '520' } },
        { validatingAirlineCodes: ['DL'], price: { total: '480' } }
      ];
    }

    // 3. Fetch hotels (Booking.com RapidAPI)
    let hotels = [];
    
    // Function to generate destination-specific fallback hotels
    const generateDestinationHotels = (destination: string) => {
      const cityName = destination.split(',')[0].trim().toLowerCase();
      
      // Define hotel templates for different destinations
      const hotelTemplates: { [key: string]: any[] } = {
        'islamabad': [
          {
            hotel_name: 'Serena Hotel Islamabad',
            price_breakdown: { all_inclusive_amount: { value: '180' } },
            url: '#',
            review_score: 4.6,
            address: 'Khayaban-e-Suhrawardy, Islamabad, Pakistan',
            phone: '+92 51 2874000',
            website: 'https://www.serenahotels.com',
            amenities: ['wifi', 'restaurant', 'spa', 'gym', 'pool', 'concierge'],
            room_type: 'Deluxe Room',
            cancellation_policy: 'Free cancellation up to 24 hours before check-in'
          },
          {
            hotel_name: 'Islamabad Marriott Hotel',
            price_breakdown: { all_inclusive_amount: { value: '220' } },
            url: '#',
            review_score: 4.4,
            address: 'Aga Khan Road, F-5/1, Islamabad, Pakistan',
            phone: '+92 51 2826121',
            website: 'https://www.marriott.com',
            amenities: ['wifi', 'restaurant', 'spa', 'gym', 'pool'],
            room_type: 'Executive Room',
            cancellation_policy: 'Free cancellation up to 48 hours before check-in'
          },
          {
            hotel_name: 'Ramada by Wyndham Islamabad',
            price_breakdown: { all_inclusive_amount: { value: '150' } },
            url: '#',
            review_score: 4.2,
            address: 'Club Road, Islamabad, Pakistan',
            phone: '+92 51 2827000',
            website: 'https://www.wyndhamhotels.com',
            amenities: ['wifi', 'restaurant', 'gym'],
            room_type: 'Standard Room',
            cancellation_policy: 'Free cancellation up to 24 hours before check-in'
          }
        ],
        'paris': [
          {
            hotel_name: 'Hotel Ritz Paris',
            price_breakdown: { all_inclusive_amount: { value: '850' } },
            url: '#',
            review_score: 4.8,
            address: '15 Place Vendôme, 75001 Paris, France',
            phone: '+33 1 43 16 30 30',
            website: 'https://www.ritzparis.com',
            amenities: ['wifi', 'restaurant', 'spa', 'concierge'],
            room_type: 'Deluxe Room',
            cancellation_policy: 'Free cancellation up to 72 hours before check-in'
          },
          {
            hotel_name: 'Le Meurice',
            price_breakdown: { all_inclusive_amount: { value: '750' } },
            url: '#',
            review_score: 4.7,
            address: '228 Rue de Rivoli, 75001 Paris, France',
            phone: '+33 1 44 58 10 10',
            website: 'https://www.lemeurice.com',
            amenities: ['wifi', 'restaurant', 'spa', 'gym'],
            room_type: 'Superior Room',
            cancellation_policy: 'Free cancellation up to 48 hours before check-in'
          },
          {
            hotel_name: 'Hotel de Crillon',
            price_breakdown: { all_inclusive_amount: { value: '950' } },
            url: '#',
            review_score: 4.9,
            address: '10 Place de la Concorde, 75008 Paris, France',
            phone: '+33 1 44 71 15 00',
            website: 'https://www.rosewoodhotels.com',
            amenities: ['wifi', 'restaurant', 'spa', 'gym', 'pool'],
            room_type: 'Luxury Room',
            cancellation_policy: 'Free cancellation up to 72 hours before check-in'
          }
        ],
                 'london': [
           {
             hotel_name: 'The Ritz London',
             price_breakdown: { all_inclusive_amount: { value: '650' } },
             url: '#',
             review_score: 4.8,
             address: '150 Piccadilly, St. James\'s, London W1J 9BR, UK',
             phone: '+44 20 7493 8181',
             website: 'https://www.theritzlondon.com',
             amenities: ['wifi', 'restaurant', 'spa', 'concierge'],
             room_type: 'Deluxe Room',
             cancellation_policy: 'Free cancellation up to 48 hours before check-in'
           },
           {
             hotel_name: 'Claridge\'s',
             price_breakdown: { all_inclusive_amount: { value: '580' } },
             url: '#',
             review_score: 4.7,
             address: 'Brook St, Mayfair, London W1K 4HR, UK',
             phone: '+44 20 7629 8860',
             website: 'https://www.claridges.co.uk',
             amenities: ['wifi', 'restaurant', 'spa', 'gym'],
             room_type: 'Superior Room',
             cancellation_policy: 'Free cancellation up to 24 hours before check-in'
           },
           {
             hotel_name: 'The Savoy',
             price_breakdown: { all_inclusive_amount: { value: '720' } },
             url: '#',
             review_score: 4.6,
             address: 'Strand, London WC2R 0EZ, UK',
             phone: '+44 20 7836 4343',
             website: 'https://www.thesavoylondon.com',
             amenities: ['wifi', 'restaurant', 'spa', 'gym', 'pool'],
             room_type: 'River View Room',
             cancellation_policy: 'Free cancellation up to 48 hours before check-in'
           }
         ],
         'tokyo': [
           {
             hotel_name: 'The Ritz-Carlton Tokyo',
             price_breakdown: { all_inclusive_amount: { value: '450' } },
             url: '#',
             review_score: 4.8,
             address: 'Tokyo Midtown, 9-7-1 Akasaka, Minato City, Tokyo, Japan',
             phone: '+81 3 6434 8700',
             website: 'https://www.ritzcarlton.com',
             amenities: ['wifi', 'restaurant', 'spa', 'gym', 'pool'],
             room_type: 'Deluxe Room',
             cancellation_policy: 'Free cancellation up to 48 hours before check-in'
           },
           {
             hotel_name: 'Aman Tokyo',
             price_breakdown: { all_inclusive_amount: { value: '1200' } },
             url: '#',
             review_score: 4.9,
             address: 'The Otemachi Tower, 1-5-6 Otemachi, Chiyoda City, Tokyo, Japan',
             phone: '+81 3 5224 3333',
             website: 'https://www.aman.com',
             amenities: ['wifi', 'restaurant', 'spa', 'gym', 'pool'],
             room_type: 'Luxury Room',
             cancellation_policy: 'Free cancellation up to 72 hours before check-in'
           },
           {
             hotel_name: 'Park Hyatt Tokyo',
             price_breakdown: { all_inclusive_amount: { value: '380' } },
             url: '#',
             review_score: 4.6,
             address: '3-6-1 Nishi Shinjuku, Shinjuku City, Tokyo, Japan',
             phone: '+81 3 5322 1234',
             website: 'https://www.hyatt.com',
             amenities: ['wifi', 'restaurant', 'spa', 'gym'],
             room_type: 'Park View Room',
             cancellation_policy: 'Free cancellation up to 24 hours before check-in'
           }
         ],
         'dubai': [
           {
             hotel_name: 'Burj Al Arab Jumeirah',
             price_breakdown: { all_inclusive_amount: { value: '1500' } },
             url: '#',
             review_score: 4.9,
             address: 'Jumeirah St, Umm Suqeim 3, Dubai, UAE',
             phone: '+971 4 301 7777',
             website: 'https://www.jumeirah.com',
             amenities: ['wifi', 'restaurant', 'spa', 'gym', 'pool'],
             room_type: 'Deluxe Suite',
             cancellation_policy: 'Free cancellation up to 72 hours before check-in'
           },
           {
             hotel_name: 'Atlantis The Palm',
             price_breakdown: { all_inclusive_amount: { value: '450' } },
             url: '#',
             review_score: 4.5,
             address: 'Crescent Rd, The Palm Jumeirah, Dubai, UAE',
             phone: '+971 4 426 2000',
             website: 'https://www.atlantis.com',
             amenities: ['wifi', 'restaurant', 'spa', 'gym', 'pool'],
             room_type: 'Ocean View Room',
             cancellation_policy: 'Free cancellation up to 48 hours before check-in'
           },
           {
             hotel_name: 'Armani Hotel Dubai',
             price_breakdown: { all_inclusive_amount: { value: '800' } },
             url: '#',
             review_score: 4.7,
             address: 'Burj Khalifa, Downtown Dubai, UAE',
             phone: '+971 4 888 3888',
             website: 'https://www.armanihotels.com',
             amenities: ['wifi', 'restaurant', 'spa', 'gym'],
             room_type: 'Armani Suite',
             cancellation_policy: 'Free cancellation up to 48 hours before check-in'
           }
         ]
      };
      
      // Return destination-specific hotels or default to generic hotels
      return hotelTemplates[cityName] || [
        {
          hotel_name: `${destination.split(',')[0].trim()} Grand Hotel`,
          price_breakdown: { all_inclusive_amount: { value: '200' } },
          url: '#',
          review_score: 4.3,
          address: `Main Street, ${destination}`,
          phone: '+1 555 123 4567',
          website: 'https://www.example.com',
          amenities: ['wifi', 'restaurant', 'gym'],
          room_type: 'Standard Room',
          cancellation_policy: 'Free cancellation up to 24 hours before check-in'
        },
        {
          hotel_name: `${destination.split(',')[0].trim()} Plaza Hotel`,
          price_breakdown: { all_inclusive_amount: { value: '280' } },
          url: '#',
          review_score: 4.5,
          address: `Central District, ${destination}`,
          phone: '+1 555 987 6543',
          website: 'https://www.example.com',
          amenities: ['wifi', 'restaurant', 'spa', 'gym'],
          room_type: 'Deluxe Room',
          cancellation_policy: 'Free cancellation up to 48 hours before check-in'
        },
        {
          hotel_name: `${destination.split(',')[0].trim()} Boutique Hotel`,
          price_breakdown: { all_inclusive_amount: { value: '150' } },
          url: '#',
          review_score: 4.1,
          address: `Historic Quarter, ${destination}`,
          phone: '+1 555 456 7890',
          website: 'https://www.example.com',
          amenities: ['wifi', 'restaurant'],
          room_type: 'Comfort Room',
          cancellation_policy: 'Free cancellation up to 24 hours before check-in'
        }
      ];
    };
    
    try {
      if (process.env.RAPIDAPI_KEY) {
        const hotelsRes = await axios.get('https://booking-com.p.rapidapi.com/v1/hotels/search', {
          params: { 
            location_id: 'city_id', 
            checkin_date: startDate, 
            checkout_date: endDate, 
            adults_number: 1,
            room_number: 1
          },
          headers: {
            'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
            'X-RapidAPI-Host': 'booking-com.p.rapidapi.com'
          }
        });
        hotels = hotelsRes.data.result || [];
      }
    } catch (hotelError) {
      console.error('Hotel API error:', hotelError);
      // Use destination-specific fallback hotel data
      hotels = generateDestinationHotels(destination);
    }

    // 5. Merge data and create final itinerary
    const finalItinerary = itinerary.map((dayPlan: any, index: number) => ({
      ...dayPlan,
      hotel: hotels[index % hotels.length] ? {
        name: hotels[index % hotels.length].hotel_name || 'Hotel Name Not Available',
        price: hotels[index % hotels.length].price_breakdown?.all_inclusive_amount?.value || 'Price not available',
        link: hotels[index % hotels.length].url || '#',
        rating: hotels[index % hotels.length].review_score || null,
        amenities: hotels[index % hotels.length].amenities || [],
        address: hotels[index % hotels.length].address || null,
        phone: hotels[index % hotels.length].phone || null,
        website: hotels[index % hotels.length].website || null,
        roomType: hotels[index % hotels.length].room_type || null,
        cancellationPolicy: hotels[index % hotels.length].cancellation_policy || null
      } : null,
      flight: flights[index % flights.length] ? {
        airline: flights[index % flights.length].validatingAirlineCodes?.[0] || 'Airline not available',
        price: flights[index % flights.length].price?.total || 'Price not available',
        link: '#'
      } : null
    }));

    // 6. Fetch weather data for the destination
    let weatherData = null;
    try {
      console.log('Fetching weather for:', { destination, startDate, endDate });
      const weatherResponse = await fetch(`${req.headers.get('origin') || 'http://localhost:3000'}/api/weather?destination=${encodeURIComponent(destination)}&startDate=${startDate}&endDate=${endDate}`);
      console.log('Weather response status:', weatherResponse.status);
      if (weatherResponse.ok) {
        weatherData = await weatherResponse.json();
        console.log('Weather data received:', weatherData);
      } else {
        console.error('Weather API error status:', weatherResponse.status);
        const errorText = await weatherResponse.text();
        console.error('Weather API error text:', errorText);
      }
    } catch (weatherError) {
      console.error('Weather fetch error:', weatherError);
    }

    // If weather fetch failed, create fallback weather data
    if (!weatherData) {
      console.log('Creating fallback weather data');
      const startDateObj = new Date(startDate);
      const endDateObj = new Date(endDate);
      const travelDates = [];
      
      // Generate array of dates between start and end
      for (let d = new Date(startDateObj); d <= endDateObj; d.setDate(d.getDate() + 1)) {
        travelDates.push({
          date: d.toISOString().split('T')[0],
          dayOfWeek: d.toLocaleDateString('en-US', { weekday: 'long' }),
          temperature: { min: 15, max: 25, average: 20 },
          humidity: 60,
          description: 'Partly cloudy',
          icon: '02d',
          windSpeed: 5,
          precipitation: 0
        });
      }
      
      weatherData = {
        destination: destination.split(',')[0].trim(),
        travelDates,
        units: 'metric',
        note: 'Using fallback weather data'
      };
    }

    // 7. Fetch news data for the destination (non-blocking)
    let newsData = null;
    try {
      console.log('Fetching news for:', { destination, startDate, endDate });
      const newsResponse = await fetch(`${req.headers.get('origin') || 'http://localhost:3000'}/api/news?destination=${encodeURIComponent(destination)}&startDate=${startDate}&endDate=${endDate}`);
      console.log('News response status:', newsResponse.status);
      
      if (newsResponse.ok) {
        newsData = await newsResponse.json();
        console.log('News data received:', newsData);
        
        // Check if newsData has the expected structure
        if (!newsData.news || !Array.isArray(newsData.news)) {
          console.error('Invalid news data structure:', newsData);
          newsData = null;
        }
      } else {
        console.error('News API error status:', newsResponse.status);
        const errorText = await newsResponse.text();
        console.error('News API error text:', errorText);
        newsData = null;
      }
    } catch (newsError) {
      console.error('News fetch error:', newsError);
      newsData = null;
    }
    
    console.log('Final newsData:', newsData);

    // 8. Add weather and news to the final response
    const responseWithWeatherAndNews = {
      itinerary: finalItinerary,
      weather: weatherData,
      news: newsData,
      tripInfo: {
        destination,
        startDate,
        endDate,
        days,
        totalBudget,
        dailyBudget
      }
    };

    return NextResponse.json(responseWithWeatherAndNews);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate itinerary' }, 
      { status: 500 }
    );
  }
}
