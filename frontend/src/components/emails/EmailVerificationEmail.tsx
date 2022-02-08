import { emailPage, EmailTemplate } from './EmailTemplate';
import { textStyle, buttonStyle, iconStyle } from './emailStyles';
import { baseUrl, token } from './emailTestEnv';

const title = 'Verify your email address';

export const EmailVerificationEmail = emailPage(title, () => (
  <EmailTemplate title="Thank you for joining Roadmapper!">
    <div>
      <img style={iconStyle} src={`${baseUrl}/mailIcon.png`} alt="lock-icon" />
    </div>
    <h2 style={{ marginTop: '15px' }}>{title}</h2>
    <div style={textStyle}>
      <p>
        To complete your account creation in Visdom,{' '}
        <b>please verify your email address</b> by clicking the button below.
      </p>
      <a
        href={`${baseUrl}/verifyEmail/${token}`}
        style={{ textDecoration: 'none' }}
      >
        <div style={buttonStyle}>Verify my email</div>
      </a>
      <div>
        <p>Or copy the link below to your browser:</p>
        <p>
          {baseUrl}/verify/{token}
        </p>
      </div>
    </div>
    <div style={{ ...textStyle, marginTop: '40px', marginBottom: '-40px' }}>
      <i>Didn’t create an account? You can ignore this message.</i>
    </div>
  </EmailTemplate>
));
