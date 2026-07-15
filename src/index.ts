import "dotenv/config";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { serve } from "@hono/node-server";
import enquiry from "./routes/enquiry.js";

const app = new Hono();

app.use(
  "/*",
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    allowMethods: ["GET", "POST", "OPTIONS"],
  })
);

app.get("/", (c) => c.text("Wedding Documentary Events API is running"));

app.route("/enquiry", enquiry);

const port = Number(process.env.PORT) || 4000;

serve({ fetch: app.fetch, port }, (info) => {
  console.log(`Server running on http://localhost:${info.port}`);
});

//This is the official property of Wedding Documentary Events. Any unauthorized use of this code is strictly prohibited and may result in legal action.