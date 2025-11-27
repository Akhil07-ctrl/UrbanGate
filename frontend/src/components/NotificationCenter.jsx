import React from 'react';
import { useNotification } from '../context/NotificationContext';

export const NotificationCenter = () => {
  const { notifications, removeNotification } = useNotification();

  return (
    <div className="fixed bottom-4 right-4 space-y-2 z-50 max-w-md">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`p-4 rounded-lg shadow-lg flex justify-between items-start gap-3 animate-slide-in ${
            notification.type === 'success'
              ? 'bg-green-100 text-green-800 border border-green-300'
              : notification.type === 'error'
              ? 'bg-red-100 text-red-800 border border-red-300'
              : 'bg-blue-100 text-blue-800 border border-blue-300'
          }`}
        >
          <div className="flex-1">
            <p className="font-medium">{notification.title}</p>
            {notification.message && (
              <p className="text-sm opacity-90">{notification.message}</p>
            )}
          </div>
          <button
            onClick={() => removeNotification(notification.id)}
            className="text-xl leading-none opacity-70 hover:opacity-100"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
};
