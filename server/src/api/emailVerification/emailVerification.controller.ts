import EmailVerification from './emailVerification.model';
import uuid from 'uuid';
import { sendEmail } from '../../utils/sendEmail';

const BASE_URL = process.env.FRONTEND_BASE_URL!;

export const sendVerificationLink = async (userId: number, email: string) => {
  const created = await EmailVerification.query()
    .insertAndFetch({
      userId,
      uuid: uuid.v4(),
      email,
      updatedAt: 'now',
    })
    .onConflict('userId')
    .merge();
  if (!created) return false;
  await sendEmail(
    email,
    'Verify your email',
    `Please verify your email address using the link:\r\n${BASE_URL}/verifyEmail/${created.uuid}`,
  );
  return true;
};
