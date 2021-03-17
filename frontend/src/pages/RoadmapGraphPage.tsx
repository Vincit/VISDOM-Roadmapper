import React, { useEffect, useState } from 'react';
import { shallowEqual, useSelector } from 'react-redux';
import styled from 'styled-components';
import { StarFill, Wrench, List } from 'react-bootstrap-icons';
import { chosenRoadmapSelector } from '../redux/roadmaps/selectors';
import { Roadmap } from '../redux/roadmaps/types';
import { RootState } from '../redux/types';
import { roadmapsVersionsSelector } from '../redux/versions/selectors';
import { Version } from '../redux/versions/types';
import { totalValueAndWork } from '../utils/TaskUtils';
import { TaskValueCreatedVisualization } from '../components/TaskValueCreatedVisualization';

const GraphOuter = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  max-height: 500px;
  min-height: 500px;
  margin-left: 16px;
  overflow-x: auto;
`;

const GraphTitle = styled.p`
  font-size: 28px;
  font-weight: 600;
  text-align: start;
`;

const GraphInner = styled.div`
  display: flex;
  flex-direction: row;
  flex-grow: 1;
  overflow-x: auto;
  border-left: 1px solid gray;
  border-bottom: 1px solid gray;
  justify-content: flex-start;
  align-items: flex-end;
  padding-left: 12px;
  padding-bottom: 12px;
`;

const GraphItems = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: flex-end;
  overflow-x: visible;
`;

const GraphItem = styled.div<{
  width: string;
  height: string;
}>`
  display: flex;
  flex-direction: column;
  width: ${(props) => props.width};
  height: ${(props) => props.height};
  border: 1px solid red;
  overflow-x: visible;
  border-radius: 8px;
  margin-right: 12px;
  padding: 8px;
  background-color: #fbfbfb;
  border: 1px solid #f1f1f1;
  -webkit-box-shadow: 4px 4px 7px -2px rgba(0, 0, 0, 0.35);
  -moz-box-shadow: 4px 4px 7px -2px rgba(0, 0, 0, 0.35);
  box-shadow: 4px 4px 7px -2px rgba(0, 0, 0, 0.35);
  cursor: pointer;
  &:hover {
    background-color: #f2f2f2;
  }

  &:active {
    transform: scale(0.97, 0.97);
  }
  user-select: none;
`;

const Footer = styled.div`
  min-height: 200px;
`;

const VersionData = styled.p`
  font-family: IBM Plex Mono;
  padding: 0;
  margin: 0;
  font-size: 12px;
  text-align: start;
  svg {
    position: relative;
    top: -1px;
    color: #4fbeff;
    margin-right: 2px;
    width: 13px;
    height: 13px;
  }
`;

const VersionTitle = styled(VersionData)`
  font-weight: bold;
  font-size: 14px;
  font-family: unset;
`;

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
      <GraphOuter>
        <GraphTitle>Value / Work</GraphTitle>
        <GraphInner>
          <GraphItems>
            {roadmapsVersions?.map((ver) => {
              const numTasks = ver.tasks.length;
              const versionTasks = ver.tasks.map(
                (taskId) => roadmap!.tasks.find((task) => task.id === taskId)!,
              );
              const { value, work } = totalValueAndWork(versionTasks);
              const w = Math.max(100, 60 * (work / 5));
              const h = Math.max(90, 50 * (value / 5));
              return (
                <GraphItem
                  width={`${w}px`}
                  height={`${h}px`}
                  key={ver.id}
                  onClick={() => setSelectedVersion(ver)}
                >
                  <VersionTitle>{ver.name}</VersionTitle>
                  <VersionData>
                    <StarFill />
                    {value.toLocaleString(undefined, {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 1,
                    })}
                  </VersionData>
                  <VersionData>
                    <Wrench />
                    {work.toLocaleString(undefined, {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 1,
                    })}
                  </VersionData>
                  <VersionData>
                    <List />
                    {numTasks}
                  </VersionData>
                </GraphItem>
              );
            })}
          </GraphItems>
        </GraphInner>
        <p>Total work</p>
      </GraphOuter>

      <Footer>
        <GraphTitle>Customers stakes in milestone</GraphTitle>
        {selectedVersion && (
          <TaskValueCreatedVisualization version={selectedVersion} />
        )}
      </Footer>
    </>
  );
};
