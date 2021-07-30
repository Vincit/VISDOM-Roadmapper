import { FormEvent, useState } from 'react';
import { Alert, Form } from 'react-bootstrap';
import { Trans, useTranslation } from 'react-i18next';
import classNames from 'classnames';
import { useDispatch } from 'react-redux';
import SettingsSharpIcon from '@material-ui/icons/SettingsSharp';
import { StoreDispatchType } from '../../redux';
import { versionsActions } from '../../redux/versions';
import { LoadingSpinner } from '../LoadingSpinner';
import { Modal, ModalTypes } from './types';
import { ModalContent } from './modalparts/ModalContent';
import { ModalFooter } from './modalparts/ModalFooter';
import { ModalFooterButtonDiv } from './modalparts/ModalFooterButtonDiv';
import { ModalHeader } from './modalparts/ModalHeader';
import { Input } from '../forms/FormField';
import css from './EditVersionModal.module.scss';

const classes = classNames.bind(css);

export const EditVersionModal: Modal<ModalTypes.EDIT_VERSION_MODAL> = ({
  closeModal,
  id,
  name,
}) => {
  const { t } = useTranslation();
  const dispatch = useDispatch<StoreDispatchType>();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [newName, setNewName] = useState(name);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsLoading(true);
    const res = await dispatch(
      versionsActions.patchVersion({ id, name: newName }),
    );
    setIsLoading(false);
    if (versionsActions.patchVersion.rejected.match(res)) {
      if (res.payload?.message) setErrorMessage(res.payload.message);
      return;
    }
    closeModal();
  };

  return (
    <>
      <Form onSubmit={handleSubmit}>
        <ModalHeader closeModal={closeModal}>
          <div className={classes(css.headerDiv)}>
            <h3>
              <Trans i18nKey="Change milestone name" />
            </h3>
            <SettingsSharpIcon />
          </div>
        </ModalHeader>
        <ModalContent>
          <div className={classes(css.formDiv)}>
            <Input
              label={t('Milestone name')}
              required
              name="name"
              id="name"
              value={newName}
              onChange={(e) => setNewName(e.currentTarget.value)}
            />
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
    </>
  );
};
