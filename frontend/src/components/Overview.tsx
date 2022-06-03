import { FC, ReactElement } from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { IconButton } from '@mui/material';
import { MetricsSummary, MetricsProps } from './MetricsSummary';
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
  value: any;
  format?: string;
  EditComponent?: ReactElement;
}

interface OverviewContentProps {
  vertical?: boolean;
  metrics?: MetricsProps[];
  data: OverviewData[][];
}

interface OverviewProps extends OverviewContentProps {
  backHref: string;
  overviewType: string;
  name: any;
  previousAndNext: PreviousAndNext[];
  onOverviewChange: (id: number) => void;
}

/**
 * Renders a <OverviewContent /> component displaying metrics and overviewable data.
 * */
export const OverviewContent: FC<OverviewContentProps> = ({
  metrics,
  data,
  vertical,
}) => (
  <div className={classes(css.content, { [css.vertical]: vertical })}>
    {metrics && (
      <div className={classes(css.metrics)}>
        {metrics.map(({ label, value, children }) => (
          <MetricsSummary key={label} label={label} value={value}>
            {children}
          </MetricsSummary>
        ))}
      </div>
    )}
    <div className={classes(css.data)}>
      {data.map((column, idx) => (
        <div
          className={classes(
            css.column,
            `${idx + 1 === data.length && css.lastColumn}`,
          )}
          // eslint-disable-next-line react/no-array-index-key
          key={idx}
        >
          {column.map(({ label, value, format, EditComponent }) => (
            <div className={classes(css.row)} key={label}>
              <div className={classes(css.label)}>{label}</div>
              {EditComponent ? (
                <div className={classes(css.editableContainer)}>
                  {EditComponent}
                </div>
              ) : (
                <div className={classes(css.value, css[format!])}>{value}</div>
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  </div>
);

/**
 * Renders a <Overview /> component, which can be used in task, client etc. overviews.
 * @param props Component props
 * @param props.backHref Href for the back button's link
 * @param props.overviewType Type of the overview. Appears in the header text
 * @param props.name Name of the overviewed object. Appears in the header
 * @param props.previousAndNext Array of the previous and next
 * overviewable object id's. Is used for rendering buttons for changing the overview
 * page to previous or next overviewable.
 * @param props.onOverviewChange Callback that runs when next or previous
 * button is clicked. Callback should change the overview page according to the id
 * @param props.metrics Array of metrics data that is used to render
 * MetricsSummary components
 * @param props.data 2d array consisting of overview data objects.
 * Used to render label-value -type component. The Inner arrays define the displayed
 * columns. 'Format' property adds a css class to the value string/component.
 * If the value is editable, define 'EditComponent' as a property.
 */
export const Overview: FC<OverviewProps> = ({
  backHref,
  overviewType,
  name,
  previousAndNext,
  onOverviewChange,
  metrics,
  data,
  vertical,
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
              size="large"
            >
              {type === ArrowType.Previous ? <PreviousArrow /> : <NextArrow />}
            </IconButton>
          ))}
        </div>
      </div>
      <OverviewContent metrics={metrics} data={data} vertical={vertical} />
    </div>
  );
};
