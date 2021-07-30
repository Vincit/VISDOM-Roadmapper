import { FC } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import classNames from 'classnames';
import StarSharpIcon from '@material-ui/icons/StarSharp';
import { BusinessValueFilled } from '../../RatingIcons';
import { RadioButton } from '../../forms/RadioButton';
import { Checkbox } from '../../forms/Checkbox';
import { CheckableUser } from '../../../redux/roadmaps/types';
import { RoleType } from '../../../../../shared/types/customTypes';
import { ColorPicker } from './ColorPicker';
import { Input } from '../../forms/FormField';
import css from './CustomerModalParts.module.scss';

const classes = classNames.bind(css);

export const SelectCustomerInfo: FC<{
  name: string;
  email: string;
  colorType: string;
  color: string;
  onNameChange: (name: string) => void;
  onEmailChange: (email: string) => void;
  onColorTypeChange: (colorType: string) => void;
  onColorChange: (color: string) => void;
}> = ({
  name,
  email,
  colorType,
  color,
  onNameChange,
  onEmailChange,
  onColorTypeChange,
  onColorChange,
}) => {
  const { t } = useTranslation();
  return (
    <>
      <div className={classes(css.section)}>
        <Input
          label={t('Client name')}
          required
          name="name"
          id="name"
          value={name}
          placeholder={t('Give them a name')}
          onChange={(e) => onNameChange(e.currentTarget.value)}
        />
      </div>
      <div className={classes(css.section)}>
        <Input
          label={t('Contact information')}
          required
          name="email"
          id="email"
          type="email"
          value={email}
          placeholder={t('Example email', { localPart: 'customername' })}
          onChange={(e) => onEmailChange(e.currentTarget.value)}
        />
      </div>
      <div className={classes(css.section)}>
        <label htmlFor="color">
          <Trans i18nKey="Client color" />
        </label>
        <div id="color" className={classes(css.colorSection)}>
          <div className={classes(css.colorType)}>
            <RadioButton
              label="Generate"
              value="generate"
              checked={colorType === 'generate'}
              onChange={(value: string) => onColorTypeChange(value)}
            />
            <RadioButton
              label="Pick a color"
              value="pick"
              checked={colorType === 'pick'}
              onChange={(value: string) => onColorTypeChange(value)}
            />
          </div>
          {colorType === 'pick' && (
            <ColorPicker color={color} setColor={onColorChange} />
          )}
        </div>
      </div>
    </>
  );
};

export const SelectRepresentatives: FC<{
  representatives: CheckableUser[];
  onRepresentativeChange: (idx: number, checked: boolean) => void;
}> = ({ representatives, onRepresentativeChange }) => (
  <>
    <div className={classes(css.section)}>
      <label htmlFor="representatives">
        <Trans i18nKey="Who's responsible for the client value ratings?" />
      </label>
      <div id="representatives" className={classes(css.representatives)}>
        {representatives.map((rep, idx) => (
          <div className={classes(css.representative)}>
            <Checkbox
              label={rep.username}
              checked={rep.checked}
              onChange={(checked: boolean) =>
                onRepresentativeChange(idx, checked)
              }
              key={rep.id}
            />
            <div
              className={classes(css.icon, css[RoleType[rep.type]], {
                [css.disabled]: !rep.checked,
              })}
            >
              {rep.type === RoleType.Admin && (
                <StarSharpIcon fontSize="small" />
              )}
              {rep.type === RoleType.Business && <BusinessValueFilled />}
            </div>
          </div>
        ))}
      </div>
    </div>
  </>
);
