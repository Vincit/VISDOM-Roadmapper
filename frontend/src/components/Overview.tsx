import { FC } from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import { IconButton } from '@material-ui/core';
import { MetricsSummary, MetricsProps } from './MetricsSummary';
import { EditableTextWithButtons } from './EditableText';
import { ReactComponent as PreviousArrow } from '../icons/expand_less.svg';
import { ReactComponent as NextArrow } from '../icons/expand_more.svg';
import css from './Overview.module.scss';

const classes = classNames.bind(css);

export enum ArrowType {
  Previous,
  Next,
}

interface PreviousAndNext {
  id: number | undefined;
  type: ArrowType;
}

interface OverviewData {
  label: string;
  keyName: string;
  value: any;
  format?: string;
  editable: boolean;
}

type OverviewProps = {
  backHref: string;
  overviewType: string;
  name: any;
  previousAndNext: PreviousAndNext[];
  onOverviewChange: (id: number) => void;
  metrics: MetricsProps[];
  data: OverviewData[][];
  onDataEditConfirm?: (
    newValue: string,
    fieldId: string,
  ) => Promise<string | void>;
};

/**
 * Renders a <Overview /> component, which can be used in task, client etc. overviews.
 * @param {object} props Component props
 * @param {string} props.backHref Href for the back button's link
 * @param {string} props.overviewType Type of the overview. Appears in the header text
 * @param {any} props.name Name of the overviewed object. Appears in the header
 * @param {PreviousAndNext[]} props.previousAndNext Array of the previous and next
 * overviewable object id's. Is used for rendering buttons for changing the overview
 * page to previous or next overviewable.
 * @param {function} props.onOverviewChange Callback that runs when next or previous
 * button is clicked. Callback should change the overview page according to the id
 * @param {MetricsProps[]} props.metrics Array of metrics data that is used to render
 * MetricsSummary components
 * @param {OverviewData[][]} props.data 2d array consisting of overview data objects.
 * Used to render label-value -type component. The Inner arrays define the displayed
 * columns. 'Format' property adds a css class to the value string/component.
 * 'Editable' true value indicates the data value can be changed. In this case, the
 * 'keyName' needs to be the edited value's key.
 * @param {function} props.onDataEditConfirm If prop.data consist of editable values, this
 * function needs to be provided. It should patch the overviewable object with the
 * updated value and return a void Promise if successful. In case of an error, return a
 * Promise containing an error string.
 */
export const Overview: FC<OverviewProps> = ({
  backHref,
  overviewType,
  name,
  previousAndNext,
  onOverviewChange,
  metrics,
  data,
  onDataEditConfirm,
}) => {
  const { t } = useTranslation();

  return (
    <div className={classes(css.section)}>
      <div className={classes(css.header)}>
        <Link to={backHref}>
          <ArrowBackIcon className={classes(css.arrowIcon)} />
        </Link>
        <span>{t('Overview header', { overviewType })}</span>
        <div className={classes(css.name)}>{name}</div>
        <div className={classes(css.buttons)}>
          {previousAndNext.map(({ id, type }) => (
            <IconButton
              key={type}
              className={classes({ [css.disabled]: !id })}
              disabled={!id}
              onClick={() => onOverviewChange(id!)}
            >
              {type === ArrowType.Previous ? <PreviousArrow /> : <NextArrow />}
            </IconButton>
          ))}
        </div>
      </div>
      <div className={classes(css.content)}>
        <div className={classes(css.metrics)}>
          {metrics.map(({ label, value, children }) => (
            <MetricsSummary key={label} label={label} value={value}>
              {children}
            </MetricsSummary>
          ))}
        </div>
        <div className={classes(css.data)}>
          {data.map((column, idx) => (
            // eslint-disable-next-line react/no-array-index-key
            <div className={classes(css.column)} key={idx}>
              {column.map(({ label, keyName, value, format, editable }) => (
                <div className={classes(css.row)} key={label}>
                  <div className={classes(css.label)}>{label}</div>
                  {editable ? (
                    <EditableTextWithButtons
                      onOk={onDataEditConfirm!}
                      value={value}
                      fieldId={keyName}
                      format={format}
                    />
                  ) : (
                    <>
                      <div className={classes(css.value)}>{value}</div>
                    </>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
