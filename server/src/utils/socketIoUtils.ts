import { Server, Socket } from 'socket.io';

const userToSocketMap: Record<number, Socket[]> = {};

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

    // Track all sockets this userid has opened
    if (!userToSocketMap[socket.data.user])
      userToSocketMap[socket.data.user] = [];
    userToSocketMap[socket.data.user].push(socket);

    socket.on('disconnect', () => {
      if (!socket.data.user) {
        console.error(
          'Socket disconnected without associated user. This should never happen',
        );
        return;
      }

      // Remove from list of sockets this userid has opened
      const sockets = userToSocketMap[socket.data.user];
      if (sockets) {
        const filtered = sockets.filter((s) => s != socket);

        if (filtered.length === 0) {
          delete userToSocketMap[socket.data.user];
        } else {
          userToSocketMap[socket.data.user] = filtered;
        }
      }
    });
  });
};

export const getSocketsByUser = (userId: number) => {
  return userToSocketMap[userId];
};
