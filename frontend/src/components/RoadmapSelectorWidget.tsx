import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useHistory } from 'react-router-dom';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { StoreDispatchType } from '../redux';
import { roadmapsActions } from '../redux/roadmaps';
import { chosenRoadmapIdSelector } from '../redux/roadmaps/selectors';
import { paths } from '../routers/paths';
import { Dropdown } from './forms/Dropdown';
import css from './forms/DropdownGreen.module.scss';
import { apiV2 } from '../api/api';

const classes = classNames.bind(css);

export const RoadmapSelectorWidget = () => {
  const { t } = useTranslation();
  const history = useHistory();
  const dispatch = useDispatch<StoreDispatchType>();
  const { data: roadmaps } = apiV2.useGetRoadmapsQuery();
  const roadmapId = useSelector(chosenRoadmapIdSelector);
  const chosenRoadmap = roadmaps?.find(({ id }) => id === roadmapId);

  const [selectedRoadmap, setSelectedRoadmap] = useState<string>(
    'Select roadmap',
  );

  useEffect(() => {
    if (chosenRoadmap) {
      setSelectedRoadmap(chosenRoadmap.name);
    } else setSelectedRoadmap('Select roadmap');
  }, [chosenRoadmap]);

  if (!roadmaps)
    return (
      <Dropdown css={css} title={t('No roadmaps available')} disabled empty />
    );

  if (roadmaps.length === 0) {
    return (
      <div className={classes(css.dropdownContainer)}>
        <button
          type="button"
          className={classes(css.dropButton, css.withoutIcon)}
          onClick={() => history.push(paths.getStarted)}
        >
          <div className={classes(css.dropTitle)}>{t('Get started')}</div>
        </button>
      </div>
    );
  }

  return (
    <Dropdown css={css} title={selectedRoadmap} maxLength={21}>
      {roadmaps.map((roadmap) => (
        <Link
          key={roadmap.id}
          className={classes(css.dropItem)}
          onClick={() => dispatch(roadmapsActions.clearTaskmapPosition())}
          to={`${paths.roadmapHome}/${roadmap.id}${paths.roadmapRelative.dashboard}`}
        >
          {roadmap.name}
        </Link>
      ))}
    </Dropdown>
  );
};
