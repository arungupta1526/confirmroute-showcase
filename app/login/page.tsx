import { redirect } from "next/navigation";

export const metadata = {
  title: "Sign In | ConfirmRoute AI",
  description: "Sign in to your ConfirmRoute AI account.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const redirectQuery =
    typeof params.redirect === "string" && params.redirect !== "/"
      ? `&redirect=${encodeURIComponent(params.redirect)}`
      : "";
  redirect(`/auth?mode=email-signin${redirectQuery}`);
}
