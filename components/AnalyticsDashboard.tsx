'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calendar, 
  MapPin, 
  Users, 
  Star, 
  Award,
  BarChart3,
  PieChart,
  Activity,
  Target,
  Globe,
  Clock,
  Heart,
  Share2,
  Download,
  RefreshCw
} from 'lucide-react'

interface TravelStats {
  totalTrips: number
  totalDays: number
  totalSpent: number
  countriesVisited: number
  citiesVisited: number
  averageRating: number
  totalReviews: number
  favoriteDestinations: string[]
  travelGoals: {
    completed: number
    total: number
    nextGoal: string
  }
  monthlySpending: {
    month: string
    amount: number
  }[]
  categorySpending: {
    category: string
    amount: number
    percentage: number
  }[]
  destinationStats: {
    destination: string
    visits: number
    totalSpent: number
    averageRating: number
  }[]
  seasonalTrends: {
    season: string
    trips: number
    averageSpending: number
  }[]
}

interface AnalyticsDashboardProps {
  userId?: string
  currentTripData?: any
}

export default function AnalyticsDashboard({ 
  userId, 
  currentTripData 
}: AnalyticsDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview')
  const [timeRange, setTimeRange] = useState('1y')
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState<TravelStats>({
    totalTrips: 12,
    totalDays: 89,
    totalSpent: 15420,
    countriesVisited: 8,
    citiesVisited: 24,
    averageRating: 4.6,
    totalReviews: 47,
    favoriteDestinations: ['Paris', 'Tokyo', 'New York', 'Barcelona', 'San Francisco'],
    travelGoals: {
      completed: 7,
      total: 10,
      nextGoal: 'Visit 10 countries'
    },
    monthlySpending: [
      { month: 'Jan', amount: 1200 },
      { month: 'Feb', amount: 1800 },
      { month: 'Mar', amount: 1400 },
      { month: 'Apr', amount: 2200 },
      { month: 'May', amount: 1600 },
      { month: 'Jun', amount: 1900 },
      { month: 'Jul', amount: 2500 },
      { month: 'Aug', amount: 2100 },
      { month: 'Sep', amount: 1800 },
      { month: 'Oct', amount: 1500 },
      { month: 'Nov', amount: 1200 },
      { month: 'Dec', amount: 3200 }
    ],
    categorySpending: [
      { category: 'Accommodation', amount: 5400, percentage: 35 },
      { category: 'Transportation', amount: 3850, percentage: 25 },
      { category: 'Food & Dining', amount: 3080, percentage: 20 },
      { category: 'Activities', amount: 2310, percentage: 15 },
      { category: 'Shopping', amount: 770, percentage: 5 }
    ],
    destinationStats: [
      { destination: 'Paris', visits: 3, totalSpent: 2800, averageRating: 4.8 },
      { destination: 'Tokyo', visits: 2, totalSpent: 3200, averageRating: 4.7 },
      { destination: 'New York', visits: 4, totalSpent: 3600, averageRating: 4.5 },
      { destination: 'Barcelona', visits: 2, totalSpent: 1800, averageRating: 4.6 },
      { destination: 'San Francisco', visits: 1, totalSpent: 1200, averageRating: 4.4 }
    ],
    seasonalTrends: [
      { season: 'Spring', trips: 4, averageSpending: 1400 },
      { season: 'Summer', trips: 5, averageSpending: 1800 },
      { season: 'Fall', trips: 2, averageSpending: 1200 },
      { season: 'Winter', trips: 1, averageSpending: 2200 }
    ]
  })

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const getTrendIcon = (current: number, previous: number) => {
    if (current > previous) return <TrendingUp className="w-4 h-4 text-green-600" />
    if (current < previous) return <TrendingDown className="w-4 h-4 text-red-600" />
    return <Activity className="w-4 h-4 text-gray-600" />
  }

  const getTrendColor = (current: number, previous: number) => {
    if (current > previous) return 'text-green-600'
    if (current < previous) return 'text-red-600'
    return 'text-gray-600'
  }

  const calculatePercentageChange = (current: number, previous: number) => {
    if (previous === 0) return 0
    return ((current - previous) / previous) * 100
  }

  const renderOverviewCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Trips</CardTitle>
          <Globe className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalTrips}</div>
          <p className="text-xs text-muted-foreground">
            +2 from last year
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(stats.totalSpent)}</div>
          <p className="text-xs text-muted-foreground">
            +12% from last year
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Countries Visited</CardTitle>
          <MapPin className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.countriesVisited}</div>
          <p className="text-xs text-muted-foreground">
            +1 from last year
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
          <Star className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.averageRating}</div>
          <p className="text-xs text-muted-foreground">
            +0.2 from last year
          </p>
        </CardContent>
      </Card>
    </div>
  )

  const renderSpendingAnalysis = () => (
    <div className="space-y-6">
      {/* Monthly Spending Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Spending Trends</CardTitle>
          <CardDescription>
            Your travel spending over the past 12 months
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-end justify-between space-x-2">
            {stats.monthlySpending.map((item, index) => {
              const maxAmount = Math.max(...stats.monthlySpending.map(m => m.amount))
              const height = (item.amount / maxAmount) * 100
              const isCurrentMonth = index === stats.monthlySpending.length - 1
              
              return (
                <div key={item.month} className="flex flex-col items-center space-y-2">
                  <div className="text-xs text-gray-600">{formatCurrency(item.amount)}</div>
                  <div 
                    className={`w-8 rounded-t-sm transition-all ${
                      isCurrentMonth ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                    style={{ height: `${height}%` }}
                  />
                  <div className="text-xs text-gray-600">{item.month}</div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Category Spending */}
      <Card>
        <CardHeader>
          <CardTitle>Spending by Category</CardTitle>
          <CardDescription>
            Breakdown of your travel expenses
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.categorySpending.map((category) => (
              <div key={category.category} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-blue-600" />
                  <span className="text-sm font-medium">{category.category}</span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${category.percentage}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium w-20 text-right">
                    {formatCurrency(category.amount)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderDestinationInsights = () => (
    <div className="space-y-6">
      {/* Top Destinations */}
      <Card>
        <CardHeader>
          <CardTitle>Top Destinations</CardTitle>
          <CardDescription>
            Your most visited and highest-rated destinations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.destinationStats.map((destination, index) => (
              <div key={destination.destination} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-blue-600">{index + 1}</span>
                  </div>
                  <div>
                    <h4 className="font-medium">{destination.destination}</h4>
                    <p className="text-sm text-gray-600">
                      {destination.visits} visits • {formatCurrency(destination.totalSpent)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(destination.averageRating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-medium">{destination.averageRating}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Travel Goals */}
      <Card>
        <CardHeader>
          <CardTitle>Travel Goals Progress</CardTitle>
          <CardDescription>
            Track your travel achievements and upcoming goals
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Countries Goal</span>
              <span className="text-sm text-gray-600">
                {stats.travelGoals.completed}/{stats.travelGoals.total}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-600 h-2 rounded-full" 
                style={{ width: `${(stats.travelGoals.completed / stats.travelGoals.total) * 100}%` }}
              />
            </div>
            <p className="text-sm text-gray-600">
              Next goal: {stats.travelGoals.nextGoal}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderSeasonalAnalysis = () => (
    <div className="space-y-6">
      {/* Seasonal Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Seasonal Travel Patterns</CardTitle>
          <CardDescription>
            When you prefer to travel and how much you spend
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.seasonalTrends.map((season) => (
              <div key={season.season} className="text-center p-4 border rounded-lg">
                <h4 className="font-medium text-lg">{season.season}</h4>
                <p className="text-2xl font-bold text-blue-600">{season.trips}</p>
                <p className="text-sm text-gray-600">trips</p>
                <p className="text-sm font-medium mt-2">
                  {formatCurrency(season.averageSpending)}
                </p>
                <p className="text-xs text-gray-600">avg. spending</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Travel Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Travel Insights</CardTitle>
          <CardDescription>
            Personalized insights about your travel patterns
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <Award className="w-5 h-5 text-yellow-500 mt-0.5" />
              <div>
                <h4 className="font-medium">Most Expensive Trip</h4>
                <p className="text-sm text-gray-600">Tokyo, Japan - {formatCurrency(3200)}</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Heart className="w-5 h-5 text-red-500 mt-0.5" />
              <div>
                <h4 className="font-medium">Favorite Destination</h4>
                <p className="text-sm text-gray-600">Paris, France - 4.8/5 rating</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Clock className="w-5 h-5 text-blue-500 mt-0.5" />
              <div>
                <h4 className="font-medium">Longest Trip</h4>
                <p className="text-sm text-gray-600">14 days in Europe</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Target className="w-5 h-5 text-green-500 mt-0.5" />
              <div>
                <h4 className="font-medium">Budget Efficiency</h4>
                <p className="text-sm text-gray-600">You're 15% under your average budget this year</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Travel Analytics Dashboard</h2>
          <p className="text-gray-600">
            Insights into your travel patterns, spending, and achievements
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
          <Button variant="outline" size="sm">
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="spending">Spending</TabsTrigger>
          <TabsTrigger value="destinations">Destinations</TabsTrigger>
          <TabsTrigger value="seasonal">Seasonal</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {renderOverviewCards()}
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Total Days Traveling</span>
                    <span className="font-medium">{stats.totalDays}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cities Visited</span>
                    <span className="font-medium">{stats.citiesVisited}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Reviews</span>
                    <span className="font-medium">{stats.totalReviews}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Average Trip Length</span>
                    <span className="font-medium">{Math.round(stats.totalDays / stats.totalTrips)} days</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Favorite Destinations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {stats.favoriteDestinations.map((destination, index) => (
                    <div key={destination} className="flex items-center justify-between">
                      <span className="text-sm">{destination}</span>
                      <Badge variant="secondary">{index + 1}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="spending" className="space-y-6">
          {renderSpendingAnalysis()}
        </TabsContent>

        <TabsContent value="destinations" className="space-y-6">
          {renderDestinationInsights()}
        </TabsContent>

        <TabsContent value="seasonal" className="space-y-6">
          {renderSeasonalAnalysis()}
        </TabsContent>
      </Tabs>
    </div>
  )
}
