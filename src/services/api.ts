import axios from 'axios';
import { apiRoutes, getToken, isUserAuthenticated } from '../utils/GlobalVariables';
import type {
    Publication,
    PublicationsListResponse,
    NotificationsResponse,
    CreateCommentResponse,
    UserSummary,
    CommentData,
    PaginatedResponse,
    ReportPayload,
    ReportModerationAction,
    ReportStatus,
    SocialReport,
} from '../types';
import type { AxiosError } from 'axios';

type ApiErrorBody = {
    message?: string;
    error?: string;
};

export class ApiError extends Error {
    status?: number;
    data?: unknown;

    constructor(message: string, status?: number, data?: unknown) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.data = data;
    }
}

const getApiErrorMessage = (data: unknown, fallback: string) => {
    if (typeof data === 'string' && data.trim()) return data;
    if (data && typeof data === 'object') {
        const body = data as ApiErrorBody;
        return body.message || body.error || fallback;
    }
    return fallback;
};

const apiClient = axios.create({
    timeout: 15000,
});

apiClient.interceptors.request.use(async (config) => {
    const token = await getToken().catch(() => null);
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => Promise.reject(error));

apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        const axiosError = error as AxiosError;
        const status = axiosError.response?.status;
        const message = getApiErrorMessage(axiosError.response?.data, axiosError.message || 'Error desconocido');
        const errorMessage = status ? `${status}: ${message}` : message;
        console.error('[API Error]:', errorMessage);
        return Promise.reject(new ApiError(errorMessage, status, axiosError.response?.data));
    }
);

const mapUser = (raw: any): UserSummary => ({
    email: raw.email || raw.Correo_electronico || raw.correo || '',
    username: raw.username || raw.name || raw.displayName || raw.nombre_usuario || raw.Nombre_usuario || 'Usuario',
    profilePicUrl: raw.profilePicture || raw.profilePicUrl || raw.Url_foto_perfil || raw.url_foto_perfil || raw.foto_perfil || null,
    role: raw.role || 'user',
    isFollowing: raw.isFollowing,
    isBlocked: raw.isBlocked,
    isMuted: raw.isMuted,
});

const mapComment = (raw: any): CommentData => ({
    id: raw.id || raw.id_comentario || '',
    content: raw.content || raw.contenido || '',
    createdAt: raw.createdAt || raw.fecha_comentario || '',
    parentCommentId: raw.parentCommentId ?? raw.parent_comment_id ?? raw.id_comentario_padre ?? null,
    repliesCount: raw.repliesCount ?? raw.replies_count ?? 0,
    canDelete: raw.canDelete ?? raw.Can_delete ?? false,
    canUpdate: raw.canUpdate ?? raw.Can_update ?? false,
    myReaction: raw.myReaction ?? null,
    reactions: raw.reactions || {},
    user: raw.user ? mapUser(raw.user) : (raw.Usuario ? mapUser(raw.Usuario) : undefined),
});

const fallbackUser = (email?: string | null): UserSummary | undefined => {
    if (!email) return undefined;
    return {
        email,
        username: 'Usuario',
        profilePicUrl: undefined,
        role: 'user',
    };
};

const parseOptionalCoordinate = (value: unknown): number | null => {
    if (value === undefined || value === null || value === '') return null;

    const coordinate = Number(value);
    return Number.isFinite(coordinate) ? coordinate : null;
};

