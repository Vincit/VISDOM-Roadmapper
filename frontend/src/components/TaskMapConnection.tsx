import classNames from 'classnames';
import { FC } from 'react';
import { getBezierPath } from 'react-flow-renderer';
import css from './TaskMapConnection.module.scss';

const classes = classNames.bind(css);

export const ConnectionLine: FC<any> = ({
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
}) => {
  const d = getBezierPath({
    sourceX: sourceX + 7,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });
  return (
    <g>
      <linearGradient id="linearGradient">
        <stop className={classes(css.firstStop)} offset="30%" />
        <stop className={classes(css.secondStop)} offset="70%" />
      </linearGradient>
      <path stroke="url(#linearGradient)" strokeWidth="2" fill="none" d={d} />
      <circle
        className={classes(css.connectionCircle)}
        cx={targetX}
        cy={targetY}
        r={2}
      />
    </g>
  );
};
