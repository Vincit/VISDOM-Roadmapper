import { FC, ReactNode, CSSProperties, useState, useEffect } from 'react';
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
}> = ({ expanded, onToggle, title, children, className, style }) => {
  // delay showing children, to avoid breaking possible measuring divs
  const [showChildren, setShowChildren] = useState(expanded);

  useEffect(() => {
    if (!expanded) {
      setShowChildren(false);
    } else {
      const t = setTimeout(() => setShowChildren(true), 300);
      return () => clearTimeout(t);
    }
  }, [expanded]);

  return (
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
        {showChildren && (
          <div className={classes(css.expandableContent)}>{children}</div>
        )}
      </div>
    </div>
  );
};
