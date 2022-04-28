import { useState, useEffect } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { skipToken } from '@reduxjs/toolkit/query/react';
import classNames from 'classnames';
import { TaskTableRated } from '../components/TaskTableRated';
import { TaskTableUnrated } from '../components/TaskTableUnrated';
import { Checkbox } from '../components/forms/Checkbox';
import { StoreDispatchType } from '../redux/index';
import { modalsActions } from '../redux/modals/index';
import { ModalTypes } from '../components/modals/types';
import { Task } from '../redux/roadmaps/types';
import { RootState } from '../redux/types';
import { userInfoSelector } from '../redux/user/selectors';
import { UserInfo } from '../redux/user/types';
import { RoleType } from '../../../shared/types/customTypes';
import { FilterTypes, isUnrated, taskFilter } from '../utils/TaskUtils';
import { partition } from '../utils/array';
import { titleCase } from '../utils/string';
import { TopBar } from '../components/TopBar';
import { chosenRoadmapIdSelector } from '../redux/roadmaps/selectors';
import { getType } from '../utils/UserUtils';
import css from './TaskListPage.module.scss';
import { apiV2, selectById } from '../api/api';

const classes = classNames.bind(css);

export const TaskListPage = () => {
  const { t } = useTranslation();
  const [checked, setChecked] = useState(true);
  const [searchString, setSearchString] = useState('');
  const [searchFilter, setSearchFilter] = useState(FilterTypes.SHOW_ALL);
  const [[unrated, rated], setTasks] = useState<[Task[], Task[]]>([[], []]);

  const userInfo = useSelector<RootState, UserInfo | undefined>(
    userInfoSelector,
    shallowEqual,
  );
  const roadmapId = useSelector(chosenRoadmapIdSelector);
  const { data: tasks } = apiV2.useGetTasksQuery(roadmapId ?? skipToken);
  const { data: users } = apiV2.useGetRoadmapUsersQuery(roadmapId ?? skipToken);
  const { data: customers } = apiV2.useGetCustomersQuery(
    roadmapId ?? skipToken,
  );
  const { data: roadmap } = apiV2.useGetRoadmapsQuery(
    undefined,
    selectById(roadmapId),
  );

  const dispatch = useDispatch<StoreDispatchType>();

  useEffect(() => {
    if (userInfo && roadmapId && tasks !== undefined)
      setTasks(
        partition(tasks, isUnrated(userInfo, roadmapId, users, customers)),
      );
  }, [customers, roadmapId, tasks, userInfo, users]);

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
    // Disable button if boardId is not selected. Working oauth is only checked
    // in the modal, as it requires live api queries.
    if (roadmap?.integrations.find((it) => it.name === name)?.boardId) {
      return (
        <button
          className={classes(css['button-small-filled'])}
          type="submit"
          onClick={onImportTasksClick(name)}
        >
          <Trans
            i18nKey="Import tasks from"
            values={{ name: titleCase(name) }}
          />
        </button>
      );
    }
    return null;
  };

  const filter = taskFilter(searchFilter, userInfo);
  const predicate = (task: Task) =>
    (!filter || filter(task)) &&
    (task.name.toLowerCase().includes(searchString) ||
      task.description.toLowerCase().includes(searchString));

  return (
    <>
      <TopBar
        searchType={t('tasks')}
        addType={t('task')}
        onSearchChange={(value) => setSearchString(value)}
        onAddClick={onAddNewTaskClick}
        showAddButtonsToRoles={[RoleType.Business, RoleType.Admin]}
        topMargin
      >
        <div className={classes(css.addNewButtonContainer)}>
          <Checkbox
            label="Show completed tasks"
            onChange={toggleCheckedClicked}
            checked={checked}
          />
          {getType(userInfo, roadmapId) === RoleType.Admin && (
            <>
              {renderImportButton('trello')}
              {renderImportButton('jira')}
            </>
          )}
        </div>
      </TopBar>
      <div className={classes(css.unratedTableContainer)}>
        <TaskTableUnrated items={unrated} filterPredicate={predicate} />
      </div>
      <div>
        <TaskTableRated items={rated} filterPredicate={predicate} />
      </div>
    </>
  );
};
