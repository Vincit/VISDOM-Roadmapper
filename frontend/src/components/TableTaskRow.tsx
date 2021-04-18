/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
import React from 'react';
import { CheckCircle, Circle } from 'react-bootstrap-icons';
import { Trans } from 'react-i18next';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import classNames from 'classnames';
import { StoreDispatchType } from '../redux';
import { modalsActions } from '../redux/modals';
import { ModalTypes } from '../redux/modals/types';
import { roadmapsActions } from '../redux/roadmaps/index';
import { Task } from '../redux/roadmaps/types';
import { RootState } from '../redux/types';
import { userInfoSelector } from '../redux/user/selectors';
import { UserInfo, UserType } from '../redux/user/types';
import { DeleteButton } from './forms/DeleteButton';
import { EditButton } from './forms/EditButton';
import { InfoButton } from './forms/InfoButton';
import { RatingsButton } from './forms/RatingsButton';
import { TaskRatingsText } from './TaskRatingsText';
import css from './TableTaskRow.module.scss';

const classes = classNames.bind(css);

interface TableTaskRowProps {
  task: Task;
}

export const TableTaskRow: React.FC<TableTaskRowProps> = ({ task }) => {
  const dispatch = useDispatch<StoreDispatchType>();
  const { id, name, completed, roadmapId, description, createdAt } = task;
  const userInfo = useSelector<RootState, UserInfo | undefined>(
    userInfoSelector,
    shallowEqual,
  );

  const deleteTaskClicked = (e: React.MouseEvent<any, MouseEvent>) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(roadmapsActions.deleteTask({ id, roadmapId }));
  };

  const editTaskClicked = (e: React.MouseEvent<any, MouseEvent>) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(
      modalsActions.showModal({
        modalType: ModalTypes.EDIT_TASK_MODAL,
        modalProps: {
          taskId: task.id,
        },
      }),
    );
  };

  const rateTaskClicked = (e: React.MouseEvent<any, MouseEvent>) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(
      modalsActions.showModal({
        modalType: ModalTypes.RATE_TASK_MODAL,
        modalProps: {
          taskId: task.id,
        },
      }),
    );
  };

  const taskRatingDetailsClicked = (e: React.MouseEvent<any, MouseEvent>) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(
      modalsActions.showModal({
        modalType: ModalTypes.TASK_RATINGS_INFO_MODAL,
        modalProps: {
          taskId: task.id,
        },
      }),
    );
  };

  const taskDetailsClicked = (e: React.MouseEvent<any, MouseEvent>) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(
      modalsActions.showModal({
        modalType: ModalTypes.TASK_INFO_MODAL,
        modalProps: {
          taskId: task.id,
        },
      }),
    );
  };

  const toggleCompletedClicked = (e: React.MouseEvent<any, MouseEvent>) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(roadmapsActions.patchTask({ id, completed: !completed }));
  };

  return (
    <tr
      className={classes(css.styledTr, css.clickable)}
      onClick={taskDetailsClicked}
    >
      <td
        className="styledTd clickable textAlignCenter"
        onClick={toggleCompletedClicked}
      >
        {completed ? (
          <CheckCircle onClick={toggleCompletedClicked} />
        ) : (
          <Circle onClick={toggleCompletedClicked} />
        )}
      </td>
      <td className="styledTd">{name}</td>
      <td className="styledTd">
        {description.length > 75
          ? `${description.slice(0, 75)}...`
          : description}
      </td>
      <td className="styledTd nowrap">
        <TaskRatingsText task={task} />
      </td>
      <td className="styledTd">{new Date(createdAt).toLocaleDateString()}</td>
      <td className="styledTd textAlignEnd nowrap" style={{ width: '202px' }}>
        {!task.ratings.find(
          (rating) => rating.createdByUser === userInfo?.id,
        ) && (
          <a
            href={`?openModal=${
              ModalTypes.TASK_RATINGS_INFO_MODAL
            }&modalProps=${encodeURIComponent(
              JSON.stringify({ taskId: task.id }),
            )}`}
          >
            <button
              className={classes(css['button-small-filled'])}
              type="button"
              onClick={rateTaskClicked}
            >
              <Trans i18nKey="Rate" />
            </button>
          </a>
        )}
        <div className={classes(css.buttonWrapper)}>
          <RatingsButton
            onClick={taskRatingDetailsClicked}
            href={`?openModal=${
              ModalTypes.TASK_RATINGS_INFO_MODAL
            }&modalProps=${encodeURIComponent(
              JSON.stringify({ taskId: task.id }),
            )}`}
          />
          <InfoButton
            onClick={taskDetailsClicked}
            href={`?openModal=${
              ModalTypes.TASK_INFO_MODAL
            }&modalProps=${encodeURIComponent(
              JSON.stringify({ taskId: task.id }),
            )}`}
          />
          {userInfo!.type === UserType.AdminUser && (
            <>
              <EditButton
                type="default"
                onClick={editTaskClicked}
                href={`?openModal=${
                  ModalTypes.EDIT_TASK_MODAL
                }&modalProps=${encodeURIComponent(
                  JSON.stringify({ taskId: task.id }),
                )}`}
              />
              <DeleteButton type="outlined" onClick={deleteTaskClicked} />
            </>
          )}
        </div>
      </td>
    </tr>
  );
};
