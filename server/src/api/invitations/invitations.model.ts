import { Model, Pojo, QueryBuilder } from 'objection';
import { RoleType } from '../../../../shared/types/customTypes';
import { daysAgo } from '../../../../shared/utils/date';
import Roadmap from '../roadmaps/roadmaps.model';
import Customer from '../customer/customer.model';

export default class Invitation extends Model {
  id!: string;
  roadmapId!: number;
  type!: RoleType;
  email!: string;
  updatedAt!: Date;
  representativeFor!: Customer[];

  valid?: boolean;
  roadmap?: Roadmap;

  static tableName = 'invitations';
  static linkExpirationDays = 2;

  static jsonSchema = {
    type: 'object',
    properties: {
      id: { type: 'string', format: 'uuid' },
      roadmapId: { type: 'integer' },
      type: { type: 'integer' },
      email: { type: 'string', format: 'email', minLength: 1, maxLength: 255 },
    },
  };

  $beforeInsert() {
    this.updatedAt = new Date();
  }
  $beforeUpdate() {
    this.updatedAt = new Date();
  }
  $parseDatabaseJson(json: Pojo) {
    json = super.$parseDatabaseJson(json);
    json.updatedAt = json.updatedAt && new Date(json.updatedAt);

    json.valid = json.updatedAt >= daysAgo(Invitation.linkExpirationDays);
    return json;
  }
  static get relationMappings() {
    return {
      roadmap: {
        relation: Model.BelongsToOneRelation,
        modelClass: Roadmap,
        filter: (query: QueryBuilder<Model, Model[]>) =>
          query.select('roadmaps.name'),
        join: {
          from: 'invitations.roadmapId',
          to: 'roadmaps.id',
        },
      },
      representativeFor: {
        relation: Model.ManyToManyRelation,
        modelClass: Customer,
        join: {
          from: 'invitations.id',
          through: {
            from: 'invitationRepresentative.invitationId',
            to: 'invitationRepresentative.customerId',
          },
          to: 'customer.id',
        },
      },
    };
  }
}
