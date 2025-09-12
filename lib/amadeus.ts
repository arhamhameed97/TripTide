import axios from 'axios'

interface AmadeusToken {
  access_token: string
  token_type: string
  expires_in: number
}

interface AmadeusFlightOffer {
  id: string
  source: string
  instantTicketingRequired: boolean
  nonHomogeneous: boolean
  oneWay: boolean
  lastTicketingDate: string
  numberOfBookableSeats: number
  itineraries: Array<{
    duration: string
    segments: Array<{
      departure: {
        iataCode: string
        terminal?: string
        at: string
      }
      arrival: {
        iataCode: string
        terminal?: string
        at: string
      }
      carrierCode: string
      number: string
      aircraft: {
        code: string
      }
      operating: {
        carrierCode: string
        number: string
      }
      duration: string
      id: string
      numberOfStops: number
      blacklistedInEU: boolean
    }>
  }>
  price: {
    currency: string
    total: string
    base: string
    fees: Array<{
      amount: string
      type: string
    }>
    grandTotal: string
  }
  pricingOptions: {
    fareType: string[]
    includedCheckedBagsOnly: boolean
  }
  validatingAirlineCodes: string[]
  travelerPricings: Array<{
    travelerId: string
    fareOption: string
    travelerType: string
    price: {
      currency: string
      total: string
      base: string
    }
    fareDetailsBySegment: Array<{
      segmentId: string
      cabin: string
      fareBasis: string
      class: string
      includedCheckedBags: {
        weight: number
        weightUnit: string
      }
    }>
  }>
}

interface AmadeusHotelOffer {
  hotel: {
    hotelId: string
    name: string
    rating: number
    description: {
      lang: string
      text: string
    }
    amenities: string[]
    media: Array<{
      uri: string
      category: string
    }>
    address: {
      lines: string[]
      postalCode: string
      cityName: string
      countryCode: string
    }
    contact: {
      phone: string
      fax?: string
      email?: string
    }
  }
  offers: Array<{
    id: string
    checkInDate: string
    checkOutDate: string
    rateCode: string
    rateFamilyEstimated: {
      code: string
      type: string
    }
    room: {
      type: string
      typeEstimated: {
        category: string
        beds: number
        bedType: string
      }
      description: {
        text: string
        lang: string
      }
    }
    guests: {
      adults: number
    }
    price: {
      currency: string
      total: string
      base: string
      variations: {
        average: {
          base: string
        }
        changes: Array<{
          startDate: string
          endDate: string
          total: string
        }>
      }
    }
    policies: {
      paymentType: string
      cancellation: {
        type: string
        amount: string
        numberOfNights: number
        deadline: string
      }
    }
    self: string
  }>
  self: string
}

class AmadeusService {
  private clientId: string
  private clientSecret: string
  private baseUrl: string
  private token: AmadeusToken | null = null
  private tokenExpiry: number = 0

  constructor() {
    this.clientId = process.env.AMADEUS_CLIENT_ID || ''
    this.clientSecret = process.env.AMADEUS_CLIENT_SECRET || ''
    this.baseUrl = 'https://test.api.amadeus.com'
  }

