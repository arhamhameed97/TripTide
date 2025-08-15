# 🚀 TripTide - AI-Powered Travel Planning App

A comprehensive, AI-driven travel planning application that helps users create personalized itineraries with intelligent budget management and cost tracking.

## ✨ Features

### 🎯 **AI-Powered Itinerary Generation**
- **Gemini AI Integration**: Advanced AI that generates personalized travel itineraries
- **Specific Recommendations**: Real business names, locations, and addresses (no generic terms)
- **Smart Activity Planning**: Hourly breakdown with realistic timing and costs
- **Location Intelligence**: Full addresses and specific venue recommendations

### 💰 **Comprehensive Budget System**
- **Total Trip Budget**: Set your overall budget for the entire trip
- **Daily Budget Calculation**: Automatic daily budget allocation
- **Budget Categories**: Budget-friendly, Mid-range, or Luxury recommendations
- **Smart Allocation**: 35% Accommodation, 25% Food, 20% Activities, 15% Transport, 5% Shopping
- **Real-time Tracking**: Compare planned vs. actual costs

### 📊 **Advanced Cost Management**
- **Trip Cost Summary**: Complete breakdown of estimated vs. actual costs
- **Category-based Tracking**: Accommodation, Food, Activities, Transport, Shopping
- **Budget Status Monitoring**: Visual indicators for budget utilization
- **Cost Optimization Tips**: Personalized recommendations for staying within budget

### 🎨 **Modern User Interface**
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Beautiful Gradients**: Modern, visually appealing interface
- **Interactive Components**: Dynamic forms and real-time updates
- **Professional Styling**: Built with shadcn/ui components

## 🛠️ Technology Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **UI Components**: shadcn/ui, Tailwind CSS
- **AI Integration**: Google Gemini AI
- **State Management**: React Hooks (useState, useEffect)
- **Icons**: Lucide React
- **Deployment**: Vercel-ready

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Google Gemini AI API key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/arhamhameed97/TripTide.git
   cd TripTide
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Environment Setup**
   Create a `.env.local` file in the root directory:
   ```env
   GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key_here
   RAPIDAPI_KEY=your_rapidapi_key_here
   AMADEUS_CLIENT_ID=your_amadeus_client_id
   AMADEUS_CLIENT_SECRET=your_amadeus_client_secret
   ```

4. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📱 How to Use

### 1. **Plan Your Trip**
   - Enter trip details (destination, dates, preferences)
   - Set your total trip budget
   - Choose accommodation and activity preferences

### 2. **AI Generation**
   - Click "Generate Itinerary"
   - AI creates personalized daily schedules
   - Each activity includes specific locations and cost estimates

### 3. **Budget Management**
   - View daily budget breakdown
   - Track actual vs. planned costs
   - Get optimization recommendations

### 4. **Review & Customize**
   - View complete itinerary with costs
   - Print or share your travel plan
   - Save for future reference

## 🔧 API Integration

### Google Gemini AI
- **Purpose**: Generate personalized itineraries
- **Features**: Location-specific recommendations, cost estimates
- **Rate Limits**: Single API call per request to conserve quota

### External APIs (Optional)
- **Amadeus**: Flight information and pricing
- **Booking.com**: Hotel recommendations and availability
- **RapidAPI**: Additional travel services

## 📁 Project Structure

```
TripTide/
├── app/                          # Next.js 13+ app directory
│   ├── api/                     # API routes
│   │   └── generate-itinerary/  # AI itinerary generation
│   ├── results/                 # Results page
│   └── page.tsx                 # Home page
├── components/                   # React components
│   ├── TripForm.tsx            # Main trip planning form
│   ├── BudgetSummary.tsx       # Budget overview component
│   ├── TripCostSummary.tsx     # Cost tracking component
│   └── ItineraryTable.tsx      # Itinerary display
├── lib/                         # Utility functions
├── public/                      # Static assets
└── styles/                      # Global styles
```

## 🎨 Key Components

### TripForm
- **Budget Input**: Total trip budget with validation
- **Date Selection**: Flexible date range picker
- **Preferences**: Accommodation and activity choices
- **Smart Validation**: Real-time form validation

### BudgetSummary
- **Daily Budget**: Automatic calculation and breakdown
- **Category Allocation**: Percentage-based budget distribution
- **Recommendations**: Budget-appropriate suggestions

### TripCostSummary
- **Cost Tracking**: Real-time cost aggregation
- **Budget Comparison**: Planned vs. actual spending
- **Optimization Tips**: Personalized cost-saving advice

### ItineraryTable
- **Daily View**: Organized by day and hour
- **Cost Display**: Individual activity costs
- **Location Details**: Full addresses and venue names

## 🔒 Security Features

- **Environment Variables**: Secure API key management
- **Input Validation**: Client and server-side validation
- **Error Handling**: Graceful error management
- **Rate Limiting**: API quota management

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Other Platforms
- **Netlify**: Compatible with Next.js
- **Railway**: Easy deployment with environment management
- **AWS/GCP**: Full control over infrastructure

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Google Gemini AI**: For intelligent itinerary generation
- **shadcn/ui**: For beautiful, accessible components
- **Next.js Team**: For the amazing framework
- **Tailwind CSS**: For utility-first styling

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/arhamhameed97/TripTide/issues)
- **Discussions**: [GitHub Discussions](https://github.com/arhamhameed97/TripTide/discussions)
- **Email**: [Your Email]

---

**Made with ❤️ by [Your Name]**

*Transform your travel planning with AI-powered intelligence and smart budget management!*
