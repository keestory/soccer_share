import { getDict } from "@/lib/locale";
import SignupForm from "@/components/SignupForm";

export default async function SignupPage() {
  const t = (await getDict()).auth;
  return <SignupForm t={t} />;
}
