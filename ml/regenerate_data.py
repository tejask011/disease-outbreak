import pandas as pd
import numpy as np

# Number of samples
n = 1000

# Random features between 0 and 1
avg = np.random.uniform(0.1, 1.0, n)
growth = np.random.uniform(0, 1.0, n)
spike = np.random.choice([0, 0.5, 1.0], n)
acceleration = np.random.choice([0, 0.5, 1.0], n)
weatherImpact = np.random.uniform(0.3, 0.9, n)
caseFactor = np.random.uniform(0, 1.0, n)

# Volume Multiplier Logic (Realistic)
# totalCases represented by caseFactor (scaled 0-1 for model)
# In reality: multiplier is based on ABSOLUTE cases, but for the model we use caseFactor
def get_multiplier(cf):
    if cf < 0.2: return 0.4  # Matches < 10 cases if max is 50
    if cf < 0.5: return 0.75 # Matches < 25 cases
    return 1.0

# Calculate Ground Truth rule_score using updated weights
rule_scores = []
for i in range(n):
    score = (
        avg[i] * 0.30 +
        growth[i] * 0.25 +
        caseFactor[i] * 0.20 +
        weatherImpact[i] * 0.10 +
        (spike[i] + acceleration[i]) * 0.15
    )
    # Apply Volume multiplier
    score = score * get_multiplier(caseFactor[i])
    rule_scores.append(min(max(score, 0), 1))

# Save to CSV
df = pd.DataFrame({
    "avg": avg,
    "growth": growth,
    "spike": spike,
    "acceleration": acceleration,
    "weatherImpact": weatherImpact,
    "caseFactor": caseFactor,
    "rule_score": rule_scores
})

df.to_csv("training_data.csv", index=False)
print("Generated 1000 rows of 'Volume-First' training data in training_data.csv")
