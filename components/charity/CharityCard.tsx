import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin } from 'lucide-react';

interface Charity {
  id: string;
  name: string;
  description: string;
  category: string;
  country: string;
}

export function CharityCard({ charity, selected, onSelect }: { charity: Charity; selected: boolean; onSelect: () => void }) {
  return (
    <Card 
      className={`cursor-pointer transition-all hover:shadow-md ${selected ? 'ring-2 ring-green-600 border-transparent bg-green-50/30' : ''}`}
      onClick={onSelect}
    >
      <CardContent className="p-5 flex flex-col h-full justify-between gap-4">
        <div>
           <div className="flex justify-between items-start mb-2 gap-2">
             <h4 className="font-bold text-lg leading-tight">{charity.name}</h4>
             <span className="text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-600 py-1 px-2 rounded shrink-0">{charity.category}</span>
           </div>
           <p className="text-sm text-gray-600 line-clamp-3">{charity.description}</p>
        </div>
        <div className="flex items-center text-xs text-gray-500 mt-auto">
           <MapPin className="w-3 h-3 mr-1" />
           {charity.country}
        </div>
      </CardContent>
    </Card>
  );
}
