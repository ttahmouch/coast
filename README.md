Coast
=====

Just imagine it.

> We just finished a website at Odeo called Twitter. It allows you to update your personal status to the world. It's so easy to use! Just ...
>
    POST /statuses/update.json HTTP/1.1
    Host: twttr.com
    Content-Type: application/x-www-form-urlencoded
    Content-Length: 31
>
    status=just+setting+up+my+twttr
> &mdash; <cite>Jack Dorsey</cite>

Expecting people to know how to speak to Twitter in order to tweet sounds ridiculous. Web browsers should know how to speak to Twitter for us. We just need to tell them what to say.

For example, it's second nature for people to tweet by

1. clicking "Compose new Tweet..."
2. typing something
3. clicking "Tweet"

The problem is that web API providers expect us to speak their language when we aren't using their website. Otherwise, why would a web API need documentation to compose a Tweet (e.g. [Twitter Doc][0])?

The thing is, **web APIs are websites for computers**. So what makes web APIs complicated enough that they require documentation?

People can browse websites because they're conscious. Computers may not be conscious (yet?), but there's no reason they can't browse web APIs with a little help.

**Coast** is an open-source, full-stack, convention over configuration, Javascript framework that makes self-documented, hypermedia APIs a reality.

**Features:**

+ Hypermedia API Client              (Node.JS HTTP, XMLHttpRequest)
+ HTTP API Client                    (Node.JS HTTP, XMLHttpRequest)
+ HTTP API Server                    (Express.JS)
+ CORS Support                       (Built-in Middleware)
+ "Zero Code" API Prototyping        (API Description Language)
+ Wrap Traditional API in Hypermedia (Built-in Middleware)
+ Node.JS/Browser (sans IE) Support

## Install

    $ [sudo] npm install coast -g

## Use

Similar to `npm`'s use of `package.json` to describe a package, `coast` uses `api.json` to describe a web API. A `coast` project directory has no formal structure, and `api.json` may be located anywhere within.

### Creating an api

A blank `coast` project directory that already contains an `api.json` template may be cloned from Github.

    $ git clone https://github.com/coastjs/coast.nullapi.git # Clone a blank Coast API.
    $ cd coast.nullapi/ # Change into the API directory.

### Describing the api

An api may be described completely without writing any code by adding middleware and apis in `api.json`.

    $ vim api.json # Modify api.json using your favorite text editor.

        {
            "id": "Simple Stupid Api",
            "title": "Short text saving service.",
            "debug": true,
            "protocol": "http",
            "hostname": "0.0.0.0",
            "port": "8080",
            "cors": ["*"],
            "apis": [
                {
                    "id": "requestMiddleware",
                    "title": "Add middleware before an api like this. This title is optional. The id is not."
                },
                {
                    "id": "enter",
                    "title": "Add an api after middleware like this. This title is optional. The id is not.",
                    "method": "GET",
                    "uri": "/"
                },
                {
                    "id": "createNote",
                    "title": "Add an api for creating notes like this. This title is optional. The id is not.",
                    "method": "PUT",
                    "uri": "/notes/:id",
                    "headers": {
                        "content-type": "application/json"
                    },
                    "body": [
                        {
                            "name": "title",
                            "title": "Add a text input field with a default value for the api like this.",
                            "value": "Buy bread.",
                            "type": "text"
                        }
                    ]
                },
                {
                    "id": "responseMiddleware",
                    "title": "Add middleware after an api like this. This title is optional. The id is not."
                }
            ]
        }

#### Understanding api.json

    {
        "id": "Simple Stupid Api",             // OPTIONAL. Identifies the web API. Default: ''
        "title": "Short text saving service.", // OPTIONAL. Describes the web API. Default: ''
        "debug": true,                         // OPTIONAL. Selects debug mode. Default: false
        "protocol": "http",                    // OPTIONAL. Selects the supported protocol. Default: 'http'
        "hostname": "0.0.0.0",                 // OPTIONAL. Describes the server hostname. Default: '0.0.0.0'
        "port": "8080",                        // OPTIONAL. Describes the server port. Default: '8080'
        "cors": ["*"],                         // OPTIONAL. Describes Origin white list. "*" means all. Default: []
        "apis": [                              // OPTIONAL. Describes APIs and middleware. Default: []
            {
                // Middleware
                "id": "logRequest",        // REQUIRED. Identifies the middleware.
                "title": "Log a Request."  // OPTIONAL. Describes the middleware.
            },
            {
                // API
                "id": "createNote",        // REQUIRED. Identifies the API.
                "title": "Create a Note.", // OPTIONAL. Describes the API.
                "method": "POST",          // REQUIRED. Describes the required protocol method.
                "uri": "/notes",           // REQUIRED. Describes the required route with optional params.
                "headers": {               // OPTIONAL. Describes the required protocol headers.
                    "content-type": "application/json"
                },
                "body": [                  // OPTIONAL. Describes the required and optional input fields.
                    {
                        "name": "title",               // REQUIRED. Names the input field.
                        "title": "Title of the Note.", // OPTIONAL. Describes the input field.
                        "value": "Buy bread.",         // OPTIONAL. Supplies a default value.
                        "type": "text"                 // OPTIONAL. Describes the input field type.
                    }
                ]
            }
        ]
    }

