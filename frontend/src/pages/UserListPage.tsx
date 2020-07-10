import React, { useEffect, useState } from 'react';
import { ArrowDownCircle, ArrowUpCircle, Search } from 'react-bootstrap-icons';
import { Trans, useTranslation } from 'react-i18next';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import {
  HeaderSpan,
  SearchBarContainer,
  StyledTable,
  StyledTh,
  TopBar,
} from '../components/CommonLayoutComponents';
import { StyledFormControl } from '../components/forms/StyledFormControl';
import { TableUserRow } from '../components/TableUserRow';
import { StoreDispatchType } from '../redux/index';
import { roadmapsActions } from '../redux/roadmaps';
import { publicUsersSelector } from '../redux/roadmaps/selectors';
import { PublicUser } from '../redux/roadmaps/types';
import { RootState } from '../redux/types';
import { UserType } from '../redux/user/types';
import { SortingOrders, SortingTypes, sortUsers } from '../utils/UserUtils';

interface TableHeader {
  label: string;
  sorting: SortingTypes;
}

export const UserListPage = () => {
  const { t } = useTranslation();
  const [searchString, setSearchString] = useState('');
  const [sortingType, setSortingType] = useState(SortingTypes.NO_SORT);
  const [sortingOrder, setSortingOrder] = useState(SortingOrders.ASCENDING);
  const publicUsers = useSelector<RootState, PublicUser[] | undefined>(
    publicUsersSelector,
    shallowEqual,
  );
  const dispatch = useDispatch<StoreDispatchType>();

  useEffect(() => {
    if (!publicUsers) dispatch(roadmapsActions.getPublicUsers());
  }, [dispatch, publicUsers]);

  const getRenderUserList: () => PublicUser[] = () => {
    const users = publicUsers || [];
    // Filter, search, sort users
    const filtered = users.filter(
      (user) => user.type === UserType.CustomerUser,
    ); // TODO user selected filtering
    const searched = filtered.filter((user) =>
      user.username.toLowerCase().includes(searchString),
    );
    const sorted = sortUsers(searched, sortingType, sortingOrder);

    return sorted;
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

  const renderSortingArrow = () => {
    return sortingOrder === SortingOrders.ASCENDING ? (
      <ArrowUpCircle />
    ) : (
      <ArrowDownCircle />
    );
  };

  const renderTopbar = () => {
    return (
      <TopBar>
        <SearchBarContainer>
          <StyledFormControl
            placeholder={t('Search for users')}
            onChange={(e: any) => onSearchChange(e.currentTarget.value)}
          />
          <Search />
        </SearchBarContainer>
      </TopBar>
    );
  };

  const tableHeaders: TableHeader[] = [
    { label: 'Name', sorting: SortingTypes.SORT_NAME },
    { label: 'Value', sorting: SortingTypes.SORT_VALUE },
  ];

  const renderUsersTable = () => {
    return (
      <StyledTable>
        <thead>
          <tr>
            {tableHeaders.map((header) => {
              return (
                <StyledTh
                  textAlign="left"
                  clickable
                  key={header.label}
                  onClick={() => onSortingChange(header.sorting)}
                >
                  <HeaderSpan>
                    <Trans i18nKey={header.label} />
                    {sortingType === header.sorting
                      ? renderSortingArrow()
                      : null}
                  </HeaderSpan>
                </StyledTh>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {getRenderUserList().map((user) => (
            <TableUserRow key={user.id} user={user} />
          ))}
        </tbody>
      </StyledTable>
    );
  };

  return (
    <>
      {renderTopbar()}
      {getRenderUserList().length > 0 ? (
        renderUsersTable()
      ) : (
        <Trans i18nKey="No users found" />
      )}
    </>
  );
};
