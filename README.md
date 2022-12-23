# capture
## _capture or  screenshot to image_

## Build
> docker compose build

## Run
```sh
  curl -X POST http://localhost:8080/cap \
        -H 'Content-Type: application/json' \
        -d '{
          "url": "http://www.example.com",
          "user": "",
          "pwd": ""
        }' > image.jpg
```
