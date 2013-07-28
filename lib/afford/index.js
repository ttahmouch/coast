#!/usr/bin/env node

var program = require('commander'),
    fs = require('fs'),
    path = require('path'),
    common = require('./lib/common.js'),
    xhn = require('../xhn');

var generator = common.generator,
    method = common.method,
    relations = common.relations,
    resource = common.resource,
    resources = common.resources;

var seperator = path.sep,
    folder = __dirname + seperator + 'api' + seperator,
    file = 'api.json';

var api = resources((fs.existsSync(folder + file)) ? JSON.parse(fs.readFileSync(folder + file, 'utf8')) : undefined),
    affordances = api.getAffordances(true),
    rels = relations(),
    apigen = generator()
        .setAffordances(affordances)
        .setDelegate(function (resource, method, status, affordances) {
            var json = !!program.json,
                quiet = !program.debug,
                hfactors = xhn.affordances,
                control = xhn.hc,
                stringify = xhn.stringify;

            var nonWordCharacters = /\W+/g,
                underscore = '_',
                statusString = status.toString(),
                methodString = method._method.toString(),
                resourceString = resource._uri.toString(),
                normalizedStatus = statusString.toLowerCase().replace(nonWordCharacters, underscore),
                normalizedMethod = methodString.toLowerCase().replace(nonWordCharacters, underscore),
                normalizedResource = resourceString.toLowerCase().replace(nonWordCharacters, underscore),
                statusPath = folder + normalizedStatus + seperator,
                methodPath = statusPath + normalizedMethod + seperator,
                resourcePath = methodPath + normalizedResource + seperator,
                extension = ((json) ? 'json' : 'xml'),
                file = 'response.' + extension;

            if (!quiet) {
                console.log('Will save to file: ' + resourcePath + file);
                console.log('Serialization format: ' + extension);
            }

            var hypermedia = hfactors(statusString);

            if (!quiet) {
                console.log('Affordances:');
                console.log(affordances);
            }

            function finish() {
                try {
                    if (!fs.existsSync(folder)) {
                        fs.mkdirSync(folder);
                    }
                    if (!fs.existsSync(statusPath)) {
                        fs.mkdirSync(statusPath);
                    }
                    if (!fs.existsSync(methodPath)) {
                        fs.mkdirSync(methodPath);
                    }
                    if (!fs.existsSync(resourcePath)) {
                        fs.mkdirSync(resourcePath);
                    }
                    fs.writeFileSync(resourcePath + file, stringify(hypermedia));
                } catch (e) {
                    console.log('Attempting to create the Affordance file at its default path threw an exception.');
                    console.log(e);
                }
                apigen.generate(quiet);
            }

            function chooseAction() {
                console.log('Please choose an action possibility. Choose done to serialize to disk.');
                program.choose(affordances, function (action) {
                    if (action === 0) {
                        finish();
                    } else {
                        action = affordances[action];
                        affordances = affordances.filter(function (element) {
                            return element !== action;
                        });

                        if (!quiet) {
                            console.log('Affordances:');
                            console.log(affordances);
                        }

                        var method = action._method,
                            resource = action._resource,
                            arguments = action._arguments,
                            id = action._id;

                        var hfactor = control();

                        hypermedia.addAffordance(hfactor);
                        hfactor._method = method;
                        hfactor._uri = resource;

                        if (!!arguments) {
                            hfactor._metadata.addField('Content-Type', arguments);
                        }
                        if (!!id) {
                            hfactor._id = id;
                        }
                        if (!quiet) {
                            console.log('You chose: ' + action);
                            console.log('Affordance Method:');
                            console.log(method);
                            console.log('Affordance Resource:');
                            console.log(resource);
                            console.log('Affordance Arguments:');
                            console.log(arguments);
                            console.log('Affordance ID:');
                            console.log(id);
                        }

                        program.prompt('Enter a link relation: ', function (relation) {
                            hfactor._relation = relation;
                            if (!id) {
                                program.prompt('Enter a link identifier: ', function (id) {
                                    hfactor._id = id;
                                    chooseAction();
                                });
                            } else {
                                chooseAction();
                            }
                        });
                    }
                });
            }

            function start() {
                console.log('Generating: ' + method._method + ' --> ' + resource._uri + ' --> ' + status);
                chooseAction();
            }

            start();
        });

program
    .command('put [res] [met]')
    .description('Create or Update a Resource or Method within your API specification.')
    .action(function (res, met) {
        var quiet = !program.debug,
            ret = (typeof program.returns === 'string') ? program.returns : null,
            arg = (typeof program.arguments === 'string') ? program.arguments : null,
            id = (typeof program.id === 'string') ? program.id : null,
            ids = api.getIds(true);

        if (!quiet) {
            console.log('Resource:');
            console.log(res);
            console.log('Method:');
            console.log(met);
            console.log('Method arguments:');
            console.log(arg);
            console.log('Method returns:');
            console.log(ret);
            console.log('Method id:');
            console.log(id);
            console.log('Existing Method ids:');
            console.dir(ids);
        }

        if (!!met) {
            res = api.getResource(res);

            if (!!ret) {
                try {
                    ret = JSON.parse('[' + ret + ']');
                    ret = ret.filter(function (element, position) {
                        return ret.indexOf(element) === position;
                    });
                } catch (e) {
                    console.log('A valid, comma-delimited set of status codes must be entered for your transfer protocol. ' +
                        'An (HTTP) example: 200,300,400,500');
                    return;
                }
            }
            if (!!res) {
                if (!!id) {
                    var pair = api.getResourceMethodPair(id),
                        same = !!pair && (pair[0] === res) && (pair[1] === res.getMethod(met));
                    if (!!pair && !same) {
                        console.log('A valid, globally unique method ID should be entered.');
                        return;
                    }
                }

                res.putMethod(method(met, arg, ret, id));
                if (!quiet) {
                    ids = api.getIds(true);
                    console.log('Updated Method ids:');
                    console.dir(ids);
                }
            } else {
                console.log('A valid, existent resource from your API should be entered. An example: /uri');
            }
        } else if (!!res) {
            api.putResource(resource(res));
        }
    });

