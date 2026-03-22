import React from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';

interface PlanCardProps {
  plan: 'monthly' | 'yearly';
  price: number;
  features: string[];
  breakdown?: string[];
  featured?: boolean;
  onSelect: () => void;
  isLoading?: boolean;
}

export function PlanCard({
  plan,
  price,
  features,
  breakdown,
  featured,
  onSelect,
  isLoading,
}: PlanCardProps) {
  return (
    <Card
      className={`relative flex h-full flex-col border-0 ${featured ? 'shadow-xl ring-2 ring-green-600/80' : 'shadow-lg'}`}
      style={{
        background: featured
          ? 'linear-gradient(180deg, rgba(240,255,247,0.96), rgba(255,255,255,0.95))'
          : 'linear-gradient(180deg, rgba(255,255,255,0.94), rgba(246,248,250,0.96))',
      }}
    >
      <div
        className="absolute inset-x-0 top-0 h-1.5"
        style={{
          background: featured
            ? 'linear-gradient(90deg, #2d8c55, #7de0aa)'
            : 'rgba(58,166,96,0.18)',
        }}
      />
      {featured ? (
        <div className="absolute right-0 top-0 translate-x-2 -translate-y-3 transform">
          <span className="rounded-full bg-green-600 px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">
            Best Value
          </span>
        </div>
      ) : null}
      <CardHeader className="pb-4">
        <CardTitle className="capitalize text-2xl">{plan}</CardTitle>
        <CardDescription>
          <span className="text-3xl font-bold text-gray-900">£{price}</span>
          <span className="text-sm text-gray-500">
            {' '}
            / {plan === 'monthly' ? 'mo' : 'yr'}
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col">
        {breakdown?.length ? (
          <div className="mb-5 rounded-2xl border border-green-100/70 bg-white/80 p-4 text-sm text-gray-700">
            {breakdown.map((item, index) => (
              <p
                key={index}
                className={index === 0 ? 'font-semibold text-gray-900' : 'mt-2'}
              >
                {item}
              </p>
            ))}
          </div>
        ) : null}
        <ul className="mt-auto space-y-3 text-sm text-gray-600">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center gap-2">
              <Check className="h-4 w-4 flex-shrink-0 text-green-600" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter className="pt-0">
        <Button
          className={`w-full ${featured ? 'bg-green-800 text-white hover:bg-green-700' : ''}`}
          variant={featured ? 'default' : 'outline'}
          onClick={onSelect}
          disabled={isLoading}
        >
          {isLoading ? 'Processing...' : `Select ${plan}`}
        </Button>
      </CardFooter>
    </Card>
  );
}
