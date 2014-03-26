Hapi
====

Hapi is a hypermedia API driven by any media type, and any HTTP router, supported by the Hypermedia library.

## Installation

    cd paasta
    make build n=hapi
    make run n=hapi r="-d -p 22 -p 8080 -e SSHKEY='KEY'"

## Usage

    curl http://*.hapi.co

## Tests

No unit tests are currently present. Eventually:

    npm test

## Contributing

In lieu of a formal style guideline, take care to maintain the existing coding style.

## Release History

+ 0.0.1 Initial release
