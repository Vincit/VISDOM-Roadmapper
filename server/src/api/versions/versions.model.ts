import { Model } from 'objection';
import Roadmap from '../roadmaps/roadmaps.model';
import Task from '../tasks/tasks.model';

export default class Version extends Model {
  id!: number;
  roadmapId!: number;
  name!: string;
  tasks!: Task[];
  sortingRank!: number;

  static tableName = 'versions';

  static jsonSchema = {
    type: 'object',
    required: ['roadmapId', 'name'],

    properties: {
      id: { type: 'integer' },
      roadmapId: { type: 'integer' },
      name: { type: 'string', minLength: 1, maxLength: 75 },
    },
  };

  static get relationMappings() {
    return {
      belongsToRoadmap: {
        relation: Model.BelongsToOneRelation,
        modelClass: Roadmap,
        join: {
          from: 'versions.roadmapId',
          to: 'roadmaps.id',
        },
      },
      tasks: {
        relation: Model.ManyToManyRelation,
        modelClass: Task,
        join: {
          from: 'versions.id',
          through: {
            from: 'versionTasks.versionId',
            to: 'versionTasks.taskId',
          },
          to: 'tasks.id',
        },
      },
    };
  }
}
