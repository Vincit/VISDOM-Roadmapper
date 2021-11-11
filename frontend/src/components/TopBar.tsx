import { FC, MouseEvent } from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { shallowEqual, useSelector } from 'react-redux';
import { Search } from 'react-bootstrap-icons';
import { userRoleSelector } from '../redux/user/selectors';
import { RoleType } from '../../../shared/types/customTypes';
import css from './TopBar.module.scss';

const classes = classNames.bind(css);

export const TopBar: FC<{
  searchType: string;
  addType: string;
  onSearchChange: (value: string) => void;
  onAddClick: (e: MouseEvent) => void;
}> = ({ searchType, addType, onSearchChange, onAddClick, children }) => {
  const { t } = useTranslation();
  const role = useSelector(userRoleSelector, shallowEqual);

  return (
    <div className="topBar">
      <div className="searchBarContainer">
        <input
          className="search"
          placeholder={t('Search for type', { searchType })}
          onChange={(e) => onSearchChange(e.currentTarget.value.toLowerCase())}
        />
        <Search />
      </div>
      {children}
      <div className={classes(css.rightSide)}>
        {role === RoleType.Admin && (
          <button
            className="button-small-filled"
            type="button"
            onClick={onAddClick}
          >
            + {t('Add new type', { addType })}
          </button>
        )}
      </div>
    </div>
  );
};
