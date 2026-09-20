-- Initialize database extensions for BK-Store
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS vector;

-- Confirmation query
SELECT * FROM pg_extension WHERE extname IN ('uuid-ossp', 'vector');
