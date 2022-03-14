import { hasPermission } from './../../../shared/utils/permission';
import {
  ClientEvents,
  ServerEvents,
  ClientEventsMap,
} from './../../../shared/types/sockettypes';
import {
  ExtendedServer,
  ExtendedSocket,
  ISocketData,
} from './../types/customTypes';
import { SocketStatusResponse } from '../../../shared/types/sockettypes';
import Roadmap from '../api/roadmaps/roadmaps.model';
import User from '../api/users/users.model';

export const registerSocketCallbacks = (io: ExtendedServer) => {
  io.on('connection', (socket) => {
    if (!socket.data.user) {
      console.error(
        'Socket connected without associated user. This should never happen',
      );
      return;
    }

    socket.on('disconnect', () => {
      if (!socket.data.user) {
        console.error(
          'Socket disconnected without associated user. This should never happen',
        );
        return;
      }
    });

    socket.on(
      ServerEvents.SET_SUBSCRIBED_ROADMAP,
      setSubscribedRoadmap(socket),
    );
  });
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

  socket.rooms.forEach((room) => socket.leave(room));
  socket.join(`roadmap-${roadmapId}`);
  // Sockets are added to a room with their user id so we can emit events using user id
  socket.join(`${socket.data.user!.id}`);

  sendResponse?.({ status: 200 });
};

export type EmitRoadmapEventParams<T extends ClientEvents> = {
  roadmapId: number;
  dontEmitToUserId?: number;
  requirePermission?: number;
  event: T;
  eventParams: Parameters<ClientEventsMap[T]>;
};

export const emitRoadmapEvent = async <T extends ClientEvents>(
  io: ExtendedServer,
  emitRoadmapEventParams: EmitRoadmapEventParams<T>,
) => {
  const {
    roadmapId,
    dontEmitToUserId,
    requirePermission,
    event,
    eventParams: parameters,
  } = { ...emitRoadmapEventParams };

  const roomName = `roadmap-${roadmapId}`;
  const roadmapSockets = await io.in(roomName).fetchSockets<ISocketData>();
  const socketUserIds = roadmapSockets.map((s) => s.data.user.id);
  const socketUsers = await User.query()
    .findByIds(socketUserIds)
    .withGraphJoined('roles')
    .where('roles.roadmapId', roadmapId);

  const usersWithPermission = requirePermission
    ? socketUsers.filter((user) =>
        hasPermission(user.roles[0]?.type, requirePermission),
      )
    : socketUsers;

  for (const user of usersWithPermission) {
    if (user.id === dontEmitToUserId) continue;

    // Sockets are added to a room with their associated user id when they connect to allow sending like this
    io.to(`${user.id}`).emit(event, ...parameters);
  }
};
