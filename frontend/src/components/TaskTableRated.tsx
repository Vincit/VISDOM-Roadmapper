import classNames from 'classnames';
import { Link, useLocation } from 'react-router-dom';
import ArrowForwardIcon from '@material-ui/icons/ArrowForward';
import DoneAllIcon from '@material-ui/icons/DoneAll';
import { Trans } from 'react-i18next';
import InfoIcon from '@material-ui/icons/InfoOutlined';
import { InfoTooltip } from './InfoTooltip';
import { Task } from '../redux/roadmaps/types';
import {
  SortingTypes,
  valueAndWorkSummary,
  taskSort,
} from '../utils/TaskUtils';
import { table, TableRow } from './Table';
import css from './TaskTable.module.scss';

const classes = classNames.bind(css);

const numFormat = new Intl.NumberFormat(undefined, {
  minimumFractionDigits: 0,
  maximumFractionDigits: 1,
});

const TableRatedTaskRow: TableRow<Task> = ({ item: task, style }) => {
  const { value, work } = valueAndWorkSummary(task);
  const currentLocation = useLocation();
  return (
    <Link
      className={classes(css.navBarLink, css.hoverRow)}
      to={`${currentLocation.pathname}/${task.id}`}
    >
      <div
        style={style}
        className={classes(css.virtualizedTableRow, {
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
          <ArrowForwardIcon className={classes(css.arrowIcon)} />
        </div>
      </div>
    </Link>
  );
};

export const TaskTableRated = table({
  Title: ({ count }) => (
    <>
      <h2 className={classes(css.title)}>
        <Trans i18nKey="Rated tasks" /> ({count})
      </h2>
      <InfoTooltip title={<Trans i18nKey="tooltipMessage" />}>
        <InfoIcon className={classes(css.tooltipIcon)} />
      </InfoTooltip>
    </>
  ),
  Row: TableRatedTaskRow,
  getSort: taskSort,
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
