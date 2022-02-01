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
import { roadmapsActions } from '../redux/roadmaps';

export const SocketListener = () => {
  const userInfo = useSelector(userInfoSelector);
  const currentRoadmapId = useSelector(chosenRoadmapIdSelector);
  const socket = useRef<Socket<ClientEventsMap, ServerEventsMap> | null>(null);
  const dispatch = useDispatch<StoreDispatchType>();

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
        dispatch(roadmapsActions.getRoadmaps());
      });

      socket.current.on(ClientEvents.USERS_UPDATED, (roadmapId) => {
        console.log(
          `Event received: ${ClientEvents.USERS_UPDATED}, ${roadmapId}`,
        );
        dispatch(roadmapsActions.getRoadmapUsers(roadmapId));
      });
    }
  }, [userInfo, dispatch]);

  useEffect(() => {
    if (!socket.current) return;
    socket.current.emit(
      ServerEvents.SET_SUBSCRIBED_ROADMAP,
      currentRoadmapId ?? -1,
    );
  }, [currentRoadmapId]);
  return <></>;
};
