import React from 'react';
import DeleteOutlineOutlinedIcon from '@material-ui/icons/DeleteOutlineOutlined';
import DeleteIcon from '@material-ui/icons/DeleteSharp';
import classNames from 'classnames';
import css from './DeleteButton.module.scss';

const classes = classNames.bind(css);

export const DeleteButton: React.FC<{
  type: 'outlined' | 'filled';
  onClick?: (event: React.MouseEvent<SVGElement, MouseEvent>) => void;
  href?: string;
}> = ({ type, onClick, href }) => {
  if (href && href.length > 0) {
    return (
      <a href={href}>
        <DeleteIcon className={classes(css.deleteIcon)} onClick={onClick} />
      </a>
    );
  }

  if (type === 'outlined') {
    return (
      <DeleteOutlineOutlinedIcon
        className={classes(css.deleteIcon)}
        onClick={onClick}
      />
    );
  }

  return <DeleteIcon className={classes(css.deleteIcon)} onClick={onClick} />;
};
