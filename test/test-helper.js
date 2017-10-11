module.exports.eventually = function(done, fn) {
    return (...args) => {
        try {

            fn(...args);
            done();
        }
        catch (err) {
            done(err);
        }
    }
}