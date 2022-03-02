/* eslint-disable no-template-curly-in-string */
import { FC, useState } from 'react';
import classNames from 'classnames';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import css from './PageToHtml.module.scss';

const classes = classNames.bind(css);

export const PageToHtml: FC<{
  data: string;
  title: string;
  baseUrl: string;
}> = ({ data, title, baseUrl }) => {
  const [showTest, setShowTest] = useState(false);
  const [showBackend, setShowBackend] = useState(false);

  const htmlText = `<!DOCTYPE html><html lang="en"><head><title>${title}</title></head><body>${data}</body></html>`;
  const backEndtext = htmlText.replaceAll(baseUrl, '${baseUrl}');

  return (
    <div className={classes(css.mainContainer)}>
      <div className={classes(css.flexContainer)}>
        <div className={classes(css.flexItem)}>
          <div>
            <button
              type="button"
              className={classes(css.iconButton)}
              onClick={() => setShowTest(!showTest)}
            >
              <h6>
                HTML for testing{' '}
                {showTest ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </h6>
            </button>
          </div>
          {showTest && (
            <textarea className={classes(css.htmlArea)}>{htmlText}</textarea>
          )}
          <span
            role="button"
            tabIndex={0}
            onClick={() => {
              navigator.clipboard.writeText(htmlText);
            }}
            onKeyDown={() => {
              navigator.clipboard.writeText(htmlText);
            }}
            className={classes(css.linkButton)}
          >
            Click here
          </span>{' '}
          to copy it to the clipboard
        </div>
        <div className={classes(css.flexItem)}>
          <div>
            <button
              type="button"
              className={classes(css.iconButton)}
              onClick={() => setShowBackend(!showBackend)}
            >
              <h6>
                HTML for backend{' '}
                {showBackend ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </h6>
            </button>
          </div>
          {showBackend && (
            <textarea className={classes(css.htmlArea)}>{backEndtext}</textarea>
          )}
          <span
            role="button"
            tabIndex={0}
            onClick={() => {
              navigator.clipboard.writeText(backEndtext);
            }}
            onKeyDown={() => {
              navigator.clipboard.writeText(backEndtext);
            }}
            className={classes(css.linkButton)}
          >
            Click here
          </span>{' '}
          to copy it to the clipboard
        </div>
      </div>
      <hr />
      <p className={classes(css.note)}>
        <i>
          Note: the html might look different in actual emails. Using some test
          html editor is suggested.
        </i>
      </p>
    </div>
  );
};
