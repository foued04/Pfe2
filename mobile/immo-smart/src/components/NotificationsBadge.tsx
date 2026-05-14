import React, { useEffect, useState } from 'react';
import { IonBadge } from '@ionic/react';
import { useAuth } from '../lib/auth-context';
import { useSocket } from '../lib/socket-context';
import { fetchUnreadNotificationsCount } from '../lib/notification-api';

const NotificationsBadge: React.FC = () => {
  const { token, isAuthenticated } = useAuth();
  const { socket } = useSocket();
  const [count, setCount] = useState(0);

  const loadCount = async () => {
    if (!token) return;
    try {
      const data = await fetchUnreadNotificationsCount(token);
      setCount(Number(data?.count || 0));
    } catch (err) {
      console.error('Failed to fetch notification count:', err);
    }
  };

  useEffect(() => {
    if (isAuthenticated && token) {
      loadCount();
      const interval = setInterval(loadCount, 30000); // Polling as fallback
      return () => clearInterval(interval);
    } else {
      setCount(0);
    }
  }, [isAuthenticated, token]);

  useEffect(() => {
    if (!socket) return;

    const handleUpdate = () => {
      loadCount();
    };

    socket.on('new_notification', handleUpdate);
    socket.on('notification_read', handleUpdate);

    return () => {
      socket.off('new_notification', handleUpdate);
      socket.off('notification_read', handleUpdate);
    };
  }, [socket]);

  if (!isAuthenticated || count === 0) return null;

  return (
    <IonBadge color="danger" style={{ 
      position: 'absolute', 
      top: '2px', 
      right: 'calc(50% - 18px)', 
      fontSize: '10px',
      padding: '2px 4px',
      minWidth: '16px',
      height: '16px',
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10
    }}>
      {count > 9 ? '9+' : count}
    </IonBadge>
  );
};

export default NotificationsBadge;
