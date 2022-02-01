import {
  ClientEvents,
  ServerEvents,
  ClientEventsMap,
} from './../../../shared/types/sockettypes';
import { ExtendedServer, ExtendedSocket } from './../types/customTypes';
import { SocketStatusResponse } from '../../../shared/types/sockettypes';
import Roadmap from '../api/roadmaps/roadmaps.model';
import User from '../api/users/users.model';

const userToSocketMap: Record<number, ExtendedSocket[]> = {};

export const registerSocketCallbacks = (io: ExtendedServer) => {
  io.on('connection', (socket) => {
    if (!socket.data.user) {
      console.error(
        'Socket connected without associated user. This should never happen',
      );
      return;
    }

    console.log(
      `New socket connection. Id: ${socket.id} user: ${socket.data.user.email}`,
    );

    // Track all sockets this userid has opened
    if (!userToSocketMap[socket.data.user.id])
      userToSocketMap[socket.data.user.id] = [];
    userToSocketMap[socket.data.user.id].push(socket);

    socket.on('disconnect', () => {
      if (!socket.data.user) {
        console.error(
          'Socket disconnected without associated user. This should never happen',
        );
        return;
      }

      console.log(
        `Socket disconnected. Id: ${socket.id} user: ${socket.data.user.email}`,
      );
      // Remove from list of sockets that this userid has opened
      const sockets = userToSocketMap[socket.data.user.id];
      if (sockets) {
        const filtered = sockets.filter((s) => s != socket);

        if (filtered.length === 0) {
          delete userToSocketMap[socket.data.user.id];
        } else {
          userToSocketMap[socket.data.user.id] = filtered;
        }
      }
    });

    socket.on(
      ServerEvents.SET_SUBSCRIBED_ROADMAP,
      setSubscribedRoadmap(socket),
    );
  });
};

export const getSocketsByUser = (userId: number) => {
  return userToSocketMap[userId];
};

export const setSubscribedRoadmap = (socket: ExtendedSocket) => async (
  roadmapId: number | undefined | null,
  sendResponse?: (res: SocketStatusResponse) => void,
) => {
  // -1 or no roadmapId arg leaves all rooms
  if (!roadmapId || roadmapId === -1) {
    socket.rooms.forEach((room) => socket.leave(room));
    sendResponse?.({ status: 200 });
    return;
  }

  const foundUser = await Roadmap.relatedQuery<User>('users')
    .for(roadmapId)
    .where('users.id', socket.data.user!.id)
    .first();

  if (!foundUser) {
    sendResponse?.({
      status: 403,
    });
    return;
  }

  // Leave all roadmap rooms first leaving only the given one
  socket.rooms.forEach((room) => socket.leave(room));
  socket.join(`roadmap-${roadmapId}`);
  sendResponse?.({ status: 200 });
};

export const emitRoadmapEvent = <T extends ClientEvents>(
  io: ExtendedServer,
  roadmapId: number,
  skipUser: number | undefined | null,
  event: T,
  parameters: Parameters<ClientEventsMap[T]>,
) => {
  let usersSockets: ExtendedSocket[] | undefined;
  if (skipUser) {
    usersSockets = getSocketsByUser(skipUser);
    if (usersSockets) {
      usersSockets.forEach((s) => s.leave(`roadmap-${roadmapId}`));
    }
  }
  io.to(`roadmap-${roadmapId}`).emit(event, ...parameters);
  if (skipUser && usersSockets) {
    usersSockets.forEach((s) => s.join(`roadmap-${roadmapId}`));
  }
};
