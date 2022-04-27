import { FC } from 'react';
import { ReactComponent as RelationSvg } from '../icons/relation.svg';
import { ReactComponent as BadRelationSvg } from '../icons/bad-relation.svg';
import { TaskRelationTableType } from '../utils/TaskRelationUtils';
import colors from '../colors.module.scss';

const relationColors = {
  [TaskRelationTableType.Contributes]: colors.azure,
  [TaskRelationTableType.Precedes]: colors.orange,
  [TaskRelationTableType.Requires]: colors.raspberry,
};

export const RelationIcon: FC<{
  type: TaskRelationTableType;
  size: number;
  incorrect?: boolean;
}> = ({ type, size, incorrect }) => {
  const Icon = incorrect ? BadRelationSvg : RelationSvg;
  return (
    <Icon
      style={{
        width: size,
        height: size,
        ['--icon--color' as any]: relationColors[type],
      }}
    />
  );
};
