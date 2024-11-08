import nodemailer from 'nodemailer';
import userModel  from '../../Database/models/user.model.js';  // Assuming the user model is stored in 'models/user.model.js'

export const notifySellerStatus = async (email, status) => {
  try {
    // Validate that the required fields are present
    if (!email || !status) {
      throw new Error("Email and status are required");
    }

    // Check if the user exists
    const user = await userModel.findOne({ email: email });
    if (!user) {
      throw new Error("No user found with this email");
    }

    // Configure the email message based on the status
    let subject, message;
    switch (status) {
      case "approved":
        subject = "Seller Account Approved";
        message = `<h1>Your seller account has been approved!</h1>
                   <p>You can now access seller features on the platform.</p>`;
        break;
      case "unapproved":
        subject = "Seller Account Not Approved";
        message = `<h1>Your seller account approval was unsuccessful.</h1>
                   <p>Please contact support for further information.</p>`;
        break;
      case "deleted":
        subject = "Seller Account Deleted";
        message = `<h1>Your seller account has been deleted.</h1>
                   <p>If you have questions, please reach out to support.</p>`;
        break;
      case "updated":
        subject = "Seller Account Updated";
        message = `<h1>Your seller account information has been updated.</h1>
                   <p>Review your account details to confirm the changes.</p>`;
        break;
      default:
        throw new Error("Invalid status provided");
    }

    // Set up nodemailer transporter
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL,
      to: user.email,
      subject: subject,
      html: message
    };

    // Send the email
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
        throw new Error("Error sending email");
      } else {
        console.log('Email sent: ' + info.response);
      }
    });
  } catch (err) {
    console.log(err.message);
    throw new Error(err.message);
  }
};
