import { FormEvent, useEffect, useState } from 'react';
import Alert from '@mui/material/Alert';
import classNames from 'classnames';
import { Trans, useTranslation } from 'react-i18next';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import LinkIcon from '@mui/icons-material/Link';
import CloseIcon from '@mui/icons-material/Close';
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
import { apiV2 } from '../../api/api';
import css from './AddTaskModal.module.scss';

const classes = classNames.bind(css);

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
  const chosenRoadmapId = useSelector(chosenRoadmapIdSelector);
  const userInfo = useSelector<RootState, UserInfo | undefined>(
    userInfoSelector,
    shallowEqual,
  );
  const [attachmentArray, setAttachmentArray] = useState([{ id: 0, link: '' }]);

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
        roadmapId: chosenRoadmapId!,
        createdByUser: userInfo?.id,
        attachments: attachmentArray.flatMap(({ link }) =>
          link.length ? { link } : [],
        ),
      };

      try {
        const task = await addTaskTrigger({
          roadmapId: chosenRoadmapId!,
          task: req,
        }).unwrap();
        closeModal();
        if (!representsCustomers(userInfo!, chosenRoadmapId!)) return;
        dispatch(
          modalsActions.showModal({
            modalType: ModalTypes.RATE_TASK_MODAL,
            modalProps: {
              task,
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

  const handleAttachmentDelete = (elementId: number) => {
    if (attachmentArray.length === 1) setAttachmentArray([{ id: 0, link: '' }]);
    else
      setAttachmentArray((prev) =>
        prev.filter((prevAttachment) => prevAttachment.id !== elementId),
      );
  };

  const handleAttachmentChange = (currentValue: string, elementId: number) => {
    setAttachmentArray((prev) =>
      prev.map((obj) => {
        if (obj.id === elementId) return { ...obj, link: currentValue };
        return obj;
      }),
    );
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

        <div className={classes(css.title)}>{t('Attachments')}</div>

        {attachmentArray.map((element) => (
          <div key={element.id}>
            <div className={classes(css.attachmentContainer)}>
              <div className={classes(css.placeholderPrefix)}>
                <LinkIcon className={classes(css.icon)} />
                <div className={classes(css.divider)} />
              </div>
              <Input
                type="url"
                className={classes(css.inputArea)}
                autoComplete="off"
                name={`attachment-${element.id}`}
                id={`attachment-${element.id}`}
                placeholder={t('Link to attachment')}
                value={element.link}
                onChange={(e) =>
                  handleAttachmentChange(e.currentTarget.value, element.id)
                }
              />
              <CloseIcon
                className={classes(css.closeIcon)}
                onClick={() => handleAttachmentDelete(element.id)}
              />
            </div>
          </div>
        ))}

        <button
          className={classes(css.button)}
          type="button"
          onClick={() =>
            setAttachmentArray((prev) =>
              prev.concat({
                id: prev[prev.length - 1].id + 1,
                link: '',
              }),
            )
          }
        >
          <Trans i18nKey="Add another attachment" />
        </button>

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
