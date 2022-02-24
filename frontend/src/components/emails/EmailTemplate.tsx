import { FC } from 'react';
import ReactDOMServer from 'react-dom/server';
import { PageToHtml } from './PageToHtml';
import { colorForest } from './emailStyles';
import { baseUrl } from './emailTestEnv';

const container = {
  backgroundColor: '#f5f5f5',
  textAlign: 'center' as 'center',
};

const visdomLogo = {
  height: '32px',
  width: 'auto',
};

const formDiv = {
  margin: '20px auto',
  width: '500px',
  backgroundColor: 'white',
  borderRadius: '20px',
  padding: '40px 30px',
};

const header = {
  textAlign: 'center' as 'center',
  color: colorForest,
};

const content = {
  padding: '35px',
  textAlign: 'center' as 'center',
};

const footer = {
  margin: '0 auto',
  paddingBottom: '10px',
  textAlign: 'center' as 'center',
  fontSize: '14px',
};

export const emailPage = (title: string, page: any) => () => {
  const html = ReactDOMServer.renderToStaticMarkup(page());
  return (
    <div>
      {html && (
        <PageToHtml data={html.toString()} title={title} baseUrl={baseUrl} />
      )}
      {page()}
    </div>
  );
};

export const EmailTemplate: FC<{ title: string }> = ({ title, children }) => (
  <div style={container}>
    <img
      style={{ ...visdomLogo, marginTop: '20px' }}
      src={`${baseUrl}/visdomlogo.png`}
      alt="visdomlogo"
    />
    <div style={formDiv}>
      <div style={header}>
        <h2> {title} </h2>
      </div>
      <hr />
      <div style={content}>{children}</div>
    </div>
    <div style={footer}>
      <img
        style={{ ...visdomLogo, marginBottom: '8px' }}
        src={`${baseUrl}/visdomlogo.png`}
        alt="visdomlogo"
      />
      <div>
        <b>Contact the team</b>
      </div>
      <div style={{ marginBottom: '20px' }}>visdom@vincit.fi</div>
    </div>
  </div>
);
