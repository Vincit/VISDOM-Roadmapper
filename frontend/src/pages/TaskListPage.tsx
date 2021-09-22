import { useState, useEffect } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import classNames from 'classnames';
import { TaskTableRated } from '../components/TaskTableRated';
import { TaskTableUnrated } from '../components/TaskTableUnrated';
import { Checkbox } from '../components/forms/Checkbox';
import { StoreDispatchType } from '../redux/index';
import { modalsActions } from '../redux/modals/index';
import { ModalTypes } from '../components/modals/types';
import { Roadmap, Task } from '../redux/roadmaps/types';
import { RootState } from '../redux/types';
import { userInfoSelector } from '../redux/user/selectors';
import { UserInfo } from '../redux/user/types';
import { RoleType } from '../../../shared/types/customTypes';
import { FilterTypes, isUnrated } from '../utils/TaskUtils';
import { partition } from '../utils/array';
import { titleCase } from '../utils/string';
import { TopBar } from '../components/TopBar';
import {
  chosenRoadmapSelector,
  allTasksSelector,
} from '../redux/roadmaps/selectors';
import { getType } from '../utils/UserUtils';
import css from './TaskListPage.module.scss';

const classes = classNames.bind(css);

export const TaskListPage = () => {
  const { t } = useTranslation();
  const tasks = useSelector(allTasksSelector(), shallowEqual);
  const [checked, setChecked] = useState(true);
  const [searchString, setSearchString] = useState('');
  const [searchFilter, setSearchFilter] = useState(FilterTypes.SHOW_ALL);
  const [[unrated, rated], setTasks] = useState<[Task[], Task[]]>([[], []]);

  const userInfo = useSelector<RootState, UserInfo | undefined>(
    userInfoSelector,
    shallowEqual,
  );
  const currentRoadmap = useSelector<RootState, Roadmap | undefined>(
    chosenRoadmapSelector,
    shallowEqual,
  );

  const dispatch = useDispatch<StoreDispatchType>();

  useEffect(() => {
    if (userInfo && currentRoadmap)
      setTasks(partition(tasks, isUnrated(userInfo, currentRoadmap)));
  }, [currentRoadmap, tasks, userInfo]);

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

  return (
    <>
      <div className={classes(css.taskListTopBar)}>
        <TopBar
          searchType={t('tasks')}
          addType={t('task')}
          onSearchChange={(value) => setSearchString(value)}
          onAddClick={onAddNewTaskClick}
        >
          <div className={classes(css.addNewButtonContainer)}>
            <Checkbox
              label="Show completed tasks"
              onChange={toggleCheckedClicked}
              checked={checked}
            />
            {getType(userInfo?.roles, currentRoadmap?.id) ===
              RoleType.Admin && (
              <>
                {renderImportButton('trello')}
                {renderImportButton('jira')}
              </>
            )}
          </div>
        </TopBar>
      </div>
      <div className={classes(css.unratedTableContainer)}>
        <TaskTableUnrated
          tasks={unrated}
          searchString={searchString}
          searchFilter={searchFilter}
        />
      </div>
      <div>
        <TaskTableRated
          tasks={rated}
          searchString={searchString}
          searchFilter={searchFilter}
        />
      </div>
    </>
  );
};
