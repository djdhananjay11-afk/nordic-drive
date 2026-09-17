CREATE TABLE "LoginThrottle" (
  "key" TEXT NOT NULL PRIMARY KEY,
  "attempts" INTEGER NOT NULL,
  "resetAt" TIMESTAMP(3) NOT NULL
);
ALTER TABLE "LoginThrottle" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE "LoginThrottle" FROM PUBLIC;
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
    REVOKE ALL ON TABLE "LoginThrottle" FROM anon;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
    REVOKE ALL ON TABLE "LoginThrottle" FROM authenticated;
  END IF;
END $$;
