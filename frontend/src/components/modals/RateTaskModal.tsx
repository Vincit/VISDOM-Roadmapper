import { FC, FormEvent, useState } from 'react';
import Alert from '@mui/material/Alert';
import { Trans } from 'react-i18next';
import { shallowEqual, useSelector } from 'react-redux';
import classNames from 'classnames';
import { chosenRoadmapIdSelector } from '../../redux/roadmaps/selectors';
import {
  Customer,
  Taskrating,
  TaskratingRequest,
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
import { apiV2 } from '../../api/api';

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
  task,
  edit,
}) => {
  const [errorMessage, setErrorMessage] = useState('');
  const userInfo = useSelector<RootState, UserInfo | undefined>(
    userInfoSelector,
    shallowEqual,
  );
  const roadmapId = useSelector(chosenRoadmapIdSelector);

  const [
    updateTaskratings,
    updateStatus,
  ] = apiV2.useUpdateTaskratingsMutation();
  const [addTaskratings, addStatus] = apiV2.useAddTaskratingsMutation();

  const dimension =
    getType(userInfo, roadmapId) === RoleType.Developer
      ? TaskRatingDimension.Complexity
      : TaskRatingDimension.BusinessValue;

  const taskRatings = task.ratings.filter(
    (rating) =>
      rating.createdByUser === userInfo?.id && rating.dimension === dimension,
  );

  const complexityRatings: () => (TaskratingRequest & {
    customer?: Customer;
  })[] = () =>
    task
      ? [
          {
            dimension: TaskRatingDimension.Complexity,
            createdByUser: userInfo!.id,
            parentTask: task.id,
          },
        ]
      : [];

  const valueRatings: () => (TaskratingRequest & {
    customer?: Customer;
  })[] = () =>
    (task &&
      userInfo?.representativeFor?.map((customer) => ({
        dimension: TaskRatingDimension.BusinessValue,
        createdByUser: userInfo.id,
        forCustomer: customer.id,
        parentTask: task.id,
        customer,
      }))) ||
    [];

  const ratings = (dimension === TaskRatingDimension.Complexity
    ? complexityRatings()
    : valueRatings()
  )
    .map((rating) => {
      const previous = taskRatings?.find(
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
        !rating.customer || rating.customer.roadmapId === task?.roadmapId,
    )
    // show only new or existing ratings depending on edit value
    .filter(({ value }) => (edit ? value : !value));

  const [businessValueRatings, setBusinessValueRatings] = useState(ratings);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    event.stopPropagation();

    const changed = businessValueRatings.filter((rating) => rating.changed);
    const action = edit ? updateTaskratings : addTaskratings;
    if (!roadmapId || changed.length === 0) return;
    try {
      await action({ roadmapId, ratings: changed, taskId: task.id }).unwrap();
      closeModal();
    } catch (err: any) {
      setErrorMessage(err.data?.message ?? err.data ?? 'something went wrong');
    }
  };

  const onBusinessRatingChange = (
    idx: number,
    forCustomer?: number,
  ) => (rating: { value: number; comment: string | undefined }) => {
    const copy = [...businessValueRatings];
    const previous = copy[idx];

    let changed = rating.value !== 0;
    if (edit) {
      const { value, comment } = ratings.find(({ id }) => previous.id === id)!;
      changed =
        rating.value === 0 ||
        value !== rating.value ||
        comment !== rating.comment;
    }

    copy[idx] = { ...previous, ...rating, forCustomer, changed };
    setBusinessValueRatings(copy);
  };

  if (!task) return null;

  return (
    <form onSubmit={handleSubmit}>
      <ModalHeader closeModal={closeModal}>
        <h3>
          {edit ? (
            <Trans i18nKey="Edit ratings" />
          ) : (
            <Trans i18nKey="Rate task" />
          )}
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
            const key = `${rating.createdByUser}-${rating.forCustomer}`;
            return (
              <div className={classes(css.rating)} key={key}>
                {rating.customer && (
                  <CustomerHeader
                    customer={rating.customer}
                    ratings={task.ratings}
                  />
                )}
                <TaskRatingWidget
                  name={key}
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

        {errorMessage.length > 0 && (
          <Alert
            severity="error"
            onClose={() => setErrorMessage('')}
            icon={false}
          >
            {errorMessage}
          </Alert>
        )}
      </ModalContent>
      <ModalFooter closeModal={closeModal}>
        <ModalFooterButtonDiv>
          {updateStatus.isLoading || addStatus.isLoading ? (
            <LoadingSpinner />
          ) : (
            <button
              className="button-large"
              type="submit"
              disabled={!businessValueRatings.some(({ changed }) => changed)}
            >
              <Trans i18nKey="Submit" />
            </button>
          )}
        </ModalFooterButtonDiv>
      </ModalFooter>
    </form>
  );
};
