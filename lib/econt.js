const BASE_URL = process.env.ECONT_BASE_URL ?? 'https://demo.econt.com/ee/services';
const USER = process.env.ECONT_USER ?? 'iasp-dev';
const PASS = process.env.ECONT_PASS ?? '1Asp-dev';
const SENDER_CITY_ID = parseInt(process.env.ECONT_SENDER_CITY_ID ?? '42', 10); // 42 = Стара Загора
const SENDER_OFFICE_CODE = process.env.ECONT_SENDER_OFFICE_CODE ?? null;
const SENDER_NAME = process.env.ECONT_SENDER_NAME ?? null;
const SENDER_PHONE = process.env.ECONT_SENDER_PHONE ?? null;

let cachedOffices = null;
let cacheExpiry = 0;

function authHeader() {
  return `Basic ${Buffer.from(`${USER}:${PASS}`).toString('base64')}`;
}

async function loadOffices() {
  if (cachedOffices && Date.now() < cacheExpiry) return cachedOffices;
  const res = await fetch(
    `${BASE_URL}/Nomenclatures/NomenclaturesService.getOffices.json`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: authHeader() },
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
      cityId: o.address.city.id,
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

let cachedCities = null;
let citiesCacheExpiry = 0;

async function loadCities() {
  if (cachedCities && Date.now() < citiesCacheExpiry) return cachedCities;
  const res = await fetch(
    `${BASE_URL}/Nomenclatures/NomenclaturesService.getCities.json`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: authHeader() },
      body: '{}',
      next: { revalidate: 0 },
    }
  );
  if (!res.ok) throw new Error(`Econt cities API error ${res.status}`);
  const data = await res.json();
  cachedCities = (data.cities ?? []).filter(c => c.country?.code2 === 'BG');
  citiesCacheExpiry = Date.now() + 24 * 60 * 60 * 1000;
  return cachedCities;
}

async function getCityId(cityName) {
  const cities = await loadCities();
  const match = cities.find(c => c.name === cityName || c.nameEn === cityName);
  return match?.id ?? null;
}

export async function createWaybill(order, totalWeightKg) {
  const isOffice = order.delivery_method === 'ekont_office';
  const isDoor = order.delivery_method === 'ekont_door';
  if (!isOffice && !isDoor) throw new Error('Waybill only supported for Econt deliveries');

  const label = {
    shipmentType: 'PACK',
    receiverClient: { name: order.customer_name, phones: [order.phone] },
    weight: Math.max(0.1, totalWeightKg),
    packCount: 1,
    services: { cdAmount: order.total_amount, cdType: 'get' },
    shipmentDescription: 'Med i medovina',
  };

  if (SENDER_OFFICE_CODE) {
    label.senderOfficeCode = SENDER_OFFICE_CODE;
  } else {
    label.senderAddress = { city: { id: SENDER_CITY_ID } };
  }
  if (SENDER_NAME && SENDER_PHONE) {
    label.senderClient = { name: SENDER_NAME, phones: [SENDER_PHONE] };
  }

  if (isOffice) {
    if (!order.econt_office_code) throw new Error('Office code not stored — order was placed before this feature was added');
    label.receiverOfficeCode = order.econt_office_code;
  } else {
    const cityId = await getCityId(order.city);
    if (!cityId) throw new Error(`City "${order.city}" not found in Econt`);
    label.receiverAddress = { city: { id: cityId }, fullAddress: order.address_or_office };
  }

  const res = await fetch(
    `${BASE_URL}/Shipments/LabelService.createLabel.json`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: authHeader() },
      body: JSON.stringify({ label, mode: 'create' }),
    }
  );
  const data = await res.json();
  if (!res.ok || data.type) throw new Error(data.message ?? `Econt API error ${res.status}`);
  return { shipmentNumber: data.label.shipmentNumber, pdfUrl: data.label.pdfURL };
}

export async function getDeliveryPrice(receiverCityId, weightKg, cdAmountBgn) {
  const res = await fetch(
    `${BASE_URL}/Shipments/LabelService.createLabel.json`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: authHeader() },
      body: JSON.stringify({
        label: {
          shipmentType: 'PACK',
          senderAddress: { city: { id: SENDER_CITY_ID } },
          receiverAddress: { city: { id: receiverCityId } },
          weight: Math.max(0.1, weightKg),
          packCount: 1,
          services: { cdAmount: cdAmountBgn, cdType: 'get' },
        },
        mode: 'calculate',
      }),
    }
  );
  if (!res.ok) throw new Error(`Econt price API error ${res.status}`);
  const data = await res.json();
  if (data.type) throw new Error(data.message ?? 'Econt error');
  return { price: data.label.totalPrice, currency: data.label.currency };
}
