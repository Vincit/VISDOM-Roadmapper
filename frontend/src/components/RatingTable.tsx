import { FC, CSSProperties, useRef, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { VariableSizeList } from 'react-window';
import classNames from 'classnames';
import { Taskrating } from '../redux/roadmaps/types';
import { FilterTypes } from '../utils/TaskUtils';
import { titleCase } from '../utils/string';
import { TaskRatingDimension } from '../../../shared/types/customTypes';
import { BusinessIcon, WorkRoundIcon } from './RoleIcons';
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
}>;

interface RatingTableDef {
  type: TaskRatingDimension;
  Row: RatingRow;
}

type RatingTableProps = {
  ratings: Taskrating[];
  avg: number;
  searchFilter?: FilterTypes;
  rowHeight?: number;
  height?: number;
};

export const ratingTable: (def: RatingTableDef) => FC<RatingTableProps> = ({
  Row,
  type,
}) => ({ ratings, avg, height = 500 }) => {
  const listRef = useRef<VariableSizeList<any> | null>(null);
  const [divRef, setDivRef] = useState<HTMLDivElement | null>(null);
  const { t } = useTranslation();
  const [scrollBarWidth, setScrollBarWidth] = useState(0);
  const [rowHeights, setRowHeights] = useState<number[]>([]);
  const [listHeight, setListHeight] = useState(0);
  const typeString =
    type === TaskRatingDimension.BusinessValue ? 'value' : 'work';

  useEffect(() => {
    if (!divRef) return;
    const heights = ratings.map(({ comment }) => {
      if (comment.length === 0)
        return type === TaskRatingDimension.RequiredWork ? 60 : 70;

      divRef.textContent = comment;
      const textHeight = divRef.offsetHeight;
      divRef.textContent = '';

      return (
        textHeight + (type === TaskRatingDimension.RequiredWork ? 90 : 110)
      );
    });
    setRowHeights(heights);
    setListHeight(heights.reduce((a, b) => a + b, 0));
    listRef.current!.resetAfterIndex(0);
  }, [ratings, divRef]);

  return (
    <div className={classes(css.ratingContainer)}>
      <div className={classes(css.titleContainer)}>
        <h2>{t('Ratings title', { type: titleCase(t(typeString)) })}</h2>
      </div>
      <div
        style={{ marginRight: scrollBarWidth }}
        className={classes(css.subtitleContainer)}
      >
        <div>{t('Average type', { type: t(typeString) })}</div>
        <div className={classes(css.value)}>
          {type === TaskRatingDimension.BusinessValue ? (
            <BusinessIcon color={colors.black100} size="small" />
          ) : (
            <WorkRoundIcon color={colors.black100} size="small" />
          )}
          {numFormat.format(avg)}
        </div>
      </div>
      <hr />
      <VariableSizeList
        ref={listRef}
        itemSize={(idx) => rowHeights[idx] ?? 0}
        itemCount={ratings.length}
        height={Math.min(height, listHeight)}
        width="100%"
        outerRef={(div) => {
          setScrollBarWidth(
            div && listHeight >= height ? div.offsetWidth - div.clientWidth : 0,
          );
        }}
      >
        {({ index, style }) => <Row style={style} rating={ratings[index]} />}
      </VariableSizeList>
      <div ref={setDivRef} className={classes(css.measureComment)} />
    </div>
  );
};
