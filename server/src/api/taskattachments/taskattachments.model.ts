import { Model } from 'objection';

export class TaskAttachment extends Model {
  task!: number;
  attachment!: string;

  static tableName = 'taskattachments';

  static jsonSchema = {
    type: 'object',
    required: ['task', 'attachment'],

    properties: {
      task: { type: 'integer' },
      attachment: { type: 'string' },
    },
  };
}
