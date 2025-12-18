/* eslint-disable @typescript-eslint/no-explicit-any */

export interface SocketOptions {
  reconnect?: boolean;         // auto reconnect
  reconnectInterval?: number;  // retry delay (ms)
  heartbeatInterval?: number;  // ping/pong keepalive (ms)
}

export abstract class SocketService {
  private socket: WebSocket | null = null;
  private reconnectTimer: any = null;
  private heartbeatTimer: any = null;
  private manualClose = false;

  protected baseURL: string;
  protected options: SocketOptions;

  constructor(baseURL: string, options: SocketOptions = {}) {
    this.baseURL = baseURL;
    this.options = {
      reconnect: options.reconnect ?? true,
      reconnectInterval: options.reconnectInterval ?? 3000,
      heartbeatInterval: options.heartbeatInterval ?? 20000,
    };
  }

  connect(
    path: string,
    onMessage: (msg: any) => void,
    onOpen?: () => void,
    onError?: (err: any) => void,
    onClose?: () => void
  ) {
    this.manualClose = false;
    if (this.socket) this.disconnect();

    this.socket = new WebSocket(`${this.baseURL}${path}`);

    this.socket.onopen = () => {
      // this.startHeartbeat();
      if (onOpen) onOpen();
    };

    this.socket.onmessage = (event) => {
      let data: any;
      try {
        data = JSON.parse(event.data);
      } catch {
        data = event.data;
      }
      onMessage(data);
    };

    this.socket.onerror = (err) => {
      if (onError) onError(err);
    };

    this.socket.onclose = () => {
      this.stopHeartbeat();
      if (onClose) onClose();

      if (!this.manualClose && this.options.reconnect) {
        this.reconnect(path, onMessage, onOpen, onError, onClose);
      }
    };
  }

  // send(data: any) {
  //   console.log("websocket send", data);
  //   console.log("socket?.readyState", this.socket?.readyState);
  //   console.log("WebSocket.OPEN", this.socket);
  //   if (this.socket?.readyState === WebSocket.OPEN) {
  //     console.log("socket?.readyState >>>>>", this.socket?.readyState);
  //     this.socket.send(JSON.stringify(data));
  //   }
  // }

  send(data: any) {
  if (!this.socket) {
    console.warn("WS send skipped: socket is null", data);
    return;
  }

  if (this.socket.readyState !== WebSocket.OPEN) {
    console.warn(
      "WS send skipped: socket not open",
      this.socket.readyState
    );
    return;
  }
  console.log("add chat ????",data)
  this.socket.send(JSON.stringify(data));
}


  disconnect() {
    this.manualClose = true;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.stopHeartbeat();
    if (this.socket) {
      // this.socket.close();
      this.socket.onopen = null;
      this.socket.onmessage = null;
      this.socket.onerror = null;
      this.socket.onclose = null;
      this.socket.close(1000, "Manual disconnect");
      this.socket = null;
    }
  }

  private reconnect(
    path: string,
    onMessage: (msg: any) => void,
    onOpen?: () => void,
    onError?: (err: any) => void,
    onClose?: () => void
  ) {
    if (this.manualClose) return;
    if (this.reconnectTimer) return;
    this.reconnectTimer = setTimeout(() => {
      if (!this.manualClose) {
        this.connect(path, onMessage, onOpen, onError, onClose);
      }
      this.reconnectTimer = null;
    }, this.options.reconnectInterval);
  }

  private startHeartbeat() {
    if (!this.options.heartbeatInterval) return;
    this.heartbeatTimer = setInterval(() => {
      if (this.socket?.readyState === WebSocket.OPEN) {
        this.socket.send(JSON.stringify({ type: "ping" }));
      }
    }, this.options.heartbeatInterval);
  }

  private stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }
}
