import { SyntheticEvent } from 'react';
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
import { sortKeyNumeric } from '../utils/SortUtils';
import { idRoadmapSelector } from '../redux/roadmaps/selectors';
import { StoreDispatchType } from '../redux';
import { ModalTypes } from './modals/types';
import { modalsActions } from '../redux/modals';

const classes = classNames.bind(css);

export const UserInfoCard = ({ userInfo }: { userInfo: UserInfo }) => {
  const editEmail = (newValue: string, fieldId: string) =>
    new Promise<string>((resolve) => {
      resolve(newValue + fieldId);
    });

  const dispatch = useDispatch<StoreDispatchType>();

  const ProjectRow: TableRow<RoadmapRole> = ({ item: roadmapRole, style }) => {
    const { roadmapId, type } = roadmapRole;
    const roadmap = useSelector(idRoadmapSelector(roadmapId));
    return (
      <div className={classes(css.virtualizedTableRow)} style={style}>
        <td className="styledTd roleIcon">
          <div className={classes(css.memberIcon)}>
            {type === RoleType.Admin && <StarSharpIcon />}
            {type === RoleType.Developer && <BuildSharpIcon />}
            {type === RoleType.Business && <BusinessIcon />}
          </div>
        </td>
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
    getSort: (t: any) => sortKeyNumeric(t),
    Row: ProjectRow as TableRow<unknown>,
    header: [{ label: 'Role', width: 5 }, { label: '' }, { label: 'Project' }],
  });

  const openModal = (modalType: ModalTypes.CHANGE_PASSWORD_MODAL) => (
    e: SyntheticEvent,
  ) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(
      modalsActions.showModal({
        modalType,
        modalProps: {},
      }),
    );
  };

  return (
    <div className={classes(css.card)}>
      <div className={classes(css.spacer)} />
      <div>
        <h2>Account</h2>
      </div>
      <div className={classes(css.spacer)} />
      <div className={classes(css.layoutRow)}>
        <div className={classes(css.textContainer)}>
          <EditableTextWithButtons
            onOk={editEmail}
            value={userInfo.email}
            fieldId="name"
            format=""
          />
          {!userInfo.emailVerified ? (
            <p className={classes(css.unVerifiedText)}>(unverified)</p>
          ) : null}
        </div>
        <button className="button-small-outlined" type="button">
          Resend verification email
        </button>
        <button
          className="button-small-filled"
          type="button"
          onClick={openModal(ModalTypes.CHANGE_PASSWORD_MODAL)}
        >
          Change password
        </button>
      </div>
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
        <button className={classes(css.deleteButton)} type="button">
          Remove account
        </button>
      </div>
    </div>
  );
};
