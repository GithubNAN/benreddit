import nodemailer from "nodemailer";

export async function sendEmail(to: string, html: string) {
  //   const testAccount = await nodemailer.createTestAccount();
  //   console.log(`test email account: ${JSON.stringify(testAccount)}`);
  // User: otdswstyrg7wc4fx@ethereal.email
  // Pass: ByRckYr9mWj2TEQYDG

  const transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: {
      user: "otdswstyrg7wc4fx@ethereal.email",
      pass: "ByRckYr9mWj2TEQYDG",
    },
  });

  const info = await transporter.sendMail({
    from: `"Fred Foo" <foo@example.com>`,
    to,
    subject: `Change password`,
    html,
  });

  console.log(`Message sent: ${info.messageId}`);

  console.log(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
}
