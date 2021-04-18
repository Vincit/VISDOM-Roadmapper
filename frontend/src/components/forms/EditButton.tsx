import React from 'react';
import EditIcon from '@material-ui/icons/EditOutlined';
import classNames from 'classnames';
import css from './EditButton.module.scss';

const classes = classNames.bind(css);

export const EditButton: React.FC<{
  type: 'small' | 'default';
  onClick?: (event: React.MouseEvent<SVGElement, MouseEvent>) => void;
  href?: string;
}> = ({ type, href, onClick }) => {
  if (href && href.length > 0) {
    return (
      <a href={href}>
        <EditIcon
          className={classes(css.editIcon)}
          fontSize={type}
          onClick={onClick}
        />
      </a>
    );
  }

  return (
    <EditIcon
      className={classes(css.editIcon)}
      fontSize={type}
      onClick={onClick}
    />
  );
};
