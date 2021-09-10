import React from 'react';
import Tooltip from '@material-ui/core/Tooltip';
import classNames from 'classnames';
import css from './InfoTooltip.module.scss';

const classes = classNames.bind(css);

export const ControlledTooltip: React.FC<{
  open: boolean;
  onClose: (value: boolean) => void;
  content: any;
  children?: any;
  placement?: 'bottom' | 'left' | 'right' | 'top';
}> = ({ open, onClose, content, children, placement }) => {
  return (
    <Tooltip
      classes={{
        arrow: classes(css.tooltipArrow),
        tooltip: classes(css.tooltip),
      }}
      title={content}
      placement={placement || 'top'}
      arrow
      open={open}
      interactive
      onClose={() => onClose(false)}
      leaveDelay={500}
    >
      {children}
    </Tooltip>
  );
};
