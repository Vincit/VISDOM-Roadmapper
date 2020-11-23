/* eslint-disable no-bitwise */
import React from 'react';
import { shallowEqual, useSelector } from 'react-redux';
import styled from 'styled-components';
import { chosenRoadmapSelector } from '../redux/roadmaps/selectors';
import { Roadmap, TaskRatingDimension } from '../redux/roadmaps/types';
import { RootState } from '../redux/types';
import { calcTaskAverageRating } from '../utils/TaskUtils';

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

const Tile = styled.div<{ value: number }>`
  display: inline-block;
  background-color: ${({ value }) => {
    if (value === 0) return '#fffffb';
    return lerpColor('#edf723', '#ff5555', Math.min(value / 15, 1));
  }};

  width: 30px;
  height: 30px;
  border: 0;
  margin: 0;
  padding: 0;
  text-align: center;
`;

const Row = styled.div`
  margin: 0;
  padding: 0;
  border: 0;
  font-size: 0;
`;

const OuterContainer = styled.div`
  display: inline-block;
  border-radius: 16px;
  padding-left: 16px;
  padding-top: 16px;
  background-color: rgb(247, 247, 247);
  min-width: 386px;
  min-height: 423px;
  text-align: start;

  .xaxismin {
    font-family: IBM Plex Mono;
    position: relative;
    left: 2px;
    display: inline-block;
    width: 0;
  }
  .xaxismax {
    font-family: IBM Plex Mono;
    position: relative;
    display: inline-block;
    width: 0;
    left: 310px;
  }
  .xaxislabel {
    position: relative;
    left: 145px;
    display: inline-block;
    width: 0;
    font-weight: 600;
  }
`;

const GraphicsContainer = styled.div`
  display: inline-block;
  border: 1px solid rgba(0, 0, 0, 0.2);
`;

const GraphicsFlexbox = styled.div`
  display: flex;
  .yaxislabel {
    position: relative;
    top: 7px;
    right: 7px;
    align-self: center;
    transform: rotate(-90deg);
    font-weight: 600;
  }
  .yaxismax {
    font-family: IBM Plex Mono;
    position: relative;
    left: 5px;
    width: 0;
    height: 0;
  }
  .yaxismin {
    font-family: IBM Plex Mono;
    align-self: flex-end;
    position: relative;
    left: 5px;
    bottom: 5px;
    width: 0;
    height: 0;
  }
`;

interface DataPoint {
  xVal: number;
  yVal: number;
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
    currentRoadmap!.tasks
      .filter(
        // Filter only tasks that have ratings
        (task) =>
          task.ratings.find(
            (rating) => rating.dimension === TaskRatingDimension.BusinessValue,
          ) &&
          task.ratings.find(
            (rating) => rating.dimension === TaskRatingDimension.RequiredWork,
          ),
      )
      .forEach((task) => {
        const avgValue = Math.round(
          calcTaskAverageRating(TaskRatingDimension.BusinessValue, task)!,
        );
        const avgWork = Math.round(
          calcTaskAverageRating(TaskRatingDimension.RequiredWork, task)!,
        );
        frequencies[10 - avgValue][avgWork] += 1;
      });
    return frequencies;
  };
  const frequencies = tasksToDatapoints();

  return (
    <OuterContainer>
      <p>Task heatmap</p>
      <GraphicsFlexbox>
        <GraphicsContainer>
          {frequencies.map((row, i) => (
            <Row key={i}>
              {row.map((value, ii) => (
                <Tile value={value} key={ii} />
              ))}
            </Row>
          ))}
        </GraphicsContainer>
        <p className="yaxismax">10</p>
        <p className="yaxismin">0</p>
        <p className="yaxislabel">Value</p>
      </GraphicsFlexbox>
      <p className="xaxismin">0</p>
      <p className="xaxislabel">Work</p>
      <p className="xaxismax">10</p>
    </OuterContainer>
  );
};
