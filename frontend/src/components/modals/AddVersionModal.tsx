import { FormEvent, useState } from 'react';
import Alert from '@mui/material/Alert';
import { Trans, useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { chosenRoadmapIdSelector } from '../../redux/roadmaps/selectors';
import { LoadingSpinner } from '../LoadingSpinner';
import { Modal, ModalTypes } from './types';
import { ModalContent } from './modalparts/ModalContent';
import { ModalFooter } from './modalparts/ModalFooter';
import { ModalFooterButtonDiv } from './modalparts/ModalFooterButtonDiv';
import { ModalHeader } from './modalparts/ModalHeader';
import { Input } from '../forms/FormField';
import '../../shared.scss';
import { apiV2 } from '../../api/api';

export const AddVersionModal: Modal<ModalTypes.ADD_VERSION_MODAL> = ({
  closeModal,
}) => {
  const { t } = useTranslation();
  const [errorMessage, setErrorMessage] = useState('');
  const [versionName, setVersionName] = useState('');
  const [addVersion, { isLoading }] = apiV2.useAddVersionMutation();
  const roadmapId = useSelector(chosenRoadmapIdSelector);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    const form = event.currentTarget;
    event.preventDefault();
    event.stopPropagation();

    if (!form.checkValidity() || !roadmapId) return;

    try {
      await addVersion({ roadmapId, name: versionName }).unwrap();
      closeModal();
    } catch (err: any) {
      setErrorMessage(err.data?.message ?? err.data ?? 'something went wrong');
    }
  };

  const onNameChange = (name: string) => {
    setVersionName(name);
  };

  return (
    <form onSubmit={handleSubmit}>
      <ModalHeader closeModal={closeModal}>
        <h3>
          <Trans i18nKey="Add milestone" />
        </h3>
      </ModalHeader>
      <ModalContent>
        <Input
          label={t('Milestone name')}
          autoComplete="off"
          required
          type="text"
          name="name"
          id="name"
          value={versionName}
          placeholder={t('Milestone name')}
          onChange={(e) => onNameChange(e.currentTarget.value)}
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
              <Trans i18nKey="Add" />
            </button>
          )}
        </ModalFooterButtonDiv>
      </ModalFooter>
    </form>
  );
};
