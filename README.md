# Easy node.js REST file server (express & lowdb)
```BASH
$ yarn
$ npm start
```
## Usage
```BASH
# Upload file
$ curl -X POST -F "file=@FILE_NAME" -F "slug=DIR_NAME" [UPLOAD]
# Update file
$ curl -X POST -F "file=@FILE_NAME" -F "id=FILE_ID" [UPDATE]
# Remove file
$ curl -X POST -F "id=FILE_ID" [REMOVE]
# Check slug exists
$ curl -X POST -F "slug=DIR_NAME" [SLUG]
# Get DB
$ curl [LIST]
```
| Param | Description |
| --- | --- |
| **FILE_NAME** | path to zip file |
| **FILE_ID** | id from response |
| **DIR_NAME** | directory on the server for unpacking |

| Endpoint | Type | URL |
| --- | :---:  | --- |
| **UPLOAD** | POST | /api/upload/ |
| **UPDATE** | POST | /api/update/ |
| **REMOVE** | POST | /api/remove/ |
| **SLUG** | POST | /api/slug/ |
| **LIST** | GET | /api/list/ |
## Docker
https://github.com/Garik-/docker-file-server
```SH
docker build -t garik:fs .
docker run -d --name fs -p 5000:5000 --env-file ./.env.example garik:fs
```
