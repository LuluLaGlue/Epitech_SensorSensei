CREATE TABLE IF NOT EXISTS 'data' (
    'id' varchar(10) NOT NULL PRIMARY KEY,
    'timestamp' datetime NOT NULL,
    'lat' FLOAT NOT NULL,
    'long' FLOAT NOT NULL,
    'alt' FLOAT NOT NULL,
    'humidity' FLOAT,
    'temperature' FLOAT,
    'pressure' FLOAT,
    'noise' FLOAT,
    'pm' FLOAT,
    'aqi_us' FLOAT,
    'position' FLOAT
);
