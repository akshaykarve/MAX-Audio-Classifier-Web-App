#!/bin/bash
docker rm -f audiowa
docker build -t supaak/max-audio-classifier-web-app .
docker run -d --name audiowa -p 8090:8090 -p 8080:8080 supaak/max-audio-classifier-web-app