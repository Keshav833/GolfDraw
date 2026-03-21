import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { resetPassword } from '../actions'

export default function ForgotPasswordPage({ searchParams }: { searchParams: { error?: string, message?: string } }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Reset Password</CardTitle>
        <CardDescription>Enter your email and we'll send you a link to reset your password.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={resetPassword} className="space-y-4">
          {searchParams?.error && (
            <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
              {searchParams.error}
            </div>
          )}
          {searchParams?.message && (
            <div className="p-3 text-sm text-green-600 bg-green-500/10 rounded-md">
              {searchParams.message}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required placeholder="m@example.com" />
          </div>
          <Button type="submit" className="w-full">Send Reset Link</Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center border-t p-4">
        <Link href="/login" className="text-sm text-primary hover:underline">
          Back to login
        </Link>
      </CardFooter>
    </Card>
  )
}
