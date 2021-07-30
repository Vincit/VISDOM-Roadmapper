import { useEffect, useState } from 'react';
import { Alert } from 'react-bootstrap';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { Trans } from 'react-i18next';
import classNames from 'classnames';
import { Slider } from '../components/forms/Slider';
import {
  plannerCustomerWeightsSelector,
  allCustomersSelector,
  chosenRoadmapSelector,
} from '../redux/roadmaps/selectors';
import {
  PlannerCustomerWeight,
  Customer,
  Roadmap,
} from '../redux/roadmaps/types';
import { RootState } from '../redux/types';
import { Dot } from '../components/Dot';
import { StoreDispatchType } from '../redux';
import { roadmapsActions } from '../redux/roadmaps';
import { customerWeight } from '../utils/CustomerUtils';
import { percent } from '../utils/string';
import css from './PlannerWeightsPage.module.scss';

const classes = classNames.bind(css);

export const PlannerWeightsPage = () => {
  const dispatch = useDispatch<StoreDispatchType>();
  const customerWeights = useSelector<RootState, PlannerCustomerWeight[]>(
    plannerCustomerWeightsSelector,
    shallowEqual,
  );

  const customers = useSelector<RootState, Customer[] | undefined>(
    allCustomersSelector(),
    shallowEqual,
  );
  const currentRoadmap = useSelector<RootState, Roadmap | undefined>(
    chosenRoadmapSelector,
    shallowEqual,
  );

  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [noChanges, setNoChanges] = useState(true);

  useEffect(() => {
    if (!customers && currentRoadmap)
      dispatch(roadmapsActions.getCustomers(currentRoadmap.id));
  }, [dispatch, customers, currentRoadmap]);

  useEffect(() => {
    if (!currentRoadmap) dispatch(roadmapsActions.getRoadmaps());
  }, [dispatch, currentRoadmap]);

  const resetWeights = () => {
    dispatch(roadmapsActions.clearPlannerCustomerWeights());
  };

  useEffect(() => {
    setNoChanges(
      !customerWeights.some(({ customerId, weight }) => {
        const saved = customers?.find(({ id }) => id === customerId)?.weight;
        return weight !== saved;
      }),
    );
  }, [customerWeights, customers]);

  const saveWeights = () => {
    if (saving) return;
    setSaving(true);
    const updates = customerWeights
      .filter(({ customerId, weight }) => {
        const saved = customers?.find(({ id }) => id === customerId)?.weight;
        return weight !== saved;
      })
      .map(({ customerId, weight }) =>
        dispatch(roadmapsActions.patchCustomer({ id: customerId, weight })),
      );
    Promise.all(updates)
      .then((results) => {
        const error = results.reduce(
          (err: string | undefined | false, res) =>
            !err && roadmapsActions.patchCustomer.rejected.match(res)
              ? res.payload?.message
              : err,
          false,
        );
        if (error !== false) {
          setErrorMessage(error || 'Unknown error');
        } else {
          resetWeights();
        }
      })
      .finally(() => {
        setSaving(false);
      });
  };

  const handleSliderChange = (customerId: number, weight: number) => {
    dispatch(roadmapsActions.setPlannerCustomerWeight({ customerId, weight }));
  };

  return (
    <div className={classes(css.plannerPagecontainer)}>
      <header className={classes(css.weightsHeader)}>
        <h2 className={classes(css.title)}>
          <Trans i18nKey="Set different weighting for clients" />
        </h2>
        <button
          className="button-small-outlined"
          type="button"
          onClick={resetWeights}
          disabled={saving || noChanges}
        >
          Reset
        </button>
        <button
          className="button-small-filled"
          type="submit"
          onClick={saveWeights}
          disabled={saving || noChanges}
        >
          Save
        </button>
      </header>
      <Alert
        show={errorMessage.length > 0}
        variant="danger"
        dismissible
        onClose={() => setErrorMessage('')}
      >
        {errorMessage}
      </Alert>
      <div className={classes(css.description)}>
        <p>
          <Trans i18nKey="Weighting description" />
        </p>
        <p>
          <Trans i18nKey="Weighting instructions" />
        </p>
      </div>
      {customers?.map((customer) => (
        <div className={classes(css.userRow)} key={customer.id}>
          <div className={classes(css.customerDot)}>
            <Dot fill={customer.color} />
          </div>
          <div className={classes(css.customer)}>{customer.name}</div>
          <Slider
            id="weight"
            name="weight"
            className={classes(css.slider)}
            min={0}
            max={2}
            value={customerWeight(customer, customerWeights)}
            defaultValue={customerWeight(customer, customerWeights)}
            step={0.25}
            valueLabelDisplay="auto"
            valueLabelFormat={(value) => percent().format(value)}
            marks
            onChange={(e, value) =>
              handleSliderChange(customer.id, Number(value))
            }
          />
        </div>
      ))}
    </div>
  );
};
