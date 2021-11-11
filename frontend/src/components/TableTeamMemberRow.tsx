import { FC, MouseEvent, useState, useEffect } from 'react';
import classNames from 'classnames';
import StarSharpIcon from '@material-ui/icons/StarSharp';
import BuildSharpIcon from '@material-ui/icons/BuildSharp';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { StoreDispatchType } from '../redux';
import { DeleteButton, EditButton } from './forms/SvgButton';
import { BusinessIcon } from './RoleIcons';
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

export const TableTeamMemberRow: FC<TableRowProps> = ({ member }) => {
  const { id, email, type } = member;
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
      setUnratedAmount(unratedTasksAmount(member, currentRoadmap));
  }, [currentRoadmap, member]);

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
      <td className="styledTd roleIcon">
        <div className={classes(css.memberIcon)}>
          {type === RoleType.Admin && <StarSharpIcon />}
          {type === RoleType.Developer && <BuildSharpIcon />}
          {type === RoleType.Business && <BusinessIcon />}
        </div>
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
        {getType(userInfo, currentRoadmap?.id) === RoleType.Admin &&
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
