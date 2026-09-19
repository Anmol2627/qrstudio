import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report
import joblib
import os

# Paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(BASE_DIR, 'dataset.csv')
MODEL_PATH = os.path.join(BASE_DIR, 'intent_model.joblib')

def train():
    if not os.path.exists(DATA_PATH):
        print("Dataset not found. Please run generate_dataset.py first.")
        return

    # Load dataset
    df = pd.read_csv(DATA_PATH)
    
    # Split
    X_train, X_test, y_train, y_test = train_test_split(df['text'], df['intent'], test_size=0.2, random_state=42)

    # Build Pipeline: TF-IDF -> Logistic Regression
    pipeline = Pipeline([
        ('tfidf', TfidfVectorizer(lowercase=True, stop_words='english', ngram_range=(1, 2))),
        ('clf', LogisticRegression(random_state=42, max_iter=1000))
    ])

    # Train
    print("Training TF-IDF + Logistic Regression model...")
    pipeline.fit(X_train, y_train)

    # Evaluate
    preds = pipeline.predict(X_test)
    print("\nClassification Report:")
    print(classification_report(y_test, preds))

    # Save
    joblib.dump(pipeline, MODEL_PATH)
    print(f"Model saved to {MODEL_PATH}")

if __name__ == "__main__":
    train()
