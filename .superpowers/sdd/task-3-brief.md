### Task 3: Wholesale i18n strings update

**Files:**
- Modify: `messages/bg.json`
- Modify: `messages/en.json`

**Interfaces:**
- Produces: new keys used by Task 4's WholesaleForm

- [ ] **Step 1: Update `messages/bg.json` wholesale namespace**

Replace the entire `"wholesale"` block with:

```json
"wholesale": {
  "meta_title": "Търговия на едро — Пчелин Мед",
  "meta_description": "Запитване за търговия на едро с мед и медовина.",
  "heading": "Запитване на едро",
  "subheading": "За корпоративни клиенти и търговци — свържете се с нас за условия.",
  "company_label": "Фирма",
  "contact_label": "Лице за контакт",
  "phone_label": "Телефон",
  "email_label": "E-mail (незадължително)",
  "products_heading": "Изберете продукти",
  "products_subheading": "Добавете продуктите, за които се интересувате, и посочете желаното количество.",
  "product_add": "Добави",
  "product_remove": "Премахни",
  "qty_label": "Количество (бр.)",
  "note_placeholder": "Въпрос за този продукт... (незадължително)",
  "no_products": "Все още не сте избрали продукти.",
  "submit": "Изпрати запитване",
  "submitting": "Изпращане...",
  "success_heading": "Получихме вашето запитване!",
  "success_body": "Ще се свържем с вас в рамките на 1–2 работни дни.",
  "error_required": "Моля, попълнете задължителните полета (фирма, лице за контакт, телефон).",
  "error_no_products": "Моля, изберете поне един продукт."
}
```

- [ ] **Step 2: Update `messages/en.json` wholesale namespace**

Replace the entire `"wholesale"` block with:

```json
"wholesale": {
  "meta_title": "Wholesale — Pchelin Med",
  "meta_description": "Wholesale inquiry for honey and mead.",
  "heading": "Wholesale Inquiry",
  "subheading": "For businesses and retailers — get in touch for wholesale pricing.",
  "company_label": "Company",
  "contact_label": "Contact person",
  "phone_label": "Phone",
  "email_label": "E-mail (optional)",
  "products_heading": "Select products",
  "products_subheading": "Add the products you are interested in and specify the desired quantity.",
  "product_add": "Add",
  "product_remove": "Remove",
  "qty_label": "Quantity (units)",
  "note_placeholder": "Question about this product... (optional)",
  "no_products": "You haven't selected any products yet.",
  "submit": "Send inquiry",
  "submitting": "Sending...",
  "success_heading": "Inquiry received!",
  "success_body": "We will contact you within 1–2 business days.",
  "error_required": "Please fill in the required fields (company, contact person, phone).",
  "error_no_products": "Please select at least one product."
}
```

- [ ] **Step 3: Commit**

```bash
git add messages/bg.json messages/en.json
git commit -m "feat: update wholesale i18n strings for product picker"
```

---

