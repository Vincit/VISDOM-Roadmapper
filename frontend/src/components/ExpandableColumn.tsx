import { FC, ReactNode, CSSProperties } from 'react';
import classNames from 'classnames';
import { ReactComponent as ExpandLess } from '../icons/expand_less.svg';
import { ReactComponent as ExpandMore } from '../icons/expand_more.svg';
import css from './ExpandableColumn.module.scss';

const classes = classNames.bind(css);

export const ExpandableColumn: FC<{
  expanded: boolean;
  onToggle: () => void;
  title: ReactNode;
  className?: string;
  style?: CSSProperties;
}> = ({ expanded, onToggle, title, children, className, style }) => (
  <div className={className} style={style}>
    <div
      className={classes(css.expandableWrapper, {
        [css.minimized]: !expanded,
      })}
    >
      <div
        className={classes(css.expandableHeader, {
          [css.minimized]: !expanded,
        })}
        onClick={onToggle}
        onKeyPress={onToggle}
        role="button"
        tabIndex={0}
      >
        {expanded ? <ExpandLess /> : <ExpandMore />}
        {title}
      </div>
      <div className={classes(css.expandableContent)}>
        {expanded && children}
      </div>
    </div>
  </div>
);
