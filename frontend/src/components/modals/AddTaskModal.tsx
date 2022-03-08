import { FormEvent, useEffect, useState } from 'react';
import Alert from '@mui/material/Alert';
import { Trans, useTranslation } from 'react-i18next';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { StoreDispatchType } from '../../redux';
import { modalsActions } from '../../redux/modals';
import { ModalTypes, Modal } from './types';
import { chosenRoadmapIdSelector } from '../../redux/roadmaps/selectors';
import { TaskRequest } from '../../redux/roadmaps/types';
import { RootState } from '../../redux/types';
import { userActions } from '../../redux/user';
import { userInfoSelector } from '../../redux/user/selectors';
import { UserInfo } from '../../redux/user/types';
import { LoadingSpinner } from '../LoadingSpinner';
import { ModalContent } from './modalparts/ModalContent';
import { ModalFooter } from './modalparts/ModalFooter';
import { ModalFooterButtonDiv } from './modalparts/ModalFooterButtonDiv';
import { ModalHeader } from './modalparts/ModalHeader';
import { Input, TextArea } from '../forms/FormField';
import { representsCustomers } from '../../utils/UserUtils';
import '../../shared.scss';
import { apiV2 } from '../../api/api';

export const AddTaskModal: Modal<ModalTypes.ADD_TASK_MODAL> = ({
  closeModal,
}) => {
  const { t } = useTranslation();
  const dispatch = useDispatch<StoreDispatchType>();
  const [formValues, setFormValues] = useState({
    name: '',
    description: '',
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [addTaskTrigger, { isLoading }] = apiV2.useAddTaskMutation();
  const chosenRoadmapId = useSelector<RootState, number | undefined>(
    chosenRoadmapIdSelector,
  );
  const userInfo = useSelector<RootState, UserInfo | undefined>(
    userInfoSelector,
    shallowEqual,
  );

  useEffect(() => {
    if (!userInfo) dispatch(userActions.getUserInfo());
  }, [userInfo, dispatch]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    const form = event.currentTarget;
    event.preventDefault();
    event.stopPropagation();

    if (form.checkValidity()) {
      const req: TaskRequest = {
        name: formValues.name,
        description: formValues.description,
        roadmapId: chosenRoadmapId,
        createdByUser: userInfo?.id,
      };

      try {
        const res = await addTaskTrigger({
          roadmapId: chosenRoadmapId!,
          task: req,
        }).unwrap();
        closeModal();
        if (!representsCustomers(userInfo!, chosenRoadmapId!)) return;
        dispatch(
          modalsActions.showModal({
            modalType: ModalTypes.RATE_TASK_MODAL,
            modalProps: {
              taskId: res.id,
              edit: false,
            },
          }),
        );
      } catch (err: any) {
        setErrorMessage(err.data?.message);
      }
    }
  };

  const onNameChange = (name: string) => {
    setFormValues({ ...formValues, name });
  };

  const onDescriptionChange = (description: string) => {
    setFormValues({ ...formValues, description });
  };

  return (
    <form onSubmit={handleSubmit}>
      <ModalHeader closeModal={closeModal}>
        <h3>
          <Trans i18nKey="Add new task" />
        </h3>
      </ModalHeader>
      <ModalContent>
        <div className="formGroup">
          <Input
            label={t('Task name')}
            autoComplete="off"
            required
            name="name"
            id="name"
            placeholder={t('Task name')}
            value={formValues.name}
            onChange={(e) => onNameChange(e.currentTarget.value)}
          />
        </div>

        <div className="formGroup">
          <TextArea
            label={t('Description')}
            autoComplete="off"
            required
            name="description"
            id="description"
            placeholder={t('Description')}
            value={formValues.description}
            onChange={(e) => onDescriptionChange(e.currentTarget.value)}
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
              <Trans i18nKey="Add" />
            </button>
          )}
        </ModalFooterButtonDiv>
      </ModalFooter>
    </form>
  );
};
