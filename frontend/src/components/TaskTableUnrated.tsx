import { SyntheticEvent } from 'react';
import { Link } from 'react-router-dom';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { Trans } from 'react-i18next';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import classNames from 'classnames';
import InfoIcon from '@mui/icons-material/InfoOutlined';
import { InfoTooltip } from './InfoTooltip';
import { paths } from '../routers/paths';
import { StoreDispatchType } from '../redux';
import { modalsActions } from '../redux/modals';
import { ModalTypes, ShowModalPayload } from './modals/types';
import { Task } from '../redux/roadmaps/types';
import { RootState } from '../redux/types';
import { userInfoSelector } from '../redux/user/selectors';
import { UserInfo } from '../redux/user/types';
import { RoleType } from '../../../shared/types/customTypes';
import { getType } from '../utils/UserUtils';
import css from './TaskTable.module.scss';
import { ratingSummary, SortingTypes, taskSort } from '../utils/TaskUtils';
import { table, TableRow } from './Table';
import { DeleteButton } from './forms/SvgButton';
import { MissingRatings } from './MissingRatings';
import { TaskModalButtons } from './TaskModalButtons';

const classes = classNames.bind(css);

const numFormat = new Intl.NumberFormat(undefined, {
  minimumFractionDigits: 0,
  maximumFractionDigits: 1,
});

const TableUnratedTaskRow: TableRow<Task> = ({ item: task, style }) => {
  const dispatch = useDispatch<StoreDispatchType>();
  const { name, roadmapId } = task;
  const userInfo = useSelector<RootState, UserInfo | undefined>(
    userInfoSelector,
    shallowEqual,
  );
  const roleType = getType(userInfo, roadmapId);
  const { id: userId } = useSelector(userInfoSelector, shallowEqual)!;
  const showDeleteButton =
    roleType === RoleType.Admin ||
    (task.createdByUser === userId && roleType === RoleType.Business);

  const { value, complexity } = ratingSummary(task);

  const openModal = (payload: ShowModalPayload) => (e: SyntheticEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(modalsActions.showModal(payload));
  };

  const handleTaskDelete = openModal({
    modalType: ModalTypes.REMOVE_TASK_MODAL,
    modalProps: { task },
  });

  return (
    <Link
      className={classes(css.navBarLink, css.hoverRow)}
      to={`${paths.roadmapHome}/${task.roadmapId}${paths.roadmapRelative.tasks}/${task.id}`}
    >
      <div style={style} className={classes(css.virtualizedTableRow)}>
        <div className={classes(css.taskTitle)}>{name}</div>
        <div>{numFormat.format(value().avg)}</div>
        <div>{numFormat.format(complexity())}</div>
        <div className={classes(css.missingRatings)}>
          <MissingRatings task={task} />
        </div>
        <div className={classes(css.buttonContainer)}>
          <TaskModalButtons task={task} />
          {showDeleteButton && (
            <div className={classes(css.deleteIcon)}>
              <DeleteButton onClick={handleTaskDelete} />
            </div>
          )}
          <ArrowForwardIcon className={classes(css.arrowIcon)} />
        </div>
      </div>
    </Link>
  );
};

export const TaskTableUnrated = table({
  Title: ({ count }) => (
    <>
      <h2 className={classes(css.title)}>
        <Trans i18nKey="Waiting for ratings" /> ({count})
      </h2>
      <InfoTooltip title={<Trans i18nKey="Task list tooltip" />}>
        <InfoIcon className={classes(css.tooltipIcon)} />
      </InfoTooltip>
    </>
  ),
  Row: TableUnratedTaskRow,
  getSort: taskSort,
  minUnitWidth: 110,
  header: [
    { label: 'Task title', width: 1.5, sorting: SortingTypes.SORT_NAME },
    { label: 'Current average value', sorting: SortingTypes.SORT_AVG_VALUE },
    { label: 'Current complexity', sorting: SortingTypes.SORT_COMPLEXITY },
    { label: 'Waiting for ratings' },
    { label: '', width: 2.5 },
  ],
});
