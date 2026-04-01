export type DomainCategory =
  | 'plants'
  | 'algae'
  | 'fungi'
  | 'microbes'
  | 'animals'
  | 'earth';

export type ListingCategory =
  | 'coworking'
  | 'art-gallery'
  | 'music-venue'
  | 'conference'
  | 'workshop'
  | 'specialty-coffee'
  | 'spirituality-retreat'
  | 'yoga-centre'
  | 'restaurant'
  | 'shop'
  | 'other';

export type ReviewSource = 'user' | 'moderator' | 'imported';

export interface Place {
  id: string;
  slug: string;
  name: string;
  summary: string;
  address: string;
  neighborhood: string;
  city: string;
  categories: ListingCategory[];
  primaryDomain: DomainCategory;
  secondaryDomains?: DomainCategory[];
  tags?: string[];
  website?: string;
  imageUrl?: string;
  isClaimed?: boolean;
}

export interface CityEvent {
  id: string;
  slug: string;
  title: string;
  summary: string;
  startsAt: string;
  endsAt?: string;
  placeId: string;
  placeName?: string;
  primaryDomain: DomainCategory;
  secondaryDomains?: DomainCategory[];
  tags?: string[];
  imageUrl?: string;
}

export interface Creator {
  id: string;
  slug: string;
  displayName: string;
  bio: string;
  city: string;
  primaryDomain: DomainCategory;
  secondaryDomains?: DomainCategory[];
  productCollectionHandle?: string;
  websiteUrl?: string;
  imageUrl?: string;
}

export interface Review {
  id: string;
  placeId: string;
  authorName: string;
  rating: 1 | 2 | 3 | 4 | 5;
  body: string;
  createdAt: string;
  source: ReviewSource;
}

export type ArtifactActionType =
  | 'listing_view'
  | 'event_view'
  | 'creator_view'
  | 'review_create'
  | 'store_click'
  | 'purchase';

export interface ArtifactActivity {
  actionType: ArtifactActionType;
  targetId: string;
  domain: DomainCategory;
  timestamp: number;
}
