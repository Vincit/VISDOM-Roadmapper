import { Model, QueryContext, AnyQueryBuilder } from 'objection';
import Roadmap from '../roadmaps/roadmaps.model';
import TaskRating from '../taskratings/taskratings.model';
import User from '../users/users.model';

export default class Task extends Model {
  id!: number;
  name!: string;
  description!: string;
  completed!: boolean;
  createdAt!: string;
  jiraId!: number;

  belongsToRoadmap!: Roadmap;
  ratings?: TaskRating[];
  createdBy?: User;

  static tableName = 'tasks';

  static jsonSchema = {
    type: 'object',
    required: ['name', 'description', 'createdByUser'],

    properties: {
      id: { type: 'integer' },
      name: { type: 'string', minLength: 1, maxLength: 255 },
      description: { type: 'string', minLength: 1, maxLength: 1000 },
      roadmapId: { type: 'integer' },
      completed: { type: 'boolean' },
      createdAt: { type: 'string' },
      createdByUser: { type: 'integer' },
    },
  };

  async $beforeInsert(context: QueryContext): Promise<void> {
    await super.$beforeInsert(context);
    if (!this.createdAt) {
      this.createdAt = new Date().toJSON();
    }
  }

  static get modifiers() {
    return {
      selectTaskId: (builder: AnyQueryBuilder) => {
        builder.select('tasks.id');
      },
    };
  }

  static get relationMappings() {
    return {
      belongsToRoadmap: {
        relation: Model.BelongsToOneRelation,
        modelClass: Roadmap,
        join: {
          from: 'tasks.roadmapId',
          to: 'roadmaps.id',
        },
      },
      ratings: {
        relation: Model.HasManyRelation,
        modelClass: TaskRating,
        join: {
          from: 'tasks.id',
          to: 'taskratings.parentTask',
        },
      },
      createdBy: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'tasks.createdByUser',
          to: 'users.id',
        },
      },
    };
  }
}
