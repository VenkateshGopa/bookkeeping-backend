var nodemailer = require("nodemailer");

const mailer = (email, code) => {
  return new Promise((resolve, reject) => {
    var transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "bookkeeping.cap@gmail.com",
        pass: "Book@12345",
      },
    });

    var mailOptions = {
      from: "packatest@gmail.com",
      to: email,
      subject: `Book Keeping`
      // text: 'That was easy!'
      html: `<p>${code} </p>`,
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
        resolve(false);
      } else {
        console.log("Email sent: " + info.response);
        resolve(true);
      }
    });
  });
};

module.exports = mailer;
