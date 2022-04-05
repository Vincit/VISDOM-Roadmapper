import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';
chai.use(chaiHttp);
import { loggedInAgent } from './setuptests';
import { Permission } from '../../shared/types/customTypes';
import { withoutPermission, someRoadmapId } from './testUtils';

describe('Test /roadmaps/:roadmapId/integrations/jira/ api', function () {
  describe('POST /roadmaps/:roadmapId/integrations/jira/boards/:boardId/import/', function () {
    it('Should not import board with incorrect permissions', async function () {
      const roadmapId = await someRoadmapId();
      const res = await withoutPermission(
        roadmapId,
        Permission.TaskCreate | Permission.TaskEdit,
        () =>
          loggedInAgent
            .post(`/roadmaps/${roadmapId}/integrations/jira/import/`)
            .type('json')
            .send({}),
      );
      expect(res.status).to.equal(403);
    });
    it('Should not receive 403 error with correct permissions', async function () {
      const roadmapId = await someRoadmapId();
      const res = await loggedInAgent
        .post(`/roadmaps/${roadmapId}/integrations/jira/import/`)
        .type('json')
        .send({});
      expect(res.status).not.to.equal(403);
    });
  });
});
