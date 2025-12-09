from datetime import datetime
import json
from pathlib import Path
import uuid
from typing import List, Optional

from fastapi import APIRouter
from app.schemas.schemas import (
    StoryRequest,
    StoryResponse,
    Page,
    Panel,
    Tone,
)
import openai 
import base64
import io
import numpy as np
from PIL import Image
from app.config import settings

router = APIRouter(prefix="/story", tags=["story"])

DB_PATH = Path(__file__).parent.parent.parent / "database/story.json"
MODE = settings.MODE

with open(DB_PATH, "r", encoding="utf-8") as f:
    STORY_DB = json.load(f)

prompt_global=""

LOG_DIR = Path(__file__).parent.parent.parent / "database/logs"
LOG_DIR.mkdir(exist_ok=True)

timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
LOG_PATH= LOG_DIR / f"story_prompts_{timestamp}.log"

def log_prompt(prompt: str):
    """Append each prompt to a single log file with separators."""
    with open(LOG_PATH, "a", encoding="utf-8") as f:
        f.write("\n" + "=" * 60 + "\n")
        f.write(prompt.strip() + "\n")
        f.write("=" * 60 + "\n")


def database_lookup(prompt_global: str, lookup_type: str, optional_arg: str  = None):
    """
    Lookup saved story data in story.json.
    Args:
        prompt_global: The original story used as the key.
        lookup_type: "expanded_prompt", "scenes", "image", "summary".
        optional_arg: Required only when lookup_type == "image".
    """
    
    if prompt_global not in STORY_DB:
        raise KeyError(f"Story not found: '{prompt_global}'")

    entry = STORY_DB[prompt_global]

    # Expanded prompt
    if lookup_type == "expanded_prompt":
        return entry.get("expanded_prompt", "")

    # Scenes dict
    elif lookup_type == "scenes":
        return entry.get("scenes", {})

    # Image path for a specific scene
    elif lookup_type == "image":
        if not optional_arg:
            raise ValueError("optional_arg (scene id or title) is required for image lookup")

        scenes = entry.get("scenes")
        if not scenes:
            raise KeyError(f"No scenes found for story '{prompt_global}'")

        # Accept both numeric IDs and titles
        for scene in scenes:
            if str(scene.get("id")) == str(optional_arg.get("id")):
                return scene.get("imagePath", "")

        raise KeyError(f"No matching scene '{optional_arg}' found in story '{prompt_global}'")


    # Summary
    elif lookup_type == "summary":
        return entry.get("summary", "")

    else:
        raise ValueError(f"Invalid lookup_type: {lookup_type}")

def parse_fortune_sketch(fortune_sketch: Optional[str], num_segments: int = 30) -> List[float]:
    """
    Parses the user sketch into a curve-based fortune signal.
    - Divides canvas into segments (default 30)
    - For each segment, finds average drawn Y-position
    - Maps Y to a normalized fortune value (top=1.0, bottom=0.0)
    """
    if not fortune_sketch:
        return []

    # Decode from base64 → PIL image
    try:
        encoded_data = fortune_sketch.split(",")[1]
        img_data = base64.b64decode(encoded_data)
        img = Image.open(io.BytesIO(img_data)).convert("L")  # grayscale
        #print("Received sketch size:", img.size)

    except Exception as e:
        print("Error decoding fortune sketch:", e)
        return []

    img_np = np.array(img)
    height, width = img_np.shape

    #print("Min pixel value:", img_np.min())
    #print("Max pixel value:", img_np.max())

    # Mask of drawn pixels: anything darker than near-white
    # Adjust threshold if needed depending on stroke intensity
    drawn_mask = img_np < 250 

    segment_width = width // num_segments
    fortune_values = []

    for i in range(num_segments):
        x_start = i * segment_width
        x_end = x_start + segment_width

        segment = drawn_mask[:, x_start:x_end]

        if np.any(segment):
            # Locations of drawn pixels
            ys, xs = np.where(segment)
            avg_y = ys.mean()

            # Normalize: top = 0, bottom = height
            # So invert: top = high fortune → 1.0
            fortune = 1.0 - (avg_y / height)
        else:
            fortune = 0.5  # fallback if no stroke in segment

        fortune_values.append(float(fortune))

    return fortune_values

def fortune_to_label(v: float) -> str:
    if v > 0.55:
        return "high"
    elif v > 0.45:
        return "neutral"
    else:
        return "low"



