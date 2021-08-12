import React from 'react';
import Tooltip from '@material-ui/core/Tooltip';
import classNames from 'classnames';
import css from './InfoTooltip.module.scss';

const classes = classNames.bind(css);

export const ControlledTooltip: React.FC<{
  open: boolean;
  onClose: (value: boolean) => void;
  title: string;
  children?: any;
  placement?: 'bottom' | 'left' | 'right' | 'top';
}> = ({ open, onClose, title, children, placement }) => {
  return (
    <Tooltip
      classes={{
        arrow: classes(css.tooltipArrow),
        tooltip: classes(css.tooltip),
      }}
      title={title}
      placement={placement || 'top'}
      arrow
      open={open}
      onClose={() => onClose(false)}
      leaveDelay={500}
    >
      {children}
    </Tooltip>
  );
};
