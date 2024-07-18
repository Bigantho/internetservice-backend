// sendMail.mjs

import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();


// Send mail with defined transport object
export const sendMailt = async () => {

    // Create a transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
        host: "smtp.red5g.com.sv",
        port: 587,
        secure: false,
        // service: 'smtp.red5g.com.sv',
        auth: {
            // user: process.env.EMAIL,
            // pass: process.env.EMAIL_PASSWORD
            user: "netops_xl14nd0w",
            pass: "a[@!(,)?|3#!@7rJ7mc_fJpFg"
        }
    });

    // Setup email data
    let mailOptions = {
        from: `"Your Name" <${process.env.EMAIL}>`,
        to: 'avasquez@red5g.com',
        subject: 'Hello ✔',
        text: 'Hello world?',
        html: '<b>Hello world?</b>'
    };

    try {
        // const mailOptions = {
        //     from: `"Your Name" <${process.env.EMAIL}>`,
        //     to,
        //     subject,
        //     text,
        //     html
        // };
        console.log("inside here");
        const info = await transporter.sendMail(mailOptions);

        // console.log(info)
        //    await transporter.sendMail(mailOptions, (error, info) => {
        //         if (error) {
        //             return console.error(error);
        //         }
        //         console.log('Message sent: %s', info.messageId);
        //         console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
        //     });

    } catch (error) {
        console.log("error", error);
    }
}