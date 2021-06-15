import { Model } from 'objection';
import { TaskRatingDimension } from '../../../../shared/types/customTypes';
import User from '../users/users.model';
import Task from '../tasks/tasks.model';
import Customer from '../customer/customer.model';

export default class TaskRating extends Model {
  id!: number;
  dimension!: TaskRatingDimension;
  value!: number;
  comment!: string;

  belongsToTask?: Task;
  createdBy?: User;
  createdFor?: Customer;

  forCustomer?: number;
  createdByUser?: number;
  parentTask?: number;

  static tableName = 'taskratings';

  static jsonSchema = {
    type: 'object',
    required: ['dimension', 'value'],
    properties: {
      id: { type: 'integer' },
      dimension: {
        type: 'integer',
        enum: [
          TaskRatingDimension.RequiredWork,
          TaskRatingDimension.BusinessValue,
        ],
      },
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
      createdFor: {
        relation: Model.BelongsToOneRelation,
        modelClass: Customer,
        join: {
          from: 'taskratings.forCustomer',
          to: 'customer.id',
        },
      },
    };
  }
}
