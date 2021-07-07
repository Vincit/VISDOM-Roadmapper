import React, { useEffect, useState } from 'react';
import { shallowEqual, useSelector } from 'react-redux';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import ListIcon from '@material-ui/icons/List';
import InfoIcon from '@material-ui/icons/InfoOutlined';
import { RootState } from '../redux/types';
import { roadmapsVersionsSelector } from '../redux/versions/selectors';
import { Version } from '../redux/versions/types';
import { totalValueAndWork } from '../utils/TaskUtils';
import { TaskValueCreatedVisualization } from '../components/TaskValueCreatedVisualization';
import { TooltipIcon } from '../components/forms/TooltipIcon';
import css from './RoadmapGraphPage.module.scss';
import {
  BusinessValueFilled,
  RequiredWorkFilled,
} from '../components/RatingIcons';

const classes = classNames.bind(css);

export const RoadmapGraphPage = () => {
  const { t } = useTranslation();
  const roadmapsVersions = useSelector<RootState, Version[] | undefined>(
    roadmapsVersionsSelector,
    shallowEqual,
  );
  const [selectedVersion, setSelectedVersion] = useState<undefined | Version>(
    undefined,
  );
  useEffect(() => {
    if (
      selectedVersion === undefined &&
      roadmapsVersions &&
      roadmapsVersions[0]
    ) {
      setSelectedVersion(roadmapsVersions[0]);
    }
  }, [roadmapsVersions, selectedVersion]);

  return (
    <div className={classes(css.plannerPagecontainer)}>
      <div className={classes(css.graphOuter)}>
        <div className={classes(css.titleContainer)}>
          <h2 className={classes(css.graphTitle)}>{t('workValueTitle')}</h2>
          <TooltipIcon title={t('tooltipMessage')}>
            <InfoIcon
              className={classes(css.tooltipInfoIcon, css.graphInfoIcon)}
            />
          </TooltipIcon>
        </div>
        <div className={classes(css.graphInner)}>
          <div className={classes(css.graphItems)}>
            {roadmapsVersions?.map((ver) => {
              const numTasks = ver.tasks.length;
              const { value, work } = totalValueAndWork(ver.tasks);
              const w = Math.max(100, 60 * (work / 5));
              const h = Math.max(100, 60 * (value / 5));
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
                      <p>
                        {value.toLocaleString(undefined, {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 1,
                        })}
                      </p>
                    </div>
                    <div className={classes(css.ratingDiv)}>
                      <RequiredWorkFilled />
                      <p>
                        {work.toLocaleString(undefined, {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 1,
                        })}
                      </p>
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
          <TooltipIcon title={t('tooltipMessage')}>
            <InfoIcon
              className={classes(css.tooltipInfoIcon, css.graphInfoIcon)}
            />
          </TooltipIcon>
        </div>

        {selectedVersion && (
          <TaskValueCreatedVisualization version={selectedVersion} />
        )}
      </div>
    </div>
  );
};
