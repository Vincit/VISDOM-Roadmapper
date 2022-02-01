import { useState } from 'react';
import { Alert } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { Trans } from 'react-i18next';
import classNames from 'classnames';
import InfoIcon from '@material-ui/icons/InfoOutlined';
import { Slider } from '../components/forms/Slider';
import { chosenRoadmapIdSelector } from '../redux/roadmaps/selectors';
import { Customer } from '../redux/roadmaps/types';
import { Dot } from '../components/Dot';
import { percent } from '../utils/string';
import { InfoTooltip } from '../components/InfoTooltip';
import css from './PlannerWeightsPage.module.scss';
import { apiV2 } from '../api/api';

const classes = classNames.bind(css);

export const PlannerWeightsPage = () => {
  const roadmapId = useSelector(chosenRoadmapIdSelector)!;

  const { data: customers } = apiV2.useGetCustomersQuery(roadmapId);
  const [patchCustomerTrigger] = apiV2.usePatchCustomerMutation();

  const [localCustomers, setLocalCustomers] = useState(customers);
  const [errorMessage, setErrorMessage] = useState('');

  const customerWeight = (
    { id, weight }: Customer,
    locals: Customer[] | undefined,
  ) => locals?.find((customer) => customer.id === id)?.weight ?? weight;

  const handleSliderChange = async (customerId: number, weight: number) => {
    setLocalCustomers((previous) =>
      previous!.map((customer) =>
        customer.id === customerId ? { ...customer, weight } : customer,
      ),
    );
  };

  const saveWeight = async (customerId: number, weight: number) => {
    patchCustomerTrigger({ roadmapId, customer: { id: customerId, weight } });
  };

  return (
    <div className={classes(css.plannerPagecontainer)}>
      <header className={classes(css.weightsHeader)}>
        <h2 className={classes(css.title)}>
          <Trans i18nKey="Set different weighing for clients" />
          <InfoTooltip title={<Trans i18nKey="Planner weights tooltip" />}>
            <InfoIcon className={classes(css.tooltipIcon, css.infoIcon)} />
          </InfoTooltip>
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
