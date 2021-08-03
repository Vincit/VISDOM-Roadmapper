import { Model } from 'objection';
import { TaskRelationType } from '../../../../shared/types/customTypes';

export class TaskRelation extends Model {
  from!: number;
  to!: number;
  type!: TaskRelationType;

  static tableName = 'taskrelation';
  static idColumn = ['from', 'to', 'type'];

  static jsonSchema = {
    type: 'object',
    required: ['from', 'to', 'type'],

    properties: {
      from: { type: 'integer' },
      to: { type: 'integer' },
      type: {
        type: 'integer',
        enum: [TaskRelationType.Dependency, TaskRelationType.Synergy],
      },
    },
  };
}
