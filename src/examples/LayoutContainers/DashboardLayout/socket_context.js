import React from "react";
import webSocket from "socket.io-client";
import { SOCKET_HOST } from "utils/constants";
console.log('hi')

export const ws = webSocket(`${SOCKET_HOST}`, {
  transports: ["websocket"],
});
const SocketContext = React.createContext(ws);

export const SocketProvider = SocketContext.Provider;
export const SocketConsumer = SocketContext.Consumer;
export default SocketContext;
