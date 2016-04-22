class ChangeWatcher {
    static bindables = "__bindables__";
    static bindableCount = 0;

    static getPropertyDescriptor(host, property) {
        var data = Object.getOwnPropertyDescriptor(host, property);
        if (data) {
            return data;
        }
        var prototype = Object.getPrototypeOf(host);
        if (prototype) {
            return ChangeWatcher.getPropertyDescriptor(prototype, property);
        }
        return null;
    }

    static bindProperty(host, chain, target, prop) {
        var watcher = ChangeWatcher.watch(host, chain, null, null);
        if (watcher) {
            var assign = function (value) {
                target[prop] = value;
            };
            watcher.setHandler(assign, null);
            assign(watcher.getValue());
        }
        return watcher;
    }

    static bindHandler(host, chain, handler, thisObject) {
        var watcher = ChangeWatcher.watch(host, chain, handler, thisObject);
        if (watcher) {
            handler.call(thisObject, watcher.getValue());
        }
        return watcher;
    }

    static watch(host, chain, handler, thisObject) {
        if (typeof chain == "string")
            chain = [chain];
        if (chain.length > 0) {
            var property = chain.shift();
            var next = this.watch(undefined, chain, handler, thisObject);
            var watcher = new ChangeWatcher(property, handler, thisObject, next);
            watcher.reset(host);
            return watcher;
        }
        else {
            return null;
        }
    }

    static defineBindable(host, property) {
        var data = ChangeWatcher.getPropertyDescriptor(host, property);
        if (data && data.set && data.get) {
            var orgSet = data.set;
            data.set = function (value) {
                if (this[property] !== value) {
                    orgSet.call(this, value);
                    ChangeWatcher.propertyChange(this, property);
                }
            };
        }
        else if (!data || (!data.get && !data.set)) {
            ChangeWatcher.bindableCount++;
            var newProp = ChangeWatcher.bindables + ChangeWatcher.bindableCount + property;
            host[newProp] = data ? data.value : undefined;
            data = {enumerable: true, configurable: true};
            data.get = function () {
                return this[newProp];
            };
            data.set = function (value) {
                if (this[newProp] !== value) {
                    this[newProp] = value;
                    ChangeWatcher.propertyChange(this, property);
                }
            };
        }
        else {
            return false;
        }
        Object.defineProperty(host, property, data);
    }

    static propertyChange(host, property) {
        if (host.hasOwnProperty(ChangeWatcher.bindables)) {
            var properties = host[ChangeWatcher.bindables];
            var listeners = properties[property];
            for (var i in listeners) {
                var listener = listeners[i];
                listener.wrapHandler.call(listener.thisObj, property);
            }
        }

    }

    host;
    property;
    handler;
    thisObject;
    next;
    isExecuting = false;

    constructor(property, handler, thisObject, next) {
        this.property = property;
        this.handler = handler;
        this.next = next;
        this.thisObject = thisObject;
    }

    unwatch() {
        this.reset(undefined);
        this.handler = null;
        if (this.next) {
            this.next.handler = null;
        }
    }

    getValue() {
        if (this.next) {
            return this.next.getValue();
        }
        return this.getHostPropertyValue();
    }

    setHandler(handler, thisObject) {
        this.handler = handler;
        this.thisObject = thisObject;
        if (this.next) {
            this.next.setHandler(handler, thisObject);
        }
    }

    reset(newHost) {
        if (typeof this.host == "object") {
            var properties = this.host[ChangeWatcher.bindables];
            if (properties.hasOwnProperty(this.property)) {
                properties[this.property] = properties[this.property].filter(
                    (listener, index, array)=> {
                        return listener.wrapHandler != this.wrapHandler || listener.thisObj != this;
                    });
            }
        }
        this.host = newHost;
        if (typeof this.host == "object") {
            if (!this.host.hasOwnProperty(ChangeWatcher.bindables))
                this.host[ChangeWatcher.bindables] = {};
            var properties = this.host[ChangeWatcher.bindables];
            if (!properties.hasOwnProperty(this.property)) {
                ChangeWatcher.defineBindable(this.host, this.property);
            }
            var listener = {wrapHandler: this.wrapHandler, thisObj: this};
            if (!properties.hasOwnProperty(this.property)) {
                properties[this.property] = [listener];
            } else {
                properties[this.property].push(listener);
            }
        }
        if (this.next)
            this.next.reset(this.getHostPropertyValue());
    }

    getHostPropertyValue() {
        return this.host ? this.host[this.property] : undefined;
    }

    wrapHandler(property) {
        if (property == this.property && !this.isExecuting) {
            try {
                this.isExecuting = true;
                if (this.next)
                    this.next.reset(this.getHostPropertyValue());
                this.handler.call(this.thisObject, this.getValue());
            }
            finally {
                this.isExecuting = false;
            }
        }
    }
}
export default class Binder {
    _watchers;

    unBinding() {
        if (this._watchers != null) {
            this._watchers.forEach(function (watcher, index, array) {
                watcher.unwatch();
            });
            this._watchers = null;
        }
    }

    bindProperty(host, chain, site, prop) {
        if (this._watchers == null)this._watchers = [];
        this._watchers.push(ChangeWatcher.bindProperty(host, chain, site, prop));
    }

    bindSetter(host, chain, handler, thisObject) {
        if (this._watchers == null)this._watchers = [];
        this._watchers.push(ChangeWatcher.bindHandler(host, chain, handler, thisObject));
    }
}