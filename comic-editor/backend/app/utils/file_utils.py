import os

def save_file(upload_file, path):
    with open(path, "wb") as buffer:
        buffer.write(upload_file.file.read())
