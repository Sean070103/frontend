/**
 * Persist user vote (up/down) in localStorage so the correct button stays highlighted after refresh.
 * Key by thread or comment id. API can override later if it returns user_vote.
 */

const PREFIX_THREAD = 'vote:thread:'
const PREFIX_COMMENT = 'vote:comment:'

export type StoredVote = 'up' | 'down'

function getKey(prefix: string, id: string): string {
  return `${prefix}${id}`
}

export const voteStorage = {
  getThreadVote(threadId: string): StoredVote | null {
    if (typeof window === 'undefined') return null
    try {
      const v = localStorage.getItem(getKey(PREFIX_THREAD, threadId))
      return v === 'up' || v === 'down' ? v : null
    } catch {
      return null
    }
  },
  setThreadVote(threadId: string, direction: StoredVote): void {
    try {
      localStorage.setItem(getKey(PREFIX_THREAD, threadId), direction)
    } catch {
      // ignore
    }
  },
  getCommentVote(commentId: string): StoredVote | null {
    if (typeof window === 'undefined') return null
    try {
      const v = localStorage.getItem(getKey(PREFIX_COMMENT, commentId))
      return v === 'up' || v === 'down' ? v : null
    } catch {
      return null
    }
  },
  setCommentVote(commentId: string, direction: StoredVote): void {
    try {
      localStorage.setItem(getKey(PREFIX_COMMENT, commentId), direction)
    } catch {
      // ignore
    }
  },
}
