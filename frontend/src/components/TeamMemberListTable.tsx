import React, { useEffect, useState } from 'react';
import { ArrowDownCircle, ArrowUpCircle } from 'react-bootstrap-icons';
import { Trans } from 'react-i18next';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { TableTeamMemberRow } from './TableTeamMemberRow';
import { StoreDispatchType } from '../redux/index';
import { roadmapsActions } from '../redux/roadmaps';
import { roadmapUsersSelector } from '../redux/roadmaps/selectors';
import { RoadmapUser } from '../redux/roadmaps/types';
import { RootState } from '../redux/types';
import { SortingOrders } from '../utils/CustomerUtils';
import { UserSortingTypes, sortRoadmapUsers } from '../utils/RoadmapUserUtils';
import { RoleType } from '../../../shared/types/customTypes';

interface TeamMemberTableHeader {
  label: string;
  sorting: UserSortingTypes;
}

export const TeamMemberList = () => {
  const [sortingType, setSortingType] = useState(UserSortingTypes.NO_SORT);
  const [sortingOrder, setSortingOrder] = useState(SortingOrders.ASCENDING);
  const teamMembers = useSelector<RootState, RoadmapUser[] | undefined>(
    roadmapUsersSelector,
    shallowEqual,
  );
  const dispatch = useDispatch<StoreDispatchType>();

  useEffect(() => {
    if (!teamMembers) dispatch(roadmapsActions.getRoadmapUsers());
  }, [dispatch, teamMembers]);

  const getRenderTeamMemberList: () => RoadmapUser[] | undefined = () => {
    const members = teamMembers?.filter(
      (member) => member.type !== RoleType.Customer,
    );
    return sortRoadmapUsers(members || [], sortingType, sortingOrder);
  };

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

  const teamMemberTableHeaders: TeamMemberTableHeader[] = [
    { label: 'Role', sorting: UserSortingTypes.SORT_ROLE },
    { label: 'Name', sorting: UserSortingTypes.SORT_NAME },
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
        {getRenderTeamMemberList()?.map((teamMember) => (
          <TableTeamMemberRow key={teamMember.id} member={teamMember} />
        ))}
      </tbody>
    </table>
  );

  return (
    <>
      <h2>Team members</h2>
      {getRenderTeamMemberList() ? (
        <TeamMemberTable />
      ) : (
        <Trans i18nKey="No team members found" />
      )}
    </>
  );
};
