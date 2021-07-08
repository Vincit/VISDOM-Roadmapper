import classNames from 'classnames';
import React from 'react';
import Chart from 'react-apexcharts';
import { Trans } from 'react-i18next';
import { shallowEqual, useSelector } from 'react-redux';
import { chosenRoadmapSelector } from '../redux/roadmaps/selectors';
import { Roadmap } from '../redux/roadmaps/types';
import { RootState } from '../redux/types';
import css from './RoadmapCompletionMeter.module.scss';

const classes = classNames.bind(css);

export const RoadmapCompletionMeter = () => {
  const currentRoadmap = useSelector<RootState, Roadmap | undefined>(
    chosenRoadmapSelector,
    shallowEqual,
  );

  const getCompletionPercent = () => {
    const totalTasks = currentRoadmap!.tasks.length;
    if (totalTasks === 0) return 0;
    const completedTasks = currentRoadmap!.tasks.filter(
      (task) => task.completed,
    ).length;
    return Math.round((completedTasks / totalTasks) * 100);
  };

  const options = {
    chart: {
      animations: {
        enabled: false,
      },
    },
    colors: ['#11DD11'],
    plotOptions: {
      pie: {
        expandOnClick: false,
      },
      radialBar: {
        startAngle: -90,
        endAngle: 90,
        track: {
          background: '#FF1111',
          strokeWidth: '100%',
          margin: 0,
          dropShadow: {
            enabled: true,
            top: 2,
            left: 0,
            color: '#999',
            opacity: 1,
            blur: 3,
          },
        },
        hollow: {
          margin: 0,
        },
        dataLabels: {
          name: {
            show: false,
          },
          value: {
            offsetY: -2,
            fontSize: '22px',
          },
        },
      },
    },
  };

  return (
    <div className={classes(css.outerContainer)}>
      <span className={classes(css.header)}>
        <Trans i18nKey="Roadmap completion" />
      </span>
      <Chart
        options={options}
        type="radialBar"
        series={[getCompletionPercent()]}
        width="250"
      />
      <span className={classes(css.completedtasks)}>
        {currentRoadmap!.tasks.filter((task) => task.completed).length}
      </span>
      <span className={classes(css.notcompletedtasks)}>
        {currentRoadmap!.tasks.filter((task) => !task.completed).length}
      </span>
    </div>
  );
};
