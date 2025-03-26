import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { Webhook } from "svix";
import { api } from "./_generated/api";
import { WebhookEvent } from "@clerk/nextjs/server";

const http = httpRouter();

http.route({
  path: "/clerk-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const webhookSecret = process.env.CLERK_WEBHOOK_SECRET!;
    if (!webhookSecret) {
      throw new Error("❌ Missing CLERK_WEBHOOK_SECRET environment variable");
    }

    // Extract Svix headers
    const svix_id = request.headers.get("svix-id");
    const svix_signature = request.headers.get("svix-signature");
    const svix_timestamp = request.headers.get("svix-timestamp");

    if (!svix_id || !svix_signature || !svix_timestamp) {
      return new Response("❌ Error: Missing Svix headers", { status: 400 });
    }

    // Get request body
    const payload = await request.json();
    const body = JSON.stringify(payload);

    // Verify webhook
    const wh = new Webhook(webhookSecret);
    let evt: WebhookEvent;
    try {
      evt = wh.verify(body, {
        "svix-id": svix_id,
        "svix-timestamp": svix_timestamp,
        "svix-signature": svix_signature,
      }) as WebhookEvent;
    } catch (err) {
      return new Response("❌ Error: Verification failed", { status: 400 });
    }

    const eventType = evt.type;
    if (eventType === "user.created" || eventType === "user.updated") {
      // Extract user details
      const { id, email_addresses, first_name, last_name, image_url } =
        evt.data;

      const email = email_addresses[0]?.email_address || "";
      const name = `${(first_name || "") + " " + (last_name || "")}`.trim();

      try {
        await ctx.runMutation(api.users.syncUser, {
          clerkId: id,
          email,
          name,
          isPro: false, // Default value
          avatar: image_url || undefined,
          currency: undefined, // Can be updated later
        });
      } catch (error) {
        return new Response("❌ Error syncing user", { status: 500 });
      }
    }

    return new Response("✅ Webhook processed successfully", { status: 200 });
  }),
});

export default http;
