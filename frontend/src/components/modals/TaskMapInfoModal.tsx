import { useState } from 'react';
import { Trans } from 'react-i18next';
import classNames from 'classnames';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import InfoIcon from '@mui/icons-material/InfoOutlined';
import { Modal, ModalTypes } from './types';
import { Info } from './modalparts/Info';
import { ModalContent } from './modalparts/ModalContent';
import { ModalHeader } from './modalparts/ModalHeader';
import {
  actionColumns,
  actionIcons,
  overviewColumns,
  overviewIcons,
} from './TaskMapInfoModalColumns';
import css from './TaskMapInfoModal.module.scss';

const classes = classNames.bind(css);

export const TaskMapInfoModal: Modal<ModalTypes.TASK_MAP_INFO_MODAL> = ({
  closeModal,
}) => {
  const [openInfo, setOpenInfo] = useState(true);
  const [showOverview, setShowOverview] = useState(false);
  const [showActions, setShowActions] = useState(false);

  return (
    <div className={classes(css.container)}>
      <ModalHeader closeModal={closeModal}>
        <h3 className={classes(css.mainHeader)}>
          <InfoIcon className={classes(css.infoIcon)} />
          <Trans i18nKey="How to use the task map" />
        </h3>
      </ModalHeader>
      <ModalContent>
        <Info
          className={classes(css.infoBox)}
          open={openInfo}
          onChange={setOpenInfo}
        >
          <Trans i18nKey="Task map info" />
        </Info>

        {/* Overview */}
        <div
          className={classes(css.pointerCursor, css.disableSelect)}
          onClick={() => setShowOverview(!showOverview)}
          onKeyPress={() => setShowOverview(!showOverview)}
          role="button"
          tabIndex={0}
        >
          <h4>
            <Trans i18nKey="Overview" />
            {!showOverview ? <ExpandMoreIcon /> : <ExpandLessIcon />}
          </h4>
          {showOverview && (
            <div>
              {overviewColumns.map((overview) => (
                <div>
                  <div className={classes(css.columnTitle)}>
                    {overview.Title}
                  </div>
                  {overview.Columns.map((column) => (
                    <div className={classes(css.columns)}>
                      <div className={classes(css.overviewSubtitle)}>
                        {column.Subtitle}
                      </div>
                      <div className={classes(css.overviewDescription)}>
                        {column.Description}
                      </div>
                    </div>
                  ))}
                </div>
              ))}

              {overviewIcons.map((overview) => (
                <div>
                  <div className={classes(css.columnTitle)}>
                    {overview.Title}
                  </div>
                  {overview.Columns.map((column) => (
                    <div className={classes(css.columns)}>
                      <div className={classes(css.overviewIcon)}>
                        {column.Icon}
                      </div>
                      <div className={classes(css.overviewIconSubtitle)}>
                        {column.Subtitle}
                      </div>
                      <div className={classes(css.overviewIconDescription)}>
                        {column.Description}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
          <hr className={classes(css.fullWidth)} />
        </div>

        {/* Actions */}
        <div
          className={classes(css.pointerCursor, css.disableSelect)}
          onClick={() => setShowActions(!showActions)}
          onKeyPress={() => setShowActions(!showActions)}
          role="button"
          tabIndex={0}
        >
          <h4>
            <Trans i18nKey="Actions" />
            {!showActions ? <ExpandMoreIcon /> : <ExpandLessIcon />}
          </h4>
          {showActions && (
            <div>
              <div>
                <Trans i18nKey="Task map actions description" />
              </div>
              <div className={classes(css.actionIcons)}>
                {actionIcons.map((column) => (
                  <div className={classes(css.actionIconsItem)}>
                    {column.Icon} {column.Action}
                  </div>
                ))}
              </div>

              {actionColumns.map((overview) => (
                <div>
                  <div className={classes(css.columnTitle)}>
                    {overview.Title}
                  </div>
                  {overview.Columns.map((column) => (
                    <div className={classes(css.columns)}>
                      <div className={classes(css.actionSubtitle)}>
                        {column.Subtitle}
                      </div>
                      <div className={classes(css.actionDescription)}>
                        <span className={classes(css.actionHighlight)}>
                          {column.Action}{' '}
                        </span>
                        {column.Description}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
          <hr className={classes(css.fullWidth)} />
        </div>
      </ModalContent>
      <button
        type="button"
        className={classes(css['button-large'], css.modalButton)}
        onClick={() => closeModal()}
      >
        <Trans i18nKey="Got it" />
      </button>
    </div>
  );
};
