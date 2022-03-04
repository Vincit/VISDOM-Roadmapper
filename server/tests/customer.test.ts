import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';
import Customer from '../src/api/customer/customer.model';
import { Permission } from '../../shared/types/customTypes';
import { getUser } from '../src/utils/testdataUtils';
import { loggedInAgent } from './setuptests';
import { withoutPermission, someRoadmapId } from './testUtils';
chai.use(chaiHttp);

const byId = <T extends { id: number } | { id: string }>(a: T, b: T) =>
  a.id.toString().localeCompare(b.id.toString());

const customerInSomeRoadmap = async () => {
  const roadmapId = await someRoadmapId();
  const customer = await Customer.query()
    .findOne({ roadmapId })
    .throwIfNotFound();
  return { roadmapId, customer };
};

const updateCustomer = async (customer: Customer, newData: any) =>
  await loggedInAgent
    .patch(`/roadmaps/${customer.roadmapId}/customers/${customer.id}`)
    .type('json')
    .send(newData);

const postCustomer = async (roadmapId: number, newCustomer: any) =>
  await loggedInAgent
    .post(`/roadmaps/${roadmapId}/customers`)
    .type('json')
    .send(newCustomer);

const getCustomers = async (roadmapId: number) =>
  await loggedInAgent.get(`/roadmaps/${roadmapId}/customers`);

const deleteCustomer = async (customer: Customer) =>
  await loggedInAgent.delete(
    `/roadmaps/${customer.roadmapId}/customers/${customer.id}`,
  );

