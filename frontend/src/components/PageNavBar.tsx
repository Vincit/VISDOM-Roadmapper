import { FC } from 'react';
import { Link, useLocation, useRouteMatch } from 'react-router-dom';
import classNames from 'classnames';
import css from './PageNavBar.module.scss';

const classes = classNames.bind(css);

interface Header {
  url: string;
  text: string;
}

export const PageNavBar: FC<{
  headers: Header[];
}> = ({ headers }) => {
  const { url } = useRouteMatch();
  const { pathname } = useLocation();
  return (
    <div className={classes(css.navbar)}>
      {headers.map((header) => (
        <Link
          key={header.text}
          className={classes(css.navbarButton, {
            [css.highlight]: pathname.startsWith(url + header.url),
          })}
          to={url + header.url}
        >
          {header.text}
        </Link>
      ))}
      <div className={classes(css.navbarFiller)} />
    </div>
  );
};
