declare global {
  var sendWebSocketNotification: (userId: number, notification: any) => void;
}

export {};