import { Hono } from "hono";
import { z } from "zod";
import { resend } from "../lib/resend.js";

const enquirySchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().optional(),
  date: z.string().optional(),
  location: z.string().optional(),
  events: z.array(z.string()).optional(),
  message: z.string().optional(),
});

const enquiry = new Hono();

enquiry.post("/", async (c) => {
  const body = await c.req.json();
  const parsed = enquirySchema.safeParse(body);

  if (!parsed.success) {
    return c.json(
      { success: false, errors: parsed.error.flatten().fieldErrors },
      400
    );
  }

  const dto = parsed.data;
  const eventsList = dto.events?.length ? dto.events.join(", ") : "Not specified";

  try {
    const result = await resend.emails.send({
      from: "Wedding Documentary Events <onboarding@resend.dev>",
      to: process.env.NOTIFY_EMAIL!,
      replyTo: dto.email,
      subject: `New Enquiry — ${dto.name}`,
      html: `
        <h2>New enquiry from the website</h2>
        <p><strong>Name:</strong> ${dto.name}</p>
        <p><strong>Email:</strong> ${dto.email}</p>
        <p><strong>Phone:</strong> ${dto.phone || "Not provided"}</p>
        <p><strong>Event Date:</strong> ${dto.date || "Not provided"}</p>
        <p><strong>Venue / City:</strong> ${dto.location || "Not provided"}</p>
        <p><strong>Type of Event:</strong> ${eventsList}</p>
        <p><strong>Message:</strong></p>
        <p>${dto.message || "No message provided"}</p>
      `,
    });

    if (result.error) {
      console.error("Resend error:", result.error);
      return c.json({ success: false, message: "Failed to send email" }, 502);
    }

    return c.json({ success: true });
  } catch (err) {
    console.error("Enquiry send failed:", err);
    return c.json({ success: false, message: "Something went wrong" }, 500);
  }
});

export default enquiry;