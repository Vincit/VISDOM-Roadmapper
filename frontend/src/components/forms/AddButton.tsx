import React from 'react';
import ControlPointSharpIcon from '@material-ui/icons/ControlPointSharp';
import classNames from 'classnames';
import css from './AddButton.module.scss';

const classes = classNames.bind(css);

export const AddButton: React.FC<{
  onClick?: (e: React.MouseEvent) => void;
  disabled?: boolean;
}> = ({ onClick, children, disabled }) => (
  <button
    className={classes(css.addButton)}
    type="button"
    disabled={disabled}
    onClick={onClick}
  >
    <ControlPointSharpIcon />
    {children}
  </button>
);
