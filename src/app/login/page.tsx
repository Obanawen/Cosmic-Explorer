import Link from 'next/link';
import { SignIn } from '@clerk/nextjs';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function LoginPage() {
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-slate-900 to-black p-4 overflow-hidden">
      {/* Space starfield overlay */}
      <div className="pointer-events-none select-none absolute inset-0 opacity-30 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:18px_18px] [background-position:0_0,9px_9px]"></div>
      {/* Nebula glow accents */}
      <div className="pointer-events-none select-none absolute -top-24 -left-24 w-96 h-96 rounded-full blur-3xl opacity-30 bg-indigo-600"></div>
      <div className="pointer-events-none select-none absolute -bottom-24 -right-24 w-96 h-96 rounded-full blur-3xl opacity-20 bg-fuchsia-600"></div>
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle className="text-center">🚀 Launch into CKY Grader</CardTitle>
          <p className="text-center text-sm text-muted-foreground">
            Use your CKY student email (@student.cky.edu.hk)
          </p>
          <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-700 text-center">
              <strong>Not Allowed:</strong> Gmail, Yahoo, Hotmail, or other personal email providers
            </p>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <SignIn 
            appearance={{
              elements: {
                formButtonPrimary: 'bg-primary hover:bg-primary/90 text-primary-foreground',
                card: 'shadow-none',
                headerTitle: 'text-center text-xl font-semibold',
                headerSubtitle: 'text-center text-sm text-muted-foreground',
                socialButtonsBlockButton: 'hidden', // Hide social login buttons
                dividerLine: 'hidden', // Hide divider line
                dividerText: 'hidden', // Hide "or" text
                formFieldInput: 'border-red-200 focus:border-red-500',
                formFieldLabel: 'text-gray-700',
              }
            }}
            redirectUrl="/"
            signUpUrl="/signup"
          />
          <div className="text-center text-sm text-gray-500">
            <Link href="/" className="hover:underline">&larr; Back to Home</Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 