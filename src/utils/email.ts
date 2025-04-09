const generateReservationEmail = ({
    name,
    restaurantName,
    bookingDate,
    bookingTime,
    guests,
  

  }: {
    name: string;
    restaurantName: string;
    bookingDate: string;
    bookingTime: string;
    guests: number;
   
   
  }) => {
    const year = new Date().getFullYear();
  
    return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <title>Reservation Confirmed</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #f9f9f9;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 40px auto;
            background-color: #ffffff;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          }
          h2 {
            color: #333333;
          }
          p {
            color: #555555;
            line-height: 1.6;
          }
          .details {
            background-color: #f3f3f3;
            padding: 15px;
            border-radius: 6px;
            margin-top: 20px;
            font-size: 15px;
          }
          .footer {
            margin-top: 30px;
            font-size: 13px;
            color: #999999;
            text-align: center;
          }
          .btn {
            display: inline-block;
            margin-top: 20px;
            background-color: #4caf50;
            color: #ffffff;
            padding: 12px 20px;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>🎉 Reservation Confirmed!</h2>
          <p>Hello ${name},</p>
          <p>Thank you for making a reservation at <strong>${restaurantName}</strong>.</p>
  
          <div class="details">
            <p><strong>Date:</strong> ${bookingDate}</p>
            <p><strong>Time:</strong> ${bookingTime}</p>
            <p><strong>Guests:</strong> ${guests}</p>
           
          </div>
  
          <p>We look forward to serving you! If you have any questions or need to modify your reservation, feel free to contact us.</p>
  
          <div class="footer">
            © ${year} ${restaurantName} • This is an automated message.
          </div>
        </div>
      </body>
    </html>
    `;
  };


  export default  generateReservationEmail
  