import React, { useEffect } from 'react';
import { Trans } from 'react-i18next';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { StoreDispatchType } from '../../redux';
import { modalsActions } from '../../redux/modals';
import { ModalTypes } from '../../redux/modals/types';
import { roadmapsActions } from '../../redux/roadmaps';
import {
  roadmapUsersSelector,
  taskSelector,
} from '../../redux/roadmaps/selectors';
import { RoadmapUser } from '../../redux/roadmaps/types';
import { RootState } from '../../redux/types';
import { userInfoSelector } from '../../redux/user/selectors';
import { UserInfo } from '../../redux/user/types';
import { EditButton } from '../forms/SvgButton';
import { TaskRatingBar } from '../RatingBars';
import { ModalProps } from '../types';
import { ModalContent } from './modalparts/ModalContent';
import { ModalHeader } from './modalparts/ModalHeader';
import css from './TaskRatingsInfoModal.module.scss';

export interface TaskRatingsInfoModalProps extends ModalProps {
  taskId: number;
}

export const TaskRatingsInfoModal: React.FC<TaskRatingsInfoModalProps> = ({
  closeModal,
  taskId,
}) => {
  const task = useSelector(taskSelector(taskId))!;
  const dispatch = useDispatch<StoreDispatchType>();
  const roadmapUsers = useSelector<RootState, RoadmapUser[] | undefined>(
    roadmapUsersSelector,
    shallowEqual,
  );
  const userInfo = useSelector<RootState, UserInfo | undefined>(
    userInfoSelector,
    shallowEqual,
  );

  const rateTask = () => {
    dispatch(
      modalsActions.showModal({
        modalType: ModalTypes.RATE_TASK_MODAL,
        modalProps: {
          taskId: task.id,
        },
      }),
    );
  };

  useEffect(() => {
    if (!roadmapUsers) dispatch(roadmapsActions.getRoadmapUsers());
  }, [dispatch, roadmapUsers]);

  const renderOwnRatings = () => {
    const userRatings = task.ratings.filter(
      (rating) => rating.createdByUser === userInfo?.id,
    );

    return (
      <>
        {userRatings.map((rating) => (
          <div className={css.userRatingDiv} key={rating.id}>
            <div className={css.commentDiv}>
              <p className={css.labelText}>
                <Trans i18nKey="Your comment" />{' '}
                <EditButton fontSize="small" onClick={() => rateTask()} />
              </p>
              {rating.comment || '-'}
            </div>
            <div className={css.ratingDiv}>
              <p className={css.labelText}>
                <Trans i18nKey="Your rating" />{' '}
                <EditButton fontSize="small" onClick={() => rateTask()} />
              </p>
              <TaskRatingBar
                dimension={rating.dimension}
                initialValue={rating.value}
                readonly
              />
            </div>
          </div>
        ))}
        {userRatings.length === 0 && (
          <div className={css.userRatingDiv}>
            <div className={css.commentDiv}>
              <p className={css.labelText}>
                <Trans i18nKey="You have not rated this task" />{' '}
                <EditButton fontSize="small" onClick={() => rateTask()} />
              </p>
            </div>
          </div>
        )}
      </>
    );
  };

  const renderTeamRatings = () => {
    const teamRatings = task.ratings.filter(
      (rating) => rating.createdByUser !== userInfo?.id,
    );

    return (
      <>
        {teamRatings.map((rating) => (
          <div className={css.teamRatingDiv} key={rating.id}>
            <div className={css.ratingDiv}>
              <div className={css.teamRatingUsername}>
                @
                {
                  roadmapUsers?.find((user) => user.id === rating.createdByUser)
                    ?.username
                }
              </div>
              <div style={{ display: 'inline-block' }}>
                <TaskRatingBar
                  dimension={rating.dimension}
                  initialValue={rating.value}
                  readonly
                />
              </div>
            </div>
            {rating.comment && (
              <div
                className={css.commentDiv}
                style={{ marginRight: '8px', marginTop: '8px' }}
              >
                {rating.comment}
              </div>
            )}
          </div>
        ))}
        {teamRatings.length === 0 && <Trans i18nKey="No ratings from team" />}
      </>
    );
  };

  return (
    <>
      <ModalHeader closeModal={closeModal}>
        <h3>
          <span>
            <Trans i18nKey="Ratings for" />
            <span className={css.taskNameText}>: {task.name}</span>
          </span>
        </h3>
      </ModalHeader>

      <ModalContent overflowAuto>
        {renderOwnRatings()}{' '}
        <div className={css.columnFlexbox}>
          <p className={css.labelText}>
            <Trans i18nKey="Team's ratings" />:
          </p>
          <div className={css.teamRatingsBox}>
            <div className={css.columnFlexbox}>{renderTeamRatings()}</div>
          </div>
        </div>
      </ModalContent>
    </>
  );
};
