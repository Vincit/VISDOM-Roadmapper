import { useState, useEffect } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import classNames from 'classnames';
import StarSharpIcon from '@material-ui/icons/StarSharp';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { BusinessIcon } from '../RoleIcons';
import { StoreDispatchType } from '../../redux';
import { roadmapsActions } from '../../redux/roadmaps';
import { userActions } from '../../redux/user';
import {
  allCustomersSelector,
  roadmapUsersSelector,
  chosenRoadmapSelector,
} from '../../redux/roadmaps/selectors';
import {
  RoadmapUser,
  Customer,
  CheckableUser,
  Roadmap,
} from '../../redux/roadmaps/types';
import { RoleType } from '../../../../shared/types/customTypes';
import { RootState } from '../../redux/types';
import { Modal, ModalTypes } from './types';
import {
  SelectCustomerInfo,
  SelectRepresentatives,
} from './modalparts/CustomerModalParts';
import { StepForm } from '../forms/StepForm';
import { randomColor, getCheckedIds } from '../../utils/CustomerUtils';
import { SummaryStepContent } from './modalparts/SummaryStepContent';
import colors from '../../colors.module.scss';
import css from './AddCustomerModal.module.scss';

const classes = classNames.bind(css);

export const AddCustomerModal: Modal<ModalTypes.ADD_CUSTOMER_MODAL> = ({
  closeModal,
}) => {
  const dispatch = useDispatch<StoreDispatchType>();
  const { t } = useTranslation();
  const customers = useSelector<RootState, Customer[] | undefined>(
    allCustomersSelector,
    shallowEqual,
  );
  const roadmapUsers = useSelector<RootState, RoadmapUser[] | undefined>(
    roadmapUsersSelector,
    shallowEqual,
  );
  const currentRoadmap = useSelector<RootState, Roadmap | undefined>(
    chosenRoadmapSelector,
    shallowEqual,
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
            user.type === RoleType.Admin ||
            user.type === RoleType['Sales representative'],
        )
        .map((obj) => ({ ...obj, checked: false })),
    );
  }, [roadmapUsers]);

  useEffect(() => {
    if (!roadmapUsers && currentRoadmap)
      dispatch(roadmapsActions.getRoadmapUsers(currentRoadmap.id));
  }, [currentRoadmap, dispatch, roadmapUsers]);

  const handleSubmit = async () => {
    const res = await dispatch(
      roadmapsActions.addCustomer({
        name: formValues.name,
        email: formValues.email,
        color: formValues.color,
        representatives: getCheckedIds(representatives),
      }),
    );

    if (roadmapsActions.addCustomer.rejected.match(res)) {
      return { message: res.payload?.message ?? '' };
    }
    await dispatch(userActions.getUserInfo());
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
                  <div className={classes(css[RoleType[rep.type]])}>
                    {rep.type === RoleType.Admin ? (
                      <StarSharpIcon fontSize="small" />
                    ) : (
                      <BusinessIcon size="xsmall" color={colors.azure} />
                    )}
                  </div>
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
