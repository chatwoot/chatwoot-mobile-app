export type Company = {
  id: number;
  name: string;
  description?: string | null;
  domain?: string | null;
  avatarUrl?: string | null;
  thumbnail?: string | null;
  contactsCount?: number;
  customAttributes?: Record<string, unknown>;
  additionalAttributes?: Record<string, unknown>;
};

export type CompanyAvatar = {
  uri: string;
  name: string;
  type: string;
};

export type UpdateCompanyPayload = {
  name: string;
  domain?: string | null;
  description?: string | null;
  avatar?: CompanyAvatar;
};

export type CompanyNote = {
  id: number;
  content: string;
  createdAt?: number | string;
  updatedAt?: number | string;
  user?: { id: number; name: string };
  contact?: CompanyContact | null;
};

export type CompanyContact = {
  id: number;
  name: string;
  email?: string | null;
  phoneNumber?: string | null;
  thumbnail?: string | null;
};

export type CompanyAPIResponse = {
  payload: Company;
};

export type CompanyListAPIResponse = {
  meta?: {
    count?: number;
    currentPage?: number;
    hasMore?: boolean;
    page?: number;
    totalCount?: number;
    totalPages?: number;
  };
  payload: Company[];
};

export type CompanyNotesAPIResponse = {
  payload: CompanyNote[];
};

export type CompanyNoteAPIResponse = {
  payload: CompanyNote;
};

export type CompanyContactsAPIResponse = {
  meta?: {
    totalCount?: number;
    page?: number;
  };
  payload: CompanyContact[];
};
