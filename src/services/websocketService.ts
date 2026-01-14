import { io, Socket } from 'socket.io-client';

interface JobCompletedPayload {
  userId: string;
  jobId: string;
  status: 'completed' | 'failed';
  generatedContent?: string;
  error?: string;
  completedAt: string;
}

type JobCompletedCallback = (data: JobCompletedPayload) => void;

class WebSocketService {
  private socket: Socket | null = null;
  private jobCallbacks: Map<string, JobCompletedCallback> = new Map();
  private globalCallback: JobCompletedCallback | null = null;

  connect(token: string): void {
    if (this.socket?.connected) {
      console.log('WebSocket already connected');
      return;
    }

    this.socket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000', {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    this.socket.on('connect', () => {
      console.log('WebSocket Connected. Socket ID:', this.socket?.id);
    });

    this.socket.on('connect_error', (error: Error) => {
      console.error(' WebSocket Connection Error:', error.message);
    });

    this.socket.on('disconnect', (reason: string) => {
      console.log(' WebSocket Disconnected:', reason);
    });

    // Listen for job completion events
    this.socket.on('job_completed', (data: JobCompletedPayload) => {
      console.log(' Job Completed Event Received:', data);

      // Call job-specific callback if registered
      const jobCallback = this.jobCallbacks.get(data.jobId);
      if (jobCallback) {
        jobCallback(data);
        this.jobCallbacks.delete(data.jobId);
      }

      // Call global callback if set
      if (this.globalCallback) {
        this.globalCallback(data);
      }
    });
  }

  // Register a callback for when a specific job completes
  onJobComplete(jobId: string, callback: JobCompletedCallback): void {
    this.jobCallbacks.set(jobId, callback);
  }

  // Register a global callback for all job completions
  onAnyJobComplete(callback: JobCompletedCallback): void {
    this.globalCallback = callback;
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.jobCallbacks.clear();
      this.globalCallback = null;
      console.log('WebSocket disconnected and cleaned up');
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

// Singleton instance
export const wsService = new WebSocketService();
