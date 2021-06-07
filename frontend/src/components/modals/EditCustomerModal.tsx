import React, { useState, useEffect } from 'react';
import { Alert, Form } from 'react-bootstrap';
import { Trans } from 'react-i18next';
import classNames from 'classnames';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import CheckBoxIcon from '@material-ui/icons/CheckBox';
import CheckBoxBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import { RadioButton } from '../forms/RadioButton';
import { StoreDispatchType } from '../../redux';
import { roadmapsActions } from '../../redux/roadmaps';
import {
  allCustomersSelector,
  roadmapUsersSelector,
} from '../../redux/roadmaps/selectors';
import { RoadmapUser, Customer } from '../../redux/roadmaps/types';
import { RoleType } from '../../redux/user/types';
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
  const [colorType, setColorType] = useState('generate');
  const [formValues, setFormValues] = useState({
    name: customer.name,
    email: customer.email,
    color: customer.color,
  });
  const [representatives, setRepresentatives] = useState(
    roadmapUsers
      ?.filter(
        (user) =>
          user.type === RoleType.Admin || user.type === RoleType.Business,
      )
      .map((obj) => ({ ...obj, checked: false })),
  );

  useEffect(() => {
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
    const copy = representatives?.slice();
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
            <div className={classes(css.colorSection)}>
              <div className={classes(css.colorType)}>
                <div className={classes(css.radioButton)}>
                  <div
                    onClick={() => setColorType('generate')}
                    onKeyPress={() => setColorType('generate')}
                    tabIndex={0}
                    role="radio"
                    aria-checked={colorType === 'generate'}
                  >
                    <RadioButton checked={colorType === 'generate'} />
                  </div>
                  <label
                    className={classes(css.radioLabel, {
                      [css.active]: colorType === 'generate',
                    })}
                    htmlFor="generate"
                  >
                    <Trans i18nKey="Generate" />
                  </label>
                </div>
                <div className={classes(css.radioButton)}>
                  <div
                    onClick={() => setColorType('pick')}
                    onKeyPress={() => setColorType('pick')}
                    tabIndex={0}
                    role="radio"
                    aria-checked={colorType === 'pick'}
                  >
                    <RadioButton checked={colorType === 'pick'} />
                  </div>
                  <label
                    className={classes(css.radioLabel, {
                      [css.active]: colorType === 'pick',
                    })}
                    htmlFor="generate"
                  >
                    <Trans i18nKey="Pick a color" />
                  </label>
                </div>
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
            {representatives?.map((rep, idx) => (
              <div
                className={classes(css.representativeContainer, {
                  [css.checked]: rep.checked,
                })}
                onClick={() => onRepresentativeChange(idx, !rep.checked)}
                onKeyPress={() => onRepresentativeChange(idx, !rep.checked)}
                role="checkbox"
                aria-checked={rep.checked}
                tabIndex={idx}
              >
                {rep.checked ? (
                  <CheckBoxIcon className={classes(css.checkBox)} />
                ) : (
                  <CheckBoxBlankIcon
                    className={classes(css.checkBox, css.unchecked)}
                  />
                )}
                {rep.username}
              </div>
            ))}
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
