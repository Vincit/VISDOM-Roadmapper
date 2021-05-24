import React from 'react';
import classNames from 'classnames';
import { shallowEqual, useSelector } from 'react-redux';
import { NavBar } from './NavBar';
import { RoadmapSidebar } from './RoadmapSidebar';
import { RootState } from '../redux/types';
import { userInfoSelector } from '../redux/user/selectors';
import { UserInfo } from '../redux/user/types';
import css from './NavLayout.module.scss';

const classes = classNames.bind(css);

export interface NavLayoutProps {
  Content: (() => JSX.Element) | React.FC<any>;
}

export const NavLayout: React.FC<NavLayoutProps> = ({ Content }) => {
  const userInfo = useSelector<RootState, UserInfo | undefined>(
    userInfoSelector,
    shallowEqual,
  );
  return (
    <div className="layout-row grow">
      <RoadmapSidebar />
      <div
        className={classes('layout-column', 'grow', css.appContent, {
          'overflow-auto': userInfo,
          [css.loggedIn]: userInfo,
        })}
      >
        <NavBar />
        <Content />
      </div>
    </div>
  );
};
