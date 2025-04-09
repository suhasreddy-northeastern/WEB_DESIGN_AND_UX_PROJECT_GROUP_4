// utils/matchScoring.js

const normalizeFloor = (value) => {
  if (!value) return '';
  const floor = parseInt(value);
  if (!isNaN(floor)) {
    if (floor <= 1) return 'Ground Floor';
    if (floor >= 2 && floor <= 5) return 'Mid-level Floor';
    return 'Top Floor';
  }
  // Handle case where value contains "Ground" text
  if (typeof value === 'string' && value.toLowerCase().includes('ground')) {
    return 'Ground Floor';
  }
  return value;
};

const normalizePets = (value) => {
  if (!value) return '';
  const str = typeof value === 'string' ? value.toLowerCase() : '';
  if (str.includes('no') || str.includes('not')) return 'No';
  if (str.includes('yes') || str.includes('allow')) return 'Yes';
  return 'Yes'; // Default to yes if unclear
};

const normalizeRoommates = (val) => {
  if (!val) return '';
  const str = typeof val === 'string' ? val.toLowerCase() : '';
  if (str.includes('yes') || str.includes('with roommates') || str.includes('friends')) return 'Yes';
  return 'No';
};

const normalizeBedrooms = (value) => {
  if (!value) return '';
  // Extract just the number if it contains "Bedrooms" text
  if (typeof value === 'string') {
    const match = value.match(/(\d+)/);
    return match ? match[1] : value;
  }
  return value;
};

const normalizeParking = (value) => {
  if (!value) return '';
  const str = typeof value === 'string' ? value.toLowerCase() : '';
  if (str.includes('yes') || str.includes('need')) return 'Yes';
  if (str.includes('no')) return 'No';
  return value;
};

const parsePriceRange = (range) => {
  if (!range || typeof range !== 'string') return [0, Infinity];
  
  // Handle "$3,000+" format
  if (range.includes('+')) {
    const minPrice = parseInt(range.replace(/[^\d]/g, ''));
    return [minPrice, Infinity];
  }
  
  // Handle standard range format
  const parts = range.split('-').map(s => parseInt(s.replace(/[^\d]/g, '')));
  if (parts.length === 2) return parts;
  
  // If only one number is found, assume it's the maximum
  if (parts.length === 1 && !isNaN(parts[0])) return [0, parts[0]];
  
  return [0, Infinity]; // Default
};

const parseSqftRange = (range) => {
  if (!range || typeof range !== 'string') return [null, null];
  
  // Handle range formats like "500 - 1,000 sq. ft."
  const numbers = range.match(/(\d+(?:,\d+)?)/g);
  if (numbers && numbers.length >= 2) {
    return [
      parseInt(numbers[0].replace(/,/g, '')), 
      parseInt(numbers[1].replace(/,/g, ''))
    ];
  }
  
  // Try to parse a single number
  if (numbers && numbers.length === 1) {
    const num = parseInt(numbers[0].replace(/,/g, ''));
    return [num, num];
  }
  
  return [null, null];
};

const normalizeAmenities = (amenities) => {
  if (!Array.isArray(amenities)) return [];
  
  return amenities.map(item => {
    if (!item) return '';
    const str = item.toLowerCase().trim();
    // Normalize common amenity names
    if (str.includes('gym') || str.includes('fitness')) return 'Gym';
    if (str.includes('park') && str.includes('space')) return 'Parking Space';
    if (str.includes('balcon')) return 'Balcony';
    if (str.includes('laundry') || str.includes('washer')) return 'In-Unit Laundry';
    return item;
  });
};

