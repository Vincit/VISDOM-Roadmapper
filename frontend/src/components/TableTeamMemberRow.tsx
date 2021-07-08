import React, { useState, useEffect } from 'react';
import classNames from 'classnames';
import StarSharpIcon from '@material-ui/icons/StarSharp';
import BuildSharpIcon from '@material-ui/icons/BuildSharp';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { StoreDispatchType } from '../redux';
import { DeleteButton, EditButton } from './forms/SvgButton';
import { BusinessValueFilled } from './RatingIcons';
import { RoadmapUser, Roadmap } from '../redux/roadmaps/types';
import { UserInfo } from '../redux/user/types';
import { RoleType } from '../../../shared/types/customTypes';
import { chosenRoadmapSelector } from '../redux/roadmaps/selectors';
import css from './TableTeamMemberRow.module.scss';
import { RootState } from '../redux/types';
import { userInfoSelector } from '../redux/user/selectors';
import { modalsActions } from '../redux/modals';
import { ModalTypes, modalLink } from './modals/types';
import { getType } from '../utils/UserUtils';
import { unratedTasksAmount } from '../utils/TaskUtils';

const classes = classNames.bind(css);

interface TableRowProps {
  member: RoadmapUser;
}

export const TableTeamMemberRow: React.FC<TableRowProps> = ({ member }) => {
  const { id, username, email, type } = member;
  const dispatch = useDispatch<StoreDispatchType>();
  const userInfo = useSelector<RootState, UserInfo | undefined>(
    userInfoSelector,
    shallowEqual,
  );
  const currentRoadmap = useSelector<RootState, Roadmap | undefined>(
    chosenRoadmapSelector,
    shallowEqual,
  );
  const [unratedAmount, setUnratedAmount] = useState(0);

  useEffect(() => {
    if (currentRoadmap?.tasks)
      setUnratedAmount(
        unratedTasksAmount(
          member,
          currentRoadmap.tasks,
          currentRoadmap.customers,
        ),
      );
  }, [currentRoadmap, member]);

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
      <td className="styledTd">
        <a className="green" href={`mailto:${email}`}>
          {email}
        </a>
      </td>
      <td className="styledTd">
        <b>{unratedAmount || ' '}</b>
      </td>
      <td className="styledTd nowrap textAlignEnd">
        {getType(userInfo?.roles, currentRoadmap?.id) === RoleType.Admin &&
          id !== userInfo?.id && (
            <div className={classes(css.editMember)}>
              <EditButton
                fontSize="default"
                onClick={editTeamMemberClicked}
                href={modalLink(ModalTypes.EDIT_TEAM_MEMBER_MODAL, { member })}
              />
              <DeleteButton
                type="filled"
                onClick={deleteUserClicked}
                href={modalLink(ModalTypes.REMOVE_PEOPLE_MODAL, {
                  userId: id,
                  userName: username,
                  type: 'team',
                })}
              />
            </div>
          )}
      </td>
    </tr>
  );
};
