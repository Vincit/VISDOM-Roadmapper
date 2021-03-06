import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../types';
import { Roadmap, Customer } from './types';
import { customerWeight } from '../../utils/CustomerUtils';

export const roadmapsSelector = (state: RootState): Roadmap[] | undefined =>
  state.roadmaps.roadmaps;

export const chosenRoadmapIdSelector = (state: RootState): number | undefined =>
  state.roadmaps.selectedRoadmapId;

export const chosenRoadmapSelector = createSelector(
  (state: RootState) => {
    return state.roadmaps.roadmaps?.find(
      (roadmap) => roadmap.id === state.roadmaps.selectedRoadmapId,
    );
  },
  (roadmap) => roadmap,
);

export const taskSelector = (id: number) => {
  return createSelector(chosenRoadmapSelector, (roadmap) =>
    roadmap?.tasks.find((task) => task.id === id),
  );
};
export const allTasksSelector = () => {
  return createSelector(
    chosenRoadmapSelector,
    (roadmap) => roadmap?.tasks || [],
  );
};

export const allCustomersSelector = createSelector(
  chosenRoadmapSelector,
  (roadmap) => roadmap?.customers,
);

export const customerSelector = (id: number) =>
  createSelector(allCustomersSelector, (customers) =>
    customers?.find((customer) => customer.id === id),
  );

export const roadmapUsersSelector = createSelector(
  (state: RootState) => state.roadmaps.allUsers,
  (users) => users,
);

export const userSelector = (id: number) => {
  return createSelector(roadmapUsersSelector, (users) =>
    users?.find((user) => user.id === id),
  );
};

export const plannerCustomerWeightsSelector = createSelector(
  chosenRoadmapSelector,
  (roadmap) => roadmap?.plannerCustomerWeights || [],
);

export const customerWeightSelector = (customer: Customer) => {
  return createSelector(plannerCustomerWeightsSelector, (planned) =>
    customerWeight(customer, planned),
  );
};

export const chosenIntegrationSelector = (name: string) =>
  createSelector(chosenRoadmapSelector, (roadmap) =>
    roadmap?.integrations.find((it) => it.name === name),
  );
