import { MouseEvent, useState } from 'react';
import Alert from '@mui/material/Alert';
import { Trans } from 'react-i18next';
import { Modal, ModalTypes } from './types';
import { ModalContent } from './modalparts/ModalContent';
import { ModalFooter } from './modalparts/ModalFooter';
import { ModalHeader } from './modalparts/ModalHeader';
import { api } from '../../api/api';
import '../../shared.scss';

export const UserAuthTokenModal: Modal<ModalTypes.USER_AUTH_TOKEN_MODAL> = ({
  closeModal,
}) => {
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [token, setToken] = useState('');
  const [visible, setVisible] = useState(false);

  function handleEvent<T>(endpoint: () => Promise<T>, callback: (_: T) => any) {
    return (event: MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();

      setIsLoading(true);
      endpoint()
        .then(callback)
        .catch((reason) => {
          setErrorMessage(reason.toString());
        })
        .finally(() => setIsLoading(false));
    };
  }

  const newToken = handleEvent(api.generateCurrentUserToken, setToken);
  const deleteToken = handleEvent(api.deleteCurrentUserToken, () => {
    setVisible(true);
    setToken('');
  });
  const showToken = handleEvent(api.getCurrentUserToken, (tok) => {
    setVisible(true);
    setToken(tok);
  });
  const toggleShow = () => setVisible((current) => !current);

  return (
    <>
      <ModalHeader closeModal={closeModal}>
        <h3>
          <Trans i18nKey="Manage personal auth token" />
        </h3>
      </ModalHeader>
      <ModalContent>
        <div className="layoutRow" style={{ margin: '30px 0px', gap: '10px' }}>
          <button
            disabled={isLoading}
            className="button-large"
            onClick={token ? toggleShow : showToken}
            type="button"
          >
            <Trans i18nKey={token && visible ? 'Hide token' : 'Show token'} />
          </button>
          <button
            disabled={isLoading}
            className="button-large"
            onClick={newToken}
            type="button"
          >
            <Trans i18nKey="Generate new" />
          </button>
          <button
            disabled={isLoading}
            className="button-large"
            onClick={deleteToken}
            type="button"
          >
            <Trans i18nKey="Delete" />
          </button>
        </div>
        <Alert severity="info" icon={false}>
          {visible ? token || 'no token' : token.replace(/./g, '*')}
        </Alert>
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
      <ModalFooter closeModal={closeModal} />
    </>
  );
};
