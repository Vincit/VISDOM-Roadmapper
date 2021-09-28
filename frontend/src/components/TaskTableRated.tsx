import { useRef } from 'react';
import classNames from 'classnames';
import { Link, useLocation } from 'react-router-dom';
import ArrowForwardIcon from '@material-ui/icons/ArrowForward';
import DoneAllIcon from '@material-ui/icons/DoneAll';
import { Trans } from 'react-i18next';
import { SortingTypes, valueAndWorkSummary } from '../utils/TaskUtils';
import { taskTable, TaskRow } from './TaskTable';
import css from './TaskTable.module.scss';

const classes = classNames.bind(css);

const numFormat = new Intl.NumberFormat(undefined, {
  minimumFractionDigits: 0,
  maximumFractionDigits: 1,
});

const TableRatedTaskRow: TaskRow = ({ task, style }) => {
  const { value, work } = valueAndWorkSummary(task);
  const ref = useRef<HTMLDivElement | null>(null);
  const currentLocation = useLocation();
  const names = classes(css.hoverRow).split(/ +/);
  return (
    <div
      ref={ref}
      style={style}
      className={classes(css.taskTableRow, {
        [css.completedRow]: task.completed,
      })}
    >
      <div className={classes(css.ratedTitle)}>
        {task.completed && <DoneAllIcon className={classes(css.doneIcon)} />}
        {task.name}
      </div>
      <div>{numFormat.format(value.avg)}</div>
      <div>{numFormat.format(work.avg)}</div>
      <div>{numFormat.format(value.total)}</div>
      <div>{numFormat.format(work.total)}</div>
      <div>
        {task.completed ? (
          <span className={classes(css.statusComplete)}>
            <Trans i18nKey="Completed" />
          </span>
        ) : (
          <span className={classes(css.statusUnordered)}>
            <Trans i18nKey="Unordered" />
          </span>
        )}
      </div>
      <div className={classes(css.ratedButtons)}>
        <Link
          className={classes(css.navBarLink)}
          to={`${currentLocation.pathname}/${task.id}`}
        >
          <ArrowForwardIcon
            onMouseEnter={() => ref.current?.classList.add(...names)}
            onMouseLeave={() => ref.current?.classList.remove(...names)}
            className={classes(css.arrowIcon)}
          />
        </Link>
      </div>
    </div>
  );
};

export const TaskTableRated = taskTable({
  title: 'Rated tasks',
  Row: TableRatedTaskRow,
  header: [
    {
      label: 'Task title',
      width: '2fr',
      sorting: SortingTypes.SORT_NAME,
      textAlign: 'center',
    },
    { label: 'Average value', sorting: SortingTypes.SORT_AVG_VALUE },
    { label: 'Average work', sorting: SortingTypes.SORT_AVG_WORK },
    { label: 'Total value', sorting: SortingTypes.SORT_TOTAL_VALUE },
    { label: 'Total work', sorting: SortingTypes.SORT_TOTAL_WORK },
    { label: 'Status', sorting: SortingTypes.SORT_STATUS },
    { label: '', width: '0.5fr' },
  ],
});
