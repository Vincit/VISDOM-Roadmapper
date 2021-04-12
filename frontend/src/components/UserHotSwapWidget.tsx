import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import classNames from 'classnames';
import { api } from '../api/api';
import { StoreDispatchType } from '../redux';
import { chosenRoadmapIdSelector } from '../redux/roadmaps/selectors';
import { userActions } from '../redux/user';
import { userInfoSelector } from '../redux/user/selectors';
import { HotSwappableUser } from '../redux/user/types';
import { paths } from '../routers/paths';
import { Dropdown } from './forms/Dropdown';
import css from './forms/Dropdown.module.scss';

const classes = classNames.bind(css);

export const UserHotSwapWidget = () => {
  const dispatch = useDispatch<StoreDispatchType>();
  const [hotSwappableUsers, setHotSwappableUsers] = useState<
    HotSwappableUser[]
  >([]);
  const history = useHistory();
  const userInfo = useSelector(userInfoSelector);
  const chosenRoadmapId = useSelector(chosenRoadmapIdSelector);

  const [selectedUser, setSelectedUser] = useState<string>('Swap to user');

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
    if (userInfo) setSelectedUser(userInfo.username);
  }, [userInfo]);

  return (
    <Dropdown title={selectedUser} empty={hotSwappableUsers.length === 0}>
      {hotSwappableUsers.map((user) => (
        <div key={user.id}>
          <button
            type="button"
            className={classes(css.dropItem)}
            onClick={() => hotSwapToUser(user)}
          >
            {user.username}
          </button>
        </div>
      ))}
    </Dropdown>
  );
};
