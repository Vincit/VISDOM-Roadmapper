import { useState, useRef } from 'react';
import { useHistory } from 'react-router-dom';
import { Form } from 'react-bootstrap';
import Alert from '@mui/material/Alert';
import { useDispatch } from 'react-redux';
import { Trans, useTranslation } from 'react-i18next';
import { ModalTypes, Modal } from './types';
import { ModalContent } from './modalparts/ModalContent';
import { ModalFooter } from './modalparts/ModalFooter';
import { ModalFooterButtonDiv } from './modalparts/ModalFooterButtonDiv';
import { ModalHeader } from './modalparts/ModalHeader';
import { errorState, Input } from '../forms/FormField';
import { paths } from '../../routers/paths';
import '../../shared.scss';

import { LoadingSpinner } from '../LoadingSpinner';

import { StoreDispatchType } from '../../redux';
import { userActions } from '../../redux/user';

export const ConfirmPasswordModal: Modal<ModalTypes.CONFIRM_PASSWORD_MODAL> = ({
  closeModal,
  actionData,
  deleteUser,
}) => {
  const history = useHistory();
  const { t } = useTranslation();
  const dispatch = useDispatch<StoreDispatchType>();
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const errorHandler = (response?: { data: string; status: number }) => {
    switch (response?.status) {
      case 400: {
        setErrorMessage(t('Bad request error - is the password correct?'));
        break;
      }
      default:
        setErrorMessage(t('Internal server error'));
        break;
    }
  };

  const handleConfirm = async () => {
    if (!formRef.current?.checkValidity()) return;
    const action = deleteUser ? userActions.deleteUser : userActions.modifyUser;
    setIsLoading(true);
    const res = await dispatch(
      action({
        currentPassword: password,
        ...actionData,
      }),
    );
    setIsLoading(false);
    if (action.rejected.match(res)) {
      errorHandler(res.payload?.response);
    } else if (deleteUser) {
      history.push(paths.home);
    } else {
      closeModal(true);
    }
  };

  return (
    <Form ref={formRef}>
      <ModalHeader closeModal={closeModal}>
        <h3>
          <Trans i18nKey="Enter your password to continue" />
        </h3>
      </ModalHeader>
      <ModalContent>
        <Input
          label={t('Current password')}
          autoComplete="off"
          key="password"
          name="password"
          type="password"
          required
          placeholder={t('Current password')}
          value={password}
          onChange={(e) => setPassword(e.currentTarget.value)}
          error={errorState(useState(''))}
        />
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
          {isLoading ? (
            <LoadingSpinner />
          ) : (
            <button
              className="button-large"
              type="submit"
              onClick={handleConfirm}
            >
              <Trans i18nKey="Confirm" />
            </button>
          )}
        </ModalFooterButtonDiv>
      </ModalFooter>
    </Form>
  );
};
