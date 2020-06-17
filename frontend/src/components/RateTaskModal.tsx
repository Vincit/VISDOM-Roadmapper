import React, { useState } from 'react';
import { Alert, Modal, Button, Form } from 'react-bootstrap';
import { Trans, useTranslation } from 'react-i18next';
import { useSelector, shallowEqual, useDispatch } from 'react-redux';
import { ModalProps } from './types';
import {
  Task,
  TaskRatingDimension,
  TaskratingRequest,
} from '../redux/roadmaps/types';
import { TaskRatingWidget } from './TaskRatingWidget';
import { RootState } from '../redux/types';
import { userInfoSelector } from '../redux/user/selectors';
import { UserInfo } from '../redux/user/types';
import { roadmapsActions } from '../redux/roadmaps';
import { StoreDispatchType } from '../redux';

export interface RateTaskModalProps extends ModalProps {
  task: Task;
  cameFromTaskCreation?: boolean;
}

export const RateTaskModal: React.FC<RateTaskModalProps> = ({
  onClose,
  task,
  cameFromTaskCreation,
}) => {
  const dispatch = useDispatch<StoreDispatchType>();
  const { t } = useTranslation();
  const [hasError, setHasError] = useState(false);
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
      setHasError(true);
      setErrorMessage(t('Please input a rating before submitting'));
      return;
    }

    if (businessRatingModified) {
      const res = await dispatch(
        roadmapsActions.addOrPatchTaskrating(businessValueRating),
      );
      if (roadmapsActions.addOrPatchTaskrating.rejected.match(res)) {
        setHasError(true);
        if (res.payload?.message) setErrorMessage(res.payload.message);
        return;
      }
    }

    if (workRatingModified) {
      const res = await dispatch(
        roadmapsActions.addOrPatchTaskrating(requiredWorkRating),
      );
      if (roadmapsActions.addOrPatchTaskrating.rejected.match(res)) {
        setHasError(true);
        if (res.payload?.message) setErrorMessage(res.payload.message);
        return;
      }
    }

    onClose();
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
    <Modal show onHide={onClose}>
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>
            <Trans i18nKey="Rate task" />
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {cameFromTaskCreation ? (
            <div className="m-4">
              <h6>Task &apos;{task?.name}&apos; created!</h6>
              <h6>You may now rate it!</h6>
            </div>
          ) : (
            <h6 className="m-4">{task?.name}</h6>
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
            show={hasError}
            variant="danger"
            dismissible
            onClose={() => setHasError(false)}
          >
            {errorMessage}
          </Alert>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onClose}>
            <Trans i18nKey="Close" />
          </Button>
          <Button variant="primary" type="submit">
            <Trans i18nKey="Submit" />
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};
