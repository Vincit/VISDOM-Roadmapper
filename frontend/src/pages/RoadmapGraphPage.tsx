import { useEffect, useState, useRef } from 'react';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';

import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import ListIcon from '@material-ui/icons/List';
import InfoIcon from '@material-ui/icons/InfoOutlined';
import { StoreDispatchType } from '../redux';
import { RootState } from '../redux/types';
import { totalWeightedValueAndWork } from '../utils/TaskUtils';
import { TaskValueCreatedVisualization } from '../components/TaskValueCreatedVisualization';
import { InfoTooltip } from '../components/InfoTooltip';
import css from './RoadmapGraphPage.module.scss';
import { BusinessIcon, WorkRoundIcon } from '../components/RoleIcons';
import { BlockGraph, BlockView } from '../components/BlockGraph';
import {
  chosenRoadmapSelector,
  roadmapsVersionsSelector,
} from '../redux/roadmaps/selectors';
import { Roadmap, Version } from '../redux/roadmaps/types';
import { roadmapsActions } from '../redux/roadmaps';
import colors from '../colors.module.scss';

const classes = classNames.bind(css);

interface VersionWorkAndValues extends Version {
  work: number;
  value: number;
  totalValue: number;
}

export const RoadmapGraphPage = () => {
  const dispatch = useDispatch<StoreDispatchType>();
  const { t } = useTranslation();
  const roadmapsVersions = useSelector<RootState, Version[] | undefined>(
    roadmapsVersionsSelector(),
    shallowEqual,
  );
  const [selectedVersion, setSelectedVersion] = useState(-1);
  const [versions, setVersions] = useState<undefined | VersionWorkAndValues[]>(
    undefined,
  );
  const currentRoadmap = useSelector<RootState, Roadmap | undefined>(
    chosenRoadmapSelector,
    shallowEqual,
  );

  // TODO: scrolling selected into view from BlockGraph doesn't work with this
  const a = useRef<HTMLDivElement>(null);
  const b = useRef<HTMLDivElement>(null);
  const refs = useRef([a, b]);
  const scrolling = useRef(0);

  useEffect(() => {
    const handleScroll = (e: any) => {
      if (scrolling.current) {
        scrolling.current = 0;
        return;
      }

      scrolling.current = 1;
      const other = e.target === a.current ? b : a;

      window.requestAnimationFrame(() =>
        other.current?.scroll({ left: e.target.scrollLeft }),
      );
    };

    const elements = [a.current, b.current];
    elements.forEach((el) => el?.addEventListener('scroll', handleScroll));
    return () =>
      elements.forEach((el) => el?.removeEventListener('scroll', handleScroll));
  }, [refs, scrolling]);

  useEffect(() => {
    if (!currentRoadmap) dispatch(roadmapsActions.getRoadmaps());
  }, [dispatch, currentRoadmap]);

  useEffect(() => {
    if (currentRoadmap)
      setVersions(
        roadmapsVersions?.map((version) => ({
          ...version,
          ...totalWeightedValueAndWork(version.tasks, currentRoadmap),
        })),
      );
  }, [currentRoadmap, roadmapsVersions]);

  useEffect(() => {
    if (selectedVersion < 0 && roadmapsVersions?.length) setSelectedVersion(0);
  }, [roadmapsVersions, selectedVersion]);

  const numFormat = new Intl.NumberFormat(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  });

  const dimensions = ({ work, value }: VersionWorkAndValues) => ({
    width: work,
    height: value,
  });

  const limits = {
    minWidth: 100,
    maxWidth: 300,
    minHeight: 100,
    maxHeight: 300,
  };

  return (
    <div className={classes(css.plannerPagecontainer)}>
      <BlockGraph
        title={
          <div className={classes(css.titleContainer)}>
            <h2 className={classes(css.graphTitle)}>{t('workValueTitle')}</h2>
            <InfoTooltip title={t('tooltipMessage')}>
              <InfoIcon className={classes(css.tooltipIcon, css.infoIcon)} />
            </InfoTooltip>
          </div>
        }
        xLabel="Total work"
        yLabel="Total value"
        selected={selectedVersion}
        setSelected={setSelectedVersion}
        items={versions ?? []}
        id={(ver) => ver.id}
        dimensions={dimensions}
        limits={limits}
        innerRef={a}
      >
        {({ item: { name, value, work, tasks }, index }) => (
          <>
            <div className={classes(css.versionData)}>
              <div className={classes(css.ratingDiv)}>
                <BusinessIcon size="xxsmall" color={colors.azure} />
                <p>{numFormat.format(value)}</p>
              </div>
              <div className={classes(css.ratingDiv)}>
                <WorkRoundIcon size="xxsmall" color={colors.azure} />
                <p>{numFormat.format(work)}</p>
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
          <InfoTooltip title={t('tooltipMessage')}>
            <InfoIcon className={classes(css.tooltipIcon, css.infoIcon)} />
          </InfoTooltip>
        </div>
        <div className={classes(css.stakesContainer)}>
          <BlockView
            items={versions ?? []}
            dimensions={dimensions}
            limits={limits}
            innerRef={b}
          >
            {({ item: ver, width }) => (
              <TaskValueCreatedVisualization
                width={width}
                version={ver}
                key={ver.id}
              />
            )}
          </BlockView>
        </div>
      </div>
    </div>
  );
};
