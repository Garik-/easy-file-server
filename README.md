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