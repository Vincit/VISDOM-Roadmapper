import React from 'react';
import classNames from 'classnames';
import StarSharpIcon from '@material-ui/icons/StarSharp';
import BuildSharpIcon from '@material-ui/icons/BuildSharp';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { StoreDispatchType } from '../redux';
import { DeleteButton } from './forms/DeleteButton';
import { EditButton } from './forms/EditButton';
import { BusinessValueFilled } from './RatingIcons';
import { RoadmapUser } from '../redux/roadmaps/types';
import { UserInfo } from '../redux/user/types';
import { RoleType, UserType } from '../../../shared/types/customTypes';
import css from './TableTeamMemberRow.module.scss';
import { RootState } from '../redux/types';
import { userInfoSelector } from '../redux/user/selectors';
import { modalsActions } from '../redux/modals';
import { ModalTypes } from '../redux/modals/types';

const classes = classNames.bind(css);

interface TableRowProps {
  member: RoadmapUser;
}

export const TableTeamMemberRow: React.FC<TableRowProps> = ({ member }) => {
  const { id, username, type } = member;
  const dispatch = useDispatch<StoreDispatchType>();
  const userInfo = useSelector<RootState, UserInfo | undefined>(
    userInfoSelector,
    shallowEqual,
  );

  const deleteUserClicked = (e: React.MouseEvent<any, MouseEvent>) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(
      modalsActions.showModal({
        modalType: ModalTypes.REMOVE_PEOPLE_MODAL,
        modalProps: {
          userId: id,
          userName: username,
          type: 'team',
        },
      }),
    );
  };

  const editTeamMemberClicked = (e: React.MouseEvent<any, MouseEvent>) => {
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
      <td className="styledTd roleIcon">
        <div className={classes(css.memberIcon, css[RoleType[type]])}>
          {type === RoleType.Admin && <StarSharpIcon />}
          {type === RoleType.Developer && <BuildSharpIcon />}
          {type === RoleType.Business && <BusinessValueFilled />}
        </div>
      </td>
      <td className="styledTd">
        {username}
        {id === userInfo?.id && (
          <span className={classes(css.userText)}> (You)</span>
        )}
      </td>
      <td className="styledTd nowrap textAlignEnd">
        {userInfo!.type === UserType.AdminUser && id !== userInfo?.id && (
          <div className={classes(css.editMember)}>
            <EditButton
              type="default"
              onClick={editTeamMemberClicked}
              href={`?openModal=${
                ModalTypes.EDIT_TEAM_MEMBER_MODAL
              }&modalProps=${encodeURIComponent(JSON.stringify(member))}`}
            />
            <DeleteButton
              type="filled"
              onClick={deleteUserClicked}
              href={`?openModal=${
                ModalTypes.REMOVE_PEOPLE_MODAL
              }&modalProps=${encodeURIComponent(
                JSON.stringify({
                  userId: id,
                  userName: username,
                  type: 'team',
                }),
              )}`}
            />
          </div>
        )}
      </td>
    </tr>
  );
};
