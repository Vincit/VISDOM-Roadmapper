import React, { useState } from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { Search } from 'react-bootstrap-icons';
import { TeamMemberList } from '../components/TeamMemberListTable';
import { CustomerList } from '../components/CustomerListTable';

import css from './PeopleListPage.module.scss';

const classes = classNames.bind(css);

export const PeopleListPage = () => {
  const { t } = useTranslation();
  const [searchString, setSearchString] = useState('');

  const onSearchChange = (value: string) => {
    setSearchString(value.toLowerCase());
  };

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
  return (
    <>
      {Topbar()}
      <div className={classes(css.listContainer, css.clients)}>
        <CustomerList search={searchString} />
      </div>
      <div className={classes(css.listContainer)}>
        <TeamMemberList />
      </div>
    </>
  );
};
