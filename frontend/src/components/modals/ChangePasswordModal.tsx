import { useState, useRef, SyntheticEvent } from 'react';
import Alert from '@mui/material/Alert';
import { useDispatch } from 'react-redux';
import { Trans, useTranslation } from 'react-i18next';
import classNames from 'classnames';
import { ModalTypes, Modal } from './types';
import { ModalContent } from './modalparts/ModalContent';
import { ModalFooter } from './modalparts/ModalFooter';
import { ModalFooterButtonDiv } from './modalparts/ModalFooterButtonDiv';
import { ModalHeader } from './modalparts/ModalHeader';
import { errorState, Input } from '../forms/FormField';
import '../../shared.scss';
import css from './ChangePasswordModal.module.scss';

import { LoadingSpinner } from '../LoadingSpinner';
import { StoreDispatchType } from '../../redux';
import { userActions } from '../../redux/user';

const classes = classNames.bind(css);

export const ChangePasswordModal: Modal<ModalTypes.CHANGE_PASSWORD_MODAL> = ({
  closeModal,
  id,
}) => {
  const { t } = useTranslation();
  const dispatch = useDispatch<StoreDispatchType>();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const [errorMessage, setErrorMessage] = useState('');
  const confirmationError = errorState(useState(''));

  const errorHandler = (response?: { data: string; status: number }) => {
    switch (response?.status) {
      case 400: {
        setErrorMessage(t('Bad request - password'));
        break;
      }
      default:
        setErrorMessage(t('Internal server error'));
        break;
    }
  };

  const handleConfirm = async (e: SyntheticEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!formRef.current?.checkValidity()) return;
    if (newPassword !== confirmPassword) {
      confirmationError.setMessage(t('Password confirmation error'));
      return;
    }
    const action = userActions.modifyUser;
    setIsLoading(true);
    const res = await dispatch(
      action({
        password: newPassword,
        currentPassword,
        id,
      }),
    );
    setIsLoading(false);
    if (action.rejected.match(res)) {
      errorHandler(res.payload?.response);
    } else {
      closeModal(true);
    }
  };

  return (
    <form
      ref={formRef}
      onSubmit={handleConfirm}
      className={classes(css.changePasswordForm)}
    >
      <ModalHeader closeModal={closeModal}>
        <h3>
          <Trans i18nKey="Change password" />
        </h3>
      </ModalHeader>
      <ModalContent gap={30} overflowAuto>
        <Input
          label={t('Current password')}
          autoComplete="off"
          name="password"
          type="password"
          id="current password"
          required
          placeholder={t('Current password')}
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.currentTarget.value)}
        />
        <Input
          label={t('New password')}
          labelHint={t('Password requirements')}
          autoComplete="off"
          id="newPassword"
          type="password"
          required
          minLength={8}
          maxLength={72}
          placeholder={t('New password')}
          value={newPassword}
          onChange={(e) => setNewPassword(e.currentTarget.value)}
        />
        <Input
          label={t('Confirm new password')}
          required
          id="confirmPassword"
          type="password"
          autoComplete="off"
          placeholder={t('Confirm password')}
          value={confirmPassword}
          error={confirmationError}
          onChange={(e) => setConfirmPassword(e.currentTarget.value)}
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
            <button className="button-large" type="submit">
              <Trans i18nKey="Confirm" />
            </button>
          )}
        </ModalFooterButtonDiv>
      </ModalFooter>
    </form>
  );
};
