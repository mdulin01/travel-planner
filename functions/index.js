const { setGlobalOptions } = require("firebase-functions");
const { onSchedule } = require("firebase-functions/v2/scheduler");
const { onRequest } = require("firebase-functions/v2/https");
const { getFirestore } = require("firebase-admin/firestore");
const { getMessaging } = require("firebase-admin/messaging");
const { initializeApp } = require("firebase-admin/app");
const logger = require("firebase-functions/logger");

initializeApp();
setGlobalOptions({ maxInstances: 10, region: "us-central1" });

const db = getFirestore();

// ── Helper: format a date nicely ──
function fmtDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

// ── Helper: get the Monday–Sunday window for "this week" ──
function getWeekWindow() {
  const now = new Date();
  const day = now.getDay(); // 0=Sun
  const mon = new Date(now);
  mon.setDate(now.getDate() - ((day + 6) % 7));
  mon.setHours(0, 0, 0, 0);
  const sun = new Date(mon);
  sun.setDate(mon.getDate() + 6);
  sun.setHours(23, 59, 59, 999);
  return { start: mon, end: sun };
}

// ── Build the weekly summary text ──
function buildSummary(hub) {
  const { start, end } = getWeekWindow();
  const startStr = start.toISOString().slice(0, 10);
  const endStr = end.toISOString().slice(0, 10);
  const today = new Date().toISOString().slice(0, 10);

  const now = new Date();
  const dateLabel = now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  const lines = [];
  lines.push("Mike & Adam");
  lines.push(dateLabel);
  lines.push("");

  // ── TASKS ──
  const tasks = (hub.tasks || []).filter((t) => t.status !== "done");
  const weekTasks = tasks.filter((t) => {
    if (t.dueDate && t.dueDate >= startStr && t.dueDate <= endStr) return true;
    if (["today", "this-week"].includes(t.timeHorizon)) return true;
    if (t.dueDate && t.dueDate <= today) return true; // overdue
    return false;
  });

  if (weekTasks.length > 0) {
    const priorityOrder = { high: 0, urgent: 0, medium: 1, low: 2 };
    weekTasks.sort((a, b) => (priorityOrder[a.priority] ?? 2) - (priorityOrder[b.priority] ?? 2));

    lines.push("🔥 Weekly Tasks:");
    weekTasks.forEach((t) => {
      const flag = t.priority === "high" ? "🔴" : t.priority === "medium" ? "🟡" : "⚪";
      const due = t.dueDate ? ` (${fmtDate(t.dueDate)})` : "";
      const who = t.assignedTo === "both" ? "" : ` [${t.assignedTo}]`;
      lines.push(`${flag} ${t.title}${due}${who}`);
    });
    lines.push("");
  } else {
    lines.push("✅ No tasks due this week!");
    lines.push("");
  }

  // ── LISTS ──
  const activeLists = (hub.lists || []).filter((l) => l.status === "active");
  const listsWithPending = activeLists.filter((l) =>
    (l.items || []).some((i) => !i.checked)
  );

  if (listsWithPending.length > 0) {
    lines.push("📝 Active Lists:");
    listsWithPending.slice(0, 5).forEach((l) => {
      const catEmojis = { shopping: "🛒", packing: "🧳", todo: "✅", groceries: "🛒", custom: "📋" };
      const emoji = (l.emoji && l.emoji !== "undefined") ? l.emoji : (catEmojis[l.category] || "📌");
      const title = l.name || l.title || "Untitled List";
      lines.push(`• ${emoji} ${title}`);
    });
    if (listsWithPending.length > 5) {
      lines.push(`  ...and ${listsWithPending.length - 5} more`);
    }
    lines.push("");
  }

  // ── HABITS ──
  const activeHabits = (hub.habits || []).filter((h) => h.status === "active");
  if (activeHabits.length > 0) {
    lines.push("💪 Habits:");
    activeHabits.forEach((h) => {
      const log = h.log || {};
      let weekCheckins = 0;
      const cursor = new Date(start);
      while (cursor <= end) {
        const key = cursor.toISOString().slice(0, 10);
        if (log[key]) weekCheckins++;
        cursor.setDate(cursor.getDate() + 1);
      }
      let expected = 7;
      if (h.frequency === "weekdays") expected = 5;
      else if (h.frequency === "weekends") expected = 2;
      else if (h.frequency === "weekly") expected = 1;
      else if (h.frequency === "custom") expected = (h.customDays || []).length;

      const pct = expected > 0 ? Math.round((weekCheckins / expected) * 100) : 0;
      const bar = pct >= 80 ? "🟢" : pct >= 50 ? "🟡" : "🔴";
      lines.push(`${bar} ${h.emoji || "🔄"} ${h.name} — ${weekCheckins}/${expected} (${pct}%)`);
    });
    lines.push("");
  }

  // ── LINK ──
  lines.push("🔗 Open Hub: https://trip-planner-5cc84.web.app");

  return lines.join("\n");
}

