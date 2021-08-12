import { FC } from 'react';
import { Trans } from 'react-i18next';
import classNames from 'classnames';
import { RadioButton } from '../../forms/RadioButton';
import { RoleType } from '../../../../../shared/types/customTypes';
import css from './TeamMemberModalParts.module.scss';

const classes = classNames.bind(css);

export const SelectMemberRole: FC<{
  role: string;
  onChange: (role: string) => void;
}> = ({ role, onChange }) => (
  <>
    <label htmlFor="role">
      <Trans i18nKey="Member role" />
    </label>
    <div id="role" className={classes(css.roleSection)}>
      <RadioButton
        label={RoleType[RoleType.Developer]}
        value={RoleType[RoleType.Developer]}
        checked={role === RoleType[RoleType.Developer]}
        onChange={(value: string) => onChange(value)}
      />
      <RadioButton
        label={RoleType[RoleType.Business]}
        value={RoleType[RoleType.Business]}
        checked={role === RoleType[RoleType.Business]}
        onChange={(value: string) => onChange(value)}
      />
      <RadioButton
        label={RoleType[RoleType.Admin]}
        value={RoleType[RoleType.Admin]}
        checked={role === RoleType[RoleType.Admin]}
        onChange={(value: string) => onChange(value)}
      />
      {role === RoleType[RoleType.Admin] && (
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
