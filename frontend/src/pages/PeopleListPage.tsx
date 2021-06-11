import React, { useEffect, useState } from 'react';
import { ArrowDownCircle, ArrowUpCircle, Search } from 'react-bootstrap-icons';
import { Trans, useTranslation } from 'react-i18next';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import classNames from 'classnames';
import { TableCustomerRow } from '../components/TableCustomerRow';
import { TableTeamMemberRow } from '../components/TableTeamMemberRow';
import { StoreDispatchType } from '../redux/index';
import { roadmapsActions } from '../redux/roadmaps';
import {
  allCustomersSelector,
  roadmapUsersSelector,
} from '../redux/roadmaps/selectors';
import { Customer, RoadmapUser } from '../redux/roadmaps/types';
import { RootState } from '../redux/types';
import {
  SortingOrders,
  SortingTypes,
  sortCustomers,
} from '../utils/CustomerUtils';
import '../shared.scss';
import { RoleType } from '../redux/user/types';
import css from './PeopleListPage.module.scss';

const classes = classNames.bind(css);

interface TableHeader {
  label: string;
  sorting: SortingTypes;
}

export const PeopleListPage = () => {
  const { t } = useTranslation();
  const [searchString, setSearchString] = useState('');
  const [sortingType, setSortingType] = useState(SortingTypes.NO_SORT);
  const [sortingOrder, setSortingOrder] = useState(SortingOrders.ASCENDING);
  const customers = useSelector<RootState, Customer[] | undefined>(
    allCustomersSelector,
    shallowEqual,
  );
  const teamMembers = useSelector<RootState, RoadmapUser[] | undefined>(
    roadmapUsersSelector,
    shallowEqual,
  );
  const dispatch = useDispatch<StoreDispatchType>();

  useEffect(() => {
    if (!customers) dispatch(roadmapsActions.getCustomers());
  }, [dispatch, customers]);

  useEffect(() => {
    if (!teamMembers) dispatch(roadmapsActions.getRoadmapUsers());
  }, [dispatch, teamMembers]);

  const getRenderCustomerList: () => Customer[] = () => {
    // Filter, search, sort customers
    const searched = customers?.filter(({ name }) =>
      name.toLowerCase().includes(searchString),
    );
    return sortCustomers(searched || [], sortingType, sortingOrder);
  };

  const getRenderTeamMemberList: () => RoadmapUser[] | undefined = () => {
    return teamMembers?.filter((member) => member.type !== RoleType.Customer);
  };

  const onSearchChange = (value: string) => {
    setSearchString(value.toLowerCase());
  };

  const toggleSortOrder = () => {
    if (sortingOrder === SortingOrders.ASCENDING) {
      setSortingOrder(SortingOrders.DESCENDING);
    } else {
      setSortingOrder(SortingOrders.ASCENDING);
    }
  };

  const onSortingChange = (sorter: SortingTypes) => {
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

  const Topbar = () => (
    <div className="topBar">
      <div className="searchBarContainer">
        <input
          className="search"
          placeholder={t('Search for customers')}
          onChange={(e: any) => onSearchChange(e.currentTarget.value)}
        />
        <Search />
      </div>
    </div>
  );

  const customerTableHeaders: TableHeader[] = [
    { label: 'ID', sorting: SortingTypes.SORT_NAME },
    { label: 'Name', sorting: SortingTypes.SORT_NAME },
    { label: 'Value', sorting: SortingTypes.SORT_VALUE },
  ];

  const CustomersTable = () => (
    <table className="styledTable">
      <thead>
        <tr>
          {customerTableHeaders.map((header) => {
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
        {getRenderCustomerList().map((customer) => (
          <TableCustomerRow key={customer.id} customer={customer} />
        ))}
      </tbody>
    </table>
  );

  const teamMemberTableHeaders: any = [{ label: 'Role' }, { label: 'Name' }];

  const TeamMemberTable = () => (
    <table className="styledTable">
      <thead>
        <tr>
          {teamMemberTableHeaders.map((header: any) => {
            return (
              <th className="styledTh" key={header.label}>
                <span className="headerSpan">
                  <Trans i18nKey={header.label} />
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
      {Topbar()}
      <div className={classes(css.listContainer, css.clients)}>
        <h2>Clients</h2>
        {getRenderCustomerList().length > 0 ? (
          <CustomersTable />
        ) : (
          <Trans i18nKey="No customers found" />
        )}
      </div>
      <div className={classes(css.listContainer)}>
        <h2>Team members</h2>
        {getRenderTeamMemberList() ? (
          <TeamMemberTable />
        ) : (
          <Trans i18nKey="No team members found" />
        )}
      </div>
    </>
  );
};
