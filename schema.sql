DROP TABLE IF EXISTS losers;

CREATE TABLE losers (
  name TEXT,
  phoneNumber TEXT NOT NULL,
  threadTs TEXT NOT NULL,
  blocked BOOLEAN DEFAULT false,
  PRIMARY KEY (`phoneNumber`)
);