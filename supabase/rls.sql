-- ============================================================
-- Who Am I? — Row-Level Security Policies
-- ============================================================

-- ------------------------------------------------------------
-- Categories: public read access
-- ------------------------------------------------------------
CREATE POLICY "categories_public_read"
  ON categories
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- ------------------------------------------------------------
-- Images: public read access
-- (URLs alone are not sensitive; the API controls which
--  images get sent to which player)
-- ------------------------------------------------------------
CREATE POLICY "images_public_read"
  ON images
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- ------------------------------------------------------------
-- Rooms: service role only
-- All room CRUD goes through API routes that use the
-- service role key, so no direct client access is needed.
-- No policies = deny all for anon/authenticated.
-- ------------------------------------------------------------
-- (No SELECT/INSERT/UPDATE/DELETE policies for rooms —
--  only the service_role can access them.)
