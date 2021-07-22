import { useEffect, useState } from 'react';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';

import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import ListIcon from '@material-ui/icons/List';
import InfoIcon from '@material-ui/icons/InfoOutlined';
import { StoreDispatchType } from '../redux';
import { RootState } from '../redux/types';
import { totalWeightedValueAndWork } from '../utils/TaskUtils';
import { TaskValueCreatedVisualization } from '../components/TaskValueCreatedVisualization';
import { InfoTooltip } from '../components/InfoTooltip';
import css from './RoadmapGraphPage.module.scss';
import {
  BusinessValueFilled,
  RequiredWorkFilled,
} from '../components/RatingIcons';
import {
  chosenRoadmapSelector,
  roadmapsVersionsSelector,
} from '../redux/roadmaps/selectors';
import { Roadmap, Version } from '../redux/roadmaps/types';
import { roadmapsActions } from '../redux/roadmaps';

const classes = classNames.bind(css);

interface VersionWorkAndValues extends Version {
  work: number;
  value: number;
  totalValue: number;
}

export const RoadmapGraphPage = () => {
  const dispatch = useDispatch<StoreDispatchType>();
  const { t } = useTranslation();
  const roadmapsVersions = useSelector<RootState, Version[] | undefined>(
    roadmapsVersionsSelector(),
    shallowEqual,
  );
  const [selectedVersion, setSelectedVersion] = useState<undefined | Version>(
    undefined,
  );
  const [versions, setVersions] = useState<undefined | VersionWorkAndValues[]>(
    undefined,
  );
  const currentRoadmap = useSelector<RootState, Roadmap | undefined>(
    chosenRoadmapSelector,
    shallowEqual,
  );

  useEffect(() => {
    if (!currentRoadmap) dispatch(roadmapsActions.getRoadmaps());
  }, [dispatch, currentRoadmap]);

  useEffect(() => {
    if (currentRoadmap)
      setVersions(
        roadmapsVersions?.map((version) => ({
          ...version,
          ...totalWeightedValueAndWork(version.tasks, currentRoadmap),
        })),
      );
  }, [currentRoadmap, roadmapsVersions]);

  useEffect(() => {
    if (
      selectedVersion === undefined &&
      roadmapsVersions &&
      roadmapsVersions[0]
    ) {
      setSelectedVersion(roadmapsVersions[0]);
    }
  }, [roadmapsVersions, selectedVersion]);

  const numFormat = new Intl.NumberFormat(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  });

  return (
    <div className={classes(css.plannerPagecontainer)}>
      <div className={classes(css.graphOuter)}>
        <div className={classes(css.titleContainer)}>
          <h2 className={classes(css.graphTitle)}>{t('workValueTitle')}</h2>
          <InfoTooltip title={t('tooltipMessage')}>
            <InfoIcon className={classes(css.tooltipIcon, css.infoIcon)} />
          </InfoTooltip>
        </div>

        <div className={classes(css.graphInner)}>
          <div className={classes(css.graphItems)}>
            {versions?.map((ver) => {
              const numTasks = ver.tasks.length;
              const w = Math.max(100, 60 * (ver.work / 5));
              const h = Math.min(350, Math.max(100, 45 * Math.log2(ver.value)));
              return (
                <div
                  className={classes(css.graphItem, {
                    [css.selected]: ver.id === selectedVersion?.id,
                  })}
                  style={{ width: `${w}px`, height: `${h}px` }}
                  key={ver.id}
                  onClick={() => setSelectedVersion(ver)}
                  onKeyPress={() => setSelectedVersion(ver)}
                  role="button"
                  tabIndex={0}
                >
                  <div className={classes(css.versionData)}>
                    <div className={classes(css.ratingDiv)}>
                      <BusinessValueFilled />
                      <p>{numFormat.format(ver.value)}</p>
                    </div>
                    <div className={classes(css.ratingDiv)}>
                      <RequiredWorkFilled />
                      <p>{numFormat.format(ver.work)}</p>
                    </div>
                    <div className={classes(css.dash)} />
                    <div className={classes(css.ratingDiv)}>
                      <ListIcon />
                      <p>{numTasks}</p>
                    </div>
                  </div>
                  <p
                    className={classes(css.versionTitle, {
                      [css.selected]: ver.id === selectedVersion?.id,
                    })}
                  >
                    {ver.name}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
        <p className={classes(css.graphLabel)}>Total work</p>
      </div>
      <p className={classes(css.graphLabel, css.vertical)}>Total value</p>

      <div className={classes(css.footer)}>
        <div
          className={classes(css.titleContainer, css.lowerGraphTitleContainer)}
        >
          <h2 className={classes(css.graphTitle)}>
            {t('customerStakesTitle')}
          </h2>
          <InfoTooltip title={t('tooltipMessage')}>
            <InfoIcon className={classes(css.tooltipIcon, css.infoIcon)} />
          </InfoTooltip>
        </div>
        <div className={classes(css.stakesContainer)}>
          {versions?.map((ver) => (
            <TaskValueCreatedVisualization version={ver} key={ver.id} />
          ))}
        </div>
      </div>
    </div>
  );
};
