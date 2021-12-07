import { useState } from 'react';
import { Alert } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { Trans, useTranslation } from 'react-i18next';
import { ModalTypes, Modal } from './types';
import { ModalContent } from './modalparts/ModalContent';
import { ModalFooter } from './modalparts/ModalFooter';
import { ModalFooterButtonDiv } from './modalparts/ModalFooterButtonDiv';
import { ModalHeader } from './modalparts/ModalHeader';
import { errorState, Input } from '../forms/FormField';
import '../../shared.scss';

import { LoadingSpinner } from '../LoadingSpinner';

import { StoreDispatchType } from '../../redux';
import { userActions } from '../../redux/user';

export const ConfirmPasswordModal: Modal<ModalTypes.CONFIRM_PASSWORD_MODAL> = ({
  closeModal,
  actionData,
}) => {
  const { t } = useTranslation();
  const dispatch = useDispatch<StoreDispatchType>();
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const errorHandler = (response?: { data: string; status: number }) => {
    switch (response?.status) {
      case 400: {
        setErrorMessage(t('Bad request error - is the password correct?'));
        break;
      }
      default:
        setErrorMessage(t('Internal server error.'));
        break;
    }
  };

  const handleConfirm = async () => {
    setIsLoading(true);
    const res = await dispatch(
      userActions.modifyUser({
        currentPassword: password,
        ...actionData,
      }),
    );
    setIsLoading(false);
    if (userActions.modifyUser.rejected.match(res)) {
      errorHandler(res.payload?.response);
    } else closeModal(true);
  };

  return (
    <>
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
    </>
  );
};
