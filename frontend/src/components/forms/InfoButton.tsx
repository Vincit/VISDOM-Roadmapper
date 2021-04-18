import React from 'react';
import InfoIcon from '@material-ui/icons/InfoOutlined';
import classNames from 'classnames';
import css from './InfoButton.module.scss';

const classes = classNames.bind(css);

export const InfoButton: React.FC<{
  onClick?: (event: React.MouseEvent<SVGElement, MouseEvent>) => void;
  href?: string;
}> = ({ onClick, href }) => {
  if (href && href.length > 0) {
    return (
      <a href={href}>
        <InfoIcon className={classes(css.infoIcon)} onClick={onClick} />
      </a>
    );
  }
  return <InfoIcon className={classes(css.infoIcon)} onClick={onClick} />;
};
