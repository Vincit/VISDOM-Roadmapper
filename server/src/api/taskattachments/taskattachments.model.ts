import { Model } from 'objection';
import Task from '../tasks/tasks.model';

export class TaskAttachment extends Model {
  link!: string;
  parentTask!: number;

  belongsToTask?: Task;

  static tableName = 'taskattachments';

  static jsonSchema = {
    type: 'object',
    required: ['link'],
    properties: {
      parentTask: { type: 'integer' },
      link: { type: 'string' },
    },
  };

  static get relationMappings() {
    return {
      belongsToTask: {
        relation: Model.BelongsToOneRelation,
        modelClass: Task,
        join: {
          from: 'taskattachments.parentTask',
          to: 'tasks.id',
        },
      },
    };
  }
}
