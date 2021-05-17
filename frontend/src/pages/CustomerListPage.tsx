import React, { useEffect, useState } from 'react';
import { ArrowDownCircle, ArrowUpCircle, Search } from 'react-bootstrap-icons';
import { Trans, useTranslation } from 'react-i18next';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { TableCustomerRow } from '../components/TableCustomerRow';
import { StoreDispatchType } from '../redux/index';
import { roadmapsActions } from '../redux/roadmaps';
import { allCustomersSelector } from '../redux/roadmaps/selectors';
import { Customer } from '../redux/roadmaps/types';
import { RootState } from '../redux/types';
import {
  SortingOrders,
  SortingTypes,
  sortCustomers,
} from '../utils/CustomerUtils';
import '../shared.scss';

interface TableHeader {
  label: string;
  sorting: SortingTypes;
}

export const CustomerListPage = () => {
  const { t } = useTranslation();
  const [searchString, setSearchString] = useState('');
  const [sortingType, setSortingType] = useState(SortingTypes.NO_SORT);
  const [sortingOrder, setSortingOrder] = useState(SortingOrders.ASCENDING);
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
      name.toLowerCase().includes(searchString),
    );
    return sortCustomers(searched || [], sortingType, sortingOrder);
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

  const tableHeaders: TableHeader[] = [
    { label: 'Name', sorting: SortingTypes.SORT_NAME },
    { label: 'Value', sorting: SortingTypes.SORT_VALUE },
  ];

  const CustomersTable = () => (
    <table className="styledTable">
      <thead>
        <tr>
          {tableHeaders.map((header) => {
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
      {Topbar()}
      {getRenderCustomerList().length > 0 ? (
        <CustomersTable />
      ) : (
        <Trans i18nKey="No customers found" />
      )}
    </>
  );
};
