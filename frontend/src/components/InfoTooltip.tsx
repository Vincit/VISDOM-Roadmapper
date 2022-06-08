import React from 'react';
import MuiTooltip from '@mui/material/Tooltip';
import classNames from 'classnames';
import css from './InfoTooltip.module.scss';

const classes = classNames.bind(css);

/**
 * Wrapper around mui Tooltip that
 * - adds common styles
 * - stops click events propagating from the popper
 */
export const Tooltip: typeof MuiTooltip = ({ children, ...props }) => (
  <MuiTooltip
    {...props}
    classes={{
      arrow: classes(css.tooltipArrow),
      tooltip: classes(css.tooltip),
    }}
    PopperProps={{
      onClick: (e) => {
        e.stopPropagation();
      },
    }}
  >
    {children}
  </MuiTooltip>
);

export const ControlledTooltip: React.FC<{
  open?: boolean;
  onClose?: (value: boolean) => void;
  title: React.ReactNode;
  children?: any;
  placement?: 'bottom' | 'left' | 'right' | 'top';
}> = ({ open, onClose, title, children, placement }) => (
  <Tooltip
    title={title ?? ''}
    placement={placement || 'top'}
    arrow
    open={open}
    onClose={() => onClose?.(false)}
    leaveDelay={500}
  >
    {children}
  </Tooltip>
);

export const InfoTooltip: React.FC<{
  title: React.ReactNode;
  children?: any;
}> = ({ title, children }) => (
  <ControlledTooltip title={title}>{children}</ControlledTooltip>
);
