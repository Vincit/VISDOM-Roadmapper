import { Trans } from 'react-i18next';
import { RoadmapUser } from '../redux/roadmaps/types';
import { RoleIcon } from './RoleIcons';
import { table, TableRow } from './Table';
import { userSort, UserSortingTypes } from '../utils/SortRoadmapUserUtils';
import '../shared.scss';

const RepresentativeRow: TableRow<RoadmapUser> = ({ item: user, style }) => (
  <div style={style} className="virtualizedTableRow">
    <RoleIcon type={user.type} />
    <div>
      <a className="green" href={`mailto:${user.email}`}>
        {user.email}
      </a>
    </div>
  </div>
);

export const RepresentativeTable = table({
  Title: () => (
    <h2>
      <Trans i18nKey="Representatives" />
    </h2>
  ),
  getSort: userSort(),
  Row: RepresentativeRow,
  header: [
    { label: 'Role', width: 0.3, sorting: UserSortingTypes.SORT_ROLE },
    { label: 'Contact information', sorting: UserSortingTypes.SORT_EMAIL },
  ],
});
