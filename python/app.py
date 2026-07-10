import os
import pickle
import sys
import numpy as np
import pandas as pd
from flask import Flask, jsonify, request
from flask_cors import CORS
from pymongo import MongoClient
from dotenv import load_dotenv
from datetime import datetime
import subprocess
import threading  # Added for asynchronous background tasks

load_dotenv("../backend/.env")

app = Flask(__name__)
allowed_origins = [
    "http://localhost:5173",
    os.getenv("FRONTEND_URL", "")
]
CORS(app, origins=[o for o in allowed_origins if o])

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

def run_retraining_worker(script_dir):
    """
    Worker function executed inside a background thread.
    Handles the long-running subprocess executions and logs results to the server console.
    """
    print(f"--- BACKGROUND RETRAINING STARTED AT {datetime.now().isoformat()} ---")
    try:
        # Use "python3" as the standard environment executable for Linux/Render environments
        python_exe = "python3" if os.name != "nt" else "python"

        if os.path.exists(EXCEL_FOLDER):
            print("Worker: Parsing Excel files...")
            result_parse = subprocess.run(
                [python_exe, "parse_excel.py", "--folder", EXCEL_FOLDER],
                check=True,
                cwd=script_dir,
                capture_output=True,
                text=True,
                encoding="utf-8"
            )
            print(result_parse.stdout)
        else:
            print(f"Worker: Excel folder not found at {EXCEL_FOLDER}, generating synthetic data...")
            result_gen = subprocess.run(
                [python_exe, "generate_data.py"],
                check=True,
                cwd=script_dir,
                capture_output=True,
                text=True,
                encoding="utf-8"
            )
            print(result_gen.stdout)

        print("Worker: Training machine learning model...")
        result_train = subprocess.run(
            [python_exe, "train_model.py"],
            check=True,
            cwd=script_dir,
            capture_output=True,
            text=True,
            encoding="utf-8"
        )
        print(result_train.stdout)
        print(f"--- BACKGROUND RETRAINING SUCCESSFUL AT {datetime.now().isoformat()} ---")

    except subprocess.CalledProcessError as e:
        print("--- BACKGROUND RETRAIN SUBPROCESS FAILED ---")
        print("STDOUT:", e.stdout)
        print("STDERR:", e.stderr)
        print("--------------------------------------------")
    except Exception as ex:
        print(f"--- BACKGROUND RETRAIN UNEXPECTED ERROR: {str(ex)} ---")


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
        "skippedMedications": skipped,
    })

@app.route("/retrain", methods=["POST"])
def retrain():
    """
    Triggers model retraining asynchronously.
    Responds immediately to the client to prevent Gunicorn/Render timeouts.
    """
    script_dir = os.path.dirname(os.path.abspath(__file__))

    # Initialize and spin off the worker thread
    retrain_thread = threading.Thread(
        target=run_retraining_worker,
        args=(script_dir,),
        daemon=True  # Allows thread to close properly if application restarts
    )
    retrain_thread.start()

    # Immediately respond to the client with an HTTP 202 (Accepted) code
    return jsonify({
        "status": "accepted",
        "message": "Retraining worker initialized successfully in the background.",
        "triggeredAt": datetime.now().isoformat()
    }), 202

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5002))
    app.run(host="0.0.0.0", port=port)