def expand_story_with_llm(story: str, fortune_values: List[float], characterName: str) -> str:
    """
    Expand the user's short description into a full story using the LLM (e.g., OpenAI's GPT-3),
    where the fortune values influence how the story progresses.
    """
    # Create a structured prompt for the LLM that includes the user's story and fortune values
    
    # Convert numeric fortune values into qualitative labels
    labels = [fortune_to_label(v) for v in fortune_values]

    # Make a readable arrow progression, like: high → high → neutral → low → high
    fortune_progression = " → ".join(labels)


    # Combine the user story and the fortune sketch description
    prompt = f"""
    You are a storyteller tasked with expanding the following story. Use the following context to guide the expansion:
    User's Story: {story}
    
    {characterName}'s fortune over time is as follows:
    {fortune_progression}
    
    Expand the story with more depth, context, and emotional progression. Adjust the character's journey based on their changing fortune as described above.
    """

    # Request story expansion from OpenAI's GPT-3
    if MODE=="use_saved":
        log_prompt(prompt)
        response = database_lookup(prompt_global,"expanded_prompt")
        #print("response:",response)
        return response
    else:
        response = openai.Completion.create(
            model="text-davinci-003",  # or any other model you'd prefer
            prompt=prompt,
            max_tokens=500,
            temperature=0.7  # Adjust temperature for more creative output
        )

        return response['choices'][0]['text'].strip()


def generate_story_structure(story: str, character_name: str) -> List[str]:
    prompt = f"Divide the following story into distinct scenes or panels suitable for a comic book. Each scene should be visually distinct and have a clear action. {story}"
    if MODE=="use_saved" :
        log_prompt(prompt)
        response=database_lookup(prompt_global,"scenes")
        return response
    else:
        response = openai.Completion.create(
            model="text-davinci-003",
            prompt=prompt,
            max_tokens=800
        )
        return response['choices'][0]['text'].strip().split('\n')

#Include the character's name {character_name} in each scene: {story}

# def generate_image_prompt(scene: any, fortune_sketch: Optional[str]) -> str:
#     # Add context to the image prompt based on fortune or mood
#     prompt = f"Create a comic book scene based on this description: {scene}. "
#     return prompt

def generate_image_for_scene(scene: any, fortune_sketch: Optional[str] = None) -> str:
    """
    Generate a comic book style image from a scene description.
    Returns the URL of the generated image.
    """
    prompt = f"Create a comic book scene based on this description: {scene}."

    try:
        if MODE=="use_saved":
            log_prompt(prompt)
            response=database_lookup(prompt_global,"image",scene)
            return response
        else:
            response = openai.Image.create(
            prompt=prompt,
            n=1,               # number of images
            size="1024x1024"   # image size
            )
            # The API returns a URL for the generated image
            return response['data'][0]['url']
    except openai.error.OpenAIError as e:
        print("Error generating image:", e)
        return ""


def generate_summary(story: str, character_name: str) -> str:
    prompt = f"Summarize the following story with a focus on the character {character_name}: {story}"
    
    if MODE=="use_saved":
        log_prompt(prompt)
        response=database_lookup(prompt_global,"summary");
        return response
    else:
        response = openai.Completion.create(
            model="text-davinci-003",
            prompt=prompt,
            max_tokens=150
        )
        return response['choices'][0]['text'].strip()


@router.post("/generate", response_model=StoryResponse)
async def generate_story(data: StoryRequest) -> StoryResponse:
    fortune_values = parse_fortune_sketch(data.fortuneSketch)
    if not fortune_values:
        raise ValueError("Fortune sketch must have at least one data point.")
    story = data.story

    global prompt_global 
    prompt_global = story.replace("\n", " ").strip()

    #if len(story.split()) < 50:
    story = expand_story_with_llm(story,fortune_values,data.characterName)
    
    #print("story:",story)
    scenes = generate_story_structure(story, data.characterName)
    pages: List[Page] = []

    for idx, scene in enumerate(scenes):
        page_id = f"page-{idx + 1}-{uuid.uuid4().hex[:4]}"

        panel = Panel(
            id=f"{page_id}-0",
            caption=scene.get("title"),
            image=generate_image_for_scene(scene, data.fortuneSketch),  # Get image based on the scene
        )

        page = Page(
            id=page_id,
            storySentence=scene.get("description"),
            panels=[panel],
        )
        pages.append(page)

    summary = generate_summary(story, data.characterName)

    return StoryResponse(
        pages=pages,
        summary=summary,
    )


