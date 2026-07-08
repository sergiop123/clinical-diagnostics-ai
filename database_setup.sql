-- ============================================================
-- Clinical Diagnostics AI - Database Admin Script
-- Jade Global Internship 2026
-- ============================================================
-- Consolidated schema for storing medical image analysis results.
-- Compatible with Snowflake and Databricks.
-- Run this once to set up the database schema on either platform.
-- ============================================================


-- ============================================================
-- SNOWFLAKE SETUP
-- ============================================================
-- Uncomment and run these on a Snowflake worksheet.

-- CREATE DATABASE IF NOT EXISTS CLINICAL_DIAGNOSTICS;
-- USE DATABASE CLINICAL_DIAGNOSTICS;
-- CREATE SCHEMA IF NOT EXISTS DIAGNOSTICS_SCHEMA;
-- USE SCHEMA DIAGNOSTICS_SCHEMA;

-- CREATE TABLE IF NOT EXISTS analysis_results (
--     id          INTEGER AUTOINCREMENT PRIMARY KEY,
--     filename    VARCHAR(500),
--     modality    VARCHAR(50),
--     finding     VARCHAR(2000),
--     timestamp   TIMESTAMP_NTZ DEFAULT CURRENT_TIMESTAMP()
-- );


-- ============================================================
-- DATABRICKS SETUP
-- ============================================================
-- Uncomment and run these in a Databricks SQL editor or notebook.

-- CREATE CATALOG IF NOT EXISTS clinical_diagnostics;
-- USE CATALOG clinical_diagnostics;
-- CREATE SCHEMA IF NOT EXISTS diagnostics_schema;
-- USE SCHEMA diagnostics_schema;

-- CREATE TABLE IF NOT EXISTS analysis_results (
--     id          BIGINT GENERATED ALWAYS AS IDENTITY,
--     filename    STRING,
--     modality    STRING,
--     finding     STRING,
--     timestamp   TIMESTAMP DEFAULT CURRENT_TIMESTAMP()
-- );


-- ============================================================
-- REFERENCE QUERIES (both platforms)
-- ============================================================

-- View all analysis results (most recent first):
-- SELECT * FROM analysis_results ORDER BY timestamp DESC;

-- Count analyses by modality:
-- SELECT modality, COUNT(*) AS total FROM analysis_results GROUP BY modality;

-- Most common findings:
-- SELECT finding, COUNT(*) AS occurrences FROM analysis_results GROUP BY finding ORDER BY occurrences DESC;