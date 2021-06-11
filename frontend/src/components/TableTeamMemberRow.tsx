import React from 'react';
import classNames from 'classnames';
import StarSharpIcon from '@material-ui/icons/StarSharp';
import BuildSharpIcon from '@material-ui/icons/BuildSharp';
import { shallowEqual, useSelector } from 'react-redux';
import { BusinessValueFilled } from './RatingIcons';
import { RoadmapUser } from '../redux/roadmaps/types';
import { RoleType, UserInfo } from '../redux/user/types';
import css from './TableTeamMemberRow.module.scss';
import { RootState } from '../redux/types';
import { userInfoSelector } from '../redux/user/selectors';

const classes = classNames.bind(css);

interface TableRowProps {
  member: RoadmapUser;
}

export const TableTeamMemberRow: React.FC<TableRowProps> = ({ member }) => {
  const { id, username, type } = member;
  const userInfo = useSelector<RootState, UserInfo | undefined>(
    userInfoSelector,
    shallowEqual,
  );

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
    </tr>
  );
};
