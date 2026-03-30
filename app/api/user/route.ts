import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getAuthUser } from "@/lib/auth-helpers";

const BUSINESS_VERTICALS = ["jewellery", "gym", "ecommerce"] as const;

/** GET current user profile: name, email, business context (strategy prompts). */
export async function GET(req: Request) {
    try {
        const { userId, email, name: tokenName } = await getAuthUser(req);
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { data } = await supabaseAdmin
            .from("users")
            .select(
                "name, email, business_vertical, business_display_name, target_audience, primary_marketing_goal, content_tone, regions_or_markets, product_focus"
            )
            .eq("user_id", userId)
            .maybeSingle();

        const name =
            (data?.name && String(data.name).trim()) ||
            (tokenName && String(tokenName).trim()) ||
            "";

        return NextResponse.json({
            name,
            email: data?.email || email || "",
            businessVertical: data?.business_vertical ?? null,
            businessDisplayName: data?.business_display_name ?? "",
            targetAudience: data?.target_audience ?? "",
            primaryMarketingGoal: data?.primary_marketing_goal ?? "",
            contentTone: data?.content_tone ?? "",
            regionsOrMarkets: data?.regions_or_markets ?? "",
            productFocus: data?.product_focus ?? "",
        });
    } catch (error: any) {
        if (error.message === "Unauthorized") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        console.error("GET /api/user error:", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}

export async function POST(req: Request) {
  try {
    const { userId, email, name } = await getAuthUser(req);
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { org_id, project_id, source_login } = await req.json().catch(() => ({}));
    const emailNorm = email?.trim() || null;
    const patch = {
      name: name || "",
      org_id: org_id || null,
      project_id: project_id || null,
      source_login: source_login || "agent-elephant",
    };

    if (emailNorm) {
      const { data: legacy } = await supabaseAdmin
        .from("users")
        .select("id, user_id")
        .eq("email", emailNorm)
        .maybeSingle();

      if (legacy && legacy.user_id !== userId) {
        const { error: migrateErr } = await supabaseAdmin
          .from("users")
          .update({
            user_id: userId,
            ...patch,
          })
          .eq("id", legacy.id);

        if (migrateErr) {
          console.error("Supabase migrate-by-email error:", migrateErr);
          return NextResponse.json({ error: migrateErr.message }, { status: 500 });
        }
        return NextResponse.json({ success: true, user: { name, email: emailNorm, userId } });
      }
    }

    const { error } = await supabaseAdmin.from("users").upsert(
      {
        user_id: userId,
        email: emailNorm,
        ...patch,
      },
      { onConflict: "user_id", ignoreDuplicates: false }
    );

    if (error) {
      console.error("Supabase Sync Error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, user: { name, email: emailNorm, userId } });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "";
    if (msg === "Unauthorized") {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    console.error("User Sync API Error:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

/** PATCH business / display profile (settings). Creates `users` row if missing (same as first-time sync). */
export async function PATCH(req: Request) {
  try {
    const { userId, email, name: authName } = await getAuthUser(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const {
      name,
      businessVertical,
      businessDisplayName,
      targetAudience,
      primaryMarketingGoal,
      contentTone,
      regionsOrMarkets,
      productFocus,
    } = body as Record<string, unknown>;

    const update: Record<string, string | null> = {};

    if (typeof name === "string") {
      update.name = name.trim();
    }

    if (businessVertical === null || businessVertical === "") {
      update.business_vertical = null;
    } else if (typeof businessVertical === "string") {
      const v = businessVertical.trim().toLowerCase();
      if (!BUSINESS_VERTICALS.includes(v as (typeof BUSINESS_VERTICALS)[number])) {
        return NextResponse.json(
          { error: `businessVertical must be one of: ${BUSINESS_VERTICALS.join(", ")}` },
          { status: 400 }
        );
      }
      update.business_vertical = v;
    }

    const trimOrNull = (x: unknown): string | null => {
      if (x === null || x === undefined) return null;
      if (typeof x !== "string") return null;
      const t = x.trim();
      return t.length ? t : null;
    };

    if ("businessDisplayName" in body) update.business_display_name = trimOrNull(businessDisplayName);
    if ("targetAudience" in body) update.target_audience = trimOrNull(targetAudience);
    if ("primaryMarketingGoal" in body) update.primary_marketing_goal = trimOrNull(primaryMarketingGoal);
    if ("contentTone" in body) update.content_tone = trimOrNull(contentTone);
    if ("regionsOrMarkets" in body) update.regions_or_markets = trimOrNull(regionsOrMarkets);
    if ("productFocus" in body) update.product_focus = trimOrNull(productFocus);

    if (Object.keys(update).length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    const { data: existing } = await supabaseAdmin
      .from("users")
      .select("user_id")
      .eq("user_id", userId)
      .maybeSingle();

    const emailNorm = email?.trim() || null;

    if (!existing) {
      const { error } = await supabaseAdmin.from("users").insert({
        user_id: userId,
        email: emailNorm,
        name:
          typeof name === "string" && name.trim()
            ? name.trim()
            : (authName && String(authName).trim()) || "",
        ...update,
      });
      if (error) {
        console.error("PATCH /api/user insert error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    } else {
      const { error } = await supabaseAdmin.from("users").update(update).eq("user_id", userId);
      if (error) {
        console.error("PATCH /api/user error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "";
    if (msg === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("PATCH /api/user:", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
