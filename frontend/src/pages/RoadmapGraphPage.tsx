import { useEffect, useState, useRef } from 'react';
import { shallowEqual, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { skipToken } from '@reduxjs/toolkit/query/react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import ListIcon from '@mui/icons-material/List';
import Drawer from '@mui/material/Drawer';
import InfoIcon from '@mui/icons-material/InfoOutlined';
import {
  milestoneRatingSummary,
  isCompletedMilestone,
} from '../utils/TaskUtils';
import { percent } from '../utils/string';
import { TaskValueCreatedVisualization } from '../components/TaskValueCreatedVisualization';
import { VersionDetailsModal } from '../components/modals/VersionDetailsModal';
import { InfoTooltip } from '../components/InfoTooltip';
import css from './RoadmapGraphPage.module.scss';
import { BusinessIcon, WorkRoundIcon } from '../components/RoleIcons';
import { BlockGraph, BlockView } from '../components/BlockGraph';
import { MilestonesAmountSummary } from '../components/MilestonesAmountSummary';
import {
  useModal,
  ModalTypes,
  modalDrawerLink,
} from '../components/modals/types';
import { chosenRoadmapIdSelector } from '../redux/roadmaps/selectors';
import { VersionComplexityAndValues } from '../redux/roadmaps/types';
import colors from '../colors.module.scss';
import { apiV2 } from '../api/api';
import { Permission } from '../../../shared/types/customTypes';
import { hasPermission } from '../../../shared/utils/permission';
import { userRoleSelector } from '../redux/user/selectors';

const classes = classNames.bind(css);

export const RoadmapGraphPage = () => {
  const drawer = useModal('openDrawer', ModalTypes.VERSION_DETAILS_MODAL);
  const selectedIndex = drawer.payload?.modalProps.version?.sortingRank ?? -1;
  const { t } = useTranslation();
  const history = useHistory();
  const [versions, setVersions] = useState<
    undefined | VersionComplexityAndValues[]
  >(undefined);
  const roadmapId = useSelector(chosenRoadmapIdSelector);
  const type = useSelector(userRoleSelector, shallowEqual);
  const hasReadCustomerValuesPermission = hasPermission(
    type,
    Permission.RoadmapReadCustomerValues,
  );
  const { data: roadmapsVersions } = apiV2.useGetVersionsQuery(
    roadmapId ?? skipToken,
    {
      skip: !hasPermission(type, Permission.VersionRead),
    },
  );
  const { data: customers } = apiV2.useGetCustomersQuery(
    roadmapId ?? skipToken,
  );

  const a = useRef<HTMLDivElement | null>(null);
  const b = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ac = a.current;
    const bc = b.current;
    if (!ac || !bc) return;

    const handleScroll = () => {
      window.requestAnimationFrame(() => bc.scroll({ left: ac.scrollLeft }));
    };
    ac.addEventListener('scroll', handleScroll);
    return () => ac.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setVersions(
      roadmapsVersions?.map((version) => {
        const summary = milestoneRatingSummary(version.tasks);
        const weighted = summary.weighted(customers);
        return {
          ...version,
          value: weighted.value('avg').total,
          totalValue: weighted.value('total').total,
          unweightedValue: summary.value('avg').total,
          unweightedTotalValue: summary.value('total').total,
          complexity: summary.complexity().total,
        };
      }),
    );
  }, [customers, roadmapsVersions]);

  const numFormat = new Intl.NumberFormat(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  });

  const dimensions = ({
    complexity,
    value,
    unweightedValue,
  }: VersionComplexityAndValues) => ({
    width: complexity,
    height: hasReadCustomerValuesPermission ? value : unweightedValue,
  });

  const limits = {
    minWidth: 100,
    maxWidth: 300,
    minHeight: 100,
    maxHeight: 300,
  };

  const height = 160;

  return (
    <div className={classes(css.plannerContainer)}>
      <div
        className={classes(css.plannerPagecontainer)}
        onClick={() => drawer.close()}
        onKeyPress={() => drawer.close()}
        role="button"
        tabIndex={0}
      >
        <BlockGraph
          title={
            <div className={classes(css.titleContainer)}>
              <h2 className={classes(css.graphTitle)}>
                {t('complexityValueTitle')}
              </h2>
              <InfoTooltip title={t('Planner complexityValue tooltip')}>
                <InfoIcon className={classes(css.tooltipIcon, css.infoIcon)} />
              </InfoTooltip>
              <div className={classes(css.amountSummary)}>
                <MilestonesAmountSummary versions={versions || []} />
              </div>
            </div>
          }
          xLabel="Total complexity"
          yLabel="Total value"
          selected={selectedIndex}
          setSelected={(idx) =>
            history.replace(
              modalDrawerLink(ModalTypes.VERSION_DETAILS_MODAL, {
                version: versions![idx],
              }),
            )
          }
          items={
            versions?.map((version) => ({
              ...version,
              completed: isCompletedMilestone(version),
            })) ?? []
          }
          completed={({ completed }) => completed}
          id={(ver) => ver.id}
          dimensions={dimensions}
          limits={limits}
          innerRef={(e) => {
            a.current = e;
          }}
        >
          {({
            item: {
              name,
              value,
              unweightedValue,
              complexity,
              tasks,
              completed,
            },
            index,
          }) => (
            <>
              <div className={classes(css.versionData)}>
                <div className={classes(css.ratingDiv)}>
                  <BusinessIcon
                    size="xxsmall"
                    color={completed ? colors.emerald : colors.azure}
                  />
                  <p>
                    {numFormat.format(
                      hasReadCustomerValuesPermission ? value : unweightedValue,
                    )}
                  </p>
                </div>
                <div className={classes(css.ratingDiv)}>
                  <WorkRoundIcon
                    size="xxsmall"
                    color={completed ? colors.emerald : colors.azure}
                  />
                  <p>{numFormat.format(complexity)}</p>
                </div>
                <div className={classes(css.dash)} />
                <div
                  className={classes(css.ratingDiv, {
                    [css.completed]: completed,
                  })}
                >
                  <ListIcon />
                  <p>{tasks.length}</p>
                </div>
              </div>
              <p
                className={classes(css.versionTitle, {
                  [css.selected]: index === selectedIndex,
                  [css.completed]: completed,
                })}
              >
                {name}
              </p>
            </>
          )}
        </BlockGraph>
        <div className={classes(css.footer)}>
          <div
            className={classes(
              css.titleContainer,
              css.lowerGraphTitleContainer,
            )}
          >
            <h2 className={classes(css.graphTitle)}>
              {t('customerStakesTitle')}
            </h2>
            <InfoTooltip title={t('Planner customerStakes tooltip')}>
              <InfoIcon className={classes(css.tooltipIcon, css.infoIcon)} />
            </InfoTooltip>
          </div>
          <div className={classes(css.stakesContainer)}>
            <div
              className={classes(css.lines)}
              style={{ ['--bar-height' as any]: `${height}px` }}
            >
              {[1, 0.75, 0.5, 0.25, 0].map((p) => (
                <div key={p}>
                  <span>{percent(0).format(p)}</span>
                  <hr />
                </div>
              ))}
            </div>
            <BlockView
              items={versions ?? []}
              dimensions={dimensions}
              limits={limits}
              innerRef={b}
              style={{ overflowX: 'hidden' }}
            >
              {({ item: ver, width }) => (
                <TaskValueCreatedVisualization
                  width={width}
                  height={height}
                  versions={[ver]}
                  key={ver.id}
                  vertical
                />
              )}
            </BlockView>
          </div>
        </div>
      </div>
      <Drawer
        anchor="right"
        variant="persistent"
        open={!!drawer.payload}
        BackdropProps={{ invisible: true }}
        className={classes(css.drawer)}
      >
        {drawer.payload && (
          <div style={{ marginTop: 20 }}>
            <VersionDetailsModal
              closeModal={drawer.close}
              {...drawer.payload.modalProps}
            />
          </div>
        )}
      </Drawer>
    </div>
  );
};
