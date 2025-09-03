import { NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const destination = searchParams.get('destination');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!destination || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'Missing required parameters: destination, startDate, endDate' },
        { status: 400 }
      );
    }

    // Extract city and country from destination (e.g., "Paris, France" -> "Paris" and "France")
    const [cityName, countryName] = destination.split(',').map(s => s.trim());

    // Check if NEWS_API_KEY is available
    if (!process.env.NEWS_API_KEY || process.env.NEWS_API_KEY === 'your_news_api_key_here') {
      console.error('NEWS_API_KEY not configured');
      return NextResponse.json(
        { error: 'News API key not configured. Please add NEWS_API_KEY to your .env.local file' },
        { status: 500 }
      );
    }

    // Format dates for NewsAPI (YYYY-MM-DD format)
    const formatDateForAPI = (dateString: string) => {
      const date = new Date(dateString);
      return date.toISOString().split('T')[0]; // Returns YYYY-MM-DD
    };

    const formattedStartDate = formatDateForAPI(startDate);
    const formattedEndDate = formatDateForAPI(endDate);

    console.log('Fetching news for:', { cityName, countryName, formattedStartDate, formattedEndDate });

    // Use NewsAPI for local news
    const newsResponse = await axios.get(
      `https://newsapi.org/v2/everything`,
      {
        params: {
          q: `${cityName} OR ${countryName}`,
          from: formattedStartDate,
          to: formattedEndDate,
          language: 'en',
          sortBy: 'publishedAt',
          pageSize: 10,
          apiKey: process.env.NEWS_API_KEY
        }
      }
    );

    console.log('News API URL:', `https://newsapi.org/v2/everything`);
    console.log('News API params:', {
      q: `${cityName} OR ${countryName}`,
      from: formattedStartDate,
      to: formattedEndDate,
      language: 'en',
      sortBy: 'publishedAt',
      pageSize: 10,
      apiKey: process.env.NEWS_API_KEY ? '***' : 'NOT_SET'
    });

    console.log('News API response status:', newsResponse.status);
    console.log('News API response data:', newsResponse.data);

    const newsData = newsResponse.data;
    
    if (!newsData.articles || newsData.articles.length === 0) {
      console.log('No articles found in NewsAPI response');
      return NextResponse.json(
        { error: 'No news articles found for this destination and date range' },
        { status: 404 }
      );
    }
    
    // Process and format news data
    const localNews = newsData.articles.map((article: any) => ({
      title: article.title,
      description: article.description,
      url: article.url,
      publishedAt: article.publishedAt,
      source: article.source.name,
      imageUrl: article.urlToImage,
      relevance: article.title.toLowerCase().includes(cityName.toLowerCase()) ? 'high' : 'medium'
    }));

    // Sort by relevance and date
    const sortedNews = localNews.sort((a: any, b: any) => {
      if (a.relevance === 'high' && b.relevance !== 'high') return -1;
      if (b.relevance === 'high' && a.relevance !== 'high') return 1;
      return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
    });

    console.log('Processed news articles:', sortedNews.length);

    return NextResponse.json({
      destination: destination,
      travelDates: { startDate, endDate },
      news: sortedNews.slice(0, 8), // Limit to 8 most relevant articles
      totalResults: newsData.totalResults || sortedNews.length
    });

  } catch (error: any) {
    console.error('News API Error:', error);
    
    if (error.response) {
      console.error('News API response error:', error.response.status, error.response.data);
      
      if (error.response.status === 401) {
        return NextResponse.json(
          { error: 'Invalid News API key. Please check your NEWS_API_KEY in .env.local' },
          { status: 401 }
        );
      }
      
      if (error.response.status === 429) {
        return NextResponse.json(
          { error: 'News API rate limit exceeded. Please try again later.' },
          { status: 429 }
        );
      }
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch news data. Please check your internet connection and try again.' },
      { status: 500 }
    );
  }
}
