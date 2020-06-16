import { Model } from 'objection';
import Task from './../tasks/tasks.model';

export default class Roadmap extends Model {
  id!: number;
  name!: string;
  description!: string;

  tasks?: Task[];

  static tableName = 'roadmaps';

  static jsonSchema = {
    type: 'object',
    required: ['name', 'description'],

    properties: {
      id: { type: 'integer' },
      name: { type: 'string', minLength: 1, maxLength: 255 },
      description: { type: 'string', minLength: 1, maxLength: 1000 },
    },
  };

  static get relationMappings() {
    return {
      tasks: {
        relation: Model.HasManyRelation,
        modelClass: Task,
        join: {
          from: 'roadmaps.id',
          to: 'tasks.roadmapId',
        },
      },
    };
  }
}
