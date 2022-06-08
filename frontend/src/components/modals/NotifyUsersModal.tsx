import { useState, FormEvent } from 'react';
import Alert from '@mui/material/Alert';
import { Trans } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { skipToken } from '@reduxjs/toolkit/query/react';
import classNames from 'classnames';
import { Tooltip } from '../InfoTooltip';
import { roadmapsActions } from '../../redux/roadmaps';
import { StoreDispatchType } from '../../redux';
import { chosenRoadmapIdSelector } from '../../redux/roadmaps/selectors';
import { LoadingSpinner } from '../LoadingSpinner';
import { ModalContent } from './modalparts/ModalContent';
import { ModalFooter } from './modalparts/ModalFooter';
import { ModalFooterButtonDiv } from './modalparts/ModalFooterButtonDiv';
import { ModalHeader } from './modalparts/ModalHeader';
import { Checkbox } from '../forms/Checkbox';
import css from './NotifyUsersModal.module.scss';
import { Modal, ModalTypes } from './types';
import { TextArea } from '../forms/FormField';
import { RoleIcon } from '../RoleIcons';
import { Dot } from '../Dot';
import colors from '../../colors.module.scss';
import { apiV2, selectById } from '../../api/api';

const classes = classNames.bind(css);

export const NotifyUsersModal: Modal<ModalTypes.NOTIFY_USERS_MODAL> = ({
  closeModal,
  taskId,
  missingUsers,
  missingDevelopers,
}) => {
  const dispatch = useDispatch<StoreDispatchType>();
  const roadmapId = useSelector(chosenRoadmapIdSelector);
  const { data: task } = apiV2.useGetTasksQuery(
    roadmapId ?? skipToken,
    selectById(taskId),
  );
  const [isLoading, setIsLoading] = useState(false);
  const [previousUsers, setPreviousUsers] = useState([
    ...missingUsers,
    ...missingDevelopers,
  ]);
  const [errorMessage, setErrorMessage] = useState('');
  const [message, setMessage] = useState('');
  const [allChecked, setAllChecked] = useState<boolean>(false);
  const [currentUsers, setCurrentUsers] = useState([
    ...missingUsers,
    ...missingDevelopers,
  ]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsLoading(true);

    const usersToNotify = currentUsers
      .filter((user) => user.checked)
      .map((user) => user.id);

    if (task && usersToNotify) {
      const res = await dispatch(
        roadmapsActions.notifyUsers({
          users: usersToNotify,
          task,
          message,
        }),
      );
      setIsLoading(false);
      if (roadmapsActions.notifyUsers.rejected.match(res)) {
        if (res.payload) setErrorMessage(res.payload.message);
        return;
      }
      closeModal();
    }
  };

  const checkAll = (checked: boolean) => {
    if (!checked) setCurrentUsers(previousUsers);
    if (checked) {
      const copy = [...currentUsers];
      setPreviousUsers(copy);
      setCurrentUsers(copy.map((user) => ({ ...user, checked })));
    }
    setAllChecked(!allChecked);
  };

  const checkUser = (checked: boolean, idx: number) => {
    const updated = currentUsers.map((user, index) =>
      idx === index ? { ...user, checked } : user,
    );

    setCurrentUsers(updated);
    setAllChecked(checked && updated.every((user) => user.checked));
  };

  return (
    <form onSubmit={handleSubmit}>
      <ModalHeader closeModal={closeModal}>
        <h3>
          <Trans i18nKey="Send notification by email" />
        </h3>
      </ModalHeader>
      <ModalContent>
        <p className={classes(css.subtitle)}>
          <Trans i18nKey="Send the notification to" />
        </p>
        <Checkbox
          label="All"
          checked={allChecked}
          onChange={(checked) => checkAll(checked)}
        />
        <hr />
        {currentUsers.map((user, idx) => (
          <div className={classes(css.missingUser)} key={user.id}>
            <div className={classes(css.checkboxDiv)}>
              <Checkbox
                key={user.id}
                label={user.email}
                checked={user.checked}
                onChange={(checked) => checkUser(checked, idx)}
              />
            </div>
            <RoleIcon type={user.type} small tooltip color={colors.azure} />
            <div className={classes(css.customerContainer)}>
              {user.customers?.map((customer) => (
                <Tooltip
                  key={customer.id}
                  title={<div>{customer.name}</div>}
                  placement="top"
                  arrow
                >
                  <div className={classes(css.dotContainer)}>
                    <Dot fill={customer.color} />
                  </div>
                </Tooltip>
              ))}
            </div>
          </div>
        ))}
        <p className={classes(css.message)}>
          <Trans i18nKey="Optional message" />
        </p>
        <div className={classes(css.formGroup)}>
          <TextArea
            name="notificationMessage"
            id="notificationMessage"
            draggable="false"
            placeholder="-"
            value={message}
            onChange={(e) => setMessage(e.currentTarget.value)}
          />
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
      <ModalFooter>
        <ModalFooterButtonDiv>
          <button
            className="button-large cancel"
            type="button"
            onClick={() => closeModal()}
          >
            <Trans i18nKey="Cancel" />
          </button>
        </ModalFooterButtonDiv>
        <ModalFooterButtonDiv>
          {isLoading ? (
            <LoadingSpinner />
          ) : (
            <button
              className="button-large"
              type="submit"
              disabled={!currentUsers.some((user) => user.checked)}
            >
              <Trans i18nKey="Confirm" />
            </button>
          )}
        </ModalFooterButtonDiv>
      </ModalFooter>
    </form>
  );
};
