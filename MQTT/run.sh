docker-compose up -d

docker exec -it postgresql psql -U postgres -d thingsboard_mqtt_broker

CREATE TABLE IF NOT EXISTS tb_schema_settings
(
    schema_version bigint NOT NULL,
    CONSTRAINT tb_schema_settings_pkey PRIMARY KEY (schema_version)
);

CREATE OR REPLACE PROCEDURE insert_tb_schema_settings()
    LANGUAGE plpgsql AS
$$
BEGIN
    IF (SELECT COUNT(*) FROM tb_schema_settings) = 0 THEN
        INSERT
        INTO tb_schema_settings (schema_version)
        VALUES (1004000);
    END IF;
END;
$$;

call insert_tb_schema_settings();

CREATE TABLE IF NOT EXISTS admin_settings (
    id uuid NOT NULL CONSTRAINT admin_settings_pkey PRIMARY KEY,
    created_time bigint NOT NULL,
    json_value varchar,
    key varchar(255)
);

CREATE TABLE IF NOT EXISTS broker_user (
    id uuid NOT NULL CONSTRAINT broker_user_pkey PRIMARY KEY,
    created_time bigint NOT NULL,
    additional_info varchar,
    authority varchar(255),
    email varchar(255) UNIQUE,
    first_name varchar(255),
    last_name varchar(255),
    search_text varchar(255)
);

CREATE TABLE IF NOT EXISTS user_credentials (
    id uuid NOT NULL CONSTRAINT user_credentials_pkey PRIMARY KEY,
    created_time bigint NOT NULL,
    activate_token varchar(255) UNIQUE,
    enabled boolean,
    password varchar(255),
    reset_token varchar(255) UNIQUE,
    user_id uuid UNIQUE
);

CREATE TABLE IF NOT EXISTS mqtt_client_credentials (
    id uuid NOT NULL CONSTRAINT mqtt_client_credentials_pkey PRIMARY KEY,
    created_time bigint NOT NULL,
    name varchar(255),
    client_type varchar(255),
    credentials_id varchar,
    credentials_type varchar(255),
    credentials_value varchar,
    search_text varchar(255),
    CONSTRAINT mqtt_client_credentials_id_unq_key UNIQUE (credentials_id)
);

CREATE TABLE IF NOT EXISTS device_publish_msg (
    client_id varchar(255) NOT NULL,
    serial_number bigint NOT NULL,
    topic varchar NOT NULL,
    time bigint NOT NULL,
    packet_id int,
    packet_type varchar(255),
    qos int NOT NULL,
    payload bytea NOT NULL,
    user_properties varchar,
    retain boolean,
    msg_expiry_interval int,
    payload_format_indicator int,
    content_type varchar(255),
    response_topic varchar(255),
    correlation_data bytea,
    CONSTRAINT device_publish_msg_pkey PRIMARY KEY (client_id, serial_number)
);

CREATE TABLE IF NOT EXISTS device_session_ctx (
    client_id varchar(255) NOT NULL CONSTRAINT device_session_ctx_pkey PRIMARY KEY,
    last_updated_time bigint NOT NULL,
    last_serial_number bigint,
    last_packet_id int
);

CREATE TABLE IF NOT EXISTS application_session_ctx (
    client_id varchar(255) NOT NULL CONSTRAINT application_session_ctx_pkey PRIMARY KEY,
    last_updated_time bigint NOT NULL,
    publish_msg_infos varchar,
    pubrel_msg_infos varchar
);

CREATE TABLE IF NOT EXISTS generic_client_session_ctx (
    client_id varchar(255) NOT NULL CONSTRAINT generic_client_session_ctx_pkey PRIMARY KEY,
    last_updated_time bigint NOT NULL,
    qos2_publish_packet_ids varchar
);

CREATE TABLE IF NOT EXISTS application_shared_subscription (
    id uuid NOT NULL CONSTRAINT application_shared_subscription_pkey PRIMARY KEY,
    created_time bigint NOT NULL,
    topic varchar NOT NULL,
    partitions int NOT NULL,
    name varchar(255),
    search_text varchar(255),
    CONSTRAINT application_shared_subscription_topic_unq_key UNIQUE (topic)
);

CREATE TABLE IF NOT EXISTS ts_kv (
    entity_id varchar (255) NOT NULL,
    key int NOT NULL,
    ts bigint NOT NULL,
    long_v bigint,
    CONSTRAINT ts_kv_pkey PRIMARY KEY (entity_id, key, ts)
) PARTITION BY RANGE (ts);

CREATE TABLE IF NOT EXISTS ts_kv_dictionary (
    key varchar (255) NOT NULL,
    key_id serial UNIQUE,
    CONSTRAINT ts_key_id_pkey PRIMARY KEY (key)
);

CREATE TABLE IF NOT EXISTS websocket_connection (
    id uuid NOT NULL CONSTRAINT websocket_connection_pkey PRIMARY KEY,
    created_time bigint NOT NULL,
    name varchar (255) NOT NULL,
    user_id uuid NOT NULL,
    configuration jsonb,
    search_text varchar (255),
    CONSTRAINT name_unq_key UNIQUE (user_id, name),
    CONSTRAINT fk_user_id
    FOREIGN KEY (user_id) REFERENCES broker_user (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS websocket_subscription (
    id uuid NOT NULL CONSTRAINT websocket_subscription_pkey PRIMARY KEY,
    created_time bigint NOT NULL,
    websocket_connection_id uuid NOT NULL,
    configuration jsonb,
    CONSTRAINT fk_websocket_connection_id
    FOREIGN KEY (websocket_connection_id) REFERENCES websocket_connection (id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_device_publish_msg_packet_id ON device_publish_msg(client_id, packet_id);

INSERT INTO broker_user (id, created_time, email, authority)
VALUES ('5a797660-4612-11e7-a919-92ebcb67fe33', 1592576748000, 'sysadmin@thingsboard.org', 'SYS_ADMIN');

INSERT INTO user_credentials (id, created_time, user_id, enabled, password)
VALUES ('61441950-4612-11e7-a919-92ebcb67fe33', 1592576748000, '5a797660-4612-11e7-a919-92ebcb67fe33', true,
        '$2a$10$5JTB8/hxWc9WAy62nCGSxeefl3KWmipA9nFpVdDa0/xfIseeBB4Bu');

/* System settings */
INSERT INTO admin_settings (id, created_time, key, json_value)
VALUES ('6a2266e4-4612-11e7-a919-92ebcb67fe33', 1592576748000, 'general', '{
	"baseUrl": "http://localhost:8083"
}');

INSERT INTO admin_settings (id, created_time, key, json_value)
VALUES ('6eaaefa6-4612-11e7-a919-92ebcb67fe33', 1592576748000, 'mail', '{
	"mailFrom": "Thingsboard <sysadmin@localhost.localdomain>",
	"smtpProtocol": "smtp",
	"smtpHost": "localhost",
	"smtpPort": "25",
	"timeout": "10000",
	"enableTls": false,
	"tlsVersion": "TLSv1.2",
	"username": "",
	"password": ""
}');

