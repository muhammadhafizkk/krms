import os
import pandas as pd
import numpy as np
from pymongo import MongoClient
from dotenv import load_dotenv
from datetime import datetime, timedelta
import random

load_dotenv("../backend/.env")  # reuse your existing .env

MONGO_URI = os.getenv("MONGO_URI")
client = MongoClient(MONGO_URI)
db = client["test"]

def fetch_medications():
    meds = list(db["medications"].find({}, {"medicationName": 1, "quantity": 1, "dispensingCategory": 1}))
    return meds

def generate_consumption(meds, months=12):
    rows = []
    base_date = datetime(2024, 6, 1)  # start 12 months ago

    for med in meds:
        name = med["medicationName"]
        category = med.get("dispensingCategory", "OTC")

        # OTC meds sell more, prescription meds sell less
        if category == "OTC":
            base_demand = random.randint(40, 120)
        else:
            base_demand = random.randint(15, 60)

        for m in range(months):
            month_date = base_date + timedelta(days=30 * m)

            # Add seasonality — higher demand in Jan-Mar (flu season in Malaysia)
            month_num = month_date.month
            seasonal_factor = 1.3 if month_num in [1, 2, 3, 12] else 1.0
            if month_num in [6, 7]:
                seasonal_factor = 0.8  # school holidays, less visits

            # Add trend — slight upward trend over time
            trend_factor = 1 + (m * 0.01)

            # Add noise
            noise = random.uniform(0.85, 1.15)

            consumed = int(base_demand * seasonal_factor * trend_factor * noise)
            consumed = max(1, consumed)

            rows.append({
                "medication_name": name,
                "category": category,
                "year": month_date.year,
                "month": month_date.month,
                "month_num": m + 1,  # 1 = oldest, 12 = most recent
                "consumed": consumed,
            })

    df = pd.DataFrame(rows)
    df.to_csv("synthetic_consumption.csv", index=False)
    print(f"Generated {len(rows)} rows for {len(meds)} medications")
    print(df.head(10))
    return df

if __name__ == "__main__":
    meds = fetch_medications()
    if not meds:
        print("No medications found. Please create medications in KRMS first.")
    else:
        generate_consumption(meds)