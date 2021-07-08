const EventEmitter = require('events');
// @ts-ignore
class MyEmitter extends EventEmitter {}


module.exports = new MyEmitter();