import { Model, Pojo } from 'objection';
import Roadmap from '../roadmaps/roadmaps.model';

export default class Version extends Model {
  id!: number;
  roadmapId!: number;
  name!: string;
  tasks!: number[];
  sortingRank!: number;

  static tableName = 'versions';

  static jsonSchema = {
    type: 'object',
    required: ['roadmapId', 'name'],

    properties: {
      id: { type: 'integer' },
      roadmapId: { type: 'integer' },
      name: { type: 'string', minLength: 1, maxLength: 75 },
    },
  };

  static get relationMappings() {
    return {
      belongsToRoadmap: {
        relation: Model.BelongsToOneRelation,
        modelClass: Roadmap,
        join: {
          from: 'versions.roadmapId',
          to: 'roadmaps.id',
        },
      },
    };
  }

  $parseDatabaseJson(json: Pojo): Pojo {
    json = super.$parseDatabaseJson(json);
    if (json.tasks) {
      json.tasks = JSON.parse(json.tasks);
    } else {
      json.tasks = [];
    }
    return json;
  }

  $formatDatabaseJson(json: Pojo): Pojo {
    json = super.$parseDatabaseJson(json);
    if (json.tasks) {
      json.tasks = JSON.stringify(json.tasks);
    }

    return json;
  }
}
