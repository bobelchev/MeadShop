const BASE_URL = process.env.ECONT_BASE_URL ?? 'https://demo.econt.com/ee/services';
const USER = process.env.ECONT_USER ?? 'demo';
const PASS = process.env.ECONT_PASS ?? 'demo';

let cachedOffices = null;
let cacheExpiry = 0;

async function loadOffices() {
  if (cachedOffices && Date.now() < cacheExpiry) return cachedOffices;
  const auth = Buffer.from(`${USER}:${PASS}`).toString('base64');
  const res = await fetch(
    `${BASE_URL}/Nomenclatures/NomenclaturesService.getOffices.json`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Basic ${auth}` },
      body: '{}',
      next: { revalidate: 0 },
    }
  );
  if (!res.ok) throw new Error(`Econt API error ${res.status}`);
  const data = await res.json();
  cachedOffices = (data.offices ?? [])
    .filter(o => o.address?.city?.country?.code2 === 'BG')
    .map(o => ({
      code: o.code,
      name: o.name,
      city: o.address.city.name,
      address: o.address.fullAddress?.trim() ?? '',
    }));
  cacheExpiry = Date.now() + 24 * 60 * 60 * 1000;
  return cachedOffices;
}

export async function searchOffices(query) {
  const offices = await loadOffices();
  if (!query) return offices.slice(0, 20);
  const q = query.toLowerCase();
  return offices
    .filter(
      o =>
        o.name.toLowerCase().includes(q) ||
        o.city.toLowerCase().includes(q) ||
        o.address.toLowerCase().includes(q)
    )
    .slice(0, 20);
}
