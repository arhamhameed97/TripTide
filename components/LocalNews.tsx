'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ExternalLink, Newspaper, Clock } from 'lucide-react'

interface NewsData {
  destination: string
  travelDates: {
    startDate: string
    endDate: string
  }
  news: Array<{
    title: string
    description: string
    url: string
    publishedAt: string
    source: string
    imageUrl: string | null
    relevance: 'high' | 'medium' | 'low'
  }>
  totalResults: number
}

interface LocalNewsProps {
  news: NewsData | null
}

export default function LocalNews({ news }: LocalNewsProps) {
  if (!news) {
    return (
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-semibold text-green-900 flex items-center gap-2">
            <Newspaper className="w-5 h-5" />
            Local News
          </CardTitle>
          <CardDescription className="text-green-700">
            News data is being loaded...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="text-4xl mb-4">📰</div>
            <p className="text-gray-600">Loading local news...</p>
            <p className="text-sm text-gray-500 mt-2">Please wait while we fetch the latest news</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!news.news.length) {
    return (
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-semibold text-green-900 flex items-center gap-2">
            <Newspaper className="w-5 h-5" />
            Local News
          </CardTitle>
          <CardDescription className="text-green-700">
            No news available for this destination
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="text-4xl mb-4">📰</div>
            <p className="text-gray-600">No news articles found</p>
            <p className="text-sm text-gray-500 mt-2">
              No recent news articles were found for this destination and date range. 
              This could be due to:
            </p>
            <ul className="text-sm text-gray-500 mt-2 space-y-1">
              <li>• No recent news for this location</li>
              <li>• News API key not configured</li>
              <li>• API rate limit exceeded</li>
            </ul>
            <p className="text-sm text-gray-500 mt-4">
              To get actual news, please ensure you have a valid NEWS_API_KEY in your .env.local file
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getRelevanceColor = (relevance: string) => {
    switch (relevance) {
      case 'high':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }

  return (
    <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-semibold text-green-900 flex items-center gap-2">
          <Newspaper className="w-5 h-5" />
          Local News from {news.destination}
        </CardTitle>
        <CardDescription className="text-green-700">
          Stay updated with the latest news during your trip
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {news.news.map((article, index) => (
            <div key={index} className="bg-white rounded-lg p-4 border border-green-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start gap-3">
                {article.imageUrl && (
                  <div className="flex-shrink-0">
                    <img 
                      src={article.imageUrl} 
                      alt={article.title}
                      className="w-16 h-16 object-cover rounded-lg"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                  </div>
                )}
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getRelevanceColor(article.relevance)}`}>
                      {article.relevance === 'high' ? 'Highly Relevant' : 
                       article.relevance === 'medium' ? 'Relevant' : 'General'}
                    </span>
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDate(article.publishedAt)}
                    </span>
                  </div>
                  
                  <h3 className="font-medium text-gray-900 mb-2 line-clamp-2">
                    {article.title}
                  </h3>
                  
                  <p className="text-sm text-gray-600 mb-3 line-clamp-3">
                    {truncateText(article.description, 150)}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 font-medium">
                      {article.source}
                    </span>
                    
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => window.open(article.url, '_blank')}
                      className="text-xs h-7 px-2"
                    >
                      <ExternalLink className="w-3 h-3 mr-1" />
                      Read
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 p-3 bg-green-100 rounded-lg">
          <div className="text-sm text-green-800">
            <strong>Travel Tips:</strong> Stay informed about local events, weather alerts, and any travel advisories. 
            {news.news.some(article => article.relevance === 'high') && ' High-relevance articles are marked for important updates.'}
          </div>
        </div>
        
        {news.totalResults > news.news.length && (
          <div className="mt-3 text-center">
            <p className="text-sm text-gray-600">
              Showing {news.news.length} of {news.totalResults} articles
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
