import React, { useEffect } from 'react';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { Trans } from 'react-i18next';
import classNames from 'classnames';
import {
  plannerUserWeightsSelector,
  publicUsersSelector,
} from '../redux/roadmaps/selectors';
import { PlannerUserWeight, PublicUser } from '../redux/roadmaps/types';
import { RootState } from '../redux/types';
import { StoreDispatchType } from '../redux';
import { roadmapsActions } from '../redux/roadmaps';
import { UserType } from '../redux/user/types';
import css from './PlannerWeightsPage.module.scss';

const classes = classNames.bind(css);

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
    dispatch(roadmapsActions.setPlannerUserWeight({ userId, weight: value }));
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
              <div className={classes(css.userRow)} key={user.id}>
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
              </div>
            );
          })}
      </>
    );
  };

  return (
    <div className={classes(css.plannerPagecontainer)}>
      <p className={classes(css.title)}>
        <Trans i18nKey="Set different weighing for clients" />
      </p>
      {publicUsers && renderUserSliders()}
    </div>
  );
};
