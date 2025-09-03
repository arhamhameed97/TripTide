import { NextRequest, NextResponse } from 'next/server'

// Initialize Google AI only if API key is available
let genAI: any = null
let GoogleGenerativeAI: any = null

export async function GET() {
  return NextResponse.json({ message: 'Chatbot API is working!' })
}

export async function POST(request: NextRequest) {
  try {
    const { message, currentFormData } = await request.json()

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    // Check if API key is available
    if (!process.env.GEMINI_API_KEY) {
      console.log('GEMINI_API_KEY is missing - using fallback responses')
      
      // Provide fallback responses for testing
      const fallbackResponses = {
        'budget': {
          response: "I'd be happy to help you with your budget! For a typical trip, I recommend allocating 35% for accommodation, 25% for food, 20% for activities, 15% for transport, and 5% for shopping. What's your total budget for this trip?",
          preferencesUpdate: null
        },
        'activities': {
          response: "Great question! I can help you choose activities based on your interests. Popular options include cultural experiences, outdoor adventures, food tours, historical sites, and local markets. What types of activities interest you most?",
          preferencesUpdate: null
        },
        'accommodation': {
          response: "I can help you choose the perfect accommodation! Options range from budget hostels to luxury hotels. Consider factors like location, amenities, and your budget. What's your preference for accommodation type?",
          preferencesUpdate: null
        },
        'dietary': {
          response: "I understand dietary restrictions are important! I can help you find suitable dining options and accommodations. Common restrictions include vegetarian, vegan, gluten-free, and halal. What dietary needs should I consider?",
          preferencesUpdate: null
        },
        'accessibility': {
          response: "Accessibility is crucial for a comfortable trip! I can help you find wheelchair-accessible accommodations, transportation, and activities. What specific accessibility requirements do you have?",
          preferencesUpdate: null
        }
      }

      // Check if message matches any fallback patterns
      const lowerMessage = message.toLowerCase()
      for (const [key, response] of Object.entries(fallbackResponses)) {
        if (lowerMessage.includes(key)) {
          return NextResponse.json(response)
        }
      }

      // Default fallback response
      return NextResponse.json({
        response: "I'm here to help you plan your perfect trip! I can assist with budget planning, activity recommendations, accommodation choices, dietary restrictions, and accessibility needs. What would you like to discuss?",
        preferencesUpdate: null
      })
    }

    // Initialize Google AI if not already done
    if (!genAI) {
      try {
        const { GoogleGenerativeAI: GAI } = await import('@google/generative-ai')
        GoogleGenerativeAI = GAI
        genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
      } catch (importError) {
        console.error('Failed to import GoogleGenerativeAI:', importError)
        return NextResponse.json({
          response: "I'm sorry, the AI service is currently unavailable. Please try again later.",
          preferencesUpdate: null
        })
      }
    }

    // Create a comprehensive prompt for the AI
    const prompt = `
You are an AI travel assistant helping users plan their trips. The user has sent you this message: "${message}"

Current form data:
${JSON.stringify(currentFormData, null, 2)}

Your task is to:
1. Provide a helpful, conversational response to the user's message
2. If the user mentions preferences that should update the form, extract those preferences and return them in a structured format
3. Be friendly, knowledgeable about travel, and helpful

IMPORTANT: You must respond with valid JSON in this exact format:
{
  "response": "Your conversational response here",
  "preferencesUpdate": {
    // Only include fields that need to be updated
    // For nested objects like personalPreferences, use dot notation or nested structure
    // Examples:
    // "totalBudget": 2000,
    // "accommodations": "hotel",
    // "activities": ["culture", "food"],
    // "personalPreferences": {
    //   "travelStyle": ["Cultural", "Adventure"],
    //   "interests": ["Museums", "Local Cuisine"],
    //   "dietaryRestrictions": ["Vegetarian"],
    //   "accessibility": ["Wheelchair accessible"],
    //   "pace": "moderate",
    //   "groupSize": "couple",
    //   "specialRequirements": "Need wheelchair accessible accommodations"
    // }
  }
}

If no preferences need to be updated, set preferencesUpdate to null:
{
  "response": "Your conversational response here",
  "preferencesUpdate": null
}

Examples of what you can help with:
- Budget optimization: "I want to spend around $2000" → update totalBudget
- Activity preferences: "I love museums and food" → update activities and personalPreferences.interests
- Accommodation: "I prefer luxury hotels" → update accommodations
- Dietary: "I'm vegetarian" → update personalPreferences.dietaryRestrictions
- Accessibility: "I need wheelchair access" → update personalPreferences.accessibility
- Travel style: "I like adventure travel" → update personalPreferences.travelStyle
- Group size: "It's just me and my partner" → update personalPreferences.groupSize
- Pace: "I like to take it slow" → update personalPreferences.pace

Be conversational and helpful. If the user asks about specific preferences, suggest updating the form accordingly.
`

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' })
    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    // Try to parse the response as JSON
    try {
      const parsedResponse = JSON.parse(text)
      
      // Validate the response structure
      if (typeof parsedResponse.response !== 'string') {
        throw new Error('Invalid response format')
      }
      
      return NextResponse.json(parsedResponse)
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', text)
      // If parsing fails, return the text as a simple response
      return NextResponse.json({
        response: text,
        preferencesUpdate: null
      })
    }

  } catch (error) {
    console.error('Chatbot API error:', error)
    return NextResponse.json(
      { 
        response: "I'm sorry, I'm having trouble processing your request right now. Please try again.",
        preferencesUpdate: null
      },
      { status: 500 }
    )
  }
}
