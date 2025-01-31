// server/utils/socket.js

let ioInstance = null;

/**
 * Store the Socket.IO server instance so other modules can emit events.
 */
export function setIO(io) {
  ioInstance = io;
}

/**
 * Retrieve the stored Socket.IO server instance.
 */
export function getIO() {
  return ioInstance;
}
