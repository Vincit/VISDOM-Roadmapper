import React, { useState } from 'react';
import { Alert, Form } from 'react-bootstrap';
import { Trans, useTranslation } from 'react-i18next';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import classNames from 'classnames';
import { StoreDispatchType } from '../../redux';
import { roadmapsActions } from '../../redux/roadmaps';
import { taskSelector } from '../../redux/roadmaps/selectors';
import {
  Customer,
  Taskrating,
  TaskRatingDimension,
  TaskratingRequest,
} from '../../redux/roadmaps/types';
import { RootState } from '../../redux/types';
import { userInfoSelector } from '../../redux/user/selectors';
import { UserInfo, UserType } from '../../redux/user/types';
import { LoadingSpinner } from '../LoadingSpinner';
import { TaskRatingWidget } from '../TaskRatingWidget';
import { ModalProps } from '../types';
import { ModalCloseButton } from './modalparts/ModalCloseButton';
import { ModalContent } from './modalparts/ModalContent';
import { ModalFooter } from './modalparts/ModalFooter';
import { ModalFooterButtonDiv } from './modalparts/ModalFooterButtonDiv';
import { ModalHeader } from './modalparts/ModalHeader';
import css from './RateTaskModal.module.scss';

const classes = classNames.bind(css);

const Dot: React.FC<{ fill: string }> = ({ fill }) => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 14 14"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="7" cy="7" r="7" fill={fill} />
  </svg>
);

const CustomerHeader: React.FC<{
  customer: Customer;
  ratings: Taskrating[];
}> = ({ customer, ratings }) => {
  const { sum, count } = ratings
    .filter(({ forCustomer }) => forCustomer === customer.id)
    .reduce(
      (acc, { value }) => ({ sum: acc.sum + value, count: acc.count + 1 }),
      { sum: 0, count: 0 },
    );
  return (
    <div className={classes(css.customerHeader)} style={{ gap: 10 }}>
      <Dot fill={customer.color || '#ff0000'} />
      <span>{customer.name}</span>
      <span className={classes(css.dimText)}>—</span>
      <span className={classes(css.dimText)}>
        {count ? (
          <span>
            {'Current average value: '}
            <span className="typography-body-bold">
              {(sum / count).toLocaleString(undefined, {
                minimumFractionDigits: 0,
                maximumFractionDigits: 1,
              })}
            </span>
          </span>
        ) : (
          'No previous ratings'
        )}
      </span>
    </div>
  );
};

export interface RateTaskModalProps extends ModalProps {
  taskId: number;
}

export const RateTaskModal: React.FC<RateTaskModalProps> = ({
  closeModal,
  taskId,
}) => {
  const task = useSelector(taskSelector(taskId))!;
  const dispatch = useDispatch<StoreDispatchType>();
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const userInfo = useSelector<RootState, UserInfo | undefined>(
    userInfoSelector,
    shallowEqual,
  );

  const dimension =
    userInfo?.type === UserType.DeveloperUser
      ? TaskRatingDimension.RequiredWork
      : TaskRatingDimension.BusinessValue;

  const taskRatings = task.ratings.filter(
    (rating) =>
      rating.createdByUser === userInfo?.id && rating.dimension === dimension,
  );

  const workRatings: () => (TaskratingRequest & {
    customer?: Customer;
  })[] = () => [
    {
      dimension: TaskRatingDimension.RequiredWork,
      createdByUser: userInfo!.id,
      parentTask: task.id,
    },
  ];

  const valueRatings: () => (TaskratingRequest & {
    customer?: Customer;
  })[] = () =>
    userInfo?.representativeFor?.map((customer) => ({
      dimension: TaskRatingDimension.BusinessValue,
      createdByUser: userInfo.id,
      forCustomer: customer.id,
      parentTask: task.id,
      customer,
    })) || [];

  const ratings = (dimension === TaskRatingDimension.RequiredWork
    ? workRatings()
    : valueRatings()
  )
    .map((rating) => {
      const previous = taskRatings.find(
        ({ forCustomer, createdByUser }) =>
          (!forCustomer || forCustomer === rating.customer?.id) &&
          createdByUser === userInfo!.id,
      );
      return { ...previous, ...rating, changed: false };
    })
    .sort((a, b) => {
      if (a.id === undefined && b.id !== undefined) return -1;
      if (b.id === undefined && a.id !== undefined) return 1;
      return 0;
    });

  const [businessValueRatings, setBusinessValueRatings] = useState(ratings);
  const [businessRatingModified, setBusinessRatingModified] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (!businessRatingModified) {
      setErrorMessage(t('Please input a rating before submitting'));
      return;
    }

    setIsLoading(true);
    const promises = businessValueRatings.flatMap(({ changed, ...rating }) =>
      changed && rating.value !== undefined
        ? [dispatch(roadmapsActions.addOrPatchTaskrating(rating))]
        : [],
    );
    const results = await Promise.all(promises);
    setIsLoading(false);
    /* eslint-disable no-restricted-syntax */
    for (const res of results) {
      if (roadmapsActions.addOrPatchTaskrating.rejected.match(res)) {
        if (res.payload?.message) setErrorMessage(res.payload.message);
        return;
      }
    }

    closeModal();
  };

  const onBusinessRatingChange = (
    idx: number,
    forCustomer?: number,
  ) => (rating: { value: number; comment: string | undefined }) => {
    const copy = [...businessValueRatings];
    const original = idx < 0 ? { forCustomer } : copy[idx];
    copy[idx] = { ...original, ...rating, changed: true };
    setBusinessValueRatings(copy);
    setBusinessRatingModified(true);
  };

  return (
    <>
      <Form onSubmit={handleSubmit}>
        <ModalHeader>
          <h3>
            <Trans i18nKey="Rate task" />
          </h3>
          <ModalCloseButton onClick={closeModal} />
        </ModalHeader>
        <ModalContent>
          <div className={classes(css.taskHeader)}>
            <h6 className={classes(css.taskTitle)}>{task?.name}</h6>
            <p className={classes(css.dimText)}>{task.description}</p>
          </div>

          <div>
            {ratings.map((rating, idx) => {
              const { value = 0, comment = undefined } = rating;
              return (
                <div
                  className={classes(css.rating)}
                  key={`${rating.createdByUser}-${rating.forCustomer}`}
                >
                  {rating.customer && (
                    <CustomerHeader
                      customer={rating.customer}
                      ratings={task.ratings}
                    />
                  )}
                  <TaskRatingWidget
                    onRatingChange={onBusinessRatingChange(
                      idx,
                      rating.customer?.id,
                    )}
                    initialRating={{ value, comment }}
                    ratingDimension={dimension}
                  />
                </div>
              );
            })}
          </div>

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
            <button
              className="button-large cancel"
              onClick={closeModal}
              type="button"
            >
              <Trans i18nKey="Cancel" />
            </button>
          </ModalFooterButtonDiv>
          <ModalFooterButtonDiv>
            {isLoading ? (
              <LoadingSpinner />
            ) : (
              <button className="button-large" type="submit">
                <Trans i18nKey="Submit" />
              </button>
            )}
          </ModalFooterButtonDiv>
        </ModalFooter>
      </Form>
    </>
  );
};
