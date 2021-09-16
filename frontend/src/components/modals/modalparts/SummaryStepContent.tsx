import { FC } from 'react';
import { Trans } from 'react-i18next';
import classNames from 'classnames';
import { titleCase } from '../../../utils/string';
import { Dot } from '../../Dot';
import css from './SummaryStepContent.module.scss';

const classes = classNames.bind(css);

export const SummaryStepContent: FC<{
  formValues: Record<string, any>;
  description: string;
}> = ({ formValues, description, children }) => (
  <div className={classes(css.summaryStep)}>
    <Trans i18nKey={description} />
    <div className={classes(css.modalSummary)}>
      {Object.entries(formValues).map(([key, value]) => (
        <div key={key} className={classes(css.item)}>
          <b>
            <Trans i18nKey={titleCase(key)} />:
          </b>
          <div>{key === 'color' ? <Dot fill={value} /> : value}</div>
        </div>
      ))}
      {children}
    </div>
  </div>
);
