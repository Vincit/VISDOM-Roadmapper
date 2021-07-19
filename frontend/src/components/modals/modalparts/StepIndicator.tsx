import React from 'react';
import { Trans } from 'react-i18next';
import classNames from 'classnames';
import CheckSharpIcon from '@material-ui/icons/CheckSharp';
import CachedSharpIcon from '@material-ui/icons/CachedSharp';
import ScheduleSharpIcon from '@material-ui/icons/ScheduleSharp';
import css from './StepIndicator.module.scss';

const classes = classNames.bind(css);

enum IndicatorState {
  pastStep = -1,
  activeStep = 0,
  upcomingStep = 1,
}

const getIndicatorState = (step: number, currentStep: number) => {
  const difference = step - currentStep;
  if (difference <= IndicatorState.pastStep) return IndicatorState.pastStep;
  if (difference >= IndicatorState.upcomingStep)
    return IndicatorState.upcomingStep;
  return IndicatorState.activeStep;
};

const StepIcon: React.FC<{
  state: IndicatorState;
}> = ({ state }) => (
  <div className={classes(css.circle)}>
    {state === IndicatorState.pastStep && (
      <CheckSharpIcon className={classes(css.icon)} />
    )}
    {state === IndicatorState.activeStep && (
      <CachedSharpIcon className={classes(css.icon)} />
    )}
    {state === IndicatorState.upcomingStep && (
      <ScheduleSharpIcon className={classes(css.icon)} />
    )}
  </div>
);

export const StepIndicator: React.FC<{
  step: number;
  currentStep: number;
  maxStep: number;
  description: string;
  onClick?: () => void;
}> = ({ step, currentStep, maxStep, description, onClick }) => {
  const state = getIndicatorState(step, currentStep);

  const content = (
    <>
      <div className={classes(css.topStepRow)}>
        <StepIcon state={state} />
        {step !== maxStep && <div className={classes(css.line)} />}
      </div>
      <div className={classes(css.bottomStepRow)}>
        <div className={classes(css.stepLabel)}>Step {step}</div>
        <Trans i18nKey={description} />
      </div>
    </>
  );

  if (state === IndicatorState.pastStep)
    return (
      <div
        onClick={onClick}
        onKeyPress={onClick}
        className={classes(css.stepIndicator, css.past)}
        role="button"
        tabIndex={0}
      >
        {content}
      </div>
    );
  return (
    <div
      className={classes(css.stepIndicator, {
        [css.upcoming]: state === IndicatorState.upcomingStep,
      })}
    >
      {content}
    </div>
  );
};
