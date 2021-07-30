import { FC, useState } from 'react';
import classNames from 'classnames';
import { Link } from 'react-router-dom';
import ArrowForwardIcon from '@material-ui/icons/ArrowForward';
import DoneAllIcon from '@material-ui/icons/DoneAll';
import { Trans } from 'react-i18next';
import { Task } from '../redux/roadmaps/types';
import css from './TableRatedTaskRow.module.scss';
import { paths } from '../routers/paths';
import { valueAndWorkSummary } from '../utils/TaskUtils';

const classes = classNames.bind(css);

interface TableTaskRowRatedProps {
  task: Task;
}

export const TableRatedTaskRow: FC<TableTaskRowRatedProps> = ({ task }) => {
  const [hovered, setHovered] = useState(false);
  const { value, work } = valueAndWorkSummary(task);

  const numFormat = new Intl.NumberFormat(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  });

  return (
    <tr
      className={classes(css.tableRow, {
        [css.hoverRow]: hovered,
        [css.completedRow]: task.completed,
      })}
    >
      <td className={classes(css.ratedTitle)}>
        {task.completed && <DoneAllIcon className={classes(css.doneIcon)} />}
        {task.name}
      </td>
      <td className={classes(css.ratedTd)}>{numFormat.format(value.avg)}</td>
      <td className={classes(css.ratedTd)}>{numFormat.format(work.avg)}</td>
      <td className={classes(css.ratedTd)}>{numFormat.format(value.total)}</td>
      <td className={classes(css.ratedTd)}>{numFormat.format(work.total)}</td>
      <td className={classes(css.ratedTd)}>
        {task.completed ? (
          <p className={classes(css.statusComplete)}>
            <Trans i18nKey="Completed" />
          </p>
        ) : (
          <p className={classes(css.statusUnordered)}>
            <Trans i18nKey="Unordered" />
          </p>
        )}
      </td>
      <td className={classes(css.ratedButtons)}>
        <div className={classes(css.buttonWrapper)}>
          {/* To do: Component for single task and path for it */}
          <Link
            className={classes(css.navBarLink)}
            to={paths.roadmapRelative.home}
          >
            <ArrowForwardIcon
              onMouseEnter={() => setHovered(true)}
              onMouseLeave={() => setHovered(false)}
              className={classNames(css.arrowIcon, {
                [css.hoverIcon]: hovered,
              })}
            />
          </Link>
        </div>
      </td>
    </tr>
  );
};
