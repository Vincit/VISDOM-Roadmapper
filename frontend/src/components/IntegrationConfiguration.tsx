import { FC, FormEvent, useState, useEffect } from 'react';
import Alert from '@mui/material/Alert';
import { Trans, useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { skipToken } from '@reduxjs/toolkit/query/react';
import classNames from 'classnames';
import InfoIcon from '@mui/icons-material/InfoOutlined';
import ArrowIcon from '@mui/icons-material/ArrowForward';
import { ReactComponent as ExpandLess } from '../icons/expand_less.svg';
import { ReactComponent as ExpandMore } from '../icons/expand_more.svg';
import { StoreDispatchType } from '../redux';
import { modalsActions } from '../redux/modals/index';
import { ModalTypes } from './modals/types';
import {
  IntegrationConfiguration,
  IntegrationConfigurationRequest,
} from '../redux/roadmaps/types';
import { TaskStatus } from '../../../shared/types/customTypes';
import { taskStatusToText } from '../utils/TaskUtils';
import { titleCase } from '../utils/string';
import { apiV2 } from '../api/api';
import { InfoTooltip } from './InfoTooltip';
import { LoadingSpinner } from './LoadingSpinner';
import { Input } from './forms/FormField';
import { CloseButton } from './forms/SvgButton';
import { Dropdown } from './forms/Dropdown';

import css from './IntegrationConfiguration.module.scss';
import colors from '../colors.module.scss';

const classes = classNames.bind(css);

const SetMapping: FC<{
  name: string;
  status?: TaskStatus;
  select: (status: TaskStatus) => unknown;
  remove?: () => unknown;
}> = ({ name, status, select, remove }) => {
  const { t } = useTranslation();

  return (
    <div className={classes(css.mapping)}>
      <span className={classes(css.name)}>{name}</span>
      <ArrowIcon htmlColor={colors.black40} />
      <Dropdown
        css={css}
        title={status === undefined ? undefined : taskStatusToText(status)}
        placeholder={taskStatusToText(TaskStatus.NOT_STARTED)}
      >
        {Object.values(TaskStatus).map(
          (value) =>
            typeof value !== 'string' &&
            value !== TaskStatus.NOT_STARTED && (
              <button
                key={value}
                type="button"
                onClick={() => select(value)}
                className={classes(css.dropItem)}
              >
                {t(taskStatusToText(value))}
              </button>
            ),
        )}
      </Dropdown>
      {remove && (
        <CloseButton
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            remove();
          }}
        />
      )}
    </div>
  );
};

