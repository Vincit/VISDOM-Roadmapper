import { Model, StringReturningMethod, Modifiers } from 'objection';
import Roadmap from '../roadmaps/roadmaps.model';
import TaskRating from '../taskratings/taskratings.model';

export default class Task extends Model {
  id!: number;
  name!: String;
  description!: String;

  belongsToRoadmap!: Roadmap;
  ratings?: TaskRating[];
  relatedTasks?: Task[];

  static tableName = 'tasks';

  static jsonSchema = {
    type: 'object',
    required: ['name', 'description'],

    properties: {
      id: { type: 'integer' },
      name: { type: 'string', minLength: 1, maxLength: 255 },
      description: { type: 'string', minLength: 1, maxLength: 1000 },
      roadmap_id: { type: 'number' },
    },
  };

  static get relationMappings() {
    return {
      belongsToRoadmap: {
        relation: Model.BelongsToOneRelation,
        modelClass: Roadmap,
        join: {
          from: 'tasks.roadmap_id',
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
      relatedTasks: {
        relation: Model.ManyToManyRelation,
        modelClass: Task,
        join: {
          from: 'tasks.id',
          through: {
            from: 'taskjointable.taskId',
            to: 'taskjointable.taskIdRelated',
          },
          to: 'tasks.id',
        },
      },
    };
  }
}
