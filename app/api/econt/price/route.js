import { NextResponse } from 'next/server';
import { getDeliveryPrice } from '@/lib/econt';
import db from '@/lib/db';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const cityId = parseInt(searchParams.get('cityId') ?? '0', 10);
  const amount = parseFloat(searchParams.get('amount') ?? '0');
  const itemsParam = searchParams.get('items');

  if (!cityId || !itemsParam) {
    return NextResponse.json({ error: 'missing params' }, { status: 400 });
  }

  let items;
  try {
    items = JSON.parse(itemsParam);
  } catch {
    return NextResponse.json({ error: 'invalid items' }, { status: 400 });
  }

  // Look up weights from DB
  const ids = items.map(i => parseInt(i.id, 10)).filter(Boolean);
  const placeholders = ids.map(() => '?').join(',');
  const products = ids.length
    ? db.prepare(`SELECT id, weight_kg FROM products WHERE id IN (${placeholders})`).all(...ids)
    : [];

  const weightMap = Object.fromEntries(products.map(p => [p.id, p.weight_kg]));
  const totalWeight = items.reduce((sum, item) => {
    const w = weightMap[parseInt(item.id, 10)] ?? 0.5;
    return sum + w * (parseInt(item.qty, 10) || 1);
  }, 0);

  try {
    const result = await getDeliveryPrice(cityId, totalWeight, amount);
    return NextResponse.json(result);
  } catch (err) {
    console.error('Econt price error:', err);
    return NextResponse.json({ error: 'unavailable' }, { status: 502 });
  }
}
