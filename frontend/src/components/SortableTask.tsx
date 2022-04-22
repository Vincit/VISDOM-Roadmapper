import { CSSProperties, FC, forwardRef } from 'react';
import classNames from 'classnames';
import { Draggable, DraggableProvided } from 'react-beautiful-dnd';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import { ReactComponent as AlertIcon } from '../icons/alert-exclamation-mark.svg';
import { RelationIcon } from './RelationIcon';
import { Task, TaskRelation } from '../redux/roadmaps/types';
import { TaskRelationTableType } from '../utils/TaskRelationUtils';
import { TaskRatingsText } from './TaskRatingsText';
import { InfoTooltip } from './InfoTooltip';
import css from './SortableTask.module.scss';

const classes = classNames.bind(css);

interface TaskProps {
  task: Task & { badRelations?: TaskRelation[] };
  showRatings: boolean;
  hideDragIndicator?: boolean;
  provided?: DraggableProvided;
  style?: CSSProperties;
  className?: string;
}

const UnmetDependencyTooltip = () => (
  <div className={classes(css.dependencyTooltip)}>
    <AlertIcon />
    <div>
      <p>Unmet dependency order</p>
      {/* TODO: link to show relations */}
      <a className="green" href="#todo">
        Show relations
      </a>
    </div>
  </div>
);

export const StaticTask = forwardRef<HTMLDivElement, TaskProps>(
  (
    { task, showRatings, hideDragIndicator, provided, style, className },
    ref,
  ) => (
    <div
      className={classes(css.taskDiv, className)}
      ref={provided?.innerRef}
      {...provided?.draggableProps}
      {...provided?.dragHandleProps}
      style={{ ...provided?.draggableProps.style, ...style }}
    >
      <div className={css.leftSideDiv} ref={ref}>
        {task.name}
      </div>
      <div className={css.rightSideDiv}>
        {showRatings && <TaskRatingsText task={task} />}
        {!!task.badRelations?.length && (
          <InfoTooltip title={<UnmetDependencyTooltip />}>
            <div>
              <RelationIcon
                incorrect
                size={17}
                type={
                  task.badRelations.some(({ from }) => from === task.id)
                    ? TaskRelationTableType.Requires
                    : TaskRelationTableType.Precedes
                }
              />
            </div>
          </InfoTooltip>
        )}
        {!hideDragIndicator && <DragIndicatorIcon fontSize="small" />}
      </div>
    </div>
  ),
);

export const SortableTask: FC<
  {
    task: Task;
    index: number;
    disableDragging: boolean;
  } & Omit<TaskProps, 'task' | 'provided'>
> = ({ task, index, disableDragging, children, ...rest }) => (
  <Draggable
    key={task.id}
    draggableId={`${task.id}`}
    index={index}
    isDragDisabled={disableDragging}
  >
    {(provided) => <StaticTask task={task} provided={provided} {...rest} />}
  </Draggable>
);
