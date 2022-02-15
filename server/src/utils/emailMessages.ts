/*
  How to get the email HTML:
    1) Email frontends are located at frontend/src/components/emails
    2) Add temporary routing for your desired email at frontend/src/routers/MainRouter
      *If you're creating a new email, you can use premade EmailTemplate.tsx and HtmlBox.tsx
    3) Copy the HTML from the "HTML for backend" textarea created by HtmlBox.tsx in the frontend app
    4) Paste it here and you're set. The html requires parameters baseUrl and token
*/

export const forgotPasswordEmail = (baseUrl: string, token: string) =>
  `<!DOCTYPE html><html lang="en"><head><title>Forgot password?</title></head><body><div style="background-color:#f5f5f5;text-align:center"><img style="height:32px;width:auto;margin-top:20px" src="${baseUrl}/visdomlogo.png" alt="visdomlogo"/><div style="margin:20px auto;width:500px;background-color:white;border-radius:20px;padding:40px 30px"><div style="text-align:center;color:#289c6b"><h2> Hi! </h2></div><hr/><div style="padding:35px;text-align:center"><div><img style="height:56px;width:auto" src="${baseUrl}/openlock.png" alt="lock-icon"/></div><h2>Forgot password?</h2><div style="color:#6a6a6a;font-size:14px;line-height:100%;letter-spacing:0.02em"><p>No worries, we’ll help you out. <b>To reset your password, </b>click the button below.</p><a href="${baseUrl}/resetPassword/${token}" style="text-decoration:none"><div style="margin:20px 0;width:100%;height:50px;border:none;border-radius:30px;background-color:#0ec679;color:white;font-weight:600;font-size:16px;line-height:50px;letter-spacing:-0.02em;cursor:pointer;margin-bottom:20px;text-align:center">Reset password</div></a><div><p>Or copy the link below to your browser:</p><p>${baseUrl}/resetpassword/${token}</p></div></div><div style="color:#6a6a6a;font-size:14px;line-height:100%;letter-spacing:0.02em;margin-top:40px;margin-bottom:-40px"><i>Didn’t order the password reset link? You can ignore this message.</i></div></div></div><div style="margin:0 auto;padding-bottom:10px;text-align:center;font-size:14px"><img style="height:32px;width:auto;margin-bottom:8px" src="${baseUrl}/visdomlogo.png" alt="visdomlogo"/><div><b>Contact the team</b></div><div style="margin-bottom:20px">visdom@vincit.fi</div></div></div></body></html>`;

interface notify {
  baseUrl: string;
  taskUrl: string;
  taskName: string;
  senderEmail: string;
  message: string;
}

export const notifyUsersEmail = ({
  baseUrl,
  taskUrl,
  taskName,
  senderEmail,
  message,
}: notify) =>
  `<!DOCTYPE html><html lang="en"><head><title>Remember to rate your task</title></head><body><div style="background-color:#f5f5f5;text-align:center"><img style="height:32px;width:auto;margin-top:20px" src="${baseUrl}/visdomlogo.png" alt="visdomlogo"/><div style="margin:20px auto;width:500px;background-color:white;border-radius:20px;padding:40px 30px"><div style="text-align:center;color:#289c6b"><h2> Hi there, </h2></div><hr/><div style="padding:35px;text-align:center"><div><img style="height:56px;width:auto" src="${baseUrl}/bellicon.png" alt="lock-icon"/></div><h2>Remember to rate your task</h2><div style="color:#6a6a6a;font-size:14px;line-height:100%;letter-spacing:0.02em"><div style="margin-bottom:20px"><div style="margin:20px"><div>You’ve received a task rating request to</div><div><b>${taskName}</b></div><div>from ${senderEmail} as it’s waiting for your rating.</div></div><p style="color:#289c6b;font-size:16px;margin:10px 0px"><i>${message}</i></p></div><hr/><p style="margin:20px 0px">No worries! To help your teammates, please click the button below to give your ratings.</p><a href="${taskUrl}" style="text-decoration:none"><div style="margin:20px 0;width:100%;height:50px;border:none;border-radius:30px;background-color:#0ec679;color:white;font-weight:600;font-size:16px;line-height:50px;letter-spacing:-0.02em;cursor:pointer;margin-bottom:20px;text-align:center">Rate your task</div></a><div style="margin-bottom:-40px;margin-top:20px"><p>Or copy the link below to your browser:</p><p>${taskUrl}</p></div></div></div></div><div style="margin:0 auto;padding-bottom:10px;text-align:center;font-size:14px"><img style="height:32px;width:auto;margin-bottom:8px" src="${baseUrl}/visdomlogo.png" alt="visdomlogo"/><div><b>Contact the team</b></div><div style="margin-bottom:20px">visdom@vincit.fi</div></div></div></body></html>`;
