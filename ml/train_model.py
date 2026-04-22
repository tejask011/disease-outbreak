import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
import joblib

# Load dataset
df = pd.read_csv("training_data.csv")

print("Dataset Preview:")
print(df.head())

# Features
X = df[["avg", "growth", "spike", "acceleration", "weatherImpact", "caseFactor"]]

# Target
y = df["rule_score"]

# Split data
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# Random Forest Model
model = RandomForestRegressor(
    n_estimators=100,      # number of trees
    max_depth=6,           # control overfitting
    random_state=42
)

# Train
model.fit(X_train, y_train)

# Evaluate
score = model.score(X_test, y_test)
print(f"Model Accuracy (R2): {score:.3f}")

# Save model
joblib.dump(model, "risk_model.pkl")

print("Random Forest model saved as risk_model.pkl")