### Playing with the api

An api may be started as a `node.js` server with an `express.js` stack.

    $ api # Run at the root of the API directory.

A couple messages will appear.

    A handler file was not found for requestMiddleware, enter, createNote, responseMiddleware.
    A server is accepting connections on 0.0.0.0:8080.

A request may be sent to an api.

    $ curl -i http://127.0.0.1:8080/ # Send a request using your favorite HTTP client.

        HTTP/1.1 200 OK
        content-length: 0
        Date: Mon, 27 Oct 2014 18:35:11 GMT
        Connection: keep-alive

    $ curl -v --request PUT http://127.0.0.1:8080/notes/0 \
              --header "content-type:application/json" \
              --data '{ "title":"Buy stuff." }' # Send a request to create a note.

        PUT /notes/0 HTTP/1.1
        User-Agent: curl/7.30.0
        Host: 127.0.0.1:8080
        Accept: */*
        content-type:application/json
        Content-Length: 24

        HTTP/1.1 200 OK
        content-length: 0
        Date: Mon, 27 Oct 2014 18:42:32 GMT
        Connection: keep-alive

    $ curl -i http://127.0.0.1:8080/404 # Send a request to a non-existent api.

        HTTP/1.1 404 Not Found
        content-length: 0
        Date: Mon, 27 Oct 2014 18:37:40 GMT
        Connection: keep-alive

### Coding the api

A handler may be defined for a middleware or api using a `node.js` module. A `coast` project directory has no formal structure, and handler files may be located anywhere within. A handler file is conventionally named `[id].js`.

    $ vim requestMiddleware.js # Create a handler for requestMiddleware.

        module.exports = function (req, res, next) {
            console.log('Request Middleware.');
            next();
        };

    $ vim enter.js # Create a handler for enter.

        module.exports = function (req, res, next) {
            res.status(200).set('content-type', 'application/json').body = JSON.stringify({
                'method': req.method,
                'url': req.url
            });
            next();
        };

    $ vim createNote.js # Create a handler for createNote.

        var inMemoryDb = [];

        module.exports = function (req, res, next) {
            var id = req.param('id'),
                note = '';
            req
                .on('data', function (chunk) {
                    note += chunk;
                })
                .on('end', function () {
                    try {
                        note = JSON.parse(note);
                    } catch (error) {
                        note = '';
                        console.error(error.message);
                    }
                    if (note && typeof note === 'object' && typeof note.title === 'string') {
                        inMemoryDb.push(note);
                        note.id = id;
                        res.status(201).set('content-type', 'application/json').body = JSON.stringify(note, null, '    ');
                        delete note.id;
                    } else {
                        res.status(400).set('content-type', 'application/json').body = JSON.stringify({
                            "error": "Expected { \"title\": \"[title]\" }"
                        });
                    }
                    next();
                });
        };

    $ vim responseMiddleware.js # Create a handler for responseMiddleware.

        module.exports = function (req, res, next) {
            console.log('Response Middleware.');
            next();
        };

### Playing with the api

A new start.

    $ api # Run at the root of the API directory.

A single message will appear.

    A server is accepting connections on 0.0.0.0:8080.

A new request.

    $ curl -i http://127.0.0.1:8080/ # Send a request using your favorite HTTP client.

        HTTP/1.1 200 OK
        content-type: application/json
        content-length: 26
        Date: Mon, 27 Oct 2014 19:46:06 GMT
        Connection: keep-alive

        {"method":"GET","url":"/"}

    $ curl -v --request PUT http://127.0.0.1:8080/notes/0 \
              --header "content-type:application/json" \
              --data '{ "title":"Buy stuff." }' # Send a request to create a note.

        HTTP/1.1 201 Created
        content-type: application/json
        content-length: 44
        Date: Mon, 27 Oct 2014 19:46:57 GMT
        Connection: keep-alive

        {
            "title": "Buy stuff.",
            "id": "0"
        }

A new log.

    Request Middleware.
    Response Middleware.
    Request Middleware.
    Response Middleware.

### Hypermediafying the api

A handler may add hypermedia to any response. A hypermedia client may then use this hypermedia to understand what the api is capable of at any state.

    $ vim enter.js # Add hypermedia to the enter handler to allow a client to create notes.

        module.exports = function (req, res, next) {
            ...
            // Add hypermedia to the reponse if the client negotiates for it.
            if (req.get('accept') === 'multipart/nav-data') {
                res.hype = ['createNote'];
            }
            next();
        };

    $ vim createNote.js # Add hypermedia to the createNote handler to allow a client to start over.

        var inMemoryDb = [];

        module.exports = function (req, res, next) {
            ...
                    // Add hypermedia to the reponse if the client negotiates for it.
                    if (req.get('accept') === 'multipart/nav-data') {
                        res.hype = ['enter'];
                    }
                    next();
                });
        };

### Playing with the api

A new start with hypermedia.

    $ api # Run at the root of the API directory.

A new request with hypermedia content negotiation.

    $ curl -i http://127.0.0.1:8080/ --header "accept:multipart/nav-data" # Send a request using your favorite HTTP client.

A new response with hypermedia allowing a client to create notes. The original response is included in a body part of multipart/nav-data. The hypermedia is included in an accompanying body part.

    HTTP/1.1 200 OK
    content-type: multipart/nav-data; boundary="=0ORkm"
    Date: Mon, 27 Oct 2014 20:41:23 GMT
    Connection: keep-alive
    Transfer-Encoding: chunked

    --=0ORkm
    content-type:application/naval+json

    [
     {
      "title":"Add an api for creating notes like this. This title is optional. The id is not.",
      "rel":"createNote",
      "method":"PUT",
      "uri":"/notes/:id",
      "headers":{
       "content-type":"application/json"
      },
      "body":[
       {
        "name":"title",
        "title":"Add a text input field with a default value for the api like this.",
        "value":"Buy bread.",
        "type":"text"
       }
      ]
     }
    ]
    --=0ORkm
    content-type:application/json
    content-length:26

    {"method":"GET","url":"/"}
    --=0ORkm--

### Coding an app

An api always includes an http client and a hypermedia client at the /ua resource. The client may be loaded in a `<script>`. The client source code may be found [here][2].

    $ vim app.html # Create an app that will make api requests.

        <!DOCTYPE html>
        <html>
        <head>
            <title>Coast Browser</title>
        </head>
        <body>
        <script src="http://127.0.0.1:8080/ua"></script>
        <script>
            (function (window) {
                window.onload = function () {
                    /**
                     * Responses are unmodified using an http client.
                     * Recreate the previous curl request.
                     */
                    var httpClient = hypermedia.Api.request({
                        method: 'GET',
                        uri: 'http://127.0.0.1:8080/',
                        headers: {
                            accept: 'multipart/nav-data'
                        }
                    }, function (error, res) {
                        if (res) {
                            console.log('normal.');
                            console.log('status: ' + res.status);
                            console.log('content-type: ' + res.headers['content-type']);
                        }
                    });

                    /**
                     * This is equivalent because hypermedia content negotiation is done automatically.
                     * The response is modified back to its original non-hypermedia form automatically.
                     * The hypermedia is pulled out into a "DOM" available at hypeClient.apis.
                     * The client can now be asked if it .can().do() things with available hypermedia in the "DOM".
                     */
                    var hypeClient = hypermedia.Api.enter('http://127.0.0.1:8080/', function (error, res) {
                        function onCreateNote(error, res) {
                            if (res && res.status === 201 && res.headers['content-type'] === 'application/json') {
                                console.log('created note: ' + res.body);
                            } else console.error(error.message);
                        }

                        if (res) {
                            console.log('hypermedia.');
                            console.log('status: ' + res.status);
                            console.log('content-type: ' + res.headers['content-type']);
                            hypeClient.can('createNote').do({ uri: { id: 0 }, body: { title: 'Something cool.' } }, onCreateNote);
                        } else console.error(error.message);
                    });
                };
            })(window);
        </script>
        </body>
        </html>

    $ vim enter.js # Modify the enter handler to return the app.

        var fs = require('fs'),
            app = fs.readFileSync(require.resolve('./app.html'), 'utf8');

        module.exports = function (req, res, next) {
            res.status(200).set('content-type', 'text/html').body = app;
            // Add hypermedia to the reponse if the client negotiates for it.
            if (req.get('accept') === 'multipart/nav-data') {
                res.hype = ['createNote'];
            }
            next();
        };

### Playing with the app

A new start with the app.

    $ api # Run at the root of the API directory.

An app running in your browsers Javascript console.

    $ open "http://127.0.0.1:8080/" # Open your Javascript console when your browser is open.

## Contribute

Please maintain existing coding style, and provide [feedback][1] here.

[0]: https://dev.twitter.com/docs/api/1.1/post/statuses/update
[1]: https://github.com/coastjs/coast/issues
[2]: https://github.com/coastjs/hypermedia/blob/2.0.1/index.js#L781
