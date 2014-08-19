Coast
=====

Coast is a convention-over-configuration platform for building RESTful APIs with Node.JS and XMLHttpRequest.

## Installation

    which npm   # Installed?
    which node  # Installed?
    which coast # Installed?
    # Install npm & node >=0.10 from http://nodejs.org/download/
    # Install coast from npm globally. This drops modules in {prefix}/lib/node_modules, and puts executable files in
    # {prefix}/bin, where {prefix} is usually something like /usr/local. It also installs man pages in
    # {prefix}/share/man, if they’re supplied.
    npm install coast -g

## Usage

    coast --debug --dir=/path/to/api.json/and/handler/subdirectories
    curl http://127.0.0.1:8080/

## Tests

No unit tests are currently present. Eventually:

    npm test

## Contributing

In lieu of a formal style guideline, take care to maintain the existing coding style.
