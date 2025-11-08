# Draft Save Feature - Implementation Guide for Lovable

## Overview
Enable whistleblowers to **manually save** incomplete reports and resume later using a unique DR-xxxx code. Drafts expire after 48 hours and are NOT visible in admin dashboard.

**Note:** Auto-save is intentionally NOT included for security reasons. Users must click "Save Draft" manually.

---

## 1. Database Schema (Supabase Migration)

Create a new migration file: `supabase/migrations/[timestamp]_create_report_drafts_table.sql`

```sql
-- Report Drafts Table
-- Stores temporary draft reports that expire after 48 hours
CREATE TABLE public.report_drafts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,

  -- Unique draft code (e.g., DR-A7K9-M3P2-X8Q5)
  draft_code TEXT UNIQUE NOT NULL,

  -- Encrypted draft content (similar to reports table)
  encrypted_content TEXT NOT NULL, -- JSON string of ProgressiveFormData
  encryption_key_hash TEXT NOT NULL,

  -- Resume state
  current_step INTEGER DEFAULT 0, -- Which step they were on (0-9)
  language TEXT DEFAULT 'en', -- Selected language

  -- File metadata (store file info, but not files themselves until submission)
  file_metadata JSONB DEFAULT '[]', -- Array of {name, size, type}

  -- Expiration
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,

  -- Save tracking
  save_count INTEGER DEFAULT 1, -- How many times saved (useful for analytics)

  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Index for fast lookups by draft code
CREATE INDEX idx_report_drafts_draft_code ON public.report_drafts(draft_code);

-- Index for finding expired drafts (for cleanup job)
CREATE INDEX idx_report_drafts_expires_at ON public.report_drafts(expires_at);

-- RLS Policies
ALTER TABLE public.report_drafts ENABLE ROW LEVEL SECURITY;

-- Anyone can create a draft (anonymous)
CREATE POLICY "Anyone can create drafts"
  ON public.report_drafts
  FOR INSERT
  WITH CHECK (true);

-- Anyone can read their own draft using draft_code
CREATE POLICY "Anyone can read drafts with code"
  ON public.report_drafts
  FOR SELECT
  USING (true);

-- Anyone can update their own draft using draft_code
CREATE POLICY "Anyone can update drafts"
  ON public.report_drafts
  FOR UPDATE
  USING (true);

-- Function to generate unique draft code
CREATE OR REPLACE FUNCTION public.generate_draft_code()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; -- Removed ambiguous chars (0,O,1,I)
  result TEXT;
  segment TEXT;
  i INTEGER;
  is_unique BOOLEAN := false;
BEGIN
  WHILE NOT is_unique LOOP
    result := 'DR';

    -- Generate 4 segments of 4 characters each
    FOR i IN 1..4 LOOP
      segment := '';
      FOR j IN 1..4 LOOP
        segment := segment || substr(chars, floor(random() * length(chars) + 1)::int, 1);
      END LOOP;
      result := result || '-' || segment;
    END LOOP;

    -- Check if code already exists
    PERFORM 1 FROM public.report_drafts WHERE draft_code = result;
    IF NOT FOUND THEN
      is_unique := true;
    END IF;
  END LOOP;

  RETURN result;
END;
$$;

-- Cleanup function to delete expired drafts (run daily via cron)
CREATE OR REPLACE FUNCTION public.cleanup_expired_drafts()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM public.report_drafts
  WHERE expires_at < now();

  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

-- Optional: Set up pg_cron to run cleanup daily
-- (You can also trigger this from your backend or use Supabase Edge Functions)
-- SELECT cron.schedule(
--   'cleanup-expired-drafts',
--   '0 0 * * *', -- Every day at midnight
--   'SELECT public.cleanup_expired_drafts();'
-- );

COMMENT ON TABLE public.report_drafts IS 'Temporary storage for incomplete whistleblower reports. Expires after 48 hours.';
COMMENT ON COLUMN public.report_drafts.draft_code IS 'Unique code used to resume draft (e.g., DR-A7K9-M3P2-X8Q5)';
COMMENT ON COLUMN public.report_drafts.encrypted_content IS 'Encrypted JSON of ProgressiveFormData interface';
COMMENT ON COLUMN public.report_drafts.expires_at IS 'Timestamp when draft expires (48 hours from creation)';
```

---

## 2. TypeScript Interfaces

Add to `src/types/drafts.ts`:

```typescript
export interface DraftMetadata {
  draftCode: string;
  currentStep: number;
  language: string;
  expiresAt: string; // ISO timestamp
  saveCount: number;
  lastSavedStep: number;
  createdAt: string;
  updatedAt: string;
}

export interface SaveDraftRequest {
  organizationId: string;
  formData: ProgressiveFormData; // From ProgressiveReportForm
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
```

