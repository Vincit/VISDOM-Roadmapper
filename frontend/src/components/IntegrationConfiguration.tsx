import { FC, FormEvent, useState, useEffect } from 'react';
import Alert from '@mui/material/Alert';
import Select from 'react-select';
import { Trans, useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { skipToken } from '@reduxjs/toolkit/query/react';
import classNames from 'classnames';
import InfoIcon from '@mui/icons-material/InfoOutlined';
import { ReactComponent as ExpandLess } from '../icons/expand_less.svg';
import { ReactComponent as ExpandMore } from '../icons/expand_more.svg';
import { StoreDispatchType } from '../redux';
import { modalsActions } from '../redux/modals/index';
import { ModalTypes } from './modals/types';
import {
  IntegrationConfiguration,
  IntegrationConfigurationRequest,
} from '../redux/roadmaps/types';
import { titleCase } from '../utils/string';
import { apiV2 } from '../api/api';
import { InfoTooltip } from './InfoTooltip';
import { LoadingSpinner } from './LoadingSpinner';
import { Input } from './forms/FormField';

import '../shared.scss';
import css from './IntegrationConfiguration.module.scss';

const classes = classNames.bind(css);

const SelectBoard: FC<{ configuration: IntegrationConfiguration }> = ({
  configuration: { id, name, roadmapId, boardId },
}) => {
  const { t } = useTranslation();

  const [errorMessage, setErrorMessage] = useState('');
  const [patch] = apiV2.usePatchIntegrationConfigurationMutation();

  const [tokenError, setTokenError] = useState(false);
  const selected = apiV2.useGetIntegrationSelectedBoardQuery(
    { name, roadmapId },
    { skip: !boardId },
  );

  const boards = apiV2.useGetIntegrationBoardsQuery(
    { name, roadmapId },
    { skip: selected.isError },
  );

  const isTokenError = (err: any) => err?.data?.error === 'InvalidTokenError';

  useEffect(() => {
    setTokenError(selected.isSuccess && isTokenError(boards.error));
  }, [boards, selected]);

  if (selected.isError) return null;
  if (
    !selected.isLoading &&
    !selected.data &&
    !boards.isLoading &&
    !boards.data
  )
    return null;

  return (
    <div>
      <label htmlFor="board">
        {t('Select integration board', { name: titleCase(name) })}
      </label>
      {boards.isLoading || selected.isLoading ? (
        <LoadingSpinner />
      ) : (
        <>
          {(tokenError || errorMessage) && (
            <Alert
              severity={errorMessage ? 'error' : 'info'}
              onClose={() => {
                if (tokenError) setTokenError(false);
                if (errorMessage) setErrorMessage('');
              }}
              icon={false}
            >
              {errorMessage || t('Oauth can not select board')}
            </Alert>
          )}
          <Select
            name="board"
            id="board"
            className="react-select"
            classNamePrefix="react-select"
            styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
            placeholder="Select board"
            isDisabled={boards.isError}
            menuPortalTarget={document.body}
            onChange={(entry) => {
              if (entry) {
                patch({ id, name, roadmapId, boardId: entry.value })
                  .unwrap()
                  .catch((err) => {
                    setErrorMessage(
                      err.data?.message ?? 'something went wrong',
                    );
                  });
              }
            }}
            defaultValue={
              selected.data && {
                value: selected.data.id,
                label: selected.data.name,
              }
            }
            options={boards.data?.map((board) => ({
              value: board.id,
              label: board.name,
            }))}
          />
        </>
      )}
    </div>
  );
};

const Oauth: FC<{ configuration: IntegrationConfiguration }> = ({
  configuration: { name, roadmapId },
}) => {
  const { t } = useTranslation();
  const dispatch = useDispatch<StoreDispatchType>();

  return (
    <div className={classes(css.layoutRow)}>
      <span className={classes(css.columnHeader)}>
        {titleCase(name)} <Trans i18nKey="authentication" />
        <InfoTooltip title={t(`oauth-${name}-tooltip`)}>
          <InfoIcon className={classes(css.tooltipGray, css.infoIcon)} />
        </InfoTooltip>
        <br />
        <button
          className={classes(css['button-small-filled'])}
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
      </span>
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
  const { configuration, isFetching } = apiV2.useGetRoadmapsQuery(undefined, {
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
    <div>
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
        <div className={classNames(css.configContainer)}>
          {isFetching ? (
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
            </>
          )}
        </div>
      )}
    </div>
  );
};
