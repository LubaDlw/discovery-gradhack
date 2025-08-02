from sklearn.base import BaseEstimator, TransformerMixin
import pandas as pd
import numpy as np

class FeatureBuilder(BaseEstimator, TransformerMixin):
    def __init__(self, feature_names):
        self.feature_names = feature_names
        self.topic_cols = [col for col in feature_names if col.startswith('topic_')]

    def fit(self, X, y=None):
        return self

    def transform(self, X):
        # Handle both numpy arrays and DataFrames
        if isinstance(X, np.ndarray):
            X = pd.DataFrame(X, columns=self.feature_names)
        elif isinstance(X, pd.DataFrame):
            # Ensure columns are in the correct order and only include expected features
            X = X[self.feature_names].copy()
        
        # Fill missing topic columns with 0 if needed (optional)
        for col in self.topic_cols:
            if col not in X.columns:
                X[col] = 0
        
        # Create interaction terms
        for col in self.topic_cols:
            X[f'interaction_{col}_mood'] = X[col] * X['mood_score']

        X['interaction_food_mood'] = X['fast_food_pct'] * X['mood_score']

        return X.values  # return as NumPy array for next pipeline step
