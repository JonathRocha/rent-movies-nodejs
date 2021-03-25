CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "hstore";

CREATE OR REPLACE FUNCTION update_timestamp() RETURNS TRIGGER AS $$
DECLARE
    _column text := quote_ident(TG_ARGV[0]);
BEGIN
    NEW := NEW #= hstore(_column, CAST(NOW() AS TEXT));
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';
