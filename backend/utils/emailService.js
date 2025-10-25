// utils/emailService.js
const nodemailer = require('nodemailer');

// Email templates (keep your existing templates)
const emailTemplates = {
    bookingSubmitted: (name, bookingId, hostelName) => ({
        subject: `Booking Submitted - ${hostelName}`,
        text: `Dear ${name},\n\nYour booking (ID: ${bookingId}) for ${hostelName} has been submitted successfully and is pending approval.\n\nWe will notify you once it's reviewed.\n\nThank you for choosing our hostel!\n\nBest regards,\nHostel Management Team`,
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                    .booking-info { background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #667eea; margin: 20px 0; }
                    .footer { text-align: center; margin-top: 30px; padding: 20px; color: #666; font-size: 12px; }
                    .status-pending { color: #ffa500; font-weight: bold; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Booking Submitted! 🎉</h1>
                        <p>${hostelName}</p>
                    </div>
                    <div class="content">
                        <p>Dear <strong>${name}</strong>,</p>
                        <p>Your booking request has been received successfully and is now pending approval.</p>
                        
                        <div class="booking-info">
                            <h3>Booking Details:</h3>
                            <p><strong>Booking ID:</strong> ${bookingId}</p>
                            <p><strong>Hostel:</strong> ${hostelName}</p>
                            <p><strong>Status:</strong> <span class="status-pending">Pending Approval</span></p>
                            <p><strong>Submitted:</strong> ${new Date().toLocaleDateString()}</p>
                        </div>

                        <p><strong>What happens next?</strong></p>
                        <ul>
                            <li>Our team will review your application</li>
                            <li>You'll receive an email once approved</li>
                            <li>Room assignment will follow approval</li>
                        </ul>

                        <p>We typically process applications within 24-48 hours.</p>
                        <p>Thank you for choosing our hostel service!</p>
                    </div>
                    <div class="footer">
                        <p>This is an automated message. Please do not reply to this email.</p>
                        <p>© ${new Date().getFullYear()} Hostel Management System. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
        `
    }),

    bookingApproved: (name, bookingId, roomNumber, hostelName) => ({
        subject: `🎉 Booking Approved - ${hostelName}`,
        text: `CONGRATULATIONS ${name}!\n\nYour booking (ID: ${bookingId}) for ${hostelName} has been APPROVED!\n\n${roomNumber ? `Your assigned room: ${roomNumber}\n` : 'Your room will be assigned soon.\n'}\nNext Steps:\n1. Complete your payment within 48 hours\n2. Review hostel rules and regulations\n3. Prepare required documents for check-in\n\nCheck-in Date: To be confirmed\n\nWelcome to ${hostelName}! We're excited to have you.\n\nBest regards,\nHostel Management Team`,
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #28a745, #20c997); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                    .booking-info { background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #28a745; margin: 20px 0; }
                    .next-steps { background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0; }
                    .footer { text-align: center; margin-top: 30px; padding: 20px; color: #666; font-size: 12px; }
                    .status-approved { color: #28a745; font-weight: bold; }
                    .celebrate { font-size: 24px; margin: 10px 0; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <div class="celebrate">🎉 🎊</div>
                        <h1>Booking Approved!</h1>
                        <p>Welcome to ${hostelName}</p>
                    </div>
                    <div class="content">
                        <p>Dear <strong>${name}</strong>,</p>
                        <p>Great news! Your booking application has been <strong>approved</strong>!</p>
                        
                        <div class="booking-info">
                            <h3>Booking Details:</h3>
                            <p><strong>Booking ID:</strong> ${bookingId}</p>
                            <p><strong>Hostel:</strong> ${hostelName}</p>
                            <p><strong>Status:</strong> <span class="status-approved">Approved ✅</span></p>
                            ${roomNumber ? `<p><strong>Assigned Room:</strong> ${roomNumber}</p>` : '<p><strong>Room Assignment:</strong> Will be assigned soon</p>'}
                            <p><strong>Approved On:</strong> ${new Date().toLocaleDateString()}</p>
                        </div>

                        <div class="next-steps">
                            <h3>Next Steps:</h3>
                            <ol>
                                <li><strong>Complete Payment:</strong> Make your payment within 48 hours to secure your booking</li>
                                <li><strong>Review Rules:</strong> Familiarize yourself with hostel rules and regulations</li>
                                <li><strong>Prepare Documents:</strong> Keep your ID and admission documents ready</li>
                                <li><strong>Check-in:</strong> You'll receive check-in instructions soon</li>
                            </ol>
                        </div>

                        <p><strong>Important:</strong> Your booking will be confirmed only after payment is received.</p>
                        <p>We're excited to welcome you to ${hostelName}!</p>
                    </div>
                    <div class="footer">
                        <p>Need help? Contact hostel administration</p>
                        <p>© ${new Date().getFullYear()} Hostel Management System.</p>
                    </div>
                </div>
            </body>
            </html>
        `
    }),

    bookingRejected: (name, bookingId, rejectionReason, hostelName) => ({
        subject: `Booking Update - ${hostelName}`,
        text: `Dear ${name},\n\nWe regret to inform you that your booking application (ID: ${bookingId}) for ${hostelName} could not be approved.\n\nReason: ${rejectionReason}\n\nIf you believe this is a mistake or would like to discuss alternative options, please contact our administration office.\n\nWe appreciate your interest in ${hostelName} and hope to serve you in the future.\n\nBest regards,\nHostel Management Team`,
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #dc3545, #e83e8c); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                    .booking-info { background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #dc3545; margin: 20px 0; }
                    .contact-info { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
                    .footer { text-align: center; margin-top: 30px; padding: 20px; color: #666; font-size: 12px; }
                    .status-rejected { color: #dc3545; font-weight: bold; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Booking Update</h1>
                        <p>${hostelName}</p>
                    </div>
                    <div class="content">
                        <p>Dear <strong>${name}</strong>,</p>
                        <p>Thank you for your interest in ${hostelName}. After careful review, we regret to inform you that your booking application could not be approved at this time.</p>
                        
                        <div class="booking-info">
                            <h3>Application Details:</h3>
                            <p><strong>Booking ID:</strong> ${bookingId}</p>
                            <p><strong>Hostel:</strong> ${hostelName}</p>
                            <p><strong>Status:</strong> <span class="status-rejected">Not Approved</span></p>
                            <p><strong>Reason:</strong> ${rejectionReason}</p>
                            <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
                        </div>

                        <div class="contact-info">
                            <h3>Need More Information?</h3>
                            <p>If you have questions or would like to discuss this decision, please contact us.</p>
                        </div>

                        <p>We appreciate your understanding and hope to have the opportunity to serve you in the future.</p>
                    </div>
                    <div class="footer">
                        <p>This is an automated message. For inquiries, please contact the administration.</p>
                        <p>© ${new Date().getFullYear()} Hostel Management System.</p>
                    </div>
                </div>
            </body>
            </html>
        `
    }),

    managerNotification: (pendingCount, hostelName) => ({
        subject: `🚨 ${pendingCount} Pending Booking${pendingCount !== 1 ? 's' : ''} - ${hostelName}`,
        text: `Manager Alert!\n\nYou have ${pendingCount} pending booking${pendingCount !== 1 ? 's' : ''} for ${hostelName} requiring your approval.\n\nPlease log in to the admin panel to review these applications.\n\nThis is an automated notification.`,
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #ffc107, #fd7e14); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                    .alert-box { background: #fff3cd; border: 2px solid #ffc107; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; }
                    .footer { text-align: center; margin-top: 30px; padding: 20px; color: #666; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🔄 Action Required</h1>
                        <p>Pending Bookings Notification</p>
                    </div>
                    <div class="content">
                        <div class="alert-box">
                            <h2>${pendingCount} Pending Booking${pendingCount !== 1 ? 's' : ''}</h2>
                            <p><strong>Hostel:</strong> ${hostelName}</p>
                            <p>These bookings are awaiting your review and approval.</p>
                        </div>

                        <p>Please review the pending applications at your earliest convenience to ensure timely processing for our students.</p>

                        <p><strong>Average Processing Time:</strong> 24-48 hours</p>
                        <p><strong>Priority:</strong> Normal</p>
                    </div>
                    <div class="footer">
                        <p>This is an automated notification from the Hostel Management System.</p>
                        <p>© ${new Date().getFullYear()} Hostel Management System.</p>
                    </div>
                </div>
            </body>
            </html>
        `
    })
};

// Create email transporter - FIXED: createTransport (not createTransporter)
const createTransporter = () => {
    // Use your Gmail configuration from .env
    return nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.EMAIL_PORT) || 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });
};

// Main email sending function
const sendEmail = async (to, templateName, templateData = []) => {
    try {
        console.log('📧 ATTEMPTING TO SEND EMAIL:');
        console.log('To:', to);
        console.log('Template:', templateName);
        console.log('Template Data:', templateData);
        console.log('Using Gmail:', process.env.EMAIL_USER);

        // Validate inputs
        if (!to || !templateName) {
            console.log('❌ Missing required email parameters');
            return { success: false, error: 'Missing required parameters' };
        }

        // Get email template
        const template = emailTemplates[templateName];
        if (!template) {
            console.log('❌ Email template not found:', templateName);
            return { success: false, error: 'Template not found' };
        }

        // Generate email content
        const emailContent = template(...templateData);
        
        // Create email configuration
        const mailOptions = {
            from: `"Hostel Management System" <${process.env.EMAIL_USER}>`,
            to: to,
            subject: emailContent.subject,
            text: emailContent.text,
            html: emailContent.html
        };

        console.log('📧 Email configured:', {
            from: mailOptions.from,
            to: mailOptions.to,
            subject: mailOptions.subject
        });

        // Send email using Gmail
        const transporter = createTransporter();
        
        // Verify connection configuration
        await transporter.verify();
        console.log('✅ SMTP connection verified successfully');

        // Send email
        const result = await transporter.sendMail(mailOptions);
        console.log('✅ Email sent successfully!');
        console.log('📧 Message ID:', result.messageId);
        console.log('📧 Response:', result.response);

        return { 
            success: true, 
            messageId: result.messageId,
            response: result.response 
        };

    } catch (error) {
        console.error('💥 EMAIL SENDING FAILED:');
        console.error('Error:', error.message);
        console.error('Error Code:', error.code);
        console.error('Stack:', error.stack);
        
        // Common Gmail error troubleshooting
        if (error.code === 'EAUTH') {
            console.error('🔐 Authentication failed. Check:');
            console.error('1. Gmail password is correct');
            console.error('2. You are using an App Password (not your regular Gmail password)');
            console.error('3. 2-factor authentication is enabled in your Google account');
        } else if (error.code === 'ECONNECTION') {
            console.error('🌐 Connection failed. Check:');
            console.error('1. Internet connection');
            console.error('2. SMTP settings (host: smtp.gmail.com, port: 587)');
        }
        
        // Don't throw error - email failure shouldn't break the main functionality
        return { 
            success: false, 
            error: error.message,
            code: error.code
        };
    }
};

// Test email function
const testEmailService = async (testEmail = 'efitiandrew@gmail.com') => {
    console.log('🧪 TESTING EMAIL SERVICE WITH GMAIL...');
    
    try {
        const result = await sendEmail(
            testEmail,
            'bookingSubmitted',
            ['Test Student', 'TEST-123', 'Test Hostel']
        );
        
        console.log('🧪 Test Result:', result);
        return result;
    } catch (error) {
        console.error('🧪 Test Failed:', error);
        return { success: false, error: error.message };
    }
};

module.exports = {
    sendEmail,
    testEmailService,
    emailTemplates
};