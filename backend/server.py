from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import bcrypt
from jose import JWTError, jwt

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Configuration
SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'your-secret-key-change-in-production-2024')
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_DAYS = 7

# Security
security = HTTPBearer()

# Create the main app
app = FastAPI()
api_router = APIRouter(prefix="/api")

# ===========================
# MODELS
# ===========================

class UserCreate(BaseModel):
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    hashed_password: str
    role: str = "user"  # "user" or "admin"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserResponse(BaseModel):
    id: str
    email: str
    role: str
    created_at: datetime

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

# Entry Models
class EntryCreate(BaseModel):
    title: str
    content: str
    mood: Optional[str] = "neutral"  # happy, calm, neutral, sad, anxious
    image_url: Optional[str] = None  # base64 image
    tags: Optional[List[str]] = []

class EntryUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    mood: Optional[str] = None
    image_url: Optional[str] = None
    tags: Optional[List[str]] = None

class Entry(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    title: str
    content: str
    mood: str = "neutral"
    image_url: Optional[str] = None
    tags: List[str] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class EntryResponse(BaseModel):
    id: str
    user_id: str
    title: str
    content: str
    mood: str
    image_url: Optional[str] = None
    tags: List[str] = []
    created_at: datetime
    updated_at: datetime

class AdminStats(BaseModel):
    total_users: int
    total_entries: int
    total_admins: int
    entries_by_mood: dict
    recent_users: List[UserResponse]
    entries_last_7_days: int

# ===========================
# PASSWORD & JWT UTILITIES
# ===========================

def hash_password(password: str) -> str:
    """Hash a password using bcrypt"""
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against a hash"""
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Create a JWT token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> User:
    """Dependency to get the current authenticated user"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user_doc = await db.users.find_one({"id": user_id}, {"_id": 0})
    if user_doc is None:
        raise credentials_exception
    
    # Convert ISO string timestamp back to datetime
    if isinstance(user_doc['created_at'], str):
        user_doc['created_at'] = datetime.fromisoformat(user_doc['created_at'])
    
    return User(**user_doc)

async def get_current_admin(current_user: User = Depends(get_current_user)) -> User:
    """Dependency to ensure user is admin"""
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized. Admin access required."
        )
    return current_user

# ===========================
# AUTHENTICATION ROUTES
# ===========================

@api_router.post("/auth/register", response_model=TokenResponse)
async def register(user_data: UserCreate):
    """Register a new user"""
    # Check if user already exists
    existing_user = await db.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    hashed_pwd = hash_password(user_data.password)
    new_user = User(
        email=user_data.email,
        hashed_password=hashed_pwd,
        role="user"
    )
    
    # Save to database
    user_dict = new_user.model_dump()
    user_dict['created_at'] = user_dict['created_at'].isoformat()
    await db.users.insert_one(user_dict)
    
    # Create access token
    access_token = create_access_token(data={"sub": new_user.id})
    
    return TokenResponse(
        access_token=access_token,
        user=UserResponse(
            id=new_user.id,
            email=new_user.email,
            role=new_user.role,
            created_at=new_user.created_at
        )
    )