program
    .command('get [res] [met]')
    .description('Retrieve an existing Resource or Method within your API specification.')
    .action(function (res, met) {
        var quiet = !program.debug,
            id = (typeof program.id === 'string') ? program.id : null,
            ids = api.getIds(true);

        if (!quiet) {
            console.log('Resource:');
            console.log(res);
            console.log('Method:');
            console.log(met);
            console.log('Method id:');
            console.log(id);
            console.log('Existing Method ids:');
            console.dir(ids);
        }
        if (!!met) {
            res = api.getResource(res);

            if (!!res) {
                console.log(JSON.stringify(res.getMethod(met), null, '    '));
            } else {
                console.log('A valid, existent resource from your API should be entered. An example: /uri');
            }
        } else if (!!res) {
            console.log(JSON.stringify(api.getResource(res), null, '    '));
        } else if (!!id) {
            console.log(JSON.stringify(api.getMethod(id), null, '    '));
        } else {
            console.log(JSON.stringify(api, null, '    '));
        }
    });

program
    .command('del [res] [met]')
    .description('Delete an existing Resource or Method within your API specification.')
    .action(function (res, met) {
        var quiet = !program.debug,
            id = (typeof program.id === 'string') ? program.id : null,
            ids = api.getIds(true);

        if (!quiet) {
            console.log('Resource:');
            console.log(res);
            console.log('Method:');
            console.log(met);
            console.log('Method id:');
            console.log(id);
            console.log('Existing Method ids:');
            console.dir(ids);
        }
        if (!!met) {
            res = api.getResource(res);

            if (!!res) {
                res.deleteMethod(met);
            } else {
                console.log('A valid, existent resource from your API should be entered. An example: /uri');
            }
        } else if (!!res) {
            api.deleteResource(res);
        } else if (!!id) {
            api.deleteMethod(id);
        }
        if (!quiet) {
            ids = api.getIds(true);
            console.log('Updated Method ids:');
            console.dir(ids);
        }
    });

program
    .command('gen [res] [met]')
    .description('Generate a hypermedia response for any possible affordance within your API specification.')
    .action(function (res, met) {
        var quiet = !program.debug,
            ret = (typeof program.returns === 'string') ? program.returns : null,
            id = (typeof program.id === 'string') ? program.id : null,
            ids = api.getIds(true);

        if (!!program.json) {
            xhn.plugin(xhn.NavAL_JSON);
            xhn.prettify('json');
        } else {
            xhn.plugin(xhn.NavAL_XML);
            xhn.prettify('xml');
        }

        xhn.quiet(quiet);

        if (!quiet) {
            console.log('Resource:');
            console.log(res);
            console.log('Method:');
            console.log(met);
            console.log('Method returns:');
            console.log(ret);
            console.log('Method id:');
            console.log(id);
            console.log('Existing Method ids:');
            console.dir(ids);
        }

        if (!!ret) {
            try {
                ret = JSON.parse('[' + ret + ']');
                ret = ret.filter(function (element, position) {
                    return ret.indexOf(element) === position;
                });
            } catch (e) {
                console.log('A valid, comma-delimited set of status codes must be entered for your transfer protocol. ' +
                    'An (HTTP) example: 200,300,400,500');
                return;
            }
        }

        if (!!met) {
            res = api.getResource(res);

            if (!!res) {
                met = res.getMethod(met);

                if (!!met) {
                    apigen
                        .setResource(res)
                        .setMethod(met)
                        .setStatusCodes(ret)
                        .generate(quiet);
                } else {
                    console.log('A valid, existent method for your resource should be entered. An example: DELETE');
                }
            } else {
                console.log('A valid, existent resource from your API should be entered. An example: /uri');
            }
        } else if (!!res) {
            res = api.getResource(res);

            if (!!res) {
                apigen
                    .setResource(res)
                    .generate(quiet);
            } else {
                console.log('A valid, existent resource from your API should be entered. An example: /uri');
            }
        } else if (!!id) {
            var pair = api.getResourceMethodPair(id);

            if (!!pair) {
                apigen
                    .setResource(pair[0])
                    .setMethod(pair[1])
                    .setStatusCodes(ret)
                    .generate(quiet);
            } else {
                console.log('A valid, existent id from your API should be entered. Ids are optional. So make sure it is defined.');
            }
        } else {
            apigen
                .setResources(api)
                .generate(quiet);
        }
    });

program
    .command('ls')
    .description('List all affordances available within your API specification.')
    .action(function () {
        api.getAffordances(false);
    });

program
    .version('0.0.1')
    .option('-a, --arguments [arg]', 'Use this flag when putting a method to specify a media type argument that method may accept.')
    .option('-d, --debug', 'Use this flag when you would like to see debug logs in the console.')
    .option('-i, --id [id]', 'Use this flag when putting a method to specify a unique identifier for that method.')
    .option('-j, --json', 'Use this flag when generating to ensure the output is json.')
    .option('-r, --returns [ret]', 'Use this flag when putting or generating to specify a comma-separated set of status codes.')
    .option('-x, --xml', 'Use this flag when generating to ensure the output is xml.')
    .parse(process.argv);

if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder);
}

fs.writeFileSync(folder + file, JSON.stringify(api, null, '    '));
