const Database = require('better-sqlite3');
const path = require('path');

const dbPath = process.env.DATABASE_PATH || './data/shop.db';
const db = new Database(path.resolve(dbPath));

const insert = db.prepare(`
  INSERT INTO products (name_bg, name_en, category, variant, price_bgn, stock_qty,
                        description_bg, description_en, active)
  VALUES (@name_bg, @name_en, @category, @variant, @price_bgn, @stock_qty,
          @description_bg, @description_en, @active)
`);

const seed = db.transaction(() => {
  insert.run({
    name_bg: 'Липов мед', name_en: 'Linden Honey',
    category: 'honey', variant: '700г',
    price_bgn: 18.00, stock_qty: 50,
    description_bg: 'Чист липов мед от горски пчелини.',
    description_en: 'Pure linden honey from forest apiaries.',
    active: 1,
  });
  insert.run({
    name_bg: 'Липов мед', name_en: 'Linden Honey',
    category: 'honey', variant: '240г',
    price_bgn: 8.00, stock_qty: 80,
    description_bg: 'Чист липов мед от горски пчелини.',
    description_en: 'Pure linden honey from forest apiaries.',
    active: 1,
  });
  insert.run({
    name_bg: 'Традиционна медовина', name_en: 'Traditional Mead',
    category: 'mead', variant: '750мл',
    price_bgn: 32.00, stock_qty: 30,
    description_bg: 'Ферментирала медовина по традиционна рецепта.',
    description_en: 'Fermented mead made with a traditional recipe.',
    active: 1,
  });
});

seed();
db.close();
console.log('Seeded 3 products.');
