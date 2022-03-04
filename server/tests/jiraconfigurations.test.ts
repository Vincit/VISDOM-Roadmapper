import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';
chai.use(chaiHttp);
import { loggedInAgent } from './setuptests';
import { Permission } from '../../shared/types/customTypes';
import { withoutPermission, someRoadmapId } from './testUtils';

describe('Test /roadmaps/:roadmapId/integrations/jira/configuration/ api', function () {
  describe('POST /roadmaps/:roadmapId/integrations/jira/configuration/', function () {
    it('Should not add jiraconfiguration with incorrect permissions', async function () {
      const roadmapId = await someRoadmapId();
      const res = await withoutPermission(
        roadmapId,
        Permission.IntegrationConfigurationEdit,
        () =>
          loggedInAgent
            .post(`/roadmaps/${roadmapId}/integrations/jira/configuration`)
            .type('json')
            .send({}),
      );
      expect(res.status).to.equal(403);
    });
    it('Should not receive 403 error with correct permissions', async function () {
      const roadmapId = await someRoadmapId();
      const res = await loggedInAgent
        .post(`/roadmaps/${roadmapId}/integrations/jira/configuration`)
        .type('json')
        .send({});
      expect(res.status).not.to.equal(403);
    });
  });
  describe('PATCH /roadmaps/:roadmapId/integrations/jira/configuration/:integrationId', function () {
    it('Should not patch jiraconfiguration with incorrect permissions', async function () {
      const roadmapId = await someRoadmapId();
      const res = await withoutPermission(
        roadmapId,
        Permission.IntegrationConfigurationEdit,
        () =>
          loggedInAgent
            .patch(`/roadmaps/${roadmapId}/integrations/jira/configuration/1`)
            .type('json')
            .send({}),
      );
      expect(res.status).to.equal(403);
    });
  });
  describe('DELETE /roadmaps/:roadmapId/integrations/jira/configuration/:integrationId', function () {
    it('Should not delete jiraconfiguration with incorrect permissions', async function () {
      const roadmapId = await someRoadmapId();
      const res = await withoutPermission(
        roadmapId,
        Permission.IntegrationConfigurationEdit,
        () =>
          loggedInAgent
            .delete(`/roadmaps/${roadmapId}/integrations/jira/configuration/1`)
            .type('json')
            .send({}),
      );
      expect(res.status).to.equal(403);
    });
  });
});
