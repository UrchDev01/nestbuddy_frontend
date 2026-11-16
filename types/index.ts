import { IsWithinIntervalOptions } from "date-fns";
import { MouseEventHandler, ChangeEventHandler } from "react";
export interface UserDataProps {
  email: string;
  password: string;
  user_name?: string;
  is_verified?: boolean;
  user_type?: string;
}

export interface RegisterDataProps {
  email: string;
  password: string;
  first_name: string; // Required field
  last_name: string;  // Required field
  phone?: string;     // Optional field
  user_type?: string; // 'student' or 'professional'
}

export interface UserProfileDataProps {
  id: number;
  slug: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: number;
  is_verified?: boolean;
  user_type?: string;

}

export interface InputProps {
  type: string;
  name: string;
  value: string;
  placeholder: string;
  handleOnchange?: ChangeEventHandler<HTMLInputElement>;
}

export interface customButtonProps {
  title: string;
  containerStyles?: string;
  handleClick?: MouseEventHandler<HTMLButtonElement>;
  btnType?: "button" | "submit";
  textStyles?: string;
  rightIcon?: React.ReactNode;
  isDisabled?: boolean;
  isLoading?: boolean;
  isLoadingText: string;
}

export interface RoommateProps {
  user_id: number;
  slug: string;
  name: string;
  compatibility_score: number; // Percentage
  confidence?: number | null; // Profile-factor coverage, not match probability
  algorithm_version?: string;
  profile_image: string | null;
  gender: string | null;
  preferred_religion: string | null;
  current_city: string | null;
  state_of_origin: string | null;
  preferred_city: string | null;
  accommodation_city: string | null;
  budget: number | null;
  user_type: string;
  bio: string | null;
  hobbies: string[];
  school?: string | null; // For students
  department?: string | null; // For students
  level?: number | string | null; // For students
  profession?: string | null; // For working professionals
  age: number | null;
  seeking: string | null;
  max_roommates: number | null;
  facebook: string | null;
  instagram: string | null;
  twitter: string | null;
  linkedin: string | null;
  is_verified: boolean;
}

export interface homeProfileProps {
  profile_image: string;
  preferred_city: string;
  gender: string;
  age: number;
  id: string;
  slug: string;
  user: UserProfileDataProps,


}



export interface ApiResponse {
  matching_status?: "pending" | "processing" | "completed" | "failed";
  manual_refresh_retry_after?: number;
  data: {
    matches: RoommateProps[];
    pagination: {
      total_matches: number;
      page: number;
      page_size: number;
      total_pages: number;
    };
  };
}

export interface CompatibilityDetails {
  status: string;
  message: string;
  data: {
    overall_score: number | null;
    confidence?: number | null;
    algorithm_version?: string | null;
    location_score: number | null;
    budget_score: number | null;
    lifestyle_score: number | null;
    interest_score: number | null;
    quiz_score: number | null;
    roommate_count_score: number | null;
    common_interests: string[];
    budget_difference: number | null;
    quiz_comparison: {
      summary: {
        similar_answers: number;
        different_answers: number;
        not_answered_by_both: number;
      };
      categories: Array<{
        id: string;
        name: string;
        questions: Array<{
          id: number;
          question: string;
          your_answer: { id: number; text: string | null } | null;
          potential_roommate_answer: { id: number; text: string | null } | null;
          both_answered: boolean;
          comparison: "similar" | "different" | "not_answered";
          similarity: number | null;
        }>;
      }>;
    };
    lifestyle_factors: {
      gender_preference_match: boolean;
      religion_match: boolean;
    };
    user1: {
      id: number;
      slug: string;
      name: string;
      age: number;
      tribe: string | null;
      gender: string;
      profile_image: string;
      religion: string | null;
      city: string | null;
      state: string | null;
      accommodation_city: string | null;
      bio: string;
      user_type: string;
      preferred_city: string | null;
      preferred_tribe: string | null;
      preferred_religion: string | null;
      seeking: string | null;
      preferred_age_range: string | null;
      max_roommates: string;
      profession?: string;
      school?: string;
      department?: string;
      level?: string;

    };
    user2: {
      id: number;
      slug: string;
      name: string;
      age: number;
      tribe: string | null;
      gender: string;
      profile_image: string;
      religion: string | null;
      city: string | null;
      state: string | null;
      bio: string;
      user_type: string;
      preferred_city: string | null;
      accommodation_city: string | null;
      preferred_tribe: string | null;
      preferred_religion: string | null;
      seeking: string | null;
      preferred_age_range: string | null;
      max_roommates: string;
      profession?: string;
      school?: string;
      department?: string;
      level?: string;

    };
    ai_analysis: string | null;
    has_analysis: boolean;
    analysis_generated_at: string | null;
    analysis_status: "not_started" | "pending" | "processing" | "completed" | "failed";
    analysis_error_code: string | null;
    analysis_retryable: boolean;
  };
}

