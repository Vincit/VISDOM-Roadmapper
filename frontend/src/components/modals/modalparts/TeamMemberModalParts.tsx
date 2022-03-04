import { FC, useState, useRef, MouseEvent } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import classNames from 'classnames';
import { Alert } from 'react-bootstrap';
import { Checkbox } from '../../forms/Checkbox';
import { RoleIcon } from '../../RoleIcons';
import { RadioButton } from '../../forms/RadioButton';
import { Input } from '../../forms/FormField';
import { RoleType } from '../../../../../shared/types/customTypes';
import { DeleteButton, EditButton } from '../../forms/SvgButton';
import { ControlledTooltip } from '../../ControlledTooltip';
import {
  CheckableCustomer,
  InviteRoadmapUser,
  RoadmapCreationCustomer,
} from '../../../redux/roadmaps/types';
import colors from '../../../colors.module.scss';
import css from './TeamMemberModalParts.module.scss';
import { Dot } from '../../Dot';

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
          <div key={type} className={classes(css.role)}>
            <RadioButton
              label={t(RoleType[type])}
              value={RoleType[type]}
              checked={role === type}
              onChange={() => onChange(type)}
            />
            {!disableRoleIcons && (
              <div className={classes(css.memberIcon)}>
                <RoleIcon
                  type={type}
                  color={role === type ? colors.black100 : colors.black40}
                  small
                />
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

export const SelectCustomers: FC<{
  customers: CheckableCustomer[];
  onCustomerChange: (idx: number, checked: boolean) => void;
}> = ({ customers, onCustomerChange }) => {
  if (!customers.length) return null;
  return (
    <div className={classes(css.customerSelection)}>
      <label htmlFor="customers">
        <Trans i18nKey="Responsible for" />
      </label>
      <div id="customers" className={classes(css.customers)}>
        {customers.map(({ id, name, checked, color }, idx) => (
          <div key={id} className={classes(css.customer)}>
            <Checkbox
              label={name}
              checked={checked}
              onChange={(changed) => onCustomerChange(idx, changed)}
            />
            <Dot fill={color} />
          </div>
        ))}
      </div>
    </div>
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

export const isInviteUser = (
  user: InviteRoadmapUser | RoadmapCreationCustomer,
): user is InviteRoadmapUser => 'type' in user;

export const DisplayInvitedMember: FC<{
  member: InviteRoadmapUser | RoadmapCreationCustomer;
  readonly?: true;
  onEdit?: (member: InviteRoadmapUser | RoadmapCreationCustomer) => void;
  onDelete?: (member: InviteRoadmapUser | RoadmapCreationCustomer) => void;
}> = ({ member, readonly, onEdit, onDelete }) => (
  <div className={classes(css.displayMember)}>
    <div className={classes(css.leftSideDiv)}>
      <div className={classes(css.memberIcon)}>
        {isInviteUser(member) ? (
          <RoleIcon type={member.type} color={colors.forest} small tooltip />
        ) : (
          <Dot fill={member.color} />
        )}
      </div>
      <div className={classes(css.email)}>
        {isInviteUser(member) ? member.email : member.name}
      </div>
    </div>
    {!readonly && onEdit && onDelete && (
      <div className={classes(css.rightSideDiv)}>
        <div className={classes(css.edit)}>
          <EditButton fontSize="medium" onClick={() => onEdit(member)} />
        </div>
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
        required
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
          className="button-small-filled submitInnerForm"
          type="submit"
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

export const SkipPeopleAddition: FC<{
  type: 'clients' | 'members';
  extraStep: boolean;
  onSkip: () => void;
  disabled: boolean;
}> = ({ type, extraStep, onSkip, disabled }) => {
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
      <Trans i18nKey="Skip adding 1/3" values={{ type }} />{' '}
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
        <button
          type="submit"
          disabled={disabled}
          onClick={handleSkip}
          ref={submitButton}
        >
          <Trans i18nKey="Skip adding 2/3" />
        </button>
      </ControlledTooltip>{' '}
      <Trans i18nKey="Skip adding 3/3" />
    </div>
  );
};
