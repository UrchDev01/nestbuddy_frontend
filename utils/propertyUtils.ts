// Property status badges with colors
export const getStatusBadgeColor = (status: string): string => {
  switch (status.toUpperCase()) {
    case 'AVAILABLE':
      return 'bg-green-100 text-green-800';
    case 'PENDING':
      return 'bg-yellow-100 text-yellow-800';
    case 'RENTED':
      return 'bg-blue-100 text-blue-800';
    case 'SOLD':
      return 'bg-purple-100 text-purple-800';
    case 'MAINTENANCE':
      return 'bg-orange-100 text-orange-800';
    case 'UNAVAILABLE':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};



// Format price with currency
export const formatPrice = (price: number, period: string): string => {
  return `₦${price.toLocaleString()}/${period}`;
};



// Calculate time ago from date string
export const timeAgo = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  let interval = Math.floor(seconds / 31536000);
  if (interval >= 1) {
    return interval === 1 ? '1 year ago' : `${interval} years ago`;
  }
  
  interval = Math.floor(seconds / 2592000);
  if (interval >= 1) {
    return interval === 1 ? '1 month ago' : `${interval} months ago`;
  }
  
  interval = Math.floor(seconds / 86400);
  if (interval >= 1) {
    return interval === 1 ? '1 day ago' : `${interval} days ago`;
  }
  
  interval = Math.floor(seconds / 3600);
  if (interval >= 1) {
    return interval === 1 ? '1 hour ago' : `${interval} hours ago`;
  }
  
  interval = Math.floor(seconds / 60);
  if (interval >= 1) {
    return interval === 1 ? '1 minute ago' : `${interval} minutes ago`;
  }
  
  return seconds < 10 ? 'just now' : `${Math.floor(seconds)} seconds ago`;
};

// Get average rating from reviews
export const calculateAverageRating = (reviews: any[]): number => {
  if (!reviews || reviews.length === 0) return 0;
  
  const sum = reviews.reduce((total, review) => total + review.rating, 0);
  return parseFloat((sum / reviews.length).toFixed(1));
};

// Filter properties by various criteria
export const filterProperties = (properties: any[], filters: any): any[] => {
  return properties.filter(property => {
    // Price range
    if (filters.minPrice && property.price < filters.minPrice) return false;
    if (filters.maxPrice && property.price > filters.maxPrice) return false;
    
    // Bedrooms
    if (filters.minBedrooms && property.num_bedrooms < filters.minBedrooms) return false;
    if (filters.maxBedrooms && property.num_bedrooms > filters.maxBedrooms) return false;
    
    // Bathrooms
    if (filters.minBathrooms && property.num_bathrooms < filters.minBathrooms) return false;
    if (filters.maxBathrooms && property.num_bathrooms > filters.maxBathrooms) return false;
    
    // Property type
    if (filters.propertyType && property.property_type !== filters.propertyType) return false;
    
    // Features
    if (filters.furnished && !property.is_furnished) return false;
    if (filters.petsAllowed && !property.accepts_pets) return false;
    if (filters.studentsAccepted && !property.accepts_students) return false;
    if (filters.billsIncluded && !property.bills_included) return false;
    
    // Location
    if (filters.city && property.city.name.toLowerCase() !== filters.city.toLowerCase()) return false;
    if (filters.state && property.state.name.toLowerCase() !== filters.state.toLowerCase()) return false;
    
    return true;
  });
}; 