function NotImplementedError(message) {
    this.message = message || "this feature is not implemented yet.";
}

NotImplementedError.prototype = Object.create(Error.prototype, {
    constructor: { value: NotImplementedError },
    name: { value: 'NotImplementedError' },
    stack: { get: function() {
        return new Error().stack;
    }},
});

module.exports = {
    NotImplementedError
}