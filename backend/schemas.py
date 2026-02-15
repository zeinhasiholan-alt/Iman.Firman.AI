from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class MessageSchema(BaseModel):
    role: str
    content: str

class ConversationSchema(BaseModel):
    id: int
    title: Optional[str]
    messages: List[MessageSchema]
    created_at: datetime

class UserSchema(BaseModel):
    id: int
    username: str
    email: str
    created_at: datetime

class TextGenerationRequest(BaseModel):
    prompt: str
    max_length: int = 100
    temperature: float = 0.7

class ImageProcessingRequest(BaseModel):
    image_url: str
    task: str  # classification, detection, segmentation

class NLPRequest(BaseModel):
    text: str
    task: str  # sentiment, ner, summarization

class AnalyticsRequest(BaseModel):
    data: List[dict]
    analysis_type: str  # correlation, distribution, trend
