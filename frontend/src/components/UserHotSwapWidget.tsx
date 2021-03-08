import React, { useEffect, useRef, useState } from 'react';
import { NavDropdown } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { api } from '../api/api';
import { StoreDispatchType } from '../redux';
import { chosenRoadmapIdSelector } from '../redux/roadmaps/selectors';
import { userActions } from '../redux/user';
import { userInfoSelector } from '../redux/user/selectors';
import { HotSwappableUser } from '../redux/user/types';
import { paths } from '../routers/paths';
import { StyledNavDropdown } from './forms/StyledNavDropdown';

export const UserHotSwapWidget = () => {
  const dropdownRef = useRef<HTMLDivElement>();
  const dispatch = useDispatch<StoreDispatchType>();
  const [hotSwappableUsers, setHotSwappableUsers] = useState<
    HotSwappableUser[]
  >([]);
  const history = useHistory();
  const userInfo = useSelector(userInfoSelector);
  const chosenRoadmapId = useSelector(chosenRoadmapIdSelector);

  const hotSwapToUser = async (user: HotSwappableUser) => {
    const res = await dispatch(userActions.hotSwapToUser(user.id));
    if (userActions.hotSwapToUser.rejected.match(res)) {
      if (res.payload) {
        // setErrorMessage(res.payload.message);
      }
    } else if (chosenRoadmapId !== undefined) {
      history.push(
        `/roadmap/${chosenRoadmapId}${paths.roadmapRelative.dashboard}`,
      );
    } else {
      history.push('/user');
    }
  };

  useEffect(() => {
    const getHotSwappableUsers = async () => {
      const users = await api.getHotSwappableUsers();
      const filtered = users.filter((user) => user.id !== userInfo?.id);

      setHotSwappableUsers(filtered);
    };
    getHotSwappableUsers();
  }, [userInfo]);

  if (hotSwappableUsers.length === 0) {
    return null;
  }
  return (
    <StyledNavDropdown
      id="userhotswapwidget"
      title="Swap to user"
      ref={dropdownRef}
    >
      {hotSwappableUsers.length === 0 && (
        <NavDropdown.Item>No linked users</NavDropdown.Item>
      )}
      {hotSwappableUsers.map((user) => {
        return (
          <NavDropdown.Item key={user.id} onClick={() => hotSwapToUser(user)}>
            {user.username}
          </NavDropdown.Item>
        );
      })}
    </StyledNavDropdown>
  );
};