const MapStates: FC<{ configuration: IntegrationConfiguration }> = ({
  configuration: { id, name, roadmapId, boardId, statusMapping },
}) => {
  const { t } = useTranslation();
  const [errorMessage, setErrorMessage] = useState('');

  const {
    data: columns,
    isError,
    isLoading,
  } = apiV2.useGetIntegrationBoardColumnsQuery({
    name,
    roadmapId,
  });

  const [selected, setSelected] = useState<{
    id: string;
    name: string;
  } | null>();

  const [setMapping] = apiV2.useSetIntegrationStatusMappingMutation();
  const [removeMapping] = apiV2.useDeleteIntegrationStatusMappingMutation();

  const select = (fromColumn: string) => (toStatus: TaskStatus) => {
    setMapping({ roadmapId, name, id, fromColumn, toStatus });
    setSelected(null);
  };

  if (isError || !boardId) return null;

  return (
    <div>
      <label htmlFor="status-mapping">Task state in {name}</label>
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <>
          {errorMessage && (
            <Alert
              severity="error"
              onClose={() => {
                setErrorMessage('');
              }}
              icon={false}
            >
              {errorMessage}
            </Alert>
          )}
          <Dropdown css={css} title={selected?.name} id="status-mapping">
            {columns
              ?.filter(
                (column) =>
                  !statusMapping?.some(
                    ({ fromColumn }) => fromColumn === column.id,
                  ),
              )
              .map((column) => (
                <button
                  key={column.id}
                  type="button"
                  onClick={() => setSelected(column)}
                  className={classes(css.dropItem)}
                >
                  {column.name}
                </button>
              ))}
          </Dropdown>
          {selected && (
            <div className={classes(css.statusMappingLabel)}>
              <div>{t('Task state')}</div>
              <div>{t('Roadmapper state')}</div>
            </div>
          )}
          <div className={classes(css.mappings)}>
            {selected && (
              <SetMapping name={selected.name} select={select(selected.id)} />
            )}
            {columns && statusMapping && statusMapping.length > 0 && (
              <>
                <div className={classes(css.statusMappingLabel)}>
                  {t('Saved mappings')}
                </div>
                {statusMapping?.map(
                  ({ id: mappingId, fromColumn, toStatus }) => {
                    const columnName = columns.find(
                      (column) => column.id === fromColumn,
                    )?.name;
                    if (!columnName) return undefined;
                    return (
                      <SetMapping
                        key={fromColumn}
                        name={columnName}
                        status={toStatus}
                        select={select(fromColumn)}
                        remove={() =>
                          removeMapping({ roadmapId, name, id, mappingId })
                        }
                      />
                    );
                  },
                )}
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
};

const SelectBoard: FC<{ configuration: IntegrationConfiguration }> = ({
  configuration,
}) => {
  const { id, name, roadmapId, boardId } = configuration;
  const { t } = useTranslation();

  const [errorMessage, setErrorMessage] = useState('');
  const [patch] = apiV2.usePatchIntegrationConfigurationMutation();

  const [boardsTokenError, setBoardsTokenError] = useState(false);
  const [selectedError, setSelectedError] = useState(false);
  const selected = apiV2.useGetIntegrationSelectedBoardQuery(
    { name, roadmapId },
    { skip: !boardId },
  );

  const boards = apiV2.useGetIntegrationBoardsQuery(
    { name, roadmapId },
    { skip: !!boardId && !selected.isSuccess },
  );

  const isTokenError = (err: any) => err?.data?.error === 'InvalidTokenError';

  useEffect(() => {
    setBoardsTokenError(selected.isSuccess && isTokenError(boards.error));
    if (selected.isError) {
      setSelectedError(true);
      setErrorMessage(t('Selected call failed'));
    }
  }, [boards, selected, t]);

  if (
    !selected.isLoading &&
    !selected.data &&
    !selected.error &&
    !boards.isLoading &&
    !boards.data &&
    !boards.error
  )
    return null;

  return (
    <div>
      <div className={classes(css.columnHeader)}>
        {t('Relations')}
        <InfoTooltip title={t(`integration-relation-tooltip`)}>
          <InfoIcon className={classes(css.tooltipGray, css.infoIcon)} />
        </InfoTooltip>
      </div>
      <label htmlFor="board">
        {t('Select integration board', { name: titleCase(name) })}
      </label>
      {boards.isLoading || selected.isLoading ? (
        <LoadingSpinner />
      ) : (
        <>
          {(selectedError || boardsTokenError || errorMessage) && (
            <Alert
              severity={errorMessage ? 'error' : 'info'}
              onClose={() => {
                if (boardsTokenError) setBoardsTokenError(false);
                if (selectedError) {
                  selected.refetch();
                  setSelectedError(false);
                }
                if (errorMessage) setErrorMessage('');
              }}
              icon={false}
            >
              {errorMessage || t('Oauth can not select board')}
            </Alert>
          )}
          {!selected.isError && (
            <Dropdown
              css={css}
              title={selected.data?.name}
              disabled={boards.isError}
              id="board"
            >
              {boards.data?.map((board) => (
                <button
                  key={board.id}
                  type="button"
                  onClick={() =>
                    patch({ id, name, roadmapId, boardId: board.id })
                      .unwrap()
                      .catch((err) => {
                        setErrorMessage(
                          err.data?.message ?? 'something went wrong',
                        );
                      })
                  }
                  className={classes(css.dropItem)}
                >
                  {board.name}
                </button>
              ))}
            </Dropdown>
          )}
          {boardId && selected.isSuccess && (
            <MapStates configuration={configuration} />
          )}
        </>
      )}
    </div>
  );
};

const Remove: FC<{ configuration: IntegrationConfiguration }> = ({
  configuration,
}) => {
  const [remove] = apiV2.useDeleteIntegrationConfigurationMutation();
  return (
    <div className={classes(css.layoutCol)}>
      <span className={classes(css.columnHeader)}>
        <Trans i18nKey="Remove configuration" />
      </span>
      <button
        className={classes(css.deleteButton)}
        type="submit"
        onClick={(e) => {
          e.preventDefault();
          // TODO: ask confirmation
          remove(configuration);
        }}
      >
        <Trans
          i18nKey="Remove configuration button"
          values={{ name: titleCase(configuration.name) }}
        />
      </button>
    </div>
  );
};

const Oauth: FC<{ configuration: IntegrationConfiguration }> = ({
  configuration: { name, roadmapId },
}) => {
  const { t } = useTranslation();
  const dispatch = useDispatch<StoreDispatchType>();

  return (
    <div className={classes(css.layoutCol)}>
      <span className={classes(css.columnHeader)}>
        {titleCase(name)} <Trans i18nKey="authentication" />
        <InfoTooltip title={t(`oauth-${name}-tooltip`)}>
          <InfoIcon className={classes(css.tooltipGray, css.infoIcon)} />
        </InfoTooltip>
      </span>
      <button
        className={classes(css.authButton)}
        type="submit"
        onClick={(e) => {
          e.preventDefault();
          dispatch(
            modalsActions.showModal({
              modalType: ModalTypes.SETUP_OAUTH_MODAL,
              modalProps: { name, roadmapId },
            }),
          );
        }}
      >
        + <Trans i18nKey="OAuth" />
      </button>
    </div>
  );
};

const Config: FC<{
  name: string;
  roadmapId: number;
  configuration?: IntegrationConfigurationRequest;
}> = ({ name, roadmapId, configuration }) => {
  const [errorMessage, setErrorMessage] = useState('');
  const [patch, patchStatus] = apiV2.usePatchIntegrationConfigurationMutation();
  const add = apiV2.useAddIntegrationConfigurationMutation();

  const { fields } = apiV2.useGetIntegrationsQuery(roadmapId ?? skipToken, {
    selectFromResult: ({ data }) => ({ fields: data?.[name] }),
  });

  const [formValues, setFormValues] = useState<IntegrationConfigurationRequest>(
    configuration || {
      name,
      host: undefined,
      projectId: undefined,
      consumerkey: '',
      privatekey: '',
      roadmapId: roadmapId!,
    },
  );
  const [submitted, setSubmitted] = useState<
    Partial<IntegrationConfigurationRequest>
  >({});

  const [action, { isLoading }] = configuration ? [patch, patchStatus] : add;

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    event.stopPropagation();
    const payload = { ...formValues };
    action(payload)
      .unwrap()
      .then(() => {
        setSubmitted(payload);
      })
      .catch((err) => {
        setErrorMessage(err.data?.message ?? 'something went wrong');
      });
  };

  const onChange = (key: string, value: string) => {
    setFormValues({ ...formValues, [key]: value });
  };

  if (!fields) return null;

  return (
    <form onSubmit={handleSubmit}>
      {fields.map(({ field, secret }) => (
        <Input
          key={field}
          label={field}
          autoComplete="off"
          required
          type={secret ? 'password' : undefined}
          name={field}
          id={`${name}-${field}`}
          placeholder={`${titleCase(name)} ${field}`}
          value={(formValues as any)[field] ?? ''}
          onChange={(e) => onChange(field, e.currentTarget.value)}
        />
      ))}
      {errorMessage.length > 0 && (
        <Alert
          severity="error"
          onClose={() => setErrorMessage('')}
          icon={false}
        >
          {errorMessage}
        </Alert>
      )}
      {fields.every(({ field }) => (formValues as any)[field]) &&
        fields.some(
          ({ field }) =>
            (formValues as any)[field] !== (submitted as any)[field],
        ) && (
          <button className="button-large" type="submit" disabled={isLoading}>
            {isLoading ? <LoadingSpinner /> : <Trans i18nKey="Save" />}
          </button>
        )}
    </form>
  );
};

export const IntegrationConfig: FC<{ roadmapId: number; name: string }> = ({
  roadmapId,
  name,
}) => {
  const { t } = useTranslation();
  const { configuration, isLoading } = apiV2.useGetRoadmapsQuery(undefined, {
    selectFromResult: ({ data, ...rest }) => {
      return {
        ...rest,
        configuration: data
          ?.find(({ id }) => id === roadmapId)
          ?.integrations.find((it) => it.name === name),
      };
    },
  });

  const [expanded, setExpanded] = useState(false);

  return (
    <div className={classes(css.configContainer)}>
      <div
        onClick={() => setExpanded((prev) => !prev)}
        onKeyPress={() => setExpanded((prev) => !prev)}
        role="button"
        tabIndex={0}
      >
        <h3 className={classes(css.configHeader)}>
          <span>
            {titleCase(name)} <Trans i18nKey="configuration" />
          </span>
          <div className={classes(css.expandIcon)}>
            {expanded ? <ExpandLess /> : <ExpandMore />}
          </div>
          <InfoTooltip title={t(`config-${name}-tooltip`)}>
            <InfoIcon className={classes(css.tooltipGray, css.infoIcon)} />
          </InfoTooltip>
        </h3>
      </div>
      {expanded && (
        <div className={classNames(css.configContent)}>
          {isLoading ? (
            <LoadingSpinner />
          ) : (
            <Config
              roadmapId={roadmapId}
              name={name}
              configuration={configuration}
            />
          )}
          {configuration && (
            <>
              <Oauth configuration={configuration} />
              <SelectBoard configuration={configuration} />
              <Remove configuration={configuration} />
            </>
          )}
        </div>
      )}
    </div>
  );
};
