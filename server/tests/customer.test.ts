import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';
import Roadmap from '../src/api/roadmaps/roadmaps.model';
import Customer from '../src/api/customer/customer.model';
import { Permission } from '../../shared/types/customTypes';
import { getUser } from '../src/utils/testdataUtils';
import {
  deleteCustomer,
  getCustomers,
  postCustomer,
  removePermission,
  updateCustomer,
} from './testUtils';
chai.use(chaiHttp);

describe('Test /customers/ api', function () {
  describe('GET /customers/', function () {
    it('Should get all customers with correct permissions', async function () {
      const firstRoadmapId = (await Roadmap.query().first()).id;
      const customers = await Customer.query().where(
        'roadmapId',
        firstRoadmapId,
      );
      const res = await getCustomers();

      expect(res.status).to.equal(200);
      expect(res.body.length).to.equal(customers.length);
      expect(res.body[0]).to.include.all.keys(
        'id',
        'roadmapId',
        'name',
        'email',
        'weight',
        'color',
        'representatives',
      );
    });

    it('Should not get customers with incorrect permissions', async function () {
      await removePermission(Permission.RoadmapReadUsers);
      const res = await getCustomers();
      expect(res.status).to.equal(403);
    });
  });

  describe('POST /customers/', function () {
    it('Should create a new customer with correct parameters', async function () {
      const firstRoadmapId = (await Roadmap.query().first()).id;
      const business1Id = (await getUser('BusinessPerson1')).id;

      const validCustomer = {
        name: 'Test-customer',
        email: 'olafemail@garen.fi',
        color: '#A1FF4D',
        representatives: [business1Id],
      };

      const customersBefore = await Customer.query().where(
        'roadmapId',
        firstRoadmapId,
      );
      const res = await postCustomer(validCustomer);
      const customersAfter = await Customer.query().where(
        'roadmapId',
        firstRoadmapId,
      );

      expect(res.status).to.equal(200);
      expect(customersAfter.length).to.equal(customersBefore.length + 1);
      expect(customersAfter[customersAfter.length - 1]).to.include({
        name: 'Test-customer',
      });
    });

    it('Should create a customer without representatives', async function () {
      const firstRoadmapId = (await Roadmap.query().first()).id;

      const validCustomer = {
        name: 'olaf',
        email: 'olafemail@garen.fi',
        color: '#A1FF4D',
      };

      const customersBefore = await Customer.query().where(
        'roadmapId',
        firstRoadmapId,
      );
      const res = await postCustomer(validCustomer);
      const customersAfter = await Customer.query().where(
        'roadmapId',
        firstRoadmapId,
      );

      expect(res.status).to.equal(200);
      expect(customersAfter.length).to.equal(customersBefore.length + 1);
      expect(customersAfter[customersAfter.length - 1]).to.include(
        validCustomer,
      );
    });

    it('Should not create a new customer with incorrect permissions', async function () {
      await removePermission(Permission.RoadmapEdit);
      const firstRoadmapId = (await Roadmap.query().first()).id;
      const business1Id = (await getUser('BusinessPerson1')).id;

      const validCustomer = {
        name: 'Test-customer',
        email: 'olafemail@garen.fi',
        color: '#A1FF4D',
        representatives: [business1Id],
      };

      const customersBefore = await Customer.query().where(
        'roadmapId',
        firstRoadmapId,
      );
      const res = await postCustomer(validCustomer);
      const customersAfter = await Customer.query().where(
        'roadmapId',
        firstRoadmapId,
      );

      expect(res.status).to.equal(403);
      expect(customersBefore.length).to.equal(customersAfter.length);
      expect(customersAfter[customersAfter.length - 1]).to.not.include({
        name: 'Test-customer',
      });
    });

    it('Should not create a new customer with empty payload', async function () {
      const firstRoadmapId = (await Roadmap.query().first()).id;
      const invalidCustomer = undefined;

      const customersBefore = await Customer.query().where(
        'roadmapId',
        firstRoadmapId,
      );
      const res = await postCustomer(invalidCustomer);
      const customersAfter = await Customer.query().where(
        'roadmapId',
        firstRoadmapId,
      );

      expect(res.status).to.equal(400);
      expect(customersAfter.length).to.equal(customersBefore.length);
    });

    it('Should not create a new customer with incorrect email format', async function () {
      const firstRoadmapId = (await Roadmap.query().first()).id;
      const invalidCustomer = {
        name: 'Test-customer',
        email: 'notemail',
        color: '#A1FF4D',
      };

      const customersBefore = await Customer.query().where(
        'roadmapId',
        firstRoadmapId,
      );
      const res = await postCustomer(invalidCustomer);
      const customersAfter = await Customer.query().where(
        'roadmapId',
        firstRoadmapId,
      );

      expect(res.status).to.equal(400);
      expect(customersAfter).to.eql(customersBefore);
    });

    describe('Should not create customer with overflown parameters', function () {
      [
        {
          type: 'name',
          name: 'A'.repeat(256), // Name maxlength: 255
          email: 'email@test.com',
          color: '#A1FF4D',
        },
        {
          type: 'email',
          name: 'Test name',
          email: `${'A'.repeat(246)}@email.com`, // Email maxlength: 255
          color: '#A1FF4D',
        },
      ].forEach(({ type, ...data }) => {
        it(`Should not create a new customer with overflown ${type}`, async function () {
          const firstRoadmapId = (await Roadmap.query().first()).id;

          const customersBefore = await Customer.query().where(
            'roadmapId',
            firstRoadmapId,
          );
          const res = await postCustomer(data);
          const customersAfter = await Customer.query().where(
            'roadmapId',
            firstRoadmapId,
          );

          expect(res.status).to.equal(400);
          expect(customersAfter).to.eql(customersBefore);
        });
      });
    });

    describe('Should not create customer with missing data', function () {
      [
        {
          type: 'name',
          email: 'email@test.com',
          color: '#A1FF4D',
        },
        {
          type: 'email',
          name: 'Test name',
          color: '#A1FF4D',
        },
        {
          type: 'color',
          name: 'Test name',
          email: 'email@test.com',
        },
      ].forEach(({ type, ...data }) => {
        it(`Should not create a new customer with ${type} missing`, async function () {
          const firstRoadmapId = (await Roadmap.query().first()).id;

          const customersBefore = await Customer.query().where(
            'roadmapId',
            firstRoadmapId,
          );
          const res = await postCustomer(data);
          const customersAfter = await Customer.query().where(
            'roadmapId',
            firstRoadmapId,
          );

          expect(res.status).to.equal(400);
          expect(customersAfter).to.eql(customersBefore);
        });
      });
    });

    describe('Should not create customer with undefined values', function () {
      [
        {
          type: 'name',
          name: undefined,
          email: 'email@test.com',
          color: '#A1FF4D',
        },
        {
          type: 'email',
          name: 'Test name',
          email: undefined,
          color: '#A1FF4D',
        },
        {
          type: 'color',
          name: 'Test name',
          email: 'email@test.com',
          color: undefined,
        },
      ].forEach(({ type, ...data }) => {
        it(`Should not create a new customer with ${type} as undefined`, async function () {
          const firstRoadmapId = (await Roadmap.query().first()).id;

          const customersBefore = await Customer.query().where(
            'roadmapId',
            firstRoadmapId,
          );
          const res = await postCustomer(data);
          const customersAfter = await Customer.query().where(
            'roadmapId',
            firstRoadmapId,
          );

          expect(res.status).to.equal(400);
          expect(customersAfter).to.eql(customersBefore);
        });
      });
    });

    describe('Should not create customer with null values', function () {
      [
        {
          type: 'name',
          name: null,
          email: 'email@test.com',
          color: '#A1FF4D',
        },
        {
          type: 'email',
          name: 'Test name',
          email: null,
          color: '#A1FF4D',
        },
        {
          type: 'color',
          name: 'Test name',
          email: 'email@test.com',
          color: null,
        },
      ].forEach(({ type, ...data }) => {
        it(`Should not create a new customer with ${type} as null`, async function () {
          const firstRoadmapId = (await Roadmap.query().first()).id;

          const customersBefore = await Customer.query().where(
            'roadmapId',
            firstRoadmapId,
          );
          const res = await postCustomer(data);
          const customersAfter = await Customer.query().where(
            'roadmapId',
            firstRoadmapId,
          );

          expect(res.status).to.equal(400);
          expect(customersAfter).to.eql(customersBefore);
        });
      });
    });
  });

  describe('PATCH /customers/', function () {
    it('Should update customer with correct parameters', async function () {
      const firstRoadmapId = (await Roadmap.query().first()).id;

      const customer = await Customer.query()
        .where('roadmapId', firstRoadmapId)
        .first();
      const res = await updateCustomer(customer, { name: 'Test-customer' });
      const updatedCustomer = await Customer.query().findById(customer.id);

      expect(res.status).to.equal(200);
      expect(updatedCustomer.name).to.equal('Test-customer');
    });

    describe('Should allow partial updation', function () {
      it('Should update customer values', async function () {
        const firstRoadmapId = (await Roadmap.query().first()).id;
        const firstUpdation = { name: 'Test-customer' };

        const customer = await Customer.query()
          .where('roadmapId', firstRoadmapId)
          .first();
        const res = await updateCustomer(customer, firstUpdation);
        const updatedCustomer = await Customer.query()
          .findById(customer.id)
          .withGraphFetched('representatives');

        expect(res.status).to.equal(200);
        expect(updatedCustomer.name).to.equal(firstUpdation.name);
      });

      it('Should update representatives', async function () {
        const firstRoadmapId = (await Roadmap.query().first()).id;
        const business1Id = (await getUser('BusinessPerson1')).id;
        const secondUpdation = { representatives: [business1Id] };

        const customer = await Customer.query()
          .where('roadmapId', firstRoadmapId)
          .first();
        const res = await updateCustomer(customer, secondUpdation);
        const updatedCustomer = await Customer.query()
          .findById(customer.id)
          .withGraphFetched('representatives');

        expect(res.status).to.equal(200);
        expect(updatedCustomer.representatives?.map((rep) => rep.id)).to.eql(
          secondUpdation.representatives,
        );
      });
    });

    it('Should not update customers with incorrect permissions', async function () {
      await removePermission(Permission.RoadmapEdit);
      const firstRoadmapId = (await Roadmap.query().first()).id;

      const customer = await Customer.query()
        .where('roadmapId', firstRoadmapId)
        .first();
      const res = await updateCustomer(customer, { name: 'Test-customer' });
      const updatedCustomer = await Customer.query().findById(customer.id);

      expect(res.status).to.equal(403);
      expect(updatedCustomer.name).to.equal(customer.name);
    });

    it('Should not modify customer with empty payload', async function () {
      const firstRoadmapId = (await Roadmap.query().first()).id;

      const customer = await Customer.query()
        .where('roadmapId', firstRoadmapId)
        .first();
      const res = await updateCustomer(customer, {});
      const updatedCustomer = await Customer.query().findById(customer.id);

      expect(res.status).to.equal(404);
      expect(updatedCustomer.name).to.equal(customer.name);
    });

    describe('Should not allow updation to undefined values', function () {
      [
        {
          type: 'name',
          name: undefined,
        },
        {
          type: 'email',
          email: undefined,
        },
        {
          type: 'color',
          color: undefined,
        },
      ].forEach(({ type, ...data }) => {
        it(`Should not update ${type} to undefined`, async function () {
          const firstRoadmapId = (await Roadmap.query().first()).id;

          const customer = await Customer.query()
            .where('roadmapId', firstRoadmapId)
            .first();
          const res = await updateCustomer(customer, data);
          const updatedCustomer = await Customer.query().findById(customer.id);

          expect(res.status).to.equal(404);
          expect(updatedCustomer).to.eql(customer);
        });
      });
    });

    describe('Should not allow updation to null values', function () {
      [
        {
          type: 'name',
          name: null,
        },
        {
          type: 'email',
          email: null,
        },
        {
          type: 'color',
          color: null,
        },
      ].forEach(({ type, ...data }) => {
        it(`Should not update ${type} to null`, async function () {
          const firstRoadmapId = (await Roadmap.query().first()).id;

          const customer = await Customer.query()
            .where('roadmapId', firstRoadmapId)
            .first();
          const res = await updateCustomer(customer, data);
          const updatedCustomer = await Customer.query().findById(customer.id);

          expect(res.status).to.equal(400);
          expect(updatedCustomer).to.eql(customer);
        });
      });
    });
  });

  describe('DELETE /customers/', function () {
    it('Should delete a customer', async function () {
      const firstRoadmapId = (await Roadmap.query().first()).id;
      const customerToDelete = await Customer.query()
        .where('roadmapId', firstRoadmapId)
        .first();

      const customersBefore = await Customer.query().where(
        'roadmapId',
        firstRoadmapId,
      );
      const res = await deleteCustomer(customerToDelete);
      const customersAfter = await Customer.query().where(
        'roadmapId',
        firstRoadmapId,
      );

      expect(res.status).to.equal(200);
      expect(customersAfter.length).to.equal(customersBefore.length - 1);
      expect(customersAfter[0]).to.not.include({ id: customerToDelete.id });
    });

    it('Should not delete customer with incorrect permissions', async function () {
      await removePermission(Permission.RoadmapEdit);
      const firstRoadmapId = (await Roadmap.query().first()).id;
      const customerToDelete = await Customer.query()
        .where('roadmapId', firstRoadmapId)
        .first();

      const customersBefore = await Customer.query().where(
        'roadmapId',
        firstRoadmapId,
      );
      const res = await deleteCustomer(customerToDelete);
      const customersAfter = await Customer.query().where(
        'roadmapId',
        firstRoadmapId,
      );

      expect(res.status).to.equal(403);
      expect(customersAfter.length).to.equal(customersBefore.length);
    });

    it('Should return not-found on missing resources', async function () {
      const firstRoadmapId = (await Roadmap.query().first()).id;
      const customerToDelete = await Customer.query()
        .where('roadmapId', firstRoadmapId)
        .first();
      await deleteCustomer(customerToDelete);

      const customersBefore = await Customer.query().where(
        'roadmapId',
        firstRoadmapId,
      );
      const res = await deleteCustomer(customerToDelete);
      const customersAfter = await Customer.query().where(
        'roadmapId',
        firstRoadmapId,
      );

      expect(res.status).to.equal(404);
      expect(customersAfter.length).to.equal(customersBefore.length);
    });
  });

  describe('Request chaining workflow', function () {
    it('Get - Post - Patch - Delete - Get', async function () {
      const firstRoadmapId = (await Roadmap.query().first()).id;

      const getResStart = await getCustomers();
      expect(getResStart.status).to.equal(200);

      const validCustomer = {
        name: 'Test-customer',
        email: 'email@test.com',
        color: '#A1FF4D',
      };
      const postRes = await postCustomer(validCustomer);
      const customersAfterPost = await Customer.query().where(
        'roadmapId',
        firstRoadmapId,
      );
      expect(postRes.status).to.equal(200);
      expect(customersAfterPost.length).to.equal(getResStart.body.length + 1);
      expect(customersAfterPost[customersAfterPost.length - 1].name).to.equal(
        'Test-customer',
      );

      const postedCustomer = await Customer.query()
        .where('name', 'Test-customer')
        .first();

      const patchRes = await updateCustomer(postedCustomer, {
        name: 'Modified-customer',
      });
      const updatedCustomer = await Customer.query()
        .where('id', postedCustomer.id)
        .first();
      const customersAfterUpdate = await Customer.query().where(
        'roadmapId',
        firstRoadmapId,
      );
      expect(patchRes.status).to.equal(200);
      expect(updatedCustomer.name).to.equal('Modified-customer');
      expect(
        customersAfterUpdate[customersAfterUpdate.length - 1].name,
      ).to.not.equal('Test-customer');

      const deleteRes = await deleteCustomer(updatedCustomer);
      const customersAfterDelete = await Customer.query().where(
        'roadmapId',
        firstRoadmapId,
      );
      expect(deleteRes.status).to.equal(200);
      expect(customersAfterDelete.length).to.equal(
        customersAfterPost.length - 1,
      );
      expect(
        customersAfterDelete[customersAfterDelete.length - 1].name,
      ).to.not.equal('Modified-customer');

      const getResFinal = await getCustomers();

      expect(getResFinal.status).to.equal(200);
      expect(getResFinal.body).to.eql(getResStart.body);
    });
  });
});
