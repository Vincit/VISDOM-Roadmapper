import { FC, useState, useRef, MouseEvent } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import classNames from 'classnames';
import StarSharpIcon from '@material-ui/icons/StarSharp';
import BuildSharpIcon from '@material-ui/icons/BuildSharp';
import { Alert } from 'react-bootstrap';
import { BusinessIcon } from '../../RoleIcons';
import { RadioButton } from '../../forms/RadioButton';
import { Input } from '../../forms/FormField';
import { RoleType } from '../../../../../shared/types/customTypes';
import { DeleteButton, EditButton } from '../../forms/SvgButton';
import { ControlledTooltip } from '../../ControlledTooltip';
import { InviteRoadmapUser } from '../../../redux/roadmaps/types';
import css from './TeamMemberModalParts.module.scss';

const classes = classNames.bind(css);

export const SelectMemberRole: FC<{
  role: RoleType;
  onChange: (role: RoleType) => void;
  disableRoleIcons?: true;
}> = ({ role, onChange, disableRoleIcons }) => {
  const { t } = useTranslation();
  return (
    <>
      <label htmlFor="role">
        <Trans i18nKey="Member role" />
      </label>
      <div id="role" className={classes(css.roleSelection)}>
        {[RoleType.Developer, RoleType.Business, RoleType.Admin].map((type) => (
          <div
            key={type}
            className={classes(css.role, { [css.checked]: role === type })}
          >
            <RadioButton
              label={t(RoleType[type])}
              value={RoleType[type]}
              checked={role === type}
              onChange={() => onChange(type)}
            />
            {!disableRoleIcons && (
              <div className={classes(css.memberIcon)}>
                {type === RoleType.Admin && <StarSharpIcon fontSize="small" />}
                {type === RoleType.Developer && (
                  <BuildSharpIcon fontSize="small" />
                )}
                {type === RoleType.Business && <BusinessIcon size="small" />}
              </div>
            )}
          </div>
        ))}
        {role === RoleType.Admin && (
          <div className={classes(css.warning)}>
            <Trans i18nKey="Admin caution" />
          </div>
        )}
      </div>
    </>
  );
};

export const AddTeamMemberInfo: FC<{
  open: boolean;
  onChange: (open: boolean) => void;
}> = ({ open, onChange }) => (
  <div className={classes(css.instructions)}>
    {open && <Trans i18nKey="Here’s how to add a team member" />}{' '}
    <button
      className={classes(css.linkButton, css.blue)}
      tabIndex={0}
      type="button"
      onClick={() => onChange(!open)}
    >
      <Trans i18nKey={open ? 'Hide info' : 'Show info'} />
    </button>
  </div>
);

export const DisplayInvitedMember: FC<{
  member: InviteRoadmapUser;
  readonly?: true;
  onEdit?: (member: InviteRoadmapUser) => void;
  onDelete?: (member: InviteRoadmapUser) => void;
}> = ({ member, readonly, onEdit, onDelete }) => (
  <div className={classes(css.displayMember)}>
    <div className={classes(css.leftSideDiv)}>
      <div className={classes(css.memberIcon)}>
        {member.type === RoleType.Admin && <StarSharpIcon />}
        {member.type === RoleType.Developer && (
          <BuildSharpIcon fontSize="small" />
        )}
        {member.type === RoleType.Business && <BusinessIcon size="small" />}
      </div>
      <div className={classes(css.email)}>{member.email}</div>
    </div>
    {!readonly && onEdit && onDelete && (
      <div className={classes(css.rightSideDiv)}>
        <EditButton fontSize="medium" onClick={() => onEdit(member)} />
        <DeleteButton onClick={() => onDelete(member)} />
      </div>
    )}
  </div>
);

export const AddOrModifyMember: FC<{
  initialMember?: InviteRoadmapUser;
  error: boolean;
  onSubmit: (member: InviteRoadmapUser) => void;
  onCancel: () => void;
  onCloseError: () => void;
}> = ({ initialMember, error, onSubmit, onCancel, onCloseError }) => {
  const { t } = useTranslation();
  const [member, setMember] = useState(
    initialMember || { email: '', type: RoleType.Developer },
  );
  const [validForm, setValidForm] = useState(!!initialMember);

  return (
    <div className={classes(css.addOrEditMember)}>
      <div>
        <SelectMemberRole
          role={member.type}
          onChange={(type) => setMember({ ...member, type })}
        />
      </div>
      <Input
        label={t('Member email the link will be sent to')}
        placeholder={t('Example email', { localPart: 'teammember' })}
        name="send link"
        type="email"
        value={member.email}
        onChange={(e) => {
          setMember({ ...member, email: e.currentTarget.value });
          if (validForm) e.currentTarget.checkValidity();
          setValidForm(
            e.currentTarget.validity.valid && !!e.currentTarget.value,
          );
        }}
      />
      <Alert
        show={error}
        variant="danger"
        dismissible
        onClose={() => onCloseError()}
      >
        <Trans i18nKey="The email should be unique" />
      </Alert>
      <div className={classes(css.buttons)}>
        <button
          className="button-small-filled"
          type="button"
          disabled={!validForm}
          onClick={() => onSubmit(member)}
        >
          {initialMember ? (
            <Trans i18nKey="Edit member" />
          ) : (
            <Trans i18nKey="Add member" />
          )}
        </button>
        <button
          className="button-small-outlined"
          type="button"
          onClick={() => onCancel()}
        >
          <Trans i18nKey="Cancel" />
        </button>
      </div>
    </div>
  );
};

export const SkipMemberAddition: FC<{
  extraStep: Boolean;
  onSkip: () => void;
}> = ({ extraStep, onSkip }) => {
  const [openTooltip, setOpenTooltip] = useState(false);
  // tooltip button's submitEvent won't bubble to the correct handler
  const submitButton = useRef<HTMLButtonElement>(null);

  const handleSkip = (e: MouseEvent) => {
    if (!extraStep || openTooltip) {
      onSkip();
      return;
    }
    e.preventDefault();
    e.stopPropagation();
    setOpenTooltip(true);
  };

  return (
    <div className={classes(css.skip)}>
      <Trans i18nKey="Skip adding members 1/3" />{' '}
      <ControlledTooltip
        content={
          <div className={classes(css.skipTooltip)}>
            <Trans i18nKey="Skip warning">
              Created list will be lost if you skip.
              <button
                type="button"
                onClick={() => submitButton.current?.click()}
              >
                Skip anyway
              </button>
            </Trans>
          </div>
        }
        open={openTooltip}
        onClose={() => setOpenTooltip(false)}
      >
        <button type="submit" onClick={handleSkip} ref={submitButton}>
          <Trans i18nKey="Skip adding members 2/3" />
        </button>
      </ControlledTooltip>{' '}
      <Trans i18nKey="Skip adding members 3/3" />
    </div>
  );
};
