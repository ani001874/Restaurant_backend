
import { MailtrapClient } from "mailtrap"

/**
 * For this example to work, you need to set up a sending domain,
 * and obtain a token that is authorized to send from the domain.
 */


const SENDER_EMAIL = "hello@demomailtrap.co";


if (!process.env.MAILTRAP_TOKEN) {
  throw new Error("MAILTRAP_TOKEN environment variable is not defined");

}
console.log(process.env.MAILTRAP_TOKEN)
const client = new MailtrapClient({ token: process.env.MAILTRAP_TOKEN });

const sender = { name: "Mailtrap Test", email: SENDER_EMAIL };

const sendReservationSucessfullEmail = async (sendTo:string,htmlContent:string) => {
  let x =  await client
   .send({
     from: sender,
     to: [{ email: sendTo }],
     subject: "Hello from ani's restaurants",
     html:htmlContent
   })

   console.log(x)
}


export {sendReservationSucessfullEmail}

