import { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';
import CloseIcon from '@mui/icons-material/Close';
import DoneIcon from '@mui/icons-material/Done';
import LinkIcon from '@mui/icons-material/Link';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useDispatch } from 'react-redux';
import { Tooltip } from './InfoTooltip';
import { Input } from './forms/FormField';
import { Task } from '../redux/roadmaps/types';
import { apiV2 } from '../api/api';
import { modalsActions } from '../redux/modals';
import { ModalTypes } from './modals/types';
import { StoreDispatchType } from '../redux';
import css from './AttachmentTable.module.scss';

const classes = classNames.bind(css);

const validateUrl = (url: string): boolean => {
  if (url.startsWith('http://') || url.startsWith('https://')) return true;
  return false;
};

export const AttachmentTable: FC<{
  task: Task;
  roadmapId: number;
}> = ({ task, roadmapId }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch<StoreDispatchType>();
  const [copyOpen, setCopyOpen] = useState<number[]>([]);
  const [newAttachment, setNewAttachment] = useState('');
  const [editOpen, setEditOpen] = useState<
    { id: number; attachment: string }[]
  >([]);
  const { data: attachments } = apiV2.useGetAttachmentsQuery({
    taskId: task.id,
    roadmapId,
  });
  const [addAttachment] = apiV2.useAddAttachmentMutation();
  const [editAttachment] = apiV2.useEditAttachmentMutation();

  const sendAttachment = async () => {
    if (newAttachment.length === 0 || !validateUrl(newAttachment)) return;
    await addAttachment({
      taskId: task.id,
      roadmapId,
      link: newAttachment,
    });
    setNewAttachment('');
  };

  const modifyAttachment = async (id: number) => {
    setEditOpen((prev) => prev.concat([{ id, attachment: '' }]));
  };

  const applyEdit = async (id: number) => {
    const editedAttachment = editOpen.find((edit) => edit.id === id)
      ?.attachment;
    if (!editedAttachment || !validateUrl(editedAttachment)) return;
    setEditOpen((prev) => prev.filter((edit) => edit.id !== id));
    await editAttachment({
      taskId: task.id,
      roadmapId,
      attachmentId: id,
      link: editedAttachment,
    });
  };

  const closeEdit = (id: number) => {
    setEditOpen((prev) => prev.filter((edit) => edit.id !== id));
  };

  const removeAttachment = async (attachment: string, id: number) => {
    dispatch(
      modalsActions.showModal({
        modalType: ModalTypes.REMOVE_ATTACHMENT_MODAL,
        modalProps: {
          taskId: task.id,
          roadmapId,
          attachmentId: id,
          attachment,
        },
      }),
    );
  };

  const handleEditChange = (id: number, value: string) => {
    setEditOpen((prev) =>
      prev.map((previous) => {
        if (previous.id === id) return { id, attachment: value };
        return previous;
      }),
    );
  };

  const handleCopyUrl = (id: number, attachment: string) => {
    navigator.clipboard.writeText(`${attachment}`);
    setCopyOpen([id]);
    setTimeout(() => setCopyOpen([]), 2000);
  };

  return (
    <div>
      <div className={classes(css.list)}>
        {attachments?.map(({ attachment, id }) => (
          <div key={id}>
            {editOpen.find((edit) => edit.id === id) ? (
              <div className={classes(css.inputContainer)}>
                <Input
                  type="url"
                  className={classes(css.input)}
                  autoComplete="off"
                  name={`edit-${id}`}
                  id={`edit-${id}`}
                  placeholder={attachment}
                  value={editOpen.find((edit) => edit.id === id)?.attachment}
                  onChange={(e) => handleEditChange(id, e.currentTarget.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') applyEdit(id);
                  }}
                />
                <DoneIcon
                  className={classes(css.doneIcon)}
                  onClick={() => applyEdit(id)}
                />
                <CloseIcon
                  className={classes(css.closeIcon)}
                  onClick={() => closeEdit(id)}
                />
              </div>
            ) : (
              <div className={classes(css.attachment)}>
                <LinkIcon className={classes(css.linkIcon)} />
                <a href={attachment} className={classes(css.link)}>
                  {attachment}
                </a>
                <Tooltip
                  open={copyOpen.includes(id)}
                  title={t('Copied to clipboard')}
                  placement="right"
                  arrow
                  className={classes(css.arrow)}
                >
                  <ContentCopyIcon
                    className={classes(css.copyIcon)}
                    onClick={() => handleCopyUrl(id, attachment)}
                  />
                </Tooltip>
                <div className={classes(css.sideIcons)}>
                  <EditIcon
                    className={classes(css.edit)}
                    onClick={() => modifyAttachment(id)}
                  />
                  <DeleteIcon
                    className={classes(css.remove)}
                    onClick={() => removeAttachment(attachment, id)}
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      <div className={classes(css.inputContainer)}>
        <Input
          type="url"
          className={classes(css.input)}
          autoComplete="off"
          name="attachment"
          id="attachment"
          placeholder={
            attachments?.length
              ? t('Link to another attachment')
              : t('Add a link to an attachment')
          }
          value={newAttachment}
          onChange={(e) => setNewAttachment(e.currentTarget.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') sendAttachment();
          }}
        />
        <DoneIcon className={classes(css.doneIcon)} onClick={sendAttachment} />
        <CloseIcon
          className={classes(css.closeIcon)}
          onClick={() => setNewAttachment('')}
        />
      </div>
    </div>
  );
};
