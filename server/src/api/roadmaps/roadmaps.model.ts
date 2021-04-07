import { Model } from 'objection';
import Task from './../tasks/tasks.model';
import { Role } from './../roles/roles.model';
import JiraConfiguration from './../jiraconfigurations/jiraconfigurations.model';

export default class Roadmap extends Model {
  id!: number;
  name!: string;
  description!: string;

  roles!: Role[];
  tasks?: Task[];
  jiraconfiguration?: JiraConfiguration;

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
      roles: {
        relation: Model.HasManyRelation,
        modelClass: Role,
        join: {
          from: 'roadmaps.id',
          to: 'roles.roadmapId',
        },
      },
      tasks: {
        relation: Model.HasManyRelation,
        modelClass: Task,
        join: {
          from: 'roadmaps.id',
          to: 'tasks.roadmapId',
        },
      },
      jiraconfiguration: {
        relation: Model.HasOneRelation,
        modelClass: JiraConfiguration,
        join: {
          from: 'roadmaps.id',
          to: 'jiraconfigurations.roadmapId',
        },
      },
    };
  }
}
