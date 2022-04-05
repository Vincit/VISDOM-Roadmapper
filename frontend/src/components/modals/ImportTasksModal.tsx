import { FormEvent, useEffect, useState, useMemo } from 'react';
import Alert from '@mui/material/Alert';
import { Trans, useTranslation } from 'react-i18next';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import Select from 'react-select';
import { apiV2, selectById } from '../../api/api';
import { StoreDispatchType } from '../../redux';
import { chosenRoadmapIdSelector } from '../../redux/roadmaps/selectors';
import { RootState } from '../../redux/types';
import { userActions } from '../../redux/user';
import { userInfoSelector } from '../../redux/user/selectors';
import { UserInfo } from '../../redux/user/types';
import { LoadingSpinner } from '../LoadingSpinner';
import { ModalTypes, Modal } from './types';
import { ModalContent } from './modalparts/ModalContent';
import { ModalFooter } from './modalparts/ModalFooter';
import { ModalFooterButtonDiv } from './modalparts/ModalFooterButtonDiv';
import { ModalHeader } from './modalparts/ModalHeader';
import { titleCase } from '../../utils/string';
import '../../shared.scss';

export const ImportTasksModal: Modal<ModalTypes.IMPORT_TASKS_MODAL> = ({
  name,
  closeModal,
}) => {
  const { t } = useTranslation();
  const dispatch = useDispatch<StoreDispatchType>();
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedLabels, setSelectedLabels] = useState<string[] | undefined>();
  const [tokenError, setTokenError] = useState(false);
  const chosenRoadmapId = useSelector(chosenRoadmapIdSelector);
  const [
    importIntegrationBoard,
    importStatus,
  ] = apiV2.useImportIntegrationBoardMutation();
  const { data: roadmap } = apiV2.useGetRoadmapsQuery(undefined, {
    skip: !chosenRoadmapId,
    ...selectById(chosenRoadmapId),
  });
  const selectedBoardId = useMemo(
    () => roadmap?.integrations.find((it) => it.name === name)?.boardId,
    [roadmap, name],
  );
  const {
    data: labels,
    isLoading,
    isError,
    error,
  } = apiV2.useGetIntegrationBoardLabelsQuery(
    { name, roadmapId: chosenRoadmapId! },
    { skip: !chosenRoadmapId },
  );
  const userInfo = useSelector<RootState, UserInfo | undefined>(
    userInfoSelector,
    shallowEqual,
  );

  useEffect(() => {
    if (!userInfo) dispatch(userActions.getUserInfo());
  }, [userInfo, dispatch]);

  const isTokenError = (err: any) => err.data?.error === 'InvalidTokenError';

  useEffect(() => {
    if (!isError) return;
    if (isTokenError(error)) {
      setTokenError(true);
      setErrorMessage(t('Invalid configuration error'));
    } else {
      setErrorMessage(t('Internal server error'));
    }
  }, [isError, error, t]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    const form = event.currentTarget;
    event.preventDefault();
    event.stopPropagation();

    if (form.checkValidity()) {
      try {
        await importIntegrationBoard({
          name,
          roadmapId: chosenRoadmapId!,
          filters: { labels: selectedLabels },
        }).unwrap();
        closeModal();
      } catch (err: any) {
        setErrorMessage(err.data?.message ?? 'something went wrong');
      }
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <ModalHeader closeModal={closeModal}>
        <h3>{t('Import tasks from', { name: titleCase(name) })}</h3>
      </ModalHeader>
      <ModalContent>
        {!tokenError && (
          <>
            <label htmlFor="labels" style={{ marginTop: '1em' }}>
              {t('Select labels to import')}
            </label>
            <Select
              id="labels"
              key={selectedBoardId}
              className="react-select"
              styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
              placeholder="Import all issues"
              isMulti
              isClearable
              isDisabled={selectedBoardId === undefined}
              menuPortalTarget={document.body}
              onChange={(selected) =>
                setSelectedLabels(selected.map(({ value }) => value))
              }
              isLoading={selectedBoardId !== undefined && isLoading}
              defaultValue={selectedLabels?.map((label) => ({
                value: label,
                label,
              }))}
              options={labels?.map((label) => ({ value: label, label }))}
            />
          </>
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
          {importStatus.isLoading ? (
            <LoadingSpinner />
          ) : (
            <button
              className="button-large"
              type="submit"
              disabled={isError || selectedBoardId === undefined}
            >
              <Trans i18nKey="Import" />
            </button>
          )}
        </ModalFooterButtonDiv>
      </ModalFooter>
    </form>
  );
};
