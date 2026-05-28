import os
import pickle
import numpy as np
import pandas as pd
from flask import Flask, jsonify, request
from flask_cors import CORS
from pymongo import MongoClient
from dotenv import load_dotenv
from datetime import datetime
import subprocess

load_dotenv("../backend/.env")

app = Flask(__name__)
CORS(app, origins=["http://localhost:5173"])

MONGO_URI = os.getenv("MONGO_URI")
client = MongoClient(MONGO_URI)
db = client["test"]

EXCEL_FOLDER = os.path.join(os.path.dirname(__file__), "data", "excel")

def load_model():
    if not os.path.exists("model.pkl"):
        return None, None, False, 12
    with open("model.pkl", "rb") as f:
        bundle = pickle.load(f)
    return (
        bundle["model"],
        bundle["label_encoder"],
        bundle.get("has_category", True),
        bundle.get("max_month_num", 12),
    )

@app.route("/health", methods=["GET"])
def health():
    model, le, _, _ = load_model()
    known_medications = list(le.classes_) if le is not None else []
    return jsonify({
        "status": "ok",
        "model_loaded": model is not None,
        "known_medications": known_medications,
        "known_count": len(known_medications),
    })

@app.route("/predict", methods=["GET"])
def predict():
    model, le, has_category, max_month_num = load_model()
    if model is None:
        return jsonify({"error": "Model not trained yet. Please retrain first."}), 503

    meds = list(db["medications"].find({}, {
        "medicationName": 1,
        "quantity": 1,
        "dispensingCategory": 1
    }))

    if not meds:
        return jsonify({"error": "No medications found in database"}), 404

    current_month = datetime.now().month
    next_month_num = max_month_num + 1

    results = []
    skipped = []

    for med in meds:
        name = med["medicationName"]
        current_stock = med.get("quantity", 0)
        category = med.get("dispensingCategory", "OTC")

        if name not in le.classes_:
            skipped.append(name)
            continue

        med_encoded = le.transform([name])[0]

        if has_category:
            cat_encoded = 1 if category == "Prescription" else 0
            X = pd.DataFrame(
                [[med_encoded, cat_encoded, current_month, next_month_num]],
                columns=["med_encoded", "cat_encoded", "month", "month_num"]
            )
        else:
            X = pd.DataFrame(
                [[med_encoded, current_month, next_month_num]],
                columns=["med_encoded", "month", "month_num"]
            )

        predicted_demand = int(round(model.predict(X)[0]))
        predicted_demand = max(0, predicted_demand)

        reorder_threshold = predicted_demand * 1.5
        recommend_reorder = current_stock < reorder_threshold

        if predicted_demand > 0:
            weeks_until_stockout = round((current_stock / predicted_demand) * 4.33, 1)
        else:
            weeks_until_stockout = None

        results.append({
            "medicationId": str(med["_id"]),
            "medicationName": name,
            "currentStock": current_stock,
            "predictedDemandNextMonth": predicted_demand,
            "recommendReorder": recommend_reorder,
            "weeksUntilStockout": weeks_until_stockout,
        })

    results.sort(key=lambda x: (
        not x["recommendReorder"],
        x["weeksUntilStockout"] if x["weeksUntilStockout"] is not None else 999
    ))

    return jsonify({
        "predictions": results,
        "generatedAt": datetime.now().isoformat(),
        "totalMedications": len(results),
        "skippedMedications": skipped,  # surface skipped names so you can debug
    })

@app.route("/retrain", methods=["POST"])
def retrain():
    """
    Retrain the model using real Excel data.
    Runs parse_excel.py (to rebuild real_consumption.csv) then train_model.py.
    Falls back to synthetic data only if no Excel folder exists.
    """
    try:
        script_dir = os.path.dirname(__file__)

        if os.path.exists(EXCEL_FOLDER):
            # Parse real Excel files into real_consumption.csv
            subprocess.run(
                ["python", "parse_excel.py", "--folder", EXCEL_FOLDER],
                check=True,
                cwd=script_dir
            )
        else:
            # No real data — fall back to synthetic generation
            print(f"Excel folder not found at {EXCEL_FOLDER}, generating synthetic data")
            subprocess.run(
                ["python", "generate_data.py"],
                check=True,
                cwd=script_dir
            )

        # Train on whichever CSV is available (train_model.py prefers real_consumption.csv)
        subprocess.run(
            ["python", "train_model.py"],
            check=True,
            cwd=script_dir
        )

        _, le, _, max_month_num = load_model()

        return jsonify({
            "message": "Model retrained successfully",
            "retriainedAt": datetime.now().isoformat(),
            "knownMedications": list(le.classes_) if le else [],
            "maxMonthNum": max_month_num,
        })
    except subprocess.CalledProcessError as e:
        return jsonify({"error": f"Retraining failed: {str(e)}"}), 500

if __name__ == "__main__":
    app.run(port=5002, debug=True)