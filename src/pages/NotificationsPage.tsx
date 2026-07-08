import React from 'react';
import { useApp } from '../context/AppContext';
import NotificationCard from '../components/NotificationCard';
import { Bell, Check, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const NotificationsPage: React.FC = () => {
  const { currentUser, notifications, markNotificationAsRead, markAllNotificationsAsRead, deleteNotification } = useApp();

  if (!currentUser) return null;

  // Filter user specific alerts
  const myNotifs = notifications.filter(n => n.userId === currentUser.id);
  const unreadCount = myNotifs.filter(n => !n.read).length;

  return (
    <div className="space-y-6 text-left max-w-3xl">
      
      {/* Title Header with multi-actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <Bell className="h-6 w-6 text-blue-600" />
            Notifications
          </h2>
          <p className="text-xs text-slate-400">View slot reservation alerts, status checkups, and system briefings.</p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={() => markAllNotificationsAsRead(currentUser.id)}
            className="px-4 py-2 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition-all flex items-center gap-1 cursor-pointer focus:outline-none"
          >
            <Check className="h-3.5 w-3.5" />
            Mark all as read
          </button>
        )}
      </div>

      {/* Notifications list */}
      {myNotifs.length > 0 ? (
        <div className="space-y-3">
          <AnimatePresence initial={false}>
            {myNotifs.map((notif) => (
              <NotificationCard
                key={notif.id}
                notification={notif}
                onRead={markNotificationAsRead}
                onDelete={deleteNotification}
              />
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="bg-white p-16 rounded-2xl border border-slate-100 text-center space-y-3 shadow-sm max-w-md mx-auto">
          <span className="text-3xl block">🔔</span>
          <h4 className="font-bold text-slate-700 text-base">Your inbox is clear</h4>
          <p className="text-xs text-slate-400">We will notify you here when your appointment status changes or when admins publish notices.</p>
        </div>
      )}

    </div>
  );
};

export default NotificationsPage;
