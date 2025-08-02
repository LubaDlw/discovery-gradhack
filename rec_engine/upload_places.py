import json
import firebase_admin
from firebase_admin import credentials, firestore
import os

# Initialize Firebase with your project credentials
cred = credentials.ApplicationDefault()
if not firebase_admin._apps:
    firebase_admin.initialize_app(cred, {
        'projectId': 'discovery-gradhack25jnb-108'
    })

db = firestore.client()

def upload_spending_data(json_path):
    # Load the JSON file (must be an array of dicts)
    with open(json_path, "r") as file:
        data = json.load(file)

    if not isinstance(data, list):
        print("❌ JSON root must be a list of objects.")
        return

    print(f"✅ Loaded {len(data)} records from {json_path}")
    collection_ref = db.collection('spending_data')  # Change this to your target collection

    # Test Firestore connection
    try:
        test_doc = {"test": "connection", "timestamp": firestore.SERVER_TIMESTAMP}
        collection_ref.document("test_doc").set(test_doc)
        print("✅ Firestore connection successful")
        collection_ref.document("test_doc").delete()
    except Exception as e:
        print(f"❌ Firestore connection failed: {e}")
        return

    # Upload in batches
    batch_size = 500
    for i in range(0, len(data), batch_size):
        batch = db.batch()
        batch_data = data[i:i + batch_size]

        for entry in batch_data:
            # Skip invalid or empty entries
            if not isinstance(entry, dict):
                continue

            # Clean up None values or nested issues
            doc_data = {k: v for k, v in entry.items() if v is not None}

            # You can add any data validation or transformation here
            doc_ref = collection_ref.document()  # Auto-generated ID
            batch.set(doc_ref, doc_data)

        batch.commit()
        print(f"✅ Uploaded batch {i // batch_size + 1} ({len(batch_data)} records)")

    print("🎉 All data uploaded successfully!")

if __name__ == "__main__":
    # Example: ../data/spending_data.json
    json_path = "../data/places.json"
    upload_spending_data(json_path)
