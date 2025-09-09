// Comprehensive world coordinates database for travel planning
export const worldCoordinates: { [key: string]: [number, number] } = {
  // Major World Cities
  'london': [51.5074, -0.1278],
  'paris': [48.8566, 2.3522],
  'new york': [40.7128, -74.0060],
  'tokyo': [35.6762, 139.6503],
  'sydney': [-33.8688, 151.2093],
  'dubai': [25.2048, 55.2708],
  'singapore': [1.3521, 103.8198],
  'hong kong': [22.3193, 114.1694],
  'rome': [41.9028, 12.4964],
  'barcelona': [41.3851, 2.1734],
  'amsterdam': [52.3676, 4.9041],
  'berlin': [52.5200, 13.4050],
  'madrid': [40.4168, -3.7038],
  'vienna': [48.2082, 16.3738],
  'prague': [50.0755, 14.4378],
  'budapest': [47.4979, 19.0402],
  'istanbul': [41.0082, 28.9784],
  'moscow': [55.7558, 37.6176],
  'mumbai': [19.0760, 72.8777],
  'delhi': [28.7041, 77.1025],
  'bangkok': [13.7563, 100.5018],
  'kuala lumpur': [3.1390, 101.6869],
  'jakarta': [-6.2088, 106.8456],
  'manila': [14.5995, 120.9842],
  'seoul': [37.5665, 126.9780],
  'beijing': [39.9042, 116.4074],
  'shanghai': [31.2304, 121.4737],
  'melbourne': [-37.8136, 144.9631],
  'vancouver': [49.2827, -123.1207],
  'toronto': [43.6532, -79.3832],
  'montreal': [45.5017, -73.5673],
  
  // Pakistani Cities
  'karachi': [24.8607, 67.0011],
  'islamabad': [33.6844, 73.0479],
  'lahore': [31.5204, 74.3587],
  'faisalabad': [31.4169, 73.0892],
  'rawalpindi': [33.5651, 73.0169],
  'multan': [30.1575, 71.5249],
  'peshawar': [34.0080, 71.5785],
  'quetta': [30.1798, 66.9750],
  
  // Indian Cities (excluding Mumbai which is already in major cities)
  'bangalore': [12.9716, 77.5946],
  'chennai': [13.0827, 80.2707],
  'kolkata': [22.5726, 88.3639],
  'pune': [18.5204, 73.8567],
  'hyderabad': [17.3850, 78.4867],
  'ahmedabad': [23.0225, 72.5714],
  'surat': [21.1702, 72.8311],
  'jaipur': [26.9124, 75.7873],
  
  // US Cities
  'los angeles': [34.0522, -118.2437],
  'chicago': [41.8781, -87.6298],
  'houston': [29.7604, -95.3698],
  'phoenix': [33.4484, -112.0740],
  'philadelphia': [39.9526, -75.1652],
  'san antonio': [29.4241, -98.4936],
  'san diego': [32.7157, -117.1611],
  'dallas': [32.7767, -96.7970],
  'san jose': [37.3382, -121.8863],
  'austin': [30.2672, -97.7431],
  'san francisco': [37.7749, -122.4194],
  'miami': [25.7617, -80.1918],
  'seattle': [47.6062, -122.3321],
  'boston': [42.3601, -71.0589],
  'washington dc': [38.9072, -77.0369],
  'atlanta': [33.7490, -84.3880],
  'las vegas': [36.1699, -115.1398],
  'denver': [39.7392, -104.9903],
  'portland': [45.5152, -122.6784],
  
  // European Cities
  'athens': [37.9838, 23.7275],
  'zurich': [47.3769, 8.5417],
  'geneva': [46.2044, 6.1432],
  'munich': [48.1351, 11.5820],
  'frankfurt': [50.1109, 8.6821],
  'milan': [45.4642, 9.1900],
  'florence': [43.7696, 11.2558],
  'venice': [45.4408, 12.3155],
  'naples': [40.8518, 14.2681],
  'lisbon': [38.7223, -9.1393],
  'porto': [41.1579, -8.6291],
  'brussels': [50.8503, 4.3517],
  'antwerp': [51.2194, 4.4025],
  'stockholm': [59.3293, 18.0686],
  'oslo': [59.9139, 10.7522],
  'copenhagen': [55.6761, 12.5683],
  'helsinki': [60.1699, 24.9384],
  'warsaw': [52.2297, 21.0122],
  'krakow': [50.0647, 19.9450],
  'dublin': [53.3498, -6.2603],
  'edinburgh': [55.9533, -3.1883],
  'glasgow': [55.8642, -4.2518],
  'manchester': [53.4808, -2.2426],
  'liverpool': [53.4084, -2.9916],
  'birmingham': [52.4862, -1.8904],
  
  // Middle Eastern Cities
  'riyadh': [24.7136, 46.6753],
  'jeddah': [21.2854, 39.2376],
  'doha': [25.2769, 51.5200],
  'abu dhabi': [24.2992, 54.6969],
  'kuwait city': [29.3117, 47.4818],
  'manama': [26.2285, 50.5860],
  'muscat': [23.5859, 58.4059],
  'tehran': [35.6892, 51.3890],
  'baghdad': [33.3152, 44.3661],
  'damascus': [33.5138, 36.2765],
  'beirut': [33.8938, 35.5018],
  'amman': [31.9454, 35.9284],
  'jerusalem': [31.7683, 35.2137],
  'tel aviv': [32.0853, 34.7818],
  'cairo': [30.0444, 31.2357],
  'alexandria': [31.2001, 29.9187],
  
  // African Cities
  'johannesburg': [-26.2041, 28.0473],
  'cape town': [-33.9249, 18.4241],
  'durban': [-29.8587, 31.0218],
  'lagos': [6.5244, 3.3792],
  'abuja': [9.0765, 7.3986],
  'nairobi': [-1.2921, 36.8219],
  'addis ababa': [9.1450, 38.7451],
  'casablanca': [33.5731, -7.5898],
  'marrakech': [31.6295, -7.9811],
  'tunis': [36.8065, 10.1815],
  'algiers': [36.7538, 3.0588],
  'accra': [5.6037, -0.1870],
  'dar es salaam': [-6.7924, 39.2083],
  'kampala': [0.3476, 32.5825],
  'khartoum': [15.5007, 32.5599],
  
  // Asian Cities  
  'kabul': [34.5553, 69.2075],
  'dhaka': [23.8103, 90.4125],
  'colombo': [6.9271, 79.8612],
  'kathmandu': [27.7172, 85.3240],
  'thimphu': [27.4728, 89.6393],
  'male': [4.1755, 73.5093],
  'yangon': [16.8661, 96.1951],
  'vientiane': [17.9757, 102.6331],
  'phnom penh': [11.5449, 104.8922],
  'hanoi': [21.0285, 105.8542],
  'ho chi minh city': [10.8231, 106.6297],
  'taipei': [25.0330, 121.5654],
  'macau': [22.1987, 113.5439],
  'ulaanbaatar': [47.8864, 106.9057],
  'astana': [51.1694, 71.4491],
  'almaty': [43.2220, 76.8512],
  'tashkent': [41.2995, 69.2401],
  'bishkek': [42.8746, 74.5698],
  'dushanbe': [38.5598, 68.7870],
  'ashgabat': [37.9601, 58.3261],
  'yerevan': [40.1812, 44.5136],
  'tbilisi': [41.7151, 44.8271],
  'baku': [40.4093, 49.8671],
  
  // Central American Cities
  'mexico city': [19.4326, -99.1332],
  'guadalajara': [20.6597, -103.3496],
  'monterrey': [25.6866, -100.3161],
  'cancun': [21.1619, -86.8515],
  'guatemala city': [14.6349, -90.5069],
  'san jose costa rica': [9.9281, -84.0907],
  'panama city': [8.9824, -79.5199],
  
  // South American Cities
  'sao paulo': [-23.5558, -46.6396],
  'rio de janeiro': [-22.9068, -43.1729],
  'brasilia': [-15.8267, -47.9218],
  'buenos aires': [-34.6118, -58.3960],
  'lima': [-12.0464, -77.0428],
  'bogota': [4.7110, -74.0721],
  'caracas': [10.4806, -66.9036],
  'santiago': [-33.4489, -70.6693],
  'montevideo': [-34.9011, -56.1645],
  'quito': [-0.1807, -78.4678],
  'la paz': [-16.5000, -68.1193],
  
  // Oceania Cities
  'auckland': [-36.8485, 174.7633],
  'wellington': [-41.2865, 174.7762],
  'christchurch': [-43.5321, 172.6362],
  'brisbane': [-27.4698, 153.0251],
  'perth': [-31.9505, 115.8605],
  'adelaide': [-34.9285, 138.6007],
  'hobart': [-42.8821, 147.3272],
  'darwin': [-12.4634, 130.8456],
  'canberra': [-35.2809, 149.1300],
  'gold coast': [-28.0167, 153.4000],
}

