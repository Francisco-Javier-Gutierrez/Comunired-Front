import { useEffect } from 'react';
import axios from 'axios';
import { apiRoutes, getToken, isUserAuthenticated } from '../../utils/GlobalVariables';
import { useNotificationStore } from '../../utils/NotificationStore';

export function useNotificationPolling() {
    const setHasUnreadNotifications = useNotificationStore((state) => state.setHasUnreadNotifications);

    useEffect(() => {
        let intervalId: NodeJS.Timeout;

        const checkNotifications = async () => {
            try {
                const isAuthenticated = await isUserAuthenticated();
                if (!isAuthenticated) return;

                const token = await getToken();
                if (!token) return;

                const res = await axios.get(apiRoutes.messages_account_url, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                const notifications = res.data.notifications || [];
                if (notifications.length > 0) {
                    setHasUnreadNotifications(true);
                } else {
                    setHasUnreadNotifications(false);
                }
            } catch {
            }
        };

        checkNotifications();

        intervalId = setInterval(checkNotifications, 30000);

        return () => {
            if (intervalId) clearInterval(intervalId);
        };
    }, [setHasUnreadNotifications]);

    return null;
}
