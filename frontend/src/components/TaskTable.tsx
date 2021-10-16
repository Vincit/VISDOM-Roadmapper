/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import { FC, CSSProperties, useState } from 'react';
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
import { SortingArrow } from './SortingArrow';
import { useSorting } from '../utils/SortUtils';
import {
  taskFilter,
  FilterTypes,
  SortingTypes,
  taskSort,
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
  const [sort, sorting] = useSorting(taskSort);

  const [scrollBarWidth, setScrollBarWidth] = useState(0);

  const predicate = taskFilter(searchFilter, userInfo);

  // Filter, search, sort tasks
  const filtered = predicate ? tasks.filter(predicate) : tasks;

  const searched = !searchString
    ? filtered
    : filtered.filter(
        (task) =>
          task.name.toLowerCase().includes(searchString) ||
          task.description.toLowerCase().includes(searchString),
      );

  const sorted = sort(searched);

  if (sorted.length === 0) return null;

  const onSortingChange = (sorter?: SortingTypes) => {
    if (sorter === undefined) return;
    if (sorter === sorting.type.get()) {
      sorting.order.toggle();
    } else {
      sorting.order.reset();
      sorting.type.set(sorter);
    }
  };

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
          <InfoIcon className={classes(css.tooltipIcon)} />
        </InfoTooltip>
      </div>
      <div
        style={{ marginRight: scrollBarWidth, gridTemplateColumns }}
        className={classes(css.virtualizedTableRow)}
      >
        {header.map(({ label, textAlign, sorting: sorter }) => (
          <div
            key={label}
            className={classes(css.virtualizedTableHeader, {
              [css.clickable]: sorter !== undefined,
              textAlignEnd: textAlign === 'end',
              textAlignCenter: textAlign === 'center',
            })}
            onClick={() => onSortingChange(sorter)}
          >
            <Trans i18nKey={label} />
            {sorter !== undefined && sorting.type.get() === sorter && (
              <SortingArrow order={sorting.order.get()} />
            )}
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
