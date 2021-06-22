import React, { useState, useEffect } from 'react';
import { Alert, Form } from 'react-bootstrap';
import { Trans } from 'react-i18next';
import classNames from 'classnames';
import StarSharpIcon from '@material-ui/icons/StarSharp';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { BusinessValueFilled } from '../RatingIcons';
import { RadioButton } from '../forms/RadioButton';
import { Checkbox } from '../forms/Checkbox';
import { StoreDispatchType } from '../../redux';
import { roadmapsActions } from '../../redux/roadmaps';
import {
  allCustomersSelector,
  roadmapUsersSelector,
} from '../../redux/roadmaps/selectors';
import { RoadmapUser, Customer } from '../../redux/roadmaps/types';
import { RoleType } from '../../../../shared/types/customTypes';
import { RootState } from '../../redux/types';
import { LoadingSpinner } from '../LoadingSpinner';
import { ModalProps } from '../types';
import { ModalCloseButton } from './modalparts/ModalCloseButton';
import { ModalContent } from './modalparts/ModalContent';
import { ModalFooter } from './modalparts/ModalFooter';
import { ModalFooterButtonDiv } from './modalparts/ModalFooterButtonDiv';
import { ModalHeader } from './modalparts/ModalHeader';
import '../../shared.scss';
import { ColorPicker } from './modalparts/ColorPicker';
import { randomColor } from '../../utils/CustomerUtils';
import css from './EditCustomerModal.module.scss';

const classes = classNames.bind(css);

type CheckableUser = RoadmapUser & { checked: boolean };

export interface EditCustomerModalProps extends ModalProps {
  customer: Customer;
}

export const EditCustomerModal: React.FC<EditCustomerModalProps> = ({
  closeModal,
  customer,
}) => {
  const dispatch = useDispatch<StoreDispatchType>();
  const customers = useSelector<RootState, Customer[] | undefined>(
    allCustomersSelector,
    shallowEqual,
  );
  const roadmapUsers = useSelector<RootState, RoadmapUser[] | undefined>(
    roadmapUsersSelector,
    shallowEqual,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [colorType, setColorType] = useState('pick');
  const [formValues, setFormValues] = useState({
    name: customer.name,
    email: customer.email,
    color: customer.color,
  });
  const [representatives, setRepresentatives] = useState<CheckableUser[]>([]);

  useEffect(() => {
    if (!roadmapUsers) return;
    setRepresentatives(
      roadmapUsers
        ?.filter(
          (user) =>
            user.type === RoleType.Admin || user.type === RoleType.Business,
        )
        .map((obj) =>
          customer.representatives?.find((rep) => rep.id === obj.id)
            ? { ...obj, checked: true }
            : { ...obj, checked: false },
        ),
    );
  }, [roadmapUsers, customer.representatives]);

  useEffect(() => {
    if (!roadmapUsers) dispatch(roadmapsActions.getRoadmapUsers());
  }, [dispatch, roadmapUsers]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsLoading(true);

    const checked = representatives
      ?.filter((rep) => rep.checked === true)
      .map(({ id }) => id);

    const res = await dispatch(
      roadmapsActions.patchCustomer({
        id: customer.id,
        name: formValues.name,
        email: formValues.email,
        color: colorType === 'pick' ? formValues.color : randomColor(customers),
        representatives: checked,
      }),
    );
    setIsLoading(false);
    if (roadmapsActions.patchCustomer.rejected.match(res)) {
      if (res.payload?.message) setErrorMessage(res.payload.message);
      return;
    }
    closeModal();
  };

  const onNameChange = (value: string) => {
    setFormValues({ ...formValues, name: value });
  };

  const onEmailChange = (value: string) => {
    setFormValues({ ...formValues, email: value });
  };

  const onColorChange = (value: string) => {
    setFormValues({ ...formValues, color: value });
  };

  const onRepresentativeChange = (idx: number, checked: boolean) => {
    const copy = [...(representatives ?? [])];
    if (!copy) return;
    copy[idx].checked = checked;
    setRepresentatives(copy);
  };

  return (
    <>
      <Form onSubmit={handleSubmit}>
        <ModalHeader>
          <h3>
            <Trans i18nKey="Modify client information" />
          </h3>
          <ModalCloseButton onClick={closeModal} />
        </ModalHeader>
        <ModalContent>
          <div className={classes(css.section)}>
            <label htmlFor="name">
              <Trans i18nKey="Client name" />
            </label>
            <input
              required
              name="name"
              id="name"
              value={formValues.name}
              onChange={(e: any) => onNameChange(e.currentTarget.value)}
            />
          </div>
          <div className={classes(css.section)}>
            <label htmlFor="email">
              <Trans i18nKey="Contact information" />
            </label>
            <input
              required
              name="email"
              id="email"
              type="email"
              value={formValues.email}
              onChange={(e: any) => onEmailChange(e.currentTarget.value)}
            />
          </div>
          <div className={classes(css.section)}>
            <label htmlFor="color">
              <Trans i18nKey="Client color" />
            </label>
            <div id="color" className={classes(css.colorSection)}>
              <div className={classes(css.colorType)}>
                <RadioButton
                  label="Generate"
                  value="generate"
                  checked={colorType === 'generate'}
                  onChange={(value: string) => setColorType(value)}
                />
                <RadioButton
                  label="Pick a color"
                  value="pick"
                  checked={colorType === 'pick'}
                  onChange={(value: string) => setColorType(value)}
                />
              </div>
              {colorType === 'pick' && (
                <ColorPicker
                  color={formValues.color}
                  setColor={onColorChange}
                />
              )}
            </div>
          </div>
          <div className={classes(css.section)}>
            <label htmlFor="representatives">
              <Trans i18nKey="Who's responsible for the client value ratings?" />
            </label>
            <div id="representatives" className={classes(css.representatives)}>
              {representatives?.map((rep, idx) => (
                <div className={classes(css.representative)}>
                  <Checkbox
                    label={rep.username}
                    checked={rep.checked}
                    onChange={(checked: boolean) =>
                      onRepresentativeChange(idx, checked)
                    }
                    key={rep.id}
                  />
                  <div className={classes(css.icon, css[RoleType[rep.type]])}>
                    {rep.type === RoleType.Admin && (
                      <StarSharpIcon fontSize="small" />
                    )}
                    {rep.type === RoleType.Business && <BusinessValueFilled />}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <Alert
            show={errorMessage.length > 0}
            variant="danger"
            dismissible
            onClose={() => setErrorMessage('')}
          >
            {errorMessage}
          </Alert>
        </ModalContent>
        <ModalFooter>
          <ModalFooterButtonDiv>
            <button
              className="button-large cancel"
              onClick={closeModal}
              type="button"
            >
              <Trans i18nKey="Cancel" />
            </button>
          </ModalFooterButtonDiv>
          <ModalFooterButtonDiv>
            {isLoading ? (
              <LoadingSpinner />
            ) : (
              <button className="button-large" type="submit">
                <Trans i18nKey="Confirm" />
              </button>
            )}
          </ModalFooterButtonDiv>
        </ModalFooter>
      </Form>
    </>
  );
};