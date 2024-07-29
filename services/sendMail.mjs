// sendMail.mjs

import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();


// Send mail with defined transport object
export const sendMailt = async (to,bcc, subject, text, html) => {

    // Create a transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
        host:"smtp.red5g.com.sv",
        port: 465,
        secure: true,
        auth: {
            user: process.env.USER_SMTP,
            pass: process.env.PASSWORD_SMTP
        
        },
        
        // logger: true, // Log to console
        // debug: true // Include SMTP traffic in the logs
    });

    // Setup email data
    let mailOptions = {
        from: `"Billing Internet Support " <${process.env.EMAIL}>`,
        // to: 'sales@fortified.one',
        to,
        bcc,
        // subject: 'Confirmación de pago',
        subject,
        // text: 'me vas autorizar parquear enfrente de la oficie?',
        html
    };

    try {
        
        const info = await transporter.sendMail(mailOptions);

    } catch (error) {
        console.log("error", error);
    }
}