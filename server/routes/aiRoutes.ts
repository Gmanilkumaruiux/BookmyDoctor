import express from "express";
import {
  searchDoctors,
  getRecommendationHistory,
  recommendSlot,
  predictWaitTime,
  generateReminders,
  getReminders,
  updateReminder,
  logReminderAction,
  getReminderLogs
} from "../controllers/aiController";

const router = express.Router();

router.post("/search", searchDoctors);
router.get("/recommendations", getRecommendationHistory);
router.post("/scheduler", recommendSlot);
router.post("/wait-time", predictWaitTime);
router.post("/reminders/generate", generateReminders);
router.get("/reminders", getReminders);
router.put("/reminders/:id", updateReminder);
router.post("/reminders/log", logReminderAction);
router.get("/reminders/logs", getReminderLogs);

export default router;
