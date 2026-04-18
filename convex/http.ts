import { httpRouter } from "convex/server";
import { httpActionGeneric as httpAction } from "convex/server";
import { Webhook } from "svix";
import { internal } from "./_generated/api";

const http = httpRouter();

type ClerkEmailAddress = {
  id: string;
  email_address: string;
};

type ClerkWebhookUser = {
  id: string;
  first_name?: string | null;
  last_name?: string | null;
  image_url?: string | null;
  primary_email_address_id?: string | null;
  email_addresses?: ClerkEmailAddress[];
};

http.route({
  path: "/clerk-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const secret = process.env.CLERK_WEBHOOK_SECRET;
    if (!secret) {
      return new Response("Webhook secret not configured", { status: 500 });
    }

    const svixId = request.headers.get("svix-id");
    const svixTimestamp = request.headers.get("svix-timestamp");
    const svixSignature = request.headers.get("svix-signature");

    if (!svixId || !svixTimestamp || !svixSignature) {
      return new Response("Missing svix headers", { status: 400 });
    }

    const body = await request.text();
    const wh = new Webhook(secret);

    let event: { type: string; data: Record<string, unknown> };
    try {
      event = wh.verify(body, {
        "svix-id": svixId,
        "svix-timestamp": svixTimestamp,
        "svix-signature": svixSignature,
      }) as typeof event;
    } catch {
      return new Response("Invalid signature", { status: 400 });
    }

    if (event.type === "user.created" || event.type === "user.updated") {
      const data = event.data as ClerkWebhookUser;
      const emails = data.email_addresses ?? [];
      const primaryEmail = emails.find((email) => email.id === data.primary_email_address_id);
      const email = primaryEmail?.email_address ?? emails[0]?.email_address;

      if (!email) {
        return new Response("Skipped webhook sync: no email address", { status: 200 });
      }

      await ctx.runMutation(internal.users.mutations.upsertUserFromWebhook, {
        clerkId: data.id,
        name: [data.first_name, data.last_name].filter(Boolean).join(" ") || "HB Marketing User",
        email,
        avatarUrl: data.image_url ?? undefined,
      });
    }

    if (event.type === "user.deleted") {
      const data = event.data as { id?: string | null };

      if (data.id) {
        await ctx.runMutation(internal.users.mutations.deactivateUserFromWebhook, {
          clerkId: data.id,
        });
      }
    }

    return new Response("OK", { status: 200 });
  }),
});

export default http;
