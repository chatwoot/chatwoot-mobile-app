import type { Company } from '@/types/Company';

export const getCompanyAvatarUrl = (company?: Pick<Company, 'avatarUrl' | 'thumbnail'> | null) =>
  company?.avatarUrl || company?.thumbnail || '';
