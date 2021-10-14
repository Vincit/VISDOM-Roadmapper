import React, { FC, useState } from 'react';
import classNames from 'classnames';
import { Trans, useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { StoreDispatchType } from 'src/redux';
import { Alert } from 'react-bootstrap';
import TextareaAutosize from 'react-textarea-autosize';
import { roadmapsActions } from '../redux/roadmaps/index';
import { MetricsSummary } from './MetricsSummary';
import { valueAndWorkSummary } from '../utils/TaskUtils';
import { BusinessIcon, WorkRoundIcon } from './RoleIcons';
import { Task, TaskRequest } from '../redux/roadmaps/types';
import colors from '../colors.module.scss';
import css from './TaskOverview.module.scss';
import { EditButton, CloseButton, ConfirmButton } from './forms/SvgButton';
import '../shared.scss';
import { LoadingSpinner } from './LoadingSpinner';

const classes = classNames.bind(css);

const numFormat = new Intl.NumberFormat(undefined, {
  minimumFractionDigits: 0,
  maximumFractionDigits: 1,
});

export const TaskOverview: FC<{
  task: Task;
}> = ({ task }) => {
  const { t } = useTranslation();
  const { value, work } = valueAndWorkSummary(task);
  const dispatch = useDispatch<StoreDispatchType>();
  const [editedField, setEditedField] = useState('');
  const [editText, setEditText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const openEditField = (fieldName: string, fieldValue: string) => {
    setEditedField(fieldName);
    setEditText(fieldValue);
  };

  const closeEditField = () => {
    setEditedField('');
    setEditText('');
    setErrorMessage('');
  };

  const handleTextChange = (event: React.FormEvent<HTMLTextAreaElement>) => {
    setEditText(event.currentTarget.value);
  };

  const handleConfirm = () => {
    if (editedField !== '' && editText !== '') {
      setIsLoading(true);
      const req: TaskRequest = {
        id: task.id,
        [editedField]: editText,
      };

      dispatch(roadmapsActions.patchTask(req)).then((res) => {
        setIsLoading(false);
        if (roadmapsActions.patchTask.rejected.match(res)) {
          if (res.payload) {
            setErrorMessage(res.payload.message);
          }
        } else {
          closeEditField();
        }
      });
    } else {
      setErrorMessage("Field can't be empty.");
    }
  };

  const metrics = [
    {
      label: 'Avg Value',
      metricsValue: numFormat.format(value.avg),
      children: <BusinessIcon color={colors.black100} />,
    },
    {
      label: 'Avg Work',
      metricsValue: numFormat.format(work.avg),
      children: <WorkRoundIcon color={colors.black100} />,
    },
  ];

  const taskData = [
    [
      {
        label: 'Title',
        keyName: 'name',
        value: task.name,
        format: 'bold',
        editable: true,
      },
      {
        label: 'Description',
        keyName: 'description',
        value: task.description,
        editable: true,
      },
    ],
    [
      {
        label: 'Created on',
        keyName: 'createdAt',
        value: new Date(task.createdAt).toLocaleDateString(),
        format: 'bold',
        editable: false,
      },
      {
        label: 'Status',
        keyName: 'completed',
        value: task.completed ? 'Completed' : 'Unordered',
        format: task.completed ? 'completed' : 'unordered',
        editable: false,
      },
    ],
  ];

  return (
    <div className={classes(css.overview)}>
      <div className={classes(css.metrics)}>
        {metrics.map(({ label, metricsValue, children }) => (
          <MetricsSummary key={label} label={t(label)} value={metricsValue}>
            {children}
          </MetricsSummary>
        ))}
      </div>
      <div className={classes(css.data)}>
        {taskData.map((column, idx) => (
          // eslint-disable-next-line react/no-array-index-key
          <div className={classes(css.dataColumn)} key={idx}>
            {column.map((row) => (
              <div className={classes(css.dataRow)} key={row.label}>
                <div className={classes(css.label)}>
                  <Trans i18nKey={row.label} />
                </div>

                {editedField === row.keyName ? (
                  <>
                    {isLoading && (
                      <div className={classes(css.spinnerDiv)}>
                        <LoadingSpinner />
                      </div>
                    )}
                    {!isLoading && errorMessage === '' && (
                      <TextareaAutosize
                        className={classes(css.input)}
                        value={editText}
                        onChange={(e) => handleTextChange(e)}
                        autoComplete="off"
                        rows={1}
                      />
                    )}
                    {errorMessage !== '' && (
                      <div className={classes(css.alertDiv)}>
                        <Alert
                          show={errorMessage.length > 0}
                          variant="danger"
                          onClose={() => setErrorMessage('')}
                        >
                          {errorMessage}
                        </Alert>
                      </div>
                    )}
                    {row.editable && (
                      <div className={classes(css.dataColumn)}>
                        <CloseButton onClick={() => closeEditField()} />
                        {errorMessage === '' && (
                          <ConfirmButton onClick={handleConfirm} />
                        )}
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <div className={classes(css.value, css[row.format ?? ''])}>
                      {row.value}
                    </div>
                    {row.editable && (
                      <EditButton
                        fontSize="medium"
                        onClick={() => openEditField(row.keyName, row.value)}
                      />
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};
