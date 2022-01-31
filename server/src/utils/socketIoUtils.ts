import { Server } from 'socket.io';

export const registerSocketCallbacks = (io: Server) => {
  io.on('connection', (socket) => {
    console.log(
      `New socket connection. Id: ${socket.id} user: ${socket.data.user}`,
    );
    if (!socket.data.user) {
      console.error(
        'Socket connected without associated user. This should never happen',
      );
      return;
    }
  });
};
