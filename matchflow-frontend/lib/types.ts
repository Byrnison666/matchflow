export interface Photo {
  id: string
  url: string
  isMain: boolean
  isVerified: boolean
}

export interface Profile {
  id: string
  name: string
  age: number
  gender: 'male' | 'female' | 'non_binary' | 'other'
  bio: string
  photos: Photo[]
  interests: string[]
  distanceKm: number
  isVerified: boolean
  isOnline: boolean
  aiIcebreaker?: string
  subscriptionTier: SubscriptionTier
}

export interface PartnerInfo {
  id: string
  name: string
  photo: string
  isOnline: boolean
  lastSeenAt?: string
}

export interface Match {
  id: string
  myPhoto: string
  theirPhoto: string
  theirName: string
  matchedAt: string
  partner: PartnerInfo
  lastMessage?: Pick<Message, 'text' | 'createdAt' | 'messageType'>
  unreadCount: number
}

export type MessageType = 'text' | 'gift' | 'date_invite' | 'system'
export type MessageStatus = 'sending' | 'sent' | 'read'

export interface MessageMetadata {
  giftId?: string
  giftName?: string
  giftEmoji?: string
  venue?: string
  date?: string
  dateTimestamp?: string
}

export interface Message {
  id: string
  matchId: string
  senderId: string
  text?: string
  messageType: MessageType
  metadata?: MessageMetadata
  status: MessageStatus
  createdAt: string
}

export interface Gift {
  id: string
  name: string
  emoji: string
  coinPrice: number
}

export type SubscriptionTier = 'free' | 'plus' | 'gold'

export interface User {
  id: string
  email: string
  name: string
  age: number
  subscriptionTier: SubscriptionTier
  coins: number
  streakDays: number
  isVerified: boolean
  isIncognito: boolean
  isOnboarded: boolean
  photo?: string
}

export enum PaywallReason {
  SWIPE_LIMIT = 'SWIPE_LIMIT',
  WHO_LIKED_ME = 'WHO_LIKED_ME',
  REWIND = 'REWIND',
  INCOGNITO = 'INCOGNITO',
  SUPER_LIKE = 'SUPER_LIKE',
  ICEBREAKER = 'ICEBREAKER',
  PASSPORT = 'PASSPORT',
}

export enum CoinTransactionType {
  PURCHASE = 'PURCHASE',
  SPEND_GIFT = 'SPEND_GIFT',
  SPEND_SUPER_LIKE = 'SPEND_SUPER_LIKE',
  SPEND_BOOST = 'SPEND_BOOST',
  EARN_STREAK = 'EARN_STREAK',
  REFUND = 'REFUND',
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  user: User
}

export interface PaginatedResponse<T> {
  data: T[]
  nextCursor?: string
  hasMore: boolean
}
