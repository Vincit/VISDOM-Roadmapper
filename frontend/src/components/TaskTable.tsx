/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import { FC, CSSProperties, useState } from 'react';
import { ArrowDownCircle, ArrowUpCircle } from 'react-bootstrap-icons';
import { Trans, useTranslation } from 'react-i18next';
import { shallowEqual, useSelector } from 'react-redux';
import { FixedSizeList } from 'react-window';
import classNames from 'classnames';
import InfoIcon from '@material-ui/icons/InfoOutlined';
import { Task } from '../redux/roadmaps/types';
import { RootState } from '../redux/types';
import { userInfoSelector } from '../redux/user/selectors';
import { UserInfo } from '../redux/user/types';
import { InfoTooltip } from './InfoTooltip';
import {
  filterTasks,
  FilterTypes,
  SortingOrders,
  SortingTypes,
  sortTasks,
} from '../utils/TaskUtils';
import css from './TaskTable.module.scss';

const classes = classNames.bind(css);

interface TableHeader {
  label: string;
  sorting?: SortingTypes;
  textAlign?: 'end' | 'left' | 'center';
  width?: string;
}

export type TaskRow = FC<{
  task: Task;
  style?: CSSProperties;
}>;

interface TaskTableDef {
  header: TableHeader[];
  title: string;
  Row: TaskRow;
}

type TaskTableProps = {
  tasks: Task[];
  searchString?: string;
  searchFilter?: FilterTypes;
  rowHeight?: number;
  height?: number;
};

export const taskTable: (def: TaskTableDef) => FC<TaskTableProps> = ({
  header,
  Row,
  title,
}) => ({ tasks, searchString, searchFilter, rowHeight = 80, height = 600 }) => {
  const userInfo = useSelector<RootState, UserInfo | undefined>(
    userInfoSelector,
    shallowEqual,
  );

  const { t } = useTranslation();
  const [sortingType, setSortingType] = useState(SortingTypes.NO_SORT);
  const [sortingOrder, setSortingOrder] = useState(SortingOrders.ASCENDING);

  const [scrollBarWidth, setScrollBarWidth] = useState(0);

  // Filter, search, sort tasks
  const filtered =
    searchFilter === undefined
      ? tasks
      : filterTasks(tasks, searchFilter, userInfo?.id);

  const searched = !searchString
    ? filtered
    : filtered.filter(
        (task) =>
          task.name.toLowerCase().includes(searchString) ||
          task.description.toLowerCase().includes(searchString),
      );

  const sorted = sortTasks(searched, sortingType, sortingOrder);

  if (sorted.length === 0) return null;

  const toggleSortOrder = () => {
    if (sortingOrder === SortingOrders.ASCENDING) {
      setSortingOrder(SortingOrders.DESCENDING);
    } else {
      setSortingOrder(SortingOrders.ASCENDING);
    }
  };

  const onSortingChange = (sorter?: SortingTypes) => {
    if (sorter === undefined) return;
    if (sorter === sortingType) {
      toggleSortOrder();
    } else {
      setSortingOrder(SortingOrders.ASCENDING);
    }
    setSortingType(sorter);
  };

  const renderSortingArrow = () =>
    sortingOrder === SortingOrders.ASCENDING ? (
      <ArrowUpCircle />
    ) : (
      <ArrowDownCircle />
    );

  const gridTemplateColumns = header
    .map(({ width }) => width || '1fr')
    .join(' ');

  return (
    <div>
      <div className={classes(css.titleContainer)}>
        <h2 className={classes(css.title)}>
          <Trans i18nKey={title} /> ({sorted.length})
        </h2>
        <InfoTooltip title={t('tooltipMessage')}>
          <InfoIcon className={classes(css.tooltipIcon, css.infoIcon)} />
        </InfoTooltip>
      </div>
      <div
        style={{ marginRight: scrollBarWidth, gridTemplateColumns }}
        className={classes(css.taskTableRow)}
      >
        {header.map(({ label, textAlign, sorting }) => (
          <div
            key={label}
            className={classes(css.taskTableHeader, {
              [css.clickable]: sorting !== undefined,
              textAlignEnd: textAlign === 'end',
              textAlignCenter: textAlign === 'center',
            })}
            onClick={() => onSortingChange(sorting)}
          >
            <Trans i18nKey={label} />
            {sortingType === sorting ? renderSortingArrow() : null}
          </div>
        ))}
      </div>
      <hr style={{ width: '100%' }} />
      <FixedSizeList
        itemSize={rowHeight}
        itemCount={sorted.length}
        height={Math.min(height, rowHeight * sorted.length)}
        width="100%"
        outerRef={(div) => {
          setScrollBarWidth(div ? div.offsetWidth - div.clientWidth : 0);
        }}
      >
        {({ index, style }) => (
          <Row style={{ gridTemplateColumns, ...style }} task={sorted[index]} />
        )}
      </FixedSizeList>
    </div>
  );
};
