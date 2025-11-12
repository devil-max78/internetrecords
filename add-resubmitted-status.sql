-- Add RESUBMITTED status to releases

-- First, check current status enum values
SELECT enumlabel 
FROM pg_enum 
WHERE enumtypid = (
  SELECT oid 
  FROM pg_type 
  WHERE typname = 'release_status'
);

-- Add RESUBMITTED to the enum if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumlabel = 'RESUBMITTED' 
    AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'release_status')
  ) THEN
    ALTER TYPE release_status ADD VALUE 'RESUBMITTED';
  END IF;
END $$;

-- Verify the new status was added
SELECT enumlabel 
FROM pg_enum 
WHERE enumtypid = (
  SELECT oid 
  FROM pg_type 
  WHERE typname = 'release_status'
)
ORDER BY enumsortorder;
