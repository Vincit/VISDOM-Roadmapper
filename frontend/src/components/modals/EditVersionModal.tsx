import { FormEvent, useState } from 'react';
import { Form } from 'react-bootstrap';
import Alert from '@mui/material/Alert';
import { Trans, useTranslation } from 'react-i18next';
import classNames from 'classnames';
import { useSelector } from 'react-redux';
import SettingsSharpIcon from '@mui/icons-material/SettingsSharp';
import { chosenRoadmapIdSelector } from '../../redux/roadmaps/selectors';
import { LoadingSpinner } from '../LoadingSpinner';
import { Modal, ModalTypes } from './types';
import { ModalContent } from './modalparts/ModalContent';
import { ModalFooter } from './modalparts/ModalFooter';
import { ModalFooterButtonDiv } from './modalparts/ModalFooterButtonDiv';
import { ModalHeader } from './modalparts/ModalHeader';
import { Input } from '../forms/FormField';
import css from './EditVersionModal.module.scss';
import { apiV2 } from '../../api/api';

const classes = classNames.bind(css);

export const EditVersionModal: Modal<ModalTypes.EDIT_VERSION_MODAL> = ({
  closeModal,
  id,
  name,
}) => {
  const { t } = useTranslation();
  const [errorMessage, setErrorMessage] = useState('');
  const [newName, setNewName] = useState(name);
  const [patchVersion, { isLoading }] = apiV2.usePatchVersionMutation();
  const roadmapId = useSelector(chosenRoadmapIdSelector);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (roadmapId === undefined) return;
    try {
      await patchVersion({ roadmapId, id, name: newName }).unwrap();
      closeModal();
    } catch (err: any) {
      setErrorMessage(err.data?.message ?? err.data ?? 'something went wrong');
    }
  };

  return (
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
        <div className={classes(css.versionformDiv)}>
          <Input
            label={t('Milestone name')}
            required
            name="name"
            id="name"
            value={newName}
            onChange={(e) => setNewName(e.currentTarget.value)}
          />
        </div>
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
    </Form>
  );
};
