import React from 'react';
import Tooltip from '@material-ui/core/Tooltip';
import classNames from 'classnames';
import css from './InfoTooltip.module.scss';

const classes = classNames.bind(css);

export const InfoTooltip: React.FC<{
  title: string;
  children?: any;
}> = ({ title, children }) => {
  return (
    <Tooltip
      classes={{
        arrow: classes(css.tooltipArrow),
        tooltip: classes(css.tooltip),
      }}
      title={title}
      placement="top"
      arrow
    >
      {children}
    </Tooltip>
  );
};
