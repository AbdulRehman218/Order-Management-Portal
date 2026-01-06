import Query from "../models/Query.js";
import User from "../models/User.js";
import { sendMail } from "../utils/mailer.js";

async function checkQueryExpirations() {
  try {
    const now = new Date();
    // Check for queries expiring in the next 1 hour (or already expired)
    const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
    
    console.log(`[Scheduler] Checking for queries expiring before ${oneHourFromNow.toLocaleString()}...`);

    const expiring = await Query.find({
      expiresAt: { $ne: null, $lte: oneHourFromNow },
      notifiedExpire: { $ne: true }
    }).limit(50);

    if (expiring.length > 0) {
      console.log(`[Scheduler] Found ${expiring.length} queries to notify.`);
    }

    for (const q of expiring) {
      console.log(`[Scheduler] Processing query ${q._id}, expiresAt: ${q.expiresAt}`);
      const user = await User.findById(q.user).select("email name accounts");
      const acc =
        (user?.accounts || []).find(a => a?._id?.toString() === String(q.accountRef)) || null;
      const accountName = acc?.accountName || "";
      const to = user?.email || "";
      
      const isExpired = new Date(q.expiresAt) <= now;
      const statusText = isExpired ? "has expired" : "is expiring soon (within 1 hour)";
      
      const subject = `Query Update: ${q.orderId || q._id} ${statusText}`;
      const text = `Hello ${user?.name || ""},\n\nYour query ${statusText}.\n\nAccount Name: ${accountName || "N/A"}\nOrder ID: ${q.orderId || "-"}\nDetails: ${q.details || "-"}\nMessage: ${q.message || "-"}\nHandler: ${q.handlerName || "-"}\nExpires At: ${q.expiresAt ? new Date(q.expiresAt).toLocaleString() : "-"}\n\nRegards,\nOrder Portal`;
      const html = `
        <p>Hello ${user?.name || ""},</p>
        <p>Your query <b>${statusText}</b>.</p>
        <ul>
          <li><b>Account Name:</b> ${accountName || "N/A"}</li>
          <li><b>Order ID:</b> ${q.orderId || "-"}</li>
          <li><b>Details:</b> ${q.details || "-"}</li>
          <li><b>Message:</b> ${q.message || "-"}</li>
          <li><b>Handler:</b> ${q.handlerName || "-"}</li>
          <li><b>Expires At:</b> ${q.expiresAt ? new Date(q.expiresAt).toLocaleString() : "-"}</li>
        </ul>
        <p>Regards,<br/>Order Portal</p>
      `;
      const result = await sendMail({ to, subject, text, html });
      if (result.success) {
        q.notifiedExpire = true;
        await q.save();
        console.log(`[Scheduler] Sent expiry notification for query ${q._id}`);
      } else {
        console.log("[Scheduler] Email not sent, will retry later for query", q._id.toString());
      }
    }
  } catch (e) {
    console.error("[Scheduler] Query expiration check failed:", e.message);
  }
}

export const startScheduler = () => {
  // Run immediately on start
  checkQueryExpirations();
  // Then every 60 seconds
  setInterval(checkQueryExpirations, 60 * 1000);
  console.log("[Scheduler] Query expiration scheduler started.");
};
