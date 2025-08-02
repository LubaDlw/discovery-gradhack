import pandas as pd
import firebase_admin
from firebase_admin import firestore

# Initialize Firebase
if not firebase_admin._apps:
    firebase_admin.initialize_app()

db = firestore.client()

def upload_feed_content():
    # Read feed content CSV
    df = pd.read_csv("feed_content.csv")
    print(f"Loaded {len(df)} content items from CSV")
    print(f"Columns: {list(df.columns)}")
    print(f"Categories: {df['category'].unique()}")
    
    # Get collection reference
    collection_ref = db.collection('feed_content')
    
    # Clear existing content (optional - remove if you want to keep existing)
    print("Clearing existing feed content...")
    existing_docs = collection_ref.stream()
    batch = db.batch()
    delete_count = 0
    
    for doc in existing_docs:
        batch.delete(doc.reference)
        delete_count += 1
        if delete_count % 500 == 0:  # Batch limit
            batch.commit()
            batch = db.batch()
    
    if delete_count % 500 != 0:
        batch.commit()
    
    print(f"Deleted {delete_count} existing items")
    
    # Upload new content
    batch_size = 500
    for i in range(0, len(df), batch_size):
        batch = db.batch()
        batch_df = df.iloc[i:i+batch_size]
        
        for index, row in batch_df.iterrows():
            # Convert row to dict, handling NaN values
            doc_data = row.dropna().to_dict()
            
            # Convert data types
            for key, value in doc_data.items():
                if hasattr(value, 'item'):  # numpy types
                    doc_data[key] = value.item()
                elif key == 'active':  # Convert to boolean
                    doc_data[key] = str(value).lower() == 'true'
                elif key == 'tags':  # Convert tags to array
                    doc_data[key] = [tag.strip() for tag in str(value).split(',') if tag.strip()]
            
            # Use the 'id' column as document ID
            doc_id = doc_data.pop('id')  # Remove id from data, use as document ID
            doc_ref = collection_ref.document(doc_id)
            batch.set(doc_ref, doc_data)
        
        batch.commit()
        print(f"Uploaded batch {i//batch_size + 1}/{(len(df)-1)//batch_size + 1}")
    
    print("✅ Feed content upload complete!")
    
    # Show summary
    print("\nContent Summary:")
    category_counts = df['category'].value_counts()
    for category, count in category_counts.items():
        print(f"  {category}: {count} items")

def test_content_retrieval():
    """Test retrieving content by category"""
    print("\n--- Testing Content Retrieval ---")
    
    categories = ['fitness', 'nutrition', 'mental_health', 'sleep']
    
    for category in categories:
        docs = db.collection('feed_content').where('category', '==', category).where('active', '==', True).stream()
        items = [doc.to_dict() for doc in docs]
        print(f"{category}: {len(items)} active items")
        
        if items:
            print(f"  Sample: {items[0]['title']}")

if __name__ == "__main__":
    upload_feed_content()
    test_content_retrieval()