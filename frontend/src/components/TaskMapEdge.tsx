import { FC, MouseEvent, useState, useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import classNames from 'classnames';
import { getMarkerEnd, getBezierPath } from 'react-flow-renderer';
import { StoreDispatchType } from '../redux';
import { roadmapsActions } from '../redux/roadmaps';
import css from './TaskMapEdge.module.scss';

const classes = classNames.bind(css);

const DrawPath: FC<any> = ({ id, d, markerEnd }) => {
  const [selected, setSelected] = useState<string | undefined>(undefined);
  const dispatch = useDispatch<StoreDispatchType>();

  // Should be given 'id' as param in the form: 'from-taskId-to-taskId'
  const deleteRelation = useCallback(
    async (tbdeleted: string) => {
      const data = tbdeleted.split('-');
      await dispatch(
        roadmapsActions.removeTaskRelation({
          from: Number(data[1]),
          to: Number(data[3]),
          type: 0,
        }),
      );
      dispatch(roadmapsActions.getRoadmaps());
    },
    [dispatch],
  );

  useEffect(() => {
    const handleBackspace = (e: KeyboardEvent) => {
      if (selected && (e.key === 'Backspace' || e.key === 'Delete')) {
        deleteRelation(selected);
        setSelected(undefined);
      }
    };
    document.addEventListener('keydown', handleBackspace);
    return () => {
      document.removeEventListener('keydown', handleBackspace);
    };
  }, [deleteRelation, dispatch, selected]);

  const handleMouseClick = (e: MouseEvent) => {
    // To do: Add functionalities for left click later.
    if (e.button === 2) deleteRelation(id);
  };

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
        onAuxClick={handleMouseClick}
        onMouseEnter={() => setSelected(id)}
        onMouseLeave={() => setSelected(undefined)}
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
