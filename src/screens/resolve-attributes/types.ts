import type { CustomAttribute } from '@/types';
import type { RequiredAttributeValue } from '@/utils/attributeUtils';

export type AttributeFieldProps = {
  attribute: CustomAttribute;
  value: RequiredAttributeValue;
  error: string | null;
  onChange: (value: RequiredAttributeValue) => void;
  onBlur: () => void;
};
