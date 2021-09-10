import { FC } from 'react';
import { Trans } from 'react-i18next';
import classNames from 'classnames';
import StarSharpIcon from '@material-ui/icons/StarSharp';
import BuildSharpIcon from '@material-ui/icons/BuildSharp';
import { BusinessIcon } from '../../RoleIcons';
import { RadioButton } from '../../forms/RadioButton';
import { RoleType } from '../../../../../shared/types/customTypes';
import css from './TeamMemberModalParts.module.scss';

const classes = classNames.bind(css);

export const SelectMemberRole: FC<{
  role: RoleType;
  onChange: (role: RoleType) => void;
  disableRoleIcons?: true;
}> = ({ role, onChange, disableRoleIcons }) => (
  <>
    <label htmlFor="role">
      <Trans i18nKey="Member role" />
    </label>
    <div id="role" className={classes(css.roleSection)}>
      {[RoleType.Developer, RoleType.Business, RoleType.Admin].map((type) => (
        <div
          key={type}
          className={classes(css.role, { [css.checked]: role === type })}
        >
          <RadioButton
            label={RoleType[type]}
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
          <b>
            <Trans i18nKey="Admin caution" />
          </b>{' '}
          <Trans i18nKey="Admin caution description" />
        </div>
      )}
    </div>
  </>
);

export const AddTeamMemberInfo: FC<{
  open: boolean;
  onChange: (open: boolean) => void;
}> = ({ open, onChange }) => (
  <div className={classes(css.instructions)}>
    {open && (
      <>
        <b>
          <Trans i18nKey="Here’s how to add a team member" />
        </b>{' '}
        <Trans i18nKey="Team member addition instructions" />{' '}
      </>
    )}
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
