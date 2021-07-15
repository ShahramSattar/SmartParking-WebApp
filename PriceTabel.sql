
\c smartparking;

CREATE TABLE price (
        id SERIAL PRIMARY KEY,
        UserID VARCHAR(128) NOT NULL,
        PID VARCHAR(128) [],
        WDist FLOAT [],
        WDur FLOAT [],
        price json,
        SW json
);
