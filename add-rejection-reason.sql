-- Add rejection reason and resubmission fields to releases table

-- Add rejection_reason column to store admin's custom reason
ALTER TABLE releases ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- Add allow_resubmission column to control if user can edit and resubmit
ALTER TABLE releases ADD COLUMN IF NOT EXISTS allow_resubmission BOOLEAN DEFAULT true;

-- Add rejected_at timestamp
ALTER TABLE releases ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMP WITH TIME ZONE;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_releases_rejection ON releases(status, allow_resubmission) WHERE status = 'REJECTED';

-- Verify columns
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'releases'
AND column_name IN ('rejection_reason', 'allow_resubmission', 'rejected_at')
ORDER BY column_name;
