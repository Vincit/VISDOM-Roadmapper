import { FC, useEffect, useState, useMemo } from 'react';
import { Trans } from 'react-i18next';
import { shallowEqual, useSelector } from 'react-redux';
import { skipToken } from '@reduxjs/toolkit/query/react';
import { TableCustomerRow } from './TableCustomerRow';
import { table } from './Table';
import { chosenRoadmapIdSelector } from '../redux/roadmaps/selectors';
import { Customer } from '../redux/roadmaps/types';
import { RootState } from '../redux/types';
import { userInfoCustomersSelector } from '../redux/user/selectors';
import { CustomerSortingTypes, customerSort } from '../utils/SortCustomerUtils';
import { RoleType } from '../../../shared/types/customTypes';
import { apiV2 } from '../api/api';

export const CustomerList: FC<{
  search: string;
  role: RoleType;
}> = ({ search, role }) => {
  const [selectedCustomers, setSelectedCustomers] = useState<Customer[]>([]);
  const roadmapId = useSelector(chosenRoadmapIdSelector);
  const { data: customers } = apiV2.useGetCustomersQuery(
    roadmapId ?? skipToken,
  );
  const { data: tasks } = apiV2.useGetTasksQuery(roadmapId ?? skipToken);
  const { data: users } = apiV2.useGetRoadmapUsersQuery(roadmapId ?? skipToken);
  const userInfoCustomers = useSelector<RootState, Customer[]>(
    userInfoCustomersSelector,
    shallowEqual,
  );

  useEffect(() => {
    // Filter, search, sort customers
    const selected = role === RoleType.Admin ? customers : userInfoCustomers;
    setSelectedCustomers(selected ?? []);
  }, [customers, userInfoCustomers, role]);

  const filterPredicate = search
    ? ({ name }: Customer) => name.toLowerCase().includes(search)
    : undefined;

  const CustomersTable = useMemo(
    () =>
      table({
        Title: () => (
          <h2>
            <Trans i18nKey="Clients" />
          </h2>
        ),
        getSort: customerSort(roadmapId, tasks, users, customers),
        Row: TableCustomerRow,
        header: [
          {
            label: 'Color',
            sorting: CustomerSortingTypes.SORT_COLOR,
            width: 0.5,
          },
          { label: 'Name', sorting: CustomerSortingTypes.SORT_NAME },
          {
            label: 'Contact information',
            sorting: CustomerSortingTypes.SORT_EMAIL,
          },
          {
            label: 'Value',
            sorting: CustomerSortingTypes.SORT_VALUE,
            width: 0.5,
          },
          {
            label: 'Unrated tasks',
            sorting: CustomerSortingTypes.SORT_UNRATED,
            width: 0.5,
          },
          { label: '', width: role === RoleType.Admin ? 1 : 0.5 },
        ],
      }),
    [customers, roadmapId, role, tasks, users],
  );

  return selectedCustomers.length > 0 ? (
    <CustomersTable
      items={selectedCustomers}
      filterPredicate={filterPredicate}
    />
  ) : (
    <Trans i18nKey="No customers found" />
  );
};
