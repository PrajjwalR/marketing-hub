import { redirect } from "next/navigation";

/** Default AI Photoshoot entry: land on My generations; Studio lives at /studio */
export default function AiPhotoshootRootPage() {
  redirect("/dashboard/ai-photoshoot/generations");
}
