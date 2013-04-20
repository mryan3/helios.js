var Helios;
(function (Helios) {
    var GraphDatabase = (function () {
        function GraphDatabase(options) {
            this.worker = new Worker('./libs/heliosDB.js');
            this.db = Q_COMM.Connection(this.worker, null, {
                max: 1024
            });
            this.db.invoke("init", options).then(function (message) {
                console.log(message);
            }).end();
        }
        GraphDatabase.prototype.setConfiguration = function (options) {
            this.worker.postMessage({
                async: false,
                message: [
                    {
                        method: 'setConfiguration',
                        parameters: [
                            options
                        ]
                    }
                ]
            });
        };
        GraphDatabase.prototype.setPathEnabled = function (turnOn) {
            this.worker.postMessage({
                async: false,
                message: [
                    {
                        method: 'setPathEnabled',
                        parameters: [
                            turnOn
                        ]
                    }
                ]
            });
        };
        GraphDatabase.prototype.createVIndex = function (idxName) {
            this.worker.postMessage({
                async: false,
                message: [
                    {
                        method: 'createVIndex',
                        parameters: [
                            idxName
                        ]
                    }
                ]
            });
        };
        GraphDatabase.prototype.createEIndex = function (idxName) {
            this.worker.postMessage({
                async: false,
                message: [
                    {
                        method: 'createEIndex',
                        parameters: [
                            idxName
                        ]
                    }
                ]
            });
        };
        GraphDatabase.prototype.deleteVIndex = function (idxName) {
            this.worker.postMessage({
                async: false,
                message: [
                    {
                        method: 'deleteVIndex',
                        parameters: [
                            idxName
                        ]
                    }
                ]
            });
        };
        GraphDatabase.prototype.deleteEIndex = function (idxName) {
            this.worker.postMessage({
                async: false,
                message: [
                    {
                        method: 'deleteEIndex',
                        parameters: [
                            idxName
                        ]
                    }
                ]
            });
        };
        GraphDatabase.prototype.loadGraphSON = function (jsonData) {
            this.db.invoke("run", [
                {
                    method: 'loadGraphSON',
                    parameters: [
                        jsonData
                    ]
                }
            ]).then(function (message) {
                console.log(message);
            }).end();
            return true;
        };
        GraphDatabase.prototype.loadGraphML = function (xmlData) {
            this.worker.postMessage({
                async: false,
                message: [
                    {
                        method: 'loadGraphML',
                        parameters: [
                            xmlData
                        ]
                    }
                ]
            });
        };
        GraphDatabase.prototype.v = function () {
            var args = [];
            for (var _i = 0; _i < (arguments.length - 0); _i++) {
                args[_i] = arguments[_i + 0];
            }
            return new Pipeline('v', args, this);
        };
        GraphDatabase.prototype.e = function () {
            var args = [];
            for (var _i = 0; _i < (arguments.length - 0); _i++) {
                args[_i] = arguments[_i + 0];
            }
            return new Pipeline('e', args, this);
        };
        return GraphDatabase;
    })();
    Helios.GraphDatabase = GraphDatabase;    
    var Pipeline = (function () {
        function Pipeline(method, args, helios) {
            this.helios = helios;
            this.messages = [
                {
                    method: method,
                    parameters: args
                }
            ];
            this.db = helios.db;
            this.out = this.add('out');
            this.in = this.add('in');
            this.both = this.add('both');
            this.bothE = this.add('bothE');
            this.bothV = this.add('bothV');
            this.inE = this.add('inE');
            this.inV = this.add('inV');
            this.outE = this.add('outE');
            this.outV = this.add('outV');
            this.id = this.add('id');
            this.label = this.add('label');
            this.getProperty = this.add('getProperty');
            this.count = this.add('count');
            this.stringify = this.add('stringify');
            this.hash = this.add('hash');
            this.path = this.add('path');
            this.step = this.add('step');
        }
        Pipeline.prototype.add = function (func) {
            return function () {
                var args = [];
                for (var _i = 0; _i < (arguments.length - 0); _i++) {
                    args[_i] = arguments[_i + 0];
                }
                this.messages.push({
                    method: func,
                    parameters: args
                });
                return this;
            };
        };
        Pipeline.prototype.then = function (success, error) {
            this.messages.push({
                method: 'emit',
                parameters: []
            });
            this.db.invoke("run", this.messages).then(success, error).end();
        };
        return Pipeline;
    })();
    Helios.Pipeline = Pipeline;    
})(Helios || (Helios = {}));
//@ sourceMappingURL=helios.js.map