const mapPublication = (raw: any): Publication => ({
    id: raw.id || raw.Id_publicacion || '',
    userEmail: raw.userEmail || raw.email || raw.Correo_electronico || undefined,
    type: raw.type || 'post',
    content: raw.content || raw.Contenido || '',
    imageUrl: raw.imageUrl || raw.Url_imagen || null,
    videoUrl: raw.videoUrl || raw.Url_video || null,
    lat: parseOptionalCoordinate(raw.lat ?? raw.Lat),
    long: parseOptionalCoordinate(raw.long ?? raw.Long),
    createdAt: raw.createdAt || raw.Fecha_publicacion || '',
    user: raw.user ? mapUser(raw.user) : (raw.Usuario ? mapUser(raw.Usuario) : fallbackUser(raw.userEmail || raw.email || raw.Correo_electronico)),
    originalPublicationId: raw.originalPublicationId || null,
    quoteContent: raw.quoteContent || null,
    pollOptions: raw.pollOptions || null,
    eventDate: raw.eventDate || null,
    eventLocation: raw.eventLocation || null,
    pinnedCommentId: raw.pinnedCommentId || null,
    viewsCount: raw.viewsCount || 0,
    likesCount: raw.likesCount || raw.likes?.total || 0,
    sharesCount: raw.sharesCount || raw.compartidos?.total || 0,
    isLiked: raw.isLiked ?? raw.is_Liked ?? raw.Is_Liked ?? raw.is_liked ?? false,
    isSaved: raw.isSaved ?? false,
    isFollowingAuthor: raw.isFollowingAuthor ?? false,
    isBlockedAuthor: raw.isBlockedAuthor ?? false,
    isMutedAuthor: raw.isMutedAuthor ?? false,
    myReaction: raw.myReaction ?? null,
    reactions: raw.reactions || {},
    canDelete: raw.canDelete ?? raw.Can_delete ?? false,
    canUpdate: raw.canUpdate ?? raw.Can_update ?? false,
    comments: {
        total: raw.commentsCount || raw.comentarios?.total || 0,
        list: (raw.comments?.list || raw.comentarios?.lista || []).map(mapComment),
    },
});

