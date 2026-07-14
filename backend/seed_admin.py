"""
Seed script to create admin user
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from pathlib import Path
import uuid
from datetime import datetime, timezone
import bcrypt

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

async def seed_admin():
    # Connect to MongoDB
    mongo_url = os.environ['MONGO_URL']
    client = AsyncIOMotorClient(mongo_url)
    db = client[os.environ['DB_NAME']]
    
    # Check if admin exists
    admin_email = "admin@diary.com"
    existing_admin = await db.users.find_one({"email": admin_email})
    
    if existing_admin:
        print(f"Admin user already exists: {admin_email}")
    else:
        # Create admin user
        salt = bcrypt.gensalt()
        hashed = bcrypt.hashpw("admin123".encode('utf-8'), salt)
        hashed_password = hashed.decode('utf-8')
        
        admin_user = {
            "id": str(uuid.uuid4()),
            "email": admin_email,
            "hashed_password": hashed_password,
            "role": "admin",
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        
        await db.users.insert_one(admin_user)
        print(f"Admin user created successfully!")
        print(f"Email: {admin_email}")
        print(f"Password: admin123")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(seed_admin())
