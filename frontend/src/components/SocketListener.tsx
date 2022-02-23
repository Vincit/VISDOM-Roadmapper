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
  const [refetchTaskrelations] = apiV2.useRefetchTaskrelationsMutation();
  const [refetchCustomers] = apiV2.useRefetchCustomersMutation();
  const [refetchVersions] = apiV2.useRefetchVersionsMutation();

  useEffect(() => {
    if (!userInfo) {
      if (socket.current) {
        socket.current.disconnect();
        socket.current = null;
      }
      return;
    }

    if (!socket.current) {
      socket.current = io(process.env.REACT_APP_API_BASE_URL!, {
        withCredentials: true,
      });

      socket.current.on('connect_error', (error) => {
        console.log(`Error connecting socket: ${error}`);
      });

      socket.current.on(ClientEvents.ROADMAP_UPDATED, (roadmapId) => {
        refetchRoadmaps();
      });

      socket.current.on(ClientEvents.USER_UPDATED, (roadmapId) => {
        refetchUsers();
      });

      socket.current.on(ClientEvents.TASK_UPDATED, (roadmapId) => {
        refetchTasks();
      });

      socket.current.on(ClientEvents.TASKRELATION_UPDATED, (roadmapId) => {
        refetchTaskrelations();
      });

      socket.current.on(ClientEvents.TASKRATING_UPDATED, (roadmapId) => {
        refetchTasks();
      });

      socket.current.on(ClientEvents.CUSTOMER_UPDATED, (roadmapId) => {
        refetchCustomers();
      });

      socket.current.on(ClientEvents.VERSION_UPDATED, (roadmapId) => {
        refetchVersions();
      });
    }
  }, [
    userInfo,
    dispatch,
    refetchRoadmaps,
    refetchUsers,
    refetchTasks,
    refetchTaskrelations,
    refetchCustomers,
    refetchVersions,
  ]);

  useEffect(() => {
    if (!socket.current) return;
    socket.current.emit(
      ServerEvents.SET_SUBSCRIBED_ROADMAP,
      currentRoadmapId ?? -1,
    );
  }, [currentRoadmapId]);
  return <></>;
};
