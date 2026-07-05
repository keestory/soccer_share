import { getDict } from "@/lib/locale";
import LoginForm from "@/components/LoginForm";

export default async function LoginPage() {
  const t = (await getDict()).auth;
  return <LoginForm t={t} />;
}
