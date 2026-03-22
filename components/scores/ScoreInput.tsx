'use client';

import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function ScoreInput() {
  const [val, setVal] = useState('');
  const queryClient = useQueryClient();

  const submitScore = useMutation({
    mutationFn: async (score: number) => {
      const res = await fetch('/api/scores', {
        method: 'POST', body: JSON.stringify({ value: score }), headers: { 'Content-Type': 'application/json' }
      });
      if (!res.ok) throw new Error('Failed to submit');
      return res.json();
    },
    onSuccess: () => {
      setVal('');
      toast.success('Score logged directly to your draw entry!');
      queryClient.invalidateQueries({ queryKey: ['me'] });
    },
    onError: () => toast.error('Check your score and try again')
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseInt(val);
    if (!num || num < 1 || num > 45) {
      toast.error('Score must be between 1 and 45');
      return;
    }
    submitScore.mutate(num);
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center space-x-2">
      <Input 
        type="number" 
        min={1} 
        max={45} 
        placeholder="Enter score (1-45)" 
        value={val}
        onChange={e => setVal(e.target.value)}
        className="max-w-[150px]"
        disabled={submitScore.isPending}
      />
      <Button type="submit" disabled={submitScore.isPending || !val}>
        Enter Score
      </Button>
    </form>
  );
}
