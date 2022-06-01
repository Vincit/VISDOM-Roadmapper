import { useState, FC } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import classNames from 'classnames';
import Alert from '@mui/material/Alert';
import { RoleIcon } from '../../RoleIcons';
import { RadioButton } from '../../forms/RadioButton';
import { Checkbox } from '../../forms/Checkbox';
import {
  CheckableUser,
  InviteRoadmapUser,
  RoadmapCreationCustomer,
} from '../../../redux/roadmaps/types';
import { ColorPicker } from './ColorPicker';
import { Input } from '../../forms/FormField';
import colors from '../../../colors.module.scss';
import { randomColor } from '../../../utils/CustomerUtils';
import { Permission } from '../../../../../shared/types/customTypes';
import { hasPermission } from '../../../../../shared/utils/permission';
import css from './CustomerModalParts.module.scss';

const classes = classNames.bind(css);

export const SelectCustomerInfo: FC<{
  name: string;
  email: string;
  colorType: string;
  color: string;
  onNameChange: (name: string) => void;
  onEmailChange: (email: string, valid: boolean) => void;
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
  const [validEmail, setValidEmail] = useState(false);

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
          placeholder={t('Example email', { localPart: 'clientname' })}
          onChange={(e) => {
            if (validEmail) e.currentTarget.checkValidity();
            const valid =
              e.currentTarget.validity.valid && !!e.currentTarget.value;
            onEmailChange(e.currentTarget.value, valid);
            setValidEmail(valid);
          }}
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
  representatives:
    | CheckableUser[]
    | (InviteRoadmapUser & { checked: boolean })[];
  onRepresentativeChange: (idx: number, checked: boolean) => void;
}> = ({ representatives, onRepresentativeChange }) => (
  <div className={classes(css.section)}>
    <label htmlFor="representatives">
      <Trans i18nKey="Who's responsible for the client value ratings?" />
    </label>
    <div id="representatives" className={classes(css.representatives)}>
      {representatives.map((rep, idx) => (
        <div key={rep.email} className={classes(css.representative)}>
          <Checkbox
            label={rep.email}
            checked={rep.checked}
            onChange={(checked) => onRepresentativeChange(idx, checked)}
          />
          <RoleIcon
            type={rep.type}
            color={rep.checked ? colors.azure : colors.black40}
            small
            tooltip
          />
        </div>
      ))}
    </div>
  </div>
);

export const AddOrModifyCustomer: FC<{
  customers: RoadmapCreationCustomer[];
  members: InviteRoadmapUser[];
  initialCustomer?: RoadmapCreationCustomer;
  error: boolean;
  onSubmit: (customer: RoadmapCreationCustomer) => void;
  onCancel: () => void;
  onCloseError: () => void;
}> = ({
  customers,
  members,
  initialCustomer,
  error,
  onSubmit,
  onCancel,
  onCloseError,
}) => {
  const [colorType, setColorType] = useState(
    initialCustomer ? 'pick' : 'generate',
  );
  const [customer, setCustomer] = useState(
    initialCustomer || {
      name: '',
      email: '',
      color: randomColor(customers),
    },
  );
  const [representatives, setRepresentatives] = useState(
    members
      .filter(({ type }) => hasPermission(type, Permission.CustomerRepresent))
      .map((member) => ({
        ...member,
        checked: !!initialCustomer?.representatives.some(
          ({ email, checked }) => email === member.email && checked,
        ),
      })),
  );
  const [validEmail, setValidEmail] = useState(!!initialCustomer);

  const handleColorTypeChange = (value: string) => {
    setColorType(value);
    if (value === 'generate')
      setCustomer({ ...customer, color: randomColor(customers) });
  };

  return (
    <div className={classes(css.addOrEditMember)}>
      <SelectCustomerInfo
        name={customer.name}
        email={customer.email}
        colorType={colorType}
        color={customer.color}
        onNameChange={(name) => setCustomer({ ...customer, name })}
        onEmailChange={(email, valid) => {
          setCustomer({ ...customer, email });
          setValidEmail(valid);
        }}
        onColorTypeChange={handleColorTypeChange}
        onColorChange={(color) => setCustomer({ ...customer, color })}
      />
      {representatives.length > 0 && (
        <SelectRepresentatives
          representatives={representatives}
          onRepresentativeChange={(idx, checked) => {
            const copy = [...representatives];
            copy[idx].checked = checked;
            setRepresentatives(copy);
          }}
        />
      )}
      {error && (
        <Alert severity="error" onClose={() => onCloseError()} icon={false}>
          <Trans i18nKey="The combination of name and email should be unique" />
        </Alert>
      )}
      <div className={classes(css.buttons)}>
        <button
          className="button-small-filled submitInnerForm"
          type="submit"
          disabled={!customer.name || !validEmail}
          onClick={() => onSubmit({ ...customer, representatives })}
        >
          {initialCustomer ? (
            <Trans i18nKey="Edit customer" />
          ) : (
            <Trans i18nKey="Add client" />
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
