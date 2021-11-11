import { FC, MouseEvent } from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { shallowEqual, useSelector } from 'react-redux';
import { Search } from 'react-bootstrap-icons';
import { Roadmap } from '../redux/roadmaps/types';
import { RootState } from '../redux/types';
import { userInfoSelector } from '../redux/user/selectors';
import { UserInfo } from '../redux/user/types';
import { RoleType } from '../../../shared/types/customTypes';
import { chosenRoadmapSelector } from '../redux/roadmaps/selectors';
import { getType } from '../utils/UserUtils';
import css from './TopBar.module.scss';

const classes = classNames.bind(css);

export const TopBar: FC<{
  searchType: string;
  addType: string;
  onSearchChange: (value: string) => void;
  onAddClick: (e: MouseEvent) => void;
}> = ({ searchType, addType, onSearchChange, onAddClick, children }) => {
  const { t } = useTranslation();
  const userInfo = useSelector<RootState, UserInfo | undefined>(
    userInfoSelector,
    shallowEqual,
  );
  const currentRoadmap = useSelector<RootState, Roadmap | undefined>(
    chosenRoadmapSelector,
    shallowEqual,
  );

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
        {getType(userInfo, currentRoadmap?.id) === RoleType.Admin && (
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
