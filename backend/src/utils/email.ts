// @ts-nocheck
import nodemailer from 'nodemailer';

let transporter;

// Only create transporter if SMTP credentials are configured
if (process.env.SMTP_USER && process.env.SMTP_PASS) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_SERVER || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  // Verify SMTP connection on startup
  transporter.verify((error, success) => {
    if (error) {
      console.error('=== SMTP CONNECTION VERIFICATION FAILED ===');
      console.error('Error:', error);
      console.log('=== EMAIL SENDING DISABLED ===');
      transporter = null; // Set to null so email functions know it's disabled
    } else {
      console.log('=== SMTP SERVER READY ===');
      console.log('SMTP Config:', {
        host: process.env.SMTP_SERVER,
        port: process.env.SMTP_PORT,
        secure: process.env.SMTP_SECURE,
        user: process.env.SMTP_USER,
        sender: process.env.SENDER_EMAIL
      });
    }
  });
} else {
  console.log('=== SMTP CREDENTIALS NOT CONFIGURED ===');
  console.log('Email sending disabled. Set SMTP_USER and SMTP_PASS in environment variables to enable.');
}

export const emailService = {
  async sendPassword(email, password, name, maxRetries = 3) {
    // Log password before attempting to send email
    console.error('========================================');
    console.error('⚠️  PASSWORD LOGGING BEFORE EMAIL ATTEMPT ⚠️');
    console.error('========================================');
    console.error('Email Type: Password Email');
    console.error('Recipient:', email);
    console.error('Recipient Name:', name);
    console.error('PASSWORD:', password);
    console.error('Timestamp:', new Date().toISOString());
    console.error('========================================');

    // Check if transporter is configured
    if (!transporter) {
      console.error('========================================');
      console.error('⚠️  ADMIN ALERT: EMAIL SENDING DISABLED ⚠️');
      console.error('========================================');
      console.error('Reason: SMTP not configured or connection failed');
      console.error('ACTION REQUIRED: Manually provide password to user');
      console.error('========================================');
      return false;
    }

    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`=== SENDING PASSWORD EMAIL (Attempt ${attempt}/${maxRetries}) ===`);
        console.log('To:', email);
        console.log('From:', process.env.SENDER_EMAIL || process.env.SMTP_USER);
        console.log('Name:', name);

        const mailOptions = {
          from: `"${process.env.SENDER_NAME || 'LocHotel'}" <${process.env.SENDER_EMAIL || process.env.SMTP_USER}>`,
          to: email,
          replyTo: process.env.REPLY_TO_EMAIL,
          subject: 'Your Account Password',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #d4af37;">Welcome to ${process.env.COMPANY_NAME || 'LocHotel'}</h2>
              <p>Hello ${name},</p>
              <p>Your account has been created successfully. Here are your login credentials:</p>
              <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Password:</strong> ${password}</p>
              </div>
              <p>Please change your password after your first login for security.</p>
              <p>Best regards,<br>${process.env.COMPANY_NAME || 'LocHotel'} Team</p>
            </div>
          `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('=== PASSWORD EMAIL SENT SUCCESSFULLY ===');
        console.log('Message ID:', info.messageId);
        console.log('Response:', info.response);
        return true;
      } catch (error) {
        lastError = error;
        console.error(`=== PASSWORD EMAIL SENDING ERROR (Attempt ${attempt}/${maxRetries}) ===`);
        console.error('Error:', error);
        console.error('Error code:', error.code);
        console.error('Error response:', error.response);
        
        // If this is not the last attempt, wait before retrying
        if (attempt < maxRetries) {
          const waitTime = Math.pow(2, attempt) * 1000; // Exponential backoff: 2s, 4s, 8s
          console.log(`Retrying in ${waitTime / 1000} seconds...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          
          // Recreate transporter for retry in case of connection issues
          try {
            transporter.close();
          } catch (e) {
            // Ignore close errors
          }
          
          // Recreate transporter
          const newTransporter = nodemailer.createTransport({
            host: process.env.SMTP_SERVER || 'smtp.gmail.com',
            port: process.env.SMTP_PORT || 587,
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
              user: process.env.SMTP_USER,
              pass: process.env.SMTP_PASS
            }
          });
          
          // Replace the global transporter
          Object.assign(transporter, newTransporter);
        }
      }
    }
    
    // All retries failed - Alert admin
    console.error('========================================');
    console.error('⚠️  ADMIN ALERT: EMAIL SENDING FAILED AFTER 3 RETRIES ⚠️');
    console.error('========================================');
    console.error('Email Type: Password Email');
    console.error('Recipient:', email);
    console.error('Recipient Name:', name);
    console.error('PASSWORD:', password);
    console.error('Final Error:', lastError.message);
    console.error('Error Code:', lastError.code);
    console.error('Timestamp:', new Date().toISOString());
    console.error('========================================');
    console.error('ACTION REQUIRED: Check SMTP configuration and email service');
    console.error('========================================');
    return false;
  },

  async sendOrderStatusUpdate(email, order, status, maxRetries = 3) {
    if (!transporter) {
      console.log('=== EMAIL SENDING DISABLED - SMTP NOT CONFIGURED ===');
      console.log('Order status would be sent to:', email);
      return false;
    }

    if (!email) {
      console.log('No email provided for order status notification');
      return false;
    }

    let lastError;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`=== SENDING ORDER STATUS EMAIL (Attempt ${attempt}/${maxRetries}) ===`);
        console.log('To:', email);
        console.log('Order ID:', order.order_id);
        console.log('Status:', status);

        const statusMessages = {
          'pending': 'Your order has been received and is pending confirmation.',
          'confirmed': 'Your order has been confirmed and is being prepared.',
          'preparing': 'Your order is currently being prepared by our kitchen.',
          'out_for_delivery': 'Your order is out for delivery and will arrive soon.',
          'delivered': 'Your order has been delivered. Enjoy your meal!',
          'cancelled': 'Your order has been cancelled.'
        };

        const message = statusMessages[status] || `Your order status has been updated to: ${status}`;

        const mailOptions = {
          from: `"${process.env.SENDER_NAME || 'LocHotel'}" <${process.env.SENDER_EMAIL || process.env.SMTP_USER}>`,
          to: email,
          replyTo: process.env.REPLY_TO_EMAIL,
          subject: `Order #${order.order_id} Status Update`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
              <div style="background: linear-gradient(135deg, #d4af37 0%, #a57d28 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1 style="color: white; margin: 0; font-size: 28px;">${process.env.COMPANY_NAME || 'LocHotel'}</h1>
              </div>
              <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                <h2 style="color: #333; margin-top: 0;">Order Status Update</h2>
                <p style="color: #666; font-size: 16px;">Hello ${order.guest_name || 'Guest'},</p>
                <p style="color: #666; font-size: 16px;">${message}</p>

                <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <h3 style="color: #d4af37; margin-top: 0; font-size: 18px;">Order Details</h3>
                  <p style="color: #666; margin: 5px 0;"><strong>Order ID:</strong> #${order.order_id}</p>
                  <p style="color: #666; margin: 5px 0;"><strong>Location:</strong> ${order.room_number ? `Room ${order.room_number}` : `Table ${order.table_number}`}</p>
                  <p style="color: #666; margin: 5px 0;"><strong>Total:</strong> $${parseFloat(order.total_price).toFixed(2)}</p>
                  <p style="color: #666; margin: 5px 0;"><strong>Status:</strong> <span style="background: #d4af37; color: white; padding: 5px 10px; border-radius: 4px; font-size: 14px;">${status.toUpperCase()}</span></p>
                </div>

                <p style="color: #666; font-size: 14px;">If you have any questions about your order, please contact our front desk.</p>

                <p style="color: #666; font-size: 16px;">Best regards,<br>${process.env.COMPANY_NAME || 'LocHotel'} Team</p>
              </div>
              <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
                <p>This is an automated email. Please do not reply directly.</p>
              </div>
            </div>
          `
        };

        await transporter.sendMail(mailOptions);
        console.log(`Order status email sent to ${email} for order #${order.order_id}`);
        return true;
      } catch (error) {
        lastError = error;
        console.error(`=== ORDER STATUS EMAIL ERROR (Attempt ${attempt}/${maxRetries}) ===`);
        console.error('Error:', error);

        if (attempt < maxRetries) {
          const waitTime = Math.pow(2, attempt) * 1000;
          console.log(`Retrying in ${waitTime / 1000} seconds...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }
      }
    }

    // All retries failed - Alert admin
    console.error('========================================');
    console.error('⚠️  ADMIN ALERT: EMAIL SENDING FAILED AFTER 3 RETRIES ⚠️');
    console.error('========================================');
    console.error('Email Type: Order Status Update');
    console.error('Recipient:', email);
    console.error('Order ID:', order.order_id);
    console.error('Status:', status);
    console.error('Final Error:', lastError.message);
    console.error('Error Code:', lastError.code);
    console.error('Timestamp:', new Date().toISOString());
    console.error('========================================');
    console.error('ACTION REQUIRED: Check SMTP configuration and email service');
    console.error('========================================');
    return false;
  },

  async sendOrderConfirmation(email, order, items, maxRetries = 3) {
    if (!transporter) {
      console.log('=== EMAIL SENDING DISABLED - SMTP NOT CONFIGURED ===');
      console.log('Order confirmation would be sent to:', email);
      return false;
    }

    if (!email) {
      console.log('No email provided for order confirmation');
      return false;
    }

    let lastError;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`=== SENDING ORDER CONFIRMATION EMAIL (Attempt ${attempt}/${maxRetries}) ===`);
        console.log('To:', email);
        console.log('Order ID:', order.order_id);

        const itemsList = items.map(item => `
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.item_name || 'Item'}</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">$${parseFloat(item.unit_price).toFixed(2)}</td>
          </tr>
        `).join('');

        const mailOptions = {
          from: `"${process.env.SENDER_NAME || 'LocHotel'}" <${process.env.SENDER_EMAIL || process.env.SMTP_USER}>`,
          to: email,
          replyTo: process.env.REPLY_TO_EMAIL,
          subject: `Order Confirmation - #${order.order_id}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
              <div style="background: linear-gradient(135deg, #d4af37 0%, #a57d28 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1 style="color: white; margin: 0; font-size: 28px;">${process.env.COMPANY_NAME || 'LocHotel'}</h1>
              </div>
              <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                <h2 style="color: #333; margin-top: 0;">Order Confirmation</h2>
                <p style="color: #666; font-size: 16px;">Hello ${order.guest_name || 'Guest'},</p>
                <p style="color: #666; font-size: 16px;">Thank you for your order! We have received your order and it's being processed.</p>

                <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <h3 style="color: #d4af37; margin-top: 0; font-size: 18px;">Order Details</h3>
                  <p style="color: #666; margin: 5px 0;"><strong>Order ID:</strong> #${order.order_id}</p>
                  <p style="color: #666; margin: 5px 0;"><strong>Location:</strong> ${order.room_number ? `Room ${order.room_number}` : `Table ${order.table_number}`}</p>
                  <p style="color: #666; margin: 5px 0;"><strong>Order Date:</strong> ${new Date(order.created_at).toLocaleString()}</p>
                </div>

                <div style="margin: 20px 0;">
                  <h3 style="color: #d4af37; margin-top: 0; font-size: 18px;">Order Items</h3>
                  <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                      <tr style="background: #d4af37; color: white;">
                        <th style="padding: 10px; text-align: left;">Item</th>
                        <th style="padding: 10px; text-align: center;">Qty</th>
                        <th style="padding: 10px; text-align: right;">Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${itemsList}
                    </tbody>
                  </table>
                </div>

                <div style="text-align: right; margin: 20px 0; font-size: 18px; font-weight: bold; color: #d4af37;">
                  Total: $${parseFloat(order.total_price).toFixed(2)}
                </div>

                <p style="color: #666; font-size: 14px;">If you have any questions about your order, please contact our front desk.</p>

                <p style="color: #666; font-size: 16px;">Best regards,<br>${process.env.COMPANY_NAME || 'LocHotel'} Team</p>
              </div>
              <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
                <p>This is an automated email. Please do not reply directly.</p>
              </div>
            </div>
          `
        };

        await transporter.sendMail(mailOptions);
        console.log(`Order confirmation email sent to ${email} for order #${order.order_id}`);
        return true;
      } catch (error) {
        lastError = error;
        console.error(`=== ORDER CONFIRMATION EMAIL ERROR (Attempt ${attempt}/${maxRetries}) ===`);
        console.error('Error:', error);

        if (attempt < maxRetries) {
          const waitTime = Math.pow(2, attempt) * 1000;
          console.log(`Retrying in ${waitTime / 1000} seconds...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }
      }
    }

    // All retries failed - Alert admin
    console.error('========================================');
    console.error('⚠️  ADMIN ALERT: EMAIL SENDING FAILED AFTER 3 RETRIES ⚠️');
    console.error('========================================');
    console.error('Email Type: Order Confirmation');
    console.error('Recipient:', email);
    console.error('Order ID:', order.order_id);
    console.error('Final Error:', lastError.message);
    console.error('Error Code:', lastError.code);
    console.error('Timestamp:', new Date().toISOString());
    console.error('========================================');
    console.error('ACTION REQUIRED: Check SMTP configuration and email service');
    console.error('========================================');
    return false;
  },

  async sendNotificationEmail(email, notification, maxRetries = 3) {
    if (!transporter) {
      console.log('=== EMAIL SENDING DISABLED - SMTP NOT CONFIGURED ===');
      console.log('Notification would be sent to:', email);
      return false;
    }

    if (!email) {
      console.log('No email provided for notification');
      return false;
    }

    let lastError;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`=== SENDING NOTIFICATION EMAIL (Attempt ${attempt}/${maxRetries}) ===`);
        console.log('To:', email);
        console.log('From:', process.env.SENDER_EMAIL || process.env.SMTP_USER);
        console.log('Notification ID:', notification.notification_id);

        const mailOptions = {
          from: `"${process.env.SENDER_NAME || 'LocHotel'}" <${process.env.SENDER_EMAIL || process.env.SMTP_USER}>`,
          to: email,
          replyTo: process.env.REPLY_TO_EMAIL,
          subject: notification.type ? `Notification: ${notification.type.replace(/_/g, ' ').toUpperCase()}` : 'Hotel Notification',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
              <div style="background: linear-gradient(135deg, #d4af37 0%, #a57d28 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1 style="color: white; margin: 0; font-size: 28px;">${process.env.COMPANY_NAME || 'LocHotel'}</h1>
              </div>
              <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                <h2 style="color: #333; margin-top: 0;">Notification</h2>
                <p style="color: #666; font-size: 16px;">Dear Guest,</p>
                <p style="color: #666; font-size: 16px;">${notification.message}</p>

                ${notification.order_id ? `
                <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <h3 style="color: #d4af37; margin-top: 0; font-size: 18px;">Order Information</h3>
                  <p style="color: #666; margin: 5px 0;"><strong>Order ID:</strong> #${notification.order_id}</p>
                </div>
                ` : ''}

                <p style="color: #666; font-size: 14px;">If you have any questions, please contact our front desk.</p>

                <p style="color: #666; font-size: 16px;">Best regards,<br>${process.env.COMPANY_NAME || 'LocHotel'} Team</p>
              </div>
              <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
                <p>This is an automated email. Please do not reply directly.</p>
              </div>
            </div>
          `
        };

        await transporter.sendMail(mailOptions);
        console.log(`Notification email sent to ${email}`);
        return true;
      } catch (error) {
        lastError = error;
        console.error(`=== NOTIFICATION EMAIL ERROR (Attempt ${attempt}/${maxRetries}) ===`);
        console.error('Error:', error);

        if (attempt < maxRetries) {
          const waitTime = Math.pow(2, attempt) * 1000;
          console.log(`Retrying in ${waitTime / 1000} seconds...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }
      }
    }

    // All retries failed - Alert admin
    console.error('========================================');
    console.error('⚠️  ADMIN ALERT: EMAIL SENDING FAILED AFTER 3 RETRIES ⚠️');
    console.error('========================================');
    console.error('Email Type: Notification Email');
    console.error('Recipient:', email);
    console.error('Notification ID:', notification.notification_id);
    console.error('Notification Type:', notification.type);
    console.error('Final Error:', lastError.message);
    console.error('Error Code:', lastError.code);
    console.error('Timestamp:', new Date().toISOString());
    console.error('========================================');
    console.error('ACTION REQUIRED: Check SMTP configuration and email service');
    console.error('========================================');
    return false;
  },

  async sendPaymentSuccessEmail(email, payment, order, maxRetries = 3) {
    if (!transporter) {
      console.log('=== EMAIL SENDING DISABLED - SMTP NOT CONFIGURED ===');
      console.log('Payment success email would be sent to:', email);
      return false;
    }

    if (!email) {
      console.log('No email provided for payment success');
      return false;
    }

    let lastError;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`=== SENDING PAYMENT SUCCESS EMAIL (Attempt ${attempt}/${maxRetries}) ===`);
        console.log('To:', email);
        console.log('Payment ID:', payment.payment_id);

        const mailOptions = {
          from: `"${process.env.SENDER_NAME || 'LocHotel'}" <${process.env.SENDER_EMAIL || process.env.SMTP_USER}>`,
          to: email,
          replyTo: process.env.REPLY_TO_EMAIL,
          subject: `Payment Successful - Order #${order.order_id}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
              <div style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1 style="color: white; margin: 0; font-size: 28px;">${process.env.COMPANY_NAME || 'LocHotel'}</h1>
              </div>
              <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                <h2 style="color: #28a745; margin-top: 0;">Payment Successful!</h2>
                <p style="color: #666; font-size: 16px;">Hello ${order.guest_name || 'Guest'},</p>
                <p style="color: #666; font-size: 16px;">Your payment has been successfully processed. Your order is now being prepared.</p>

                <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <h3 style="color: #28a745; margin-top: 0; font-size: 18px;">Payment Details</h3>
                  <p style="color: #666; margin: 5px 0;"><strong>Order ID:</strong> #${order.order_id}</p>
                  <p style="color: #666; margin: 5px 0;"><strong>Amount:</strong> ETB ${payment.amount.toFixed(2)}</p>
                  <p style="color: #666; margin: 5px 0;"><strong>Payment Method:</strong> ${payment.payment_method}</p>
                  <p style="color: #666; margin: 5px 0;"><strong>Transaction Reference:</strong> ${payment.transaction_reference || payment.chapa_tx_ref}</p>
                </div>

                <p style="color: #666; font-size: 14px;">If you have any questions, please contact our front desk.</p>

                <p style="color: #666; font-size: 16px;">Best regards,<br>${process.env.COMPANY_NAME || 'LocHotel'} Team</p>
              </div>
              <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
                <p>This is an automated email. Please do not reply directly.</p>
              </div>
            </div>
          `
        };

        await transporter.sendMail(mailOptions);
        console.log(`Payment success email sent to ${email}`);
        return true;
      } catch (error) {
        lastError = error;
        console.error(`=== PAYMENT SUCCESS EMAIL ERROR (Attempt ${attempt}/${maxRetries}) ===`);
        console.error('Error:', error);

        if (attempt < maxRetries) {
          const waitTime = Math.pow(2, attempt) * 1000;
          console.log(`Retrying in ${waitTime / 1000} seconds...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }
      }
    }

    // All retries failed - Alert admin
    console.error('========================================');
    console.error('⚠️  ADMIN ALERT: EMAIL SENDING FAILED AFTER 3 RETRIES ⚠️');
    console.error('========================================');
    console.error('Email Type: Payment Success Email');
    console.error('Recipient:', email);
    console.error('Payment ID:', payment.payment_id);
    console.error('Order ID:', order.order_id);
    console.error('Final Error:', lastError.message);
    console.error('Error Code:', lastError.code);
    console.error('Timestamp:', new Date().toISOString());
    console.error('========================================');
    console.error('ACTION REQUIRED: Check SMTP configuration and email service');
    console.error('========================================');
    return false;
  },

  async sendPaymentFailedEmail(email, payment, order, maxRetries = 3) {
    if (!transporter) {
      console.log('=== EMAIL SENDING DISABLED - SMTP NOT CONFIGURED ===');
      console.log('Payment failed email would be sent to:', email);
      return false;
    }

    if (!email) {
      console.log('No email provided for payment failed');
      return false;
    }

    let lastError;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`=== SENDING PAYMENT FAILED EMAIL (Attempt ${attempt}/${maxRetries}) ===`);
        console.log('To:', email);
        console.log('Payment ID:', payment.payment_id);

        const mailOptions = {
          from: `"${process.env.SENDER_NAME || 'LocHotel'}" <${process.env.SENDER_EMAIL || process.env.SMTP_USER}>`,
          to: email,
          replyTo: process.env.REPLY_TO_EMAIL,
          subject: `Payment Failed - Order #${order.order_id}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
              <div style="background: linear-gradient(135deg, #dc3545 0%, #c82333 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1 style="color: white; margin: 0; font-size: 28px;">${process.env.COMPANY_NAME || 'LocHotel'}</h1>
              </div>
              <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                <h2 style="color: #dc3545; margin-top: 0;">Payment Failed</h2>
                <p style="color: #666; font-size: 16px;">Hello ${order.guest_name || 'Guest'},</p>
                <p style="color: #666; font-size: 16px;">We're sorry, but your payment could not be processed. Please try again or contact our front desk for assistance.</p>

                <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <h3 style="color: #dc3545; margin-top: 0; font-size: 18px;">Payment Details</h3>
                  <p style="color: #666; margin: 5px 0;"><strong>Order ID:</strong> #${order.order_id}</p>
                  <p style="color: #666; margin: 5px 0;"><strong>Amount:</strong> ETB ${payment.amount.toFixed(2)}</p>
                  <p style="color: #666; margin: 5px 0;"><strong>Payment Method:</strong> ${payment.payment_method}</p>
                  <p style="color: #666; margin: 5px 0;"><strong>Transaction Reference:</strong> ${payment.transaction_reference || payment.chapa_tx_ref}</p>
                </div>

                <p style="color: #666; font-size: 14px;">If you have any questions, please contact our front desk.</p>

                <p style="color: #666; font-size: 16px;">Best regards,<br>${process.env.COMPANY_NAME || 'LocHotel'} Team</p>
              </div>
              <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
                <p>This is an automated email. Please do not reply directly.</p>
              </div>
            </div>
          `
        };

        await transporter.sendMail(mailOptions);
        console.log(`Payment failed email sent to ${email}`);
        return true;
      } catch (error) {
        lastError = error;
        console.error(`=== PAYMENT FAILED EMAIL ERROR (Attempt ${attempt}/${maxRetries}) ===`);
        console.error('Error:', error);

        if (attempt < maxRetries) {
          const waitTime = Math.pow(2, attempt) * 1000;
          console.log(`Retrying in ${waitTime / 1000} seconds...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }
      }
    }

    // All retries failed - Alert admin
    console.error('========================================');
    console.error('⚠️  ADMIN ALERT: EMAIL SENDING FAILED AFTER 3 RETRIES ⚠️');
    console.error('========================================');
    console.error('Email Type: Payment Failed Email');
    console.error('Recipient:', email);
    console.error('Payment ID:', payment.payment_id);
    console.error('Order ID:', order.order_id);
    console.error('Final Error:', lastError.message);
    console.error('Error Code:', lastError.code);
    console.error('Timestamp:', new Date().toISOString());
    console.error('========================================');
    console.error('ACTION REQUIRED: Check SMTP configuration and email service');
    console.error('========================================');
    return false;
  },

  async sendKitchenNotificationEmail(order, maxRetries = 3) {
    if (!transporter) {
      console.log('=== EMAIL SENDING DISABLED - SMTP NOT CONFIGURED ===');
      console.log('Kitchen notification would be sent for order:', order.order_id);
      return false;
    }

    const kitchenEmail = process.env.KITCHEN_EMAIL || 'kitchen@lochotel.com';
    if (!kitchenEmail) {
      console.log('No kitchen email configured');
      return false;
    }

    let lastError;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`=== SENDING KITCHEN NOTIFICATION EMAIL (Attempt ${attempt}/${maxRetries}) ===`);
        console.log('Order ID:', order.order_id);

        const mailOptions = {
          from: `"${process.env.SENDER_NAME || 'LocHotel'}" <${process.env.SENDER_EMAIL || process.env.SMTP_USER}>`,
          to: kitchenEmail,
          replyTo: process.env.REPLY_TO_EMAIL,
          subject: `New Order - #${order.order_id}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
              <div style="background: linear-gradient(135deg, #d4af37 0%, #a57d28 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 10px 10px 0 0;">
                <h1 style="color: white; margin: 0; font-size: 28px;">${process.env.COMPANY_NAME || 'LocHotel'} Kitchen</h1>
              </div>
              <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                <h2 style="color: #333; margin-top: 0;">New Order Received</h2>

                <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <h3 style="color: #d4af37; margin-top: 0; font-size: 18px;">Order Details</h3>
                  <p style="color: #666; margin: 5px 0;"><strong>Order ID:</strong> #${order.order_id}</p>
                  <p style="color: #666; margin: 5px 0;"><strong>Guest:</strong> ${order.guest_name || 'Guest'}</p>
                  <p style="color: #666; margin: 5px 0;"><strong>Location:</strong> ${order.room_number ? `Room ${order.room_number}` : `Table ${order.table_number}`}</p>
                  <p style="color: #666; margin: 5px 0;"><strong>Total:</strong> ETB ${order.total_price.toFixed(2)}</p>
                </div>

                <p style="color: #666; font-size: 14px;">Please start preparing this order immediately.</p>

                <p style="color: #666; font-size: 16px;">Best regards,<br>${process.env.COMPANY_NAME || 'LocHotel'} System</p>
              </div>
              <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
                <p>This is an automated email. Please do not reply directly.</p>
              </div>
            </div>
          `
        };

        await transporter.sendMail(mailOptions);
        console.log(`Kitchen notification email sent for order #${order.order_id}`);
        return true;
      } catch (error) {
        lastError = error;
        console.error(`=== KITCHEN NOTIFICATION EMAIL ERROR (Attempt ${attempt}/${maxRetries}) ===`);
        console.error('Error:', error);

        if (attempt < maxRetries) {
          const waitTime = Math.pow(2, attempt) * 1000;
          console.log(`Retrying in ${waitTime / 1000} seconds...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }
      }
    }

    // All retries failed - Alert admin
    console.error('========================================');
    console.error('⚠️  ADMIN ALERT: EMAIL SENDING FAILED AFTER 3 RETRIES ⚠️');
    console.error('========================================');
    console.error('Email Type: Kitchen Notification Email');
    console.error('Recipient:', kitchenEmail);
    console.error('Order ID:', order.order_id);
    console.error('Final Error:', lastError.message);
    console.error('Error Code:', lastError.code);
    console.error('Timestamp:', new Date().toISOString());
    console.error('========================================');
    console.error('ACTION REQUIRED: Check SMTP configuration and email service');
    console.error('========================================');
    return false;
  }
};

export const generateRandomPassword = (length: number = 12): string => {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
};
