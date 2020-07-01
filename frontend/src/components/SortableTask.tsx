import React from 'react';
import { Draggable } from 'react-beautiful-dnd';
import { StarFill, Wrench } from 'react-bootstrap-icons';
import styled from 'styled-components';
import { Task, TaskRatingDimension } from '../redux/roadmaps/types';
import { calcTaskAverageRating } from '../utils/TaskUtils';

const TaskDiv = styled.div<{ loadingCursor?: boolean }>`
  border: 1px solid black;
  padding: 5px;
  margin-bottom: 5px;
  background-color: white !important;
  user-select: none;
  cursor: ${(props) => (props.loadingCursor ? 'wait !important' : 'auto')};
`;

const Styles = styled.div`
  .icon {
    height: 0.9em;
    width: 0.9em;
    position: relative;
    top: -0.125em;
  }
  .aligncenter {
    vertical-align: middle;
  }
`;

const renderTaskRatings = (task: Task) => {
  const averageBusinessVal = calcTaskAverageRating(
    TaskRatingDimension.BusinessValue,
    task,
  );
  const averageWorkVal = calcTaskAverageRating(
    TaskRatingDimension.RequiredWork,
    task,
  );
  const renderBusinessVal = averageBusinessVal >= 0;
  const renderWorkVal = averageWorkVal >= 0;
  return (
    <>
      {renderBusinessVal && (
        <span className="m-1 aligncenter">
          <StarFill className="icon" />
          {averageBusinessVal}
        </span>
      )}
      {renderWorkVal && (
        <span
          className={
            renderBusinessVal ? 'm-1 ml-2 aligncenter' : 'm-1 aligncenter'
          }
        >
          <Wrench className="icon" />
          {averageWorkVal}
        </span>
      )}
      {!renderWorkVal && !renderBusinessVal && <span>-</span>}
    </>
  );
};

export const SortableTask: React.FC<{
  task: Task;
  index: number;
  disableDragging: boolean;
}> = ({ task, index, disableDragging }) => {
  return (
    <Draggable
      key={task.id}
      draggableId={`${task.id}`}
      index={index}
      isDragDisabled={disableDragging}
    >
      {(provided) => (
        <Styles>
          <TaskDiv
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
          >
            <div className="text-left aligncenter">{task.name}</div>
            <div className="text-left aligncenter">
              {renderTaskRatings(task)}
            </div>
          </TaskDiv>
        </Styles>
      )}
    </Draggable>
  );
};