describe('Test /customers/ api', function () {
  describe('GET /customers/', function () {
    it('Should get all customers with correct permissions', async function () {
      const roadmapId = await someRoadmapId();
      const customers = await Customer.query().where({ roadmapId });
      const res = await getCustomers(roadmapId);

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
      const roadmapId = await someRoadmapId();
      const res = await withoutPermission(
        roadmapId,
        Permission.RoadmapReadUsers,
        () => getCustomers(roadmapId),
      );
      expect(res.status).to.equal(403);
    });
  });

  describe('POST /customers/', function () {
    it('Should create a new customer with correct parameters', async function () {
      const roadmapId = await someRoadmapId();
      const business1Id = (await getUser('BusinessPerson1')).id;

      const validCustomer = {
        name: 'Test-customer',
        email: 'olafemail@garen.fi',
        color: '#A1FF4D',
        representatives: [business1Id],
      };

      const customersBefore = await Customer.query().where({ roadmapId });
      const res = await postCustomer(roadmapId, validCustomer);
      const customersAfter = await Customer.query().where({ roadmapId });

      expect(res.status).to.equal(200);
      expect(customersAfter.length).to.equal(customersBefore.length + 1);
      expect(customersAfter.map(({ name }) => name)).to.include(
        validCustomer.name,
      );
    });

    it('Should create a customer without representatives', async function () {
      const roadmapId = await someRoadmapId();

      const validCustomer = {
        name: 'olaf',
        email: 'olafemail@garen.fi',
        color: '#A1FF4D',
      };

      const customersBefore = await Customer.query().where({ roadmapId });
      const res = await postCustomer(roadmapId, validCustomer);
      const customersAfter = await Customer.query().where({ roadmapId });

      expect(res.status).to.equal(200);
      expect(customersAfter.length).to.equal(customersBefore.length + 1);
      expect(
        customersAfter.map(({ name, email, color }) => ({
          name,
          email,
          color,
        })),
      ).to.include.deep.members([validCustomer]);
    });

    it('Should not create a new customer with incorrect permissions', async function () {
      const roadmapId = await someRoadmapId();
      const business1Id = (await getUser('BusinessPerson1')).id;

      const validCustomer = {
        name: 'Test-customer',
        email: 'olafemail@garen.fi',
        color: '#A1FF4D',
        representatives: [business1Id],
      };

      const customersBefore = await Customer.query().where({ roadmapId });
      const res = await withoutPermission(
        roadmapId,
        Permission.RoadmapEdit,
        () => postCustomer(roadmapId, validCustomer),
      );
      const customersAfter = await Customer.query().where({ roadmapId });

      expect(res.status).to.equal(403);
      expect(customersBefore.length).to.equal(customersAfter.length);
      expect(customersAfter.map(({ name }) => name)).to.not.include(
        validCustomer.name,
      );
    });

    it('Should not create a new customer with empty payload', async function () {
      const roadmapId = await someRoadmapId();
      const invalidCustomer = undefined;

      const customersBefore = await Customer.query().where({ roadmapId });
      const res = await postCustomer(roadmapId, invalidCustomer);
      const customersAfter = await Customer.query().where({ roadmapId });

      expect(res.status).to.equal(400);
      expect(customersAfter.length).to.equal(customersBefore.length);
    });

    it('Should not create a new customer with incorrect email format', async function () {
      const roadmapId = await someRoadmapId();
      const invalidCustomer = {
        name: 'Test-customer',
        email: 'notemail',
        color: '#A1FF4D',
      };

      const customersBefore = await Customer.query().where({ roadmapId });
      const res = await postCustomer(roadmapId, invalidCustomer);
      const customersAfter = await Customer.query().where({ roadmapId });

      expect(res.status).to.equal(400);
      expect(customersAfter.sort(byId)).to.eql(customersBefore.sort(byId));
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
          const roadmapId = await someRoadmapId();

          const customersBefore = await Customer.query().where({ roadmapId });
          const res = await postCustomer(roadmapId, data);
          const customersAfter = await Customer.query().where({ roadmapId });

          expect(res.status).to.equal(400);
          expect(customersAfter.sort(byId)).to.eql(customersBefore.sort(byId));
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
          const roadmapId = await someRoadmapId();

          const customersBefore = await Customer.query().where({ roadmapId });
          const res = await postCustomer(roadmapId, data);
          const customersAfter = await Customer.query().where({ roadmapId });

          expect(res.status).to.equal(400);
          expect(customersAfter.sort(byId)).to.eql(customersBefore.sort(byId));
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
          const roadmapId = await someRoadmapId();

          const customersBefore = await Customer.query().where({ roadmapId });
          const res = await postCustomer(roadmapId, data);
          const customersAfter = await Customer.query().where({ roadmapId });

          expect(res.status).to.equal(400);
          expect(customersAfter.sort(byId)).to.eql(customersBefore.sort(byId));
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
          const roadmapId = await someRoadmapId();

          const customersBefore = await Customer.query().where({ roadmapId });
          const res = await postCustomer(roadmapId, data);
          const customersAfter = await Customer.query().where({ roadmapId });

          expect(res.status).to.equal(400);
          expect(customersAfter.sort(byId)).to.eql(customersBefore.sort(byId));
        });
      });
    });
  });

  describe('PATCH /customers/', function () {
    it('Should update customer with correct parameters', async function () {
      const { customer } = await customerInSomeRoadmap();
      const res = await updateCustomer(customer, { name: 'Test-customer' });
      const updatedCustomer = await Customer.query().findById(customer.id);

      expect(res.status).to.equal(200);
      expect(updatedCustomer?.name).to.equal('Test-customer');
    });

    describe('Should allow partial updation', function () {
      it('Should update customer values', async function () {
        const firstUpdation = { name: 'Test-customer' };

        const { customer } = await customerInSomeRoadmap();
        const res = await updateCustomer(customer, firstUpdation);
        const updatedCustomer = await Customer.query().findById(customer.id);

        expect(res.status).to.equal(200);
        expect(updatedCustomer?.name).to.equal(firstUpdation.name);
      });

      it('Should update representatives', async function () {
        const business1Id = (await getUser('BusinessPerson1')).id;
        const secondUpdation = { representatives: [business1Id] };

        const { customer } = await customerInSomeRoadmap();
        const res = await updateCustomer(customer, secondUpdation);
        const updatedCustomer = await Customer.query()
          .findById(customer.id)
          .withGraphFetched('representatives');

        expect(res.status).to.equal(200);
        expect(updatedCustomer?.representatives?.length).to.equal(1);
        expect(updatedCustomer?.representatives?.[0].id).to.equal(
          secondUpdation.representatives[0],
        );
      });
    });

    it('Should not update customers with incorrect permissions', async function () {
      const { customer, roadmapId } = await customerInSomeRoadmap();
      const res = await withoutPermission(
        roadmapId,
        Permission.RoadmapEdit,
        () => updateCustomer(customer, { name: 'Test-customer' }),
      );
      const updatedCustomer = await Customer.query().findById(customer.id);

      expect(res.status).to.equal(403);
      expect(updatedCustomer?.name).to.equal(customer.name);
    });

    it('Should not modify customer with empty payload', async function () {
      const { customer } = await customerInSomeRoadmap();
      const res = await updateCustomer(customer, {});
      const updatedCustomer = await Customer.query().findById(customer.id);

      expect(res.status).to.equal(404);
      expect(updatedCustomer?.name).to.equal(customer.name);
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
          const { customer } = await customerInSomeRoadmap();
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
          const { customer } = await customerInSomeRoadmap();
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
      const {
        customer: customerToDelete,
        roadmapId,
      } = await customerInSomeRoadmap();

      const customersBefore = await Customer.query().where({ roadmapId });
      const res = await deleteCustomer(customerToDelete);
      const customersAfter = await Customer.query().where({ roadmapId });

      expect(res.status).to.equal(200);
      expect(customersAfter.length).to.equal(customersBefore.length - 1);
      expect(customersAfter.map(({ id }) => id)).to.not.include(
        customerToDelete.id,
      );
    });

    it('Should not delete customer with incorrect permissions', async function () {
      const {
        customer: customerToDelete,
        roadmapId,
      } = await customerInSomeRoadmap();

      const customersBefore = await Customer.query().where({ roadmapId });
      const res = await withoutPermission(
        roadmapId,
        Permission.RoadmapEdit,
        () => deleteCustomer(customerToDelete),
      );
      const customersAfter = await Customer.query().where({ roadmapId });

      expect(res.status).to.equal(403);
      expect(customersAfter.length).to.equal(customersBefore.length);
    });

    it('Should return not-found on missing resources', async function () {
      const {
        customer: customerToDelete,
        roadmapId,
      } = await customerInSomeRoadmap();
      await deleteCustomer(customerToDelete);

      const customersBefore = await Customer.query().where({ roadmapId });
      const res = await deleteCustomer(customerToDelete);
      const customersAfter = await Customer.query().where({ roadmapId });

      expect(res.status).to.equal(404);
      expect(customersAfter.length).to.equal(customersBefore.length);
    });
  });

  describe('Request chaining workflow', function () {
    it('Get - Post - Patch - Delete - Get', async function () {
      const roadmapId = await someRoadmapId();

      const getResStart = await getCustomers(roadmapId);
      expect(getResStart.status).to.equal(200);

      const customersBefore = getResStart.body.map(({ name }: any) => name);
      const validCustomer = {
        name: 'Test-customer',
        email: 'email@test.com',
        color: '#A1FF4D',
      };
      const postRes = await postCustomer(roadmapId, validCustomer);
      expect(postRes.status).to.equal(200);

      const customersAfterPost = (
        await Customer.query().where({ roadmapId })
      ).map(({ name }) => name);
      expect(customersAfterPost.sort()).to.eql(
        [...customersBefore, 'Test-customer'].sort(),
      );

      const postedCustomer = await Customer.query()
        .findOne('name', 'Test-customer')
        .throwIfNotFound();
      const patchRes = await updateCustomer(postedCustomer, {
        name: 'Modified-customer',
      });
      expect(patchRes.status).to.equal(200);

      const updatedCustomer = await Customer.query()
        .findById(postedCustomer.id)
        .throwIfNotFound();
      expect(updatedCustomer.name).to.equal('Modified-customer');

      const customersAfterUpdate = (
        await Customer.query().where({ roadmapId })
      ).map(({ name }) => name);
      expect(customersAfterUpdate).to.not.include('Test-customer');

      const deleteRes = await deleteCustomer(updatedCustomer);
      expect(deleteRes.status).to.equal(200);

      const customersAfterDelete = (
        await Customer.query().where({ roadmapId })
      ).map(({ name }) => name);
      expect(customersAfterDelete.length).to.equal(
        customersAfterPost.length - 1,
      );
      expect(customersAfterDelete).to.not.include('Modified-customer');

      const getResFinal = await getCustomers(roadmapId);
      expect(getResFinal.status).to.equal(200);

      const customersAfter = getResFinal.body.map(({ name }: any) => name);
      expect(customersAfter.sort()).to.eql(customersBefore.sort());
    });
  });
});
