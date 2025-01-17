CREATE TABLE IF NOT EXISTS user
(
    id         VARCHAR(36) PRIMARY KEY,
    last_login TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_location_x FLOAT DEFAULT 0,
    last_location_y FLOAT DEFAULT 0,
    last_gameId VARCHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS game_end
(
    id    VARCHAR(36) PRIMARY KEY,
    user_id    VARCHAR(36) NOT NULL,
    start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    end_time   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    score      INT       DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES user (id)
);

CREATE TABLE IF NOT EXISTS wave_end
(
    id    VARCHAR(36) PRIMARY KEY,
    user_id    VARCHAR(36) NOT NULL,
    start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    end_time   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    score      INT       DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES user (id)
);

CREATE TABLE IF NOT EXISTS items
(
    id         VARCHAR(36) PRIMARY KEY,
    user_id    VARCHAR(36) NOT NULL,
    item_code  INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user (id)
);
