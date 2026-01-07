-- 1. Enable PostGIS Extension (Required for maps)
CREATE EXTENSION IF NOT EXISTS postgis;

-- 2. Create the Markers Table
CREATE TABLE IF NOT EXISTS markers (
    id SERIAL PRIMARY KEY,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255),
    address TEXT,
    lat DOUBLE PRECISION NOT NULL,
    lng DOUBLE PRECISION NOT NULL,
    notes TEXT,
    status VARCHAR(20) DEFAULT 'published',
    author VARCHAR(100),
    geom GEOMETRY(Point, 4326),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Create Spatial Index (Makes map searches fast)
CREATE INDEX IF NOT EXISTS markers_geom_idx ON markers USING GIST (geom);

-- 4. Initial Test Data (Optional - just to verify it works)
INSERT INTO markers (type, title, lat, lng, geom)
VALUES ('Test', 'First Database Marker', 31.5204, 74.3587, ST_SetSRID(ST_MakePoint(74.3587, 31.5204), 4326));
