import { getContentRows } from '@/lib/content';
import ContentSectionForm from './ContentSectionForm';

const SECTION_LABELS = {
  about: {
    label: 'About Page',
    fields: {
      eyebrow:        { label: 'Eyebrow',           type: 'input' },
      heading:        { label: 'Heading',            type: 'input' },
      intro:          { label: 'Intro',              type: 'textarea' },
      story_heading:  { label: 'Story heading',      type: 'input' },
      story_p1:       { label: 'Story paragraph 1',  type: 'textarea' },
      story_p2:       { label: 'Story paragraph 2',  type: 'textarea' },
      story_p3:       { label: 'Story paragraph 3',  type: 'textarea' },
      values_heading: { label: 'Values heading',     type: 'input' },
      v1_title:       { label: 'Value 1 title',      type: 'input' },
      v1_body:        { label: 'Value 1 body',       type: 'textarea' },
      v2_title:       { label: 'Value 2 title',      type: 'input' },
      v2_body:        { label: 'Value 2 body',       type: 'textarea' },
      v3_title:       { label: 'Value 3 title',      type: 'input' },
      v3_body:        { label: 'Value 3 body',       type: 'textarea' },
      cta_text:       { label: 'CTA text',           type: 'input' },
      cta_button:     { label: 'CTA button label',   type: 'input' },
    },
  },
  home: {
    label: 'Home Page',
    fields: {
      hero_eyebrow:         { label: 'Hero eyebrow',          type: 'input' },
      hero_heading:         { label: 'Hero heading',          type: 'input' },
      hero_body:            { label: 'Hero body',             type: 'textarea' },
      hero_cta_shop:        { label: 'Hero CTA — Shop',       type: 'input' },
      hero_cta_about:       { label: 'Hero CTA — About',      type: 'input' },
      categories_heading:   { label: 'Categories heading',    type: 'input' },
      honey_label:          { label: 'Honey badge label',     type: 'input' },
      honey_title:          { label: 'Honey title',           type: 'input' },
      honey_body:           { label: 'Honey body',            type: 'textarea' },
      honey_cta:            { label: 'Honey CTA',             type: 'input' },
      mead_label:           { label: 'Mead badge label',      type: 'input' },
      mead_title:           { label: 'Mead title',            type: 'input' },
      mead_body:            { label: 'Mead body',             type: 'textarea' },
      mead_cta:             { label: 'Mead CTA',              type: 'input' },
      values_heading:       { label: 'Values heading',        type: 'input' },
      value_natural_title:  { label: 'Value Natural title',   type: 'input' },
      value_natural_body:   { label: 'Value Natural body',    type: 'textarea' },
      value_local_title:    { label: 'Value Local title',     type: 'input' },
      value_local_body:     { label: 'Value Local body',      type: 'textarea' },
      value_craft_title:    { label: 'Value Craft title',     type: 'input' },
      value_craft_body:     { label: 'Value Craft body',      type: 'textarea' },
      story_heading:        { label: 'Story heading',         type: 'input' },
      story_body:           { label: 'Story body',            type: 'textarea' },
      story_cta:            { label: 'Story CTA',             type: 'input' },
    },
  },
};

export default function ContentPage() {
  return (
    <div className="space-y-12">
      <h1 className="text-xl font-bold text-gray-800">Site Content</h1>
      {Object.entries(SECTION_LABELS).map(([namespace, { label, fields }]) => {
        const rows = getContentRows(namespace);
        const byShortKey = Object.fromEntries(
          rows.map(r => [r.key.slice(namespace.length + 1), r])
        );
        return (
          <ContentSectionForm
            key={namespace}
            namespace={namespace}
            sectionLabel={label}
            fields={fields}
            byShortKey={byShortKey}
          />
        );
      })}
    </div>
  );
}
