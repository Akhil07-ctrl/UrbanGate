import { createContext, useContext, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const addNotification = useCallback(({ onClick, navigateTo, ...notification }) => {
    const id = Date.now();
    
    const handleClick = (e) => {
      // Prevent default if this is an event
      if (e && e.preventDefault) {
        e.stopPropagation();
      }

      // Call the custom onClick handler if provided
      if (onClick) {
        if (typeof onClick === 'function') {
          const notificationData = {
            id,
            ...notification,
            navigateTo
          };
          onClick(notificationData);
        }
      }

      // Navigate if navigateTo is provided
      if (navigateTo) {
        navigate(navigateTo);
      }

      // Always remove the notification when clicked
      removeNotification(id);
    };

    const newNotification = {
      id,
      ...notification,
      timestamp: new Date(),
      onClick: handleClick,
      navigateTo // Keep the navigateTo for reference
    };

    setNotifications(prev => [...prev, newNotification]);

    // Auto remove after 5 seconds
    const timeout = setTimeout(() => {
      removeNotification(id);
    }, 5000);

    // Return cleanup function
    return () => clearTimeout(timeout);
  }, [navigate, removeNotification]);

  // Helper function to show success notification
  const showSuccess = useCallback(({ title, message, onClick, navigateTo }) => {
    return addNotification({
      type: 'success',
      title,
      message,
      onClick,
      navigateTo
    });
  }, [addNotification]);

  // Helper function to show error notification
  const showError = useCallback(({ title, message, onClick, navigateTo }) => {
    return addNotification({
      type: 'error',
      title,
      message,
      onClick,
      navigateTo
    });
  }, [addNotification]);

  // Helper function to show info notification
  const showInfo = useCallback(({ title, message, onClick, navigateTo }) => {
    return addNotification({
      type: 'info',
      title,
      message,
      onClick,
      navigateTo
    });
  }, [addNotification]);

  return (
    <NotificationContext.Provider value={{ 
      notifications, 
      addNotification, 
      removeNotification,
      showSuccess,
      showError,
      showInfo
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return context;
};