// Function to find coordinates for a location
export function getLocationCoordinates(location: string, destination?: string): [number, number] {
  const locationLower = location.toLowerCase().trim()
  
  // Direct match
  if (worldCoordinates[locationLower]) {
    return addRandomVariation(worldCoordinates[locationLower])
  }
  
  // Partial match - check if location contains any city name
  for (const [city, coords] of Object.entries(worldCoordinates)) {
    if (locationLower.includes(city) || city.includes(locationLower.split(' ')[0])) {
      return addRandomVariation(coords)
    }
  }
  
  // Try to match with destination if provided
  if (destination) {
    const destinationLower = destination.toLowerCase().trim()
    if (worldCoordinates[destinationLower]) {
      return addRandomVariation(worldCoordinates[destinationLower], 0.02)
    }
    
    for (const [city, coords] of Object.entries(worldCoordinates)) {
      if (destinationLower.includes(city)) {
        return addRandomVariation(coords, 0.02)
      }
    }
  }
  
  // Default to center of the world
  return [20, 0]
}

// Add small random variation to spread out points in same city
function addRandomVariation(coords: [number, number], variance = 0.01): [number, number] {
  const latVariation = (Math.random() - 0.5) * variance
  const lngVariation = (Math.random() - 0.5) * variance
  return [coords[0] + latVariation, coords[1] + lngVariation]
}



