import nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export const sendOtpEmail = async (to: string, otp: string) => {
  const mailOptions = {
    from: `"UrCheck Admin" <${process.env.SMTP_USER}>`,
    to,
    subject: 'Mã OTP khôi phục mật khẩu - UrCheck',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
        <h2 style="color: #f97316; text-align: center;">UrCheck</h2>
        <p style="font-size: 16px; color: #374151;">Xin chào,</p>
        <p style="font-size: 16px; color: #374151;">Bạn vừa yêu cầu khôi phục mật khẩu cho tài khoản quản trị hệ thống UrCheck.</p>
        <p style="font-size: 16px; color: #374151;">Dưới đây là mã xác thực (OTP) của bạn. Mã này có hiệu lực trong vòng <strong>5 phút</strong>:</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #1f2937; background-color: #f3f4f6; padding: 10px 20px; border-radius: 6px;">
            ${otp}
          </span>
        </div>

        <p style="font-size: 14px; color: #6b7280; border-top: 1px solid #e5e7eb; padding-top: 20px;">
          Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email này. Tài khoản của bạn vẫn an toàn.<br>
          Đây là email tự động, vui lòng không phản hồi.
        </p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};
