import { useState } from 'react';
import { Search } from 'react-bootstrap-icons';
import { Trans, useTranslation } from 'react-i18next';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import classNames from 'classnames';
import { TaskTableRated, TaskTableUnrated } from '../components/TaskTable';
import { Checkbox } from '../components/forms/Checkbox';
import { StoreDispatchType } from '../redux/index';
import { modalsActions } from '../redux/modals/index';
import { ModalTypes } from '../components/modals/types';
import { Roadmap } from '../redux/roadmaps/types';
import { RootState } from '../redux/types';
import { userInfoSelector } from '../redux/user/selectors';
import { UserInfo } from '../redux/user/types';
import { RoleType } from '../../../shared/types/customTypes';
import { FilterTypes } from '../utils/TaskUtils';
import { titleCase } from '../utils/string';
import css from './TaskListPage.module.scss';
import {
  chosenRoadmapSelector,
  allTasksSelector,
} from '../redux/roadmaps/selectors';
import { getType } from '../utils/UserUtils';

const classes = classNames.bind(css);

export const TaskListPage = () => {
  const { t } = useTranslation();
  const tasks = useSelector(allTasksSelector(), shallowEqual);
  const [checked, setChecked] = useState(true);
  const [searchString, setSearchString] = useState('');
  const [searchFilter, setSearchFilter] = useState(FilterTypes.SHOW_ALL);

  const userInfo = useSelector<RootState, UserInfo | undefined>(
    userInfoSelector,
    shallowEqual,
  );
  const currentRoadmap = useSelector<RootState, Roadmap | undefined>(
    chosenRoadmapSelector,
    shallowEqual,
  );

  const dispatch = useDispatch<StoreDispatchType>();

  const onSearchChange = (value: string) => {
    setSearchString(value.toLowerCase());
  };

  const toggleCheckedClicked = () => {
    setChecked(!checked);
    if (checked) setSearchFilter(FilterTypes.NOT_COMPLETED);
    else setSearchFilter(FilterTypes.SHOW_ALL);
  };

  const onAddNewTaskClick = (e: any) => {
    e.preventDefault();
    dispatch(
      modalsActions.showModal({
        modalType: ModalTypes.ADD_TASK_MODAL,
        modalProps: {},
      }),
    );
  };

  const onImportTasksClick = (name: string) => (e: any) => {
    e.preventDefault();
    dispatch(
      modalsActions.showModal({
        modalType: ModalTypes.IMPORT_TASKS_MODAL,
        modalProps: { name },
      }),
    );
  };

  const renderImportButton = (name: string) => {
    // TODO: disable button if oauth is not completed
    // or maybe open the oauth modal first then
    if (currentRoadmap?.integrations.some((it) => it.name === name)) {
      return (
        <button
          className={classes(css['button-small-filled'])}
          type="submit"
          onClick={onImportTasksClick(name)}
        >
          <Trans i18nKey="Import tasks from" /> {titleCase(name)}
        </button>
      );
    }
    return null;
  };

  const renderTopbar = () => {
    return (
      <div className={classes(css.topBar)}>
        <div className={classes(css.searchBarContainer)}>
          <>
            <input
              className={classes(css.search)}
              placeholder={t('Search for tasks')}
              onChange={(e) => onSearchChange(e.currentTarget.value)}
            />
            <Search />
          </>
        </div>
        <div className={classes(css.addNewButtonContainer)}>
          <Checkbox
            label="Show completed tasks"
            onChange={toggleCheckedClicked}
            checked={checked}
          />
          {getType(userInfo?.roles, currentRoadmap?.id) === RoleType.Admin && (
            <>
              {renderImportButton('trello')}
              {renderImportButton('jira')}
              <button
                className={classes(css['button-small-filled'])}
                type="submit"
                onClick={onAddNewTaskClick}
              >
                + <Trans i18nKey="Add new task" />
              </button>
            </>
          )}
        </div>
      </div>
    );
  };
  return (
    <>
      {renderTopbar()}
      <div className={classes(css.unratedTableContainer)}>
        <TaskTableUnrated
          tasks={tasks}
          searchString={searchString}
          searchFilter={searchFilter}
        />
      </div>
      <div>
        <TaskTableRated
          tasks={tasks}
          searchString={searchString}
          searchFilter={searchFilter}
        />
      </div>
    </>
  );
};
