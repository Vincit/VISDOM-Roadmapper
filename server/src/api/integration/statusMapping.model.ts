import Model from '../BaseModel';
import { TaskStatus } from '../../../../shared/types/customTypes';

export default class StatusMapping extends Model {
  id!: number;
  integrationId!: number;

  fromColumn!: string;
  toStatus!: TaskStatus;

  static tableName = 'importStatusMapping';

  static jsonSchema = {
    type: 'object',
    required: ['fromColumn', 'toStatus'],

    properties: {
      id: { type: 'integer' },
      fromColumn: { type: 'string', minLength: 1, maxLength: 75 },
      toStatus: {
        type: 'integer',
        enum: [
          TaskStatus.NOT_STARTED,
          TaskStatus.IN_PROGRESS,
          TaskStatus.COMPLETED,
        ],
      },
    },
  };
}
