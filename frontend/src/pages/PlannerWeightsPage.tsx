import React, { useEffect } from 'react';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { Trans } from 'react-i18next';
import classNames from 'classnames';
import { Slider } from '../components/forms/Slider';
import {
  plannerCustomerWeightsSelector,
  allCustomersSelector,
} from '../redux/roadmaps/selectors';
import { PlannerCustomerWeight, Customer } from '../redux/roadmaps/types';
import { RootState } from '../redux/types';
import { Dot } from '../components/Dot';
import { StoreDispatchType } from '../redux';
import { roadmapsActions } from '../redux/roadmaps';
import css from './PlannerWeightsPage.module.scss';
import InfoIcon from '@material-ui/icons/InfoOutlined';
import { TooltipIcon } from '../components/forms/TooltipIcon';

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
    return customer ? customer.weight : 0;
  };

  return (
    <div className={classes(css.plannerPagecontainer)}>
      <div className={classes(css.titleContainer)}>
        <h2 className={classes(css.title)}>
          <Trans i18nKey="Set different weighing for clients" />
        </h2>
        <TooltipIcon title={'Test tooltip message'}>
          <InfoIcon className={classes(css.tooltipInfoIcon, css.infoIcon)} />
        </TooltipIcon>
      </div>
      {customers?.map(({ id, name, color }) => (
        <div className={classes(css.userRow)} key={id}>
          <div className={classes(css.customerDot)}>
            <Dot fill={color} />
          </div>
          <div className={classes(css.customer)}>{name}</div>
          <Slider
            id="weight"
            name="weight"
            className={classes(css.slider)}
            min={0}
            max={2}
            value={weight(id)}
            defaultValue={weight(id)}
            step={0.4}
            marks
            onChange={(e, value) => handleSliderChange(id, Number(value))}
          />
        </div>
      ))}
    </div>
  );
};
