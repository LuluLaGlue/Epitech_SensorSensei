CREATE TABLE IF NOT EXISTS 'data' (
    'id' varchar(10) NOT NULL ,
    'timestamp' INTEGER NOT NULL PRIMARY KEY,
    'lat' FLOAT NOT NULL,
    'long' FLOAT NOT NULL,
    'alt' FLOAT NOT NULL,
    'humidity' FLOAT,
    'temperature' FLOAT,
    'pressure' FLOAT,
    'p1' FLOAT,
    'p2' FLOAT,
    'aqi_us' FLOAT
);
