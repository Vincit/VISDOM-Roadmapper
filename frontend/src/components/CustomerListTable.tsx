import { FC, MouseEvent, useEffect, useState, useMemo } from 'react';
import { Trans } from 'react-i18next';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import classNames from 'classnames';
import { TableCustomerRow } from './TableCustomerRow';
import { StoreDispatchType } from '../redux/index';
import { roadmapsActions } from '../redux/roadmaps';
import {
  allCustomersSelector,
  chosenRoadmapSelector,
} from '../redux/roadmaps/selectors';
import { Customer, Roadmap } from '../redux/roadmaps/types';
import { RootState } from '../redux/types';
import { modalsActions } from '../redux/modals';
import { ModalTypes } from './modals/types';
import { SortingArrow } from './SortingArrow';
import { useSorting } from '../utils/SortUtils';
import { CustomerSortingTypes, customerSort } from '../utils/SortCustomerUtils';
import css from '../pages/PeopleListPage.module.scss';

const classes = classNames.bind(css);

interface CustomerTableHeader {
  label: string;
  sorting: CustomerSortingTypes;
  width?: string;
}

export const CustomerList: FC<{
  search: string;
}> = ({ search }) => {
  const [sortedCustomers, setSortedCustomers] = useState<Customer[]>([]);
  const customers = useSelector<RootState, Customer[] | undefined>(
    allCustomersSelector(),
    shallowEqual,
  );
  const currentRoadmap = useSelector<RootState, Roadmap | undefined>(
    chosenRoadmapSelector,
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
    const searched = customers?.filter(({ name }) =>
      name.toLowerCase().includes(search),
    );
    setSortedCustomers(sort(searched || []));
  }, [customers, sort, search]);

  const onSortingChange = (sorter: CustomerSortingTypes) => {
    if (sorter === sorting.type.get()) {
      sorting.order.toggle();
    } else {
      sorting.order.reset();
      sorting.type.set(sorter);
    }
  };

  const addUserClicked = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(
      modalsActions.showModal({
        modalType: ModalTypes.ADD_CUSTOMER_MODAL,
        modalProps: {},
      }),
    );
  };

  const customerTableHeaders: CustomerTableHeader[] = [
    { label: 'Color', sorting: CustomerSortingTypes.SORT_COLOR, width: '1em' },
    { label: 'Name', sorting: CustomerSortingTypes.SORT_NAME },
    { label: 'Contact information', sorting: CustomerSortingTypes.SORT_EMAIL },
    { label: 'Value', sorting: CustomerSortingTypes.SORT_VALUE },
    { label: 'Unrated tasks', sorting: CustomerSortingTypes.SORT_UNRATED },
  ];

  const CustomersTable = () => (
    <table className={classes(css.styledTable)}>
      <thead>
        <tr>
          {customerTableHeaders.map((header) => {
            return (
              <th
                className={classes(css.styledTh, css.clickable)}
                key={header.label}
                onClick={() => onSortingChange(header.sorting)}
                style={{ width: header.width }}
              >
                <span className={classes(css.headerSpan)}>
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
      <div className={classes(css.header)}>
        <h2>Clients</h2>
        <button
          className={classes(css['button-small-filled'])}
          type="button"
          onClick={addUserClicked}
        >
          + <Trans i18nKey="Add new client" />
        </button>
      </div>
      {sortedCustomers.length > 0 ? (
        CustomersTable()
      ) : (
        <Trans i18nKey="No customers found" />
      )}
    </>
  );
};
