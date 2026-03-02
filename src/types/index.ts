export type FieldType = 'text' | 'boolean' | 'enum' | 'date';
export type FieldSource = 'default' | 'custom';

export interface FieldDefinition {
  id: string;
  label: string;
  type: FieldType;
  source: FieldSource;
  options?: { label: string; value: string }[];
}

export interface CardState {
  selectedField: FieldDefinition | null;
  rawValue: string;
  displayValue: string;
  isPickedValue: boolean;
}

export interface ExpressionSuggestion {
  id: string;
  label: string;
  category: string;
  fieldType: FieldType;
}

export interface ExpressionGroup {
  id: string;
  label: string;
  groups?: ExpressionGroup[];       // sub-groups (Expressions category only)
  items?: ExpressionSuggestion[];   // leaf items — mutually exclusive with groups
}
