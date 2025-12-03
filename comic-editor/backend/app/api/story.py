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


router = APIRouter(prefix="/story", tags=["story"])

def parse_fortune_sketch(fortune_sketch: Optional[str]) -> List[float]:
    """
    Parse the fortune sketch (base64 encoded) into a list of fortune values
    which correspond to different stages of the story.
    """
    if not fortune_sketch:
        return []

    # Decode the base64 string into image data
    img_data = base64.b64decode(fortune_sketch.split(",")[1])
    img = Image.open(io.BytesIO(img_data))

    # Convert image to grayscale
    img = img.convert("L")
    img_np = np.array(img)

    # Normalize the values based on the middle row of the image (fortune line)
    middle_y = img_np.shape[0] // 2  # Middle row (Y-axis)
    fortune_values = []

    for x in range(img_np.shape[1]):
        # Normalize the pixel value (brightness) to a scale between 0 and 1
        brightness = img_np[middle_y, x] / 255.0
        fortune_values.append(brightness)

    return fortune_values

def expand_story_with_llm(story: str, fortune_values: List[float], characterName: str) -> str:
    """
    Expand the user's short description into a full story using the LLM (e.g., OpenAI's GPT-3),
    where the fortune values influence how the story progresses.
    """
    # Create a structured prompt for the LLM that includes the user's story and fortune values
    fortune_description = ""
    
    for i, fortune_value in enumerate(fortune_values):
        if fortune_value > 0.5:
            fortune_description += f"At stage {i+1}, the character's fortune was high, and they felt optimistic.\n"
        else:
            fortune_description += f"At stage {i+1}, the character's fortune was low, and they faced great struggles.\n"

    # Combine the user story and the fortune sketch description
    prompt = f"""
    You are a storyteller tasked with expanding the following story. Use the following context to guide the expansion:
    User's Story: {story}
    
    {characterName}'s fortune over time is as follows:
    {fortune_description}
    
    Expand the story with more depth, context, and emotional progression. Adjust the character's journey based on their changing fortune as described above.
    """

    # Request story expansion from OpenAI's GPT-3
    response = openai.Completion.create(
        model="text-davinci-003",  # or any other model you'd prefer
        prompt=prompt,
        max_tokens=500,
        temperature=0.7  # Adjust temperature for more creative output
    )

    return response['choices'][0]['text'].strip()


def generate_story_structure(story: str, character_name: str) -> List[str]:
    prompt = f"Divide the following story into distinct scenes or panels suitable for a comic book. Each scene should be visually distinct and have a clear action."
    response = openai.Completion.create(
        model="text-davinci-003",
        prompt=prompt,
        max_tokens=800
    )
    return response['choices'][0]['text'].strip().split('\n')

#Include the character's name {character_name} in each scene: {story}

def generate_image_prompt(scene: str, fortune_sketch: Optional[str]) -> str:
    # Add context to the image prompt based on fortune or mood
    prompt = f"Create a comic book scene based on this description: {scene}. "
    return prompt

def generate_image_for_scene(scene: str, fortune_sketch: Optional[str] = None) -> str:
    """
    Generate a comic book style image from a scene description.
    Returns the URL of the generated image.
    """
    prompt = f"Create a comic book scene based on this description: {scene}."

    try:
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
    #if len(story.split()) < 50:
    story = expand_story_with_llm(story,fortune_values,data.characterName)
    
    scenes = generate_story_structure(story, data.characterName)
    pages: List[Page] = []

    for idx, scene in enumerate(scenes):
        page_id = f"page-{idx + 1}-{uuid.uuid4().hex[:4]}"

        panel = Panel(
            id=f"{page_id}-0",
            caption=scene,
            image=generate_image_for_scene(scene, data.fortuneSketch),  # Get image based on the scene
        )

        page = Page(
            id=page_id,
            storySentence=scene,
            panels=[panel],
        )
        pages.append(page)

    summary = generate_summary(story, data.characterName)

    return StoryResponse(
        pages=pages,
        summary=summary,
    )


