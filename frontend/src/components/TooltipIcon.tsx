import React from 'react';
import Tooltip from '@material-ui/core/Tooltip';
import classNames from 'classnames';
import css from './TooltipIcon.module.scss';

export const TooltipIcon: React.FC<{
  title: string;
  children?: any;
}> = ({ title, children }) => {
  return (
    <Tooltip
      classes={{
        arrow: classNames(css.tooltipArrow),
        tooltip: classNames(css.tooltip),
      }}
      title={title}
      placement="top"
      arrow
    >
      {children}
    </Tooltip>
  );
};
