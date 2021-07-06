import React, { useState } from 'react';
import classNames from 'classnames';
import { Link } from 'react-router-dom';
import ArrowForwardIcon from '@material-ui/icons/ArrowForward';
import DoneAllIcon from '@material-ui/icons/DoneAll';
import { Task } from '../redux/roadmaps/types';
import css from './TableRatedTaskRow.module.scss';
import { paths } from '../routers/paths';
import {
  calcTaskValueSum,
  calcAverageTaskValue,
  calcTaskWorkSum,
  calcAverageTaskWork,
} from '../utils/TaskUtils';

const classes = classNames.bind(css);

interface TableTaskRowRatedProps {
  task: Task;
}

export const TableRatedTaskRow: React.FC<TableTaskRowRatedProps> = ({
  task,
}) => {
  const [hovered, setHovered] = useState(false);
  return (
    <tr
      className={classNames(
        css.tableRow,
        hovered ? css.hoverRow : '',
        task.completed ? css.completedRow : '',
      )}
    >
      <td className={`styledTd ${classes(css.ratedTitle)}`}>
        {task.completed && <DoneAllIcon className={classes(css.doneIcon)} />}
        {task.name}
      </td>
      <td className={`styledTd ${classes(css.ratedTd)}`}>
        {Math.round(calcAverageTaskValue(task) * 10 || 0) / 10}
      </td>
      <td className={`styledTd ${classes(css.ratedTd)}`}>
        {Math.round(calcAverageTaskWork(task) * 10 || 0) / 10}
      </td>
      <td className={`styledTd ${classes(css.ratedTd)}`}>
        {Math.round(calcTaskValueSum(task) * 10 || 0) / 10}
      </td>
      <td className={`styledTd ${classes(css.ratedTd)}`}>
        {Math.round(calcTaskWorkSum(task) * 10 || 0) / 10}
      </td>
      <td className={`styledTd ${classes(css.ratedTd)}`}>
        {task.completed ? (
          <p className={`typography-pre-title ${classes(css.statusComplete)}`}>
            Completed
          </p>
        ) : (
          <p className={`typography-pre-title ${classes(css.statusUnordered)}`}>
            Unordered
          </p>
        )}
      </td>
      <td className={`styledTd textAlignEnd ${classes(css.ratedButtons)}`}>
        <div className={classes(css.buttonWrapper)}>
          {/* To do: Component for single task and path for it */}
          <Link
            className={classes(css.navBarLink)}
            to={paths.roadmapRelative.home}
          >
            <ArrowForwardIcon
              onMouseEnter={() => setHovered(true)}
              onMouseLeave={() => setHovered(false)}
              className={classNames(
                css.arrowIcon,
                hovered ? css.hoverIcon : '',
              )}
            />
          </Link>
        </div>
      </td>
    </tr>
  );
};
