import { FC } from 'react';

const textAreaStyle = {
  width: '500px',
  height: '150px',
  margin: '0 auto',
  border: '1px solid #6a6a6a',
  borderRadius: 0,
};

export const HtmlBox: FC<{ data: string; title: string; baseUrl: string }> = ({
  data,
  title,
  baseUrl,
}) => {
  const htmlText = `<!DOCTYPE html><html lang="en"><head><title>${title}</title></head><body>${data}</body></html>`;
  // eslint-disable-next-line no-template-curly-in-string
  const backEndtext = htmlText.replaceAll(baseUrl, '${baseUrl}');
  return (
    <div>
      <div>
        <h6>HTML for testing</h6>
        <span
          role="button"
          tabIndex={0}
          onClick={() => {
            navigator.clipboard.writeText(htmlText);
          }}
          onKeyDown={() => {
            navigator.clipboard.writeText(htmlText);
          }}
          style={{ color: '#289c6b' }}
        >
          Click here
        </span>{' '}
        to copy it to the clipboard
      </div>
      <textarea style={textAreaStyle}>{htmlText}</textarea>
      <hr />
      <div>
        <h6>HTML for backend</h6>
        <span
          role="button"
          tabIndex={0}
          onClick={() => {
            navigator.clipboard.writeText(backEndtext);
          }}
          onKeyDown={() => {
            navigator.clipboard.writeText(backEndtext);
          }}
          style={{ color: '#289c6b' }}
        >
          Click here
        </span>{' '}
        to copy it to the clipboard
      </div>
      <textarea style={textAreaStyle}>{backEndtext}</textarea>
      <hr />
      <h6>Preview of the email</h6>
      <p>
        <i>
          Note: the html might look different in the emails. Using test html
          editors is suggested.
        </i>
      </p>
      <hr />
    </div>
  );
};
