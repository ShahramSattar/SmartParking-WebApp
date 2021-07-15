

\c smartparking;

CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        UserID VARCHAR(128) NOT NULL,
        geom geometry(Point,4326),
        Destination VARCHAR(128),
        geomD geometry(Point,4326),
        TravelDistance FLOAT,
        TravelTime FLOAT,
        TimeofLoc TIMESTAMP
);
