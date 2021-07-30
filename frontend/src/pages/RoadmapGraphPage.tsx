import { useEffect, useState } from 'react';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';

import classNames from 'classnames';
import ListIcon from '@material-ui/icons/List';
import { StoreDispatchType } from '../redux';
import { RootState } from '../redux/types';
import { roadmapsVersionsSelector } from '../redux/versions/selectors';
import { Version } from '../redux/versions/types';
import { totalWeightedValueAndWork } from '../utils/TaskUtils';
import { TaskValueCreatedVisualization } from '../components/TaskValueCreatedVisualization';
import css from './RoadmapGraphPage.module.scss';
import {
  BusinessValueFilled,
  RequiredWorkFilled,
} from '../components/RatingIcons';
import {
  allCustomersSelector,
  chosenRoadmapSelector,
} from '../redux/roadmaps/selectors';
import { Customer, Roadmap } from '../redux/roadmaps/types';
import { roadmapsActions } from '../redux/roadmaps';

const classes = classNames.bind(css);

interface VersionWorkAndValue extends Version {
  work: number;
  value: number;
}

export const RoadmapGraphPage = () => {
  const dispatch = useDispatch<StoreDispatchType>();
  const roadmapsVersions = useSelector<RootState, Version[] | undefined>(
    roadmapsVersionsSelector,
    shallowEqual,
  );
  const [selectedVersion, setSelectedVersion] = useState<undefined | Version>(
    undefined,
  );
  const [versions, setVersions] = useState<undefined | VersionWorkAndValue[]>(
    undefined,
  );
  const customers = useSelector<RootState, Customer[] | undefined>(
    allCustomersSelector(),
    shallowEqual,
  );
  const currentRoadmap = useSelector<RootState, Roadmap | undefined>(
    chosenRoadmapSelector,
    shallowEqual,
  );

  useEffect(() => {
    if (!customers && currentRoadmap)
      dispatch(roadmapsActions.getCustomers(currentRoadmap.id));
  }, [dispatch, customers, currentRoadmap]);

  useEffect(() => {
    if (!currentRoadmap) dispatch(roadmapsActions.getRoadmaps());
  }, [dispatch, currentRoadmap]);

  useEffect(() => {
    if (currentRoadmap)
      setVersions(
        roadmapsVersions?.map((version) => ({
          ...version,
          ...totalWeightedValueAndWork(
            version.tasks,
            customers ?? [],
            currentRoadmap,
          ),
        })),
      );
  }, [currentRoadmap, customers, roadmapsVersions]);

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
        <h2 className={classes(css.graphTitle, css.lowerGraphTitle)}>
          Customers stakes in milestone
        </h2>
        <div className={classes(css.stakesContainer)}>
          {roadmapsVersions?.map((ver) => (
            <TaskValueCreatedVisualization version={ver} key={ver.id} />
          ))}
        </div>
      </div>
    </div>
  );
};
