const generateInviteHTML = (guestName: string, inviteLink: string, token: string): string => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>You're Invited!</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { 
      margin: 0;
      padding: 40px 20px;
      background-color: #f3efe4;
      font-family: Georgia, 'Times New Roman', Times, serif;
      color: #21701a;
      line-height: 1.6;
    }
    .container { 
      max-width: 600px;
      margin: 0 auto;
      background: #ffffff;
      border-radius: 16px;
      padding: 40px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      border: 1px solid #b6c4b0;
    }
    .header-image {
      width: 100%;
      height: auto;
      margin-bottom: 25px;
      border-radius: 8px;
      border: 1px solid #b6c4b0;
    }
    h1 {
      font-family: 'Libre Baskerville', Georgia, serif;
      color: #21701a;
      font-size: 2.5rem;
      text-transform: uppercase;
      margin: 0 0 20px 0;
      text-align: center;
      letter-spacing: 0.1rem;
    }
    p {
      margin: 0 0 20px 0;
      font-size: 1.1rem;
    }
    .btn {
      display: inline-block;
      padding: 15px 30px;
      margin: 30px 0;
      background-color: #21701a;
      color: #ffffff !important;
      text-decoration: none;
      border-radius: 2rem;
      font-family: Georgia, serif;
      font-weight: bold;
      text-align: center;
      transition: background-color 0.3s ease;
      border: 1px solid #1a5a13;
    }
    .btn:hover {
      background-color: #1a5a13;
    }
    .footer {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #b6c4b0;
      font-size: 0.9rem;
      color: #777777;
      text-align: center;
    }
    @media screen and (max-width: 620px) {
      .container {
        margin: 0 10px;
        padding: 25px;
      }
      h1 {
        font-size: 2rem;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <img src="https://storage.googleapis.com/my-wedding-assets/Images/Avi%20%26%20Shakthi%E2%80%99s%20wedding.PNG" 
         alt="Avi & Shakthi's Wedding Invitation" 
         class="header-image"
         style="display: block; width: 100%; height: auto; margin-bottom: 25px; border-radius: 8px; border: 1px solid #b6c4b0;">

    <h1>You're Invited, ${guestName}!</h1>
    
    <p>We are so excited to celebrate our special day with you at Sylvan Lake's Hilltop Wedding Center. </p>
    
    <p>Please RSVP by clicking the button below to view your personalized invitation details:</p>

    <center>
      <a href="${inviteLink}" class="btn">VIEW INVITATION</a>
    </center>

    <p class="footer">With love,<br>Avi & Shakthi<br><br>Questions? Reply to this email or call (403) 667-8695</p>

    <!-- Tracking Pixel -->
    <img src="${process.env.NEXT_PUBLIC_BASE_URL}/api/email-open/${token}" width="1" height="1" alt="" style="display:none;">
  </div>
</body>
</html>
`;

export default generateInviteHTML;