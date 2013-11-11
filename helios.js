/* version = 0.2.0 */
var Helios;
(function (Helios) {
    var GraphDatabase = (function () {
        function GraphDatabase(options) {
            var heliosDBPath = options && ('heliosDBPath' in options) ? options['heliosDBPath'] : './helios/lib/heliosDB.js';
            try {
                this.worker = new Worker(heliosDBPath);
                this.db = Q_COMM.Connection(this.worker, null, {
                    max: 1024
                });
            } catch(err){
                throw new Error(err.message);
            }
        }
        
        GraphDatabase.prototype.setConfiguration = function (options) {
            var self = this;
            return this.db.invoke("dbCommand", [
                {
                    method: 'setConfiguration',
                    parameters: [
                        options
                    ]
                }
            ]).then(function (success) {
                if(!success){
                    throw new Error("Error setting Configuration.");
                }
                return self;
            });
        };

        /*GraphDatabase.prototype.createVIndex = function (idxName) {
            this.db.invoke("dbCommand", [
                {
                    method: 'createVIndex',
                    parameters: [
                        idxName
                    ]
                }
            ]).then(function (message) {
                console.log(message);
            }).end();
        };
        GraphDatabase.prototype.createEIndex = function (idxName) {
            this.db.invoke("dbCommand", [
                {
                    method: 'createEIndex',
                    parameters: [
                        idxName
                    ]
                }
            ]).then(function (message) {
                console.log(message);
            }).end();
        };
        GraphDatabase.prototype.deleteVIndex = function (idxName) {
            this.db.invoke("dbCommand", [
                {
                    method: 'deleteVIndex',
                    parameters: [
                        idxName
                    ]
                }
            ]).then(function (message) {
                console.log(message);
            }).end();
        };
        GraphDatabase.prototype.deleteEIndex = function (idxName) {
            this.db.invoke("dbCommand", [
                {
                    method: 'deleteEIndex',
                    parameters: [
                        idxName
                    ]
                }
            ]).then(function (message) {
                console.log(message);
            }).end();
        };*/

        GraphDatabase.prototype.loadGraphSON = function (jsonData) {
            var self = this;
            return this.db.invoke("dbCommand", [
                {
                    method: 'loadGraphSON',
                    parameters: [
                        jsonData
                    ]
                }
            ]).then(function (success) {
                if(!success){
                    throw new Error("Error loading GraphSON.");
                }
                GraphDatabase.prototype.v = _v;
                GraphDatabase.prototype.V = _v;
                GraphDatabase.prototype.e = _e;
                GraphDatabase.prototype.E = _e;
                return self;
            });
        };
        GraphDatabase.prototype.loadGraphML = function (xmlData) {
            var self = this;
            return this.db.invoke("dbCommand", [
                {
                    method: 'loadGraphML',
                    parameters: [
                        xmlData
                    ]
                }
            ]).then(function (success) {
                if(!success){
                    throw new Error("Error loading GraphML.");
                }
                GraphDatabase.prototype.v = _v;
                GraphDatabase.prototype.V = _v;
                GraphDatabase.prototype.e = _e;
                GraphDatabase.prototype.E = _e;
                return self;
            });            
        };

        function _v() {
            var args = [];
            for (var _i = 0; _i < (arguments.length - 0); _i++) {
                args[_i] = arguments[_i + 0];
            }
            return new Pipeline('v', args, this);
        };
        function _e() {
            var args = [];
            for (var _i = 0; _i < (arguments.length - 0); _i++) {
                args[_i] = arguments[_i + 0];
            }
            return new Pipeline('e', args, this);
        };

        GraphDatabase.prototype.shutdown = function () {
            var worker = this.worker;
            this.db.invoke("dbCommand", [
                {
                    method: 'shutdown',
                    parameters: []
                }
            ]).then(function (message) {
                worker.terminate();
                console.log('Closed');
            }).end();
        };
        return GraphDatabase;
    })();
    Helios.GraphDatabase = GraphDatabase;    
    var Pipeline = (function () {
        function Pipeline(method, args, helios) {
            this.helios = helios;
            this.placeholder = -1;
            this.messages = [
                {
                    method: method,
                    parameters: args
                }
            ];
            this.db = helios.db;
            this.pin = this.add('pin');
            this.unpin = this.add('unpin');
            this.out = this.add('out');
            this.in = this.add('in');
            this.both = this.add('both');
            this.bothE = this.add('bothE');
            this.bothV = this.add('bothV');
            this.inE = this.add('inE');
            this.inV = this.add('inV');
            this.outE = this.add('outE');
            this.outV = this.add('outV');
            this.order = this.add('order');
            this.id = this.add('id');
            this.label = this.add('label');
            this.property = this.add('property');
            this.count = this.add('count');
            this.stringify = this.add('stringify');
            this.map = this.add('map');
            this.hash = this.add('hash');
            this.where = this.add('where');
            this.index = this.add('index');
            this.range = this.add('range');
            this.dedup = this.add('dedup');
            this.transform = this.add('transform');
            this.filter = this.add('filter');
            this.as = this.add('as');
            this.back = this.add('back', true);
            this.optional = this.add('optional', true);
            this.select = this.add('select', true);
            this.ifThenElse = this.add('ifThenElse');
            this.loop = this.add('loop');
            this.except = this.add('except');
            this.retain = this.add('retain');
            this.path = this.add('path', true);

            this.sum = this.add('sum');
            this.group = this.add('group');
        }
        Pipeline.prototype.add = function (func, trace) {
            return function () {
                var args = [];
                for (var _i = 0; _i < (arguments.length - 0); _i++) {
                    args[_i] = arguments[_i + 0];
                }
                if(trace) {
                    this.db.invoke("startTrace", true).fail(function (err) {
                        console.log(err.message);
                    }).end();
                }
                if(func == 'pin') {
                    this.placeholder = this.messages.length;
                    return this;
                }
                if(func == 'unpin') {
                    this.placeholder = -1;
                    return this;
                }
                this.messages.push({
                    method: func,
                    parameters: args
                });
                return this;
            };
        };
        Pipeline.prototype.then = function (success, error) {
            var ctx = this;
            this.db.invoke("run", ctx.messages).then(function (result) {
                if(ctx.placeholder > -1) {
                    ctx.messages.length = ctx.placeholder;
                }
                return result;
            }, function (error) {
                return error;
            }).then(success, error).end();
        };
        return Pipeline;
    })();
    Helios.Pipeline = Pipeline;    
})(Helios || (Helios = {}));
