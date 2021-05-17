import React, { useEffect } from 'react';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { Trans } from 'react-i18next';
import classNames from 'classnames';
import {
  plannerCustomerWeightsSelector,
  allCustomersSelector,
} from '../redux/roadmaps/selectors';
import { PlannerCustomerWeight, Customer } from '../redux/roadmaps/types';
import { RootState } from '../redux/types';
import { StoreDispatchType } from '../redux';
import { roadmapsActions } from '../redux/roadmaps';
import css from './PlannerWeightsPage.module.scss';

const classes = classNames.bind(css);

export const PlannerWeightsPage = () => {
  const dispatch = useDispatch<StoreDispatchType>();
  const customerWeights = useSelector<RootState, PlannerCustomerWeight[]>(
    plannerCustomerWeightsSelector(),
    shallowEqual,
  );

  const customers = useSelector<RootState, Customer[] | undefined>(
    allCustomersSelector,
    shallowEqual,
  );

  useEffect(() => {
    if (!customers) dispatch(roadmapsActions.getCustomers());
  }, [dispatch, customers]);

  const handleSliderChange = (customerId: number, weight: number) => {
    // TODO: Maybe debounce this so that a dispatch doesnt go off every time slider moves a notch
    dispatch(roadmapsActions.setPlannerCustomerWeight({ customerId, weight }));
  };

  const weight = (id: number) => {
    const customer = customerWeights.find(
      ({ customerId }) => customerId === id,
    );
    return customer ? customer.weight : 1;
  };

  return (
    <div className={classes(css.plannerPagecontainer)}>
      <h2 className={classes(css.title)}>
        <Trans i18nKey="Set different weighing for clients" />
      </h2>
      {customers?.map(({ id, name }) => (
        <div className={classes(css.userRow)} key={id}>
          <span>{name}</span>
          <input
            type="range"
            id="weight"
            name="weight"
            min="0"
            max="2"
            defaultValue={weight(id)}
            step="0.2"
            onChange={(e) =>
              handleSliderChange(id, Number(e.currentTarget.value))
            }
          />
        </div>
      ))}
    </div>
  );
};
