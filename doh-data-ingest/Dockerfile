FROM python:3.7-slim

RUN apt-get update && apt-get install -y zip
COPY requirements.txt requirements.txt
COPY requirements.dev.txt requirements.dev.txt
RUN pip install -r requirements.txt && pip install -r requirements.dev.txt

WORKDIR /app
