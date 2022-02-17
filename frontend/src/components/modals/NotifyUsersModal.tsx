import React, { useState, useEffect } from 'react';
import { Alert, Form } from 'react-bootstrap';
import { Trans } from 'react-i18next';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import { skipToken } from '@reduxjs/toolkit/query/react';
import classNames from 'classnames';
import Tooltip from '@material-ui/core/Tooltip';
import { roadmapsActions } from '../../redux/roadmaps';
import { StoreDispatchType } from '../../redux';
import { chosenRoadmapIdSelector } from '../../redux/roadmaps/selectors';
import { LoadingSpinner } from '../LoadingSpinner';
import { ModalContent } from './modalparts/ModalContent';
import { ModalFooter } from './modalparts/ModalFooter';
import { ModalFooterButtonDiv } from './modalparts/ModalFooterButtonDiv';
import { ModalHeader } from './modalparts/ModalHeader';
import { Checkbox } from '../forms/Checkbox';
import { RootState } from '../../redux/types';
import { UserInfo } from '../../redux/user/types';
import { userInfoSelector } from '../../redux/user/selectors';
import { Customer, RoadmapUser } from '../../redux/roadmaps/types';
import { RoleType } from '../../../../shared/types/customTypes';
import css from './NotifyUsersModal.module.scss';
import { getType } from '../../utils/UserUtils';
import { Modal, ModalTypes } from './types';
import {
  missingDeveloper,
  getMissingRepresentatives,
} from '../../utils/TaskUtils';
import { TextArea } from '../forms/FormField';
import { RoleIcon } from '../RoleIcons';
import { Dot } from '../Dot';
import colors from '../../colors.module.scss';
import { apiV2, selectById } from '../../api/api';

const classes = classNames.bind(css);

interface CheckableUser extends RoadmapUser {
  checked: boolean;
  customers?: Customer[];
}

export const NotifyUsersModal: Modal<ModalTypes.NOTIFY_USERS_MODAL> = ({
  closeModal,
  taskId,
}) => {
  const dispatch = useDispatch<StoreDispatchType>();
  const roadmapId = useSelector(chosenRoadmapIdSelector);
  const { data: task } = apiV2.useGetTasksQuery(
    roadmapId ?? skipToken,
    selectById(taskId),
  );
  const [isLoading, setIsLoading] = useState(false);
  const userInfo = useSelector<RootState, UserInfo | undefined>(
    userInfoSelector,
    shallowEqual,
  );
  const { data: customers } = apiV2.useGetCustomersQuery(
    roadmapId ?? skipToken,
  );
  const { data: allUsers } = apiV2.useGetRoadmapUsersQuery(
    roadmapId ?? skipToken,
  );
  const [missingUsers, setMissingUsers] = useState<CheckableUser[] | undefined>(
    [],
  );
  const [previousUsers, setPreviousUsers] = useState<
    CheckableUser[] | undefined
  >([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [message, setMessage] = useState('');
  const [allChecked, setAllChecked] = useState<boolean>(false);

  useEffect(() => {
    if (
      task &&
      getType(userInfo, roadmapId) === RoleType.Admin &&
      customers &&
      allUsers
    ) {
      const usersWithCustomers: CheckableUser[] = [];
      customers.forEach((customer) => {
        getMissingRepresentatives(customer, allUsers, task).forEach(
          (representative) => {
            if (representative.id === userInfo!.id) return;

            const foundIndex = usersWithCustomers.findIndex(
              (user) => user.id === representative.id,
            );
            if (foundIndex === -1)
              usersWithCustomers.push({
                ...representative,
                customers: [customer],
                checked: false,
              });
            else usersWithCustomers[foundIndex].customers?.push(customer);
          },
        );
      });

      const missingDevelopers = allUsers
        .filter(missingDeveloper(task))
        .map((dev) => ({
          ...dev,
          checked: false,
        }));

      setMissingUsers([...usersWithCustomers, ...missingDevelopers]);
    }
  }, [allUsers, customers, roadmapId, task, userInfo]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsLoading(true);

    const usersToNotify = missingUsers
      ?.filter((user) => user.checked)
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
    if (!missingUsers) return;
    if (!checked) setMissingUsers(previousUsers);
    if (checked) {
      const copy = [...missingUsers];
      setPreviousUsers(copy);
      setMissingUsers(copy.map((user) => ({ ...user, checked })));
    }
    setAllChecked(!allChecked);
  };

  const checkUser = (checked: boolean, idx: number) => {
    if (!missingUsers) return;
    const copy = [...missingUsers];
    copy[idx].checked = checked;
    setMissingUsers(copy);
    setAllChecked(checked && copy.every((user) => user.checked));
  };

  return (
    <Form onSubmit={handleSubmit}>
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
        {missingUsers?.map((user, idx) => (
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
                  classes={{
                    arrow: classes(css.tooltipArrow),
                    tooltip: classes(css.tooltip),
                  }}
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
        <Form.Group>
          <TextArea
            name="notificationMessage"
            id="notificationMessage"
            draggable="false"
            placeholder="-"
            value={message}
            onChange={(e) => setMessage(e.currentTarget.value)}
          />
        </Form.Group>
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
              disabled={!missingUsers?.some((user) => user.checked)}
            >
              <Trans i18nKey="Confirm" />
            </button>
          )}
        </ModalFooterButtonDiv>
      </ModalFooter>
    </Form>
  );
};
