import { io, Socket } from 'socket.io-client';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useRef } from 'react';
import {
  ClientEvents,
  ClientEventsMap,
  ServerEvents,
  ServerEventsMap,
} from '../../../shared/types/sockettypes';
import { userInfoSelector } from '../redux/user/selectors';
import { chosenRoadmapIdSelector } from '../redux/roadmaps/selectors';
import { StoreDispatchType } from '../redux';
import { apiV2 } from '../api/api';

export const SocketListener = () => {
  const userInfo = useSelector(userInfoSelector);
  const currentRoadmapId = useSelector(chosenRoadmapIdSelector);
  const socket = useRef<Socket<ClientEventsMap, ServerEventsMap> | null>(null);
  const dispatch = useDispatch<StoreDispatchType>();
  const [refetchTasks] = apiV2.useRefetchTasksMutation();
  const [refetchRoadmaps] = apiV2.useRefetchRoadmapsMutation();
  const [refetchUsers] = apiV2.useRefetchUsersMutation();

  useEffect(() => {
    if (!userInfo) {
      if (socket.current) {
        socket.current.disconnect();
        socket.current = null;
      }
      return;
    }

    if (!socket.current) {
      console.log('Trying to establish socketIo communication');
      socket.current = io(process.env.REACT_APP_API_BASE_URL!, {
        withCredentials: true,
      });

      socket.current.on('connect', () => {
        console.log(`Socket connected`);
      });

      socket.current.on('connect_error', (error) => {
        console.log(`Error connecting socket: ${error}`);
      });

      socket.current.on(ClientEvents.ROADMAP_UPDATED, (roadmapId) => {
        console.log(
          `Event received: ${ClientEvents.ROADMAP_UPDATED}, ${roadmapId}`,
        );
        refetchRoadmaps(null);
      });

      socket.current.on(ClientEvents.USERS_UPDATED, (roadmapId) => {
        console.log(
          `Event received: ${ClientEvents.USERS_UPDATED}, ${roadmapId}`,
        );
        refetchUsers(null);
      });

      socket.current.on(ClientEvents.TASK_UPDATED, (roadmapId, taskId) => {
        console.log(
          `Event received: ${ClientEvents.TASK_UPDATED}, ${roadmapId}, ${taskId}`,
        );
        refetchTasks(null);
      });
    }
  }, [userInfo, dispatch, refetchRoadmaps, refetchUsers, refetchTasks]);

  useEffect(() => {
    if (!socket.current) return;
    socket.current.emit(
      ServerEvents.SET_SUBSCRIBED_ROADMAP,
      currentRoadmapId ?? -1,
    );
  }, [currentRoadmapId]);
  return <></>;
};
