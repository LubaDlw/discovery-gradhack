import pandas as pd
import firebase_admin
from firebase_admin import firestore
from firebase_admin import credentials
import subprocess

# Initialize Firebase (uses your gcloud credentials automatically)
cred = credentials.ApplicationDefault()
if not firebase_admin._apps:
    firebase_admin.initialize_app(cred, {
        'projectId': 'discovery-gradhack25jnb-108'
    })

db = firestore.client()

# Quick test: print collection IDs
print([col.id for col in db.collections()])



def upload_student_data():
    # Read your existing CSV
    df = pd.read_csv("../data/student_data.csv")
    print(f"Loaded {len(df)} rows from CSV")
    print(f"Columns: {list(df.columns)}")
    print(f"First few rows:")
    print(df.head())
    
    # Get collection reference
    collection_ref = db.collection('student_data')
    
    # Test connection first
    try:
        # Try to write one test document
        test_doc = {"test": "connection", "timestamp": "now"}
        collection_ref.document("test_doc").set(test_doc)
        print("✅ Firestore connection successful")
        
        # Delete the test document
        collection_ref.document("test_doc").delete()
        
    except Exception as e:
        print(f"❌ Firestore connection failed: {e}")
        return
    
    # Upload in batches for better performance
    batch_size = 500
    for i in range(0, len(df), batch_size):
        batch = db.batch()
        batch_df = df.iloc[i:i+batch_size]
        
        for index, row in batch_df.iterrows():
            # Convert row to dict, handling NaN values
            doc_data = row.dropna().to_dict()
            # Convert numpy types to native Python types for Firestore
            for key, value in doc_data.items():
                if pd.isna(value):
                    continue
                elif isinstance(value, (pd.Int64Dtype, pd.Float64Dtype)):
                    doc_data[key] = float(value) if pd.notna(value) else None
                elif hasattr(value, 'item'):  # numpy types
                    doc_data[key] = value.item()
            
            doc_ref = collection_ref.document()
            batch.set(doc_ref, doc_data)
        
        batch.commit()
        print(f"Uploaded batch {i//batch_size + 1}/{(len(df)-1)//batch_size + 1}")
    
    print("✅ Upload complete!")

if __name__ == "__main__":
    upload_student_data()