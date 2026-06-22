'use server';

import fs from 'fs';
import path from 'path';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import db from '@/lib/db';
import { requireAdmin } from '@/lib/adminSession';

const VALID_CATEGORIES = ['honey', 'mead'];
const ALLOWED_IMAGE_TYPES = { 'image/webp': '.webp', 'image/jpeg': '.jpg', 'image/png': '.png' };
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 MB
const MAX_IMAGE_COUNT = 10;

function extractFields(formData) {
  return {
    name_bg: formData.get('name_bg')?.toString().trim() ?? '',
    name_en: formData.get('name_en')?.toString().trim() ?? '',
    category: formData.get('category')?.toString() ?? '',
    variant: formData.get('variant')?.toString().trim() ?? '',
    price_bgn: parseFloat(formData.get('price_bgn')?.toString() ?? '0'),
    stock_qty: parseInt(formData.get('stock_qty')?.toString() ?? '0', 10),
    description_bg: formData.get('description_bg')?.toString().trim() ?? '',
    description_en: formData.get('description_en')?.toString().trim() ?? '',
    active: formData.get('active') === 'on' ? 1 : 0,
  };
}

function validate(f) {
  if (!f.name_bg) return 'Bulgarian name is required.';
  if (!f.name_en) return 'English name is required.';
  if (!VALID_CATEGORIES.includes(f.category)) return 'Category must be honey or mead.';
  if (isNaN(f.price_bgn) || f.price_bgn <= 0) return 'Price must be a positive number.';
  if (isNaN(f.stock_qty) || f.stock_qty < 0) return 'Stock must be 0 or more.';
  return null;
}

async function saveProductImages(productId, formData) {
  const keptPaths = formData.getAll('keptImages').map((s) => s.toString()).filter(Boolean);

  const uploadDir = path.join(process.cwd(), 'public', 'img', 'products');
  fs.mkdirSync(uploadDir, { recursive: true });

  const newFiles = formData.getAll('newImages').slice(0, MAX_IMAGE_COUNT);
  const newPaths = [];
  for (const file of newFiles) {
    if (!file || file.size === 0) continue;
    if (file.size > MAX_IMAGE_SIZE) continue;
    const ext = ALLOWED_IMAGE_TYPES[file.type];
    if (!ext) continue; // reject non-allowlisted types
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(path.join(uploadDir, filename), buffer);
    newPaths.push(`/img/products/${filename}`);
  }

  const allPaths = [...keptPaths, ...newPaths];
  const insertImg = db.prepare(
    'INSERT INTO product_images (product_id, image_path, sort_order) VALUES (?, ?, ?)'
  );
  db.transaction(() => {
    db.prepare('DELETE FROM product_images WHERE product_id = ?').run(productId);
    allPaths.forEach((p, i) => insertImg.run(productId, p, i));
  })();
}

export async function createProduct(prevState, formData) {
  await requireAdmin();
  const f = extractFields(formData);
  const error = validate(f);
  if (error) return { error };

  const result = db.prepare(`
    INSERT INTO products (name_bg, name_en, category, variant, price_bgn, stock_qty, description_bg, description_en, active)
    VALUES (@name_bg, @name_en, @category, @variant, @price_bgn, @stock_qty, @description_bg, @description_en, @active)
  `).run(f);

  await saveProductImages(result.lastInsertRowid, formData);
  redirect('/admin/products');
}

export async function updateProduct(productId, prevState, formData) {
  await requireAdmin();
  const f = extractFields(formData);
  const error = validate(f);
  if (error) return { error };

  db.prepare(`
    UPDATE products
    SET name_bg=@name_bg, name_en=@name_en, category=@category, variant=@variant,
        price_bgn=@price_bgn, stock_qty=@stock_qty, description_bg=@description_bg,
        description_en=@description_en, active=@active
    WHERE id=@id
  `).run({ ...f, id: productId });

  await saveProductImages(productId, formData);
  revalidatePath('/admin/products');
  return { success: true };
}

export async function deleteProduct(productId) {
  await requireAdmin();
  const hasOrders = db
    .prepare('SELECT 1 FROM order_items WHERE product_id = ? LIMIT 1')
    .get(productId);
  if (hasOrders) throw new Error('Cannot delete a product that appears in existing orders. Set it to inactive instead.');

  const images = db
    .prepare('SELECT image_path FROM product_images WHERE product_id = ?')
    .all(productId);

  db.prepare('DELETE FROM products WHERE id = ?').run(productId);

  for (const { image_path } of images) {
    const abs = path.join(process.cwd(), 'public', image_path);
    try { fs.unlinkSync(abs); } catch { /* file already gone */ }
  }

  revalidatePath('/admin/products');
  redirect('/admin/products');
}