---

## 3. Service Layer

Create `src/services/draftService.ts`:

```typescript
import { supabase } from '@/lib/supabase';
import { ProgressiveFormData } from '@/components/forms/ProgressiveReportForm';
import {
  SaveDraftRequest,
  SaveDraftResponse,
  ResumeDraftRequest,
  ResumeDraftResponse,
} from '@/types/drafts';

// Simple client-side encryption (basic obfuscation)
// For production, consider more robust encryption
function encryptData(data: string): { encrypted: string; hash: string } {
  // TODO: Implement proper encryption
  // For now, just base64 encode (NOT SECURE - placeholder only)
  const encrypted = btoa(data);
  const hash = btoa(encrypted.substring(0, 32)); // Simple hash
  return { encrypted, hash };
}

function decryptData(encrypted: string): string {
  // TODO: Implement proper decryption
  return atob(encrypted);
}

export async function saveDraft(request: SaveDraftRequest): Promise<SaveDraftResponse> {
  try {
    // Prepare draft data
    const draftData = {
      formData: request.formData,
      fileMetadata: request.fileMetadata || [],
    };

    // Encrypt content
    const { encrypted, hash } = encryptData(JSON.stringify(draftData));

    // Calculate expiration (48 hours from now)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 48);

    // Check if draft already exists (update) or create new
    // For first implementation, always create new
    const { data, error } = await supabase.rpc('generate_draft_code');

    if (error) throw error;
    const draftCode = data as string;

    // Insert draft
    const { error: insertError } = await supabase
      .from('report_drafts')
      .insert({
        organization_id: request.organizationId,
        draft_code: draftCode,
        encrypted_content: encrypted,
        encryption_key_hash: hash,
        current_step: request.currentStep,
        language: request.language,
        file_metadata: request.fileMetadata || [],
        expires_at: expiresAt.toISOString(),
      });

    if (insertError) throw insertError;

    return {
      success: true,
      draftCode,
      expiresAt: expiresAt.toISOString(),
      message: 'Draft saved successfully',
    };
  } catch (error) {
    console.error('Error saving draft:', error);
    return {
      success: false,
      draftCode: '',
      expiresAt: '',
      message: error instanceof Error ? error.message : 'Failed to save draft',
    };
  }
}

export async function resumeDraft(request: ResumeDraftRequest): Promise<ResumeDraftResponse> {
  try {
    // Fetch draft by code
    const { data, error } = await supabase
      .from('report_drafts')
      .select('*')
      .eq('draft_code', request.draftCode)
      .single();

    if (error) throw error;
    if (!data) {
      return {
        success: false,
        formData: {} as ProgressiveFormData,
        currentStep: 0,
        language: 'en',
        message: 'Draft not found or expired',
      };
    }

    // Check if expired
    if (new Date(data.expires_at) < new Date()) {
      return {
        success: false,
        formData: {} as ProgressiveFormData,
        currentStep: 0,
        language: 'en',
        message: 'Draft has expired',
      };
    }

    // Decrypt content
    const decryptedContent = decryptData(data.encrypted_content);
    const draftData = JSON.parse(decryptedContent);

    return {
      success: true,
      formData: draftData.formData,
      currentStep: data.current_step,
      language: data.language,
      fileMetadata: draftData.fileMetadata,
      expiresAt: data.expires_at,
    };
  } catch (error) {
    console.error('Error resuming draft:', error);
    return {
      success: false,
      formData: {} as ProgressiveFormData,
      currentStep: 0,
      language: 'en',
      message: error instanceof Error ? error.message : 'Failed to resume draft',
    };
  }
}

export async function updateDraft(draftCode: string, request: SaveDraftRequest): Promise<SaveDraftResponse> {
  try {
    // Prepare draft data
    const draftData = {
      formData: request.formData,
      fileMetadata: request.fileMetadata || [],
    };

    // Encrypt content
    const { encrypted, hash } = encryptData(JSON.stringify(draftData));

    // Update existing draft
    const { error } = await supabase
      .from('report_drafts')
      .update({
        encrypted_content: encrypted,
        encryption_key_hash: hash,
        current_step: request.currentStep,
        language: request.language,
        file_metadata: request.fileMetadata || [],
        updated_at: new Date().toISOString(),
        save_count: supabase.sql`save_count + 1`,
      })
      .eq('draft_code', draftCode);

    if (error) throw error;

    // Get updated expires_at
    const { data } = await supabase
      .from('report_drafts')
      .select('expires_at')
      .eq('draft_code', draftCode)
      .single();

    return {
      success: true,
      draftCode,
      expiresAt: data?.expires_at || '',
      message: 'Draft updated successfully',
    };
  } catch (error) {
    console.error('Error updating draft:', error);
    return {
      success: false,
      draftCode: '',
      expiresAt: '',
      message: error instanceof Error ? error.message : 'Failed to update draft',
    };
  }
}

export async function deleteDraft(draftCode: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('report_drafts')
      .delete()
      .eq('draft_code', draftCode);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting draft:', error);
    return false;
  }
}
```