// ── Build a short title for the push notification ──
function buildTitle(hub) {
  const tasks = (hub.tasks || []).filter((t) => t.status !== "done");
  const lists = (hub.lists || []).filter((l) => l.status === "active" && (l.items || []).some((i) => !i.checked));
  return `📋 ${tasks.length} tasks, ${lists.length} lists this week`;
}

// ── Send push notification via FCM ──
async function sendPushNotifications(title, body) {
  const tokensDoc = await db.collection("tripData").doc("fcmTokens").get();

  if (!tokensDoc.exists) {
    logger.warn("No FCM tokens found. Users need to enable notifications in the app.");
    return { sent: 0, failed: 0 };
  }

  const tokens = tokensDoc.data();
  const tokenList = Object.entries(tokens); // [['mike', 'token...'], ['adam', 'token...']]

  if (tokenList.length === 0) {
    logger.warn("No FCM tokens registered.");
    return { sent: 0, failed: 0 };
  }

  let sent = 0;
  let failed = 0;
  const messaging = getMessaging();

  for (const [user, token] of tokenList) {
    try {
      await messaging.send({
        token,
        notification: { title, body },
        data: { url: "https://trip-planner-5cc84.web.app" },
        webpush: {
          notification: {
            icon: "https://trip-planner-5cc84.web.app/icon-192.png",
            badge: "https://trip-planner-5cc84.web.app/icon-192.png",
            vibrate: [200, 100, 200],
          },
        },
      });
      logger.info(`Push sent to ${user}`);
      sent++;
    } catch (error) {
      logger.error(`Push failed for ${user}:`, error.message);
      // If token is invalid, remove it
      if (error.code === "messaging/registration-token-not-registered" ||
          error.code === "messaging/invalid-registration-token") {
        logger.info(`Removing stale token for ${user}`);
        const { FieldValue } = require("firebase-admin/firestore");
        await db.collection("tripData").doc("fcmTokens").update({
          [user]: FieldValue.delete(),
        });
      }
      failed++;
    }
  }

  return { sent, failed };
}

// ═══════════════════════════════════════════════
// Scheduled Function: Weekly Summary Push Notification
// Runs every Sunday at 6:00 PM Central Time
// ═══════════════════════════════════════════════
exports.weeklySummary = onSchedule(
  {
    schedule: "every sunday 18:00",
    timeZone: "America/Chicago",
    retryCount: 1,
  },
  async (event) => {
    logger.info("Running weekly summary...");

    try {
      const hubDoc = await db.collection("tripData").doc("sharedHub").get();

      if (!hubDoc.exists) {
        logger.warn("No sharedHub document found.");
        return;
      }

      const hub = hubDoc.data();
      const summary = buildSummary(hub);
      const title = buildTitle(hub);
      logger.info("Summary built", { length: summary.length });

      const result = await sendPushNotifications(title, summary);
      logger.info(`Weekly summary complete: ${result.sent} sent, ${result.failed} failed.`);
    } catch (error) {
      logger.error("Error sending weekly summary:", error);
      throw error;
    }
  }
);

// ═══════════════════════════════════════════════
// HTTP Function: Test the summary (for debugging)
// GET /testSummary — returns the notification text without sending
// ═══════════════════════════════════════════════
exports.testSummary = onRequest(async (req, res) => {
  try {
    const hubDoc = await db.collection("tripData").doc("sharedHub").get();
    if (!hubDoc.exists) {
      res.status(404).send("No sharedHub data found.");
      return;
    }
    const summary = buildSummary(hubDoc.data());
    res.set("Content-Type", "text/plain");
    res.send(summary);
  } catch (error) {
    logger.error("Error in testSummary:", error);
    res.status(500).send("Error: " + error.message);
  }
});

// ═══════════════════════════════════════════════
// HTTP Function: Send a test push notification
// GET /sendTest — builds summary and sends push
// ═══════════════════════════════════════════════
exports.sendTest = onRequest(async (req, res) => {
  try {
    const hubDoc = await db.collection("tripData").doc("sharedHub").get();
    if (!hubDoc.exists) {
      res.status(404).send("No sharedHub data found.");
      return;
    }
    const hub = hubDoc.data();
    const summary = buildSummary(hub);
    const title = buildTitle(hub);
    const result = await sendPushNotifications(title, summary);
    res.send(`Push notifications sent! ${result.sent} succeeded, ${result.failed} failed.`);
  } catch (error) {
    logger.error("Error in sendTest:", error);
    res.status(500).send("Error: " + error.message);
  }
});
