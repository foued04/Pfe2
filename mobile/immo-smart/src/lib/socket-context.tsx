import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './auth-context';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, token } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (user && token) {
      // Use the backend URL from your environment or a constant
      // Assuming the backend is running on the same host or a predefined URL
      const API_URL = 'http://localhost:5000'; // Update this to your actual backend URL
      
      const newSocket = io(API_URL, {
        auth: {
          token: token
        },
        transports: ['websocket'],
      });

      newSocket.on('connect', () => {
        console.log('🔌 Connected to WebSocket');
        setIsConnected(true);
      });

      newSocket.on('disconnect', () => {
        console.log('🔌 Disconnected from WebSocket');
        setIsConnected(false);
      });

      newSocket.on('connect_error', (err) => {
        console.error('🔌 WebSocket connection error:', err.message);
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    } else {
      if (socket) {
        socket.close();
        setSocket(null);
        setIsConnected(false);
      }
    }
  }, [user, token]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};
