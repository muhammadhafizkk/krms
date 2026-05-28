import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import LabelEncoder
import pickle
import os
import sys

def train():
    if os.path.exists("real_consumption.csv"):
        csv_file = "real_consumption.csv"
    elif os.path.exists("synthetic_consumption.csv"):
        csv_file = "synthetic_consumption.csv"
    else:
        print("No data found. Run parse_excel.py or generate_data.py first.")
        return

    print(f"Training on: {csv_file}")
    df = pd.read_csv(csv_file)

    print(f"Loaded {len(df)} rows, columns: {df.columns.tolist()}")

    # ── Clean data ────────────────────────────────────────────────────────────
    # Drop rows with missing values in key columns
    before = len(df)
    df = df.dropna(subset=["medication_name", "month", "month_num", "consumed"])
    if len(df) < before:
        print(f"Dropped {before - len(df)} rows with missing values")

    # Ensure numeric types
    df["consumed"] = pd.to_numeric(df["consumed"], errors="coerce").fillna(0).astype(int)
    df["month"] = df["month"].astype(int)
    df["month_num"] = df["month_num"].astype(int)

    if df.empty:
        print("ERROR: No data remaining after cleaning. Cannot train.")
        sys.exit(1)

    print(f"Training on {len(df)} rows, {df['medication_name'].nunique()} medications")

    # ── Encode medication names ───────────────────────────────────────────────
    le = LabelEncoder()
    df["med_encoded"] = le.fit_transform(df["medication_name"])
    print(f"Medications in encoder: {list(le.classes_)}")

    # category column only exists in synthetic data
    has_category = "category" in df.columns
    if has_category:
        df["cat_encoded"] = (df["category"] == "Prescription").astype(int)
        X = df[["med_encoded", "cat_encoded", "month", "month_num"]]
    else:
        X = df[["med_encoded", "month", "month_num"]]

    y = df["consumed"]

    print(f"X shape: {X.shape}, y shape: {y.shape}")

    # ── Train ─────────────────────────────────────────────────────────────────
    model = RandomForestRegressor(n_estimators=100, random_state=42)
    model.fit(X, y)
    print("Model trained successfully")

    # ── Save ──────────────────────────────────────────────────────────────────
    bundle = {
        "model": model,
        "label_encoder": le,
        "has_category": has_category,
        "max_month_num": int(df["month_num"].max()),
    }
    with open("model.pkl", "wb") as f:
        pickle.dump(bundle, f)

    print(f"Saved model.pkl")
    print(f"max_month_num: {int(df['month_num'].max())}")

    sample = df.groupby("medication_name")["consumed"].mean().round(1).sort_values(ascending=False)
    print("\nAverage monthly consumption per medication:")
    print(sample.to_string())

if __name__ == "__main__":
    try:
        train()
    except Exception as e:
        print(f"\nERROR: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)