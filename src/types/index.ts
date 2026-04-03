export type UserType = 'customer' | 'provider' | 'admin'
export type ProviderStatus = 'pending' | 'verified' | 'rejected' | 'suspended'
export type RequestStatus = 'open' | 'matched' | 'in_progress' | 'completed' | 'expired' | 'cancelled'
export type UrgencyLevel = 'urgent' | 'soon' | 'flexible'
export type MatchStatus = 'pending' | 'notified' | 'viewed' | 'responded' | 'declined' | 'expired'
export type JobStatus = 'active' | 'completed' | 'disputed' | 'cancelled'
export type MessageType = 'text' | 'offer' | 'system'
export type OfferStatus = 'pending' | 'accepted' | 'declined' | 'expired'
export type ReviewStatus = 'pending' | 'approved' | 'rejected'
export type NotificationType =
  | 'new_lead'
  | 'offer_received'
  | 'offer_accepted'
  | 'offer_declined'
  | 'message_received'
  | 'job_completed'
  | 'review_received'
  | 'verification_approved'
  | 'verification_rejected'
  | 'request_expired'

export interface Profile {
  id: string
  phone: string
  user_type: UserType | null
  full_name: string | null
  preferred_locale: 'fr' | 'ar'
  created_at: string
  updated_at: string
}

export interface CustomerProfile {
  id: string
  profile_id: string
  neighborhood_id: string | null
  created_at: string
}

export interface ProviderProfile {
  id: string
  profile_id: string
  business_name: string | null
  slug: string
  bio_fr: string | null
  bio_ar: string | null
  city_id: string | null
  neighborhood_ids: string[]
  trade_ids: string[]
  years_experience: number | null
  status: ProviderStatus
  identity_doc_url: string | null
  avg_rating: number
  review_count: number
  response_rate: number
  jobs_completed: number
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  slug: string
  name_fr: string
  name_ar: string
  icon: string
  is_active: boolean
}

export interface City {
  id: string
  name_fr: string
  name_ar: string
  slug: string
  is_active: boolean
}

export interface Neighborhood {
  id: string
  city_id: string
  name_fr: string
  name_ar: string
}

export interface ServiceRequest {
  id: string
  customer_id: string
  category_id: string
  city_id: string
  neighborhood_id: string | null
  title: string
  description: string
  budget_text: string | null
  urgency: UrgencyLevel
  status: RequestStatus
  expires_at: string
  created_at: string
  updated_at: string
  category?: Category
  city?: City
  neighborhood?: Neighborhood
}

export interface Match {
  id: string
  request_id: string
  provider_id: string
  score: number
  status: MatchStatus
  notified_at: string | null
  responded_at: string | null
  created_at: string
  provider_profile?: ProviderProfile & { profile: Profile }
}

export interface Conversation {
  id: string
  request_id: string
  customer_id: string
  provider_id: string
  match_id: string
  created_at: string
}

export interface Message {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  message_type: MessageType
  offer_id: string | null
  created_at: string
}

export interface Offer {
  id: string
  conversation_id: string
  provider_id: string
  price_mad: number
  description: string
  estimated_duration: string | null
  status: OfferStatus
  created_at: string
  updated_at: string
}

export interface Job {
  id: string
  request_id: string
  offer_id: string
  customer_id: string
  provider_id: string
  status: JobStatus
  started_at: string | null
  completed_at: string | null
  created_at: string
}

export interface Review {
  id: string
  job_id: string
  reviewer_id: string
  reviewed_id: string
  rating: number
  comment: string | null
  status: ReviewStatus
  created_at: string
}

export interface Notification {
  id: string
  user_id: string
  type: NotificationType
  title_fr: string
  title_ar: string
  body_fr: string
  body_ar: string
  data: Record<string, unknown>
  read_at: string | null
  created_at: string
}
