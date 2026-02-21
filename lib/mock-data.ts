import type { Thread } from '@/components/thread-card'
import type { Comment } from '@/components/collapsible-comment'

/** Shape used by protocols list (matches apiProtocolToCard output). */
export interface ProtocolCard {
  id: string
  title: string
  content: string
  tags: string[]
  author: string
  rating: number
  createdAt: string
  votesCount: number
  reviewsCount: number
  threadsCount: number
}

const now = new Date()
const fmt = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

export const MOCK_THREADS: Thread[] = [
  {
    id: '1',
    title: 'Getting started with protocol discussions',
    author: 'Alex',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
    category: 'General',
    excerpt: 'How to set up and participate in protocol discussions effectively.',
    votes: 12,
    replies: 5,
    views: 120,
    rating: 4.5,
    timestamp: now.toISOString(),
  },
  {
    id: '2',
    title: 'Best practices for governance proposals',
    author: 'Sam',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sam',
    category: 'Governance',
    excerpt: 'Tips and patterns for writing clear, actionable governance proposals.',
    votes: 28,
    replies: 14,
    views: 340,
    rating: 4.8,
    timestamp: new Date(now.getTime() - 86400000).toISOString(),
  },
  {
    id: '3',
    title: 'Security considerations in protocol upgrades',
    author: 'Jordan',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jordan',
    category: 'Security',
    excerpt: 'What to check before and after protocol upgrades.',
    votes: 45,
    replies: 22,
    views: 512,
    rating: 5,
    timestamp: new Date(now.getTime() - 172800000).toISOString(),
  },
]

/** English protocol placeholders (used when API returns empty or Latin content). */
export const MOCK_PROTOCOLS: ProtocolCard[] = [
  {
    id: '1',
    title: 'Breathwork and anxiety management',
    content: 'Evidence-based breathing techniques for managing anxiety: diaphragmatic breathing, 4-7-8 technique, and box breathing. Includes step-by-step instructions and safety notes.',
    tags: ['health', 'breathing', 'anxiety'],
    author: 'Dr. Sarah Chen',
    rating: 5,
    createdAt: now.toISOString(),
    votesCount: 24,
    reviewsCount: 12,
    threadsCount: 8,
  },
  {
    id: '2',
    title: 'Sleep and meditation protocol',
    content: 'Structured meditation and wind-down practices to support better sleep. Covers evening routine, body scan, and guided sessions with recommended duration and frequency.',
    tags: ['meditation', 'sleep', 'wellness'],
    author: 'Marcus Williams',
    rating: 4.5,
    createdAt: new Date(now.getTime() - 86400000).toISOString(),
    votesCount: 18,
    reviewsCount: 6,
    threadsCount: 5,
  },
  {
    id: '3',
    title: 'Recovery and rest day guidelines',
    content: 'How to plan rest days and light activity for recovery: stretching, walking, hydration, and when to avoid intensity. Suitable for general fitness and post-injury.',
    tags: ['recovery', 'fitness', 'clinical'],
    author: 'Dr. Jane Park',
    rating: 4.8,
    createdAt: new Date(now.getTime() - 172800000).toISOString(),
    votesCount: 31,
    reviewsCount: 9,
    threadsCount: 14,
  },
]

export function getMockProtocol(id: string): ProtocolCard | undefined {
  return MOCK_PROTOCOLS.find((p) => p.id === id)
}

/** English mock reviews for protocol detail when API returns Latin. */
export interface MockReview {
  id: number
  rating: number
  feedback?: string
  created_at: string
}

export const MOCK_REVIEWS: Record<string, MockReview[]> = {
  '1': [
    { id: 1, rating: 5, feedback: 'Clear and practical. The breathing steps are easy to follow.', created_at: fmt(now) },
    { id: 2, rating: 4, feedback: 'Helped with my anxiety. Would suggest adding a short audio guide.', created_at: fmt(new Date(now.getTime() - 86400000)) },
  ],
  '2': [
    { id: 3, rating: 5, feedback: 'Sleep improved within a week. The body scan section is especially useful.', created_at: fmt(now) },
  ],
  '3': [
    { id: 4, rating: 4, feedback: 'Good balance of rest and light activity. Recovery feels faster.', created_at: fmt(now) },
  ],
}

export function getMockReviews(protocolId: string): MockReview[] {
  return MOCK_REVIEWS[protocolId] ?? []
}

export const MOCK_COMMENTS: Record<string, Comment[]> = {
  '1': [
    {
      id: 'c1-1',
      author: 'Sam',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sam',
      content: 'Great overview. I’d add that reading the pinned guidelines first saves a lot of time.',
      timestamp: fmt(now),
      votes: 8,
      replies: [
        {
          id: 'c1-1-1',
          author: 'Alex',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
          content: 'Agreed, we should link those in the welcome message.',
          timestamp: fmt(now),
          votes: 2,
        },
      ],
    },
    {
      id: 'c1-2',
      author: 'Jordan',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jordan',
      content: 'Protocol discussions have been really helpful for aligning on upgrades. Thanks for putting this together.',
      timestamp: fmt(new Date(now.getTime() - 3600000)),
      votes: 5,
    },
  ],
  '2': [
    {
      id: 'c2-1',
      author: 'Alex',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
      content: 'Clear structure and a single decision per proposal tend to get the best outcomes.',
      timestamp: fmt(now),
      votes: 12,
    },
  ],
  '3': [
    {
      id: 'c3-1',
      author: 'Sam',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sam',
      content: 'Security checklist here is solid. We always run a second audit before mainnet.',
      timestamp: fmt(now),
      votes: 6,
      replies: [
        {
          id: 'c3-1-1',
          author: 'Jordan',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jordan',
          content: 'Same. Double audit + staged rollout has prevented issues multiple times.',
          timestamp: fmt(now),
          votes: 3,
        },
      ],
    },
  ],
}

export function getThread(id: string): Thread | undefined {
  return MOCK_THREADS.find((t) => t.id === id)
}

/** Default fake comments when API returns none (for testing DB/connection). */
const DEFAULT_MOCK_COMMENTS: Comment[] = [
  {
    id: 'mock-1',
    author: 'Alex',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
    content: 'Sample comment for testing. Once Laravel comments work, real data will appear here.',
    timestamp: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    votes: 2,
    replies: [
      {
        id: 'mock-1-1',
        author: 'Sam',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sam',
        content: 'Nested reply for testing.',
        timestamp: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        votes: 0,
      },
    ],
  },
]

export function getComments(threadId: string): Comment[] {
  return MOCK_COMMENTS[threadId] ?? DEFAULT_MOCK_COMMENTS
}
