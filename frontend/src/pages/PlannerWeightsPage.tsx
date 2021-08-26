import { useEffect, useState } from 'react';
import { Alert } from 'react-bootstrap';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { Trans } from 'react-i18next';
import classNames from 'classnames';
import { Slider } from '../components/forms/Slider';
import {
  allCustomersSelector,
  chosenRoadmapSelector,
} from '../redux/roadmaps/selectors';
import { Customer, Roadmap } from '../redux/roadmaps/types';
import { RootState } from '../redux/types';
import { Dot } from '../components/Dot';
import { StoreDispatchType } from '../redux';
import { roadmapsActions } from '../redux/roadmaps';
import { percent } from '../utils/string';
import css from './PlannerWeightsPage.module.scss';

const classes = classNames.bind(css);

export const PlannerWeightsPage = () => {
  const dispatch = useDispatch<StoreDispatchType>();

  const customers = useSelector<RootState, Customer[] | undefined>(
    allCustomersSelector(),
    shallowEqual,
  );
  const currentRoadmap = useSelector<RootState, Roadmap | undefined>(
    chosenRoadmapSelector,
    shallowEqual,
  );

  const [localCustomers, setLocalCustomers] = useState(customers);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const customerWeight = (
    { id, weight }: Customer,
    locals: Customer[] | undefined,
  ) => locals?.find((customer) => customer.id === id)?.weight ?? weight;

  useEffect(() => {
    if (!customers && currentRoadmap)
      dispatch(roadmapsActions.getCustomers(currentRoadmap.id));
  }, [dispatch, customers, currentRoadmap]);

  useEffect(() => {
    if (!currentRoadmap) dispatch(roadmapsActions.getRoadmaps());
  }, [dispatch, currentRoadmap]);

  const handleSliderChange = async (customerId: number, weight: number) => {
    setLocalCustomers((previous) =>
      previous!.map((customer) =>
        customer.id === customerId ? { ...customer, weight } : customer,
      ),
    );
  };

  const saveWeight = async (customerId: number, weight: number) => {
    if (saving) return;
    setSaving(true);
    const res = await dispatch(
      roadmapsActions.patchCustomer({ id: customerId, weight }),
    );
    if (roadmapsActions.patchCustomer.rejected.match(res)) {
      if (res.payload?.message) setErrorMessage(res.payload.message);
      setLocalCustomers(customers);
    }
    setSaving(false);
  };

  return (
    <div className={classes(css.plannerPagecontainer)}>
      <header className={classes(css.weightsHeader)}>
        <h2 className={classes(css.title)}>
          <Trans i18nKey="Set different weighing for clients" />
        </h2>
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
            value={customerWeight(customer, localCustomers)}
            defaultValue={customer.weight}
            step={0.25}
            valueLabelDisplay="auto"
            valueLabelFormat={(value) => percent().format(value)}
            marks
            onChangeCommitted={(e, value) =>
              saveWeight(customer.id, Number(value))
            }
            onChange={(e, value) =>
              handleSliderChange(customer.id, Number(value))
            }
          />
        </div>
      ))}
    </div>
  );
};
