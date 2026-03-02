import type { FieldDefinition } from '../types';
import { ISO_639_3_LANGUAGES } from './languages';

const YES_NO_OPTIONS = [
  { label: 'Yes', value: 'true' },
  { label: 'No', value: 'false' },
];

export const DEFAULT_FIELDS: FieldDefinition[] = [
  { id: 'name',     label: 'Name',     type: 'text',    source: 'default' },
  { id: 'surname',  label: 'Surname',  type: 'text',    source: 'default' },
  { id: 'location', label: 'Location', type: 'text',    source: 'default' },
  { id: 'opted_in', label: 'Opted In', type: 'boolean', source: 'default', options: YES_NO_OPTIONS },
  { id: 'language', label: 'Language', type: 'enum',    source: 'default', options: ISO_639_3_LANGUAGES },
  { id: 'birthday', label: 'Birthday', type: 'date',    source: 'default' },
  { id: 'is_blocked', label: 'Is Blocked', type: 'boolean', source: 'default', options: YES_NO_OPTIONS },
  {
    id: 'status',
    label: 'Status',
    type: 'enum',
    source: 'default',
    options: [
      { label: 'Active',   value: 'active'   },
      { label: 'Inactive', value: 'inactive' },
      { label: 'Pending',  value: 'pending'  },
    ],
  },
];

const CUSTOM_FIELDS: FieldDefinition[] = [
  { id: 'whatsapp_profile_name', label: 'WhatsApp Profile Name', type: 'text', source: 'custom' },
  { id: 'patient_id',            label: 'Patient ID',            type: 'text', source: 'custom' },
  { id: 'national_id',           label: 'National ID',           type: 'text', source: 'custom' },
  { id: 'clinic_name',           label: 'Clinic Name',           type: 'text', source: 'custom' },
  { id: 'case_worker',           label: 'Case Worker',           type: 'text', source: 'custom' },
  { id: 'referral_source',       label: 'Referral Source',       type: 'text', source: 'custom' },
  { id: 'marketing_opt_in',    label: 'Marketing Opt In',    type: 'boolean', source: 'custom', options: YES_NO_OPTIONS },
  { id: 'completed_onboarding', label: 'Completed Onboarding', type: 'boolean', source: 'custom', options: YES_NO_OPTIONS },
  { id: 'needs_follow_up',     label: 'Needs Follow Up',     type: 'boolean', source: 'custom', options: YES_NO_OPTIONS },
  { id: 'registration_date',    label: 'Registration Date',    type: 'date', source: 'custom' },
  { id: 'next_appointment',     label: 'Next Appointment',     type: 'date', source: 'custom' },
  { id: 'last_interaction_date', label: 'Last Interaction Date', type: 'date', source: 'custom' },
  {
    id: 'programme',
    label: 'Programme',
    type: 'enum',
    source: 'custom',
    options: [
      { label: 'MomConnect',    value: 'momconnect'   },
      { label: 'HealthAlert',   value: 'healthalert'  },
      { label: 'TB Check',      value: 'tb_check'     },
      { label: 'COVID Vaccine', value: 'covid_vaccine' },
    ],
  },
  {
    id: 'risk_level',
    label: 'Risk Level',
    type: 'enum',
    source: 'custom',
    options: [
      { label: 'Low',    value: 'low'    },
      { label: 'Medium', value: 'medium' },
      { label: 'High',   value: 'high'   },
    ],
  },
  {
    id: 'support_tier',
    label: 'Support Tier',
    type: 'enum',
    source: 'custom',
    options: [
      { label: 'Self-service', value: 'self_service' },
      { label: 'Standard',     value: 'standard'     },
      { label: 'Priority',     value: 'priority'     },
    ],
  },
];

export const ALL_FIELDS: FieldDefinition[] = [...DEFAULT_FIELDS, ...CUSTOM_FIELDS];
