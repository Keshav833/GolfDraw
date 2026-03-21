export const dynamic = 'force-dynamic'

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import Link from 'next/link'
import { register } from '../actions'
import { createClient } from '@/lib/supabase/server'

export default async function RegisterPage({ searchParams }: { searchParams: { error?: string } }) {
  const supabase = createClient()
  const { data: charities } = await supabase.from('charities').select('id, name').eq('is_active', true)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Sign Up</CardTitle>
        <CardDescription>Create your account and select a charity to support.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={register} className="space-y-4">
          {searchParams?.error && (
            <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
              {searchParams.error}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required placeholder="m@example.com" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" required minLength={6} />
          </div>
          <div className="space-y-2 pt-2">
            <Label htmlFor="charity" className="font-semibold text-primary">Support a Charity (min 10% goes to them!)</Label>
            <Select name="charity_id" required>
              <SelectTrigger>
                <SelectValue placeholder="Select a charity" />
              </SelectTrigger>
              <SelectContent>
                {charities?.map(charity => (
                  <SelectItem key={charity.id} value={charity.id}>{charity.name}</SelectItem>
                ))}
                {!charities?.length && <SelectItem value="none" disabled>No charities available</SelectItem>}
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" className="w-full mt-2">Create Account</Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center border-t p-4">
        <p className="text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link href="/login" className="text-primary hover:underline">Sign in</Link>
        </p>
      </CardFooter>
    </Card>
  )
}
