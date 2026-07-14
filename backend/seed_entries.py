"""
Seed script to add historical entries for demo purposes
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from pathlib import Path
import uuid
from datetime import datetime, timezone, timedelta
import random

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

async def seed_entries():
    mongo_url = os.environ['MONGO_URL']
    client = AsyncIOMotorClient(mongo_url)
    db = client[os.environ['DB_NAME']]
    
    # Find the test user
    user = await db.users.find_one({"email": "test@example.com"})
    if not user:
        print("Test user not found!")
        return
    user_id = user['id']
    
    moods = ['happy', 'calm', 'neutral', 'anxious', 'sad']
    mood_weights = [30, 25, 20, 15, 10]  # happy more common
    
    sample_entries = [
        ("Morning Reflections", "Started the day with meditation. Feeling grateful for small things.", ['morning', 'gratitude']),
        ("Work Stress", "Deadline coming up. Feeling overwhelmed but I know I can do this.", ['work', 'stress']),
        ("Family Dinner", "Had dinner with family tonight. Missed them so much.", ['family', 'love']),
        ("Rainy Day Thoughts", "The rain outside matches my mood today. Peaceful and reflective.", ['weather', 'thoughts']),
        ("Achievement Unlocked", "Finally completed the project I've been working on for months!", ['achievement', 'work']),
        ("Long Walk", "Took a long walk in the park. Nature always heals.", ['nature', 'peace']),
        ("Reading Time", "Started a new book today. Really into it already.", ['reading', 'hobby']),
        ("Old Friend", "Reconnected with an old friend. Time flies but bonds remain.", ['friendship', 'memories']),
        ("Weekend Vibes", "Weekend chill mode activated. Some things just cannot be rushed.", ['weekend', 'chill']),
        ("New Recipe", "Tried cooking something new today. Turned out amazing!", ['cooking', 'food']),
        ("Music Discovery", "Found an incredible new artist. Music has such healing power.", ['music', 'discovery']),
        ("Late Night Thoughts", "Sometimes the deepest thoughts come at 2 AM.", ['midnight', 'thoughts']),
        ("Movie Night", "Watched an old classic tonight. Nostalgia hit hard.", ['movies', 'nostalgia']),
        ("Coffee Shop", "Working from a coffee shop today. Different vibe, same me.", ['coffee', 'work']),
        ("Rainy Sunday", "Perfect Sunday - rain, books, and no obligations.", ['sunday', 'peace']),
    ]
    
    # Create entries for the last 20 days with random gaps
    now = datetime.now(timezone.utc)
    entries_to_add = []
    
    for i in range(20):
        # Skip some days to make streak more realistic
        if random.random() < 0.25:  # 25% chance to skip a day
            continue
        
        date = now - timedelta(days=i, hours=random.randint(6, 22), minutes=random.randint(0, 59))
        template = random.choice(sample_entries)
        mood = random.choices(moods, weights=mood_weights)[0]
        
        entry = {
            "id": str(uuid.uuid4()),
            "user_id": user_id,
            "title": template[0],
            "content": template[1],
            "mood": mood,
            "image_url": None,
            "tags": template[2],
            "created_at": date.isoformat(),
            "updated_at": date.isoformat(),
        }
        entries_to_add.append(entry)
    
    if entries_to_add:
        # Remove existing seed entries first (not the real user entries)
        # Only add these fresh - be careful not to delete user's real entries
        result = await db.entries.insert_many(entries_to_add)
        print(f"Added {len(result.inserted_ids)} demo entries for test user")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(seed_entries())
