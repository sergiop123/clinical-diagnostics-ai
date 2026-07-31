# ============================================================
# test_snowflake_connection.py
# Quick sanity check that db.py can actually reach Snowflake.
# Run this from inside the backend/ folder:
#     python test_snowflake_connection.py
# ============================================================

from dotenv import load_dotenv
load_dotenv()  # reads backend/.env before anything else runs

import db

print(f"DB_PLATFORM is set to: {db.DB_PLATFORM}")

if db.DB_PLATFORM != "snowflake":
    print("WARNING: DB_PLATFORM is not 'snowflake' — check your .env file.")

print("\nAttempting to save a test row...")
try:
    db.save_result("test_scan.png", "X-Ray", "Test connection - no real finding")
    print("Save succeeded.")
except Exception as e:
    print(f"Save FAILED: {e}")
    raise SystemExit(1)

print("\nAttempting to read history back...")
try:
    history = db.get_history()
    print(f"Read succeeded. {len(history)} row(s) found.")
    print("\nMost recent row:")
    print(history[0])
except Exception as e:
    print(f"Read FAILED: {e}")
    raise SystemExit(1)

print("\nEnd-to-end Snowflake connection test PASSED.")
