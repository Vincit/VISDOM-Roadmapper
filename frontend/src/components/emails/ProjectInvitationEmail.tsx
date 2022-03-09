/* eslint-disable no-template-curly-in-string */
import { emailPage, EmailTemplate } from './EmailTemplate';
import {
  textStyle,
  buttonStyle,
  iconStyle,
  subtitleStyle,
} from './emailStyles';
import { baseUrl, token } from './emailTestEnv';

const title = 'You’ve been invited to a project';
const projectName = '${projectName}';
const roleType = '${roleType}';
const link = `${baseUrl}/join/${token}`;

export const ProjectInvitationEmail = emailPage(title, () => (
  <EmailTemplate title="Hi there,">
    <div>
      <img
        style={iconStyle}
        src={`${baseUrl}/invitationicon.png`}
        alt="invitation-icon"
      />
    </div>
    <h2 style={{ marginTop: '15px' }}>{title}</h2>
    <div style={textStyle}>
      <p style={subtitleStyle}>
        You have been invited to join project <b>{projectName}</b> as{' '}
        <b>{roleType}</b>.
      </p>
      <hr />
      <p style={{ marginTop: '25px' }}>
        To accept project invitation, log in or register to Visdom by clicking
        the button below.
      </p>
      <a href={link} style={{ textDecoration: 'none' }}>
        <div style={buttonStyle}>Join project</div>
      </a>
      <div>
        <p>Or copy the link below to your browser:</p>
        <p>{link}</p>
      </div>
    </div>
    <div style={{ ...textStyle, marginTop: '40px', marginBottom: '-40px' }}>
      <i>Don’t want to join the project? You can ignore this message.</i>
    </div>
  </EmailTemplate>
));
