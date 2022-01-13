import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import classNames from 'classnames';
import { Trans } from 'react-i18next';
import ArrowForwardIcon from '@material-ui/icons/ArrowForward';
import StarSharpIcon from '@material-ui/icons/StarSharp';
import BuildSharpIcon from '@material-ui/icons/BuildSharp';
import { BusinessIcon } from './RoleIcons';
import { RoadmapRole, UserInfo } from '../redux/user/types';
import { RoleType } from '../../../shared/types/customTypes';
import css from './UserInfoCard.module.scss';
import { EditableTextWithButtons } from './EditableText';
import { table, TableRow } from './Table';
import { idRoadmapSelector } from '../redux/roadmaps/selectors';
import { StoreDispatchType } from '../redux';
import { ModalTypes } from './modals/types';
import { modalsActions } from '../redux/modals';
import { api } from '../api/api';
import { paths } from '../routers/paths';

const classes = classNames.bind(css);

export const UserInfoCard = ({ userInfo }: { userInfo: UserInfo }) => {
  const dispatch = useDispatch<StoreDispatchType>();
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  const ProjectRow: TableRow<RoadmapRole> = ({ item: roadmapRole, style }) => {
    const { roadmapId, type } = roadmapRole;
    const roadmap = useSelector(idRoadmapSelector(roadmapId));
    return (
      <Link
        className={classes(css.navBarLink, css.hoverRow)}
        to={`${paths.roadmapHome}/${roadmapId}${paths.roadmapRelative.dashboard}`}
      >
        <div className={classes(css.virtualizedTableRow)} style={style}>
          <div className={classes(css.roleColumn)}>
            <div className={classes(css.memberIcon)}>
              {type === RoleType.Admin && <StarSharpIcon />}
              {type === RoleType.Developer && <BuildSharpIcon />}
              {type === RoleType.Business && <BusinessIcon />}
            </div>
            <div>{RoleType[type]}</div>
          </div>
          <div>{roadmap?.name}</div>
          <div className={classes(css.textAlignEnd)}>
            <ArrowForwardIcon className={classes(css.arrowIcon)} />
          </div>
        </div>
      </Link>
    );
  };

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
