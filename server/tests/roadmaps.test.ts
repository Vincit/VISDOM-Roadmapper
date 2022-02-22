import chai, { assert, expect } from 'chai';
import chaiHttp from 'chai-http';
import Roadmap from '../src/api/roadmaps/roadmaps.model';
import { Permission } from '../../shared/types/customTypes';
import { loggedInAgent, agentData } from './setuptests';
import { withoutPermission } from './testUtils';
import User from '../src/api/users/users.model';
chai.use(chaiHttp);

describe('Test /roadmaps/ api', function () {
  describe('GET /roadmaps/', function () {
    it('Should return all roadmaps', async function () {
      const res = await loggedInAgent.get('/roadmaps/');
      const fetchedAgent = await User.query()
        .findOne('email', agentData.email)
        .withGraphFetched('roadmaps');

      expect(res.status).to.equal(200);
      expect(res.body.length).to.equal(fetchedAgent.roadmaps.length);
      expect(res.body[0]).to.have.keys(
        'id',
        'name',
        'description',
        'daysPerWorkCalibration',
      );
    });

    it('Should return all roadmaps, eager loaded', async function () {
      const res = await loggedInAgent.get('/roadmaps?eager=1');
      const fetchedAgent = await User.query()
        .findOne('email', agentData.email)
        .withGraphFetched('roadmaps');

      expect(res.status).to.equal(200);
      expect(res.body.length).to.equal(fetchedAgent.roadmaps.length);
      expect(res.body[0]).to.have.keys(
        'id',
        'name',
        'description',
        'daysPerWorkCalibration',
        'integrations',
      );
    });
  });

  describe('POST /roadmaps/', function () {
    it('Should add new roadmap', async function () {
      const newRoadmap = {
        name: 'TestRoadmap',
        description: 'TestDescription',
      };

      const before = await loggedInAgent.get('/roadmaps/');
      const res = await loggedInAgent
        .post('/roadmaps/')
        .type('json')
        .send({ roadmap: newRoadmap, invitations: [], customers: [] });
      const after = await loggedInAgent.get('/roadmaps/');

      const fetchedAgent = await User.query()
        .findOne('email', agentData.email)
        .withGraphFetched('roadmaps');

      const addedRoadmapDb = fetchedAgent.roadmaps.find(
        (rm: any) =>
          rm.name == newRoadmap.name &&
          rm.description == newRoadmap.description,
      );

      expect(res.status).to.equal(200);
      expect(before.body.length + 1).to.equal(after.body.length);
      expect(addedRoadmapDb).to.exist;
    });
  });

  describe('PATCH /roadmaps/:roadmapId', function () {
    it('Should patch roadmap', async function () {
      const roadmapToPatchId = (await Roadmap.query().first()).id;
      const patchPayload = {
        name: 'patchedName',
        description: 'patchedDesc',
      };
      const res = await loggedInAgent
        .patch('/roadmaps/' + roadmapToPatchId)
        .type('json')
        .send(patchPayload);

      const patchedRoadmap = await Roadmap.query().findById(roadmapToPatchId);

      expect(res.status).to.equal(200);
      expect(patchedRoadmap.name).to.equal('patchedName');
      expect(patchedRoadmap.description).to.equal('patchedDesc');
    });
    it('Should not patch roadmap with incorrect permissions', async function () {
      const firstRoadmap = await Roadmap.query().first();
      const patchPayload = {
        name: 'patchedName',
        description: 'patchedDesc',
      };
      const res = await withoutPermission(
        firstRoadmap.id,
        Permission.RoadmapEdit,
        () =>
          loggedInAgent
            .patch('/roadmaps/' + firstRoadmap.id)
            .type('json')
            .send(patchPayload),
      );
      const firstRoadmapAfter = await Roadmap.query().findById(firstRoadmap.id);

      expect(firstRoadmap).to.eql(firstRoadmapAfter);
      expect(res.status).to.equal(403);
    });
  });

  describe('DELETE /roadmaps/:roadmapId', function () {
    it('Should delete roadmap', async function () {
      const firstRoadmapId = (await Roadmap.query().first()).id;

      const before = await loggedInAgent.get('/roadmaps/');
      const res = await loggedInAgent.delete('/roadmaps/' + firstRoadmapId);
      const after = await loggedInAgent.get('/roadmaps/');
      const firstRoadmapAfter = await Roadmap.query().findById(firstRoadmapId);

      expect(res.status).to.equal(200);
      expect(before.body.length - 1).to.equal(after.body.length);
      expect(firstRoadmapAfter).to.not.exist;
    });
    it('Should not delete roadmap with incorrect permissions', async function () {
      const before = await loggedInAgent.get('/roadmaps/');
      const firstRoadmap = await Roadmap.query().first();
      const res = await withoutPermission(
        firstRoadmap.id,
        Permission.RoadmapDelete,
        () => loggedInAgent.delete('/roadmaps/' + firstRoadmap.id),
      );
      const firstRoadmapAfterDelete = await Roadmap.query().findById(
        firstRoadmap.id,
      );
      const after = await loggedInAgent.get('/roadmaps/');
      expect(res.status).to.equal(403);
      expect(before.body.length).to.equal(after.body.length);
      expect(firstRoadmapAfterDelete).to.eql(firstRoadmap);
    });
  });

  describe('GET /roadmaps/:roadmapId/users/', function () {
    it("Should return roadmaps's users id's, emails", async function () {
      const firstRoadmapId = (await Roadmap.query().first()).id;
      const res = await loggedInAgent.get(`/roadmaps/${firstRoadmapId}/users/`);
      expect(res.status).to.equal(200);
      assert(res.body.length > 1);
      expect(Object.keys(res.body[0]).sort()).to.deep.equal(
        ['email', 'id', 'type'].sort(),
      );
      assert(res.body[0].email.length > 0);
    });
    it("Should not return roadmaps's users with incorrect permissions", async function () {
      const firstRoadmapId = (await Roadmap.query().first()).id;
      const res = await withoutPermission(
        firstRoadmapId,
        Permission.RoadmapReadUsers,
        () => loggedInAgent.get(`/roadmaps/${firstRoadmapId}/users/`),
      );
      expect(res.status).to.equal(403);
      expect(res.body).to.be.empty;
    });
  });
});
