import { Router } from "express";

const router = Router();

type SupportTopic =
  | "account-access"
  | "membership-billing"
  | "job-posting"
  | "advertising"
  | "profile-support"
  | "report-a-problem"
  | "partnership";

type SupportRequest = {
  id: string;
  name: string;
  email: string;
  topic: SupportTopic;
  message: string;
  organization: string | null;
  createdAt: string;
  status: "new";
};

const supportInbox: SupportRequest[] = [];
const topics: Array<{ value: SupportTopic; label: string; responseWindow: string }> = [
  { value: "account-access", label: "Account access", responseWindow: "within 1 business day" },
  { value: "membership-billing", label: "Membership and billing", responseWindow: "within 1 business day" },
  { value: "job-posting", label: "Job posting help", responseWindow: "within 1 business day" },
  { value: "advertising", label: "Advertising support", responseWindow: "within 2 business days" },
  { value: "profile-support", label: "Profile support", responseWindow: "within 1 business day" },
  { value: "report-a-problem", label: "Report a problem", responseWindow: "same business day when possible" },
  { value: "partnership", label: "Partnership inquiry", responseWindow: "within 2 business days" },
];

router.get("/support/requests", (_req, res) => {
  res.json({
    total: supportInbox.length,
    newCount: supportInbox.filter((entry) => entry.status === "new").length,
    topics,
    requests: supportInbox,
  });
});

router.get("/support/meta", (_req, res) => {
  res.json({
    email: "support@matr.local",
    officeHours: "Monday to Friday, 9:00 AM to 5:00 PM Eastern",
    responsePromise: "Most requests receive a response within 1 business day.",
    topics,
  });
});

router.post("/support", (req, res): void => {
  const name = typeof req.body?.name === "string" ? req.body.name.trim() : "";
  const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
  const topic = typeof req.body?.topic === "string" ? req.body.topic.trim() as SupportTopic : "";
  const message = typeof req.body?.message === "string" ? req.body.message.trim() : "";
  const organizationRaw = typeof req.body?.organization === "string" ? req.body.organization.trim() : "";

  if (!name || !email || !topic || !message) {
    res.status(400).json({ error: "Name, email, topic, and message are required." });
    return;
  }

  if (!topics.some((entry) => entry.value === topic)) {
    res.status(400).json({ error: "Unknown support topic." });
    return;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    res.status(400).json({ error: "A valid email address is required." });
    return;
  }

  if (message.length < 20) {
    res.status(400).json({ error: "Please provide a little more detail so support can help." });
    return;
  }

  const request: SupportRequest = {
    id: `support-${Date.now()}`,
    name,
    email,
    topic,
    message,
    organization: organizationRaw || null,
    createdAt: new Date().toISOString(),
    status: "new",
  };

  supportInbox.unshift(request);
  supportInbox.splice(50);

  res.status(201).json({
    requestId: request.id,
    status: request.status,
    createdAt: request.createdAt,
    message: "Your request has been received. MATR support will follow up by email.",
  });
});

export default router;
