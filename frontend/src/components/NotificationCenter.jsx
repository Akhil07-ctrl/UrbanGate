import { useNotification } from '../context/NotificationContext';
import { useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

export const NotificationCenter = () => {
  const { notifications, removeNotification } = useNotification();
  const notificationRefs = useRef({});
  const navigate = useNavigate();

  // Auto-remove notifications after delay
  useEffect(() => {
    const timeouts = notifications.map(notification => {
      return setTimeout(() => {
        removeNotification(notification.id);
      }, 5000);
    });

    return () => timeouts.forEach(timeout => clearTimeout(timeout));
  }, [notifications, removeNotification]);

  const handleNotificationClick = useCallback((e, notification) => {
    // Call the onClick handler that was set up in the context
    if (notification.onClick) {
      notification.onClick(e);
    }
  }, []);

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
        return (
          <div className="flex-shrink-0 h-6 w-6 text-green-500">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        );
      case 'error':
        return (
          <div className="flex-shrink-0 h-6 w-6 text-red-500">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="flex-shrink-0 h-6 w-6 text-blue-500">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
    }
  };

  return (
    <div className="fixed bottom-4 right-4 space-y-2 z-50 max-w-md w-full sm:w-96 px-4 sm:px-0">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          ref={(el) => (notificationRefs.current[notification.id] = el)}
          onClick={(e) => handleNotificationClick(e, notification)}
          className={`p-4 rounded-lg shadow-lg flex items-start gap-3 transform transition-all duration-300 ease-in-out ${
            notification.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200 hover:bg-green-100 cursor-pointer'
              : notification.type === 'error'
              ? 'bg-red-50 text-red-800 border border-red-200 hover:bg-red-100 cursor-pointer'
              : 'bg-blue-50 text-blue-800 border border-blue-200 hover:bg-blue-100 cursor-pointer'
          }`}
        >
          {getNotificationIcon(notification.type)}
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm sm:text-base">{notification.title}</p>
            {notification.message && (
              <p className="text-xs sm:text-sm opacity-90 mt-1">{notification.message}</p>
            )}
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              removeNotification(notification.id);
            }}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Dismiss notification"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
};
