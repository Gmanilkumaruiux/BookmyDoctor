import React from 'react';
import { Notification } from '../types';
import { Bell, Check, Trash2, ShieldAlert, CheckCircle, Info } from 'lucide-react';
import { motion } from 'motion/react';

interface NotificationCardProps {
  notification: Notification;
  onRead: (id: string) => void;
  onDelete: (id: string) => void;
}

const NotificationCard: React.FC<NotificationCardProps> = ({ 
  notification, 
  onRead, 
  onDelete 
}) => {
  const typeConfig = {
    info: {
      bg: 'bg-blue-50/50 border-blue-100',
      text: 'text-blue-600',
      icon: Info
    },
    success: {
      bg: 'bg-emerald-50/50 border-emerald-100',
      text: 'text-emerald-600',
      icon: CheckCircle
    },
    alert: {
      bg: 'bg-rose-50/50 border-rose-100',
      text: 'text-rose-600',
      icon: ShieldAlert
    }
  };

  const currentType = typeConfig[notification.type] || typeConfig.info;
  const Icon = currentType.icon;

  const formattedTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString(undefined, { 
        month: 'short', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch {
      return '';
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 10 }}
      className={`p-4 rounded-xl border ${currentType.bg} flex items-start gap-3 justify-between ${
        !notification.read ? 'ring-2 ring-blue-500/10' : ''
      }`}
    >
      <div className="flex gap-3 items-start min-w-0 flex-1">
        {/* Type Icon Indicator */}
        <div className={`p-2 rounded-lg bg-white shadow-sm ${currentType.text} flex-shrink-0`}>
          <Icon className="h-4 w-4" />
        </div>

        {/* Message */}
        <div className="space-y-1 min-w-0 flex-1">
          <p className={`text-xs leading-relaxed ${notification.read ? 'text-slate-500' : 'text-slate-800 font-medium'}`}>
            {notification.message}
          </p>
          <span className="text-[10px] text-slate-400 font-medium block">
            {formattedTime(notification.date)}
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-1.5 ml-2">
        {!notification.read && (
          <button
            onClick={() => onRead(notification.id)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all focus:outline-none"
            title="Mark as Read"
          >
            <Check className="h-4 w-4" />
          </button>
        )}
        <button
          onClick={() => onDelete(notification.id)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all focus:outline-none"
          title="Delete Notification"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </motion.div>
  );
};

export default NotificationCard;
