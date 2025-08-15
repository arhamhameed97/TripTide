import { NextResponse } from 'next/server';
import axios from 'axios';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req: Request) {
  try {
    const { name, days, startDate, endDate, departureLocation, destination, accommodations, activities, budget, totalBudget, personalPreferences } = await req.json();

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
      budget ${budget}. 

      TRAVEL DATES: ${startDate} to ${endDate} (${season} - ${monthName})
      
      BUDGET CONSIDERATIONS - CRITICAL:
      - Total Trip Budget: $${totalBudget} for ${days} days
      - Daily Budget: $${(totalBudget / days).toFixed(0)} per day
      - Budget Category: ${budget} (${budget === 'budget' ? 'Budget-friendly options' : budget === 'medium' ? 'Mid-range experiences' : 'Premium/luxury experiences'})
      
      DAILY BUDGET BREAKDOWN (based on $${(totalBudget / days).toFixed(0)}/day):
      - Accommodation: $${(totalBudget * 0.35 / days).toFixed(0)}/day (35% of daily budget)
      - Food: $${(totalBudget * 0.25 / days).toFixed(0)}/day (25% of daily budget)
      - Activities: $${(totalBudget * 0.20 / days).toFixed(0)}/day (20% of daily budget)
      - Transport: $${(totalBudget * 0.15 / days).toFixed(0)}/day (15% of daily budget)
      - Shopping/Misc: $${(totalBudget * 0.05 / days).toFixed(0)}/day (5% of daily budget)
      
      COST GUIDELINES (based on daily budget of $${(totalBudget / days).toFixed(0)}):
      - Restaurant costs: ${budget === 'budget' ? `$${(totalBudget * 0.25 / days * 0.4).toFixed(0)}-${(totalBudget * 0.25 / days * 0.8).toFixed(0)} for meals` : budget === 'medium' ? `$${(totalBudget * 0.25 / days * 0.6).toFixed(0)}-${(totalBudget * 0.25 / days).toFixed(0)} for meals` : `$${(totalBudget * 0.25 / days).toFixed(0)}+ for fine dining`}
      - Activity costs: ${budget === 'budget' ? `$${(totalBudget * 0.20 / days * 0.3).toFixed(0)}-${(totalBudget * 0.20 / days * 0.7).toFixed(0)} for attractions` : budget === 'medium' ? `$${(totalBudget * 0.20 / days * 0.5).toFixed(0)}-${(totalBudget * 0.20 / days).toFixed(0)} for attractions` : `$${(totalBudget * 0.20 / days).toFixed(0)}+ for premium experiences`}
      - Shopping: ${budget === 'budget' ? 'Local markets, budget stores, thrift shops' : budget === 'medium' ? 'Mid-range boutiques, department stores, local markets' : 'Luxury boutiques, designer stores, exclusive shopping districts'}
      
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
      
      ACTIVITY RECOMMENDATIONS BY BUDGET:
      - If user selected 'food': ${budget === 'budget' ? 'Include budget-friendly restaurants, local food markets, street food' : budget === 'medium' ? 'Include mid-range restaurants, food markets, cooking classes, wine tastings' : 'Include fine dining restaurants, exclusive food experiences, wine tastings, chef\'s table'}
      - If user selected 'culture': Include museums, historical sites, cultural experiences, art galleries
      - If user selected 'beach': Include waterfront activities, coastal walks, ${budget === 'budget' ? 'public beaches' : budget === 'medium' ? 'beach clubs, water sports' : 'exclusive beach clubs, private beach access'}
      - If user selected 'mountains': Include hiking trails, mountain activities, scenic viewpoints
      - If user selected 'adventure': Include outdoor activities, adventure sports, adrenaline experiences
      - If user selected 'shopping': ${budget === 'budget' ? 'Include local markets, budget stores, thrift shops' : budget === 'medium' ? 'Include mid-range boutiques, department stores, local markets' : 'Include luxury boutiques, designer stores, exclusive shopping districts'}
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

      Each day should have hourly activities from 8 AM to 10 PM with specific locations and estimated costs that match the ${budget} budget.

      Also suggest the best transportation methods for getting around in ${destination} (metro, bus, walking, taxi, etc.).

             FINAL REMINDER: Every single activity must have a REAL, SPECIFIC name and FULL address. No generic terms allowed.
       
       ⚠️ ULTIMATE WARNING: If you use ANY generic terms like "local restaurant", "famous landmark", "shopping district", "art museum", "popular area", "tourist spot", "local café", "fine restaurant", "luxury hotel", "main attraction", "cultural site", "famous place", "well-known", "popular destination", "must-see", "local eatery", "traditional restaurant", "authentic place", or "hidden gem", your response will be completely rejected and unusable.
       
       You MUST provide REAL business names, attraction names, and full addresses for EVERY single activity. This is non-negotiable.

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
              aiSuccess = true;
              break;
            } catch (parseError) {
              console.error('JSON parsing failed, trying to clean the response');
              try {
                // Try to extract JSON from the response more aggressively
                const jsonMatch = content.match(/\[[\s\S]*\]/);
                if (jsonMatch) {
                  const cleanedJson = jsonMatch[0].replace(/[^\x20-\x7E]/g, ''); // Remove non-printable characters
                  itinerary = JSON.parse(cleanedJson);
                  console.log(`Successfully parsed JSON after cleaning`);
                  aiSuccess = true;
                  break;
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

    // AI must succeed to continue - no fallback itinerary
    if (!aiSuccess || !itinerary) {
      return NextResponse.json(
        { error: 'Failed to generate itinerary. Please try again.' }, 
        { status: 500 }
      );
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
      // Fallback hotel data with more specific names
      hotels = [
        { hotel_name: 'The Plaza Hotel', price_breakdown: { all_inclusive_amount: { value: '450' } }, url: '#' },
        { hotel_name: 'Waldorf Astoria New York', price_breakdown: { all_inclusive_amount: { value: '380' } }, url: '#' },
        { hotel_name: 'The Ritz-Carlton New York', price_breakdown: { all_inclusive_amount: { value: '520' } }, url: '#' }
      ];
    }

    // 5. Merge data and create final itinerary
    const finalItinerary = itinerary.map((dayPlan: any, index: number) => ({
      ...dayPlan,
      hotel: hotels[index % hotels.length] ? {
        name: hotels[index % hotels.length].hotel_name || 'Hotel Name Not Available',
        price: hotels[index % hotels.length].price_breakdown?.all_inclusive_amount?.value || 'Price not available',
        link: hotels[index % hotels.length].url || '#'
      } : null,
      flight: flights[index % flights.length] ? {
        airline: flights[index % flights.length].validatingAirlineCodes?.[0] || 'Airline not available',
        price: flights[index % flights.length].price?.total || 'Price not available',
        link: '#'
      } : null
    }));

    return NextResponse.json(finalItinerary);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate itinerary' }, 
      { status: 500 }
    );
  }
}


