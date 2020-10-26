const nodemailer = require("nodemailer");

let transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const sendEmail = (errorInfo) => {
  let mailOptions = {
    from: process.env.EMAIL_USERNAME,
    to: process.env.SEND_TO,
    subject: "Error updating DNS records",
    text:
      "An error occured during DNS update. Check the server logs for more info \n\n" +
      errorInfo,
  };
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log("transporter error", error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
};

module.exports.sendEmail = sendEmail;
