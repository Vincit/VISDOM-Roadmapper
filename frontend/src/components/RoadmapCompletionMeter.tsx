/* eslint-disable no-bitwise */
import React from 'react';
import Chart from 'react-apexcharts';
import { Trans } from 'react-i18next';
import { shallowEqual, useSelector } from 'react-redux';
import styled from 'styled-components';
import { chosenRoadmapSelector } from '../redux/roadmaps/selectors';
import { Roadmap } from '../redux/roadmaps/types';
import { RootState } from '../redux/types';

const OuterContainer = styled.div`
  display: inline-block;
  border-radius: 16px;
  padding-top: 16px;
  padding-bottom: 16px;
  height: 180px;
  background-color: rgb(247, 247, 247);
  text-align: start;
  .header {
    margin-left: 16px;
  }
  .completedtasks {
    font-size: 12px;
    position: absolute;
    left: 63px;
    top: 142px;
    font-weight: 600;
    color: #777777;
  }

  .notcompletedtasks {
    font-size: 12px;
    position: absolute;
    left: 182px;
    top: 142px;
    font-weight: 600;
    color: #777777;
  }
`;

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
    <OuterContainer>
      <span className="header">
        <Trans i18nKey="Roadmap completion" />
      </span>
      <Chart
        options={options}
        type="radialBar"
        series={[getCompletionPercent()]}
        width="250"
      />
      <span className="completedtasks">
        {currentRoadmap!.tasks.filter((task) => task.completed).length}
      </span>
      <span className="notcompletedtasks">
        {currentRoadmap!.tasks.filter((task) => !task.completed).length}
      </span>
    </OuterContainer>
  );
};
