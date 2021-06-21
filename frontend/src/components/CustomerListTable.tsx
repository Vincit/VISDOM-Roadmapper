import React, { useEffect, useState } from 'react';
import { ArrowDownCircle, ArrowUpCircle } from 'react-bootstrap-icons';
import { Trans } from 'react-i18next';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { TableCustomerRow } from './TableCustomerRow';
import { StoreDispatchType } from '../redux/index';
import { roadmapsActions } from '../redux/roadmaps';
import {
  allCustomersSelector,
  plannerCustomerWeightsSelector,
} from '../redux/roadmaps/selectors';
import { Customer, PlannerCustomerWeight } from '../redux/roadmaps/types';
import { RootState } from '../redux/types';
import {
  SortingOrders,
  CustomerSortingTypes,
  sortCustomers,
} from '../utils/CustomerUtils';

interface CustomerTableHeader {
  label: string;
  sorting: CustomerSortingTypes;
}

export const CustomerList: React.FC<{
  search: string;
}> = ({ search }) => {
  const [sortingType, setSortingType] = useState(CustomerSortingTypes.NO_SORT);
  const [sortingOrder, setSortingOrder] = useState(SortingOrders.ASCENDING);
  const plannedWeights = useSelector<RootState, PlannerCustomerWeight[]>(
    plannerCustomerWeightsSelector,
    shallowEqual,
  );
  const customers = useSelector<RootState, Customer[] | undefined>(
    allCustomersSelector,
    shallowEqual,
  );
  const dispatch = useDispatch<StoreDispatchType>();

  useEffect(() => {
    if (!customers) dispatch(roadmapsActions.getCustomers());
  }, [dispatch, customers]);

  const getRenderCustomerList: () => Customer[] = () => {
    // Filter, search, sort customers
    const searched = customers?.filter(({ name }) =>
      name.toLowerCase().includes(search),
    );
    return sortCustomers(
      searched || [],
      sortingType,
      sortingOrder,
      plannedWeights,
    );
  };

  const toggleSortOrder = () => {
    if (sortingOrder === SortingOrders.ASCENDING) {
      setSortingOrder(SortingOrders.DESCENDING);
    } else {
      setSortingOrder(SortingOrders.ASCENDING);
    }
  };

  const onSortingChange = (sorter: CustomerSortingTypes) => {
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

  const customerTableHeaders: CustomerTableHeader[] = [
    { label: 'ID', sorting: CustomerSortingTypes.SORT_COLOR },
    { label: 'Name', sorting: CustomerSortingTypes.SORT_NAME },
    { label: 'Value', sorting: CustomerSortingTypes.SORT_VALUE },
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

  return (
    <>
      <h2>Clients</h2>
      {getRenderCustomerList().length > 0 ? (
        <CustomersTable />
      ) : (
        <Trans i18nKey="No customers found" />
      )}
    </>
  );
};