  private async getAccessToken(): Promise<string> {
    // Check if we have a valid token
    if (this.token && Date.now() < this.tokenExpiry) {
      return this.token.access_token
    }

    try {
      const response = await axios.post(`${this.baseUrl}/v1/security/oauth2/token`, {
        grant_type: 'client_credentials',
        client_id: this.clientId,
        client_secret: this.clientSecret
      }, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      })

      this.token = response.data
      this.tokenExpiry = Date.now() + (this.token.expires_in * 1000) - 60000 // 1 minute buffer
      
      return this.token.access_token
    } catch (error) {
      console.error('Failed to get Amadeus access token:', error)
      throw new Error('Failed to authenticate with Amadeus API')
    }
  }

  async searchFlights(params: {
    origin: string
    destination: string
    departureDate: string
    returnDate?: string
    adults: number
    children?: number
    infants?: number
    travelClass?: string
    max?: number
  }) {
    try {
      const token = await this.getAccessToken()
      
      const searchParams = new URLSearchParams({
        originLocationCode: params.origin,
        destinationLocationCode: params.destination,
        departureDate: params.departureDate,
        adults: params.adults.toString(),
        max: (params.max || 10).toString(),
        currencyCode: 'USD',
        ...(params.returnDate && { returnDate: params.returnDate }),
        ...(params.children && { children: params.children.toString() }),
        ...(params.infants && { infants: params.infants.toString() }),
        ...(params.travelClass && { travelClass: params.travelClass })
      })

      const response = await axios.get(
        `${this.baseUrl}/v2/shopping/flight-offers?${searchParams}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      )

      return this.transformFlightOffers(response.data.data || [])
    } catch (error) {
      console.error('Amadeus flight search error:', error)
      throw new Error('Failed to search flights')
    }
  }

  async searchHotels(params: {
    cityCode: string
    checkInDate: string
    checkOutDate: string
    adults: number
    rooms?: number
    max?: number
  }) {
    try {
      const token = await this.getAccessToken()
      
      const searchParams = new URLSearchParams({
        cityCode: params.cityCode,
        checkInDate: params.checkInDate,
        checkOutDate: params.checkOutDate,
        adults: params.adults.toString(),
        max: (params.max || 10).toString(),
        currencyCode: 'USD',
        ...(params.rooms && { rooms: params.rooms.toString() })
      })

      const response = await axios.get(
        `${this.baseUrl}/v1/shopping/hotel-offers?${searchParams}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      )

      return this.transformHotelOffers(response.data.data || [])
    } catch (error) {
      console.error('Amadeus hotel search error:', error)
      throw new Error('Failed to search hotels')
    }
  }

  private transformFlightOffers(offers: AmadeusFlightOffer[]) {
    return offers.map((offer, index) => {
      const itinerary = offer.itineraries[0]
      const segment = itinerary.segments[0]
      const lastSegment = itinerary.segments[itinerary.segments.length - 1]
      
      return {
        id: offer.id,
        name: `${segment.operating.carrierCode} ${segment.operating.number}`,
        description: `Flight from ${segment.departure.iataCode} to ${lastSegment.arrival.iataCode}`,
        price: parseFloat(offer.price.total),
        originalPrice: parseFloat(offer.price.total) * 1.2, // Simulate original price
        currency: offer.price.currency,
        rating: 4.0 + Math.random() * 0.8, // Random rating between 4.0-4.8
        reviewCount: Math.floor(Math.random() * 2000) + 500,
        image: `https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=400&h=300&fit=crop&sig=${index}`,
        amenities: ['Free WiFi', 'Entertainment', 'Meal Service'],
        availability: {
          available: offer.numberOfBookableSeats > 0,
          lastUpdated: new Date().toISOString(),
          capacity: offer.numberOfBookableSeats
        },
        bookingUrl: `https://www.amadeus.com/flight-offers/${offer.id}`,
        provider: segment.operating.carrierCode,
        location: `${segment.departure.iataCode} → ${lastSegment.arrival.iataCode}`,
        duration: itinerary.duration,
        departureTime: segment.departure.at,
        arrivalTime: lastSegment.arrival.at,
        airline: segment.operating.carrierCode,
        flightNumber: segment.operating.number,
        origin: segment.departure.iataCode,
        destination: lastSegment.arrival.iataCode,
        stops: segment.numberOfStops,
        aircraft: segment.aircraft.code,
        cabinClass: offer.travelerPricings[0]?.fareDetailsBySegment[0]?.cabin || 'Economy',
        baggageAllowance: '1 carry-on + personal item'
      }
    })
  }

  private transformHotelOffers(offers: AmadeusHotelOffer[]) {
    return offers.map((offer, index) => {
      const hotelOffer = offer.offers[0]
      
      return {
        id: offer.hotel.hotelId,
        name: offer.hotel.name,
        description: offer.hotel.description.text,
        price: parseFloat(hotelOffer.price.total),
        originalPrice: parseFloat(hotelOffer.price.total) * 1.15, // Simulate original price
        currency: hotelOffer.price.currency,
        rating: offer.hotel.rating,
        reviewCount: Math.floor(Math.random() * 1500) + 300,
        image: offer.hotel.media[0]?.uri || `https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop&sig=${index}`,
        amenities: offer.hotel.amenities.slice(0, 6),
        availability: {
          available: true,
          lastUpdated: new Date().toISOString(),
          capacity: Math.floor(Math.random() * 20) + 5
        },
        bookingUrl: hotelOffer.self,
        provider: 'Amadeus',
        location: offer.hotel.address.cityName,
        address: offer.hotel.address.lines.join(', '),
        coordinates: [0, 0], // Would need geocoding service
        starRating: offer.hotel.rating,
        propertyType: hotelOffer.room.typeEstimated.category
      }
    })
  }
}

export const amadeusService = new AmadeusService()
