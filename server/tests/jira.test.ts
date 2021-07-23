import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';
chai.use(chaiHttp);
import { loggedInAgent } from './setuptests';
import Roadmap from '../src/api/roadmaps/roadmaps.model';
import { Permission } from '../../shared/types/customTypes';
import { withoutPermission } from './testUtils';

describe('Test /roadmaps/:roadmapId/integrations/jira/ api', function () {
  describe('POST /roadmaps/:roadmapId/integrations/jira/boards/:boardId/import/', function () {
    it('Should not import board with incorrect permissions', async function () {
      const firstRoadmapId = (await Roadmap.query().first()).id;
      const res = await withoutPermission(
        firstRoadmapId,
        Permission.TaskCreate | Permission.TaskEdit,
        () =>
          loggedInAgent
            .post(
              `/roadmaps/${firstRoadmapId}/integrations/jira/boards/1/import/`,
            )
            .type('json')
            .send({}),
      );
      expect(res.status).to.equal(403);
    });
    it('Should not receive 403 error with correct permissions', async function () {
      const firstRoadmapId = (await Roadmap.query().first()).id;
      const res = await loggedInAgent
        .post(`/roadmaps/${firstRoadmapId}/integrations/jira/boards/1/import/`)
        .type('json')
        .send({});
      expect(res.status).not.to.equal(403);
    });
  });
});
