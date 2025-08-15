import Link from 'next/link';
import { SignUp } from '@clerk/nextjs';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle className="text-center">Sign Up for CKY Grader</CardTitle>
          <p className="text-center text-sm text-muted-foreground">
            Only CKY student emails (@student.cky.edu.hk) are allowed
          </p>
          <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-700 text-center">
              <strong>Not Allowed:</strong> Gmail, Yahoo, Hotmail, or other personal email providers
            </p>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <SignUp 
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
            signInUrl="/login"
          />
          <div className="text-center text-sm text-gray-500">
            <Link href="/" className="hover:underline">&larr; Back to Home</Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 