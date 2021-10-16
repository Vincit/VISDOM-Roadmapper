/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import { FC, useEffect, useState, useMemo } from 'react';
import { Trans } from 'react-i18next';
import classNames from 'classnames';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { FixedSizeList } from 'react-window';
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
import css from './TaskTable.module.scss';

const classes = classNames.bind(css);

interface CustomerTableHeader {
  label: string;
  sorting?: CustomerSortingTypes;
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

  const onSortingChange = (sorter: CustomerSortingTypes | undefined) => {
    if (sorter === undefined) return;
    if (sorter === sorting.type.get()) {
      sorting.order.toggle();
    } else {
      sorting.order.reset();
      sorting.type.set(sorter);
    }
  };

  const customerTableHeaders: CustomerTableHeader[] = [
    {
      label: 'Color',
      sorting: CustomerSortingTypes.SORT_COLOR,
      width: '0.5fr',
    },
    { label: 'Name', sorting: CustomerSortingTypes.SORT_NAME },
    { label: 'Contact information', sorting: CustomerSortingTypes.SORT_EMAIL },
    { label: 'Value', sorting: CustomerSortingTypes.SORT_VALUE },
    { label: 'Unrated tasks', sorting: CustomerSortingTypes.SORT_UNRATED },
  ];
  if (role === RoleType.Admin) customerTableHeaders.push({ label: '' });

  const gridTemplateColumns = customerTableHeaders
    .map(({ width }) => width || '1fr')
    .join(' ');

  const CustomersTable = (rowHeight = 80, height = 600) => (
    <>
      <div
        style={{ gridTemplateColumns }}
        className={classes(css.virtualizedTableRow)}
      >
        {customerTableHeaders.map(({ label, sorting: sorter }) => (
          <div
            key={label}
            className={classes(css.virtualizedTableHeader, {
              [css.clickable]: sorter !== undefined,
            })}
            onClick={() => onSortingChange(sorter)}
          >
            <Trans i18nKey={label} />
            {sorter !== undefined && sorting.type.get() === sorter && (
              <SortingArrow order={sorting.order.get()} />
            )}
          </div>
        ))}
      </div>
      <hr style={{ width: '100%' }} />
      <FixedSizeList
        itemSize={rowHeight}
        itemCount={sortedCustomers.length}
        height={Math.min(height, rowHeight * sortedCustomers.length)}
        width="100%"
      >
        {({ index, style }) => (
          <TableCustomerRow
            style={{ gridTemplateColumns, ...style }}
            key={sortedCustomers[index].id}
            customer={sortedCustomers[index]}
          />
        )}
      </FixedSizeList>
    </>
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
