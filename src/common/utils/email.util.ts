import nodemailer, { Transporter } from "nodemailer";
import { ConfigService } from "@nestjs/config";
import { Injectable } from "@nestjs/common";

@Injectable()
export class EmailService {
  private transporter: Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: this.configService.get<string>("EMAIL_USER"),
        pass: this.configService.get<string>("EMAIL_PASSWORD")
      },
    });
  }

  async sendPassresetLink(
    email: string,
    passresetlink: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    const projectName = this.configService.get<string>("PROJECT_NAME");

    await this.transporter.sendMail({
      from: `"${projectName}" <${this.configService.get<string>("EMAIL_USER")}>`,
      to: email,
      subject: `${projectName} - Password Reset`,
      text: `Your Password Reset link is ${passresetlink}. It expires in 10 minutes. IP: ${ipAddress}, Device: ${userAgent}`,
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>

<body style="margin:0; padding:0; font-family:Arial, sans-serif;">

  <div style="max-width:600px; margin:40px auto; border-radius:16px; overflow:hidden; box-shadow:0 10px 25px rgba(0,0,0,0.1);">

    <!-- Header -->
    <div style="background:#4f46e5; padding:28px; text-align:center;">
      <h1 style="margin:0; color:#ffffff; font-size:22px;">
        ${projectName}
      </h1>
      <p style="margin:6px 0 0; color:#c7d2fe; font-size:13px;">
        Password Reset Verification
      </p>
    </div>

    <!-- Body -->
    <div style="padding:30px; text-align:center; background:#ffffff;">

      <h2 style="color:#111827; margin-bottom:10px;">
        Verify Password Reset
      </h2>

      <p style="color:#6b7280; font-size:14px; line-height:1.5;">
        We received a Password Reset request for your account. Click the button below to continue securely.
      </p>

      <!-- Button -->
      <a href="${passresetlink}"
         style="display:inline-block; margin:24px 0; padding:12px 26px; background:#4f46e5; color:#ffffff; text-decoration:none; border-radius:8px; font-weight:600;">
        Verify Request
      </a>

      <p style="color:#ef4444; font-size:12px; font-weight:600;">
        This link expires in 10 minutes
      </p>

      <!-- Security Info -->
      <div style="margin-top:24px; text-align:left; background:#f9fafb; padding:14px; border-radius:8px; font-size:12px; color:#374151;">
        <p style="margin:0 0 6px;"><strong>Security Details</strong></p>
        <p style="margin:0;">IP Address: ${ipAddress || "N/A"}</p>
        <p style="margin:0;">Device: ${userAgent || "N/A"}</p>
      </div>

    </div>

    <!-- Footer -->
    <div style="background:#f3f4f6; text-align:center; padding:14px; font-size:12px; color:#6b7280;">
      © ${new Date().getFullYear()} ${projectName} • Secure Authentication System
    </div>

  </div>

</body>
</html>
`,
    });
  }

  async NotificationEmail(
    email: string,
    notification: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    const projectName = this.configService.get<string>("PROJECT_NAME");

    await this.transporter.sendMail({
      from: `"${projectName}" <${this.configService.get<string>("EMAIL_USER")}>`,
      to: email,
      subject: `${projectName} - System Notification`,
      text: `${projectName}: ${notification}. IP: ${ipAddress}, Device: ${userAgent}`,
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0; padding:0; background:#0f172a; font-family:Arial, sans-serif;">

  <div style="max-width:600px; margin:40px auto; background:#ffffff; border-radius:16px; overflow:hidden; box-shadow:0 10px 30px rgba(0,0,0,0.2);">

    <!-- Header -->
    <div style="background:linear-gradient(135deg,#10b981,#06b6d4); padding:30px; text-align:center;">
      <h1 style="margin:0; color:white; font-size:22px; letter-spacing:1px;">
        ${projectName}
      </h1>
      <p style="margin:8px 0 0; color:#d1fae5; font-size:14px;">
        System Notification
      </p>
    </div>

    <!-- Body -->
    <div style="padding:30px; text-align:center;">

      <div style="display:inline-block; padding:8px 14px; background:#ecfdf5; color:#10b981; border-radius:999px; font-size:12px; font-weight:600; margin-bottom:15px;">
        New Update
      </div>

      <h2 style="color:#111827; margin-bottom:10px;">
        Notification
      </h2>

      <p style="color:#6b7280; font-size:14px; line-height:1.5;">
        You have received a system update from <strong>${projectName}</strong>.
      </p>

      <!-- Notification Card -->
      <div style="margin:25px 0; padding:18px; background:#f0fdf4; border-left:4px solid #10b981; border-radius:10px; text-align:left;">
        <p style="margin:0; font-size:15px; color:#065f46; font-weight:600;">
          ${notification}
        </p>
      </div>

      <!-- Info Box -->
      <div style="margin-top:20px; text-align:left; background:#f9fafb; padding:15px; border-radius:10px; font-size:12px; color:#374151;">
        <p style="margin:0 0 6px;"><strong>Request Details</strong></p>
        <p style="margin:0;">IP Address: ${ipAddress || "N/A"}</p>
        <p style="margin:0;">Device: ${userAgent || "N/A"}</p>
      </div>

    </div>

    <!-- Footer -->
    <div style="background:#f3f4f6; text-align:center; padding:15px; font-size:12px; color:#6b7280;">
      © ${new Date().getFullYear()} ${projectName} • System Notification Service
    </div>

  </div>

</body>
</html>
        `,
    });
  }
}