export interface PropertyCardProps {
  id: number;
  slug: string;
  agent_name: string;
  title: string;
  description: string;
  property_type: string;
  listing_type: string;
  property_status: string;
  price: number;
  rental_period: string;
  security_deposit: number;
  available_from: string;
  minimum_rental_period: string;
  accepts_students: boolean;
  accepts_pets: boolean;
  bills_included: boolean;
  size_sqm: number;
  year_built: number;
  num_bedrooms: number;
  num_bathrooms: number;
  num_parking_spaces: number;
  is_furnished: boolean;
  address: string;
  city_name: string;
  state_name: string;
  primary_image: string | null;
  average_rating: number | null;
  review_count: number;
  is_favorited: boolean;
  views_count: number;
  created_at: string;
}

export interface PropertyFilter {
  min_price?: string;
  max_price?: string;
  min_bedrooms?: string;
  max_bedrooms?: string;
  min_bathrooms?: string;
  max_bathrooms?: string;
  property_type?: string;
  listing_type?: string;
  city?: string;
  state?: string;
  amenities?: string;
  accepts_pets?: boolean;
  accepts_students?: boolean;
  is_furnished?: boolean;
  bills_included?: boolean;
  available_from?: string;
  rental_period?: string;
  search?: string;
  property_status?: string;
  ordering?: string;
}

export interface Property {
  id: number;
  slug: string;
  title: string;
  description: string;
  price: number;
  property_type: string;
  listing_type: string;
  property_status: string;
  address: string;
  primary_image: string | null;
  city_name: string;
  state_name: string;
  size_sqm: number;
  city: {
    id: number;
    name: string;
  };
  state: {
    id: number;
    name: string;
  };
  num_bedrooms: number;
  num_bathrooms: number;
  is_furnished: boolean;
  accepts_pets: boolean;
  accepts_students: boolean;
  bills_included: boolean;
  rental_period: string;
  available_from: string;
  amenities: Array<{
    id: number;
    name: string;
  }>;
  images: Array<{
    id: number;
    image_url: string;
  }>;
  owner: {
    id: number;
    name: string;
    profile_image?: string;
  };
  created_at: string;
  views_count: number;
  landmark?: string;
  is_available?: boolean;
  is_favorited?: boolean;
}

export interface PropertyDetailProps {
  id: number;
  slug: string;
  title: string;
  description: string;
  price: number;
  address: string;
  city_name: string;
  state_name: string;
  property_type: string;
  listing_type: string;
  agent: {
    id: number;
    slug: string;
    email: string;
    first_name: string;
    last_name: string;
    phone?: string | null;
    user_type?: string;
    is_verified: boolean;
  };
  num_bedrooms: number;
  num_bathrooms: number;
  size_sqm: number | null;
  is_furnished: boolean;
  accepts_pets: boolean;
  accepts_students: boolean;
  bills_included: boolean;
  rental_period: string | null;
  security_deposit: number | null;
  available_from: string | null;
  property_status: string;
  is_available: boolean;
  primary_image: string | null;
  landmark: string;
  postal_code: string | null;
  year_built: number | null;
  parking_space: boolean;
  views_count: number;
  created_at: string;
  images: Array<{
    id: number;
    image: string;
    is_primary: boolean;
    description: string;
    order: number;
  }>;
  amenities: Array<{
    id: number;
    name: string;
    icon: string | null;
  }>;
  features: Array<{
    id: number;
    name: string;
    value: string;
  }>;
  reviews: Array<{
    id: number;
    user: {
      id: number;
      email: string;
      first_name: string;
      last_name: string;
    };
    user_name: string;
    rating: number;
    title: string | null;
    comment: string;
    is_verified: boolean;
    created_at: string;
  }>;
  questions: Array<{
    id: number;
    user: {
      id: number;
      user_name: string;
      first_name: string;
      last_name: string;
    };
    question: string;
    user_name: string;
    answer: string;
    is_answered: boolean;
    created_at: string;
    answered_at: string | null;
  }>;
  average_rating: number | null;
  review_count: number;
  is_favorited: boolean;
  is_featured: boolean;
  is_verified: boolean;
}
export interface PropertyApiResponse {
  status: string;
  message: string;
  data: {
    results: Property[];
    count: number;
    next: string | null;
    previous: string | null;
  };
}

export interface PropertyViewingProps {
  id: number;
  preferred_date: string;
  preferred_time: string;
  status: string;
  user_name: string;
  notes: string;
  property: number;

}

interface Religion {
  id: number;
  name: string;
}

interface Tribe {
  id: number;
  name: string;
}

interface State {
  id: number;
  name: string;
}

interface City {
  id: number;
  name: string;
}

