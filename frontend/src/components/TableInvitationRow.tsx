import { MouseEvent } from 'react';
import classNames from 'classnames';
import CheckIcon from '@material-ui/icons/Check';
import ClearIcon from '@material-ui/icons/Clear';
import StarSharpIcon from '@material-ui/icons/StarSharp';
import BuildSharpIcon from '@material-ui/icons/BuildSharp';
import { useDispatch } from 'react-redux';
import { StoreDispatchType } from '../redux';
import { DeleteButton, EditButton, MailButton } from './forms/SvgButton';
import { BusinessIcon } from './RoleIcons';
import { Invitation } from '../redux/roadmaps/types';
import { TableRow } from './Table';
import { RoleType } from '../../../shared/types/customTypes';
import { modalsActions } from '../redux/modals';
import { ModalTypes, modalLink } from './modals/types';
import css from './TableInvitationRow.module.scss';

const classes = classNames.bind(css);

export const TableInvitationRow: TableRow<Invitation> = ({
  item: invitation,
  style,
}) => {
  const { id, email, updatedAt, valid, type } = invitation;
  const dispatch = useDispatch<StoreDispatchType>();

  const deleteInvitationClicked = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(
      modalsActions.showModal({
        modalType: ModalTypes.REMOVE_PEOPLE_MODAL,
        modalProps: {
          id,
          name: email,
          type: 'invitation',
        },
      }),
    );
  };

  const editInvitationClicked = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(
      modalsActions.showModal({
        modalType: ModalTypes.EDIT_TEAM_MEMBER_MODAL,
        modalProps: {
          member: invitation,
        },
      }),
    );
  };

  const sendInvitationClicked = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(
      modalsActions.showModal({
        modalType: ModalTypes.SEND_INVITATION_MODAL,
        modalProps: { invitation },
      }),
    );
  };

  return (
    <div className={classes(css.virtualizedTableRow)} style={style}>
      <div className={classes(css.memberIcon)}>
        {type === RoleType.Admin && <StarSharpIcon />}
        {type === RoleType.Developer && <BuildSharpIcon />}
        {type === RoleType.Business && <BusinessIcon />}
      </div>
      <div>
        <a className="green" href={`mailto:${email}`}>
          {email}
        </a>
      </div>
      <div>{new Date(updatedAt).toLocaleDateString()}</div>
      <div className={classes(css.validIcon, { [css.notValid]: !valid })}>
        {valid ? (
          <CheckIcon fontSize="small" />
        ) : (
          <ClearIcon fontSize="small" />
        )}
      </div>
      <div className={classes(css.adminButtons)}>
        <MailButton
          onClick={sendInvitationClicked}
          href={modalLink(ModalTypes.SEND_INVITATION_MODAL, { invitation })}
        />
        <EditButton
          fontSize="medium"
          onClick={editInvitationClicked}
          href={modalLink(ModalTypes.EDIT_TEAM_MEMBER_MODAL, {
            member: invitation,
          })}
        />
        <DeleteButton
          onClick={deleteInvitationClicked}
          href={modalLink(ModalTypes.REMOVE_PEOPLE_MODAL, {
            id,
            name: email,
            type: 'invitation',
          })}
        />
      </div>
    </div>
  );
};
