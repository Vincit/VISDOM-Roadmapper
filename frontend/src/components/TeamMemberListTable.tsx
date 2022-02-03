import { FC, useEffect, useState, useMemo } from 'react';
import { Trans } from 'react-i18next';
import { useSelector } from 'react-redux';
import { skipToken } from '@reduxjs/toolkit/query/react';
import { TableTeamMemberRow } from './TableTeamMemberRow';
import { chosenRoadmapIdSelector } from '../redux/roadmaps/selectors';
import { RoadmapUser } from '../redux/roadmaps/types';
import { SortingArrow } from './SortingArrow';
import { useSorting } from '../utils/SortUtils';
import { UserSortingTypes, userSort } from '../utils/SortRoadmapUserUtils';
import { apiV2 } from '../api/api';

interface TeamMemberTableHeader {
  label: string;
  sorting: UserSortingTypes;
  width?: string;
}

export const TeamMemberList: FC<{
  search: string;
}> = ({ search }) => {
  const [sortedMembers, setSortedMembers] = useState<RoadmapUser[]>([]);
  const roadmapId = useSelector(chosenRoadmapIdSelector);
  const { data: teamMembers } = apiV2.useGetRoadmapUsersQuery(
    roadmapId ?? skipToken,
  );
  const { data: tasks } = apiV2.useGetTasksQuery(roadmapId ?? skipToken);
  const { data: users } = apiV2.useGetRoadmapUsersQuery(roadmapId ?? skipToken);
  const { data: customers } = apiV2.useGetCustomersQuery(
    roadmapId ?? skipToken,
  );

  const [sort, sorting] = useSorting(
    useMemo(() => userSort(roadmapId, tasks, users, customers), [
      customers,
      roadmapId,
      tasks,
      users,
    ]),
  );

  useEffect(() => {
    // Filter, search, sort team members
    const members = teamMembers?.filter(({ email }) =>
      email.toLowerCase().includes(search),
    );
    setSortedMembers(sort(members || []));
  }, [teamMembers, sort, search]);

  const onSortingChange = (sorter: UserSortingTypes) => {
    if (sorter === sorting.type.get()) {
      sorting.order.toggle();
    } else {
      sorting.order.reset();
      sorting.type.set(sorter);
    }
  };

  const teamMemberTableHeaders: TeamMemberTableHeader[] = [
    { label: 'Role', sorting: UserSortingTypes.SORT_ROLE, width: '1em' },
    { label: 'Contact information', sorting: UserSortingTypes.SORT_EMAIL },
    { label: 'Unrated tasks', sorting: UserSortingTypes.SORT_UNRATED },
  ];

  const TeamMemberTable = () => (
    <table className="styledTable">
      <thead>
        <tr>
          {teamMemberTableHeaders.map((header) => (
            <th
              className="styledTh clickable"
              key={header.label}
              onClick={() => onSortingChange(header.sorting)}
              style={{ width: header.width }}
            >
              <span className="headerSpan">
                <Trans i18nKey={header.label} />
                {header.sorting !== undefined &&
                  sorting.type.get() === header.sorting && (
                    <SortingArrow order={sorting.order.get()} />
                  )}
              </span>
            </th>
          ))}
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
      <div className="listHeader">
        <h2>Team members</h2>
      </div>
      {sortedMembers.length > 0 ? (
        <TeamMemberTable />
      ) : (
        <Trans i18nKey="No team members found" />
      )}
    </>
  );
};
