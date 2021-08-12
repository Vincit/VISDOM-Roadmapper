import { FC, MouseEvent, useEffect, useState } from 'react';
import { ArrowDownCircle, ArrowUpCircle } from 'react-bootstrap-icons';
import { Trans } from 'react-i18next';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import classNames from 'classnames';
import { TableTeamMemberRow } from './TableTeamMemberRow';
import { StoreDispatchType } from '../redux/index';
import { roadmapsActions } from '../redux/roadmaps';
import {
  roadmapUsersSelector,
  chosenRoadmapSelector,
  allTasksSelector,
} from '../redux/roadmaps/selectors';
import { RoadmapUser, Roadmap } from '../redux/roadmaps/types';
import { RootState } from '../redux/types';
import { modalsActions } from '../redux/modals';
import { ModalTypes } from './modals/types';
import { SortingOrders } from '../utils/SortCustomerUtils';
import {
  UserSortingTypes,
  sortRoadmapUsers,
} from '../utils/SortRoadmapUserUtils';
import { RoleType } from '../../../shared/types/customTypes';
import css from '../pages/PeopleListPage.module.scss';

const classes = classNames.bind(css);

interface TeamMemberTableHeader {
  label: string;
  sorting: UserSortingTypes;
  width?: string;
}

export const TeamMemberList: FC<{
  search: string;
}> = ({ search }) => {
  const [sortingType, setSortingType] = useState(UserSortingTypes.NO_SORT);
  const [sortingOrder, setSortingOrder] = useState(SortingOrders.ASCENDING);
  const [sortedMembers, setSortedMembers] = useState<RoadmapUser[]>([]);
  const teamMembers = useSelector<RootState, RoadmapUser[] | undefined>(
    roadmapUsersSelector(),
    shallowEqual,
  );
  const currentRoadmap = useSelector<RootState, Roadmap | undefined>(
    chosenRoadmapSelector,
    shallowEqual,
  );
  const tasks = useSelector(allTasksSelector(), shallowEqual);
  const dispatch = useDispatch<StoreDispatchType>();

  useEffect(() => {
    if (!teamMembers && currentRoadmap)
      dispatch(roadmapsActions.getRoadmapUsers(currentRoadmap.id));
  }, [currentRoadmap, dispatch, teamMembers]);

  useEffect(() => {
    // Filter, search, sort team members
    const members = teamMembers?.filter(
      ({ type, username }) =>
        type !== RoleType.Customer && username.toLowerCase().includes(search),
    );
    setSortedMembers(
      sortRoadmapUsers(
        members || [],
        sortingType,
        sortingOrder,
        tasks,
        currentRoadmap?.customers,
      ),
    );
  }, [teamMembers, sortingType, sortingOrder, tasks, currentRoadmap, search]);

  const toggleSortOrder = () => {
    if (sortingOrder === SortingOrders.ASCENDING) {
      setSortingOrder(SortingOrders.DESCENDING);
    } else {
      setSortingOrder(SortingOrders.ASCENDING);
    }
  };

  const onSortingChange = (sorter: UserSortingTypes) => {
    if (sorter === sortingType) {
      toggleSortOrder();
    } else {
      setSortingOrder(SortingOrders.ASCENDING);
    }
    setSortingType(sorter);
  };

  const sortingArrow = () =>
    sortingOrder === SortingOrders.ASCENDING ? (
      <ArrowUpCircle />
    ) : (
      <ArrowDownCircle />
    );

  const addTeamMemberClicked = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(
      modalsActions.showModal({
        modalType: ModalTypes.ADD_TEAM_MEMBER_MODAL,
        modalProps: {},
      }),
    );
  };

  const teamMemberTableHeaders: TeamMemberTableHeader[] = [
    { label: 'Role', sorting: UserSortingTypes.SORT_ROLE, width: '1em' },
    { label: 'Name', sorting: UserSortingTypes.SORT_NAME },
    { label: 'Contact information', sorting: UserSortingTypes.SORT_EMAIL },
    { label: 'Unrated tasks', sorting: UserSortingTypes.SORT_UNRATED },
  ];

  const TeamMemberTable = () => (
    <table className="styledTable">
      <thead>
        <tr>
          {teamMemberTableHeaders.map((header) => {
            return (
              <th
                className="styledTh clickable"
                key={header.label}
                onClick={() => onSortingChange(header.sorting)}
                style={{ width: header.width }}
              >
                <span className="headerSpan">
                  <Trans i18nKey={header.label} />
                  {sortingType === header.sorting ? sortingArrow() : null}
                </span>
              </th>
            );
          })}
        </tr>
      </thead>
      <tbody>
        {sortedMembers.map((teamMember) => (
          <TableTeamMemberRow key={teamMember.id} member={teamMember} />
        ))}
      </tbody>
    </table>
  );

  return (
    <>
      <div className={classes(css.header)}>
        <h2>Team members</h2>
        <button
          className={classes(css['button-small-filled'])}
          type="button"
          onClick={addTeamMemberClicked}
        >
          + <Trans i18nKey="Add new team member" />
        </button>
      </div>
      {sortedMembers.length > 0 ? (
        <TeamMemberTable />
      ) : (
        <Trans i18nKey="No team members found" />
      )}
    </>
  );
};
