// utils/matchScoring.js

const normalizeFloor = (value) => {
    if (!value) return '';
    const floor = parseInt(value);
    if (!isNaN(floor)) {
      if (floor <= 1) return 'Ground Floor';
      if (floor >= 2 && floor <= 5) return 'Mid-level Floor';
      return 'Top Floor';
    }
    return value;
  };
  
  const normalizePets = (value) => {
    if (!value) return '';
    const str = value.toLowerCase();
    return str.includes('no') || str.includes('not') ? 'No' : 'Yes';
  };
  
  const normalizeRoommates = (val) => {
    if (!val) return '';
    return ['yes', 'with roommates', 'with roommates/friends'].some((s) =>
      val.toLowerCase().includes(s)
    )
      ? 'Yes'
      : 'No';
  };
  
  const parseSqftRange = (range) => {
    if (!range || typeof range !== 'string') return [null, null];
    const parts = range.split('–').map((s) => parseInt(s.trim().replace(/[^\d]/g, '')));
    return parts.length === 2 ? parts : [null, null];
  };
  
  const calculateMatchScore = (pref, apt) => {
    let score = 0;
    let maxScore = 0;
  
    const addScore = (weight, isMatch) => {
      maxScore += weight;
      if (isMatch) score += weight;
    };
  
    // 1. Price Range
    if (pref.priceRange && apt.price) {
      const [minPrice, maxPrice] = pref.priceRange
        .split('-')
        .map((str) => parseInt(str.trim().replace(/[^\d]/g, '')));
      const isInRange = apt.price >= minPrice && apt.price <= maxPrice;
      addScore(10, isInRange);
    }
  
    // 2. Bedrooms
    addScore(8, pref.bedrooms && apt.bedrooms && apt.bedrooms === pref.bedrooms);
  
    // 3. Neighborhood
    addScore(5, pref.neighborhood && apt.neighborhood && apt.neighborhood === pref.neighborhood);
  
    // 4. Floor (normalized)
    const prefFloor = normalizeFloor(pref.floor);
    const aptFloor = normalizeFloor(apt.floor);
    addScore(3, prefFloor && aptFloor && prefFloor === aptFloor);
  
    // 5. Pets (normalized)
    const prefPets = normalizePets(pref.pets);
    const aptPets = normalizePets(apt.pets);
    addScore(5, prefPets && aptPets && prefPets === aptPets);
  
    // 6. Amenities (partial match)
    if (Array.isArray(pref.amenities) && Array.isArray(apt.amenities)) {
      const shared = apt.amenities.filter((item) => pref.amenities.includes(item)).length;
      const weightPerAmenity = 2;
      maxScore += pref.amenities.length * weightPerAmenity;
      score += shared * weightPerAmenity;
    }
  
    // 7. Style
    addScore(3, pref.style && apt.style && apt.style === pref.style);
  
    // 8. Move-in Date
    if (pref.moveInDate && apt.moveInDate) {
      const prefDate = new Date(pref.moveInDate);
      const aptDate = new Date(apt.moveInDate);
      addScore(3, aptDate <= prefDate);
    }
  
    // 9. Parking
    addScore(2, pref.parking && apt.parking && pref.parking === apt.parking);
  
    // 10. Transport
    addScore(2, pref.transport && apt.transport && pref.transport === apt.transport);
  
    // 11. Sqft
    if (pref.sqft && apt.sqft) {
      const [minSqft, maxSqft] = parseSqftRange(pref.sqft);
      const aptSqft = parseInt(apt.sqft);
      if (!isNaN(aptSqft) && minSqft !== null && maxSqft !== null) {
        addScore(2, aptSqft >= minSqft && aptSqft <= maxSqft);
      } else {
        addScore(2, apt.sqft === pref.sqft);
      }
    }
  
    // 12. Safety
    addScore(2, pref.safety && apt.safety && pref.safety === apt.safety);
  
    // 13. View
    addScore(1, pref.view && apt.view && pref.view === apt.view);
  
    // 14. Lease Capacity
    addScore(2, pref.leaseCapacity && apt.leaseCapacity && pref.leaseCapacity === apt.leaseCapacity);
  
    // 15. Roommates (normalized)
    const prefRoommates = normalizeRoommates(pref.roommates);
    const aptRoommates = normalizeRoommates(apt.roommates);
    addScore(2, prefRoommates && aptRoommates && prefRoommates === aptRoommates);
  
    return Math.round((score / maxScore) * 100);
  };
  
  module.exports = {
    calculateMatchScore,
  };