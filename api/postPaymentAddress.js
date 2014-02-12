// module.exports = exports = function (req, res) {
// var xmp = require('/Users/ttahmouch/Desktop/git/hapi/node_modules/xmp'),
//         mp = xmp.multipart,
//         bp = xmp.bodypart;
//     res.statusCode = '200';
//     res.headers = {
//         'Content-Type': 'multipart/nav-data'
//     };
//     res.body =
//         mp('nav-data')
//             .addBodyPart(
//                 bp()
//                     .setType('application/json')
//                     .setPayload(JSON.stringify({}))
//             )
//             .addBodyPart(
//                 bp()
//                     .setType(this.getMediaType())
//                     .setPayload(this.respond(res.statusCode))
//             )
//             .toString();
// };
module.exports = exports = function (req, res) {
    res.statusCode = '200';
    res.headers = {
        'Content-Type': 'application/json'
    };
    res.body = '{}';
};
