import { Model, StringReturningMethod, Modifiers } from 'objection';
import { TaskRatingDimension } from '../../types/customTypes';
import User from '../users/users.model';
import Task from '../tasks/tasks.model';

export default class TaskRating extends Model {
  id!: number;
  dimension!: TaskRatingDimension;
  value!: number;
  comment!: string;

  belongsToTask?: Task;
  createdBy?: User;

  static tableName = 'taskratings';

  static jsonSchema = {
    type: 'object',
    required: ['dimension', 'value'],
    properties: {
      id: { type: 'integer' },
      dimension: { type: 'integer', enum: [0, 1] },
      value: { type: 'number', minimum: 0, maximum: 10 },
      comment: { type: 'string' },
    },
  };

  static get relationMappings() {
    return {
      belongsToTask: {
        relation: Model.BelongsToOneRelation,
        modelClass: Task,
        join: {
          from: 'taskratings.parentTask',
          to: 'tasks.id',
        },
      },
      createdBy: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'taskratings.createdByUser',
          to: 'users.id',
        },
      },
    };
  }
}
