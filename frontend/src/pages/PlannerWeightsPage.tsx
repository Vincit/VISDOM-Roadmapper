import { useState, useEffect } from 'react';
import Alert from '@mui/material/Alert';
import { useSelector, shallowEqual } from 'react-redux';
import { skipToken } from '@reduxjs/toolkit/query/react';
import { Trans, useTranslation } from 'react-i18next';
import classNames from 'classnames';
import InfoIcon from '@mui/icons-material/InfoOutlined';
import { userRoleSelector } from '../redux/user/selectors';
import { Slider } from '../components/forms/Slider';
import { chosenRoadmapIdSelector } from '../redux/roadmaps/selectors';
import { Customer } from '../redux/roadmaps/types';
import { Dot } from '../components/Dot';
import { MetricsSummary } from '../components/MetricsSummary';
import { InfoTooltip } from '../components/InfoTooltip';
import { CustomerWeightsVisualization } from '../components/CustomerWeightsVisualization';
import { percent } from '../utils/string';
import { Permission } from '../../../shared/types/customTypes';
import { hasPermission } from '../../../shared/utils/permission';
import css from './PlannerWeightsPage.module.scss';
import { apiV2 } from '../api/api';

const classes = classNames.bind(css);

export const PlannerWeightsPage = () => {
  const { t } = useTranslation();
  const roadmapId = useSelector(chosenRoadmapIdSelector);
  const role = useSelector(userRoleSelector, shallowEqual);
  const hasEditPermission = hasPermission(role, Permission.RoadmapEdit);

  const { data: customers } = apiV2.useGetCustomersQuery(
    roadmapId ?? skipToken,
  );
  const [patchCustomerTrigger] = apiV2.usePatchCustomerMutation();

  const [localCustomers, setLocalCustomers] = useState<Customer[]>([]);
  const [errorMessage, setErrorMessage] = useState('');
  const multipleCustomers = (customers?.length || []) > 1;

  useEffect(() => {
    if (customers)
      setLocalCustomers([...customers].sort((a, b) => a.id - b.id));
  }, [customers]);

  const handleSliderChange = async (customerId: number, weight: number) => {
    setLocalCustomers((previous) =>
      previous.map((customer) =>
        customer.id === customerId ? { ...customer, weight } : customer,
      ),
    );
  };

  const saveWeight = async (customerId: number, weight: number) => {
    if (roadmapId)
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
        {multipleCustomers && (
          <div className={classes(css.clientShares)}>
            <MetricsSummary label={t('Target weighted shares')} value={null}>
              <div className={classes(css.visualizationWrapper)}>
                <CustomerWeightsVisualization
                  width={180}
                  height={20}
                  barWidth={20}
                  light
                />
              </div>
            </MetricsSummary>
          </div>
        )}
      </header>
      {errorMessage.length > 0 && (
        <Alert
          severity="error"
          onClose={() => setErrorMessage('')}
          icon={false}
        >
          {errorMessage}
        </Alert>
      )}
      <div className={classes(css.description)}>
        <p>
          <Trans i18nKey="Weighting description" />
        </p>
      </div>
      {localCustomers.map((customer) => (
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
            value={customer.weight}
            step={0.25}
            valueLabelDisplay="auto"
            valueLabelFormat={(value) => percent().format(value)}
            marks
            onChangeCommitted={(_, value) =>
              saveWeight(customer.id, Number(value))
            }
            onChange={(_, value) =>
              handleSliderChange(customer.id, Number(value))
            }
            disabled={!hasEditPermission}
          />
        </div>
      ))}
    </div>
  );
};
