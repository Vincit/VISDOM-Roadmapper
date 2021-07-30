import { useEffect } from 'react';
import { Trans } from 'react-i18next';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { StoreDispatchType } from '../../redux';
import { roadmapsActions } from '../../redux/roadmaps';
import {
  roadmapUsersSelector,
  taskSelector,
  chosenRoadmapSelector,
} from '../../redux/roadmaps/selectors';
import { RoadmapUser, Roadmap } from '../../redux/roadmaps/types';
import { RootState } from '../../redux/types';
import { TaskRatingsText } from '../TaskRatingsText';
import { Modal, ModalTypes } from './types';
import { ModalContent } from './modalparts/ModalContent';
import { ModalFooter } from './modalparts/ModalFooter';
import { ModalHeader } from './modalparts/ModalHeader';
import css from './TaskInfoModal.module.scss';

export const TaskInfoModal: Modal<ModalTypes.TASK_INFO_MODAL> = ({
  closeModal,
  taskId,
}) => {
  const task = useSelector(taskSelector(taskId))!;
  const dispatch = useDispatch<StoreDispatchType>();
  const roadmapUsers = useSelector<RootState, RoadmapUser[] | undefined>(
    roadmapUsersSelector(),
    shallowEqual,
  );
  const currentRoadmap = useSelector<RootState, Roadmap | undefined>(
    chosenRoadmapSelector,
    shallowEqual,
  );

  useEffect(() => {
    if (!roadmapUsers && currentRoadmap)
      dispatch(roadmapsActions.getRoadmapUsers(currentRoadmap.id));
  }, [currentRoadmap, dispatch, roadmapUsers]);

  return (
    <>
      <ModalHeader closeModal={closeModal}>
        <h3>
          <span>
            <Trans i18nKey="Overview for" />
            <span className={css.taskNameText}>: {task.name}</span>
          </span>
        </h3>
      </ModalHeader>
      <ModalContent>
        <div className={css.descriptionRatingsDiv}>
          <div className={css.detailsDiv}>
            <p className={css.labelText}>Description</p>
            {task.description}
          </div>
          <div className={css.detailsDiv}>
            <p className={css.labelText}>Task rating</p>
            <TaskRatingsText task={task} />
          </div>
        </div>
      </ModalContent>
      <ModalFooter>
        <div className={css.detailsDiv}>
          <p className={css.labelText}>
            <Trans i18nKey="Created by" />
          </p>
          {
            roadmapUsers?.find((user) => user.id === task.createdByUser)
              ?.username
          }
        </div>
        <div className={css.detailsDiv}>
          <p className={css.labelText}>
            <Trans i18nKey="Created on" />
          </p>
          {new Date(task.createdAt).toLocaleDateString()}
        </div>
      </ModalFooter>
    </>
  );
};
