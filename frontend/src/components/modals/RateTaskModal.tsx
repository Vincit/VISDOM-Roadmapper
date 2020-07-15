import React, { useState } from 'react';
import { Alert, Form } from 'react-bootstrap';
import { Trans, useTranslation } from 'react-i18next';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { StoreDispatchType } from '../../redux';
import { roadmapsActions } from '../../redux/roadmaps';
import {
  Task,
  TaskRatingDimension,
  TaskratingRequest,
} from '../../redux/roadmaps/types';
import { RootState } from '../../redux/types';
import { userInfoSelector } from '../../redux/user/selectors';
import { UserInfo } from '../../redux/user/types';
import { StyledButton } from '../forms/StyledButton';
import { LoadingSpinner } from '../LoadingSpinner';
import { TaskRatingWidget } from '../TaskRatingWidget';
import { ModalProps } from '../types';
import { ModalCloseButton } from './modalparts/ModalCloseButton';
import { ModalContent } from './modalparts/ModalContent';
import { ModalFooter } from './modalparts/ModalFooter';
import { ModalFooterButtonDiv } from './modalparts/ModalFooterButtonDiv';
import { ModalHeader } from './modalparts/ModalHeader';

export interface RateTaskModalProps extends ModalProps {
  task: Task;
  cameFromTaskCreation?: boolean;
}

export const RateTaskModal: React.FC<RateTaskModalProps> = ({
  closeModal,
  task,
  cameFromTaskCreation,
}) => {
  const dispatch = useDispatch<StoreDispatchType>();
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const userInfo = useSelector<RootState, UserInfo | undefined>(
    userInfoSelector,
    shallowEqual,
  );
  const taskBusinessRating = task.ratings.find(
    (rating) =>
      rating.createdByUser === userInfo?.id &&
      rating.dimension === TaskRatingDimension.BusinessValue,
  );
  const taskWorkRating = task.ratings.find(
    (rating) =>
      rating.createdByUser === userInfo?.id &&
      rating.dimension === TaskRatingDimension.RequiredWork,
  );
  const [businessValueRating, setBusinessValueRating] = useState<
    TaskratingRequest
  >({
    dimension: TaskRatingDimension.BusinessValue,
    createdByUser: userInfo?.id,
    parentTask: task.id,
    ...taskBusinessRating,
  });
  const [requiredWorkRating, setRequiredWorkRating] = useState<
    TaskratingRequest
  >({
    dimension: TaskRatingDimension.RequiredWork,
    createdByUser: userInfo?.id,
    parentTask: task.id,
    ...taskWorkRating,
  });
  const [businessRatingModified, setBusinessRatingModified] = useState(false);
  const [workRatingModified, setWorkRatingModified] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (!workRatingModified && !businessRatingModified) {
      setErrorMessage(t('Please input a rating before submitting'));
      return;
    }

    if (businessRatingModified) {
      setIsLoading(true);
      const res = await dispatch(
        roadmapsActions.addOrPatchTaskrating(businessValueRating),
      );
      setIsLoading(false);
      if (roadmapsActions.addOrPatchTaskrating.rejected.match(res)) {
        if (res.payload?.message) setErrorMessage(res.payload.message);
        return;
      }
    }

    if (workRatingModified) {
      setIsLoading(true);
      const res = await dispatch(
        roadmapsActions.addOrPatchTaskrating(requiredWorkRating),
      );
      setIsLoading(false);
      if (roadmapsActions.addOrPatchTaskrating.rejected.match(res)) {
        if (res.payload?.message) setErrorMessage(res.payload.message);
        return;
      }
    }

    closeModal();
  };

  const onBusinessRatingChange = (rating: {
    value: number;
    comment: string | undefined;
  }) => {
    setBusinessValueRating({
      ...businessValueRating,
      ...rating,
    });
    setBusinessRatingModified(true);
  };

  const onRequiredWorkRatingChange = (rating: {
    value: number;
    comment: string | undefined;
  }) => {
    setRequiredWorkRating({
      ...requiredWorkRating,
      ...rating,
    });
    setWorkRatingModified(true);
  };

  return (
    <>
      <ModalCloseButton onClick={closeModal} />
      <Form onSubmit={handleSubmit}>
        <ModalHeader>
          <Trans i18nKey="Rate task" />
        </ModalHeader>
        <ModalContent>
          {cameFromTaskCreation ? (
            <div className="m-4 text-left">
              <h6>Task &apos;{task?.name}&apos; created!</h6>
              <h6>You may now rate it!</h6>
            </div>
          ) : (
            <h6 className="m-4 text-left">{task?.name}</h6>
          )}

          <TaskRatingWidget
            onBusinessRatingChange={onBusinessRatingChange}
            onRequiredWorkRatingChange={onRequiredWorkRatingChange}
            initialBusinessValueRating={{
              value: businessValueRating?.value || 0,
              comment: businessValueRating?.comment,
            }}
            initialRequiredWorkRating={{
              value: requiredWorkRating?.value || 0,
              comment: requiredWorkRating?.comment,
            }}
          />
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
          <ModalFooterButtonDiv rightmargin>
            <StyledButton fullWidth buttonType="cancel" onClick={closeModal}>
              <Trans i18nKey="Cancel" />
            </StyledButton>
          </ModalFooterButtonDiv>
          <ModalFooterButtonDiv>
            {isLoading ? (
              <LoadingSpinner />
            ) : (
              <StyledButton fullWidth buttonType="submit" type="submit">
                <Trans i18nKey="Submit" />
              </StyledButton>
            )}
          </ModalFooterButtonDiv>
        </ModalFooter>
      </Form>
    </>
  );
};
