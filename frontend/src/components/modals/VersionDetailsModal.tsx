import { Trans, useTranslation } from 'react-i18next';
import classNames from 'classnames';
import { useSelector, shallowEqual } from 'react-redux';
import ListIcon from '@mui/icons-material/List';
import { DoneAll } from '@mui/icons-material';
import { ModalTypes, Modal } from './types';
import { ModalContent } from './modalparts/ModalContent';
import { ModalHeader } from './modalparts/ModalHeader';
import { userRoleSelector } from '../../redux/user/selectors';
import { BusinessIcon, WorkRoundIcon } from '../RoleIcons';
import { MetricsSummary } from '../MetricsSummary';
import { TaskTable } from '../TaskTable';
import { TaskValueCreatedVisualization } from '../TaskValueCreatedVisualization';
import { isCompletedMilestone } from '../../utils/TaskUtils';
import { percent } from '../../utils/string';
import { Permission } from '../../../../shared/types/customTypes';
import { hasPermission } from '../../../../shared/utils/permission';
import colors from '../../colors.module.scss';
import css from './VersionDetailsModal.module.scss';

const classes = classNames.bind(css);

const numFormat = new Intl.NumberFormat(undefined, {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

export const VersionDetailsModal: Modal<ModalTypes.VERSION_DETAILS_MODAL> = ({
  version,
  closeModal,
}) => {
  const { t } = useTranslation();
  const {
    name,
    tasks,
    complexity,
    totalValue,
    weightedTotalValue,
    avgValue,
    avgTotalValue,
    avgComplexity,
  } = version;
  const type = useSelector(userRoleSelector, shallowEqual);
  const hasReadCustomerValuesPermission = hasPermission(
    type,
    Permission.RoadmapReadCustomerValues,
  );
  const visualizationHeight = 160;
  const completed = isCompletedMilestone(version);

  return (
    <div>
      <ModalHeader closeModal={closeModal}>
        <h3 className={classes(css.header, { [css.completed]: completed })}>
          {completed && <DoneAll />}
          {name}
        </h3>
      </ModalHeader>
      <ModalContent>
        <div className={classes(css.content)}>
          <div className={classes(css.metrics)}>
            {tasks.length === 0 ? (
              <MetricsSummary label={t('Add tasks to see ratings')} />
            ) : (
              <>
                <MetricsSummary
                  label={t(
                    `${
                      hasReadCustomerValuesPermission ? 'weighted ' : ''
                    }total value`,
                  )}
                  value={
                    hasReadCustomerValuesPermission
                      ? weightedTotalValue
                      : totalValue
                  }
                >
                  <BusinessIcon color={colors.black100} />
                </MetricsSummary>
                <MetricsSummary
                  label={t('Total complexity')}
                  value={complexity}
                >
                  <WorkRoundIcon color={colors.black100} />
                </MetricsSummary>
              </>
            )}
          </div>
          <div className={classes(css.averages)}>
            <div>
              <Trans i18nKey="Average value" />
              <div className={classes(css.value)}>
                {avgValue ? numFormat.format(avgValue) : '-'}
              </div>
            </div>
            <div>
              <Trans i18nKey="Average complexity" />
              <div className={classes(css.value)}>
                {avgComplexity ? numFormat.format(avgComplexity) : '-'}
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
                {avgTotalValue ? numFormat.format(avgTotalValue) : '-'}
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
      </ModalContent>
    </div>
  );
};
