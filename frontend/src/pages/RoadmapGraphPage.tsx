import { useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { skipToken } from '@reduxjs/toolkit/query/react';

import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import ListIcon from '@mui/icons-material/List';
import InfoIcon from '@mui/icons-material/InfoOutlined';
import { totalValuesAndComplexity } from '../utils/TaskUtils';
import { TaskValueCreatedVisualization } from '../components/TaskValueCreatedVisualization';
import { InfoTooltip } from '../components/InfoTooltip';
import css from './RoadmapGraphPage.module.scss';
import { BusinessIcon, WorkRoundIcon } from '../components/RoleIcons';
import { BlockGraph, BlockView } from '../components/BlockGraph';
import { chosenRoadmapIdSelector } from '../redux/roadmaps/selectors';
import { Version } from '../redux/roadmaps/types';
import colors from '../colors.module.scss';
import { apiV2 } from '../api/api';

const classes = classNames.bind(css);

interface VersionComplexityAndValues extends Version {
  complexity: number;
  value: number;
  totalValue: number;
  unweightedValue: number;
  unweightedTotalValue: number;
}

export const RoadmapGraphPage = () => {
  const { t } = useTranslation();
  const [selectedVersion, setSelectedVersion] = useState(-1);
  const [versions, setVersions] = useState<
    undefined | VersionComplexityAndValues[]
  >(undefined);
  const roadmapId = useSelector(chosenRoadmapIdSelector);
  const { data: roadmapsVersions } = apiV2.useGetVersionsQuery(
    roadmapId ?? skipToken,
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

  useEffect(() => {
    if (selectedVersion < 0 && roadmapsVersions?.length) setSelectedVersion(0);
  }, [roadmapsVersions, selectedVersion]);

  const numFormat = new Intl.NumberFormat(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  });

  const dimensions = ({ complexity, value }: VersionComplexityAndValues) => ({
    width: complexity,
    height: value,
  });

  const limits = {
    minWidth: 100,
    maxWidth: 300,
    minHeight: 100,
    maxHeight: 300,
  };

  const height = 160;

  return (
    <div className={classes(css.plannerPagecontainer)}>
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
        items={versions ?? []}
        id={(ver) => ver.id}
        dimensions={dimensions}
        limits={limits}
        innerRef={(e) => {
          a.current = e;
        }}
      >
        {({ item: { name, value, complexity, tasks }, index }) => (
          <>
            <div className={classes(css.versionData)}>
              <div className={classes(css.ratingDiv)}>
                <BusinessIcon size="xxsmall" color={colors.azure} />
                <p>{numFormat.format(value)}</p>
              </div>
              <div className={classes(css.ratingDiv)}>
                <WorkRoundIcon size="xxsmall" color={colors.azure} />
                <p>{numFormat.format(complexity)}</p>
              </div>
              <div className={classes(css.dash)} />
              <div className={classes(css.ratingDiv)}>
                <ListIcon />
                <p>{tasks.length}</p>
              </div>
            </div>
            <p
              className={classes(css.versionTitle, {
                [css.selected]: index === selectedVersion,
              })}
            >
              {name}
            </p>
          </>
        )}
      </BlockGraph>
      <div className={classes(css.footer)}>
        <div
          className={classes(css.titleContainer, css.lowerGraphTitleContainer)}
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
            {[100, 75, 50, 25, 0].map((p) => (
              <div key={p}>
                <span>{`${p}%`}</span>
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
                version={{
                  ...ver,
                  totalValue: ver.unweightedTotalValue,
                }}
                key={ver.id}
              />
            )}
          </BlockView>
        </div>
      </div>
    </div>
  );
};
