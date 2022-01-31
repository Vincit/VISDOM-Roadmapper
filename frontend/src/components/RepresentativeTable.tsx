import { Trans } from 'react-i18next';
import classNames from 'classnames';
import StarSharpIcon from '@material-ui/icons/StarSharp';
import { RoadmapUser } from '../redux/roadmaps/types';
import { RoleType } from '../../../shared/types/customTypes';
import { BusinessIcon } from './RoleIcons';
import { table, TableRow } from './Table';
import { userSort, UserSortingTypes } from '../utils/SortRoadmapUserUtils';
import css from './RepresentativeTable.module.scss';

const classes = classNames.bind(css);

const RepresentativeRow: TableRow<RoadmapUser> = ({ item: user, style }) => (
  <div style={style} className={classes(css.virtualizedTableRow)}>
    <div className={classes(css.memberIcon)}>
      {user.type === RoleType.Admin && <StarSharpIcon />}
      {user.type === RoleType.Business && <BusinessIcon />}
    </div>
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
