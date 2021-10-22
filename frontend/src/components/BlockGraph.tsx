import { ReactNode } from 'react';
import classNames from 'classnames';
import css from './BlockGraph.module.scss';

const classes = classNames.bind(css);

const lerp = (values: number[], lo: number, hi: number) => {
  const min = Math.min(...values);
  const max = Math.max(...values);
  return values.map(
    (x) => lo + Math.floor(((x - min) / (max - min)) * (hi - lo)),
  );
};

interface DimensionLimits {
  minWidth: number;
  maxWidth: number;
  minHeight: number;
  maxHeight: number;
}

type DimensionFn<T> = (
  item: T,
  idx: number,
) => { width: number; height: number };

function sizing<T>(
  items: T[],
  dimensions: DimensionFn<T>,
  limits: DimensionLimits,
) {
  const sizes = items.map(dimensions);
  const w = lerp(
    sizes.map((x) => x.width),
    limits.minWidth,
    limits.maxWidth,
  );
  const h = lerp(
    sizes.map((x) => x.height),
    limits.minHeight,
    limits.maxHeight,
  );
  return items.map((item, i) => ({ item, width: w[i], height: h[i] }));
}

/* eslint-disable react/require-default-props */
interface BlockViewProps<T> {
  items: T[];
  origin?: number;
  dimensions: DimensionFn<T>;
  limits: DimensionLimits;
  children: (props: {
    item: T;
    index: number;
    width: number;
    height: number;
  }) => ReactNode;
  className?: string;
}

type BlockGraphProps<T> = {
  title: ReactNode;
  xLabel: ReactNode;
  yLabel: ReactNode;
  selected: number;
  setSelected: (_: number) => void;
  id: (item: T) => string | number;
  children: (props: { item: T; selected: boolean }) => ReactNode;
} & Omit<BlockViewProps<T>, 'children'>;

export function BlockView<T>({
  items,
  dimensions,
  limits,
  origin = 0,
  children,
  className,
}: BlockViewProps<T>) {
  return (
    <div className={classes(css.viewContainer, className)}>
      <div className={classes(css.viewItems)}>
        {sizing(items.slice(origin), dimensions, limits).map((props, idx) =>
          children({ ...props, index: origin + idx }),
        )}
      </div>
    </div>
  );
}

export function BlockGraph<T>({
  title,
  xLabel,
  yLabel,
  selected,
  setSelected,
  id,
  children,
  ...viewProps
}: BlockGraphProps<T>) {
  return (
    <>
      <div className={classes(css.graphOuter)}>
        {title}
        <BlockView {...viewProps} className={classes(css.graphInner)}>
          {({ item, index, width, height }) => (
            <div
              ref={
                index === selected
                  ? (e) => {
                      if (e)
                        e.scrollIntoView({
                          behavior: 'smooth',
                          block: 'nearest',
                          inline: 'center',
                        });
                    }
                  : undefined
              }
              className={classes(css.graphItem, {
                [css.selected]: index === selected,
              })}
              style={{ width, height }}
              key={id(item)}
              onClick={() => setSelected(index)}
              onKeyPress={() => setSelected(index)}
              role="button"
              tabIndex={0}
            >
              {children({ item, selected: index === selected })}
            </div>
          )}
        </BlockView>
        <p className={classes(css.graphLabel)}>{xLabel}</p>
      </div>
      <p className={classes(css.graphLabel, css.vertical)}>{yLabel}</p>
    </>
  );
}
