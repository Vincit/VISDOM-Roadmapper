import { forwardRef } from 'react';
import classNames from 'classnames';
import { shallowEqual, useSelector } from 'react-redux';
import { Trans, useTranslation } from 'react-i18next';
import ListIcon from '@mui/icons-material/List';
import DoneAll from '@mui/icons-material/DoneAll';
import { userRoleSelector } from '../redux/user/selectors';
import { ModalCloseButton } from './forms/SvgButton';
import { VersionComplexityAndValues } from '../redux/roadmaps/types';
import { BusinessIcon, WorkRoundIcon } from './RoleIcons';
import { MetricsSummary } from './MetricsSummary';
import { TaskTable } from './TaskTable';
import { TaskValueCreatedVisualization } from './TaskValueCreatedVisualization';
import {
  averageValueAndComplexity,
  isCompletedMilestone,
} from '../utils/TaskUtils';
import { percent } from '../utils/string';
import { Permission } from '../../../shared/types/customTypes';
import { hasPermission } from '../../../shared/utils/permission';
import colors from '../colors.module.scss';
import css from './RoadmapGraphSidebar.module.scss';

const classes = classNames.bind(css);

const numFormat = new Intl.NumberFormat(undefined, {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

export const RoadmapGraphSidebar = forwardRef<
  HTMLDivElement,
  {
    version: VersionComplexityAndValues;
    onClose: () => void;
  }
>(({ version, onClose, ...props }, ref) => {
  const { t } = useTranslation();
  const {
    name,
    tasks,
    complexity,
    value,
    unweightedValue,
    totalValue,
    unweightedTotalValue,
  } = version;
  const type = useSelector(userRoleSelector, shallowEqual);
  const hasReadCustomerValuesPermission = hasPermission(
    type,
    Permission.RoadmapReadCustomerValues,
  );
  const averageRatings = averageValueAndComplexity(tasks);
  const visualizationHeight = 160;
  const displayedValue = hasReadCustomerValuesPermission
    ? value
    : unweightedValue;
  const completed = isCompletedMilestone(version);

  return (
    <div className={classes(css.versionWrapper)} ref={ref} {...props}>
      <div className={classes(css.header, { [css.completed]: completed })}>
        {completed && <DoneAll />} {name}
        <div className={classes(css.close)}>
          <ModalCloseButton onClick={onClose} />
        </div>
      </div>
      <div className={classes(css.metrics)}>
        {tasks.length === 0 ? (
          <MetricsSummary label={t('Add tasks to see ratings')} />
        ) : (
          <>
            <MetricsSummary
              label={t(
                hasReadCustomerValuesPermission ? 'Weighted value' : 'Value',
              )}
              value={
                hasReadCustomerValuesPermission
                  ? totalValue
                  : unweightedTotalValue
              }
            >
              <BusinessIcon color={colors.black100} />
            </MetricsSummary>
            <MetricsSummary label={t('Complexity')} value={complexity}>
              <WorkRoundIcon color={colors.black100} />
            </MetricsSummary>
          </>
        )}
      </div>
      <div className={classes(css.averages)}>
        <div>
          <Trans i18nKey="Average value" />
          <div className={classes(css.value)}>
            {averageRatings.value
              ? numFormat.format(averageRatings.value)
              : '-'}
          </div>
        </div>
        <div>
          <Trans i18nKey="Average complexity" />
          <div className={classes(css.value)}>
            {averageRatings.complexity
              ? numFormat.format(averageRatings.complexity)
              : '-'}
          </div>
        </div>
      </div>
      <hr />
      <TaskTable tasks={tasks} />
      <hr />
      <div className={classes(css.summary)}>
        <ListIcon fontSize="small" />
        {tasks.length}
        <div className={classes(css.rightSide)}>
          <div>
            <BusinessIcon size="xxsmall" color={colors.azure} />
            {displayedValue ? numFormat.format(displayedValue) : '-'}
          </div>
          <div>
            <WorkRoundIcon size="xxsmall" color={colors.azure} />
            {complexity ? numFormat.format(complexity) : '-'}
          </div>
        </div>
      </div>
      <hr />
      <div className={classes(css.shares)}>
        <div
          className={classes(css.lines)}
          style={{ ['--bar-height' as any]: `${visualizationHeight}px` }}
        >
          {[1, 0.75, 0.5, 0.25, 0].map((p) => (
            <div key={p}>
              <span>{percent(0).format(p)}</span>
              <hr />
            </div>
          ))}
        </div>
        <div className={classes(css.visualization)}>
          <TaskValueCreatedVisualization
            width={37}
            height={visualizationHeight}
            versions={[version]}
            key={version.id}
            noTooltip
            vertical
          />
        </div>
      </div>
    </div>
  );
});
