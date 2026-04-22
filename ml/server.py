from flask import Flask, request, jsonify
import joblib
import pandas as pd

app = Flask(__name__)

model = joblib.load("risk_model.pkl")

@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.json  # now expects LIST

        df = pd.DataFrame(data)

        predictions = model.predict(df)

        return jsonify({
            "ml_scores": predictions.tolist()
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(port=5001)