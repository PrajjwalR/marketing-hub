import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getAuthUser } from "@/lib/auth-helpers";

export type StrategyDomain = "gym" | "jewellery" | "ecommerce" | "unknown";

function mapBusinessTypeToDomain(businessType: unknown): StrategyDomain {
    const bt = typeof businessType === "string" ? businessType.toLowerCase() : "";
    if (!bt) return "unknown";

    if (bt.includes("ecom")) return "ecommerce";
    if (bt.includes("jewel")) return "jewellery";
    if (bt.includes("gym") || bt.includes("fitness") || bt.includes("health")) return "gym";

    return "unknown";
}

function mapNicheToDomain(niche: unknown): StrategyDomain {
    const n = typeof niche === "string" ? niche.toLowerCase() : "";
    if (!n) return "unknown";

    // Current app has generic niches; we map a few common ones to your domains.
    if (n === "health") return "gym";
    if (n === "facts" || n === "historical") return "jewellery";
    if (n === "finance" || n === "tech") return "ecommerce";

    return "unknown";
}

export async function GET(req: Request) {
    try {
        const { userId } = await getAuthUser(req);
        if (!userId) return new NextResponse("Unauthorized", { status: 401 });

        const { data: latestStrategy } = await supabaseAdmin
            .from("strategies")
            .select("business_type")
            .eq("user_id", userId)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();

        const businessDomain = mapBusinessTypeToDomain(latestStrategy?.business_type);
        if (businessDomain !== "unknown") {
            return NextResponse.json({ domain: businessDomain });
        }

        const { data: latestSeries } = await supabaseAdmin
            .from("series")
            .select("niche")
            .eq("user_id", userId)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();

        const nicheDomain = mapNicheToDomain(latestSeries?.niche);
        return NextResponse.json({ domain: nicheDomain });
    } catch (error) {
        console.error("[STRATEGY_DOMAIN]", error);
        return NextResponse.json(
            { domain: "unknown", error: "Failed to detect domain" },
            { status: 500 }
        );
    }
}

