import { Pojo } from 'objection';
import Model from '../BaseModel';
import StatusMapping from './statusMapping.model';

import { IntegrationConfig } from '../integration';

export default class Integration extends Model implements IntegrationConfig {
  id!: number;
  name!: string;
  host!: string;
  consumerkey!: string;
  privatekey!: string;

  roadmapId!: number;

  boardId!: string | null;
  statusMapping?: StatusMapping[];

  static tableName = 'integration';

  static jsonSchema = {
    type: 'object',
    required: ['name', 'host', 'consumerkey', 'privatekey', 'roadmapId'],

    properties: {
      id: { type: 'integer' },
      name: { type: 'string', minLength: 1, maxLength: 250 },
      host: {
        type: 'string',
        format: 'hostname',
        minLength: 1,
        maxLength: 250,
      },
      consumerkey: { type: 'string', minLength: 1, maxLength: 250 },
      privatekey: { type: 'string', minLength: 1, maxLength: 2048 },
      roadmapId: { type: 'integer' },
    },
  };

  static get relationMappings() {
    return {
      statusMapping: {
        relation: Model.HasManyRelation,
        modelClass: StatusMapping,
        join: {
          from: 'integration.id',
          to: 'importStatusMapping.integrationId',
        },
      },
    };
  }

  $formatJson(json: Pojo): Pojo {
    json = super.$formatJson(json);
    // Make sure the privatekey is not sent in the response
    json.privatekey = '';
    return json;
  }
}
