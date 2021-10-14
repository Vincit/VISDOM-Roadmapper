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
      <path className={classes(css.connectionPath)} d={d} />
      <circle
        className={classes(css.connectionCircle)}
        cx={targetX}
        cy={targetY}
        r={2}
      />
    </g>
  );
};
