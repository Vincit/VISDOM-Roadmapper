import { useEffect, useState, useRef } from 'react';
import { shallowEqual, useSelector } from 'react-redux';
import { skipToken } from '@reduxjs/toolkit/query/react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import ListIcon from '@mui/icons-material/List';
import Drawer from '@mui/material/Drawer';
import InfoIcon from '@mui/icons-material/InfoOutlined';
import {
  totalValuesAndComplexity,
  isCompletedMilestone,
} from '../utils/TaskUtils';
import { percent } from '../utils/string';
import { TaskValueCreatedVisualization } from '../components/TaskValueCreatedVisualization';
import { InfoTooltip } from '../components/InfoTooltip';
import css from './RoadmapGraphPage.module.scss';
import { BusinessIcon, WorkRoundIcon } from '../components/RoleIcons';
import { BlockGraph, BlockView } from '../components/BlockGraph';
import { RoadmapGraphSidebar } from '../components/RoadmapGraphSidebar';
import { chosenRoadmapIdSelector } from '../redux/roadmaps/selectors';
import { VersionComplexityAndValues } from '../redux/roadmaps/types';
import colors from '../colors.module.scss';
import { apiV2 } from '../api/api';
import { Permission } from '../../../shared/types/customTypes';
import { hasPermission } from '../../../shared/utils/permission';
import { userRoleSelector } from '../redux/user/selectors';

const classes = classNames.bind(css);

export const RoadmapGraphPage = () => {
  const { t } = useTranslation();
  const [selectedVersion, setSelectedVersion] = useState(-1);
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
      roadmapsVersions?.map((version) => ({
        ...version,
        ...totalValuesAndComplexity(version.tasks, customers),
      })),
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
  const sideBarOpen = selectedVersion >= 0;
  const clearSelection = () => setSelectedVersion(-1);

  return (
    <div className={classes(css.plannerContainer)}>
      <div
        className={classes(css.plannerPagecontainer)}
        onClick={clearSelection}
        onKeyPress={clearSelection}
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
            </div>
          }
          xLabel="Total complexity"
          yLabel="Total value"
          selected={selectedVersion}
          setSelected={setSelectedVersion}
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
                    color={completed ? colors.forest : colors.azure}
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
                    color={completed ? colors.forest : colors.azure}
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
                  [css.selected]: index === selectedVersion,
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
        open={sideBarOpen}
        onClose={clearSelection}
        BackdropProps={{ invisible: true }}
        className={classes(css.drawer)}
      >
        {sideBarOpen && (
          <RoadmapGraphSidebar
            version={versions![selectedVersion]}
            onClose={clearSelection}
          />
        )}
      </Drawer>
    </div>
  );
};
