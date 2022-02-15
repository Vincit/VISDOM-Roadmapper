/* eslint-disable no-template-curly-in-string */
import ReactDOMServer from 'react-dom/server';
import { EmailTemplate } from './EmailTemplate';
import { HtmlBox } from './HtmlBox';
import {
  textStyle,
  buttonStyle,
  linkStyle,
  iconStyle,
  colorForest,
} from './emailStyles';
import { baseUrl } from './emailTestEnv';

const title = 'Remember to rate your task';
const message = '${message}';
const senderEmail = '${senderEmail}';
const taskUrl = '${taskUrl}';
const taskName = '${taskName}';

export const NotificationEmail = () => {
  const page = () => (
    <EmailTemplate title="Hi there,">
      <div>
        <img
          style={iconStyle}
          src={`${baseUrl}/bellicon.png`}
          alt="lock-icon"
        />
      </div>
      <h2>{title}</h2>
      <div style={textStyle}>
        <div style={{ marginBottom: '20px' }}>
          <div style={{ margin: '20px' }}>
            <div>You’ve received a task rating request to</div>
            <div>
              <b>{taskName}</b>
            </div>
            <div>from {senderEmail} as it’s waiting for your rating.</div>
          </div>
          <p
            style={{ color: colorForest, fontSize: '16px', margin: '10px 0px' }}
          >
            <i>{message}</i>
          </p>
        </div>
        <hr />
        <p style={{ margin: '20px 0px' }}>
          No worries! To help your teammates, please click the button below to
          give your ratings.
        </p>
        <a href={taskUrl} style={linkStyle}>
          <div style={buttonStyle}>Rate your task</div>
        </a>
        <div style={{ marginBottom: '-40px', marginTop: '20px' }}>
          <p>Or copy the link below to your browser:</p>
          <p>{taskUrl}</p>
        </div>
      </div>
    </EmailTemplate>
  );
  const html = ReactDOMServer.renderToStaticMarkup(page());
  return (
    <div>
      {html && (
        <HtmlBox data={html.toString()} title={title} baseUrl={baseUrl} />
      )}
      {page()}
    </div>
  );
};
