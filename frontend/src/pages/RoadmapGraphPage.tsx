import React, { useEffect, useState } from 'react';
import { shallowEqual, useSelector } from 'react-redux';
import classNames from 'classnames';
import ListIcon from '@material-ui/icons/List';
import { RootState } from '../redux/types';
import { roadmapsVersionsSelector } from '../redux/versions/selectors';
import { Version } from '../redux/versions/types';
import { totalValueAndWork } from '../utils/TaskUtils';
import { TaskValueCreatedVisualization } from '../components/TaskValueCreatedVisualization';
import css from './RoadmapGraphPage.module.scss';
import {
  BusinessValueFilled,
  RequiredWorkFilled,
} from '../components/RatingIcons';

const classes = classNames.bind(css);

export const RoadmapGraphPage = () => {
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

  const numFormat = new Intl.NumberFormat(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  });

  return (
    <div className={classes(css.plannerPagecontainer)}>
      <div className={classes(css.graphOuter)}>
        <h2 className={classes(css.graphTitle)}>Work / Value</h2>
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
                      <p>{numFormat.format(value)}</p>
                    </div>
                    <div className={classes(css.ratingDiv)}>
                      <RequiredWorkFilled />
                      <p>{numFormat.format(work)}</p>
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
        <h2 className={classes(css.graphTitle, css.lowerGraphTitle)}>
          Customers stakes in milestone
        </h2>
        <div className={classes(css.stakesContainer)}>
          {roadmapsVersions?.map((ver) => (
            <TaskValueCreatedVisualization version={ver} />
          ))}
        </div>
      </div>
    </div>
  );
};
