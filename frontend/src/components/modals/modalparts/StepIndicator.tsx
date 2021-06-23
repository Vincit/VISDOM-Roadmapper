import React from 'react';
import { Trans } from 'react-i18next';
import classNames from 'classnames';
import { StepIcon } from '../../../icons/StepIcon';
import css from './StepIndicator.module.scss';

const classes = classNames.bind(css);

interface StepIndicatorProps {
  step: number;
  currentStepDifference: number;
  description: string;
  onClick?: () => void;
}

const StepIndicatorContent: React.FC<StepIndicatorProps> = ({
  step,
  currentStepDifference,
  description,
}) => (
  <>
    <div className={classes(css.topStepRow)}>
      <StepIcon currentStepDifference={currentStepDifference} />
      {step !== 3 && (
        <div
          className={classes(css.line, {
            [css.done]: currentStepDifference < 0,
            [css.disabled]: currentStepDifference > 0,
          })}
        />
      )}
    </div>
    <div
      className={classes(css.bottomStepRow, {
        [css.disabled]: currentStepDifference > 0,
      })}
    >
      <div className={classes(css.stepLabel)}>Step {step}</div>
      <Trans i18nKey={description} />
    </div>
  </>
);

export const StepIndicator: React.FC<StepIndicatorProps> = ({
  step,
  currentStepDifference,
  description,
  onClick,
}) => {
  if (currentStepDifference < 0)
    return (
      <div onClick={onClick} onKeyPress={onClick} role="button" tabIndex={0}>
        <StepIndicatorContent
          step={step}
          currentStepDifference={currentStepDifference}
          description={description}
        />
      </div>
    );
  return (
    <div>
      <StepIndicatorContent
        step={step}
        currentStepDifference={currentStepDifference}
        description={description}
      />
    </div>
  );
};
