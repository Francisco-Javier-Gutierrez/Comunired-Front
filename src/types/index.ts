// ===========================
// Core Entity Interfaces (Standardized camelCase)
// ===========================

export interface UserSummary {
  email: string;
  username: string;
  profilePicUrl?: string;
  role: 'user' | 'moderator' | 'admin' | 'banned';
  isFollowing?: boolean;
  isBlocked?: boolean;
  isMuted?: boolean;
}

export interface CommentData {
  id: string;
  content: string;
  createdAt: string;
  parentCommentId?: string | null;
  repliesCount?: number;
  canDelete?: boolean;
  canUpdate?: boolean;
  myReaction?: string | null;
  reactions?: Record<string, number>;
  user?: UserSummary;
}

export interface CommentsSummary {
  total: number;
  list: CommentData[];
}

export type PublicationType = 'post' | 'repost' | 'quote' | 'poll' | 'event';

export interface Publication {
  id: string;
  userEmail?: string;
  type?: PublicationType;
  content: string;
  imageUrl?: string | null;
  videoUrl?: string | null;
  lat?: number | null;
  long?: number | null;
  createdAt: string;
  user?: UserSummary;
  comments?: CommentsSummary;
  originalPublicationId?: string | null;
  quoteContent?: string | null;
  pollOptions?: Array<{ id: string; text: string }> | null;
  eventDate?: string | null;
  eventLocation?: string | null;
  pinnedCommentId?: string | null;
  viewsCount?: number;
  likesCount: number;
  sharesCount: number;
  isLiked?: boolean;
  isSaved?: boolean;
  isFollowingAuthor?: boolean;
  isBlockedAuthor?: boolean;
  isMutedAuthor?: boolean;
  myReaction?: string | null;
  reactions?: Record<string, number>;
  canDelete?: boolean;
  canUpdate?: boolean;
}

export interface Notification {
  id: string;
  message: string;
  publicationId: string;
  commentId?: string | null;
  parentCommentId?: string | null;
  urlDestino?: string;
  user?: UserSummary;
  read?: boolean;
  createdAt: string;
}

export type ReportCategory =
  | 'spam'
  | 'harassment'
  | 'hate_speech'
  | 'violence'
  | 'sexual_content'
  | 'scam'
  | 'privacy'
  | 'misinformation'
  | 'illegal_activity'
  | 'other';

export type ReportStatus = 'open' | 'reviewing' | 'resolved' | 'dismissed';
export type ReportModerationAction = 'none' | 'delete_publication' | 'ban_user' | 'delete_user' | 'dismiss';

export interface ReportPayload {
  category: ReportCategory;
  details?: string;
  evidenceUrl?: string;
}

export interface SocialReport {
  id: string;
  reporterEmail: string;
  targetType: 'publication' | 'comment' | 'user';
  targetId: string;
  targetOwnerEmail?: string | null;
  category?: ReportCategory;
  categoryLabel?: string;
  reason: string;
  details?: string;
  evidenceUrl?: string | null;
  targetSnapshot?: {
    authorEmail?: string;
    email?: string;
    username?: string;
    content?: string;
    publicationId?: string;
    imageUrl?: string | null;
    videoUrl?: string | null;
    role?: string;
    isBanned?: boolean;
    createdAt?: string;
  } | null;
  status: ReportStatus;
  reviewedBy?: string;
  reviewedAt?: string;
  moderatorNote?: string | null;
  resolutionAction?: ReportModerationAction;
  resolutionSummary?: string;
  resolutionTargetEmail?: string | null;
  createdAt: string;
}

// ===========================
// API Response Interfaces
// ===========================

export interface ApiResponse<T> {
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  hasMore: boolean;
  nextToken?: string | null;
}

export interface PublicationsListResponse extends PaginatedResponse<Publication> {
  userProfile?: UserSummary;
}

export interface NotificationsResponse {
  notifications: Notification[];
}

export interface CreateCommentResponse {
  id: string;
  comment?: CommentData;
}

// ===========================
// Component Prop Interfaces
// ===========================

export interface PathsState {
  showNavBar: boolean;
  showFooter: boolean;
  showSideNav: boolean;
  showLogoOnly: boolean;
  currentPath: string;
}

export interface PublicationCardProps {
  post: Publication;
  onImageClick: (src: string) => void;
  onClickComent?: () => void;
  isPreview?: boolean;
}

export interface PublicationCommentsProps {
  publication: Publication;
  showInput: boolean;
  setShowInput: (show: boolean) => void;
  onImageClick: (src: string) => void;
  onCommentAdded?: () => void;
  onCommentDeleted?: () => void;
}
