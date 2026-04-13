import 'dotenv/config'
import nodemailer from 'nodemailer'
import emailTemplate from './emailTemplate.js'

const GmailHost = "smtp.gmail.com"
const GmailPort = 465
const NoReplyMail = "no-reply@teamfuture.in"
const GmailUsername = process.env.MAIL_USERNAME
const GmailPassword = process.env.MAIL_PASSWORD

const transporter = nodemailer.createTransport({
    host: GmailHost,
    port: 465,
    secure: true, // Use `true` for port 465, `false` for all other ports
    auth: {
        user: GmailUsername,
        pass: GmailPassword,
    },
});

async function sendMail(req, res) {
    try {
        const name = "Hello Name";
        const email = "saptarshichakraborty04sc@gmail.com";
        // const email = "dattaguptadebajyoti@gmail.com";
        const id = "473438585684584";
        const latitude = "22.8787979";
        const longitude = "46.45368770970";
        const imageBase64 = "req.body.image";
        console.log(name)
        console.log({ name, email, id, latitude, longitude })

        const emailSubject = 'Delivery of your parcel - ' + name;

        const mailBody = emailTemplate(name, id, latitude, longitude, imageBase64);

        const info = await transporter.sendMail({
            from: `Parcel Management Team ${NoReplyMail}`, // sender address
            to: email, // list of receivers
            subject: emailSubject, // Subject line
            html: mailBody, // html body
            attachments: [
                {
                    filename: 'image.png',
                    content: Buffer.from(imageBase64, 'base64'),
                    encoding: 'base64',
                    cid: "imageId"
                }
            ]
        });

        console.log("Message sent: %s", info.messageId);

        const responseMsg = {
            status: 'success',
            message: 'Mail sent successfully'
        }
        res.send(JSON.stringify(responseMsg))

    } catch (e) {
        console.log(e)
        const responseMsg = {
            status: 'error',
            message: 'Mail not sent',
            error: e
        }

        res.set({
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Credentials": true
        });
        res.send(JSON.stringify(responseMsg))
    }
}
// console.log('server is running on http://localhost:${PORT}')
export default sendMail