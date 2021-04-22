import chai, { assert, expect } from 'chai';
import chaiHttp from 'chai-http';
import Roadmap from '../src/api/roadmaps/roadmaps.model';
import Version from '../src/api/versions/versions.model';
import { app, loggedInAgent } from './setuptests';
chai.use(chaiHttp);

describe('Test /versions/ api', function () {
  describe('GET /versions/', function () {
    it('Should return all versions', async function () {
      const testVersion = {
        name: 'Test version',
        roadmapId: (await Roadmap.query().first()).id,
        sortingRank: 0,
      };
      await Version.query().insert(testVersion);
      const res = await loggedInAgent.get('/versions/');
      expect(res.status).to.equal(200);
      expect(res.body.length).to.be.greaterThan(0);
      assert.property(res.body[0], 'tasks');
      assert.property(res.body[0], 'name');
    });
  });

  describe('POST /versions/', function () {
    it('Should add new version', async function () {
      const testVersion = {
        name: 'Test version',
        roadmapId: (await Roadmap.query().first()).id,
        tasks: [],
        sortingRank: 0,
      };
      const res = await loggedInAgent.get('/versions/');
      const lenBefore = res.body.length;
      const postResponse = await loggedInAgent
        .post('/versions')
        .type('json')
        .send(testVersion);
      expect(postResponse.status).to.equal(200);
      const res2 = await loggedInAgent.get('/versions/');
      const lenAfter = res2.body.length;
      const insertedVersion = res2.body.find((ver: any) => {
        return ver.name == testVersion.name;
      });
      assert(lenAfter === lenBefore + 1, 'Length must increase');
      expect(insertedVersion).to.exist;
    });
  });

  describe('DELETE /versions/', function () {
    it('Should delete version', async function () {
      const testVersion = {
        name: 'Test version',
        roadmapId: (await Roadmap.query().first()).id,
        tasks: [],
        sortingRank: 0,
      };
      await Version.query().insert(testVersion);
      const res = await loggedInAgent.get('/versions/');
      const lenBefore = res.body.length;
      const delResponse = await loggedInAgent.delete(
        '/versions/' + (await Version.query().first()).id,
      );
      expect(delResponse.status).to.equal(200);

      const res2 = await loggedInAgent.get('/versions/');
      const lenAfter = res2.body.length;
      assert(lenAfter === lenBefore - 1, 'Length must decrease');
    });
  });

  describe('PATCH /versions/', function () {
    it('Should patch version', async function () {
      const testVersion = {
        name: 'Test version',
        roadmapId: (await Roadmap.query().first()).id,
        tasks: [],
        sortingRank: 0,
      };
      await Version.query().insert(testVersion);
      const firstVersionId = (await Version.query().first()).id;
      const res = await loggedInAgent.get('/versions/');
      const patchResponse = await loggedInAgent
        .patch('/versions/' + firstVersionId)
        .type('json')
        .send({ name: 'patched' });

      expect(patchResponse.status).to.equal(200);
      expect(patchResponse.body.id).to.equal(firstVersionId);

      const res2 = await loggedInAgent.get('/versions/');
      const patchedVersion = res2.body.find((ver: any) => {
        return ver.name == 'patched';
      });
      expect(patchedVersion).to.exist;
    });
  });
});
