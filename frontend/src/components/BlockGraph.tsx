import { useRef, CSSProperties, Ref, ReactNode } from 'react';
import classNames from 'classnames';
import css from './BlockGraph.module.scss';

const classes = classNames.bind(css);

/**
 * Linear interpolation of `values` to the interval [`low`, `high`)
 */
const mapToRange = (values: number[], low: number, high: number) => {
  const min = Math.min(...values);
  const max = Math.max(...values);
  if (min === max) {
    const mid = low + Math.floor((high - low) / 2);
    return values.map(() => mid);
  }
  return values.map(
    (x) => low + Math.floor(((x - min) / (max - min)) * (high - low)),
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
  const w = mapToRange(
    sizes.map((x) => x.width),
    limits.minWidth,
    limits.maxWidth,
  );
  const h = mapToRange(
    sizes.map((x) => x.height),
    limits.minHeight,
    limits.maxHeight,
  );
  return items.map((item, i) => ({
    item,
    scaled: {
      width: w[i],
      height: h[i],
    },
    original: sizes[i],
  }));
}

/* eslint-disable react/require-default-props */
interface BlockViewProps<T> {
  items: T[];
  dimensions: DimensionFn<T>;
  limits: DimensionLimits;
  x0?: number;
  xMin?: number;
  xMax?: number;
  children: (props: {
    item: T;
    index: number;
    width: number;
    height: number;
  }) => ReactNode;
  className?: string;
  innerRef?: Ref<HTMLDivElement>;
  style?: CSSProperties;
}

type BlockGraphProps<T> = {
  title: ReactNode;
  xLabel: ReactNode;
  yLabel: ReactNode;
  selected: number;
  setSelected: (_: number) => void;
  id: (item: T) => string | number;
  completed?: (item: T) => boolean;
} & BlockViewProps<T>;

export function BlockView<T>({
  items,
  dimensions,
  limits,
  xMin = -Infinity,
  xMax = Infinity,
  x0 = 0,
  children,
  className,
  innerRef,
  style,
}: BlockViewProps<T>) {
  let x = x0;
  return (
    <div
      ref={innerRef}
      className={classes(css.viewContainer, className)}
      style={style}
    >
      <div className={classes(css.viewItems)}>
        {sizing(items, dimensions, limits).map(
          ({ original, scaled, ...props }, index) => {
            if (x > xMax) return null;
            x += original.width;
            if (x < xMin) return null;
            if (Number.isNaN(scaled.width) || Number.isNaN(scaled.height))
              return null;
            return children({ ...scaled, ...props, index });
          },
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
  completed,
  children,
  innerRef,
  ...viewProps
}: BlockGraphProps<T>) {
  const ref = useRef<HTMLDivElement | null>(null);
  return (
    <>
      <div className={classes(css.graphOuter)}>
        {title}
        <BlockView
          innerRef={(e) => {
            if (e) ref.current = e;
            if (typeof innerRef === 'function') innerRef(e);
          }}
          {...viewProps}
          className={classes(css.graphInner)}
        >
          {({ item, index, width, height }) => (
            <div
              ref={
                index === selected
                  ? (e) => {
                      if (e) {
                        ref.current?.scrollTo({
                          top: e.offsetTop,
                          left: e.offsetLeft - ref.current.offsetLeft,
                          behavior: 'smooth',
                        });
                      }
                    }
                  : undefined
              }
              className={classes(css.graphItem, {
                [css.selected]: index === selected,
                [css.completed]: completed?.(item),
              })}
              style={{ width, height }}
              key={id(item)}
              onClick={(e) => {
                e.stopPropagation();
                setSelected(index);
              }}
              onKeyPress={(e) => {
                e.stopPropagation();
                setSelected(index);
              }}
              role="button"
              tabIndex={0}
            >
              {children({ item, index, width, height })}
            </div>
          )}
        </BlockView>
        <p className={classes(css.graphLabel)}>{xLabel}</p>
      </div>
      <p className={classes(css.graphLabel, css.vertical)}>{yLabel}</p>
    </>
  );
}
