import { FC, useEffect, useState, useMemo } from 'react';
import { Trans } from 'react-i18next';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { TableCustomerRow } from './TableCustomerRow';
import { table } from './Table';
import { StoreDispatchType } from '../redux/index';
import { roadmapsActions } from '../redux/roadmaps';
import {
  allCustomersSelector,
  chosenRoadmapSelector,
} from '../redux/roadmaps/selectors';
import { Customer, Roadmap } from '../redux/roadmaps/types';
import { RootState } from '../redux/types';
import { userInfoCustomersSelector } from '../redux/user/selectors';
import { CustomerSortingTypes, customerSort } from '../utils/SortCustomerUtils';
import { RoleType } from '../../../shared/types/customTypes';

export const CustomerList: FC<{
  search: string;
  role: RoleType;
}> = ({ search, role }) => {
  const [selectedCustomers, setSelectedCustomers] = useState<Customer[]>([]);
  const customers = useSelector<RootState, Customer[] | undefined>(
    allCustomersSelector,
    shallowEqual,
  );
  const currentRoadmap = useSelector<RootState, Roadmap | undefined>(
    chosenRoadmapSelector,
    shallowEqual,
  );
  const userInfoCustomers = useSelector<RootState, Customer[]>(
    userInfoCustomersSelector,
    shallowEqual,
  );
  const dispatch = useDispatch<StoreDispatchType>();

  useEffect(() => {
    if (!customers && currentRoadmap)
      dispatch(roadmapsActions.getCustomers(currentRoadmap.id));
  }, [dispatch, customers, currentRoadmap]);

  useEffect(() => {
    if (!currentRoadmap) dispatch(roadmapsActions.getRoadmaps());
  }, [dispatch, currentRoadmap]);

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
        getSort: customerSort(currentRoadmap),
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
    [currentRoadmap, role],
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