export const api = {
    publications: {
        list: async (limit: number = 10, nextToken?: string | null): Promise<PublicationsListResponse> => {
            const isAuth = await isUserAuthenticated();
            const url = isAuth ? apiRoutes.list_publications_user_auth_url : apiRoutes.list_publications_url;
            const res = await apiClient.get(url, { params: { limit, nextToken } });
            const rawItems = res.data.items || res.data.publicaciones || [];
            const newNextToken = res.data.nextToken || null;
            return { items: rawItems.map(mapPublication), hasMore: !!newNextToken, nextToken: newNextToken };
        },
        create: (payload: Partial<Publication>) =>
            apiClient.post(apiRoutes.create_publication_url, {
                type: payload.type,
                content: payload.content,
                imageUrl: payload.imageUrl,
                videoUrl: payload.videoUrl,
                lat: payload.lat,
                long: payload.long,
                originalPublicationId: payload.originalPublicationId,
                quoteContent: payload.quoteContent,
                pollOptions: payload.pollOptions,
                eventDate: payload.eventDate,
                eventLocation: payload.eventLocation,
            }),
        delete: (id: string) => apiClient.post(apiRoutes.delete_publication_url, { id }),
        edit: async (id: string, payload: Partial<Publication>): Promise<Publication> => {
            const res = await apiClient.post(apiRoutes.edit_publication_url, {
                id,
                content: payload.content,
                imageUrl: payload.imageUrl,
                videoUrl: payload.videoUrl,
                lat: payload.lat,
                long: payload.long,
            });

            return mapPublication(res.data.publication ?? res.data);
        },
        get: async (id: string): Promise<Publication> => {
            const isAuth = await isUserAuthenticated();
            const url = isAuth ? apiRoutes.list_publication_user_auth_url : apiRoutes.list_publication_url;
            const res = await apiClient.get(url, { params: { id } });
            return mapPublication(res.data);
        },
        listByUser: async (email: string, limit: number = 10, nextToken?: string | null): Promise<PublicationsListResponse> => {
            const isAuth = await isUserAuthenticated();
            const url = isAuth ? apiRoutes.list_user_publications_user_auth_url : apiRoutes.list_user_publications_url;
            const res = await apiClient.post(url, { email }, { params: { limit, nextToken } });
            const rawItems = res.data.items || res.data.publicaciones || [];
            const newNextToken = res.data.nextToken || null;
            const userProfile = res.data.user || res.data.usuario;
            return {
                items: rawItems.map(mapPublication),
                hasMore: !!newNextToken,
                nextToken: newNextToken,
                userProfile: userProfile ? mapUser(userProfile) : undefined,
            };
        },
    },

    comments: {
        list: async (publicationId: string, limit: number = 20, nextToken?: string | null): Promise<PaginatedResponse<CommentData>> => {
            const res = await apiClient.get(apiRoutes.list_comments_url, { params: { publicationId, limit, nextToken } });
            const rawItems = res.data.items || [];
            const newNextToken = res.data.nextToken || null;
            return { items: rawItems.map(mapComment), hasMore: !!newNextToken, nextToken: newNextToken };
        },
        create: async (publicationId: string, content: string, parentCommentId?: string | null): Promise<CreateCommentResponse> => {
            const res = await apiClient.post(apiRoutes.comment_publication_url, { publicationId, content, parentCommentId: parentCommentId || undefined });
            const rawComment = res.data.comment;
            return { id: res.data.id || rawComment?.id, comment: rawComment ? mapComment(rawComment) : undefined };
        },
        delete: (id: string) => apiClient.post(apiRoutes.delete_comment_url, { id }),
        edit: (id: string, content: string) => apiClient.post(apiRoutes.edit_comment_url, { id, content }),
        pin: (publicationId: string, commentId: string | null) => apiClient.post(apiRoutes.pin_comment_url, { publicationId, commentId }),
    },

    social: {
        like: (id: string) => apiClient.post(apiRoutes.like_publications_url, { targetId: id }),
        unlike: (id: string) => apiClient.post(apiRoutes.unlike_publications_url, { targetId: id }),
        share: (id: string) => apiClient.post(apiRoutes.share_publication_url, { targetId: id }),
        follow: (email: string) => apiClient.post(apiRoutes.follow_create_url, { email }),
        unfollow: (email: string) => apiClient.post(apiRoutes.follow_delete_url, { email }),
        listFollowers: (email: string, limit: number = 20, nextToken?: string | null) => apiClient.get(apiRoutes.followers_list_url, { params: { email, limit, nextToken } }),
        listFollowing: (email: string, limit: number = 20, nextToken?: string | null) => apiClient.get(apiRoutes.following_list_url, { params: { email, limit, nextToken } }),
        block: (email: string) => apiClient.post(apiRoutes.block_create_url, { email }),
        unblock: (email: string) => apiClient.post(apiRoutes.block_delete_url, { email }),
        mute: (email: string) => apiClient.post(apiRoutes.mute_create_url, { email }),
        unmute: (email: string) => apiClient.post(apiRoutes.mute_delete_url, { email }),
        save: (publicationId: string) => apiClient.post(apiRoutes.save_create_url, { publicationId }),
        unsave: (publicationId: string) => apiClient.post(apiRoutes.save_delete_url, { publicationId }),
        listSaved: (limit: number = 20, nextToken?: string | null) => apiClient.get(apiRoutes.save_list_url, { params: { limit, nextToken } }),
        setReaction: (targetType: 'publication' | 'comment', targetId: string, reactionType: string = 'like') => apiClient.post(apiRoutes.reaction_set_url, { targetType, targetId, reactionType }),
        deleteReaction: (targetType: 'publication' | 'comment', targetId: string) => apiClient.post(apiRoutes.reaction_delete_url, { targetType, targetId }),
        report: (targetType: 'publication' | 'comment' | 'user', targetId: string, payload: ReportPayload | string) => apiClient.post(apiRoutes.report_create_url, typeof payload === 'string' ? { targetType, targetId, reason: payload } : { targetType, targetId, ...payload }),
        registerView: (targetType: 'publication' | 'comment', targetId: string, viewerKey?: string) => apiClient.post(apiRoutes.view_register_url, { targetType, targetId, viewerKey }),
        votePoll: (pollId: string, optionId: string) => apiClient.post(apiRoutes.poll_vote_url, { pollId, optionId }),
        rsvpEvent: (eventId: string, status: 'going' | 'interested' | 'not_going') => apiClient.post(apiRoutes.event_rsvp_url, { eventId, status }),
    },

    notifications: {
        list: async (limit: number = 20, nextToken?: string | null): Promise<NotificationsResponse & { hasMore: boolean, nextToken: string | null }> => {
            const res = await apiClient.get(apiRoutes.messages_account_url, { params: { limit, nextToken } });
            const raw = res.data.notifications || [];
            const newNextToken = res.data.nextToken || null;
            return {
                notifications: raw.map((n: any) => ({
                    id: n.id || n.id_notificacion || '',
                    message: n.message || n.mensaje || '',
                    publicationId: n.publicationId || n.id_publicacion || '',
                    commentId: n.commentId ?? n.id_comentario ?? null,
                    parentCommentId: n.parentCommentId ?? n.parent_comment_id ?? n.id_comentario_padre ?? null,
                    urlDestino: n.urlDestino || n.url_destino,
                    user: n.user ? mapUser(n.user) : (n.usuario ? mapUser(n.usuario) : undefined),
                    read: n.isRead ?? n.read,
                    createdAt: n.createdAt || n.fecha_creacion || new Date().toISOString(),
                })),
                hasMore: !!newNextToken,
                nextToken: newNextToken,
            };
        },
        read: (id: string) => apiClient.post(apiRoutes.read_notification_url, { id }),
        deleteAll: () => apiClient.post(apiRoutes.delete_all_notifications_url, {}),
    },

    users: {
        update: (payload: { username?: string; profilePicUrl?: string; bio?: string; location?: string }) =>
            apiClient.post(apiRoutes.update_user_url, {
                username: payload.username,
                profilePicture: payload.profilePicUrl,
                bio: payload.bio,
                location: payload.location,
            }),
        delete: () => apiClient.post(apiRoutes.delete_account_url, {}),
        updateFcmToken: (fcmToken: string) => apiClient.post(apiRoutes.update_fcm_token_url, { fcmToken }),
    },

    media: {
        getPresignedUrl: async (fileName: string, fileType: string, type: 'publications' | 'profile'): Promise<{ uploadUrl: string; fileUrl: string }> => {
            const res = await apiClient.post(apiRoutes.push_resouce_url, { fileName, fileType, type });
            return res.data;
        },
    },

    search: {
        list: async (query: string, limit: number = 20, nextToken?: string | null): Promise<PaginatedResponse<Publication>> => {
            const isAuth = await isUserAuthenticated();
            const url = isAuth ? apiRoutes.search_resources_user_auth_url : apiRoutes.search_resources_url;
            const res = await apiClient.get(url, { params: { q: query, limit, nextToken } });
            const raw = res.data.items || res.data.publicaciones || [];
            const newNextToken = res.data.nextToken || null;
            return { items: raw.map(mapPublication), hasMore: !!newNextToken, nextToken: newNextToken };
        },
    },

    admin: {
        makeModerator: (email: string) => apiClient.post(apiRoutes.make_moderator_url, { email }),
        removeModerator: (email: string) => apiClient.post(apiRoutes.remove_moderator_url, { email }),
        banUser: (email: string) => apiClient.post(apiRoutes.ban_user_url, { email }),
        unbanUser: (email: string) => apiClient.post(apiRoutes.unban_user_url, { email }),
        listReports: async (status: ReportStatus = 'open', limit: number = 20, nextToken?: string | null): Promise<PaginatedResponse<SocialReport>> => {
            const res = await apiClient.get(apiRoutes.reports_list_url, { params: { status, limit, nextToken } });
            return { items: res.data.items || [], hasMore: !!res.data.nextToken, nextToken: res.data.nextToken || null };
        },
        updateReport: (payload: { id: string; status?: ReportStatus; action?: ReportModerationAction; moderatorNote?: string }) => apiClient.post(apiRoutes.report_update_url, payload),
        updateUser: (email: string, payload: { username?: string; profilePicUrl?: string }) =>
            apiClient.post(apiRoutes.admin_update_user_url, {
                email,
                username: payload.username,
                profilePicture: payload.profilePicUrl,
            }),
    }
};

export const listPublications = api.publications.list;
export const createPublication = api.publications.create;
export const deletePublication = api.publications.delete;
export const editPublication = api.publications.edit;
export const createComment = api.comments.create;
export const deleteComment = api.comments.delete;
export const likePublication = api.social.like;
export const unlikePublication = api.social.unlike;
export const sharePublication = api.social.share;
export const listNotifications = api.notifications.list;
