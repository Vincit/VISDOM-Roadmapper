import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import classNames from 'classnames';
import { Trans } from 'react-i18next';
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

const classes = classNames.bind(css);

export const UserInfoCard = ({ userInfo }: { userInfo: UserInfo }) => {
  const dispatch = useDispatch<StoreDispatchType>();
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  const ProjectRow: TableRow<RoadmapRole> = ({ item: roadmapRole, style }) => {
    const { roadmapId, type } = roadmapRole;
    const roadmap = useSelector(idRoadmapSelector(roadmapId));
    return (
      <div className={classes(css.virtualizedTableRow)} style={style}>
        <div className="styledTd roleIcon">
          <div className={classes(css.memberIcon)}>
            {type === RoleType.Admin && <StarSharpIcon />}
            {type === RoleType.Developer && <BuildSharpIcon />}
            {type === RoleType.Business && <BusinessIcon />}
          </div>
        </div>
        <div>{RoleType[type]}</div>
        <div>{roadmap?.name}</div>
      </div>
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
    header: [{ label: 'Role', width: 5 }, { label: '' }, { label: 'Project' }],
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
    <div className={classes(css.card)}>
      <div className={classes(css.spacer)} />
      <div>
        <h2>Account</h2>
      </div>
      <div className={classes(css.spacer)} />
      <p className={classes(css.subtitle)}>Email</p>
      <div className={classes(css.layoutRow)}>
        <div className={classes(css.textContainer)}>
          <EditableTextWithButtons
            onOk={emailOnOk}
            value={userInfo.email}
            fieldId="email"
            format=""
          />
          {!userInfo.emailVerified ? (
            <p className={classes(css.unVerifiedText)}>(unverified)</p>
          ) : null}
        </div>
        {!userInfo.emailVerified && (
          <button
            className="button-small-outlined"
            type="button"
            onClick={resendOnClick}
            disabled={sent || sending}
          >
            Resend verification email
          </button>
        )}
      </div>
      <div className={classes(css.spacer)} />
      <p className={classes(css.subtitle)}>Password</p>
      <EditableTextWithButtons
        onOk={passwordOnOk}
        value="********"
        fieldId="password"
        format=""
      />
      <div className={classes(css.spacer)} />
      <div className={classes(css.spacer)} />
      <ProjectTable items={userInfo.roles} />
      <div className={classes(css.spacer)} />
      <div className={classes(css.spacer)} />
      <div>
        <h2>Remove account</h2>
      </div>
      <div className={classes(css.spacer)} />
      <div className={classes(css.layoutRow)}>
        <div>
          <p>
            If you no longer need your account, you can remove your account.
          </p>
          <p>
            Note: Don&rsquo;t remove your account if you just want to change
            your email address.
          </p>
        </div>
        <button
          className={classes(css.deleteButton)}
          type="button"
          onClick={removeOnClick}
        >
          Remove account
        </button>
      </div>
    </div>
  );
};
