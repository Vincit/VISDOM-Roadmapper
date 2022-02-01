import { FC, MouseEvent, useState, useEffect } from 'react';
import classNames from 'classnames';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { StoreDispatchType } from '../redux';
import { DeleteButton, EditButton } from './forms/SvgButton';
import { RoleIcon } from './RoleIcons';
import { RoadmapUser } from '../redux/roadmaps/types';
import { UserInfo } from '../redux/user/types';
import { RoleType } from '../../../shared/types/customTypes';
import { chosenRoadmapIdSelector } from '../redux/roadmaps/selectors';
import css from './TableTeamMemberRow.module.scss';
import { RootState } from '../redux/types';
import { userInfoSelector } from '../redux/user/selectors';
import { modalsActions } from '../redux/modals';
import { ModalTypes, modalLink } from './modals/types';
import { getType } from '../utils/UserUtils';
import { unratedTasksAmount } from '../utils/TaskUtils';
import { apiV2 } from '../api/api';

const classes = classNames.bind(css);

interface TableRowProps {
  member: RoadmapUser;
}

export const TableTeamMemberRow: FC<TableRowProps> = ({ member }) => {
  const { id, email, type } = member;
  const dispatch = useDispatch<StoreDispatchType>();
  const userInfo = useSelector<RootState, UserInfo | undefined>(
    userInfoSelector,
    shallowEqual,
  );
  const roadmapId = useSelector(chosenRoadmapIdSelector);
  const [unratedAmount, setUnratedAmount] = useState(0);
  const { data: tasks } = apiV2.useGetTasksQuery(roadmapId!);
  const { data: users } = apiV2.useGetRoadmapUsersQuery(roadmapId!);
  const { data: customers } = apiV2.useGetCustomersQuery(roadmapId!);

  useEffect(() => {
    if (roadmapId && tasks)
      setUnratedAmount(
        unratedTasksAmount(member, roadmapId, tasks, users, customers),
      );
  }, [customers, member, roadmapId, tasks, users]);

  const deleteUserClicked = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(
      modalsActions.showModal({
        modalType: ModalTypes.REMOVE_PEOPLE_MODAL,
        modalProps: {
          id,
          name: email,
          type: 'team',
        },
      }),
    );
  };

  const editTeamMemberClicked = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(
      modalsActions.showModal({
        modalType: ModalTypes.EDIT_TEAM_MEMBER_MODAL,
        modalProps: {
          member,
        },
      }),
    );
  };

  return (
    <tr>
      <td className="styledTd">
        <RoleIcon type={type} tooltip />
      </td>
      <td className="styledTd">
        <a className="green" href={`mailto:${email}`}>
          {email}
        </a>
        {id === userInfo?.id && (
          <span className={classes(css.userText)}> (You)</span>
        )}
      </td>
      <td className="styledTd">
        <b>{unratedAmount || ' '}</b>
      </td>
      <td className="styledTd nowrap textAlignEnd">
        {getType(userInfo, roadmapId) === RoleType.Admin &&
          id !== userInfo?.id && (
            <div className={classes(css.editMember)}>
              <EditButton
                fontSize="medium"
                onClick={editTeamMemberClicked}
                href={modalLink(ModalTypes.EDIT_TEAM_MEMBER_MODAL, { member })}
              />
              <DeleteButton
                onClick={deleteUserClicked}
                href={modalLink(ModalTypes.REMOVE_PEOPLE_MODAL, {
                  id,
                  name: email,
                  type: 'team',
                })}
              />
            </div>
          )}
      </td>
    </tr>
  );
};
