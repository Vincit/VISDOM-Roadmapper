import React, { useEffect } from 'react';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import {
  chosenRoadmapSelector,
  plannerUserWeightsSelector,
  publicUsersSelector,
} from '../redux/roadmaps/selectors';
import {
  PlannerUserWeight,
  PublicUser,
  Roadmap,
} from '../redux/roadmaps/types';
import { RootState } from '../redux/types';
import { Trans } from 'react-i18next';
import { StoreDispatchType } from '../redux';
import { roadmapsActions } from '../redux/roadmaps';
import { UserType } from '../redux/user/types';

const Title = styled.p`
  font-size: 28px;
  font-weight: 600;
  text-align: start;
`;

const UserRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  margin: 0;
  padding: 0;
  span {
    min-width: 250px;
    font-size: 14px;
    padding-top: 24px;
    padding-bottom: 24px;
    text-align: start;
  }

  input {
    min-width: 500px;
  }
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
`;

export const PlannerWeightsPage = () => {
  const dispatch = useDispatch<StoreDispatchType>();
  const plannerUserWeights = useSelector<RootState, PlannerUserWeight[]>(
    plannerUserWeightsSelector(),
    shallowEqual,
  );

  const publicUsers = useSelector<RootState, PublicUser[] | undefined>(
    publicUsersSelector,
    shallowEqual,
  );

  useEffect(() => {
    if (!publicUsers) dispatch(roadmapsActions.getPublicUsers());
  }, [dispatch, publicUsers]);

  const handleSliderChange = (userId: number, value: number) => {
    // TODO: Maybe debounce this so that a dispatch doesnt go off every time slider moves a notch
    dispatch(
      roadmapsActions.setPlannerUserWeight({ userId: userId, weight: value }),
    );
  };

  const renderUserSliders = () => {
    return (
      <>
        {publicUsers!
          .filter((user) => user.type === UserType.CustomerUser)
          .map((user) => {
            let existingWeight = plannerUserWeights.find(
              (w) => w.userId === user.id,
            )?.weight;
            if (existingWeight === undefined) existingWeight = 1;
            return (
              <UserRow key={user.id}>
                <span>{user.username}</span>
                <input
                  type="range"
                  id="weight"
                  name="weight"
                  min="0"
                  max="2"
                  defaultValue={existingWeight}
                  step="0.2"
                  onChange={(e) =>
                    handleSliderChange(user.id, Number(e.currentTarget.value))
                  }
                />
              </UserRow>
            );
          })}
      </>
    );
  };

  return (
    <>
      <Title>
        <Trans i18nKey="Set different weighing for clients" />
      </Title>
      {publicUsers && renderUserSliders()}
    </>
  );
};
