(function () {
    var xon = require('../xon'),
        validate = require('../validate'),
        assert = require('assert'),
        func = function () {
        };

    try {
        for (var i = 0; i < 3; i++) {
            switch (i) {
                case 0:
                    xon.linkify(true)
                        .quiet(false)
                        .prettify('xml')
                        .plugin(xon.XHTML5);
                    break;
                case 1:
                    xon.linkify(true)
                        .quiet(false)
                        .prettify('json')
                        .plugin(xon.JSON);
                    break;
                case 2:
                    xon.linkify(true)
                        .quiet(false)
                        .prettify('xml')
                        .plugin(xon.XHTML);
                    break;
                default:
                    break;
            }
            assert.strictEqual(validate.isString(xon.stringify(null)), true, '0');
            assert.strictEqual(validate.isString(xon.stringify(undefined)), true, '1');
            assert.strictEqual(validate.isString(xon.stringify(true)), true, '2');
            assert.strictEqual(validate.isString(xon.stringify(false)), true, '3');
            assert.strictEqual(validate.isString(xon.stringify(0)), true, '4');
            assert.strictEqual(validate.isString(xon.stringify(3.14)), true, '5');
            assert.strictEqual(validate.isString(xon.stringify(3e100)), true, '6');
            assert.strictEqual(validate.isString(xon.stringify('')), true, '7');
            assert.strictEqual(validate.isString(xon.stringify('testing')), true, '8');
            assert.strictEqual(validate.isString(xon.stringify('\\t\\t\\t\\t\\t')), true, '9');
            assert.strictEqual(validate.isString(xon.stringify('\\testing')), true, '10');
            assert.strictEqual(validate.isString(xon.stringify({})), true, '11');
            assert.strictEqual(validate.isString(xon.stringify([])), true, '12');
            assert.strictEqual(validate.isString(xon.stringify(func)), true, '13');
            assert.strictEqual(validate.isString(xon.stringify({'key':'value'})), true, '14');
            assert.strictEqual(validate.isString(xon.stringify({'key':null})), true, '15');
            assert.strictEqual(validate.isString(xon.stringify({'key':undefined})), true, '16');
            assert.strictEqual(validate.isString(xon.stringify({'key':func})), true, '17');
            assert.strictEqual(validate.isString(xon.stringify([1, 2, 3, func])), true, '18');
            assert.strictEqual(validate.isString(xon.stringify(new Date(79, 5, 24, 11, 33, 0))), true, '19');
            assert.strictEqual(validate.isString(xon.stringify({
                'key':func,
                'href':'http://www.google.com',
                'test':{
                    'href':'http://www.testing.com'
                }
            })), true, '20');
            console.log('Everything passed.');
        }
    } catch (e) {
        console.log(e);
    }
})();
