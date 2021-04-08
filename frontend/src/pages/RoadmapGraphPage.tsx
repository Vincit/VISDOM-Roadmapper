import React, { useEffect, useState } from 'react';
import { shallowEqual, useSelector } from 'react-redux';
import classNames from 'classnames';
import { StarFill, Wrench, List } from 'react-bootstrap-icons';
import { chosenRoadmapSelector } from '../redux/roadmaps/selectors';
import { Roadmap } from '../redux/roadmaps/types';
import { RootState } from '../redux/types';
import { roadmapsVersionsSelector } from '../redux/versions/selectors';
import { Version } from '../redux/versions/types';
import { totalValueAndWork } from '../utils/TaskUtils';
import { TaskValueCreatedVisualization } from '../components/TaskValueCreatedVisualization';
import css from './RoadmapGraphPage.module.scss';

const classes = classNames.bind(css);

export const RoadmapGraphPage = () => {
  const roadmapsVersions = useSelector<RootState, Version[] | undefined>(
    roadmapsVersionsSelector,
    shallowEqual,
  );
  const roadmap = useSelector<RootState, Roadmap | undefined>(
    chosenRoadmapSelector,
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
    <>
      <div className={classes(css.graphOuter)}>
        <p className={classes(css.graphTitle)}>Value / Work</p>
        <div className={classes(css.graphInner)}>
          <div className={classes(css.graphItems)}>
            {roadmapsVersions?.map((ver) => {
              const numTasks = ver.tasks.length;
              const versionTasks = ver.tasks.map(
                (taskId) => roadmap!.tasks.find((task) => task.id === taskId)!,
              );
              const { value, work } = totalValueAndWork(versionTasks);
              const w = Math.max(100, 60 * (work / 5));
              const h = Math.max(90, 50 * (value / 5));
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
                  <p className={classes(css.versionData, css.versionTitle)}>
                    {ver.name}
                  </p>
                  <p className={classes(css.versionData)}>
                    <StarFill />
                    {value.toLocaleString(undefined, {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 1,
                    })}
                  </p>
                  <p className={classes(css.versionData)}>
                    <Wrench />
                    {work.toLocaleString(undefined, {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 1,
                    })}
                  </p>
                  <p className={classes(css.versionData)}>
                    <List />
                    {numTasks}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
        <p>Total work</p>
      </div>

      <div className={classes(css.footer)}>
        <p className={classes(css.graphTitle)}>Customers stakes in milestone</p>
        {selectedVersion && (
          <TaskValueCreatedVisualization version={selectedVersion} />
        )}
      </div>
    </>
  );
};
