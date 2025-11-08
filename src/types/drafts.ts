import { ProgressiveFormData } from '@/components/forms/ProgressiveReportForm';

export interface DraftMetadata {
  draftCode: string;
  currentStep: number;
  language: string;
  expiresAt: string;
  saveCount: number;
  lastSavedStep: number;
  createdAt: string;
  updatedAt: string;
}

export interface SaveDraftRequest {
  organizationId: string;
  formData: ProgressiveFormData;
  currentStep: number;
  language: string;
  fileMetadata?: Array<{
    name: string;
    size: number;
    type: string;
  }>;
}

export interface SaveDraftResponse {
  success: boolean;
  draftCode: string;
  expiresAt: string;
  message: string;
}

export interface ResumeDraftRequest {
  draftCode: string;
}

export interface ResumeDraftResponse {
  success: boolean;
  formData: ProgressiveFormData;
  currentStep: number;
  language: string;
  fileMetadata?: Array<{
    name: string;
    size: number;
    type: string;
  }>;
  expiresAt: string;
  message?: string;
}