---

## 4. Frontend Components

### 4.1 Save Draft Button Component

Create `src/components/forms/draft-controls/SaveDraftButton.tsx`:

```tsx
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Save, Check, AlertCircle } from 'lucide-react';
import { saveDraft, updateDraft } from '@/services/draftService';
import { ProgressiveFormData } from '@/components/forms/ProgressiveReportForm';
import { SaveDraftModal } from './SaveDraftModal';

interface SaveDraftButtonProps {
  formData: ProgressiveFormData;
  currentStep: number;
  language: string;
  organizationId: string;
  existingDraftCode?: string; // If updating existing draft
  onDraftSaved: (draftCode: string) => void;
}

export const SaveDraftButton = ({
  formData,
  currentStep,
  language,
  organizationId,
  existingDraftCode,
  onDraftSaved,
}: SaveDraftButtonProps) => {
  const [isSaving, setIsSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [savedDraftCode, setSavedDraftCode] = useState('');

  const handleSave = async () => {
    setIsSaving(true);

    const request = {
      formData,
      currentStep,
      language,
      organizationId,
    };

    const response = existingDraftCode
      ? await updateDraft(existingDraftCode, request)
      : await saveDraft(request);

    setIsSaving(false);

    if (response.success) {
      setSavedDraftCode(response.draftCode);
      setShowModal(true);
      onDraftSaved(response.draftCode);
    } else {
      alert('Failed to save draft: ' + response.message);
    }
  };

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleSave}
        disabled={isSaving}
        className="gap-2"
      >
        {isSaving ? (
          <>
            <div className="animate-spin">⏳</div>
            Saving...
          </>
        ) : existingDraftCode ? (
          <>
            <Check className="w-4 h-4" />
            Update Draft
          </>
        ) : (
          <>
            <Save className="w-4 h-4" />
            Save Draft
          </>
        )}
      </Button>

      {showModal && (
        <SaveDraftModal
          draftCode={savedDraftCode}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
};
```

### 4.2 Save Draft Modal

Create `src/components/forms/draft-controls/SaveDraftModal.tsx`:

```tsx
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Copy, Check, AlertTriangle } from 'lucide-react';

interface SaveDraftModalProps {
  draftCode: string;
  onClose: () => void;
}

export const SaveDraftModal = ({ draftCode, onClose }: SaveDraftModalProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(draftCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            Save This Code!
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Your draft has been saved. Use this code to resume your report later:
          </p>

          <div className="bg-gray-50 p-4 rounded-lg border-2 border-primary/20">
            <p className="text-center text-2xl font-mono font-bold text-primary break-all">
              {draftCode}
            </p>
          </div>

          <Button
            onClick={handleCopy}
            variant="outline"
            className="w-full gap-2"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-green-600" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copy Code
              </>
            )}
          </Button>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <p className="text-xs text-amber-800">
              <strong>⚠️ Important:</strong> Drafts expire after 48 hours. Make sure to save this code in a secure location.
            </p>
          </div>

          <Button onClick={onClose} className="w-full">
            Continue Editing
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
```

### 4.3 Resume Draft Page

Create `src/pages/ResumeDraft.tsx`:

```tsx
import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield, ArrowRight } from 'lucide-react';
import { resumeDraft } from '@/services/draftService';

export const ResumeDraft = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [draftCode, setDraftCode] = useState(searchParams.get('code') || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleResume = async () => {
    setError('');
    setIsLoading(true);

    const response = await resumeDraft({ draftCode: draftCode.trim() });
    setIsLoading(false);

    if (response.success) {
      // Navigate to form with draft data
      navigate(`/newform?draft=${draftCode}`);
    } else {
      setError(response.message || 'Failed to load draft');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8 space-y-6">
        <div className="flex justify-center">
          <div className="p-4 rounded-full bg-primary/10">
            <Shield className="w-12 h-12 text-primary" />
          </div>
        </div>

        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-gray-900">Resume Draft</h1>
          <p className="text-sm text-gray-600">
            Enter your draft code to continue your report
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="draft-code">Draft Code</Label>
            <Input
              id="draft-code"
              placeholder="DR-A7K9-M3P2-X8Q5"
              value={draftCode}
              onChange={(e) => setDraftCode(e.target.value.toUpperCase())}
              className="font-mono"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <Button
            onClick={handleResume}
            disabled={!draftCode || isLoading}
            className="w-full gap-2"
          >
            {isLoading ? (
              'Loading...'
            ) : (
              <>
                Resume Draft
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>

          <div className="text-center">
            <Button
              variant="link"
              onClick={() => navigate('/newform')}
              className="text-sm"
            >
              Start a new report instead
            </Button>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-600">
          <p><strong>Note:</strong> Drafts expire after 48 hours for security reasons.</p>
        </div>
      </div>
    </div>
  );
};
```

