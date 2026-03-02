import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type AppNotificationType = 'PROXIMITY_PRODUCT' | 'PROXIMITY_REQUEST' | 'MATCH_FOUND' | 'SYSTEM';

export interface AppNotification {
    id: string;
    type: AppNotificationType;
    title: string;
    message: string;
    timestamp: number;
    read: boolean;
    isPopout: boolean; // Indicates if it should currently be displayed as a floating popout
    data?: any;
}

interface NotificationState {
    notifications: AppNotification[];
    addNotification: (notif: Omit<AppNotification, 'id' | 'timestamp' | 'read' | 'isPopout'> & { isPopout?: boolean }) => void;
    markAsRead: (id: string) => void;
    markAllAsRead: () => void;
    dismissPopout: (id: string) => void;
    clearAll: () => void;
}

export const useNotificationStore = create<NotificationState>()(
    persist(
        (set) => ({
            notifications: [],
            addNotification: (notif) => set((state) => {
                const newNotif: AppNotification = {
                    ...notif,
                    id: Math.random().toString(36).substring(2, 9),
                    timestamp: Date.now(),
                    read: false,
                    isPopout: notif.isPopout ?? true // Default to popping out
                };

                // Prevent duplicate proximity alerts within the same minute
                if (notif.type.startsWith('PROXIMITY')) {
                    const isDuplicate = state.notifications.some(n =>
                        n.title === notif.title &&
                        n.message === notif.message &&
                        Date.now() - n.timestamp < 60000
                    );
                    if (isDuplicate) return state;
                }

                return {
                    // Keep the absolute latest 100 max
                    notifications: [newNotif, ...state.notifications].slice(0, 100)
                };
            }),
            markAsRead: (id) => set((state) => ({
                notifications: state.notifications.map(n =>
                    n.id === id ? { ...n, read: true } : n
                )
            })),
            markAllAsRead: () => set((state) => ({
                notifications: state.notifications.map(n => ({ ...n, read: true }))
            })),
            dismissPopout: (id) => set((state) => ({
                notifications: state.notifications.map(n =>
                    n.id === id ? { ...n, isPopout: false } : n
                )
            })),
            clearAll: () => set({ notifications: [] }),
        }),
        {
            name: 'social-commerce-notifications',
        }
    )
);
