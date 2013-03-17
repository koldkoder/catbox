// Load modules

var Lab = require('lab');
var Catbox = require('..');


// Declare internals

var internals = {};


// Test shortcuts

var expect = Lab.expect;
var before = Lab.before;
var after = Lab.after;
var describe = Lab.experiment;
var it = Lab.test;


exports.test = function (engine) {

    describe('Common', function () {

        it('creates a new connection using ' + engine, function (done) {

            var client = new Catbox.Client(engine);
            client.start(function (err) {

                expect(client.isReady()).to.equal(true);
                done();
            });
        });

        it('closes the connection using ' + engine, function (done) {

            var client = new Catbox.Client(engine);
            client.start(function (err) {

                expect(client.isReady()).to.equal(true);
                client.stop();
                expect(client.isReady()).to.equal(false);
                done();
            });
        });

        it('gets an item after settig it using ' + engine, function (done) {

            var client = new Catbox.Client(engine);
            client.start(function (err) {

                var key = { id: 'x', segment: 'test' };
                client.set(key, '123', 500, function (err) {

                    expect(err).to.not.exist;
                    client.get(key, function (err, result) {

                        expect(err).to.equal(null);
                        expect(result.item).to.equal('123');
                        done();
                    });
                });
            });
        });

        it('gets an item after settig it with very long ttl using ' + engine, function (done) {

            var client = new Catbox.Client(engine);
            client.start(function (err) {

                var key = { id: 'x', segment: 'test' };
                client.set(key, '123', Math.pow(2, 63), function (err) {

                    expect(err).to.not.exist;
                    client.get(key, function (err, result) {

                        expect(err).to.equal(null);
                        expect(result && result.item).to.equal('123');
                        done();
                    });
                });
            });
        });

        it('ignored starting a connection twice on same event using ' + engine, function (done) {

            var client = new Catbox.Client(engine);
            var x = 2;
            var start = function () {

                client.start(function (err) {

                    expect(client.isReady()).to.equal(true);
                    --x;
                    if (!x) {
                        done();
                    }
                });
            };

            start();
            start();
        });

        it('ignored starting a connection twice chained using ' + engine, function (done) {

            var client = new Catbox.Client(engine);
            client.start(function (err) {

                expect(err).to.not.exist;
                expect(client.isReady()).to.equal(true);

                client.start(function (err) {

                    expect(err).to.not.exist;
                    expect(client.isReady()).to.equal(true);
                    done();
                });
            });
        });

        it('returns not found on get when using null key using ' + engine, function (done) {

            var client = new Catbox.Client(engine);
            client.start(function (err) {

                client.get(null, function (err, result) {

                    expect(err).to.equal(null);
                    expect(result).to.equal(null);
                    done();
                });
            });
        });

        it('returns not found on get when item expired using ' + engine, function (done) {

            var client = new Catbox.Client(engine);
            client.start(function (err) {

                var key = { id: 'x', segment: 'test' };
                client.set(key, 'x', 1, function (err) {

                    expect(err).to.not.exist;
                    setTimeout(function () {

                        client.get(key, function (err, result) {

                            expect(err).to.equal(null);
                            expect(result).to.equal(null);
                            done();
                        });
                    }, 2);
                });
            });
        });

        it('returns error on set when using null key using ' + engine, function (done) {

            var client = new Catbox.Client(engine);
            client.start(function (err) {

                client.set(null, {}, 1000, function (err) {

                    expect(err instanceof Error).to.equal(true);
                    done();
                });
            });
        });

        it('returns error on get when using invalid key using ' + engine, function (done) {

            var client = new Catbox.Client(engine);
            client.start(function (err) {

                client.get({}, function (err) {

                    expect(err instanceof Error).to.equal(true);
                    done();
                });
            });
        });

        it('returns error on drop when using invalid key using ' + engine, function (done) {

            var client = new Catbox.Client(engine);
            client.start(function (err) {

                client.drop({}, function (err) {

                    expect(err instanceof Error).to.equal(true);
                    done();
                });
            });
        });

        it('returns error on set when using invalid key using ' + engine, function (done) {

            var client = new Catbox.Client(engine);
            client.start(function (err) {

                client.set({}, {}, 1000, function (err) {

                    expect(err instanceof Error).to.equal(true);
                    done();
                });
            });
        });

        it('ignores set when using non-positive ttl value using ' + engine, function (done) {

            var client = new Catbox.Client(engine);
            client.start(function (err) {

                var key = { id: 'x', segment: 'test' };
                client.set(key, 'y', 0, function (err) {

                    expect(err).to.not.exist;
                    done();
                });
            });
        });

        it('returns error on drop when using null key using ' + engine, function (done) {

            var client = new Catbox.Client(engine);
            client.start(function (err) {

                client.drop(null, function (err) {

                    expect(err instanceof Error).to.equal(true);
                    done();
                });
            });
        });

        it('returns error on get when stopped using ' + engine, function (done) {

            var client = new Catbox.Client(engine);
            client.stop();
            var key = { id: 'x', segment: 'test' };
            client.connection.get(key, function (err, result) {

                expect(err).to.exist;
                expect(result).to.not.exist;
                done();
            });
        });

        it('returns error on set when stopped using ' + engine, function (done) {

            var client = new Catbox.Client(engine);
            client.stop();
            var key = { id: 'x', segment: 'test' };
            client.connection.set(key, 'y', 1, function (err) {

                expect(err).to.exist;
                done();
            });
        });

        it('returns error on drop when stopped using ' + engine, function (done) {

            var client = new Catbox.Client(engine);
            client.stop();
            var key = { id: 'x', segment: 'test' };
            client.connection.drop(key, function (err) {

                expect(err).to.exist;
                done();
            });
        });

        it('returns error on missing segment name using ' + engine, function (done) {

            var config = {
                expiresIn: 50000
            };
            var fn = function () {

                var client = new Catbox.Client(engine);
                var cache = new Catbox.Policy(config, client, '');
            };
            expect(fn).to.throw(Error);
            done();
        });

        it('returns error on bad segment name using ' + engine, function (done) {

            var config = {
                expiresIn: 50000
            };
            var fn = function () {

                var client = new Catbox.Client(engine);
                var cache = new Catbox.Policy(config, client, 'a\0b');
            };
            expect(fn).to.throw(Error);
            done();
        });

        it('returns error when cache item dropped while stopped using ' + engine, function (done) {

            var client = new Catbox.Client(engine);
            client.stop();
            client.drop('a', function (err) {

                expect(err).to.exist;
                done();
            });
        });
    });
};
