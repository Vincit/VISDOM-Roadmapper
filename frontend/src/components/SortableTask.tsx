import { CSSProperties, FC, forwardRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import classNames from 'classnames';
import { Draggable, DraggableProvided } from 'react-beautiful-dnd';
import InfoIcon from '@mui/icons-material/InfoOutlined';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import { Trans } from 'react-i18next';
import { ReactComponent as AlertIcon } from '../icons/alert-exclamation-mark.svg';
import { RelationIcon } from './RelationIcon';
import { CustomerStakes, Task, TaskRelation } from '../redux/roadmaps/types';
import {
  TaskRelationTableType,
  RelationAnnotation,
} from '../utils/TaskRelationUtils';
import { ratingSummary, customerStakes } from '../utils/TaskUtils';
import { ModalTypes, modalDrawerLink } from './modals/types';
import { TaskRatingsText } from './TaskRatingsText';
import { InfoTooltip } from './InfoTooltip';
import { Dot } from './Dot';
import { apiV2 } from '../api/api';
import css from './SortableTask.module.scss';
import { CustomerStakesVisualization } from './CustomerStakesVisualization';
import { convertScale } from '../../../shared/utils/conversion';

const classes = classNames.bind(css);

interface TaskProps {
  task: Task & Partial<RelationAnnotation>;
  height?: number;
  showRatings: boolean;
  showInfoIcon: boolean;
  showShares: boolean;
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
  const { valueForCustomer } = ratingSummary(task);
  const { data: customers } = apiV2.useGetCustomersQuery(task.roadmapId);
  const customerValues = customerStakes(valueForCustomer, customers ?? []);
  return (
    <div className={classes(css.taskDetailsTooltip)}>
      <div className={classes(css.title)}>
        <Trans i18nKey="Average values" />
      </div>
      <TaskRatingsText task={task} />
      <div className={classes(css.customerValues)}>
        {customerValues.map(([{ id, color }, value]) => (
          <div key={id} className={classes(css.taskRating)}>
            <Dot fill={color} />
            {numFormat.format(value)}
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
      showShares,
      hideDragIndicator,
      provided,
      style,
      className,
      height,
    },
    ref,
  ) => {
    const { data: customers } = apiV2.useGetCustomersQuery(task.roadmapId);
    const [data, setData] = useState<CustomerStakes[]>([]);
    const [totalValue, setTotalValue] = useState(0);
    const maxValue = (customers?.length || 0) * convertScale(5);
    const valueWidth = (totalValue / maxValue) * 100;

    useEffect(() => {
      if (!customers) return;
      const { valueForCustomer, value: taskValue } = ratingSummary(task);
      setTotalValue(taskValue().total);
      setData(
        customerStakes(valueForCustomer, customers ?? [])
          .sort(([a], [b]) => b.weight - a.weight)
          .map(([{ id, name, color }, value]) => ({
            id,
            name,
            value,
            color,
          })),
      );
    }, [task, customers]);

    return (
      <div
        className={classes(css.taskDiv, className)}
        ref={provided?.innerRef}
        {...provided?.draggableProps}
        {...provided?.dragHandleProps}
        style={{ ...provided?.draggableProps.style, ...style, height }}
      >
        <div className={classes(css.innerDiv)}>
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
        {showShares && totalValue > 0 && (
          <div
            className={classes(css.shares)}
            style={{ width: `${valueWidth}%` }}
          >
            <CustomerStakesVisualization
              customerStakes={data}
              totalValue={totalValue}
              barWidth={10}
              noTooltip
            />
          </div>
        )}
      </div>
    );
  },
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
