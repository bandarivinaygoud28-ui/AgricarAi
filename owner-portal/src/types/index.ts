export type Role = 'resource_owner' | 'farmer';

export interface OwnerProfile {
  id: number;
  name: string;
  phone: string;
  email?: string;
  role: Role;
  village: string;
  mandal: string;
  district: string;
  state: string;
  location?: string;
  latitude: number;
  longitude: number;
  profile_image?: string;
}

export type ResourceCategory =
  | 'Tractor'
  | 'JCB / Earthmover'
  | 'Harvester'
  | 'Agricultural Drone'
  | 'Sprayer'
  | 'Seed Sowing Machine'
  | 'Water Pump'
  | 'Farm Transport'
  | 'Other Farm Machinery';

export interface ResourceItem {
  id: number;
  owner_id?: number;
  title: string;
  name?: string;
  resource_type: string;
  category?: string;
  vehicle_number?: string;
  model?: string;
  year?: string;
  provider_name?: string;
  contact_phone?: string;
  location: string;
  village?: string;
  mandal?: string;
  district?: string;
  state?: string;
  latitude: number;
  longitude: number;
  price?: number;
  price_unit?: 'hour' | 'day' | 'acre' | 'trip' | string;
  price_per_hour?: number;
  price_per_day?: number;
  price_per_acre?: number;
  price_per_trip?: number;
  availability: 'Available' | 'Unavailable' | 'Busy' | 'Booked' | string;
  rating: number;
  total_ratings?: number;
  description?: string;
  image_url?: string;
  image?: string;
  specs?: string;
  terms?: string;
  is_demo?: boolean;
}

export type BookingStatus =
  | 'Pending'
  | 'Confirmed'
  | 'Completed'
  | 'Cancelled'
  | 'Rejected';

export interface BookingRequestItem {
  id: number;
  booking_id: string;
  resource_id: number;
  resource_title: string;
  resource_name?: string;
  resource_type: string;
  vehicle_number?: string;
  image?: string;
  farmer_id?: number;
  farmer_name: string;
  farmer_phone: string;
  booking_date: string;
  booking_time: string;
  start_time?: string;
  end_time?: string;
  duration?: string;
  farm_location: string;
  location?: string;
  village?: string;
  mandal?: string;
  district?: string;
  farm_latitude?: number;
  farm_longitude?: number;
  total_amount: number;
  amount?: number;
  platform_fee: number;
  owner_earnings: number;
  status: BookingStatus;
  notes?: string;
  google_maps_route_url?: string;
  created_at?: string;
  completed_at?: string | null;
}

export interface OwnerDashboardStats {
  total_resources: number;
  available_resources: number;
  pending_bookings: number;
  pending_requests?: number;
  confirmed_bookings: number;
  completed_jobs: number;
  today_earnings: number;
  week_earnings: number;
  month_earnings: number;
  total_earnings: number;
  platform_commission_rate?: string;
  total_platform_fee?: number;
}

export interface EarningsTransaction {
  id: number;
  booking_id: string;
  resource_title: string;
  farmer_name: string;
  date: string;
  gross_amount: number;
  platform_fee: number;
  net_earnings: number;
  status: string;
  payout_status?: string;
}

export interface EarningsBreakdown {
  today_earnings: number;
  week_earnings: number;
  month_earnings: number;
  total_earnings: number;
  platform_commission_percentage?: number;
  platform_commission_rate?: string;
  total_platform_fee?: number;
  transactions?: EarningsTransaction[];
}

export interface ReviewItem {
  id: number;
  booking_id?: string;
  farmer_name: string;
  rating: number;
  review?: string;
  date: string;
}

export interface StarBreakdown {
  '5_star': number;
  '4_star': number;
  '3_star': number;
  '2_star': number;
  '1_star': number;
}

export interface OwnerRatingsSummary {
  overall_rating: number;
  total_reviews: number;
  star_breakdown: StarBreakdown;
  reviews: ReviewItem[];
}
