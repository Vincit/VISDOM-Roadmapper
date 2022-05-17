import { CSSProperties, FC, forwardRef } from 'react';
import { Link } from 'react-router-dom';
import classNames from 'classnames';
import { Draggable, DraggableProvided } from 'react-beautiful-dnd';
import InfoIcon from '@mui/icons-material/InfoOutlined';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import { Trans } from 'react-i18next';
import { ReactComponent as AlertIcon } from '../icons/alert-exclamation-mark.svg';
import { RelationIcon } from './RelationIcon';
import { Task, TaskRelation } from '../redux/roadmaps/types';
import {
  TaskRelationTableType,
  RelationAnnotation,
} from '../utils/TaskRelationUtils';
import { taskRatingsCustomerStakes } from '../utils/TaskUtils';
import { ModalTypes, modalDrawerLink } from './modals/types';
import { TaskRatingsText } from './TaskRatingsText';
import { InfoTooltip } from './InfoTooltip';
import { Dot } from './Dot';
import { apiV2 } from '../api/api';
import css from './SortableTask.module.scss';

const classes = classNames.bind(css);

interface TaskProps {
  task: Task & Partial<RelationAnnotation>;
  height?: number;
  showRatings: boolean;
  showInfoIcon: boolean;
  hideDragIndicator?: boolean;
  provided?: DraggableProvided;
  style?: CSSProperties;
  className?: string;
}

const numFormat = new Intl.NumberFormat(undefined, {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

const TaskDetailsTooltip: FC<{ task: Task }> = ({ task }) => {
  const { data: customers } = apiV2.useGetCustomersQuery(task.roadmapId);
  const customerValues = taskRatingsCustomerStakes(customers)(new Map(), task);
  return (
    <div className={classes(css.taskDetailsTooltip)}>
      <div className={classes(css.title)}>
        <Trans i18nKey="Average values" />
      </div>
      <TaskRatingsText task={task} />
      <div className={classes(css.customerValues)}>
        {Array.from(customerValues).map(([{ id, color }, { avg }]) => (
          <div key={id} className={classes(css.taskRating)}>
            <Dot fill={color} />
            {numFormat.format(avg)}
          </div>
        ))}
      </div>
    </div>
  );
};

const UnmetDependencyTooltip = (payload: {
  taskId: number;
  badRelations: TaskRelation[];
}) => (
  <div className={classes(css.dependencyTooltip)}>
    <AlertIcon />
    <div>
      <p>Unmet dependency order</p>
      <Link
        className="green"
        to={modalDrawerLink(ModalTypes.RELATIONS_MODAL, payload)}
      >
        Show relations
      </Link>
    </div>
  </div>
);

const RelationIndicator: FC<{ task: TaskProps['task'] }> = ({
  task: { id, relation, badRelations },
}) => {
  if (relation === null) return null;

  if (relation !== undefined) {
    const isBadRelation = badRelations?.some(
      ({ from, to }) =>
        (from === id && relation === TaskRelationTableType.Requires) ||
        (to === id && relation === TaskRelationTableType.Precedes),
    );
    return <RelationIcon size={17} type={relation} incorrect={isBadRelation} />;
  }

  if (!badRelations?.length) return null;

  return (
    <InfoTooltip
      title={<UnmetDependencyTooltip taskId={id} badRelations={badRelations} />}
    >
      <div>
        <RelationIcon
          incorrect
          size={17}
          type={
            badRelations.some(({ from }) => from === id)
              ? TaskRelationTableType.Requires
              : TaskRelationTableType.Precedes
          }
        />
      </div>
    </InfoTooltip>
  );
};

export const StaticTask = forwardRef<HTMLDivElement, TaskProps>(
  (
    {
      task,
      showRatings,
      showInfoIcon,
      hideDragIndicator,
      provided,
      style,
      className,
      height,
    },
    ref,
  ) => (
    <div
      className={classes(css.taskDiv, className)}
      ref={provided?.innerRef}
      {...provided?.draggableProps}
      {...provided?.dragHandleProps}
      style={{ ...provided?.draggableProps.style, ...style, height }}
    >
      <div className={css.leftSideDiv} ref={ref}>
        {task.name}
      </div>
      <div className={css.rightSideDiv}>
        <RelationIndicator task={task} />
        {showInfoIcon && (
          <InfoTooltip title={<TaskDetailsTooltip task={task} />}>
            <InfoIcon className={classes(css.tooltipGray, css.infoIcon)} />
          </InfoTooltip>
        )}
        {showRatings && <TaskRatingsText task={task} />}
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
