/**
 * Cross-tab communication utility using BroadcastChannel API
 * Handles session events across multiple browser tabs
 */

export type SessionEvent = 'logout' | 'session-expired' | 'token-refreshed' | 'user-updated';

export interface SessionMessage {
  type: SessionEvent;
  data?: any;
  timestamp: number;
}

class SessionBroadcaster {
  private channel: BroadcastChannel | null = null;
  private listeners: Map<SessionEvent, Set<(data: any) => void>> = new Map();
  private enabled = false;

  constructor() {
    // Check if BroadcastChannel is supported
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        this.channel = new BroadcastChannel('velorent-session');
        this.enabled = true;
        this.setupMessageListener();
        console.log('[SessionBroadcaster] Initialized');
      } catch (error) {
        console.warn('[SessionBroadcaster] Failed to initialize:', error);
        this.enabled = false;
      }
    } else {
      console.warn('[SessionBroadcaster] BroadcastChannel API not supported');
    }
  }

  /**
   * Subscribe to a session event
   */
  public on(event: SessionEvent, callback: (data: any) => void): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);

    // Return unsubscribe function
    return () => {
      this.listeners.get(event)?.delete(callback);
    };
  }

  /**
   * Publish a session event to other tabs
   */
  public broadcast(type: SessionEvent, data?: any): void {
    if (!this.enabled || !this.channel) {
      console.warn('[SessionBroadcaster] BroadcastChannel not available, skipping broadcast');
      return;
    }
    
    const message: SessionMessage = {
      type,
      data,
      timestamp: Date.now(),
    };

    try {
      this.channel.postMessage(message);
      console.log(`[SessionBroadcaster] Broadcasted: ${type}`, data);
    } catch (error) {
      console.error('[SessionBroadcaster] Failed to broadcast:', error);
    }
  }

  /**
   * Setup message listener for incoming events
   */
  private setupMessageListener(): void {
    if (!this.channel) return;

    this.channel.onmessage = (event) => {
      try {
  const message = event.data as SessionMessage;
      this.handleMessage(message);
      } catch (error) {
        console.error('[SessionBroadcaster] Error handling incoming message:', error);
      }
    
    };

  
  }

  /**
   * Handle incoming message from other tabs
   */
  private handleMessage(message: SessionMessage): void {
    const { type, data } = message;
    
    console.log(`[SessionBroadcaster] Received: ${type}`, data);

    // Call all listeners for this event type
    const callbacks = this.listeners.get(type);
    if (callbacks) {
      callbacks.forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error(`[SessionBroadcaster] Error in listener for ${type}:`, error);
        }
      });
    }
  }

  /**
   * Cleanup resources
   */
  public destroy(): void {
    if (this.channel) {
      this.channel.close();
      this.channel = null;
    }
    this.listeners.clear();
    this.enabled = false;
    console.log('[SessionBroadcaster] Destroyed');
  }

  /**
   * Check if BroadcastChannel is available
   */
  public isAvailable(): boolean {
    return this.enabled;
  }
}

// Create singleton instance
export const sessionBroadcaster = new SessionBroadcaster();

/**
 * Hook for using session broadcaster in React components
 * Usage:
 * useEffect(() => {
 *   const unsubscribe = sessionBroadcaster.on('logout', () => {
 *     // handle logout
 *   });
 *   return unsubscribe;
 * }, []);
 */
export const useSessionBroadcaster = () => {
  return sessionBroadcaster;
};