const calculateMatchScore = (pref, apt) => {
  let score = 0;
  let maxScore = 0;

  const addScore = (weight, isMatch) => {
    maxScore += weight;
    if (isMatch) score += weight;
  };

  // 1. Price Range - Higher weight (15)
  if (pref.priceRange && apt.price) {
    const [minPrice, maxPrice] = parsePriceRange(pref.priceRange);
    const isInRange = apt.price >= minPrice && (maxPrice === Infinity || apt.price <= maxPrice);
    addScore(15, isInRange);
  }

  // 2. Bedrooms - Higher weight (15)
  const normalizedPrefBedrooms = normalizeBedrooms(pref.bedrooms);
  const normalizedAptBedrooms = normalizeBedrooms(apt.bedrooms);
  addScore(15, normalizedPrefBedrooms && normalizedAptBedrooms && normalizedPrefBedrooms === normalizedAptBedrooms);

  // 3. Neighborhood - Higher weight (10)
  addScore(10, pref.neighborhood && apt.neighborhood && pref.neighborhood === apt.neighborhood);

  // 4. Floor (normalized) - Weight 5
  const prefFloor = normalizeFloor(pref.floor);
  const aptFloor = normalizeFloor(apt.floor);
  addScore(5, prefFloor && aptFloor && prefFloor === aptFloor);

  // 5. Pets (normalized) - Weight 8
  const prefPets = normalizePets(pref.pets);
  const aptPets = normalizePets(apt.pets);
  addScore(8, prefPets && aptPets && prefPets === aptPets);

  // 6. Amenities (partial match) - Weight varies based on number of amenities
  if (Array.isArray(pref.amenities) && Array.isArray(apt.amenities)) {
    const normalizedPrefAmenities = normalizeAmenities(pref.amenities);
    const normalizedAptAmenities = normalizeAmenities(apt.amenities);
    
    // Count matching amenities
    const shared = normalizedAptAmenities.filter(item => 
      normalizedPrefAmenities.some(prefItem => 
        prefItem.toLowerCase() === item.toLowerCase()
      )
    ).length;
    
    const weightPerAmenity = 3;
    const totalAmenityWeight = normalizedPrefAmenities.length * weightPerAmenity;
    maxScore += totalAmenityWeight;
    
    // Calculate proportional score for amenities
    if (normalizedPrefAmenities.length > 0) {
      const amenityScore = (shared / normalizedPrefAmenities.length) * totalAmenityWeight;
      score += amenityScore;
    }
  }

  // 7. Style - Weight 5
  addScore(5, pref.style && apt.style && pref.style === apt.style);

  // 8. Move-in Date - Weight 8
  if (pref.moveInDate && apt.moveInDate) {
    const prefDate = new Date(pref.moveInDate);
    const aptDate = new Date(apt.moveInDate);
    addScore(8, aptDate <= prefDate);
  }

  // 9. Parking - Weight 8
  const prefParking = normalizeParking(pref.parking);
  const aptParking = normalizeParking(apt.parking);
  addScore(8, prefParking && aptParking && prefParking === aptParking);

  // 10. Transport - Weight 5
  // More lenient matching for transport
  if (pref.transport && apt.transport) {
    const prefTransport = pref.transport.toLowerCase();
    const aptTransport = apt.transport.toLowerCase();
    
    // Full match
    if (prefTransport === aptTransport) {
      addScore(5, true);
    }
    // Partial match
    else if ((prefTransport.includes('important') && aptTransport.includes('good')) ||
             (prefTransport.includes('somewhat') && aptTransport.includes('average'))) {
      addScore(5, 0.5); // Half points for close match
    }
    else {
      addScore(5, false);
    }
  }

  // 11. Sqft - Weight 6
  if (pref.sqft && apt.sqft) {
    const [minSqft, maxSqft] = parseSqftRange(pref.sqft);
    const aptSqft = parseInt(apt.sqft);
    
    if (!isNaN(aptSqft) && minSqft !== null && maxSqft !== null) {
      // Full match if within range
      if (aptSqft >= minSqft && aptSqft <= maxSqft) {
        addScore(6, true);
      }
      // Partial match if close to range (within 10%)
      else if (aptSqft >= minSqft * 0.9 && aptSqft <= maxSqft * 1.1) {
        addScore(6, 0.5); // Half points for close match
      }
      else {
        addScore(6, false);
      }
    } else {
      addScore(6, false);
    }
  }

  // 12. Safety - Weight 7
  if (pref.safety && apt.safety) {
    const prefSafety = pref.safety.toLowerCase();
    const aptSafety = apt.safety.toLowerCase();
    
    // Full match
    if (prefSafety === aptSafety) {
      addScore(7, true);
    }
    // Consider "Very Important" matches "High"
    else if ((prefSafety.includes('very') || prefSafety.includes('important')) && 
             (aptSafety.includes('high') || aptSafety.includes('good'))) {
      addScore(7, true);
    }
    // Consider "Somewhat Important" matches "Average"
    else if (prefSafety.includes('somewhat') && aptSafety.includes('average')) {
      addScore(7, true);
    }
    else {
      addScore(7, false);
    }
  }

  // 13. View - Weight 4
  addScore(4, pref.view && apt.view && pref.view === apt.view);

  // 14. Lease Capacity - Weight 8
  addScore(8, pref.leaseCapacity && apt.leaseCapacity && pref.leaseCapacity === apt.leaseCapacity);

  // 15. Roommates (normalized) - Weight 6
  const prefRoommates = normalizeRoommates(pref.roommates);
  const aptRoommates = normalizeRoommates(apt.roommates);
  addScore(6, prefRoommates && aptRoommates && prefRoommates === aptRoommates);

  // Extra boost for perfect matches
  if (score === maxScore && maxScore > 0) {
    return 100;
  }
  
  // Ensure minimum score of 30% if at least half the criteria match
  const percentScore = Math.round((score / maxScore) * 100);
  if (score >= (maxScore * 0.5) && percentScore < 30) {
    return 30;
  }
  
  // Calculate final percentage
  return Math.round((score / maxScore) * 100);
};

module.exports = {
  calculateMatchScore,
};