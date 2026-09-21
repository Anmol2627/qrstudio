import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, r2_score
import joblib
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(BASE_DIR, 'reliability_dataset.csv')
MODEL_PATH = os.path.join(BASE_DIR, 'reliability_model.joblib')

def train():
    if not os.path.exists(DATA_PATH):
        print("Dataset not found. Run generate_dataset.py first.")
        return

    df = pd.read_csv(DATA_PATH)
    
    # We predict the continuous score rather than just boolean scannable
    # to provide a "health meter" in the UI.
    features = ['size', 'margin', 'ec_level', 'fg_lum', 'bg_lum', 'contrast']
    X = df[features]
    y = df['score']
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # Train Random Forest Regressor
    print("Training Random Forest Regressor...")
    rf = RandomForestRegressor(n_estimators=100, random_state=42)
    rf.fit(X_train, y_train)
    
    # Evaluate
    preds = rf.predict(X_test)
    mse = mean_squared_error(y_test, preds)
    r2 = r2_score(y_test, preds)
    
    print(f"Mean Squared Error: {mse:.4f}")
    print(f"R2 Score: {r2:.4f}")
    
    print("\nFeature Importances:")
    importances = rf.feature_importances_
    for name, imp in zip(features, importances):
        print(f" - {name}: {imp:.4f}")
        
    joblib.dump(rf, MODEL_PATH)
    print(f"\nModel saved to {MODEL_PATH}")

if __name__ == "__main__":
    train()
