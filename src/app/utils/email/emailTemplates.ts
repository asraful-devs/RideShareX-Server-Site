export interface RidePickedEmailData {
    userFirstName: string;
    userEmail: string;
    driverName: string;
    driverPhone: string;
    rideStartLocation: string;
    rideEndLocation: string;
    estimatedFare: number;
    rideId: string;
}

/**
 * Generate HTML email template when a driver picks a ride
 */
export const generateRidePickedTemplate = (data: RidePickedEmailData) => {
    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Your Ride has been Accepted!</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    background-color: #f4f4f4;
                }
                .container {
                    max-width: 600px;
                    margin: 0 auto;
                    background-color: #fff;
                    padding: 20px;
                    border-radius: 8px;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                }
                .header {
                    background-color: #2ecc71;
                    color: white;
                    padding: 20px;
                    border-radius: 8px 8px 0 0;
                    text-align: center;
                }
                .header h1 {
                    margin: 0;
                    font-size: 24px;
                }
                .content {
                    padding: 20px;
                }
                .section {
                    margin: 20px 0;
                    padding: 15px;
                    background-color: #f9f9f9;
                    border-left: 4px solid #2ecc71;
                    border-radius: 4px;
                }
                .section h3 {
                    margin-top: 0;
                    color: #2ecc71;
                }
                .info-row {
                    display: flex;
                    justify-content: space-between;
                    margin: 10px 0;
                    padding: 8px 0;
                    border-bottom: 1px solid #eee;
                }
                .info-label {
                    font-weight: bold;
                    color: #555;
                }
                .info-value {
                    color: #333;
                }
                .driver-info {
                    background-color: #e8f8f5;
                    padding: 15px;
                    border-radius: 6px;
                    margin: 15px 0;
                    border: 2px solid #2ecc71;
                }
                .footer {
                    text-align: center;
                    margin-top: 20px;
                    padding-top: 20px;
                    border-top: 1px solid #eee;
                    color: #888;
                    font-size: 12px;
                }
                .button {
                    display: inline-block;
                    background-color: #2ecc71;
                    color: white;
                    padding: 12px 24px;
                    text-decoration: none;
                    border-radius: 6px;
                    margin: 10px 0;
                    font-weight: bold;
                }
                .button:hover {
                    background-color: #27ae60;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🎉 Your Ride has been Accepted!</h1>
                </div>

                <div class="content">
                    <p>Hi <strong>${data.userFirstName}</strong>,</p>

                    <p>Great news! A driver has accepted your ride request. Here are the details:</p>

                    <div class="section">
                        <h3>📍 Ride Details</h3>
                        <div class="info-row">
                            <span class="info-label">Pickup Location:</span>
                            <span class="info-value">${data.rideStartLocation}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Drop-off Location:</span>
                            <span class="info-value">${data.rideEndLocation}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Estimated Fare:</span>
                            <span class="info-value">$${data.estimatedFare.toFixed(2)}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Ride ID:</span>
                            <span class="info-value">#${data.rideId}</span>
                        </div>
                    </div>

                    <div class="section">
                        <h3>👨‍🚗 Your Driver</h3>
                        <div class="driver-info">
                            <div class="info-row">
                                <span class="info-label">Driver Name:</span>
                                <span class="info-value">${data.driverName}</span>
                            </div>
                            <div class="info-row">
                                <span class="info-label">Contact Number:</span>
                                <span class="info-value">${data.driverPhone}</span>
                            </div>
                        </div>
                    </div>

                    <p style="text-align: center;">
                        <a href="${process.env.FRONTEND_URL}/ride/${data.rideId}" class="button">
                            View Ride Details
                        </a>
                    </p>

                    <p>Your driver is on the way. Please be ready at the pickup location. If you need to cancel or modify your ride, please do so as soon as possible.</p>

                    <p>Thank you for using RideShareX! 🚗</p>
                </div>

                <div class="footer">
                    <p>This is an automated email. Please do not reply to this message.</p>
                    <p>© 2026 RideShareX. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
    `;
};

export const generateRidePickedTextTemplate = (data: RidePickedEmailData) => {
    return `
Hi ${data.userFirstName},

Great news! A driver has accepted your ride request. Here are the details:

RIDE DETAILS
Pickup Location: ${data.rideStartLocation}
Drop-off Location: ${data.rideEndLocation}
Estimated Fare: $${data.estimatedFare.toFixed(2)}
Ride ID: #${data.rideId}

YOUR DRIVER
Driver Name: ${data.driverName}
Contact Number: ${data.driverPhone}

View full ride details at: ${process.env.FRONTEND_URL}/ride/${data.rideId}

Your driver is on the way. Please be ready at the pickup location.

Thank you for using RideShareX!

---
This is an automated email. Please do not reply to this message.
© 2026 RideShareX. All rights reserved.
    `;
};

// Add more email templates as needed
export interface EmailTemplateData {
    ridePickedEmail?: RidePickedEmailData;
}
