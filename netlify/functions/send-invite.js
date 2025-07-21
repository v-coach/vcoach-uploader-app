// --- Netlify Serverless Function: send-invite.js ---
// This function sends an email to a new coach.
// It uses the 'resend' library, but you can adapt it for other services like SendGrid.

const { Resend } = require('resend');

exports.handler = async (event, context) => {
  // Environment variables for your email service
  const { RESEND_API_KEY, FROM_EMAIL_ADDRESS } = process.env;

  if (!RESEND_API_KEY || !FROM_EMAIL_ADDRESS) {
    const errorMessage = "Email service credentials are not configured in Netlify environment variables.";
    console.error(errorMessage);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: errorMessage }),
    };
  }

  const resend = new Resend(RESEND_API_KEY);

  try {
    const { coachName, coachEmail } = JSON.parse(event.body);

    // Customize your email content here
    const emailSubject = `You're invited to join V-Coach Central!`;
    const emailBody = `
      <p>Hi ${coachName},</p>
      <p>You have been invited to be a coach on the V-Coach Central platform. Please click the link below to get started.</p>
      <p><a href="${context.clientContext.site.url}">Go to V-Coach Central</a></p>
      <p>Thanks,</p>
      <p>The V-Coach Central Team</p>
    `;

    await resend.emails.send({
      from: FROM_EMAIL_ADDRESS,
      to: coachEmail,
      subject: emailSubject,
      html: emailBody,
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Invite sent successfully!" }),
    };

  } catch (error) {
    console.error("Error sending invite email:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
