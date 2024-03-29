import { emailPage, EmailTemplate } from './EmailTemplate';
import { textStyle, buttonStyle, linkStyle, iconStyle } from './emailStyles';
import { baseUrl, token } from './emailTestEnv';

const title = 'Forgot password?';
const link = `${baseUrl}/resetPassword/${token}`;

export const ResetPasswordEmail = emailPage(title, () => (
  <EmailTemplate title="Hi!">
    <div>
      <img style={iconStyle} src={`${baseUrl}/openlock.png`} alt="lock-icon" />
    </div>
    <h2>{title}</h2>
    <div style={textStyle}>
      <p>
        No worries, we’ll help you out. <b>To reset your password, </b>
        click the button below.
      </p>
      <a href={link} style={linkStyle}>
        <div style={buttonStyle}>Reset password</div>
      </a>
      <div>
        <p>Or copy the link below to your browser:</p>
        <p>{link}</p>
      </div>
    </div>
    <div style={{ ...textStyle, marginTop: '40px', marginBottom: '-40px' }}>
      <i>Didn’t order the password reset link? You can ignore this message.</i>
    </div>
  </EmailTemplate>
));
