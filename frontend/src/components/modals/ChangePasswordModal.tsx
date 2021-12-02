import assert from 'assert';
import { FormEvent, useState } from 'react';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { Alert, Form } from 'react-bootstrap';
import { Trans, useTranslation } from 'react-i18next';
import { ModalTypes, Modal } from './types';
import { ModalContent } from './modalparts/ModalContent';
import { ModalFooter } from './modalparts/ModalFooter';
import { ModalFooterButtonDiv } from './modalparts/ModalFooterButtonDiv';
import { ModalHeader } from './modalparts/ModalHeader';
import { errorState, FieldProps, Input } from '../forms/FormField';
import '../../shared.scss';
import { userActions } from '../../redux/user';
import { RootState } from '../../redux/types';
import { StoreDispatchType } from '../../redux';
import { UserInfo } from '../../redux/user/types';
import { userInfoSelector } from '../../redux/user/selectors';
import { LoadingSpinner } from '../LoadingSpinner';

export const ChangePasswordModal: Modal<ModalTypes.CHANGE_PASSWORD_MODAL> = ({
  closeModal,
}) => {
  const dispatch = useDispatch<StoreDispatchType>();
  const { t } = useTranslation();
  const [formValues, setFormValues] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const userInfo = useSelector<RootState, UserInfo | undefined>(
    userInfoSelector,
    shallowEqual,
  );
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const fields: { [K in FormFieldName]: FieldProps<HTMLInputElement> } = {
    currentPassword: {
      label: t('Current password'),
      placeholder: t('Current password'),
      autoComplete: 'current-password',
      type: 'password',
      error: errorState(useState('')),
    },
    newPassword: {
      label: t('New password'),
      placeholder: t('New password'),
      type: 'password',
      autoComplete: 'new-password',
      minLength: 8,
      maxLength: 72,
      error: errorState(useState('')),
    },
    confirmPassword: {
      label: t('Confirm new password'),
      placeholder: t('Confirm new password'),
      type: 'password',
      autoComplete: 'confirm-password',
      minLength: 8,
      maxLength: 72,
      error: errorState(useState('')),
    },
  };

  type FormFieldName = keyof typeof formValues;

  const knownField = (value: any): value is FormFieldName =>
    value in formValues;

  const setError = (column: string, message: string) => {
    if (knownField(column)) {
      fields[column].error!.setMessage(message);
    } else {
      setErrorMessage(message);
    }
  };

  const errorHandler = (response?: { data: string; status: number }) => {
    switch (response?.status) {
      case 400: {
        setErrorMessage(
          t('Bad request error - is the current password correct?'),
        );
        break;
      }
      default:
        setErrorMessage(t('Internal server error.'));
        break;
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    const form = event.currentTarget;
    event.preventDefault();
    event.stopPropagation();
    if (formValues.newPassword !== formValues.confirmPassword) {
      setError('confirmPassword', t('Password confirmation error'));
      return;
    }
    if (form.checkValidity()) {
      setIsLoading(true);
      const res = await dispatch(
        userActions.patchUser({
          id: userInfo!.id,
          currentPassword: formValues.currentPassword,
          password: formValues.newPassword,
        }),
      );
      setIsLoading(false);
      if (userActions.patchUser.rejected.match(res)) {
        errorHandler(res.payload?.response);
      } else closeModal(true);
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <ModalHeader closeModal={closeModal}>
        <h3>
          <Trans i18nKey="Change password" />
        </h3>
      </ModalHeader>
      <ModalContent>
        {Object.entries(fields).map(([name, props]) => {
          assert(knownField(name), `invalid field: ${name}`);
          return (
            <Form.Group>
              <Input
                {...props}
                key={name}
                id={name}
                required
                value={formValues[name]}
                onChange={(e) =>
                  setFormValues({
                    ...formValues,
                    [name]: e.currentTarget.value,
                  })
                }
              />
            </Form.Group>
          );
        })}
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
            <button className="button-large" type="submit">
              <Trans i18nKey="Confirm" />
            </button>
          )}
        </ModalFooterButtonDiv>
      </ModalFooter>
    </Form>
  );
};
