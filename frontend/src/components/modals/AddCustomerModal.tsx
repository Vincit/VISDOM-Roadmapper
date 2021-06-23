import React, { useState, useEffect } from 'react';
import { Alert, Form } from 'react-bootstrap';
import { Trans, useTranslation } from 'react-i18next';
import classNames from 'classnames';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { StoreDispatchType } from '../../redux';
import { roadmapsActions } from '../../redux/roadmaps';
import {
  allCustomersSelector,
  roadmapUsersSelector,
} from '../../redux/roadmaps/selectors';
import {
  RoadmapUser,
  Customer,
  CheckableUser,
} from '../../redux/roadmaps/types';
import { RoleType } from '../../../../shared/types/customTypes';
import { RootState } from '../../redux/types';
import { LoadingSpinner } from '../LoadingSpinner';
import { ModalProps } from '../types';
import { ModalCloseButton } from './modalparts/ModalCloseButton';
import { ModalContent } from './modalparts/ModalContent';
import { ModalFooter } from './modalparts/ModalFooter';
import { ModalFooterButtonDiv } from './modalparts/ModalFooterButtonDiv';
import { ModalHeader } from './modalparts/ModalHeader';
import {
  SelectCustomerInfo,
  SelectRepresentatives,
} from './modalparts/CustomerModalParts';
import { StepIndicator } from './modalparts/StepIndicator';
import { ReactComponent as AlertIcon } from '../../icons/alert_icon.svg';
import { ReactComponent as CheckIcon } from '../../icons/check_icon.svg';
import { randomColor, getCheckedIds } from '../../utils/CustomerUtils';
import css from './AddCustomerModal.module.scss';

const classes = classNames.bind(css);

const steps = [
  { step: 1, description: 'Client info' },
  { step: 2, description: 'Select representative' },
  { step: 3, description: 'Finish' },
];

export const AddCustomerModal: React.FC<ModalProps> = ({ closeModal }) => {
  const dispatch = useDispatch<StoreDispatchType>();
  const { t } = useTranslation();
  const customers = useSelector<RootState, Customer[] | undefined>(
    allCustomersSelector,
    shallowEqual,
  );
  const roadmapUsers = useSelector<RootState, RoadmapUser[] | undefined>(
    roadmapUsersSelector,
    shallowEqual,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [colorType, setColorType] = useState('generate');
  const [formValues, setFormValues] = useState({
    name: '',
    email: '',
    color: randomColor(customers),
  });
  const [representatives, setRepresentatives] = useState<CheckableUser[]>([]);
  const [step, setStep] = useState(1);
  const [previousStep, setPreviousStep] = useState(0);

  useEffect(() => {
    if (!roadmapUsers) return;
    setRepresentatives(
      roadmapUsers
        ?.filter(
          (user) =>
            user.type === RoleType.Admin || user.type === RoleType.Business,
        )
        .map((obj) => ({ ...obj, checked: false })),
    );
  }, [roadmapUsers]);

  useEffect(() => {
    if (!roadmapUsers) dispatch(roadmapsActions.getRoadmapUsers());
  }, [dispatch, roadmapUsers]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    event.stopPropagation();
    switch (step) {
      case 1:
      case 2:
        setStep(step + 1);
        break;
      case 3: {
        setIsLoading(true);

        const res = await dispatch(
          roadmapsActions.addCustomer({
            name: formValues.name,
            email: formValues.email,
            color:
              colorType === 'pick' ? formValues.color : randomColor(customers),
            representatives: getCheckedIds(representatives),
          }),
        );

        setIsLoading(false);
        if (roadmapsActions.addCustomer.rejected.match(res)) {
          if (res.payload?.message) setErrorMessage(res.payload.message);
          return;
        }
        setStep(step + 1);
        break;
      }
      default:
        closeModal();
    }
  };

  const handleCancel = () => {
    if (step === 0) {
      setStep(previousStep);
      return;
    }
    setPreviousStep(step);
    setStep(0);
  };

  const handleCloseButton = () => {
    if (step === 0 || step === 4) closeModal();
    setPreviousStep(step);
    setStep(0);
  };

  return (
    <>
      <Form onSubmit={handleSubmit}>
        <ModalHeader>
          <h3>
            <Trans i18nKey="Add a client" />
          </h3>
          <ModalCloseButton onClick={handleCloseButton} />
        </ModalHeader>
        <ModalContent>
          {step === 0 && (
            <div className={css.modalCancelContent}>
              <AlertIcon />
              <h6>
                <Trans i18nKey="Cancel customer addition warning" />
              </h6>
            </div>
          )}
          {step > 0 && step < 4 && (
            <div className={css.steps}>
              {steps.map((stepData) => (
                <StepIndicator
                  currentStepDifference={stepData.step - step}
                  step={stepData.step}
                  key={stepData.step}
                  description={stepData.description}
                  onClick={() => setStep(stepData.step)}
                />
              ))}
            </div>
          )}
          {step === 1 && (
            <SelectCustomerInfo
              name={formValues.name}
              onNameChange={(value) =>
                setFormValues({ ...formValues, name: value })
              }
              email={formValues.email}
              onEmailChange={(value) =>
                setFormValues({ ...formValues, email: value })
              }
              colorType={colorType}
              onColorTypeChange={(value) => setColorType(value)}
              color={formValues.color}
              onColorChange={(value) =>
                setFormValues({ ...formValues, color: value })
              }
            />
          )}
          {step === 2 && (
            <SelectRepresentatives
              representatives={representatives}
              onRepresentativeChange={(idx, checked) => {
                const copy = [...(representatives ?? [])];
                if (!copy) return;
                copy[idx].checked = checked;
                setRepresentatives(copy);
              }}
            />
          )}
          {step === 3 && (
            <div className={classes(css.leftText)}>
              <b>
                <Trans i18nKey="All done" />
              </b>{' '}
              <Trans i18nKey="All done customer description" />
            </div>
          )}
          {step === 4 && (
            <div className={classes(css.modalDoneContent)}>
              <CheckIcon />
              <h6>{t('Customer added', { customer: formValues.name })}</h6>
            </div>
          )}
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
          <ModalFooterButtonDiv>
            {step < 4 && (
              <button
                className="button-large cancel"
                onClick={handleCancel}
                type="button"
              >
                {step === 0 ? (
                  <Trans i18nKey="No, go back" />
                ) : (
                  <Trans i18nKey="Cancel" />
                )}
              </button>
            )}
          </ModalFooterButtonDiv>
          <ModalFooterButtonDiv>
            {isLoading ? (
              <LoadingSpinner />
            ) : (
              <button
                className="button-large"
                type="submit"
                disabled={
                  (step === 1 && (!formValues.name || !formValues.email)) ||
                  (step === 2 && !getCheckedIds(representatives).length)
                }
              >
                {step === 0 && <Trans i18nKey="Yes, I want to cancel" />}
                {step > 0 && step < 4 && <Trans i18nKey="Confirm" />}
                {step === 4 && <Trans i18nKey="Great!" />}
              </button>
            )}
          </ModalFooterButtonDiv>
        </ModalFooter>
      </Form>
    </>
  );
};
