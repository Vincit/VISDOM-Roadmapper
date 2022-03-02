import { SyntheticEvent, useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import classNames from 'classnames';
import { Trans, useTranslation } from 'react-i18next';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { RoleIcon } from './RoleIcons';
import { RoadmapRole, UserInfo } from '../redux/user/types';
import { RoleType } from '../../../shared/types/customTypes';
import css from './UserInfoCard.module.scss';
import { EditableTextWithButtons } from './EditableText';
import { table, TableRow } from './Table';
import { StoreDispatchType } from '../redux';
import { ModalTypes } from './modals/types';
import { modalsActions } from '../redux/modals';
import { api, apiV2, selectById } from '../api/api';
import { paths } from '../routers/paths';
import { ExitButton } from './forms/SvgButton';

const classes = classNames.bind(css);

const ProjectRow: TableRow<RoadmapRole> = ({ item: roadmapRole, style }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { roadmapId, type } = roadmapRole;
  const { data: roadmap } = apiV2.useGetRoadmapsQuery(
    undefined,
    selectById(roadmapId),
  );

  const leaveProject = useCallback(
    (event: SyntheticEvent) => {
      event.preventDefault();
      dispatch(
        modalsActions.showModal({
          modalType: ModalTypes.LEAVE_ROADMAP_MODAL,
          modalProps: {
            roadmapId,
          },
        }),
      );
    },
    [roadmapId, dispatch],
  );

  return (
    <Link
      className={classes(css.navBarLink, css.hoverRow)}
      to={`${paths.roadmapHome}/${roadmapId}${paths.roadmapRelative.dashboard}`}
    >
      <div className={classes(css.virtualizedTableRow)} style={style}>
        <div className={classes(css.roleColumn)}>
          <RoleIcon type={type} />
          <div>{t(RoleType[type])}</div>
        </div>
        <div>{roadmap?.name}</div>
        <div className={classes(css.textAlignEnd)}>
          <ExitButton onClick={leaveProject} />
          <ArrowForwardIcon className={classes(css.arrowIcon)} />
        </div>
      </div>
    </Link>
  );
};

export const UserInfoCard = ({ userInfo }: { userInfo: UserInfo }) => {
  const dispatch = useDispatch<StoreDispatchType>();
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  const ProjectTable = table({
    Title: () => (
      <h2>
        <Trans i18nKey="Projects" />
      </h2>
    ),
    getSort: () => undefined,
    Row: ProjectRow,
    header: [
      { label: 'Role' },
      { label: 'Project' },
      { label: '', width: 0.5 },
    ],
  });

  const emailOnOk = async (newValue: string) => {
    dispatch(
      modalsActions.showModal({
        modalType: ModalTypes.CONFIRM_PASSWORD_MODAL,
        modalProps: {
          actionData: { id: userInfo.id, email: newValue },
        },
      }),
    );
  };
  const passwordOnOk = async (newValue: string) => {
    dispatch(
      modalsActions.showModal({
        modalType: ModalTypes.CONFIRM_PASSWORD_MODAL,
        modalProps: {
          actionData: { id: userInfo.id, password: newValue },
        },
      }),
    );
  };
  const removeOnClick = () => {
    dispatch(
      modalsActions.showModal({
        modalType: ModalTypes.CONFIRM_PASSWORD_MODAL,
        modalProps: { actionData: { id: userInfo.id }, deleteUser: true },
      }),
    );
  };
  const resendOnClick = async () => {
    setSending(true);
    setSent(await api.sendEmailVerificationLink(userInfo));
    setSending(false);
  };

  return (
    <div className={classes(css.content)}>
      <div className={classes(css.section)}>
        <h2>Account</h2>
        <div>
          <p className={classes(css.subtitle)}>
            <Trans i18nKey="Email" />
          </p>
          <div className={classes(css.layoutRow)}>
            <div className={classes(css.textContainer)}>
              <EditableTextWithButtons
                onOk={emailOnOk}
                value={userInfo.email}
                fieldId="email"
                format=""
              />
              {!userInfo.emailVerified && (
                <p className={classes(css.unVerifiedText)}>(unverified)</p>
              )}
            </div>
            {!userInfo.emailVerified && (
              <button
                className="button-small-outlined"
                type="button"
                onClick={resendOnClick}
                disabled={sent || sending}
              >
                <Trans i18nKey="Resend verification email" />
              </button>
            )}
          </div>
        </div>
        <div>
          <p className={classes(css.subtitle)}>
            <Trans i18nKey="Password" />
          </p>
          <EditableTextWithButtons
            onOk={passwordOnOk}
            value="********"
            fieldId="password"
            format=""
          />
        </div>
      </div>
      <ProjectTable items={userInfo.roles} />
      <div className={classes(css.section)}>
        <h2>
          <Trans i18nKey="Remove account" />
        </h2>
        <div className={classes(css.layoutRow)}>
          <div>
            <p>
              <Trans i18nKey="you can remove your account 1/2" />
            </p>
            <p>
              <Trans i18nKey="you can remove your account 2/2" />
            </p>
          </div>
          <button
            className={classes(css.deleteButton)}
            type="button"
            onClick={removeOnClick}
          >
            <Trans i18nKey="Remove account" />
          </button>
        </div>
      </div>
    </div>
  );
};
