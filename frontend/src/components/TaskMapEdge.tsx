import { FC, MouseEvent, useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import classNames from 'classnames';
import { getMarkerEnd, getBezierPath } from 'react-flow-renderer';
import { chosenRoadmapIdSelector } from '../redux/roadmaps/selectors';
import css from './TaskMapEdge.module.scss';
import { apiV2 } from '../api/api';

const classes = classNames.bind(css);

const DrawPath: FC<any> = ({
  id,
  d,
  markerEnd,
  disableInteraction,
  isLoading,
  setIsLoading,
}) => {
  const [selected, setSelected] = useState<string | undefined>(undefined);
  const roadmapId = useSelector(chosenRoadmapIdSelector);
  const [removeTaskRelation] = apiV2.useRemoveTaskRelationMutation();

  // Should be given 'id' as param in the form: 'from-taskId-to-taskId'
  const deleteRelation = useCallback(
    async (tbdeleted: string) => {
      if (roadmapId === undefined) return;
      if (isLoading) return;
      const data = tbdeleted.split('-');
      setIsLoading(true);
      await removeTaskRelation({
        roadmapId,
        relation: {
          from: Number(data[1]),
          to: Number(data[3]),
          type: 0,
        },
      }).unwrap();
      setIsLoading(false);
    },
    [removeTaskRelation, roadmapId, isLoading, setIsLoading],
  );

  useEffect(() => {
    const handleBackspace = (e: KeyboardEvent) => {
      if (disableInteraction) return;
      if (selected && (e.key === 'Backspace' || e.key === 'Delete')) {
        deleteRelation(selected);
        setSelected(undefined);
      }
    };
    document.addEventListener('keydown', handleBackspace);
    return () => {
      document.removeEventListener('keydown', handleBackspace);
    };
  }, [deleteRelation, disableInteraction, selected]);

  const handleMouseClick = (e: MouseEvent) => {
    if (disableInteraction) return;
    // To do: Add functionalities for left click later.
    if (e.button === 2) deleteRelation(id);
  };

  return (
    <>
      <linearGradient
        id="linearGradient"
        className={classes({ [css.loading]: isLoading })}
      >
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
        className={`react-flow__edge-path ${classes(css.invisiblePath, {
          [css.disableInteraction]: disableInteraction,
          [css.loading]: isLoading,
        })}`}
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
  data,
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
  return (
    <DrawPath
      id={id}
      d={d}
      markerEnd={markerEnd}
      disableInteraction={data.disableInteraction}
      isLoading={data.isLoading}
      setIsLoading={data.setIsLoading}
    />
  );
};
