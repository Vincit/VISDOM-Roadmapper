import React from 'react';
import { Trans } from 'react-i18next';
import css from './ModalFooter.module.scss';
import { ModalFooterButtonDiv } from './ModalFooterButtonDiv';

export const ModalFooter: React.FC<{ closeModal?: () => void }> = ({
  closeModal,
  children,
}) => (
  <div className={css.container}>
    {closeModal && (
      <ModalFooterButtonDiv>
        <button
          className="button-large cancel"
          onClick={() => closeModal()}
          type="button"
        >
          <Trans i18nKey="Cancel" />
        </button>
      </ModalFooterButtonDiv>
    )}
    {children}
  </div>
);
