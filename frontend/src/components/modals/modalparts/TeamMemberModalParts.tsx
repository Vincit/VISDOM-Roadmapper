import { FC } from 'react';
import { Trans } from 'react-i18next';
import classNames from 'classnames';
import { RadioButton } from '../../forms/RadioButton';
import { RoleType } from '../../../../../shared/types/customTypes';
import css from './TeamMemberModalParts.module.scss';

const classes = classNames.bind(css);

export const SelectMemberRole: FC<{
  role: RoleType;
  onChange: (role: RoleType) => void;
}> = ({ role, onChange }) => (
  <>
    <label htmlFor="role">
      <Trans i18nKey="Member role" />
    </label>
    <div id="role" className={classes(css.roleSection)}>
      {[RoleType.Developer, RoleType.Business, RoleType.Admin].map((type) => (
        <RadioButton
          key={type}
          label={RoleType[type]}
          value={RoleType[type]}
          checked={role === type}
          onChange={() => onChange(type)}
        />
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
