import React, { useState } from 'react';
import { Alert, Form } from 'react-bootstrap';
import { Trans } from 'react-i18next';
import classNames from 'classnames';
import { LoadingSpinner } from '../LoadingSpinner';
import { ModalContent } from '../modals/modalparts/ModalContent';
import { ModalFooter } from '../modals/modalparts/ModalFooter';
import { ModalFooterButtonDiv } from '../modals/modalparts/ModalFooterButtonDiv';
import { ModalHeader } from '../modals/modalparts/ModalHeader';
import { StepIndicator } from '../modals/modalparts/StepIndicator';
import { ReactComponent as AlertIcon } from '../../icons/alert_icon.svg';
import { ReactComponent as CheckIcon } from '../../icons/check_icon.svg';
import css from './StepForm.module.scss';

const classes = classNames.bind(css);

interface Step {
  component: React.FC;
  description: string;
  disabled?: () => boolean;
  noCancelConfirmation?: () => boolean;
}

export const StepForm: React.FC<{
  header: string;
  finishHeader?: string;
  finishMessage: string;
  cancelHeader?: string;
  cancelMessage: string;
  steps: Step[];
  submit: () => Promise<{ message?: string } | undefined>;
  closeModal: (_?: boolean) => void;
}> = ({
  steps,
  closeModal,
  submit,
  header,
  finishHeader = header,
  finishMessage,
  cancelHeader = header,
  cancelMessage,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [step, setStep] = useState(1);
  const [previousStep, setPreviousStep] = useState(0);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    event.stopPropagation();
    switch (step) {
      case 0:
      case steps.length + 1:
        closeModal();
        break;
      case steps.length: {
        setIsLoading(true);
        const err = await submit();
        setIsLoading(false);
        if (err) {
          if (err.message) setErrorMessage(err.message);
          return;
        }
        setStep(step + 1);
        break;
      }
      default:
        setStep(step + 1);
    }
  };

  const handleCancel = () => {
    if (step === 0) {
      setStep(previousStep);
      return;
    }
    if (step === 1) {
      if (steps[0].noCancelConfirmation?.()) closeModal();
      setPreviousStep(step);
    }
    setStep(step - 1);
  };

  const handleCloseButton = () => {
    if (
      step === 0 ||
      step > steps.length ||
      steps[step - 1].noCancelConfirmation?.()
    )
      closeModal(step > steps.length);
    setPreviousStep(step);
    setStep(0);
  };

  const currentStep = () => {
    if (step < 1) {
      return (
        <div className={classes(css.modalCancelContent)}>
          <AlertIcon />
          <h6>{cancelMessage}</h6>
        </div>
      );
    }
    if (step > steps.length) {
      return (
        <div className={classes(css.modalDoneContent)}>
          <CheckIcon />
          <h6>{finishMessage}</h6>
        </div>
      );
    }
    return (
      <>
        {steps.length > 1 && (
          <div className={classes(css.steps)}>
            {steps.map(({ description }, i) => (
              <StepIndicator
                currentStep={step}
                step={i + 1}
                maxStep={steps.length}
                key={i + 1}
                description={description}
                onClick={() => setStep(i + 1)}
              />
            ))}
          </div>
        )}
        {steps[step - 1].component({})}
      </>
    );
  };

  const submitButton = () => {
    if (step === 0) return <Trans i18nKey="Yes, I want to cancel" />;
    if (step === steps.length) return <Trans i18nKey="Confirm" />;
    if (step > steps.length) return <Trans i18nKey="Great!" />;
    return <Trans i18nKey="Next" />;
  };

  const cancelButton = () => {
    if (step < 1) return <Trans i18nKey="No, go back" />;
    if (step === 1) return <Trans i18nKey="Cancel" />;
    return <Trans i18nKey="Previous" />;
  };

  const heading = () => {
    if (step < 1) return cancelHeader;
    if (step > steps.length) return finishHeader;
    return header;
  };

  return (
    <Form onSubmit={handleSubmit}>
      <ModalHeader closeModal={handleCloseButton}>
        <h3>{heading()}</h3>
      </ModalHeader>
      <ModalContent>
        {currentStep()}
        <Alert
          show={errorMessage.length > 0}
          variant="danger"
          dismissible
          onClose={() => setErrorMessage('')}
        >
          {errorMessage}
        </Alert>
      </ModalContent>
      <ModalFooter>
        <ModalFooterButtonDiv empty={step > steps.length}>
          <button
            className="button-large cancel"
            onClick={handleCancel}
            type="button"
          >
            {cancelButton()}
          </button>
        </ModalFooterButtonDiv>
        <ModalFooterButtonDiv>
          {isLoading ? (
            <LoadingSpinner />
          ) : (
            <button
              className="button-large"
              type="submit"
              disabled={
                step > 0 &&
                step <= steps.length &&
                steps[step - 1]?.disabled?.()
              }
            >
              {submitButton()}
            </button>
          )}
        </ModalFooterButtonDiv>
      </ModalFooter>
    </Form>
  );
};