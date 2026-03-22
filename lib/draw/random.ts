import crypto from 'crypto';

export function generateDrawNumber(): {
  drawNumber: number;
  seed: string;
} {
  const seed = crypto.randomUUID();
  const seedBuffer = Buffer.from(seed.replace(/-/g, ''), 'hex');
  const seedInt = seedBuffer.readUInt32BE(0);
  const drawNumber = (seedInt % 45) + 1;

  return { drawNumber, seed };
}

export function reproduceDrawNumber(seed: string): number {
  const seedBuffer = Buffer.from(seed.replace(/-/g, ''), 'hex');
  const seedInt = seedBuffer.readUInt32BE(0);

  return (seedInt % 45) + 1;
}
