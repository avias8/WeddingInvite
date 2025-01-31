const generateInviteHTML = (guestName: string, inviteLink: string, token: string): string => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>You're Invited!</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: Arial, sans-serif; background-color: #f4f4f4; color: #333; padding: 20px; }
    .container { max-width: 600px; background-color: #fff; margin: auto; padding: 20px; border-radius: 10px; box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1); }
    h1 { color: #21701a; }
    .btn { display: inline-block; padding: 12px 20px; margin-top: 20px; color: white; background-color: #21701a; text-decoration: none; border-radius: 5px; font-weight: bold; }
    .btn:hover { background-color: #1a5a13; }
    .footer { font-size: 12px; text-align: center; margin-top: 20px; color: #777; }
  </style>
</head>
<body>
  <div class="container">
    <h1>You're Invited, ${guestName}!</h1>
    <p>We are so excited to celebrate our special day with you. Please RSVP by clicking the button below.</p>
    <a href="${inviteLink}" class="btn">View Invitation</a>
    <p class="footer">If you have any questions, please reply to this email.</p>

    <!-- ✅ Invisible Tracking Pixel -->
    <img src="${process.env.NEXT_PUBLIC_BASE_URL}/api/email-open/${token}" width="1" height="1" alt="" style="display:none;" /> 
  </div>
</body>
</html>
`;

export default generateInviteHTML;