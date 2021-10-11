import { FC, useEffect, useState, useMemo } from 'react';
import { Trans } from 'react-i18next';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { TableCustomerRow } from './TableCustomerRow';
import { StoreDispatchType } from '../redux/index';
import { roadmapsActions } from '../redux/roadmaps';
import {
  allCustomersSelector,
  chosenRoadmapSelector,
} from '../redux/roadmaps/selectors';
import { Customer, Roadmap } from '../redux/roadmaps/types';
import { RootState } from '../redux/types';
import { SortingArrow } from './SortingArrow';
import { useSorting } from '../utils/SortUtils';
import { userInfoSelector } from '../redux/user/selectors';
import { UserInfo } from '../redux/user/types';
import { CustomerSortingTypes, customerSort } from '../utils/SortCustomerUtils';
import { RoleType } from '../../../shared/types/customTypes';

interface CustomerTableHeader {
  label: string;
  sorting: CustomerSortingTypes;
  width?: string;
}

export const CustomerList: FC<{
  search: string;
  role: RoleType;
}> = ({ search, role }) => {
  const [sortedCustomers, setSortedCustomers] = useState<Customer[]>([]);
  const customers = useSelector<RootState, Customer[] | undefined>(
    allCustomersSelector(),
    shallowEqual,
  );
  const currentRoadmap = useSelector<RootState, Roadmap | undefined>(
    chosenRoadmapSelector,
    shallowEqual,
  );
  const userInfo = useSelector<RootState, UserInfo | undefined>(
    userInfoSelector,
    shallowEqual,
  );
  const dispatch = useDispatch<StoreDispatchType>();

  const [sort, sorting] = useSorting(
    useMemo(() => customerSort(currentRoadmap), [currentRoadmap]),
  );

  useEffect(() => {
    if (!customers && currentRoadmap)
      dispatch(roadmapsActions.getCustomers(currentRoadmap.id));
  }, [dispatch, customers, currentRoadmap]);

  useEffect(() => {
    if (!currentRoadmap) dispatch(roadmapsActions.getRoadmaps());
  }, [dispatch, currentRoadmap]);

  useEffect(() => {
    // Filter, search, sort customers
    const selected =
      role === RoleType.Admin ? customers : userInfo?.representativeFor;
    const searched = selected?.filter(({ name }) =>
      name.toLowerCase().includes(search),
    );
    setSortedCustomers(sort(searched || []));
  }, [customers, sort, search, userInfo, role]);

  const onSortingChange = (sorter: CustomerSortingTypes) => {
    if (sorter === sorting.type.get()) {
      sorting.order.toggle();
    } else {
      sorting.order.reset();
      sorting.type.set(sorter);
    }
  };

  const customerTableHeaders: CustomerTableHeader[] = [
    { label: 'Color', sorting: CustomerSortingTypes.SORT_COLOR, width: '1em' },
    { label: 'Name', sorting: CustomerSortingTypes.SORT_NAME },
    { label: 'Contact information', sorting: CustomerSortingTypes.SORT_EMAIL },
    { label: 'Value', sorting: CustomerSortingTypes.SORT_VALUE },
    { label: 'Unrated tasks', sorting: CustomerSortingTypes.SORT_UNRATED },
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
                style={{ width: header.width }}
              >
                <span className="headerSpan">
                  <Trans i18nKey={header.label} />
                  {sorting.type.get() === header.sorting && (
                    <SortingArrow order={sorting.order.get()} />
                  )}
                </span>
              </th>
            );
          })}
        </tr>
      </thead>
      <tbody>
        {sortedCustomers.map((customer) => (
          <TableCustomerRow key={customer.id} customer={customer} />
        ))}
      </tbody>
    </table>
  );

  return (
    <>
      <div className="listHeader">
        <h2>
          <Trans i18nKey="Clients" />
        </h2>
      </div>
      {sortedCustomers.length > 0 ? (
        CustomersTable()
      ) : (
        <Trans i18nKey="No customers found" />
      )}
    </>
  );
};
