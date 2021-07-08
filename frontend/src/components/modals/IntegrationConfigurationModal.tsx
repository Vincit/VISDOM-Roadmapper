import React, { useState } from 'react';
import { Alert, Form } from 'react-bootstrap';
import { Trans } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { StoreDispatchType } from '../../redux';
import { roadmapsActions } from '../../redux/roadmaps/index';
import { IntegrationConfigurationRequest } from '../../redux/roadmaps/types';
import { Modal, ModalTypes } from './types';
import { ModalContent } from './modalparts/ModalContent';
import { ModalFooter } from './modalparts/ModalFooter';
import { ModalFooterButtonDiv } from './modalparts/ModalFooterButtonDiv';
import { ModalHeader } from './modalparts/ModalHeader';
import { titleCase } from '../../utils/string';
import { Input } from '../forms/FormField';
import '../../shared.scss';

export const IntegrationConfigurationModal: Modal<ModalTypes.INTEGRATION_CONFIGURATION_MODAL> = ({
  closeModal,
  roadmapId,
  roadmapName,
  name,
  fields,
  configuration,
}) => {
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch<StoreDispatchType>();

  const config: IntegrationConfigurationRequest = configuration || {
    name,
    host: undefined as string | undefined,
    consumerkey: '',
    privatekey: '',
    roadmapId,
  };
  const [formValues, setFormValues] = useState(config);

  const action = configuration
    ? roadmapsActions.patchIntegrationConfiguration
    : roadmapsActions.addIntegrationConfiguration;

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    const form = event.currentTarget;
    event.preventDefault();
    event.stopPropagation();

    if (form.checkValidity()) {
      setIsLoading(true);

      dispatch(action(formValues)).then((res) => {
        setIsLoading(false);
        if (action.rejected.match(res)) {
          if (res.payload) {
            setErrorMessage(res.payload.message);
          }
        } else {
          closeModal();
        }
      });
    }
  };

  const onChange = (key: string, value: string) => {
    setFormValues({ ...formValues, [key]: value });
  };

  return (
    <>
      <Form onSubmit={handleSubmit}>
        <ModalHeader closeModal={closeModal}>
          <h3>
            {titleCase(name)} <Trans i18nKey="configuration" />
          </h3>
        </ModalHeader>
        <ModalContent>
          {roadmapName ? (
            <>
              <label htmlFor="board">Roadmap: {roadmapName}</label>
              <p>Instructions here</p>
              {fields.map(({ field, secret }) => (
                <Form.Group key={field}>
                  <Input
                    autoComplete="off"
                    required
                    type={secret ? 'password' : undefined}
                    name={field}
                    id={field}
                    placeholder={`${titleCase(name)} ${field}`}
                    value={(formValues as any)[field]!}
                    onChange={(e) => onChange(field, e.currentTarget.value)}
                  />
                </Form.Group>
              ))}
            </>
          ) : (
            <p>Roadmap is undefined</p>
          )}

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
              type="button"
              onClick={closeModal}
            >
              <Trans i18nKey="Cancel" />
            </button>
          </ModalFooterButtonDiv>
          <ModalFooterButtonDiv>
            <button
              className="button-large"
              disabled={
                isLoading ||
                fields.some(({ field }) => !(formValues as any)[field])
              }
              type="submit"
            >
              <Trans i18nKey="Save" />
            </button>
          </ModalFooterButtonDiv>
        </ModalFooter>
      </Form>
    </>
  );
};
