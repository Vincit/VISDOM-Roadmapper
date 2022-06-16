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
          className={classes(css.overview)}
          onClick={() => setShowOverview(!showOverview)}
          onKeyPress={() => setShowOverview(!showOverview)}
          role="button"
          tabIndex={0}
        >
          <h4>
            <Trans i18nKey="Overview" />
            {!showOverview ? <ExpandMoreIcon /> : <ExpandLessIcon />}
          </h4>
          {showOverview &&
            overviewColumns.map(({ Title, columns }) => (
              <>
                <div className={classes(css.columnTitle)}>
                  <Title />
                </div>
                {columns.map(({ Subtitle, Icon, Description }) => (
                  <div
                    className={classes(css.overviewColumn, {
                      [css.icon]: Icon,
                    })}
                  >
                    {Icon && (
                      <div className={classes(css.icon)}>
                        <Icon />
                      </div>
                    )}
                    <div className={classes(css.subtitle)}>
                      <Subtitle />
                    </div>
                    <div className={classes(css.description)}>
                      <Description />
                    </div>
                  </div>
                ))}
              </>
            ))}
          <hr className={classes(css.fullWidth)} />
        </div>
        {/* Actions */}
        <div
          className={classes(css.overview)}
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
            <>
              <Trans i18nKey="Task map actions description" />
              <div className={classes(css.actionIcons)}>
                {actionIcons.map(({ Icon, Action }) => (
                  <div className={classes(css.item)}>
                    <Icon /> <Action />
                  </div>
                ))}
              </div>
              {actionColumns.map(({ Title, columns }) => (
                <>
                  <div className={classes(css.columnTitle)}>
                    <Title />
                  </div>
                  {columns.map(({ Subtitle, Action, Description }) => (
                    <div className={classes(css.actionColumn)}>
                      <div className={classes(css.subtitle)}>
                        <Subtitle />
                      </div>
                      <div className={classes(css.description)}>
                        <span className={classes(css.highlight)}>
                          <Action />{' '}
                        </span>
                        <Description />
                      </div>
                    </div>
                  ))}
                </>
              ))}
            </>
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
