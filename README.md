# Easy node.js REST file server (express & lowdb)

```BASH
$ yarn
$ npm start
```

## Usage
```BASH
# Upload file
$ curl -X POST -F "file=@FILE_NAME" [UPLOAD]
# Remove file
$ curl -X POST -d "id=FILE_ID" [REMOVE]
```

## Docker
https://github.com/Garik-/docker-file-server
```SH
docker build -t garik:fs .
docker run -d --name fs -p 5000:5000 --env-file ./.env.example garik:fs
```