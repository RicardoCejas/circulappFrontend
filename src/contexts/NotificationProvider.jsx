// frontend/src/contexts/NotificationProvider.jsx
import { useState, useEffect, useCallback, useContext, useRef } from 'react';
import AuthContext from './AuthContext';
import NotificationContext from './NotificationContext';
import notificationService from '../services/notificationService';

export default function NotificationProvider({ children }) {
  const { user } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const unreadCountRef = useRef(unreadCount);

  useEffect(() => {
    unreadCountRef.current = unreadCount;
  }, [unreadCount]);

  // Solicitar permisos de Web Push / Notificaciones de escritorio
  const requestBrowserPermission = useCallback(async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      try {
        await Notification.requestPermission();
      } catch (_ERR) {
        void _ERR;
      }
    }
  }, []);

  const emitBrowserNotification = useCallback((title, body) => {
    if ('Notification' in window && Notification.permission === 'granted' && document.hidden) {
      try {
        new Notification(title, {
          body,
          icon: '/favicon.svg'
        });
      } catch (_ERR) {
        void _ERR;
      }
    }
  }, []);

  // Cargar notificaciones desde el backend
  const fetchNotifications = useCallback(async (silent = false) => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    if (!silent) setLoading(true);
    try {
      const data = await notificationService.getNotifications({ limit: 25 });
      const newItems = data.notifications || [];
      const newUnread = data.unreadCount || 0;

      // Si llegaron nuevas alertas y la app está en segundo plano, disparar aviso
      if (silent && newUnread > unreadCountRef.current && newItems.length > 0) {
        const latest = newItems[0];
        emitBrowserNotification(latest.title, latest.message);
      }

      setNotifications(newItems);
      setUnreadCount(newUnread);
    } catch (_ERR) {
      void _ERR;
    } finally {
      if (!silent) setLoading(false);
    }
  }, [user, emitBrowserNotification]);

  // Polling inteligente cada 30 segundos
  useEffect(() => {
    if (!user) return;

    fetchNotifications();
    requestBrowserPermission();

    const interval = setInterval(() => {
      if (!document.hidden) {
        fetchNotifications(true);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [user, fetchNotifications, requestBrowserPermission]);

  const markAsRead = async (id) => {
    try {
      // Optimistic update
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));

      const res = await notificationService.markAsRead(id);
      if (res && res.unreadCount !== undefined) {
        setUnreadCount(res.unreadCount);
      }
    } catch (_ERR) {
      void _ERR;
      fetchNotifications(true);
    }
  };

  const markAllAsRead = async () => {
    try {
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
      await notificationService.markAllAsRead();
    } catch (_ERR) {
      void _ERR;
      fetchNotifications(true);
    }
  };

  const deleteNotification = async (id) => {
    try {
      const target = notifications.find(n => n._id === id);
      setNotifications(prev => prev.filter(n => n._id !== id));
      if (target && !target.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      await notificationService.deleteNotification(id);
    } catch (_ERR) {
      void _ERR;
      fetchNotifications(true);
    }
  };

  const clearReadNotifications = async () => {
    try {
      setNotifications(prev => prev.filter(n => !n.read));
      await notificationService.clearReadNotifications();
    } catch (_ERR) {
      void _ERR;
      fetchNotifications(true);
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearReadNotifications,
        requestBrowserPermission
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}
