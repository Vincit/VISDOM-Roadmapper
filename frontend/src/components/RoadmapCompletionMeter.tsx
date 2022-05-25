import classNames from 'classnames';
import Chart from 'react-apexcharts';
import { Trans } from 'react-i18next';
import { useSelector } from 'react-redux';
import { skipToken } from '@reduxjs/toolkit/query/react';
import { chosenRoadmapIdSelector } from '../redux/roadmaps/selectors';
import { partition } from '../utils/array';
import { completed as isCompleted } from '../utils/TaskUtils';
import css from './RoadmapCompletionMeter.module.scss';
import { apiV2 } from '../api/api';

const classes = classNames.bind(css);

export const RoadmapCompletionMeter = () => {
  const roadmapId = useSelector(chosenRoadmapIdSelector);
  const { data: tasks } = apiV2.useGetTasksQuery(roadmapId ?? skipToken);

  const [completed, uncompleted] = partition(tasks ?? [], isCompleted).map(
    (a) => a.length,
  );

  const getCompletionPercent = () => {
    const total = completed + uncompleted;
    return total === 0 ? 0 : Math.round((completed / total) * 100);
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
    states: {
      active: {
        filter: {
          type: 'none',
        },
      },
      hover: {
        filter: {
          type: 'none',
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
      <span className={classes(css.completedtasks)}>{completed}</span>
      <span className={classes(css.notcompletedtasks)}>{uncompleted}</span>
    </div>
  );
};
