# Travel App Setup Guide

## API Key Configuration

To use the AI-powered itinerary features, you need to configure your Google Gemini API key.

### Step 1: Get Your API Key
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated API key

### Step 2: Configure the Environment
1. Create a file named `.env.local` in the project root directory
2. Add the following content:
```
GEMINI_API_KEY=your_actual_api_key_here
```
3. Replace `your_actual_api_key_here` with the API key you copied

### Step 3: Restart the Development Server
1. Stop the current server (Ctrl+C)
2. Run `npm run dev` again

## Features That Require API Key
- ✅ Generate new itineraries
- ✅ Improve/update existing itineraries
- ✅ Targeted day modifications
- ✅ Travel chatbot

## Features That Work Without API Key
- ✅ View existing itineraries
- ✅ Budget calculations
- ✅ Map visualization
- ✅ Static content

## Troubleshooting
- **Error: "AI service is not configured"** → Make sure your `.env.local` file exists and contains a valid API key
- **Error: "Failed to update itinerary"** → Check that your API key is correct and has sufficient quota
- **Port conflicts** → The app will automatically use port 3001 if 3000 is busy

## Need Help?
If you're still having issues, check the browser console and server logs for more detailed error messages.
