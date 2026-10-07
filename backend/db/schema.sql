CREATE DATABASE IF NOT EXISTS tixxgo CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE tixxgo;

CREATE TABLE IF NOT EXISTS bookings (
  id                    INT             NOT NULL AUTO_INCREMENT,
  tixxgo_ref            VARCHAR(20)     NOT NULL,
  tixxgo_result_id      VARCHAR(36)     NOT NULL,
  flight_number         VARCHAR(20)     NOT NULL,
  airline               VARCHAR(10)     NOT NULL,
  origin                VARCHAR(10)     NOT NULL,
  destination           VARCHAR(10)     NOT NULL,
  departure_time        DATETIME        NOT NULL,
  arrival_time          DATETIME        NOT NULL,
  baggage               VARCHAR(20)     NOT NULL,
  refundable            BOOLEAN         NOT NULL,
  supplier              VARCHAR(50)     NOT NULL,
  supplier_result_id    VARCHAR(100)    NOT NULL,
  supplier_pnr          VARCHAR(100)    NULL,
  supplier_cost         DECIMAL(10,2)   NOT NULL,
  base_fare             DECIMAL(10,2)   NOT NULL,
  taxes                 DECIMAL(10,2)   NOT NULL,
  service_fee           DECIMAL(10,2)   NOT NULL,
  discount              DECIMAL(10,2)   NOT NULL,
  customer_total        DECIMAL(10,2)   NOT NULL,
  payment_status        ENUM(
                          'PAYMENT_PENDING',
                          'PAYMENT_SUCCESS',
                          'PAYMENT_FAILED',
                          'REFUND_PENDING',
                          'REFUNDED'
                        ) NOT NULL DEFAULT 'PAYMENT_PENDING',
  booking_status        ENUM(
                          'INITIATED',
                          'SUPPLIER_BOOKING',
                          'BOOKING_CONFIRMED',
                          'BOOKING_FAILED',
                          'UNKNOWN',
                          'CANCELLATION_REQUESTED',
                          'CANCELLED'
                        ) NOT NULL DEFAULT 'INITIATED',
  ticketing_status      ENUM(
                          'NOT_ISSUED',
                          'ISSUED',
                          'CANCELLED'
                        ) NOT NULL DEFAULT 'NOT_ISSUED',
  idempotency_key       VARCHAR(100)    NOT NULL,
  cancellation_ref      VARCHAR(100)    NULL,
  airline_cancel_charge DECIMAL(10,2)   NULL,
  tixxgo_cancel_fee     DECIMAL(10,2)   NULL,
  refund_amount         DECIMAL(10,2)   NULL,
  created_at            DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at            DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_tixxgo_ref (tixxgo_ref),
  UNIQUE KEY uq_idempotency_key (idempotency_key)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS travellers (
  id               INT          NOT NULL AUTO_INCREMENT,
  booking_id       INT          NOT NULL,
  first_name       VARCHAR(100) NOT NULL,
  last_name        VARCHAR(100) NOT NULL,
  email            VARCHAR(200) NOT NULL,
  phone            VARCHAR(20)  NOT NULL,
  date_of_birth    DATE         NOT NULL,
  passport_number  VARCHAR(50)  NULL,
  nationality      VARCHAR(10)  NULL,
  created_at       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_traveller_booking FOREIGN KEY (booking_id) REFERENCES bookings (id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS booking_status_logs (
  id               INT          NOT NULL AUTO_INCREMENT,
  booking_id       INT          NOT NULL,
  previous_status  VARCHAR(50)  NULL,
  new_status       VARCHAR(50)  NOT NULL,
  status_type      ENUM('payment', 'booking', 'ticketing') NOT NULL,
  reason           VARCHAR(500) NULL,
  created_at       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_log_booking FOREIGN KEY (booking_id) REFERENCES bookings (id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS pricing_snapshots (
  id             INT           NOT NULL AUTO_INCREMENT,
  booking_id     INT           NOT NULL,
  supplier_cost  DECIMAL(10,2) NOT NULL,
  base_fare      DECIMAL(10,2) NOT NULL,
  taxes          DECIMAL(10,2) NOT NULL,
  service_fee    DECIMAL(10,2) NOT NULL,
  discount       DECIMAL(10,2) NOT NULL,
  customer_total DECIMAL(10,2) NOT NULL,
  created_at     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_snapshot_booking FOREIGN KEY (booking_id) REFERENCES bookings (id)
) ENGINE=InnoDB;
