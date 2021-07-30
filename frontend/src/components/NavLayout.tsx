import { FC, ReactElement } from 'react';
import classNames from 'classnames';
import { NavBar } from './NavBar';
import { RoadmapSidebar } from './RoadmapSidebar';
import css from './NavLayout.module.scss';

const classes = classNames.bind(css);

export interface NavLayoutProps {
  Content: (() => ReactElement) | FC<any>;
}

export const NavLayout: FC<NavLayoutProps> = ({ Content }) => {
  return (
    <div className="layout-row grow">
      <RoadmapSidebar />
      <div
        className={classes(
          'layout-column',
          'grow',
          'overflow-auto',
          css.appContent,
        )}
      >
        <NavBar />
        <Content />
      </div>
    </div>
  );
};
