import { useState, useEffect } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { skipToken } from '@reduxjs/toolkit/query/react';
import classNames from 'classnames';
import { useDispatch, useSelector } from 'react-redux';
import { RoleIcon } from '../RoleIcons';
import { StoreDispatchType } from '../../redux';
import { userActions } from '../../redux/user';
import { chosenRoadmapIdSelector } from '../../redux/roadmaps/selectors';
import { CheckableUser } from '../../redux/roadmaps/types';
import { RoleType } from '../../../../shared/types/customTypes';
import { Modal, ModalTypes } from './types';
import {
  SelectCustomerInfo,
  SelectRepresentatives,
} from './modalparts/CustomerModalParts';
import { StepForm } from '../forms/StepForm';
import { randomColor, getCheckedIds } from '../../utils/CustomerUtils';
import { SummaryStepContent } from './modalparts/SummaryStepContent';
import { apiV2 } from '../../api/api';
import colors from '../../colors.module.scss';
import css from './AddCustomerModal.module.scss';

const classes = classNames.bind(css);

export const AddCustomerModal: Modal<ModalTypes.ADD_CUSTOMER_MODAL> = ({
  closeModal,
}) => {
  const dispatch = useDispatch<StoreDispatchType>();
  const { t } = useTranslation();
  const roadmapId = useSelector(chosenRoadmapIdSelector);
  const { data: customers } = apiV2.useGetCustomersQuery(
    roadmapId ?? skipToken,
  );
  const [addCustomerTrigger] = apiV2.useAddCustomerMutation();
  const { data: roadmapUsers } = apiV2.useGetRoadmapUsersQuery(
    roadmapId ?? skipToken,
  );
  const [colorType, setColorType] = useState('generate');
  const [formValues, setFormValues] = useState({
    name: '',
    email: '',
    color: randomColor(customers),
  });
  const [representatives, setRepresentatives] = useState<CheckableUser[]>([]);

  useEffect(() => {
    if (!roadmapUsers) return;
    setRepresentatives(
      roadmapUsers
        .filter(
          (user) =>
            user.type === RoleType.Admin || user.type === RoleType.Business,
        )
        .map((obj) => ({ ...obj, checked: false })),
    );
  }, [roadmapUsers]);

  const handleSubmit = async () => {
    if (roadmapId === undefined) return;
    try {
      await addCustomerTrigger({
        roadmapId,
        customer: {
          ...formValues,
          representatives: getCheckedIds(representatives),
        },
      }).unwrap();
      await dispatch(userActions.getUserInfo());
    } catch (err) {
      return { message: err.data?.message ?? 'something went wrong' };
    }
  };

  const handleColorTypeChange = (value: string) => {
    setColorType(value);
    if (value === 'generate')
      setFormValues({ ...formValues, color: randomColor(customers) });
  };

  const steps = [
    {
      description: t('Client info'),
      disabled: () => !formValues.name || !formValues.email,
      component: () => (
        <SelectCustomerInfo
          name={formValues.name}
          onNameChange={(value) =>
            setFormValues({ ...formValues, name: value })
          }
          email={formValues.email}
          onEmailChange={(value) =>
            setFormValues({ ...formValues, email: value })
          }
          colorType={colorType}
          onColorTypeChange={handleColorTypeChange}
          color={formValues.color}
          onColorChange={(value) =>
            setFormValues({ ...formValues, color: value })
          }
        />
      ),
    },
    {
      description: t('Select representative'),
      disabled: () => !getCheckedIds(representatives).length,
      component: () => (
        <SelectRepresentatives
          representatives={representatives}
          onRepresentativeChange={(idx, checked) => {
            if (idx >= 0 && idx < representatives.length) {
              const copy = [...representatives];
              copy[idx].checked = checked;
              setRepresentatives(copy);
            }
          }}
        />
      ),
    },
    {
      description: t('Finish'),
      component: () => (
        <SummaryStepContent
          description="All done customer description"
          formValues={formValues}
        >
          <div className={classes(css.representatives)}>
            <b>
              <Trans i18nKey="Representatives" />:
            </b>
            {representatives
              .filter((rep) => rep.checked)
              .map((rep) => (
                <div key={rep.id} className={classes(css.rep)}>
                  {rep.email}
                  <RoleIcon
                    type={rep.type}
                    color={colors.azure}
                    small
                    tooltip
                  />
                </div>
              ))}
          </div>
        </SummaryStepContent>
      ),
    },
  ];

  return (
    <StepForm
      header={t('Add a client')}
      finishHeader={t('Client added')}
      finishMessage={t('Customer added', { customer: formValues.name })}
      cancelHeader={t('Cancel adding client')}
      cancelMessage={t('Cancel customer addition warning')}
      submit={handleSubmit}
      closeModal={closeModal}
      steps={steps}
    />
  );
};
