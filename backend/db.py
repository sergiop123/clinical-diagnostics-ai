# ============================================================
# Clinical Diagnostics AI - Database Abstraction Layer
# Jade Global Internship 2026
# ============================================================
# Platform-agnostic database layer.
# Set DB_PLATFORM to "sqlite", "snowflake", or "databricks".
# The rest of the application only calls save_result() and
# get_history() — it never talks to a database directly.
# This means switching platforms requires no changes anywhere
# else in the codebase.
# ============================================================

import os
import sqlite3
from datetime import datetime

# Which database platform to use.
# Options: "sqlite" (default, local), "snowflake", "databricks"
DB_PLATFORM = os.getenv("DB_PLATFORM", "sqlite")

# Local SQLite database file
SQLITE_DB = "diagnostics.db"


# ============================================================
# SQLITE IMPLEMENTATION (working default)
# ============================================================
def _sqlite_init():
    conn = sqlite3.connect(SQLITE_DB)
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS analysis_results (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            filename TEXT,
            modality TEXT,
            finding TEXT,
            timestamp TEXT
        )
    """)
    conn.commit()
    conn.close()


def _sqlite_save(filename, modality, finding):
    conn = sqlite3.connect(SQLITE_DB)
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO analysis_results (filename, modality, finding, timestamp) VALUES (?, ?, ?, ?)",
        (filename, modality, finding, datetime.now().isoformat())
    )
    conn.commit()
    conn.close()


def _sqlite_history():
    conn = sqlite3.connect(SQLITE_DB)
    cursor = conn.cursor()
    cursor.execute("SELECT filename, modality, finding, timestamp FROM analysis_results ORDER BY id DESC")
    rows = cursor.fetchall()
    conn.close()
    return [
        {"filename": r[0], "modality": r[1], "finding": r[2], "timestamp": r[3]}
        for r in rows
    ]


# ============================================================
# SNOWFLAKE IMPLEMENTATION
# ============================================================
def _snowflake_connect():
    import snowflake.connector
    return snowflake.connector.connect(
        account=os.getenv("SNOWFLAKE_ACCOUNT"),
        user=os.getenv("SNOWFLAKE_USER"),
        password=os.getenv("SNOWFLAKE_PASSWORD"),
        warehouse=os.getenv("SNOWFLAKE_WAREHOUSE"),
        database=os.getenv("SNOWFLAKE_DATABASE"),
        schema=os.getenv("SNOWFLAKE_SCHEMA"),
    )


def _snowflake_save(filename, modality, finding):
    conn = _snowflake_connect()
    try:
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO analysis_results (filename, modality, finding, timestamp) VALUES (%s, %s, %s, %s)",
            (filename, modality, finding, datetime.now().isoformat())
        )
        conn.commit()
    finally:
        conn.close()


def _snowflake_history():
    conn = _snowflake_connect()
    try:
        cursor = conn.cursor()
        cursor.execute(
            "SELECT filename, modality, finding, timestamp FROM analysis_results ORDER BY id DESC"
        )
        rows = cursor.fetchall()
        return [
            {"filename": r[0], "modality": r[1], "finding": r[2], "timestamp": r[3]}
            for r in rows
        ]
    finally:
        conn.close()


# ============================================================
# DATABRICKS IMPLEMENTATION (ready for credentials)
# ============================================================
def _databricks_save(filename, modality, finding):
    # from databricks import sql
    # conn = sql.connect(
    #     server_hostname=os.getenv("DATABRICKS_HOST"),
    #     http_path=os.getenv("DATABRICKS_HTTP_PATH"),
    #     access_token=os.getenv("DATABRICKS_TOKEN"),
    # )
    # cursor = conn.cursor()
    # cursor.execute(
    #     "INSERT INTO analysis_results (filename, modality, finding, timestamp) VALUES (?, ?, ?, ?)",
    #     (filename, modality, finding, datetime.now().isoformat())
    # )
    # conn.commit()
    # conn.close()
    raise NotImplementedError("Databricks credentials required. Awaiting Jade Global access.")


def _databricks_history():
    raise NotImplementedError("Databricks credentials required. Awaiting Jade Global access.")


# ============================================================
# PUBLIC API — the rest of the app only uses these
# ============================================================
def init_db():
    if DB_PLATFORM == "sqlite":
        _sqlite_init()
    # Snowflake/Databricks tables are created via the SQL admin script


def save_result(filename, modality, finding):
    if DB_PLATFORM == "sqlite":
        _sqlite_save(filename, modality, finding)
    elif DB_PLATFORM == "snowflake":
        _snowflake_save(filename, modality, finding)
    elif DB_PLATFORM == "databricks":
        _databricks_save(filename, modality, finding)


def get_history():
    if DB_PLATFORM == "sqlite":
        return _sqlite_history()
    elif DB_PLATFORM == "snowflake":
        return _snowflake_history()
    elif DB_PLATFORM == "databricks":
        return _databricks_history()
    return []