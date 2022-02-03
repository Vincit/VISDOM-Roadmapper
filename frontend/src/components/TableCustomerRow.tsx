import { MouseEvent, useState, useEffect } from 'react';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { skipToken } from '@reduxjs/toolkit/query/react';
import classNames from 'classnames';
import { useHistory } from 'react-router-dom';
import ArrowForwardIcon from '@material-ui/icons/ArrowForward';
import { DeleteButton, EditButton } from './forms/SvgButton';
import { StoreDispatchType } from '../redux';
import { modalsActions } from '../redux/modals';
import { ModalTypes, modalLink } from './modals/types';
import { Customer } from '../redux/roadmaps/types';
import { chosenRoadmapIdSelector } from '../redux/roadmaps/selectors';
import { userRoleSelector } from '../redux/user/selectors';
import { RoleType } from '../../../shared/types/customTypes';
import { unratedTasksAmount } from '../utils/TaskUtils';
import { TableRow } from './Table';
import css from './TableCustomerRow.module.scss';
import { Dot } from './Dot';
import { paths } from '../routers/paths';
import { apiV2 } from '../api/api';

const classes = classNames.bind(css);

export const TableCustomerRow: TableRow<Customer> = ({
  item: customer,
  style,
}) => {
  const { id, name, email, color, weight } = customer;
  const history = useHistory();
  const dispatch = useDispatch<StoreDispatchType>();
  const role = useSelector(userRoleSelector, shallowEqual);
  const roadmapId = useSelector(chosenRoadmapIdSelector);
  const [unratedAmount, setUnratedAmount] = useState(0);
  const { data: tasks } = apiV2.useGetTasksQuery(roadmapId ?? skipToken);
  const { data: users } = apiV2.useGetRoadmapUsersQuery(roadmapId ?? skipToken);
  const { data: customers } = apiV2.useGetCustomersQuery(
    roadmapId ?? skipToken,
  );

  useEffect(() => {
    if (roadmapId !== undefined && tasks)
      setUnratedAmount(
        unratedTasksAmount(customer, roadmapId, tasks, users, customers),
      );
  }, [customer, customers, roadmapId, tasks, users]);

  if (!roadmapId) return null;

  const deleteUserClicked = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(
      modalsActions.showModal({
        modalType: ModalTypes.REMOVE_PEOPLE_MODAL,
        modalProps: {
          id,
          name,
          type: 'customer',
        },
      }),
    );
  };

  const editUserClicked = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(
      modalsActions.showModal({
        modalType: ModalTypes.EDIT_CUSTOMER_MODAL,
        modalProps: {
          customer,
        },
      }),
    );
  };

  const linkTarget = `${paths.roadmapHome}/${roadmapId}${paths.roadmapRelative.clients}/${id}`;

  return (
    <div
      className={classes(css.hoverRow)}
      onClick={() => history.push(linkTarget)}
      onKeyPress={() => history.push(linkTarget)}
      tabIndex={0}
      role="button"
    >
      <div className={classes(css.virtualizedTableRow)} style={style}>
        <div>
          <Dot fill={color} />
        </div>
        <div>{name}</div>
        <div>
          <a
            className="green"
            href={`mailto:${email}`}
            onClick={(e) => e.stopPropagation()}
          >
            {email}
          </a>
        </div>
        <div>{weight}</div>
        <div>
          <b>{unratedAmount || ' '}</b>
        </div>
        <div className={classes(css.buttons)}>
          {role === RoleType.Admin && (
            <div className={classes(css.adminButtons)}>
              <EditButton
                fontSize="medium"
                onClick={editUserClicked}
                href={modalLink(ModalTypes.EDIT_CUSTOMER_MODAL, {
                  customer,
                })}
              />
              <DeleteButton
                onClick={deleteUserClicked}
                href={modalLink(ModalTypes.REMOVE_PEOPLE_MODAL, {
                  id,
                  name,
                  type: 'customer',
                })}
              />
            </div>
          )}
          <ArrowForwardIcon className={classes(css.arrowIcon)} />
        </div>
      </div>
    </div>
  );
};
