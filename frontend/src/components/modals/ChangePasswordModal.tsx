import { useState } from 'react';
import { Alert, Form } from 'react-bootstrap';
import { Trans, useTranslation } from 'react-i18next';
import { ModalTypes, Modal } from './types';
import { ModalContent } from './modalparts/ModalContent';
import { ModalFooter } from './modalparts/ModalFooter';
import { ModalFooterButtonDiv } from './modalparts/ModalFooterButtonDiv';
import { ModalHeader } from './modalparts/ModalHeader';
import { Input } from '../forms/FormField';
import '../../shared.scss';

export const ChangePasswordModal: Modal<ModalTypes.ADD_TASK_MODAL> = ({
  closeModal,
}) => {
  const { t } = useTranslation();
  const [errorMessage, setErrorMessage] = useState('');

  return (
    <Form onSubmit={() => {}}>
      <ModalHeader closeModal={closeModal}>
        <h3>
          <Trans i18nKey="Change password" />
        </h3>
      </ModalHeader>
      <ModalContent>
        <Form.Group>
          <Input
            label={t('Current password')}
            autoComplete="off"
            required
            name="current"
            id="current"
            placeholder={t('Current password')}
            value=""
            onChange={() => {}}
          />
        </Form.Group>

        <Form.Group>
          <Input
            label={t('New password')}
            autoComplete="off"
            required
            name="new"
            id="new"
            placeholder={t('New password')}
            value=""
            onChange={() => {}}
          />
        </Form.Group>
        <Form.Group>
          <Input
            label={t('Confirm new password')}
            autoComplete="off"
            required
            name="confirm"
            id="confirm"
            placeholder={t('Confirm new password')}
            value=""
            onChange={() => {}}
          />
        </Form.Group>
        <Alert
          show={errorMessage.length > 0}
          variant="danger"
          dismissible
          onClose={() => setErrorMessage('')}
        >
          {errorMessage}
        </Alert>
      </ModalContent>
      <ModalFooter closeModal={closeModal}>
        <ModalFooterButtonDiv>
          <button className="button-large" type="submit">
            <Trans i18nKey="Confirm" />
          </button>
        </ModalFooterButtonDiv>
      </ModalFooter>
    </Form>
  );
};
