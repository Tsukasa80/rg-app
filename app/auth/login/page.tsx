import { LoginForm } from '@/components/auth/login-form';

export default function LoginPage() {
  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-md flex-col justify-center space-y-6">
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-semibold text-white">サインイン</h2>
        <p className="text-sm text-slate-400">メールアドレスまたはGoogleでサインインできます。</p>
      </div>
      <LoginForm />
    </div>
  );
}
