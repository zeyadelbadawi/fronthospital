// No changes needed in this file as it only imports SignInLayer
import SignInLayer from "@/components/SignInLayer"

export const metadata = {
  title: "Sign In - Rukn Alwatekon Medical Center",
  description:
    "Sign in to access your healthcare management dashboard. Secure login for doctors, administrators, and accountants.",
}

export default function SignInPage() {
  return <SignInLayer />
}
