import os

def save_file(upload_file, path):
    with open(path, "wb") as buffer:
        buffer.write(upload_file.file.read())

def return_all_default_pages():
    base = "/Users/personal/Desktop/ProjetInteractionHumainIA/comic-editor/backend/content/comicbookpage"

    pages = []
    for i in range(1, 11):
        page = {
            "id": f"page-{i}",
            "storySentence": "",
            "panels": [
                {
                    "id": f"p-{i}-0",
                    "image": f"{base}{i}.png",
                    "sketch": None,
                    "tone": {
                        "brightness": 1.0,
                        "contrast": 1.0,
                        "palette": None
                    },
                    "caption": ""
                }
            ]
        }
        pages.append(page)

    return pages

def return_one_default_page():
    return {
        "id": "page-1",
        "storySentence": "",
        "panels": [
            {
                "id": "p-1-0",
                "image": "/Users/personal/Desktop/ProjetInteractionHumainIA/comic-editor/backend/content/comicbookpage1.png",
                "sketch": None,
                "tone": {
                    "brightness": 1.0,
                    "contrast": 1.0,
                    "palette": None
                },
                "caption": ""
            }
        ]
    }