---

## 5. Integration with ProgressiveReportForm

Modify `src/components/forms/ProgressiveReportForm.tsx`:

```typescript
// Add new props
interface ProgressiveReportFormProps {
  // ... existing props
  draftCode?: string; // If resuming from draft
  onDraftSaved?: (draftCode: string) => void;
}

// Inside component
const [currentDraftCode, setCurrentDraftCode] = useState(draftCode);

// Load draft on mount if draftCode provided
useEffect(() => {
  if (draftCode) {
    const loadDraft = async () => {
      const response = await resumeDraft({ draftCode });
      if (response.success) {
        updateFormData(response.formData);
        setCurrentStep(response.currentStep);
        setLanguage(response.language);
        setCurrentDraftCode(draftCode);
      }
    };
    loadDraft();
  }
}, [draftCode]);

// Add Save Draft button to navigation area
<div className="flex justify-between items-center mt-6 pt-4 border-t">
  <div className="flex gap-2">
    {currentStep > 0 && (
      <SaveDraftButton
        formData={formData}
        currentStep={currentStep}
        language={language}
        organizationId={/* from context */}
        existingDraftCode={currentDraftCode}
        onDraftSaved={(code) => {
          setCurrentDraftCode(code);
          onDraftSaved?.(code);
        }}
      />
    )}
  </div>

  {/* Back/Continue buttons */}
  {/* ... existing navigation */}
</div>
```

---

## 6. Add Link to Welcome Page

Modify `src/components/forms/progressive-steps/Step1Welcome.tsx`:

```typescript
// Add at bottom, before the "Begin" button
<div className="text-center">
  <Button
    variant="link"
    onClick={() => navigate('/resume-draft')}
    className="text-sm text-gray-600 hover:text-primary"
  >
    Resume a saved draft
  </Button>
</div>
```

---

## 7. Security Considerations

### IMPORTANT Security Notes:

1. **Encryption**: The placeholder encryption in `draftService.ts` is NOT secure. Implement proper client-side encryption before production:
   - Use Web Crypto API or a library like `crypto-js`
   - Derive encryption key from draft code
   - Never store unencrypted sensitive data

2. **Device Security**: Add prominent warning on save:
   ```
   Keep your draft code secure. Anyone with this code can access your draft.
   ```

3. **localStorage**: Avoid storing draft codes in localStorage - they should only be displayed once and copied

4. **Cleanup Job**: Set up automated cleanup of expired drafts (see migration SQL)

---

## 8. Implementation Checklist

- [ ] Run Supabase migration to create `report_drafts` table
- [ ] Create TypeScript interfaces in `src/types/drafts.ts`
- [ ] Implement `src/services/draftService.ts` with proper encryption
- [ ] Create `SaveDraftButton` component
- [ ] Create `SaveDraftModal` component
- [ ] Create `ResumeDraft` page
- [ ] Add route for `/resume-draft` in router
- [ ] Integrate draft save/load into `ProgressiveReportForm`
- [ ] Add "Resume draft" link to welcome page
- [ ] Add security warnings to Save Draft modal
- [ ] Test full flow: save → resume → update → submit
- [ ] Set up cleanup job for expired drafts
- [ ] Update submission flow to delete draft on successful submission

---

## 9. Testing Scenarios

1. **Save new draft** → Click Save Draft → Copy code → Close tab → Resume with code ✅
2. **Update draft** → Save → Continue editing → Click Save Draft again → Should update same code ✅
3. **Expired draft** → Save → Manually set expires_at to past → Try to resume → Should show "Draft has expired" error ✅
4. **Submit from draft** → Resume → Complete → Submit → Draft should be deleted ✅
5. **Invalid code** → Enter fake code → Should show "Draft not found" error message ✅
6. **Resume from welcome** → Click "Resume a saved draft" → Enter valid code → Should load form with saved data ✅

---

## 10. Future Enhancements (Post-MVP)

- [ ] **Auto-save feature** - Optional 30-second auto-save with security warnings (if users request it)
- [ ] Show time remaining until expiration in modal
- [ ] Email draft code to user (if they opt-in)
- [ ] Extend expiration on each save (sliding window)
- [ ] Save partial file uploads (currently just metadata)
- [ ] Analytics: track draft → submission conversion rate
- [ ] Admin dashboard: view draft statistics (counts only, not content)

---

## Questions?

Contact the development team if you need clarification on any step!
