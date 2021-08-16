import { FC, FormEvent, useState } from 'react';
import { Alert, Form } from 'react-bootstrap';
import { Trans, useTranslation } from 'react-i18next';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import classNames from 'classnames';
import { StoreDispatchType } from '../../redux';
import { roadmapsActions } from '../../redux/roadmaps';
import {
  taskSelector,
  chosenRoadmapSelector,
} from '../../redux/roadmaps/selectors';
import {
  Customer,
  Taskrating,
  TaskratingRequest,
  Roadmap,
} from '../../redux/roadmaps/types';
import {
  TaskRatingDimension,
  RoleType,
} from '../../../../shared/types/customTypes';
import { RootState } from '../../redux/types';
import { userInfoSelector } from '../../redux/user/selectors';
import { UserInfo } from '../../redux/user/types';
import { LoadingSpinner } from '../LoadingSpinner';
import { TaskRatingWidget } from '../TaskRatingWidget';
import { Modal, ModalTypes } from './types';
import { ModalContent } from './modalparts/ModalContent';
import { ModalFooter } from './modalparts/ModalFooter';
import { ModalFooterButtonDiv } from './modalparts/ModalFooterButtonDiv';
import { ModalHeader } from './modalparts/ModalHeader';
import { Dot } from '../Dot';
import { getType } from '../../utils/UserUtils';
import css from './RateTaskModal.module.scss';

const classes = classNames.bind(css);

const CustomerHeader: FC<{
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
      <Dot fill={customer.color} />
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

export const RateTaskModal: Modal<ModalTypes.RATE_TASK_MODAL> = ({
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
  const currentRoadmap = useSelector<RootState, Roadmap | undefined>(
    chosenRoadmapSelector,
    shallowEqual,
  );

  const dimension =
    getType(userInfo?.roles, currentRoadmap?.id) === RoleType.Developer
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
          createdByUser === userInfo?.id,
      );
      return { ...previous, ...rating, changed: false };
    })
    .sort((a, b) => {
      if (a.id === undefined && b.id !== undefined) return -1;
      if (b.id === undefined && a.id !== undefined) return 1;
      return 0;
    })
    .filter(
      (rating) =>
        !rating.customer || rating.customer.roadmapId === task.roadmapId,
    );

  const [businessValueRatings, setBusinessValueRatings] = useState(ratings);
  const [businessRatingModified, setBusinessRatingModified] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
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
    const hadError = results.some((res) => {
      if (roadmapsActions.addOrPatchTaskrating.rejected.match(res)) {
        if (res.payload?.message) setErrorMessage(res.payload.message);
        return true;
      }
      return false;
    });
    if (!hadError) closeModal();
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
        <ModalHeader closeModal={closeModal}>
          <h3>
            <Trans i18nKey="Rate task" />
          </h3>
        </ModalHeader>
        <ModalContent>
          <div className={classes(css.taskHeader)}>
            <h6 className={classes(css.taskTitle)}>{task.name}</h6>
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
        <ModalFooter closeModal={closeModal}>
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
