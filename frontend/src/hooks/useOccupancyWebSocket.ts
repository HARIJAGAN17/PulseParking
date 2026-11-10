import { useEffect, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

interface OccupancyUpdate {
  spaceId: string;
  buildingId: string;
  areaId: string;
  status: 'AVAILABLE' | 'OCCUPIED' | 'OUT_OF_SERVICE';
  version: number;
  timestamp: string;
}

interface UseWebSocketOptions {
  areaId?: string;
  onUpdate?: (update: OccupancyUpdate) => void;
  onConnect?: () => void;
}

export function useOccupancyWebSocket({ areaId, onUpdate, onConnect }: UseWebSocketOptions) {
  const clientRef = useRef<Client | null>(null);

  useEffect(() => {
    const client = new Client({
      webSocketFactory: () => new SockJS('/ws'),
      reconnectDelay: 3000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      debug: (msg) => {
        if (import.meta.env.DEV) {
          console.debug('[STOMP]', msg);
        }
      },
    });

    client.onConnect = () => {
      console.log('[STOMP] Connected to live parking WebSocket');
      if (onConnect) {
        onConnect();
      }

      // 1. Subscribe to system-wide occupancy updates
      client.subscribe('/topic/occupancy', (message) => {
        try {
          const update: OccupancyUpdate = JSON.parse(message.body);
          if (onUpdate) {
            onUpdate(update);
          }
        } catch (e) {
          console.error('[STOMP] Error parsing message body', e);
        }
      });

      // 2. Subscribe to current floor updates if specified
      if (areaId) {
        client.subscribe(`/topic/areas/${areaId}`, (message) => {
          try {
            const update: OccupancyUpdate = JSON.parse(message.body);
            if (onUpdate) {
              onUpdate(update);
            }
          } catch (e) {
            console.error('[STOMP] Error parsing area message', e);
          }
        });
      }
    };

    client.onStompError = (frame) => {
      console.error('[STOMP] Broker error: ' + frame.headers['message']);
    };

    client.activate();
    clientRef.current = client;

    return () => {
      if (clientRef.current) {
        clientRef.current.deactivate();
      }
    };
  }, [areaId]);

  return clientRef;
}
