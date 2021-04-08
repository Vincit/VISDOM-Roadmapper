import React from 'react';
import { Trans } from 'react-i18next';
import { Link, useLocation, useRouteMatch } from 'react-router-dom';
import classNames from 'classnames';
import { paths } from '../routers/paths';
import css from './PlannerPageNavbar.module.scss';

const classes = classNames.bind(css);

export const PlannerPageNavbar = () => {
  const { url } = useRouteMatch();
  const { pathname } = useLocation();
  return (
    <div className={classes(css.navbar)}>
      <Link
        className={classes(css.navbarButton, {
          [css.highlight]: !!pathname.startsWith(
            url + paths.plannerRelative.graph,
          ),
        })}
        to={url + paths.plannerRelative.graph}
      >
        <Trans i18nKey="Roadmap" />
      </Link>
      <Link
        className={classes(css.navbarButton, {
          [css.highlight]: !!pathname.startsWith(
            url + paths.plannerRelative.editor,
          ),
        })}
        to={url + paths.plannerRelative.editor}
      >
        <Trans i18nKey="Milestones" />
      </Link>
      <Link
        className={classes(css.navbarButton, {
          [css.highlight]: !!pathname.startsWith(
            url + paths.plannerRelative.timeEstimation,
          ),
        })}
        to={url + paths.plannerRelative.timeEstimation}
      >
        <Trans i18nKey="Time Estimation" />
      </Link>
      <Link
        className={classes(css.navbarButton, {
          [css.highlight]: !!pathname.startsWith(
            url + paths.plannerRelative.weights,
          ),
        })}
        to={url + paths.plannerRelative.weights}
      >
        <Trans i18nKey="Client Weights" />
      </Link>
      <div className={classes(css.navbarFiller)} />
    </div>
  );
};
