DROP TABLE IF EXISTS losers;

CREATE TABLE losers (
  name TEXT,
  phoneNumber TEXT NOT NULL UNIQUE,
  threadTs TEXT UNIQUE,
  blocked BOOLEAN DEFAULT false,
  PRIMARY KEY (`phoneNumber`)
);