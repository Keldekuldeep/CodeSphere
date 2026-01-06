// Donor priority scoring algorithm (frontend mirror of backend logic)

export const calculateDonorScore = (donor, request) => {
  let score = 0;
  
  // City match (highest priority)
  if (donor.city && request.city && donor.city.toLowerCase() === request.city.toLowerCase()) {
    score += 30;
  }
  
  // Blood group compatibility
  if (isBloodGroupCompatible(donor.bloodGroup, request.bloodGroup)) {
    score += 25;
  }
  
  // Donation eligibility (cooldown check)
  if (isDonationEligible(donor.lastDonationDate)) {
    score += 20;
  }
  
  // Donor rating
  if (donor.rating) {
    if (donor.rating >= 4.5) score += 15;
    else if (donor.rating >= 4.0) score += 12;
    else if (donor.rating >= 3.5) score += 8;
    else if (donor.rating >= 3.0) score += 5;
  }
  
  // Donation history
  if (donor.totalDonations) {
    if (donor.totalDonations >= 10) score += 10;
    else if (donor.totalDonations >= 5) score += 7;
    else if (donor.totalDonations >= 1) score += 5;
  }
  
  // Response time (if available)
  if (donor.averageResponseTime) {
    if (donor.averageResponseTime <= 30) score += 8; // 30 minutes
    else if (donor.averageResponseTime <= 60) score += 5; // 1 hour
    else if (donor.averageResponseTime <= 120) score += 3; // 2 hours
  }
  
  // Recent activity
  if (donor.lastActiveDate) {
    const daysSinceActive = calculateDaysSince(donor.lastActiveDate);
    if (daysSinceActive <= 7) score += 5;
    else if (daysSinceActive <= 30) score += 3;
  }
  
  // Distance (if coordinates available)
  if (donor.coordinates && request.coordinates) {
    const distance = calculateDistance(donor.coordinates, request.coordinates);
    if (distance <= 5) score += 8; // Within 5km
    else if (distance <= 10) score += 5; // Within 10km
    else if (distance <= 20) score += 2; // Within 20km
  }
  
  // Urgency bonus
  if (request.urgency === 'IMMEDIATE') {
    // Boost scores for immediate requests
    score = Math.floor(score * 1.2);
  }
  
  return Math.max(0, score); // Ensure non-negative score
};

export const isBloodGroupCompatible = (donorGroup, requestedGroup) => {
  const compatibility = {
    'O-': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'],
    'O+': ['O+', 'A+', 'B+', 'AB+'],
    'A-': ['A-', 'A+', 'AB-', 'AB+'],
    'A+': ['A+', 'AB+'],
    'B-': ['B-', 'B+', 'AB-', 'AB+'],
    'B+': ['B+', 'AB+'],
    'AB-': ['AB-', 'AB+'],
    'AB+': ['AB+']
  };
  
  return compatibility[donorGroup]?.includes(requestedGroup) || false;
};

export const isDonationEligible = (lastDonationDate) => {
  if (!lastDonationDate) return true;
  
  const daysSince = calculateDaysSince(lastDonationDate);
  return daysSince >= 90;
};

export const calculateDaysSince = (date) => {
  const today = new Date();
  const pastDate = new Date(date);
  const diffTime = Math.abs(today - pastDate);
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
};

export const calculateDistance = (coord1, coord2) => {
  // Haversine formula for calculating distance between two coordinates
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(coord2.lat - coord1.lat);
  const dLon = toRadians(coord2.lon - coord1.lon);
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(coord1.lat)) * Math.cos(toRadians(coord2.lat)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in kilometers
};

const toRadians = (degrees) => {
  return degrees * (Math.PI / 180);
};

export const sortDonorsByScore = (donors, request) => {
  return donors
    .map(donor => ({
      ...donor,
      score: calculateDonorScore(donor, request)
    }))
    .sort((a, b) => b.score - a.score);
};

export const getScoreExplanation = (donor, request) => {
  const explanations = [];
  
  if (donor.city && request.city && donor.city.toLowerCase() === request.city.toLowerCase()) {
    explanations.push('Same city (+30)');
  }
  
  if (isBloodGroupCompatible(donor.bloodGroup, request.bloodGroup)) {
    explanations.push('Compatible blood group (+25)');
  }
  
  if (isDonationEligible(donor.lastDonationDate)) {
    explanations.push('Eligible to donate (+20)');
  }
  
  if (donor.rating >= 4.0) {
    explanations.push(`High rating: ${donor.rating} (+${donor.rating >= 4.5 ? 15 : 12})`);
  }
  
  if (donor.totalDonations >= 5) {
    explanations.push(`Experienced donor: ${donor.totalDonations} donations (+${donor.totalDonations >= 10 ? 10 : 7})`);
  }
  
  return explanations;
};

// Priority levels based on score
export const getPriorityLevel = (score) => {
  if (score >= 80) return { level: 'HIGHEST', color: '#dc2626', text: 'Highest Priority' };
  if (score >= 60) return { level: 'HIGH', color: '#f59e0b', text: 'High Priority' };
  if (score >= 40) return { level: 'MEDIUM', color: '#10b981', text: 'Medium Priority' };
  if (score >= 20) return { level: 'LOW', color: '#6b7280', text: 'Low Priority' };
  return { level: 'VERY_LOW', color: '#9ca3af', text: 'Very Low Priority' };
};

// Filter donors based on minimum criteria
export const filterEligibleDonors = (donors, request) => {
  return donors.filter(donor => {
    // Must be compatible blood group
    if (!isBloodGroupCompatible(donor.bloodGroup, request.bloodGroup)) {
      return false;
    }
    
    // Must be eligible to donate (cooldown check)
    if (!isDonationEligible(donor.lastDonationDate)) {
      return false;
    }
    
    // Must not be blocked
    if (donor.isBlocked) {
      return false;
    }
    
    // Must be in same city or nearby (for now, same city only)
    if (donor.city && request.city && 
        donor.city.toLowerCase() !== request.city.toLowerCase()) {
      return false;
    }
    
    return true;
  });
};