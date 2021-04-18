import React from 'react';
import ForumIcon from '@material-ui/icons/ForumOutlined';
import classNames from 'classnames';
import css from './RatingsButton.module.scss';

const classes = classNames.bind(css);

export const RatingsButton: React.FC<{
  onClick?: (event: React.MouseEvent<SVGElement, MouseEvent>) => void;
  href?: string;
}> = ({ onClick, href }) => {
  if (href && href.length > 0) {
    return (
      <a href={href}>
        <ForumIcon className={classes(css.ratingsIcon)} onClick={onClick} />
      </a>
    );
  }
  return <ForumIcon className={classes(css.ratingsIcon)} onClick={onClick} />;
};
