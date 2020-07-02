import React, { useEffect } from 'react';
import { Trans } from 'react-i18next';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { StoreDispatchType } from '../../redux';
import { roadmapsActions } from '../../redux/roadmaps';
import { publicUsersSelector } from '../../redux/roadmaps/selectors';
import { PublicUser, Task } from '../../redux/roadmaps/types';
import { RootState } from '../../redux/types';
import { TaskRatingsText } from '../TaskRatingsText';
import { ModalProps } from '../types';
import { ModalCloseButton } from './modalparts/ModalCloseButton';
import { ModalContent } from './modalparts/ModalContent';
import { ModalFooter } from './modalparts/ModalFooter';
import { ModalHeader } from './modalparts/ModalHeader';

export interface TaskInfoModalProps extends ModalProps {
  task: Task;
}

const TaskNameText = styled.span`
  color: #888888;
`;

const DescriptionRatingsDiv = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
`;

const DetailsDiv = styled.div<{ rightMargin?: boolean }>`
  text-align: start;
  min-width: 8em;
  max-height: 40em;
  margin-right: ${(props) => (props.rightMargin ? '8px' : 'initial')};
  font-size: 14px;
`;
const LabelText = styled.p`
  font-family: 'Anonymous Pro';
  margin-bottom: 8px;
  font-size: 11px;
  line-height: 16px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  font-weight: bold;
`;

export const TaskInfoModal: React.FC<TaskInfoModalProps> = ({
  closeModal,
  task,
}) => {
  const dispatch = useDispatch<StoreDispatchType>();
  const publicUsers = useSelector<RootState, PublicUser[] | undefined>(
    publicUsersSelector,
    shallowEqual,
  );

  useEffect(() => {
    if (!publicUsers) dispatch(roadmapsActions.getPublicUsers());
  }, [dispatch, publicUsers]);

  return (
    <>
      <ModalCloseButton onClick={closeModal} />

      <ModalHeader>
        <span>
          <Trans i18nKey="Overview for" />
          <TaskNameText>: {task.name}</TaskNameText>
        </span>
      </ModalHeader>

      <ModalContent>
        <DescriptionRatingsDiv>
          <DetailsDiv rightMargin>
            <LabelText>Description</LabelText>
            {task.description}
          </DetailsDiv>
          <DetailsDiv>
            <LabelText>Task rating</LabelText>
            <TaskRatingsText task={task} />
          </DetailsDiv>
        </DescriptionRatingsDiv>
      </ModalContent>
      <ModalFooter>
        <DetailsDiv>
          <LabelText>
            <Trans i18nKey="Created by" />
          </LabelText>
          {
            publicUsers?.find((user) => user.id === task.createdByUser)
              ?.username
          }
        </DetailsDiv>
        <DetailsDiv>
          <LabelText>
            <Trans i18nKey="Created on" />
          </LabelText>
          {new Date(task.createdAt).toLocaleDateString()}
        </DetailsDiv>
        <DetailsDiv />
      </ModalFooter>
    </>
  );
};
