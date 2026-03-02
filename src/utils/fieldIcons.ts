import type { FieldDefinition } from '../types';
import StringTypeIcon from '../assets/icons/field-types/Type_01-STRING.svg';
import BooleanTypeIcon from '../assets/icons/field-types/Toggle_03Right-BOOLEAN.svg';
import EnumTypeIcon from '../assets/icons/field-types/Dotpoints_01-ENUM.svg';
import DateTypeIcon from '../assets/icons/field-types/CalendarDate-DATETIME.svg';
import LanguageTypeIcon from '../assets/icons/field-types/Translate_01-LANGUAGE.svg';
import LocationTypeIcon from '../assets/icons/field-types/MarkerPin-LOCATION.svg';

export function getFieldIcon(field: Pick<FieldDefinition, 'id' | 'type'>): string {
  if (field.id === 'language') return LanguageTypeIcon;
  if (field.id === 'location') return LocationTypeIcon;
  switch (field.type) {
    case 'boolean': return BooleanTypeIcon;
    case 'date': return DateTypeIcon;
    case 'enum': return EnumTypeIcon;
    default: return StringTypeIcon;
  }
}
