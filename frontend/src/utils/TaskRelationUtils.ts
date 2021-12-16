import dagre from 'dagre';
import { Task } from '../redux/roadmaps/types';
import { TaskRelationType } from '../../../shared/types/customTypes';

export interface GroupedRelation {
  synergies: number[];
  dependencies: { from: number; to: number }[];
}

type MeasuredRelation = GroupedRelation & {
  id: string;
  width: number;
  height: number;
};

const existingSynergyIdxs = (subgroup: number[], groups: GroupedRelation[]) => {
  const idxs: number[] = [];
  groups.forEach(({ synergies }, idx) => {
    if (subgroup.some((num) => synergies.includes(num))) idxs.push(idx);
  });
  return idxs;
};

export const groupTaskRelations = (tasks: Task[]) => {
  const groups: GroupedRelation[] = [];
  tasks.forEach(({ id, relations }) => {
    const subgroup: GroupedRelation = {
      synergies: [id],
      dependencies: [],
    };

    relations?.forEach(({ from, to, type }) => {
      if (type === TaskRelationType.Synergy) subgroup.synergies.push(to);
      if (type === TaskRelationType.Dependency)
        subgroup.dependencies.push({ from, to });
    });

    const idxs = existingSynergyIdxs(subgroup.synergies, groups);

    idxs.reverse().forEach((idx) => {
      // remove duplicate task ids
      subgroup.synergies = Array.from(
        new Set(subgroup.synergies.concat(groups[idx].synergies)),
      );

      subgroup.dependencies = subgroup.dependencies.concat(
        groups[idx].dependencies,
      );
      groups.splice(idx, 1);
    });

    groups.push(subgroup);
  });

  return groups;
};

export const getAutolayout = (relations: MeasuredRelation[]) => {
  const graph = new dagre.graphlib.Graph();
  graph.setDefaultEdgeLabel(() => ({}));
  graph.setGraph({ rankdir: 'LR' });

  relations.forEach(({ id, width, height, dependencies }) => {
    graph.setNode(id, { width, height });

    dependencies.forEach(({ to }) => {
      const targetGroup = relations.find(({ synergies }) =>
        synergies.includes(to),
      );
      if (!targetGroup) return;
      graph.setEdge(id, targetGroup.id);
    });
  });
  dagre.layout(graph);
  return graph;
};
