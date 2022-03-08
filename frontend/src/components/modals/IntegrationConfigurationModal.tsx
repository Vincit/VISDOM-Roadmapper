import { FormEvent, useState } from 'react';
import { Form } from 'react-bootstrap';
import Alert from '@mui/material/Alert';
import { Trans } from 'react-i18next';
import { IntegrationConfigurationRequest } from '../../redux/roadmaps/types';
import { Modal, ModalTypes } from './types';
import { ModalContent } from './modalparts/ModalContent';
import { ModalFooter } from './modalparts/ModalFooter';
import { ModalFooterButtonDiv } from './modalparts/ModalFooterButtonDiv';
import { ModalHeader } from './modalparts/ModalHeader';
import { titleCase } from '../../utils/string';
import { Input } from '../forms/FormField';
import '../../shared.scss';
import { apiV2 } from '../../api/api';

export const IntegrationConfigurationModal: Modal<ModalTypes.INTEGRATION_CONFIGURATION_MODAL> = ({
  closeModal,
  roadmapId,
  roadmapName,
  name,
  fields,
  configuration,
}) => {
  const [errorMessage, setErrorMessage] = useState('');
  const patch = apiV2.usePatchIntegrationConfigurationMutation();
  const add = apiV2.useAddIntegrationConfigurationMutation();

  const config: IntegrationConfigurationRequest = configuration || {
    name,
    host: undefined as string | undefined,
    consumerkey: '',
    privatekey: '',
    roadmapId,
  };
  const [formValues, setFormValues] = useState(config);

  const [action, { isLoading }] = configuration ? patch : add;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    const form = event.currentTarget;
    event.preventDefault();
    event.stopPropagation();

    if (form.checkValidity()) {
      try {
        action(formValues).unwrap();
        closeModal();
      } catch (err: any) {
        setErrorMessage(err.data?.message ?? 'something went wrong');
      }
    }
  };

  const onChange = (key: string, value: string) => {
    setFormValues({ ...formValues, [key]: value });
  };

  return (
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
        {errorMessage.length > 0 && (
          <Alert
            severity="error"
            onClose={() => setErrorMessage('')}
            icon={false}
          >
            {errorMessage}
          </Alert>
        )}
      </ModalContent>
      <ModalFooter closeModal={closeModal}>
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
  );
};
