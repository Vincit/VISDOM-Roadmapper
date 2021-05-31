import React, { useState } from 'react';
import { Alert, Form } from 'react-bootstrap';
import { Trans } from 'react-i18next';
import classNames from 'classnames';
import Radio from '@material-ui/core/Radio';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { StoreDispatchType } from '../../redux';
import { roadmapsActions } from '../../redux/roadmaps';
import { allCustomersSelector } from '../../redux/roadmaps/selectors';
import { RootState } from '../../redux/types';
import { LoadingSpinner } from '../LoadingSpinner';
import { ModalProps } from '../types';
import { ModalCloseButton } from './modalparts/ModalCloseButton';
import { ModalContent } from './modalparts/ModalContent';
import { ModalFooter } from './modalparts/ModalFooter';
import { ModalFooterButtonDiv } from './modalparts/ModalFooterButtonDiv';
import { ModalHeader } from './modalparts/ModalHeader';
import '../../shared.scss';
import { Customer } from '../../redux/roadmaps/types';
import { ColorPicker } from './modalparts/ColorPicker';
import { randomColor } from '../../utils/randomColor';
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
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [colorType, setColorType] = useState('generate');
  const [formValues, setFormValues] = useState({
    name: customer.name,
    email: 'example@email.com',
    color: customer.color,
    representatives: '',
  });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsLoading(true);
    // TODO: add email & representatives
    const res = await dispatch(
      roadmapsActions.patchCustomer({
        id: customer.id,
        name: formValues.name,
        color: colorType === 'pick' ? formValues.color : randomColor(customers),
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
                <div>
                  <Radio
                    checked={colorType === 'generate'}
                    value="generate"
                    name="generate"
                    onChange={(e) => setColorType(e.target.value)}
                  />
                  <label
                    className={classes(css.radioLabel, {
                      [css.active]: colorType === 'generate',
                    })}
                    htmlFor="generate"
                  >
                    <Trans i18nKey="Generate" />
                  </label>
                </div>
                <div>
                  <Radio
                    checked={colorType === 'pick'}
                    value="pick"
                    name="pick"
                    onChange={(e) => setColorType(e.target.value)}
                  />
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