interface Interest {
  id: number;
  name: string;
}

interface School {
  id: number;
  name: string;
}

interface Department {
  id: number;
  name: string;
}

interface Profession {
  id: number;
  name: string;
}

export interface ProfileProps {
  bio?: string | null;
  profile_image: string;
  is_featured: boolean;
  user: UserProfileDataProps
}

export interface PublicUserProfile {
  id: number;
  slug: string;
  first_name: string;
  last_name: string;
  user_type: string;
  bio: string | null;
  profile_image: string | null;
  demographic: {
    age: number | null;
    gender: string | null;
    tribe: string | null;
    religion: string | null;
    state_of_origin: string | null;
    state_of_residence: string | null;
    city: string | null;
  } | null;
  roommate_preferences: {
    seeking: string | null;
    max_roommates: number | null;
    budget: number | null;
    preferred_gender: string | null;
    preferred_age_min: number | null;
    preferred_age_max: number | null;
    preferred_tribe: string | null;
    preferred_religion: string | null;
    preferred_city: string | null;
    accommodation_city: string | null;
  } | null;
  lifestyle: {
    interests: string[];
  } | null;
  profession: string | null;
  student: {
    school: string | null;
    department: string | null;
    level: string | null;
  } | null;
  verified: boolean;
  social: {
    facebook: string | null;
    instagram: string | null;
    twitter: string | null;
    linkedin: string | null;
  } | null;
  properties: {
    id: number;
    slug: string;
    title: string;
    property_type: string;
    listing_type: string;
    price: string;
    rental_period: string | null;
    city: string | null;
    state: string | null;
    image: string | null;
  }[];
}

export interface DemographicProfileProps {
  gender?: 'Male' | 'Female' | null;
  date_of_birth?: string | null;
  age?: number | null;
  religion_name?: string | null;
  tribe_name?: string | null;
  state_of_origin_name?: string | null;
  state_of_residence_name?: string | null;
  current_city_name?: string | null;
}

export interface RoommatePreferenceProfileProps {
  seeking: 'have_place' | 'need_place' | 'both' | 'none';
  max_roommates: 1 | 2 | 3 | 4;
  budget?: number | null;
  preferred_gender?: 'Male' | 'Female' | 'Both' | null;
  preferred_age_min?: number | null; // Minimum 18
  preferred_age_max?: number | null; // Maximum 120
  preferred_religion?: Religion | number | null; // Can be ID or object
  preferred_tribe?: Tribe | number | null; // Can be ID or object
  preferred_city?: City | number | null; // Can be ID or object
  accommodation_city?: City | number | null;
  accommodation_city_name?: string | null;
  preferred_city_name?: string | null;
  preferred_religion_name?: string | null;
  preferred_tribe_name?: string | null;
}

export interface LifestyleProfileProps {
  hobbies: (Interest | number)[];
  hobbies_detail: (Interest | number)[];
}

export interface VerificationProfileProps {
  verification_document?: string | null; // URL or path
  document_type?: 'national_id' | 'driving_license' | 'passport' | null;
  id_verified: boolean;
  last_seen: string;
}

export interface StudentProfileProps {
  school_name: string | null;
  department_name: string | null;
  level: '100' | '200' | '300' | '400' | '500' | '600' | null;
}

export interface WorkingClassProfileProps {
  profession_name: string | null;
}

export interface SocialProfileProps {
  facebook: string | null; // URL
  twitter: string | null; // URL
  instagram: string | null; // URL
  linkedin: string | null; // URL
  verified_socials_count: number;
}

export interface UserSession {
  id: string;
  device_type: 'desktop' | 'mobile' | 'tablet' | 'unknown';
  device_name?: string;
  browser: string;
  browser_version?: string;
  os: string;
  location: string;
  last_active: string;
  created_at: string;
  is_current: boolean;
  is_active: boolean;
}


export interface FavoritePropertyItem {
  id: number;
  user?: number;
  property: number;
  property_details: Property;
  created_at: string;
}

export interface FavoriteRoommateItem {
  id: number;
  user_id: number;
  slug: string | null;
  name: string;
  profile_image: string | null;
  gender: string | null;
  age: number | null;
  city: string | null;
  state_of_origin?: string | null;
  seeking: string | null;
  budget: number | null;
  bio: string | null;
  profession: string | null;
  user_type: string | null;
  location_details: string[];
  hobbies: string[];
  compatibility_score: number | null;
  confidence: number | null;
  is_verified: boolean;
  is_accessible: boolean;
  status_label: string;
  is_favorited: boolean;
  favorited_at: string;
}

export interface PaginatedFavoritesResponse<T> {
  status: string;
  message?: string;
  data: {
    results: T[];
    count: number;
    total_pages?: number;
    current_page?: number;
    next?: string | number | null;
    previous?: string | number | null;
  };
}
