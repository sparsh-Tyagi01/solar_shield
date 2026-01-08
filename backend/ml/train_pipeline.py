"""
Comprehensive Training Pipeline for All Three Models
Fetches data, engineers features, trains and evaluates all models
"""
import sys
import numpy as np
import pandas as pd
from pathlib import Path
from sklearn.model_selection import train_test_split
from datetime import datetime

# Add parent directory to path
sys.path.append(str(Path(__file__).resolve().parent.parent.parent))

from backend.data import get_fetcher, engineer_features, FeatureEngineer
from backend.ml import (
    StormOccurrencePredictor,
    StormSeverityPredictor,
    ImpactRiskClassifier
)
from backend.utils.logger import get_logger
from backend.config import (
    TRAIN_TEST_SPLIT,
    RANDOM_SEED,
    SEQUENCE_LENGTH,
    MODEL_DIR,
    DATA_DIR
)

logger = get_logger(__name__)


class TrainingPipeline:
    """Complete training pipeline for SolarGuard 3D"""
    
    def __init__(self, training_days: int = 365):
        self.training_days = training_days
        self.fetcher = get_fetcher()
        self.feature_engineer = FeatureEngineer()
        
        # Models
        self.occurrence_model = StormOccurrencePredictor()
        self.severity_model = StormSeverityPredictor()
        self.impact_model = ImpactRiskClassifier()
        
        # Data
        self.raw_data = None
        self.processed_data = None
        
    def fetch_data(self) -> pd.DataFrame:
        """Step 1: Fetch training data"""
        logger.info("=" * 60)
        logger.info("STEP 1: FETCHING TRAINING DATA")
        logger.info("=" * 60)
        
        self.raw_data = self.fetcher.fetch_training_data(days=self.training_days)
        
        logger.info(f"Fetched {len(self.raw_data)} records")
        logger.info(f"Date range: {self.raw_data['timestamp'].min()} to {self.raw_data['timestamp'].max()}")
        
        # Save raw data
        raw_path = DATA_DIR / "raw" / "training_data.csv"
        self.raw_data.to_csv(raw_path, index=False)
        logger.info(f"Raw data saved to {raw_path}")
        
        return self.raw_data
    
    def engineer_features(self) -> pd.DataFrame:
        """Step 2: Engineer features"""
        logger.info("=" * 60)
        logger.info("STEP 2: FEATURE ENGINEERING")
        logger.info("=" * 60)
        
        if self.raw_data is None:
            raise ValueError("No raw data. Call fetch_data() first.")
        
        # Create features and labels
        self.processed_data = engineer_features(
            self.raw_data,
            create_labels=True,
            look_ahead_hours=12
        )
        
        logger.info(f"Processed data shape: {self.processed_data.shape}")
        logger.info(f"Feature columns: {len(self.processed_data.columns)}")
        
        # Save processed data
        processed_path = DATA_DIR / "processed" / "training_features.csv"
        self.processed_data.to_csv(processed_path)
        logger.info(f"Processed data saved to {processed_path}")
        
        # Print feature statistics
        logger.info("\nTarget variable distributions:")
        logger.info(f"Storm occurrence: {self.processed_data['storm_occurrence'].sum()} storms "
                   f"({100 * self.processed_data['storm_occurrence'].mean():.2f}%)")
        logger.info(f"Average severity: {self.processed_data['storm_severity'].mean():.2f}")
        
        return self.processed_data
    
    def train_occurrence_model(self) -> dict:
        """Step 3a: Train storm occurrence predictor"""
        logger.info("=" * 60)
        logger.info("STEP 3A: TRAINING STORM OCCURRENCE MODEL (XGBoost)")
        logger.info("=" * 60)
        
        if self.processed_data is None:
            raise ValueError("No processed data. Call engineer_features() first.")
        
        # Prepare data
        df = self.processed_data.copy()
        
        # Remove rows with NaN in target
        df = df[df['storm_occurrence'].notna()]
        
        # Features and target
        X = df[self.occurrence_model.features]
        y = df['storm_occurrence']
        
        # Train-test split
        X_train, X_test, y_train, y_test = train_test_split(
            X, y,
            test_size=1-TRAIN_TEST_SPLIT,
            random_state=RANDOM_SEED,
            stratify=y
        )
        
        logger.info(f"Training samples: {len(X_train)}")
        logger.info(f"Test samples: {len(X_test)}")
        
        # Train
        metrics = self.occurrence_model.train(X_train, y_train, X_test, y_test)
        
        # Test evaluation
        test_metrics = self.occurrence_model.evaluate(X_test, y_test, "Test")
        
        # Feature importance
        importance = self.occurrence_model.get_feature_importance()
        logger.info("\nTop 5 Important Features:")
        logger.info(importance.head().to_string())
        
        # Save model
        self.occurrence_model.save()
        
        logger.info("✓ Storm occurrence model trained and saved")
        
        return {'train': metrics, 'test': test_metrics}
    
    def train_severity_model(self) -> dict:
        """Step 3b: Train storm severity predictor"""
        logger.info("=" * 60)
        logger.info("STEP 3B: TRAINING STORM SEVERITY MODEL (LSTM)")
        logger.info("=" * 60)
        
        if self.processed_data is None:
            raise ValueError("No processed data. Call engineer_features() first.")
        
        # Prepare sequences
        df = self.processed_data.copy()
        df = df[df['future_severity'].notna()]
        
        # Create sequences
        X_seq, y_seq, indices = self.feature_engineer.prepare_sequences(
            df,
            sequence_length=SEQUENCE_LENGTH,
            features=self.severity_model.features,
            target='future_severity'
        )
        
        logger.info(f"Created {len(X_seq)} sequences")
        logger.info(f"Sequence shape: {X_seq.shape}")
        
        # Train-test split
        split_idx = int(len(X_seq) * TRAIN_TEST_SPLIT)
        
        X_train = X_seq[:split_idx]
        y_train = y_seq[:split_idx]
        X_test = X_seq[split_idx:]
        y_test = y_seq[split_idx:]
        
        logger.info(f"Training sequences: {len(X_train)}")
        logger.info(f"Test sequences: {len(X_test)}")
        
        # Train
        result = self.severity_model.train(
            X_train, y_train,
            X_test, y_test,
            epochs=10,
            batch_size=32
        )
        
        # Test evaluation
        test_metrics = self.severity_model.evaluate(X_test, y_test, "Test")
        
        # Save model
        self.severity_model.save()
        
        logger.info("✓ Storm severity model trained and saved")
        
        return {'train': result['metrics'], 'test': test_metrics}
    
    def train_impact_model(self) -> dict:
        """Step 3c: Train impact risk classifier"""
        logger.info("=" * 60)
        logger.info("STEP 3C: TRAINING IMPACT RISK MODEL (Random Forest)")
        logger.info("=" * 60)
        
        if self.processed_data is None:
            raise ValueError("No processed data. Call engineer_features() first.")
        
        # Prepare data
        df = self.processed_data.copy()
        
        # Remove rows with NaN
        impact_cols = [f'impact_{cat}' for cat in self.impact_model.impact_categories]
        df = df.dropna(subset=self.impact_model.features + impact_cols)
        
        # Features and targets
        X = df[self.impact_model.features]
        y = df[impact_cols]
        y.columns = self.impact_model.impact_categories
        
        # Train-test split
        X_train, X_test, y_train, y_test = train_test_split(
            X, y,
            test_size=1-TRAIN_TEST_SPLIT,
            random_state=RANDOM_SEED
        )
        
        logger.info(f"Training samples: {len(X_train)}")
        logger.info(f"Test samples: {len(X_test)}")
        
        # Train
        metrics = self.impact_model.train(X_train, y_train, X_test, y_test)
        
        # Test evaluation
        test_metrics = self.impact_model.evaluate(X_test, y_test, "Test")
        
        # Feature importance
        importance = self.impact_model.get_feature_importance()
        logger.info("\nTop 5 Important Features:")
        logger.info(importance.head().to_string())
        
        # Save model
        self.impact_model.save()
        
        logger.info("✓ Impact risk model trained and saved")
        
        return {'train': metrics, 'test': test_metrics}
    
    def run_full_pipeline(self):
        """Run complete training pipeline"""
        logger.info("=" * 60)
        logger.info("SOLARGUARD 3D - COMPLETE TRAINING PIPELINE")
        logger.info("=" * 60)
        logger.info(f"Start time: {datetime.now()}")
        
        try:
            # Step 1: Fetch data
            self.fetch_data()
            
            # Step 2: Engineer features
            self.engineer_features()
            
            # Step 3: Train all models
            occurrence_results = self.train_occurrence_model()
            severity_results = self.train_severity_model()
            impact_results = self.train_impact_model()
            
            # Summary
            logger.info("=" * 60)
            logger.info("TRAINING COMPLETE - SUMMARY")
            logger.info("=" * 60)
            
            logger.info("\n📊 Model A - Storm Occurrence Predictor:")
            logger.info(f"  Test Accuracy: {occurrence_results['test']['accuracy']:.4f}")
            logger.info(f"  Test ROC-AUC: {occurrence_results['test']['roc_auc']:.4f}")
            
            logger.info("\n📊 Model B - Storm Severity Predictor:")
            logger.info(f"  Test MAE: {severity_results['test']['mae']:.4f}")
            logger.info(f"  Test RMSE: {severity_results['test']['rmse']:.4f}")
            
            logger.info("\n📊 Model C - Impact Risk Classifier:")
            logger.info(f"  Test Overall Accuracy: {impact_results['test']['overall_accuracy']:.4f}")
            
            logger.info("\n✅ All models trained and saved successfully!")
            logger.info(f"Models saved in: {MODEL_DIR}")
            logger.info(f"End time: {datetime.now()}")
            
        except Exception as e:
            logger.error(f"Training pipeline failed: {e}", exc_info=True)
            raise


def main():
    """Main entry point"""
    import argparse
    
    parser = argparse.ArgumentParser(description='Train SolarGuard 3D models')
    parser.add_argument('--days', type=int, default=365,
                       help='Number of days of training data (default: 365)')
    parser.add_argument('--model', type=str, choices=['occurrence', 'severity', 'impact', 'all'],
                       default='all', help='Which model to train (default: all)')
    
    args = parser.parse_args()
    
    # Create pipeline
    pipeline = TrainingPipeline(training_days=args.days)
    
    # Fetch and process data
    pipeline.fetch_data()
    pipeline.engineer_features()
    
    # Train selected models
    if args.model == 'all':
        pipeline.run_full_pipeline()
    elif args.model == 'occurrence':
        pipeline.train_occurrence_model()
    elif args.model == 'severity':
        pipeline.train_severity_model()
    elif args.model == 'impact':
        pipeline.train_impact_model()


if __name__ == "__main__":
    main()