@api_router.post("/auth/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    """Login user and return JWT token"""
    # Find user by email
    user_doc = await db.users.find_one({"email": credentials.email}, {"_id": 0})
    if not user_doc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    # Convert ISO string to datetime
    if isinstance(user_doc['created_at'], str):
        user_doc['created_at'] = datetime.fromisoformat(user_doc['created_at'])
    
    user = User(**user_doc)
    
    # Verify password
    if not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    # Create access token
    access_token = create_access_token(data={"sub": user.id})
    
    return TokenResponse(
        access_token=access_token,
        user=UserResponse(
            id=user.id,
            email=user.email,
            role=user.role,
            created_at=user.created_at
        )
    )

@api_router.get("/auth/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    """Get current authenticated user"""
    return UserResponse(
        id=current_user.id,
        email=current_user.email,
        role=current_user.role,
        created_at=current_user.created_at
    )

# ===========================
# DIARY ENTRY ROUTES
# ===========================

@api_router.post("/entries", response_model=EntryResponse, status_code=status.HTTP_201_CREATED)
async def create_entry(entry_data: EntryCreate, current_user: User = Depends(get_current_user)):
    """Create a new diary entry"""
    new_entry = Entry(
        user_id=current_user.id,
        title=entry_data.title,
        content=entry_data.content,
        mood=entry_data.mood or "neutral",
        image_url=entry_data.image_url,
        tags=entry_data.tags or []
    )
    
    # Convert to dict and serialize datetimes
    entry_dict = new_entry.model_dump()
    entry_dict['created_at'] = entry_dict['created_at'].isoformat()
    entry_dict['updated_at'] = entry_dict['updated_at'].isoformat()
    
    await db.entries.insert_one(entry_dict)
    
    return EntryResponse(**new_entry.model_dump())

@api_router.get("/entries", response_model=List[EntryResponse])
async def get_entries(
    search: Optional[str] = None,
    mood: Optional[str] = None,
    tag: Optional[str] = None,
    current_user: User = Depends(get_current_user)
):
    """Get all diary entries for the current user with optional search and filters"""
    query = {"user_id": current_user.id}
    
    # Search across title, content
    if search:
        query["$or"] = [
            {"title": {"$regex": search, "$options": "i"}},
            {"content": {"$regex": search, "$options": "i"}},
            {"tags": {"$regex": search, "$options": "i"}}
        ]
    
    # Filter by mood
    if mood and mood != "all":
        query["mood"] = mood
    
    # Filter by tag
    if tag:
        query["tags"] = tag
    
    entries = await db.entries.find(query, {"_id": 0}).sort("created_at", -1).to_list(1000)
    
    # Convert ISO strings back to datetime and handle legacy entries
    for entry in entries:
        if isinstance(entry['created_at'], str):
            entry['created_at'] = datetime.fromisoformat(entry['created_at'])
        if isinstance(entry['updated_at'], str):
            entry['updated_at'] = datetime.fromisoformat(entry['updated_at'])
        # Set defaults for legacy entries
        if 'mood' not in entry:
            entry['mood'] = 'neutral'
        if 'tags' not in entry:
            entry['tags'] = []
        if 'image_url' not in entry:
            entry['image_url'] = None
    
    return entries

@api_router.get("/entries/{entry_id}", response_model=EntryResponse)
async def get_entry(entry_id: str, current_user: User = Depends(get_current_user)):
    """Get a single diary entry"""
    entry_doc = await db.entries.find_one({"id": entry_id}, {"_id": 0})
    
    if not entry_doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Entry not found"
        )
    
    # Check ownership
    if entry_doc['user_id'] != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this entry"
        )
    
    # Convert ISO strings to datetime
    if isinstance(entry_doc['created_at'], str):
        entry_doc['created_at'] = datetime.fromisoformat(entry_doc['created_at'])
    if isinstance(entry_doc['updated_at'], str):
        entry_doc['updated_at'] = datetime.fromisoformat(entry_doc['updated_at'])
    
    # Set defaults for legacy entries
    if 'mood' not in entry_doc:
        entry_doc['mood'] = 'neutral'
    if 'tags' not in entry_doc:
        entry_doc['tags'] = []
    if 'image_url' not in entry_doc:
        entry_doc['image_url'] = None
    
    return EntryResponse(**entry_doc)

@api_router.put("/entries/{entry_id}", response_model=EntryResponse)
async def update_entry(
    entry_id: str,
    entry_data: EntryUpdate,
    current_user: User = Depends(get_current_user)
):
    """Update a diary entry"""
    # Check if entry exists and user owns it
    entry_doc = await db.entries.find_one({"id": entry_id}, {"_id": 0})
    
    if not entry_doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Entry not found"
        )
    
    if entry_doc['user_id'] != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to modify this entry"
        )
    
    # Prepare update data
    update_data = {}
    if entry_data.title is not None:
        update_data['title'] = entry_data.title
    if entry_data.content is not None:
        update_data['content'] = entry_data.content
    if entry_data.mood is not None:
        update_data['mood'] = entry_data.mood
    if entry_data.image_url is not None:
        update_data['image_url'] = entry_data.image_url
    if entry_data.tags is not None:
        update_data['tags'] = entry_data.tags
    
    if update_data:
        update_data['updated_at'] = datetime.now(timezone.utc).isoformat()
        await db.entries.update_one(
            {"id": entry_id},
            {"$set": update_data}
        )
    
    # Fetch updated entry
    updated_entry = await db.entries.find_one({"id": entry_id}, {"_id": 0})
    
    # Convert ISO strings to datetime
    if isinstance(updated_entry['created_at'], str):
        updated_entry['created_at'] = datetime.fromisoformat(updated_entry['created_at'])
    if isinstance(updated_entry['updated_at'], str):
        updated_entry['updated_at'] = datetime.fromisoformat(updated_entry['updated_at'])
    
    # Set defaults for legacy entries
    if 'mood' not in updated_entry:
        updated_entry['mood'] = 'neutral'
    if 'tags' not in updated_entry:
        updated_entry['tags'] = []
    if 'image_url' not in updated_entry:
        updated_entry['image_url'] = None
    
    return EntryResponse(**updated_entry)

@api_router.delete("/entries/{entry_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_entry(entry_id: str, current_user: User = Depends(get_current_user)):
    """Delete a diary entry"""
    # Check if entry exists and user owns it
    entry_doc = await db.entries.find_one({"id": entry_id}, {"_id": 0})
    
    if not entry_doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Entry not found"
        )
    
    if entry_doc['user_id'] != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this entry"
        )
    
    await db.entries.delete_one({"id": entry_id})
    return None

# ===========================
# ADMIN ROUTES
# ===========================

@api_router.get("/admin/stats", response_model=AdminStats)
async def get_admin_stats(current_admin: User = Depends(get_current_admin)):
    """Get admin dashboard statistics"""
    # Total users
    total_users = await db.users.count_documents({})
    
    # Total admins
    total_admins = await db.users.count_documents({"role": "admin"})
    
    # Total entries
    total_entries = await db.entries.count_documents({})
    
    # Entries by mood
    mood_pipeline = [
        {"$group": {"_id": "$mood", "count": {"$sum": 1}}}
    ]
    mood_results = await db.entries.aggregate(mood_pipeline).to_list(100)
    entries_by_mood = {}
    for item in mood_results:
        mood_key = item['_id'] or 'neutral'
        entries_by_mood[mood_key] = item['count']
    
    # Recent users (last 5)
    recent_users_docs = await db.users.find(
        {}, {"_id": 0}
    ).sort("created_at", -1).limit(5).to_list(5)
    
    recent_users = []
    for u in recent_users_docs:
        if isinstance(u['created_at'], str):
            u['created_at'] = datetime.fromisoformat(u['created_at'])
        recent_users.append(UserResponse(
            id=u['id'],
            email=u['email'],
            role=u.get('role', 'user'),
            created_at=u['created_at']
        ))
    
    # Entries in last 7 days
    seven_days_ago = (datetime.now(timezone.utc) - timedelta(days=7)).isoformat()
    entries_last_7_days = await db.entries.count_documents({
        "created_at": {"$gte": seven_days_ago}
    })
    
    return AdminStats(
        total_users=total_users,
        total_entries=total_entries,
        total_admins=total_admins,
        entries_by_mood=entries_by_mood,
        recent_users=recent_users,
        entries_last_7_days=entries_last_7_days
    )

@api_router.get("/admin/users", response_model=List[UserResponse])
async def get_all_users(current_admin: User = Depends(get_current_admin)):
    """Get all users (admin only)"""
    users_docs = await db.users.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    
    users = []
    for u in users_docs:
        if isinstance(u['created_at'], str):
            u['created_at'] = datetime.fromisoformat(u['created_at'])
        users.append(UserResponse(
            id=u['id'],
            email=u['email'],
            role=u.get('role', 'user'),
            created_at=u['created_at']
        ))
    
    return users

# ===========================
# USER ANALYTICS ROUTES (Sprint 5)
# ===========================

@api_router.get("/analytics/me")
async def get_user_analytics(current_user: User = Depends(get_current_user)):
    """Get personal analytics for the current user - mood trends, streaks, stats"""
    user_id = current_user.id
    
    # Total entries
    total_entries = await db.entries.count_documents({"user_id": user_id})
    
    # Entries by mood
    mood_pipeline = [
        {"$match": {"user_id": user_id}},
        {"$group": {"_id": "$mood", "count": {"$sum": 1}}}
    ]
    mood_results = await db.entries.aggregate(mood_pipeline).to_list(100)
    mood_distribution = {}
    for item in mood_results:
        mood_key = item['_id'] or 'neutral'
        mood_distribution[mood_key] = item['count']
    
    # Get all entries sorted by date for streak calculation and timeline
    all_entries = await db.entries.find(
        {"user_id": user_id},
        {"_id": 0, "created_at": 1, "mood": 1}
    ).sort("created_at", -1).to_list(10000)
    
    # Calculate streaks
    current_streak = 0
    longest_streak = 0
    unique_dates = set()
    
    for entry in all_entries:
        created_at = entry['created_at']
        if isinstance(created_at, str):
            dt = datetime.fromisoformat(created_at)
        else:
            dt = created_at
        # Store date only (ignore time)
        date_only = dt.date()
        unique_dates.add(date_only)
    
    # Sort dates descending
    sorted_dates = sorted(unique_dates, reverse=True)
    today = datetime.now(timezone.utc).date()
    yesterday = today - timedelta(days=1)
    
    # Current streak - consecutive days ending today or yesterday
    if sorted_dates:
        if sorted_dates[0] == today or sorted_dates[0] == yesterday:
            current_streak = 1
            for i in range(1, len(sorted_dates)):
                diff = (sorted_dates[i - 1] - sorted_dates[i]).days
                if diff == 1:
                    current_streak += 1
                else:
                    break
    
    # Longest streak - iterate through all dates
    if sorted_dates:
        temp_streak = 1
        longest_streak = 1
        for i in range(1, len(sorted_dates)):
            diff = (sorted_dates[i - 1] - sorted_dates[i]).days
            if diff == 1:
                temp_streak += 1
                longest_streak = max(longest_streak, temp_streak)
            else:
                temp_streak = 1
    
    # Mood timeline - last 30 days
    thirty_days_ago = today - timedelta(days=30)
    mood_score_map = {
        'happy': 5,
        'calm': 4,
        'neutral': 3,
        'anxious': 2,
        'sad': 1,
    }
    
    # Group entries by date
    date_mood_map = {}
    for entry in all_entries:
        created_at = entry['created_at']
        if isinstance(created_at, str):
            dt = datetime.fromisoformat(created_at)
        else:
            dt = created_at
        date_only = dt.date()
        
        if date_only < thirty_days_ago:
            continue
        
        mood = entry.get('mood', 'neutral')
        score = mood_score_map.get(mood, 3)
        
        date_key = date_only.isoformat()
        if date_key not in date_mood_map:
            date_mood_map[date_key] = []
        date_mood_map[date_key].append(score)
    
    # Build timeline
    mood_timeline = []
    for i in range(30):
        target_date = thirty_days_ago + timedelta(days=i)
        date_key = target_date.isoformat()
        scores = date_mood_map.get(date_key, [])
        avg_score = round(sum(scores) / len(scores), 1) if scores else None
        mood_timeline.append({
            "date": date_key,
            "score": avg_score,
            "entries": len(scores),
        })
    
    # Entries this month
    first_of_month = today.replace(day=1).isoformat()
    entries_this_month = await db.entries.count_documents({
        "user_id": user_id,
        "created_at": {"$gte": first_of_month}
    })
    
    # Top tags
    tag_pipeline = [
        {"$match": {"user_id": user_id}},
        {"$unwind": "$tags"},
        {"$group": {"_id": "$tags", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
        {"$limit": 8}
    ]
    top_tags_results = await db.entries.aggregate(tag_pipeline).to_list(10)
    top_tags = [{"tag": item['_id'], "count": item['count']} for item in top_tags_results if item['_id']]
    
    # Total unique days written
    days_written = len(unique_dates)
    
    return {
        "total_entries": total_entries,
        "current_streak": current_streak,
        "longest_streak": longest_streak,
        "days_written": days_written,
        "entries_this_month": entries_this_month,
        "mood_distribution": mood_distribution,
        "mood_timeline": mood_timeline,
        "top_tags": top_tags,
    }



# ===========================
# TEST ROUTES (from original)
# ===========================

@api_router.get("/")
async def root():
    return {"message": "Digital Diary API - Welcome!"}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
