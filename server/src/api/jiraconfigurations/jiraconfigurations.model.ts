
import { Model } from 'objection';
import Roadmap from './../roadmaps/roadmaps.model';

export default class JiraConfiguration extends Model {
  id!: number;
  url!: string;
  privatekey!: string;

  belongsToRoadmap!: Roadmap;

  static tableName = 'jiraconfigurations';

  static jsonSchema = {
    type: 'object',
    required: ['url', 'privatekey', 'roadmapId'],

    properties: {
      id: { type: 'integer' },
      url: { type: 'string', minLength: 1, maxLength: 250 },
      privatekey: { type: 'string', minLength: 1, maxLength: 2048 },
      roadmapId: { type: 'integer' },
    },
  };

  static get relationMappings() {
    return {
      belongsToRoadmap: {
        relation: Model.BelongsToOneRelation,
        modelClass: Roadmap,
        join: {
          from: 'jiraconfigurations.roadmapId',
          to: 'roadmaps.id',
        },
      },
    };
  }
}
