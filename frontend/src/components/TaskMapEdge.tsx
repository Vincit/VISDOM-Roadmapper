import { FC } from 'react';
import classNames from 'classnames';
import { getMarkerEnd, getBezierPath } from 'react-flow-renderer';
import css from './TaskMapEdge.module.scss';

const classes = classNames.bind(css);

const DrawPath: FC<any> = ({ id, d, markerEnd }) => {
  return (
    <>
      <linearGradient id="linearGradient">
        <stop className={classes(css.firstStop)} offset="30%" />
        <stop className={classes(css.secondStop)} offset="70%" />
      </linearGradient>
      <path
        id={id}
        stroke="url(#linearGradient)"
        strokeWidth="2"
        fill="none"
        d={d}
        markerEnd={markerEnd}
      />
      <path
        id={`${id}-border`}
        className={`react-flow__edge-path ${classes(css.invisiblePath)}`}
        d={d}
        markerEnd={markerEnd}
        // eslint-disable-next-line no-alert
        onClick={() => alert(`To do: remove connections = ${id}`)}
      />
    </>
  );
};

export const CustomEdge: FC<any> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  arrowHeadType,
  markerEndId,
}) => {
  const d = getBezierPath({
    sourceX: sourceX - 0.5, // There is a small gap by default, fix by moving it 0.5px to left
    sourceY,
    sourcePosition,
    targetX,
    targetY: targetY - 0.001, // If sourceY and targetY are equal, linearGradient will break and lines will be invisible
    targetPosition,
  });
  const markerEnd = getMarkerEnd(arrowHeadType, markerEndId);
  return <DrawPath id={id} d={d} markerEnd={markerEnd} />;
};
