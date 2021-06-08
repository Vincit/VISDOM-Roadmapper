import { Model } from 'objection';

import { IntegrationConfig } from '../integration';

export default class Integration extends Model implements IntegrationConfig {
  id!: number;
  name!: string;
  host!: string;
  consumerkey!: string;
  privatekey!: string;

  roadmapId!: number;

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
}
