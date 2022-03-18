import { FC, MouseEvent } from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { shallowEqual, useSelector } from 'react-redux';
import { userRoleSelector } from '../redux/user/selectors';
import { RoleType } from '../../../shared/types/customTypes';
import { SearchField } from './SearchField';
import css from './TopBar.module.scss';

const classes = classNames.bind(css);

export const TopBar: FC<{
  searchType: string;
  addType: string;
  onSearchChange: (value: string) => void;
  onAddClick: (e: MouseEvent) => void;
  topMargin?: true;
  showAddButtonsToRoles: RoleType[];
}> = ({
  searchType,
  addType,
  onSearchChange,
  onAddClick,
  topMargin,
  children,
  showAddButtonsToRoles,
}) => {
  const { t } = useTranslation();
  const role = useSelector(userRoleSelector, shallowEqual);

  return (
    <div className={classes(css.topBar, { [css.topMargin]: topMargin })}>
      <SearchField
        placeholder={t('Search for type', { searchType })}
        onChange={onSearchChange}
      />
      {children}
      <div className={classes(css.rightSide)}>
        {role && showAddButtonsToRoles.includes(role) && (
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
