import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { CheckCircle2 } from 'lucide-react';

export default function SuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
       <div className="max-w-md w-full space-y-8 bg-white p-12 rounded-xl shadow-lg border border-green-100 text-center">
         <div className="flex justify-center">
           <CheckCircle2 className="h-20 w-20 text-green-600" />
         </div>
         <h2 className="text-3xl font-extrabold text-gray-900 font-serif">You're in!</h2>
         <p className="text-gray-600">
           Welcome to the club. Your subscription is active and your first draw entry is secured. 
         </p>
         <div className="pt-6">
           <Link href="/dashboard" passHref>
             <Button className="w-full bg-green-800 hover:bg-green-700 text-white" size="lg">
               Go to Dashboard
             </Button>
           </Link>
         </div>
       </div>
    </div>
  );
}
