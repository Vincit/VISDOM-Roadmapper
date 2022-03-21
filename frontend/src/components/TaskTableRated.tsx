import classNames from 'classnames';
import { Link } from 'react-router-dom';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import { Trans } from 'react-i18next';
import { MouseEvent } from 'react';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import { Task } from '../redux/roadmaps/types';
import {
  SortingTypes,
  valueAndComplexitySummary,
  taskSort,
  taskStatusToText,
} from '../utils/TaskUtils';
import { table, TableRow } from './Table';
import css from './TaskTable.module.scss';
import { paths } from '../routers/paths';
import { DeleteButton } from './forms/SvgButton';
import { StoreDispatchType } from '../redux';
import { modalsActions } from '../redux/modals';
import { ModalTypes } from './modals/types';
import { RoleType, TaskStatus } from '../../../shared/types/customTypes';
import { userRoleSelector } from '../redux/user/selectors';

const classes = classNames.bind(css);

const numFormat = new Intl.NumberFormat(undefined, {
  minimumFractionDigits: 0,
  maximumFractionDigits: 1,
});

const TableRatedTaskRow: TableRow<Task> = ({ item: task, style }) => {
  const dispatch = useDispatch<StoreDispatchType>();
  const { value, complexity } = valueAndComplexitySummary(task);
  const type = useSelector(userRoleSelector, shallowEqual);

  const handleTaskDelete = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(
      modalsActions.showModal({
        modalType: ModalTypes.REMOVE_TASK_MODAL,
        modalProps: {
          task,
        },
      }),
    );
  };

  return (
    <Link
      className={classes(css.navBarLink, css.hoverRow)}
      to={`${paths.roadmapHome}/${task.roadmapId}${paths.roadmapRelative.tasks}/${task.id}`}
    >
      <div
        style={style}
        className={classes(css.virtualizedTableRow, {
          [css.completedRow]: task.status === TaskStatus.COMPLETED,
        })}
      >
        <div className={classes(css.ratedTitle)}>
          {task.status === TaskStatus.COMPLETED && (
            <DoneAllIcon className={classes(css.doneIcon)} />
          )}
          {task.name}
        </div>
        <div>{numFormat.format(value.avg)}</div>
        <div>{numFormat.format(complexity.avg)}</div>
        <div>{numFormat.format(value.total)}</div>
        <div>{numFormat.format(complexity.total)}</div>
        <div>
          <span className={classes(css[TaskStatus[task.status]])}>
            <Trans i18nKey={taskStatusToText(task.status)} />
          </span>
        </div>
        <div className={classes(css.ratedButtons)}>
          {type === RoleType.Admin && (
            <DeleteButton onClick={handleTaskDelete} />
          )}
          <ArrowForwardIcon className={classes(css.arrowIcon)} />
        </div>
      </div>
    </Link>
  );
};

export const TaskTableRated = table({
  Title: ({ count }) => (
    <h2 className={classes(css.title)}>
      <Trans i18nKey="Rated tasks" /> ({count})
    </h2>
  ),
  Row: TableRatedTaskRow,
  getSort: taskSort,
  minUnitWidth: 100,
  header: [
    {
      label: 'Task title',
      width: 2,
      sorting: SortingTypes.SORT_NAME,
      textAlign: 'center',
    },
    { label: 'Average value', sorting: SortingTypes.SORT_AVG_VALUE },
    { label: 'Average complexity', sorting: SortingTypes.SORT_AVG_COMPLEXITY },
    { label: 'Total value', sorting: SortingTypes.SORT_TOTAL_VALUE },
    { label: 'Total complexity', sorting: SortingTypes.SORT_TOTAL_COMPLEXITY },
    { label: 'Status', sorting: SortingTypes.SORT_STATUS },
    { label: '' },
  ],
});
