import chai, { assert, expect } from 'chai';
import chaiHttp from 'chai-http';
import Version from '../src/api/versions/versions.model';
import { Permission } from '../../shared/types/customTypes';
import { loggedInAgent } from './setuptests';
import { withoutPermission, someRoadmapId } from './testUtils';
chai.use(chaiHttp);

describe('Test /roadmaps/:roadmapId/versions/ api', function () {
  describe('GET /roadmaps/:roadmapId/versions/', function () {
    it('Should return all versions', async function () {
      const roadmapId = await someRoadmapId();
      await Version.query().insert({
        name: 'Test version',
        roadmapId,
        sortingRank: 0,
      });
      const res = await loggedInAgent.get(`/roadmaps/${roadmapId}/versions`);
      expect(res.status).to.equal(200);
      expect(res.body.length).to.be.greaterThan(0);
      assert.property(res.body[0], 'tasks');
      assert.property(res.body[0], 'name');
    });
    it('Should not return versions with incorrect permissions', async function () {
      const roadmapId = await someRoadmapId();
      await Version.query().insert({
        name: 'Test version',
        roadmapId,
        sortingRank: 0,
      });
      const res = await withoutPermission(
        roadmapId,
        Permission.VersionRead,
        () => loggedInAgent.get(`/roadmaps/${roadmapId}/versions`),
      );
      expect(res.status).to.equal(403);
    });
  });

  describe('POST /roadmaps/:roadmapId/versions/:versionId', function () {
    it('Should add new version', async function () {
      const roadmapId = await someRoadmapId();
      const testVersion = {
        name: 'Test version',
        roadmapId,
        tasks: [],
        sortingRank: 0,
      };
      const res = await loggedInAgent.get(`/roadmaps/${roadmapId}/versions`);
      const lenBefore = res.body.length;
      const postResponse = await loggedInAgent
        .post(`/roadmaps/${roadmapId}/versions`)
        .type('json')
        .send(testVersion);
      expect(postResponse.status).to.equal(200);
      const res2 = await loggedInAgent.get(`/roadmaps/${roadmapId}/versions`);
      const lenAfter = res2.body.length;
      const insertedVersion = res2.body.find(
        (ver: any) => ver.name === testVersion.name,
      );
      assert(lenAfter === lenBefore + 1, 'Length must increase');
      expect(insertedVersion).to.exist;
    });
    it('Should not add new version with incorrect permissions', async function () {
      const roadmapId = await someRoadmapId();
      const testVersion = {
        name: 'Test version',
        roadmapId,
        tasks: [],
        sortingRank: 0,
      };
      const res = await loggedInAgent.get(`/roadmaps/${roadmapId}/versions`);
      const lenBefore = res.body.length;
      const postResponse = await withoutPermission(
        roadmapId,
        Permission.VersionCreate | Permission.RoadmapEdit,
        () =>
          loggedInAgent
            .post(`/roadmaps/${roadmapId}/versions`)
            .type('json')
            .send(testVersion),
      );
      expect(postResponse.status).to.equal(403);
      const res2 = await loggedInAgent.get(`/roadmaps/${roadmapId}/versions`);
      const lenAfter = res2.body.length;
      const insertedVersion = res2.body.find(
        (ver: any) => ver.name === testVersion.name,
      );
      assert(lenAfter === lenBefore, 'Length must be same');
      expect(insertedVersion).not.to.exist;
    });
  });

  describe('DELETE /roadmaps/:roadmapId/versions/:versionId', function () {
    it('Should delete version', async function () {
      const roadmapId = await someRoadmapId();
      const testVersion = await Version.query().insertAndFetch({
        name: 'Test version',
        roadmapId,
        tasks: [],
        sortingRank: 0,
      });
      const res = await loggedInAgent.get(`/roadmaps/${roadmapId}/versions`);
      const lenBefore = res.body.length;
      const delResponse = await loggedInAgent.delete(
        `/roadmaps/${roadmapId}/versions/${testVersion.id}`,
      );
      expect(delResponse.status).to.equal(200);

      const res2 = await loggedInAgent.get(`/roadmaps/${roadmapId}/versions`);
      const lenAfter = res2.body.length;
      assert(lenAfter === lenBefore - 1, 'Length must decrease');
    });
    it('Should not delete version with incorrect permissions', async function () {
      const roadmapId = await someRoadmapId();
      const testVersion = await Version.query().insertAndFetch({
        name: 'Test version',
        roadmapId,
        tasks: [],
        sortingRank: 0,
      });
      const res = await loggedInAgent.get(`/roadmaps/${roadmapId}/versions`);
      const lenBefore = res.body.length;
      const delResponse = await withoutPermission(
        roadmapId,
        Permission.VersionDelete | Permission.RoadmapEdit,
        () =>
          loggedInAgent.delete(
            `/roadmaps/${roadmapId}/versions/${testVersion.id}`,
          ),
      );
      expect(delResponse.status).to.equal(403);

      const res2 = await loggedInAgent.get(`/roadmaps/${roadmapId}/versions`);
      const lenAfter = res2.body.length;
      assert(lenAfter === lenBefore, 'Length must be same');
    });
  });

  describe('PATCH /roadmaps/:roadmapId/versions/:versionId', function () {
    it('Should patch version', async function () {
      const roadmapId = await someRoadmapId();
      const testVersion = await Version.query().insertAndFetch({
        name: 'Test version',
        roadmapId,
        tasks: [],
        sortingRank: 0,
      });
      const patchResponse = await loggedInAgent
        .patch(`/roadmaps/${roadmapId}/versions/${testVersion.id}`)
        .type('json')
        .send({ name: 'patched' });

      expect(patchResponse.status).to.equal(200);
      expect(patchResponse.body.id).to.equal(testVersion.id);

      const res2 = await loggedInAgent.get(`/roadmaps/${roadmapId}/versions`);
      const patchedVersion = res2.body.find(
        (ver: any) => ver.name === 'patched',
      );
      expect(patchedVersion).to.exist;
    });
    it('Should not patch version with incorrect permissions', async function () {
      const roadmapId = await someRoadmapId();
      const testVersion = await Version.query().insertAndFetch({
        name: 'Test version',
        roadmapId,
        tasks: [],
        sortingRank: 0,
      });
      const patchResponse = await withoutPermission(
        roadmapId,
        Permission.VersionEdit,
        () =>
          loggedInAgent
            .patch(`/roadmaps/${roadmapId}/versions/${testVersion.id}`)
            .type('json')
            .send({ name: 'patched' }),
      );
      expect(patchResponse.status).to.equal(403);

      const res2 = await loggedInAgent.get(`/roadmaps/${roadmapId}/versions`);
      const patchedVersion = res2.body.find(
        (ver: any) => ver.name === 'patched',
      );
      expect(patchedVersion).not.to.exist;
    });
  });
});
