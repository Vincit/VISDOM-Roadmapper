import dagre from 'dagre';
import { TaskRelation } from '../redux/roadmaps/types';
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

export const groupTaskRelations = (relations: TaskRelation[]) => {
  const groups: GroupedRelation[] = [];
  const ids = new Set(relations.flatMap(({ from, to }) => [from, to]));
  ids.forEach((id) => {
    const subgroup: GroupedRelation = {
      synergies: [id],
      dependencies: [],
    };

    relations.forEach(({ from, to, type }) => {
      if (from !== id) return;
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
      reachable(start, graph, direction).forEach((x) => {
        const node = taskToGroup.get(x);
        if (node !== undefined) visited.add(node.toString());
      });
    });
  });
  return visited;
};

export const getTaskRelations = (
  task: number,
  relations: TaskRelation[],
  tableType: TaskRelationTableType,
) => {
  let predicate: (_: TaskRelation) => boolean;
  if (tableType === TaskRelationTableType.Contributes) {
    predicate = ({ from, to, type }) =>
      (from === task || to === task) && type === TaskRelationType.Synergy;
  } else if (tableType === TaskRelationTableType.Precedes) {
    predicate = ({ from, type }) =>
      from === task && type === TaskRelationType.Dependency;
  } else {
    predicate = ({ to, type }) =>
      to === task && type === TaskRelationType.Dependency;
  }
  const ids = new Set(
    relations.filter(predicate).flatMap(({ from, to }) => [from, to]),
  );
  ids.delete(task);
  return ids;
};

export type RelationAnnotation = {
  /** assuming bad relations to only be dependencies */
  badRelations: TaskRelation[];
  relation?: TaskRelationTableType | null;
};

type RelationCheckData = { id: number } & RelationAnnotation;

const equal = (a: TaskRelation, b: TaskRelation) =>
  a.from === b.from && a.to === b.to && a.type === b.type;

const setDifference = (xs: TaskRelation[], ys: TaskRelation[]) =>
  xs.filter((x) => !ys.some((y) => equal(x, y)));

/**
 * @param versions in chronological order, the first is the unordered tasks
 */
export const checkBadRelations = (
  versions: number[][],
  relations: TaskRelation[],
): RelationCheckData[][] => {
  const taskById = new Map<number, RelationCheckData>(
    versions.flatMap((tasks) =>
      tasks.map((id) => [id, { id, badRelations: [] }]),
    ),
  );
  const deps = relations.filter(
    ({ type }) => type === TaskRelationType.Dependency,
  );
  const done = new Set<number>();
  const markAsDone = ({ id }: RelationCheckData) => {
    done.add(id);
  };
  const markUnmetDependencies = (task: RelationCheckData) => {
    const unmet = deps.filter((d) => d.to === task.id && !done.has(d.from));
    const unmarked = setDifference(unmet, task.badRelations);
    task.badRelations.push(...unmarked);
    unmarked.forEach((dep) => {
      taskById.get(dep.from)?.badRelations.push(dep);
    });
  };
  return versions.map((tasks, index) => {
    const ts = tasks.map((id) => taskById.get(id)!);
    if (index > 0) {
      // mark all tasks in the current milestone as done first,
      // since dependent tasks may be in the same milestone
      ts.forEach(markAsDone);
      ts.forEach(markUnmetDependencies);
    }
    return ts;
  });
};
