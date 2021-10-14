import { FC } from 'react';
import classNames from 'classnames';
import { getMarkerEnd, getBezierPath } from 'react-flow-renderer';
import css from './TaskMapEdge.module.scss';

const classes = classNames.bind(css);

const DrawPath: FC<any> = ({ id, d, markerEnd }) => {
  return (
    <>
      <path
        id={id}
        className={`react-flow__edge-path ${classes(css.edgePath)}`}
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
    targetY,
    targetPosition,
  });
  const markerEnd = getMarkerEnd(arrowHeadType, markerEndId);
  return <DrawPath id={id} d={d} markerEnd={markerEnd} />;
};
