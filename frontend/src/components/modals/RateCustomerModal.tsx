/* eslint-disable jsx-a11y/label-has-associated-control */
import React, { useEffect, useState } from 'react';
import { Alert, Form } from 'react-bootstrap';
import { Trans } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { StoreDispatchType } from '../../redux';
import { roadmapsActions } from '../../redux/roadmaps/index';
import { customerSelector } from '../../redux/roadmaps/selectors';
import { CustomerRequest } from '../../redux/roadmaps/types';
import { LoadingSpinner } from '../LoadingSpinner';
import { ModalProps } from '../types';
import { ModalCloseButton } from './modalparts/ModalCloseButton';
import { ModalContent } from './modalparts/ModalContent';
import { ModalFooter } from './modalparts/ModalFooter';
import { ModalFooterButtonDiv } from './modalparts/ModalFooterButtonDiv';
import { ModalHeader } from './modalparts/ModalHeader';
import '../../shared.scss';

export interface RateCustomerModalProps extends ModalProps {
  customerId: number;
}

export const RateCustomerModal: React.FC<RateCustomerModalProps> = ({
  closeModal,
  customerId,
}) => {
  const customer = useSelector(customerSelector(customerId))!;
  const dispatch = useDispatch<StoreDispatchType>();
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [value, setValue] = useState(customer?.value || 0);

  useEffect(() => {
    if (customer) setValue(customer?.value || 0);
  }, [customer]);

  if (!customer) return null;
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    const form = event.currentTarget;
    event.preventDefault();
    event.stopPropagation();

    if (form.checkValidity()) {
      const req: CustomerRequest = {
        id: customer.id,
        value,
      };

      setIsLoading(true);
      dispatch(roadmapsActions.patchCustomer(req)).then((res) => {
        setIsLoading(false);
        if (roadmapsActions.patchCustomer.rejected.match(res)) {
          setHasError(true);
          if (res.payload) {
            setErrorMessage(res.payload.message);
          }
        } else {
          closeModal();
        }
      });
    }
  };

  return (
    <>
      <Form onSubmit={handleSubmit}>
        <ModalHeader>
          <h3>
            <Trans i18nKey="Rate customer" />
          </h3>
          <ModalCloseButton onClick={closeModal} />
        </ModalHeader>

        <ModalContent>
          <label htmlFor="name">
            <Trans i18nKey="Value" /> (€)
          </label>
          <input
            autoComplete="off"
            required
            type="number"
            min="0"
            name="name"
            id="name"
            value={value}
            onChange={(e: any) => setValue(+e.currentTarget.value)}
          />
          <Alert
            show={hasError}
            variant="danger"
            dismissible
            onClose={() => setHasError(false)}
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
                <Trans i18nKey="Save" />
              </button>
            )}
          </ModalFooterButtonDiv>
        </ModalFooter>
      </Form>
    </>
  );
};
