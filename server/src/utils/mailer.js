import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

let transporter = null;
try {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || "587", 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    console.warn("[MAILER] SMTP configuration missing. Email features will be disabled. Check SMTP_HOST, SMTP_USER, SMTP_PASS.");
  }

  transporter = nodemailer.createTransport({
    host: host,
    port: port,
    secure: (process.env.SMTP_SECURE || "false").toLowerCase() === "true",
    auth: user && pass ? { user, pass } : undefined
  });
  console.log("[MAILER] Transporter initialized with host:", host);
} catch (e) {
  console.error("[MAILER] Failed to initialize transporter:", e.message);
  transporter = null;
}

export async function sendMail({ to, subject, html, text }) {
  if (!transporter || !to) {
    console.warn("[MAILER] Skipped sending email (transporter or recipient missing):", { to, subject, hasTransporter: !!transporter });
    return { success: false, info: null };
  }
  
  let from = process.env.SMTP_USER;
  if (process.env.FROM_EMAIL) {
     from = process.env.FROM_EMAIL;
  }
  
  if (!from) {
    console.error("[MAILER] Error: No 'from' address configured. Set FROM_EMAIL or SMTP_USER.");
    return { success: false, info: null, error: new Error("No sender address configured") };
  }

  // Add display name if not present and using SMTP_USER
  if (from === process.env.SMTP_USER && from.indexOf("<") === -1) {
    from = `"Order Portal" <${from}>`;
  }

  try {
    const info = await transporter.sendMail({
      from,
      to,
      subject,
      text,
      html
    });
    console.log("[MAILER] Email sent successfully to:", to);
    return { success: true, info };
  } catch (err) {
    console.error("[MAILER] Error sending email to:", to, err.message);
    return { success: false, info: null, error: err };
  }
}
