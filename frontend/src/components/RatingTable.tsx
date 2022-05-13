import {
  FC,
  CSSProperties,
  useRef,
  useState,
  useEffect,
  MouseEvent,
  useMemo,
} from 'react';
import { useSelector, shallowEqual, useDispatch } from 'react-redux';
import { Trans, useTranslation } from 'react-i18next';
import { VariableSizeList } from 'react-window';
import classNames from 'classnames';
import { Task, Taskrating } from '../redux/roadmaps/types';
import { chosenRoadmapIdSelector } from '../redux/roadmaps/selectors';
import { FilterTypes } from '../utils/TaskUtils';
import { titleCase } from '../utils/string';
import { StoreDispatchType } from '../redux';
import { RootState } from '../redux/types';
import { userInfoSelector } from '../redux/user/selectors';
import { UserInfo } from '../redux/user/types';
import { modalsActions } from '../redux/modals';
import { ModalTypes } from './modals/types';
import { TaskRatingDimension } from '../../../shared/types/customTypes';
import { BusinessIcon, WorkRoundIcon } from './RoleIcons';
import { Dropdown } from './forms/Dropdown';
import {
  TaskRatingSortingTypes,
  TaskRatingSortingTypesToText,
  taskRatingsSort,
} from '../utils/SortRatingsUtils';
import { useSorting } from '../utils/SortUtils';
import colors from '../colors.module.scss';
import css from './RatingTable.module.scss';

const classes = classNames.bind(css);

const numFormat = new Intl.NumberFormat(undefined, {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

export type RatingRow = FC<{
  rating: Taskrating;
  style?: CSSProperties;
  user: UserInfo;
  onEdit: (e: MouseEvent) => void;
  onDelete: () => void;
}>;

interface RatingTableDef {
  type: TaskRatingDimension;
  Row: RatingRow;
}

type RatingTableProps = {
  task: Task;
  ratings: Taskrating[];
  avg: number;
  searchFilter?: FilterTypes;
  rowHeight?: number;
  height?: number;
};

export const ratingTable: (def: RatingTableDef) => FC<RatingTableProps> = ({
  Row,
  type,
}) => ({ task, ratings, avg, height = 800 }) => {
  const dispatch = useDispatch<StoreDispatchType>();
  const userInfo = useSelector<RootState, UserInfo | undefined>(
    userInfoSelector,
    shallowEqual,
  )!;
  const listRef = useRef<VariableSizeList<any> | null>(null);
  const [divRef, setDivRef] = useState<HTMLDivElement | null>(null);
  const { t } = useTranslation();
  const [sort, sorting] = useSorting(
    taskRatingsSort,
    TaskRatingSortingTypes.SORT_FOR_CUSTOMER,
  );
  const [scrollBarWidth, setScrollBarWidth] = useState(0);
  const [rowHeights, setRowHeights] = useState<number[]>([]);
  const [listHeight, setListHeight] = useState(0);
  const typeString =
    type === TaskRatingDimension.BusinessValue ? 'value' : 'complexity';
  const roadmapId = useSelector(chosenRoadmapIdSelector);

  const sorted = useMemo(() => sort(ratings), [ratings, sort]);

  useEffect(() => {
    if (!divRef) return;
    const heights = sorted.map(({ comment }) => {
      if (comment.length === 0)
        return type === TaskRatingDimension.Complexity ? 60 : 70;

      divRef.textContent = comment;
      const textHeight = divRef.offsetHeight;
      divRef.textContent = '';

      return textHeight + (type === TaskRatingDimension.Complexity ? 90 : 110);
    });
    setRowHeights(heights);
    setListHeight(heights.reduce((a, b) => a + b, 0));
    listRef.current!.resetAfterIndex(0);
  }, [sorted, divRef]);

  const openRateModal = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(
      modalsActions.showModal({
        modalType: ModalTypes.RATE_TASK_MODAL,
        modalProps: {
          task,
          edit: true,
        },
      }),
    );
  };

  const openDeleteModal = (rating: Taskrating) => {
    if (!roadmapId) return;
    dispatch(
      modalsActions.showModal({
        modalType: ModalTypes.REMOVE_RATING_MODAL,
        modalProps: {
          roadmapId,
          rating,
        },
      }),
    );
  };

  return (
    <div className={classes(css.ratingContainer)}>
      <div className={classes(css.titleContainer)}>
        <h3>{titleCase(t(typeString))}</h3>
        <div className={classes(css.rightSide)}>
          <Trans i18nKey="List order" />
          <Dropdown
            css={css}
            title={t(TaskRatingSortingTypesToText(sorting.type.get()))}
            maxLength={20}
          >
            {Object.values(TaskRatingSortingTypes)
              .filter(
                (sortingType): sortingType is TaskRatingSortingTypes =>
                  typeof sortingType !== 'string',
              )
              .map((value) => (
                <button
                  className={classes(css.dropItem)}
                  key={value}
                  onClick={() => sorting.type.set(value)}
                  type="button"
                >
                  {t(TaskRatingSortingTypesToText(value))}
                </button>
              ))}
          </Dropdown>
        </div>
      </div>
      <div
        style={{ marginRight: scrollBarWidth }}
        className={classes(css.subtitleContainer)}
      >
        <div>{t('Average type', { type: t(typeString) })}</div>
        <div className={classes(css.rightSide)}>
          {type === TaskRatingDimension.BusinessValue ? (
            <BusinessIcon color={colors.black100} size="small" />
          ) : (
            <WorkRoundIcon color={colors.black100} size="small" />
          )}
          <div className={classes(css.value)}>{numFormat.format(avg)}</div>
        </div>
      </div>
      <hr />
      <VariableSizeList
        ref={listRef}
        itemSize={(idx) => rowHeights[idx] ?? 0}
        itemCount={sorted.length}
        height={Math.min(height, listHeight)}
        width="100%"
        outerRef={(div) => {
          setScrollBarWidth(
            div && listHeight >= height ? div.offsetWidth - div.clientWidth : 0,
          );
        }}
      >
        {({ index, style }) => (
          <Row
            style={style}
            rating={sorted[index]}
            user={userInfo}
            onEdit={openRateModal}
            onDelete={() => openDeleteModal(sorted[index])}
          />
        )}
      </VariableSizeList>
      <div ref={setDivRef} className={classes(css.measureComment)} />
    </div>
  );
};
