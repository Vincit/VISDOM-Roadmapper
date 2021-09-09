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
        <div className={classes(css.role, { [css.checked]: role === type })}>
          <RadioButton
            key={type}
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
