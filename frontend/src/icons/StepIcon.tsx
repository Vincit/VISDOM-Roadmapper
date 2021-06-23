import React from 'react';
import CheckSharpIcon from '@material-ui/icons/CheckSharp';
import CachedSharpIcon from '@material-ui/icons/CachedSharp';
import ScheduleSharpIcon from '@material-ui/icons/ScheduleSharp';
import classNames from 'classnames';
import css from './StepIcon.module.scss';

const classes = classNames.bind(css);

export const StepIcon: React.FC<{
  currentStepDifference: number;
}> = ({ currentStepDifference }) => (
  <div
    className={classes(css.circle, {
      [css.done]: currentStepDifference < 0,
      [css.disabled]: currentStepDifference > 0,
    })}
  >
    {currentStepDifference < 0 && (
      <CheckSharpIcon className={classes(css.icon)} />
    )}
    {currentStepDifference === 0 && (
      <CachedSharpIcon className={classes(css.icon)} />
    )}
    {currentStepDifference > 0 && (
      <ScheduleSharpIcon className={classes(css.icon)} />
    )}
  </div>
);
