import { redirect } from "next/navigation";
import { getPlanConfig } from "@/src/config/plans.config";

export const metadata = {
  title: "Create Account | ConfirmRoute AI",
  description: `Create a free ConfirmRoute AI account to get ${getPlanConfig("traveler_free").searchLimit} daily searches and seat probability trends.`,
};

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const redirectQuery =
    typeof params.redirect === "string" && params.redirect !== "/"
      ? `&redirect=${encodeURIComponent(params.redirect)}`
      : "";
  redirect(`/auth?mode=signup${redirectQuery}`);
}
