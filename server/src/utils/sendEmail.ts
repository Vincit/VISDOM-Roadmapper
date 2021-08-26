import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

// Requires following env. parameters:
// - AWS_REGION (e.g. 'eu-central-1')
// - SENDER_EMAIL (e.g. 'Sender Name <sender@example.com>')
// Access keys, unless provided from other source like aws IAM role:
// - AWS_ACCESS_KEY_ID
// - AWS_SECRET_ACCESS_KEY

const SENDER = process.env.SENDER_EMAIL!;
const REGION = process.env.AWS_SES_REGION!;
const sesClient = new SESClient({ region: REGION });

/**
 * send email
 * @param to recipient email address
 * @param subject of the email
 * @param text the message body in text format
 * @param html the message body in html format
 * @returns result from SES client
 * @throws any errors from SES client
 */
export const sendEmail = async (
  to: string,
  subject: string,
  text: string,
  html?: string,
) => {
  const params = {
    Destination: { ToAddresses: [to] },
    Message: {
      Subject: {
        Charset: 'UTF-8',
        Data: subject,
      },
      Body: {
        Text: {
          Charset: 'UTF-8',
          Data: text,
        },
        ...(html && {
          Html: {
            Charset: 'UTF-8',
            Data: text,
          },
        }),
      },
    },
    Source: SENDER,
    ReplyToAddresses: [],
  };

  try {
    const data = await sesClient.send(new SendEmailCommand(params));
    console.log('Success:', data);
    return data;
  } catch (err) {
    console.log('Error:', err);
    throw err;
  }
};
