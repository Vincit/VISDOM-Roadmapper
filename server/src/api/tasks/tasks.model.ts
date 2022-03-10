import { QueryContext, AnyQueryBuilder } from 'objection';
import { TaskStatus } from '../../../../shared/types/customTypes';
import Model from '../BaseModel';
import Roadmap from '../roadmaps/roadmaps.model';
import TaskRating from '../taskratings/taskratings.model';
import User from '../users/users.model';

export default class Task extends Model {
  id!: number;
  name!: string;
  description!: string;
  status!: TaskStatus;
  createdAt!: string;
  importedFrom!: string | null;
  externalId!: string | null;
  externalLink!: string | null;

  belongsToRoadmap!: Roadmap;
  ratings?: TaskRating[];
  createdBy?: User;

  createdByUser?: number;

  static tableName = 'tasks';

  static jsonSchema = {
    type: 'object',
    required: ['name', 'description', 'createdByUser'],

    properties: {
      id: { type: 'integer' },
      name: { type: 'string', minLength: 1, maxLength: 255 },
      description: { type: 'string', minLength: 1, maxLength: 1000 },
      roadmapId: { type: 'integer' },
      status: {
        type: 'string',
        enum: ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED'],
      },
      createdAt: { type: 'string', format: 'date-time' },
      createdByUser: { type: 'integer' },
      importedFrom: { type: ['string', 'null'], minLength: 1, maxLength: 255 },
      externalId: { type: ['string', 'null'], minLength: 1, maxLength: 255 },
      externalLink: { type: ['string', 'null'], format: 'uri' },
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
