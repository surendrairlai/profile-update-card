import type { ExpressionGroup, ExpressionSuggestion, FieldDefinition } from '../types';
import { DEFAULT_FIELDS } from './fields';

const CONTACT_DEFAULT: ExpressionSuggestion[] = DEFAULT_FIELDS.map((f) => ({
  id: `contact.${f.id}`,
  label: f.label,
  category: 'Contact',
  fieldType: f.type,
}));

// Additional system fields not in DEFAULT_FIELDS but available in expressions.
const CONTACT_EXTRA: ExpressionSuggestion[] = [
  { id: 'contact.whatsapp_profile_name',    label: 'WhatsApp Profile Name',    category: 'Contact', fieldType: 'text' },
  { id: 'contact.last_seen_at',             label: 'Last Seen At',             category: 'Contact', fieldType: 'date' },
  { id: 'contact.first_message_received_at', label: 'First Message Received At', category: 'Contact', fieldType: 'date' },
  { id: 'contact.email',                    label: 'Email',                    category: 'Contact', fieldType: 'text' },
  { id: 'contact.phone',                    label: 'Phone',                    category: 'Contact', fieldType: 'text' },
];

/** Keep the first occurrence of each `id`, drop later duplicates. */
function deduplicateById(items: ExpressionSuggestion[]): ExpressionSuggestion[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}


const CONTACT_ITEMS = deduplicateById([...CONTACT_EXTRA, ...CONTACT_DEFAULT]);

export const EXPRESSION_TREE: ExpressionGroup[] = [
  {
    id: 'contact',
    label: 'Contact',
    items: CONTACT_ITEMS,
  },
  {
    id: 'last_message',
    label: 'Last message from user',
    items: [
      { id: 'event.message.text.body', label: 'Message Body', category: 'Last Message', fieldType: 'text' },
      { id: 'event.message.type',      label: 'Message Type', category: 'Last Message', fieldType: 'text' },
      { id: 'event.message.timestamp', label: 'Timestamp',    category: 'Last Message', fieldType: 'date' },
    ],
  },
  {
    id: 'chat',
    label: 'Chat',
    items: [
      { id: 'chat.uuid',       label: 'Chat ID',    category: 'Chat', fieldType: 'text' },
      { id: 'chat.owner',      label: 'Owner',      category: 'Chat', fieldType: 'text' },
      { id: 'chat.state',      label: 'State',      category: 'Chat', fieldType: 'text' },
      { id: 'chat.created_at', label: 'Created At', category: 'Chat', fieldType: 'date' },
    ],
  },
  {
    id: 'organisation',
    label: 'Organisation',
    items: [
      { id: 'organisation.name',    label: 'Name',    category: 'Organisation', fieldType: 'text' },
      { id: 'organisation.uuid',    label: 'ID',      category: 'Organisation', fieldType: 'text' },
      { id: 'organisation.website', label: 'Website', category: 'Organisation', fieldType: 'text' },
    ],
  },
  {
    id: 'expressions',
    label: 'Expressions',
    groups: [
      {
        id: 'date',
        label: 'Date',
        items: [
          { id: 'date(year,month,day)', label: 'date(year, month, day)', category: 'Expressions', fieldType: 'date' },
          { id: 'now()',                label: 'now()',                  category: 'Expressions', fieldType: 'date' },
        ],
      },
      
      
    ],
  },
];

function flattenTree(groups: ExpressionGroup[]): ExpressionSuggestion[] {
  const out: ExpressionSuggestion[] = [];
  for (const g of groups) {
    if (g.items)  out.push(...g.items);
    if (g.groups) out.push(...flattenTree(g.groups));
  }
  return out;
}

const ALL_FLAT: ExpressionSuggestion[] = flattenTree(EXPRESSION_TREE);

function normalize(value: string): string {
  return value.toLowerCase().trim().replace(/^@+/, '');
}

/**
 * Returns expression suggestions filtered by query.
 * Empty query returns the full list — the hierarchical picker uses this to
 * detect which custom fields the user has added.
 */
export function getExpressionSuggestions(
  query: string,
  selectedField: FieldDefinition | null,
  limit = 15,
): ExpressionSuggestion[] {
  const q = normalize(query);

  // Prepend a custom field so it appears in @ suggestions even before the
  // user saves it anywhere — it only exists in local component state.
  let list = ALL_FLAT;
  if (selectedField?.source === 'custom') {
    const sel: ExpressionSuggestion = {
      id: `contact.${selectedField.id}`,
      label: selectedField.label,
      category: 'Contact',
      fieldType: selectedField.type,
    };
    if (!list.find((e) => e.id === sel.id)) list = [sel, ...list];
  }

  if (!q) return list;

  return list
    .filter((item) => `${item.id} ${item.label} ${item.category}`.toLowerCase().includes(q))
    .slice(0, limit);
}
