import chai, { assert, expect } from 'chai';
import chaiHttp from 'chai-http';
import Roadmap from '../src/api/roadmaps/roadmaps.model';
import Version from '../src/api/versions/versions.model';
import User from '../src/api/users/users.model';
import { Role } from '../src/api/roles/roles.model';
import { Permission, RoleType } from '../../shared/types/customTypes';
import { loggedInAgent } from './setuptests';
import { removePermission } from './testUtils';
chai.use(chaiHttp);

describe('Test /roadmaps/:roadmapId/versions/ api', function () {
  describe('GET /roadmaps/:roadmapId/versions/', function () {
    it('Should return all versions', async function () {
      const testVersion = {
        name: 'Test version',
        roadmapId: (await Roadmap.query().first()).id,
        sortingRank: 0,
      };
      await Version.query().insert(testVersion);
      const res = await loggedInAgent.get(
        `/roadmaps/${testVersion.roadmapId}/versions`,
      );
      expect(res.status).to.equal(200);
      expect(res.body.length).to.be.greaterThan(0);
      assert.property(res.body[0], 'tasks');
      assert.property(res.body[0], 'name');
    });
    it('Should not return versions with incorrect permissions', async function () {
      await removePermission(Permission.VersionRead);
      const firstRoadmapId = (await Roadmap.query().first()).id;
      const testVersion = {
        name: 'Test version',
        roadmapId: firstRoadmapId,
        sortingRank: 0,
      };
      await Version.query().insert(testVersion);
      const res = await loggedInAgent.get(
        `/roadmaps/${firstRoadmapId}/versions`,
      );
      expect(res.status).to.equal(403);
    });
  });

  describe('POST /roadmaps/:roadmapId/versions/:versionId', function () {
    it('Should add new version', async function () {
      const testVersion = {
        name: 'Test version',
        roadmapId: (await Roadmap.query().first()).id,
        tasks: [],
        sortingRank: 0,
      };
      const res = await loggedInAgent.get(
        `/roadmaps/${testVersion.roadmapId}/versions`,
      );
      const lenBefore = res.body.length;
      const postResponse = await loggedInAgent
        .post(`/roadmaps/${testVersion.roadmapId}/versions`)
        .type('json')
        .send(testVersion);
      expect(postResponse.status).to.equal(200);
      const res2 = await loggedInAgent.get(
        `/roadmaps/${testVersion.roadmapId}/versions`,
      );
      const lenAfter = res2.body.length;
      const insertedVersion = res2.body.find((ver: any) => {
        return ver.name == testVersion.name;
      });
      assert(lenAfter === lenBefore + 1, 'Length must increase');
      expect(insertedVersion).to.exist;
    });
    it('Should not add new version with incorrect permissions', async function () {
      await removePermission(Permission.VersionCreate);
      await removePermission(Permission.RoadmapEdit);
      const firstRoadmapId = (await Roadmap.query().first()).id;
      const testVersion = {
        name: 'Test version',
        roadmapId: firstRoadmapId,
        tasks: [],
        sortingRank: 0,
      };
      const res = await loggedInAgent.get(
        `/roadmaps/${firstRoadmapId}/versions`,
      );
      const lenBefore = res.body.length;
      const postResponse = await loggedInAgent
        .post(`/roadmaps/${firstRoadmapId}/versions`)
        .type('json')
        .send(testVersion);
      expect(postResponse.status).to.equal(403);
      const res2 = await loggedInAgent.get(
        `/roadmaps/${firstRoadmapId}/versions`,
      );
      const lenAfter = res2.body.length;
      const insertedVersion = res2.body.find((ver: any) => {
        return ver.name == testVersion.name;
      });
      assert(lenAfter === lenBefore, 'Length must be same');
      expect(insertedVersion).not.to.exist;
    });
  });

  describe('DELETE /roadmaps/:roadmapId/versions/:versionId', function () {
    it('Should delete version', async function () {
      const testVersion = {
        name: 'Test version',
        roadmapId: (await Roadmap.query().first()).id,
        tasks: [],
        sortingRank: 0,
      };
      await Version.query().insert(testVersion);
      const res = await loggedInAgent.get(
        `/roadmaps/${testVersion.roadmapId}/versions`,
      );
      const lenBefore = res.body.length;
      const delResponse = await loggedInAgent.delete(
        `/roadmaps/${testVersion.roadmapId}/versions/${
          (await Version.query().first()).id
        }`,
      );
      expect(delResponse.status).to.equal(200);

      const res2 = await loggedInAgent.get(
        `/roadmaps/${testVersion.roadmapId}/versions`,
      );
      const lenAfter = res2.body.length;
      assert(lenAfter === lenBefore - 1, 'Length must decrease');
    });
    it('Should not delete version with incorrect permissions', async function () {
      await removePermission(Permission.VersionDelete);
      await removePermission(Permission.RoadmapEdit);
      const firstRoadmapId = (await Roadmap.query().first()).id;
      const testVersion = {
        name: 'Test version',
        roadmapId: firstRoadmapId,
        tasks: [],
        sortingRank: 0,
      };
      await Version.query().insert(testVersion);
      const res = await loggedInAgent.get(
        `/roadmaps/${firstRoadmapId}/versions`,
      );
      const lenBefore = res.body.length;
      const delResponse = await loggedInAgent.delete(
        `/roadmaps/${firstRoadmapId}/versions/${
          (await Version.query().first()).id
        }`,
      );
      expect(delResponse.status).to.equal(403);

      const res2 = await loggedInAgent.get(
        `/roadmaps/${firstRoadmapId}/versions`,
      );
      const lenAfter = res2.body.length;
      assert(lenAfter === lenBefore, 'Length must be same');
    });
  });

  describe('PATCH /roadmaps/:roadmapId/versions/:versionId', function () {
    it('Should patch version', async function () {
      const testVersion = {
        name: 'Test version',
        roadmapId: (await Roadmap.query().first()).id,
        tasks: [],
        sortingRank: 0,
      };
      await Version.query().insert(testVersion);
      const firstVersionId = (await Version.query().first()).id;
      const patchResponse = await loggedInAgent
        .patch(`/roadmaps/${testVersion.roadmapId}/versions/${firstVersionId}`)
        .type('json')
        .send({ name: 'patched' });

      expect(patchResponse.status).to.equal(200);
      expect(patchResponse.body.id).to.equal(firstVersionId);

      const res2 = await loggedInAgent.get(
        `/roadmaps/${testVersion.roadmapId}/versions`,
      );
      const patchedVersion = res2.body.find((ver: any) => {
        return ver.name == 'patched';
      });
      expect(patchedVersion).to.exist;
    });
    it('Should not patch version with incorrect permissions', async function () {
      await removePermission(Permission.VersionEdit);
      const firstRoadmapId = (await Roadmap.query().first()).id;
      const testVersion = {
        name: 'Test version',
        roadmapId: firstRoadmapId,
        tasks: [],
        sortingRank: 0,
      };
      await Version.query().insert(testVersion);
      const firstVersionId = (await Version.query().first()).id;
      const patchResponse = await loggedInAgent
        .patch(`/roadmaps/${firstRoadmapId}/versions/${firstVersionId}`)
        .type('json')
        .send({ name: 'patched' });
      expect(patchResponse.status).to.equal(403);

      const res2 = await loggedInAgent.get(
        `/roadmaps/${firstRoadmapId}/versions`,
      );
      const patchedVersion = res2.body.find((ver: any) => {
        return ver.name == 'patched';
      });
      expect(patchedVersion).not.to.exist;
    });
  });
});
