/**
 * Module dependencies.
 */
var common = require('./index.js'),
    affordance = common.affordance,
    affordances = common.affordances,
    encoder = common.encoder,
    input = common.input,
    naval = common.naval;

/**
 * Create an instance of Encoder.
 */
var encoderInstance1 = encoder(naval),
    encoderInstance2 = encoder().setPlugin(naval),
    encoderInstance3 = encoder();

/**
 * Create an instance of Affordances and Affordance, and attempt to serialize them with the encoder.
 */
var affordancesInstance = affordances(),
    affordancesInstance2 = affordances(),
    affordanceInstance1 = affordance('entry', 'self', 'GET', '/', {
        'Host':'www.example.com',
        'Accept':'multipart/nav-data'
    }),
    affordanceInstance2 = affordance('put-merchant', 'item', 'PUT', '/merchant/:merchant', {
        'Host':'www.example.com',
        'Accept':'multipart/nav-data',
        'Content-Type':'application/vnd.example.merchant+json'
    }),
    affordanceInstance3 = affordance('get-merchant', 'item', 'GET', '/merchant/:merchant', {
        'Host':'www.example.com',
        'Accept':'multipart/nav-data'
    }),
    inputInstance = input();

affordancesInstance
    .addAffordance(affordanceInstance1)
    .addAffordance(affordanceInstance2);

affordanceInstance3
    .addInput(inputInstance);

console.log(encoderInstance1.encode(affordancesInstance));
console.log('[END1]\n');
console.log(encoderInstance1.encode(affordanceInstance1));
console.log('[END1]\n');
console.log(encoderInstance1.encode(affordanceInstance2));
console.log('[END1]\n');
console.log(encoderInstance1.encode(inputInstance));
console.log('[END1]\n');
console.log(encoderInstance1.encode(affordanceInstance3));

affordancesInstance.addAffordance(affordancesInstance2);

console.log('[END1]\n');
console.log(encoderInstance1.encode(affordancesInstance));

console.log('[END1]\n');
console.log(encoderInstance2.encode(affordancesInstance));
console.log('[END2]\n');
console.log(encoderInstance2.encode(affordanceInstance1));
console.log('[END2]\n');
console.log(encoderInstance2.encode(affordanceInstance2));
console.log('[END2]\n');
console.log(encoderInstance2.encode(inputInstance));
console.log('[END2]\n');
console.log(encoderInstance2.encode(affordanceInstance3));

affordancesInstance.addAffordance(affordancesInstance2);

console.log('[END2]\n');
console.log(encoderInstance2.encode(affordancesInstance));

console.log('[END2]\n');
console.log(encoderInstance3.encode(affordancesInstance));
console.log('[END3]\n');
console.log(encoderInstance3.encode(affordanceInstance1));
console.log('[END3]\n');
console.log(encoderInstance3.encode(affordanceInstance2));
console.log('[END3]\n');
console.log(encoderInstance3.encode(inputInstance));
console.log('[END3]\n');
console.log(encoderInstance3.encode(affordanceInstance3));

affordancesInstance.addAffordance(affordancesInstance2);

console.log('[END3]\n');
console.log(encoderInstance3.encode(affordancesInstance));
console.log('[END3]\n');
