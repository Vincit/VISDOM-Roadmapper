/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import { FC, CSSProperties, useState } from 'react';
import { Trans } from 'react-i18next';
import { FixedSizeList } from 'react-window';
import classNames from 'classnames';
import { SortingArrow } from './SortingArrow';
import { useSorting, SortBy } from '../utils/SortUtils';
import css from './Table.module.scss';

const classes = classNames.bind(css);

interface TableHeader<Sorting> {
  label: string;
  sorting?: Sorting;
  textAlign?: 'end' | 'left' | 'center';
  width?: string;
}

export type TableRow<ItemType> = FC<{
  item: ItemType;
  style?: CSSProperties;
}>;

type TableDef<ItemType, Sorting> = {
  header: TableHeader<Sorting>[];
  Title: string | FC<{ count: number }>;
  Row: TableRow<ItemType>;
  getSort: (t: Sorting | undefined) => SortBy<ItemType>;
};

type TableProps<ItemType> = {
  items: ItemType[];
  filterPredicate?: (item: ItemType) => boolean;
  rowHeight?: number;
  height?: number;
};

export const table: <ItemType, Sorting>(
  def: TableDef<ItemType, Sorting>,
) => FC<TableProps<ItemType>> = ({ header, Row, Title, getSort }) => ({
  items,
  filterPredicate,
  rowHeight = 80,
  height = 600,
}) => {
  const [sort, sorting] = useSorting(getSort);

  const [scrollBarWidth, setScrollBarWidth] = useState(0);

  // Filter, sort tasks
  const sorted = sort(filterPredicate ? items.filter(filterPredicate) : items);

  if (sorted.length === 0) return null;

  const onSortingChange = (sorter?: typeof header[0]['sorting']) => {
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
        {typeof Title === 'string' ? Title : <Title count={sorted.length} />}
      </div>
      <div
        style={{ marginRight: scrollBarWidth, gridTemplateColumns }}
        className={classes(css.virtualizedTableRow)}
      >
        {header.map(({ label, textAlign, sorting: sorter }) => (
          <div
            key={label}
            className={classes(css.tableHeader, {
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
          <Row style={{ gridTemplateColumns, ...style }} item={sorted[index]} />
        )}
      </FixedSizeList>
    </div>
  );
};
