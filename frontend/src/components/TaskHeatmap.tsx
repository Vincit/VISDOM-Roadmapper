/* eslint-disable no-bitwise */
import React from 'react';
import classNames from 'classnames';
import { shallowEqual, useSelector } from 'react-redux';
import { chosenRoadmapSelector } from '../redux/roadmaps/selectors';
import { Roadmap } from '../redux/roadmaps/types';
import { TaskRatingDimension } from '../../../shared/types/customTypes';
import { RootState } from '../redux/types';
import { ratingsSummaryByDimension } from '../utils/TaskUtils';
import css from './TaskHeatmap.module.scss';

const classes = classNames.bind(css);

function lerpColor(a: string, b: string, amount: number): string {
  const ah = parseInt(a.replace(/#/g, ''), 16);
  const ar = ah >> 16;
  const ag = (ah >> 8) & 0xff;
  const ab = ah & 0xff;
  const bh = parseInt(b.replace(/#/g, ''), 16);
  const br = bh >> 16;
  const bg = (bh >> 8) & 0xff;
  const bb = bh & 0xff;
  const rr = ar + amount * (br - ar);
  const rg = ag + amount * (bg - ag);
  const rb = ab + amount * (bb - ab);

  return `#${(((1 << 24) + (rr << 16) + (rg << 8) + rb) | 0)
    .toString(16)
    .slice(1)}`;
}

export const TaskHeatmap = () => {
  const currentRoadmap = useSelector<RootState, Roadmap | undefined>(
    chosenRoadmapSelector,
    shallowEqual,
  );

  const tasksToDatapoints = () => {
    const frequencies = [
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    ];
    currentRoadmap!.tasks.map(ratingsSummaryByDimension).forEach((ratings) => {
      const value = ratings.get(TaskRatingDimension.BusinessValue);
      const work = ratings.get(TaskRatingDimension.RequiredWork);
      if (value && work) {
        const avgValue = Math.round(value.avg);
        const avgWork = Math.round(work.avg);
        frequencies[10 - avgValue][avgWork] += 1;
      }
    });
    return frequencies;
  };
  const frequencies = tasksToDatapoints();

  return (
    <div className={classes(css.outerContainer)}>
      <p>Task heatmap</p>
      <div className={classes(css.graphicsFlexbox)}>
        <div className={css.graphicsContainer}>
          {frequencies.map((row, i) => (
            <div className={classes(css.row)} key={i}>
              {row.map((value, ii) => (
                <div
                  className={classes(css.tile)}
                  style={{
                    backgroundColor: value
                      ? lerpColor('#edf723', '#ff5555', Math.min(value / 15, 1))
                      : '#fffffb',
                  }}
                  key={ii}
                />
              ))}
            </div>
          ))}
        </div>
        <p className={classes(css.yaxismax)}>10</p>
        <p className={classes(css.yaxismin)}>0</p>
        <p className={classes(css.yaxislabel)}>Value</p>
      </div>
      <p className={classes(css.xaxismin)}>0</p>
      <p className={classes(css.xaxislabel)}>Work</p>
      <p className={classes(css.xaxismax)}>10</p>
    </div>
  );
};
