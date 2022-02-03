import dagre from 'dagre';
import { Task } from '../redux/roadmaps/types';
import { TaskRelationType } from '../../../shared/types/customTypes';

export enum TaskRelationTableType {
  Requires,
  Precedes,
  Contributes,
}

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

export const reachable = (
  task: number,
  graph: GroupedRelation[],
  type: 'target' | 'source',
) => {
  const from = type === 'target' ? 'from' : 'to';
  const to = type === 'target' ? 'to' : 'from';
  const visited = new Set<number>();
  const queue = [task];
  while (queue.length > 0) {
    const t = queue.pop()!;
    visited.add(t);
    graph.forEach((group) => {
      if (group.synergies.includes(t)) {
        group.synergies.forEach((s) => {
          if (!visited.has(s)) queue.push(s);
        });
      }
      group.dependencies.forEach((edge) => {
        if (edge[from] === t && !visited.has(edge[to])) queue.push(edge[to]);
      });
    });
  }
  return visited;
};

export const blockedGroups = (task: number, graph: GroupedRelation[]) => {
  const taskToGroup = new Map(
    graph.flatMap(({ synergies }, i) => synergies.map((s) => [s, i])),
  );
  const visited = new Set<string>();
  graph.forEach(({ dependencies }) => {
    dependencies.forEach(({ from, to }) => {
      if (from !== task && to !== task) return;
      const start = from === task ? to : from;
      const direction = from === task ? 'target' : 'source';
      reachable(start, graph, direction).forEach((x) =>
        visited.add(taskToGroup.get(x)!.toString()),
      );
    });
  });
  return visited;
};

export const getTaskRelations = (
  task: Task,
  tableType: TaskRelationTableType,
  tasks?: Task[],
) => {
  if (tableType === TaskRelationTableType.Contributes)
    return task.relations
      ?.filter(({ type }) => type === TaskRelationType.Synergy)
      .map(({ to }) => to);
  if (tableType === TaskRelationTableType.Precedes)
    return task.relations
      ?.filter(({ type }) => type === TaskRelationType.Dependency)
      .map(({ to }) => to);
  return tasks
    ?.filter(({ relations }) =>
      relations?.some(
        ({ to, type }) =>
          to === task.id && type === TaskRelationType.Dependency,
      ),
    )
    .map(({ id }) => id);
};
