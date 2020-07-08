import React, { useEffect } from 'react';
import { Trans } from 'react-i18next';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { StoreDispatchType } from '../../redux';
import { modalsActions } from '../../redux/modals';
import { ModalTypes } from '../../redux/modals/types';
import { roadmapsActions } from '../../redux/roadmaps';
import { publicUsersSelector } from '../../redux/roadmaps/selectors';
import { PublicUser, Task } from '../../redux/roadmaps/types';
import { RootState } from '../../redux/types';
import { userInfoSelector } from '../../redux/user/selectors';
import { UserInfo } from '../../redux/user/types';
import { EditButton } from '../forms/EditButton';
import { TaskRatingBar } from '../RatingBars';
import { ModalProps } from '../types';
import { ModalCloseButton } from './modalparts/ModalCloseButton';
import { ModalContent } from './modalparts/ModalContent';
import { ModalHeader } from './modalparts/ModalHeader';

export interface TaskRatingsInfoModalProps extends ModalProps {
  task: Task;
}

const TaskNameText = styled.span`
  color: #888888;
`;

const UserRatingDiv = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  max-width: 50em;
  margin-bottom: 4px;
`;

const CommentDiv = styled.div<{ rightMargin?: boolean; topMargin?: boolean }>`
  text-align: start;
  min-width: 14em;
  max-height: 40em;
  margin-right: ${(props) => (props.rightMargin ? '8px' : 'initial')};
  margin-top: ${(props) => (props.topMargin ? '8px' : 'initial')};
  font-size: 14px;
`;

const RatingDiv = styled.div<{ rightMargin?: boolean }>`
  text-align: start;
  white-space: nowrap;
  max-height: 40em;
  margin-right: ${(props) => (props.rightMargin ? '8px' : 'initial')};
  font-size: 14px;
`;

const LabelText = styled.p`
  display: flex;
  white-space: nowrap;
  font-family: 'Anonymous Pro';
  margin-bottom: 8px;
  font-size: 11px;
  line-height: 16px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  font-weight: bold;
`;

const ColumnFlexBox = styled.div`
  margin-top: 8px;
  display: flex;
  flex-direction: column;
  width: 100%;
  text-align: left;
  overflow-y: auto;
`;

const TeamRatingsBox = styled.div`
  display: flex;
  font-size: 14px;
  margin-top: 8px;
  background-color: #f3f3f3;
  width: 100%;
  overflow-y: auto;
  max-height: 40em;
`;

const TeamRatingDiv = styled.div`
  margin: 8px;
  max-width: 50em;
`;

const TeamRatingUsername = styled.div`
  display: inline-block;
  font-weight: bold;
  margin-right: 16px;
  width: 14em;
`;

const TeamRatingBarContainer = styled.div`
  display: inline-block;
`;

export const TaskRatingsInfoModal: React.FC<TaskRatingsInfoModalProps> = ({
  closeModal,
  task,
}) => {
  const dispatch = useDispatch<StoreDispatchType>();
  const publicUsers = useSelector<RootState, PublicUser[] | undefined>(
    publicUsersSelector,
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
          task,
        },
      }),
    );
  };

  useEffect(() => {
    if (!publicUsers) dispatch(roadmapsActions.getPublicUsers());
  }, [dispatch, publicUsers]);

  const renderOwnRatings = () => {
    const userRatings = task.ratings.filter(
      (rating) => rating.createdByUser === userInfo?.id,
    );

    return (
      <>
        {userRatings.map((rating) => (
          <UserRatingDiv>
            <CommentDiv rightMargin>
              <LabelText>
                <Trans i18nKey="Your comment" />{' '}
                <EditButton type="small" onClick={() => rateTask()} />
              </LabelText>
              {rating.comment || '-'}
            </CommentDiv>
            <RatingDiv>
              <LabelText>
                <Trans i18nKey="Your rating" />{' '}
                <EditButton type="small" onClick={() => rateTask()} />
              </LabelText>
              <TaskRatingBar
                dimension={rating.dimension}
                initialValue={rating.value}
                readonly
              />
            </RatingDiv>
          </UserRatingDiv>
        ))}
        {userRatings.length === 0 && (
          <UserRatingDiv>
            <CommentDiv rightMargin>
              <LabelText>
                <LabelText>
                  <Trans i18nKey="You have not rated this task" />{' '}
                  <EditButton type="small" onClick={() => rateTask()} />
                </LabelText>
              </LabelText>
            </CommentDiv>
            <RatingDiv />
          </UserRatingDiv>
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
          <TeamRatingDiv>
            <RatingDiv>
              <TeamRatingUsername>
                @
                {
                  publicUsers?.find((user) => user.id === rating.createdByUser)
                    ?.username
                }
              </TeamRatingUsername>
              <TeamRatingBarContainer>
                <TaskRatingBar
                  dimension={rating.dimension}
                  initialValue={rating.value}
                  readonly
                />
              </TeamRatingBarContainer>
            </RatingDiv>
            {rating.comment && (
              <CommentDiv rightMargin topMargin>
                {rating.comment}
              </CommentDiv>
            )}
          </TeamRatingDiv>
        ))}
        {teamRatings.length === 0 && <Trans i18nKey="No ratings from team" />}
      </>
    );
  };

  return (
    <>
      <ModalCloseButton onClick={closeModal} />

      <ModalHeader>
        <span>
          <Trans i18nKey="Ratings for" />
          <TaskNameText>: {task.name}</TaskNameText>
        </span>
      </ModalHeader>

      <ModalContent>
        {renderOwnRatings()}{' '}
        <ColumnFlexBox>
          <LabelText>
            <Trans i18nKey="Team's ratings" />:
          </LabelText>
          <TeamRatingsBox>
            <ColumnFlexBox>{renderTeamRatings()}</ColumnFlexBox>
          </TeamRatingsBox>
        </ColumnFlexBox>
      </ModalContent>
    </>
  );
};
