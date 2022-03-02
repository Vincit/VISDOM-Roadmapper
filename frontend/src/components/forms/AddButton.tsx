import { FC, MouseEvent } from 'react';
import ControlPointSharpIcon from '@mui/icons-material/ControlPointSharp';
import classNames from 'classnames';
import css from './AddButton.module.scss';

const classes = classNames.bind(css);

export const AddButton: FC<{
  onClick?: (e: MouseEvent) => void;
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
