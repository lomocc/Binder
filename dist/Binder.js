/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var ChangeWatcher = function () {
	    _createClass(ChangeWatcher, null, [{
	        key: "getPropertyDescriptor",
	        value: function getPropertyDescriptor(host, property) {
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
	    }, {
	        key: "bindProperty",
	        value: function bindProperty(host, chain, target, prop) {
	            var watcher = ChangeWatcher.watch(host, chain, null, null);
	            if (watcher) {
	                var assign = function assign(value) {
	                    target[prop] = value;
	                };
	                watcher.setHandler(assign, null);
	                assign(watcher.getValue());
	            }
	            return watcher;
	        }
	    }, {
	        key: "bindHandler",
	        value: function bindHandler(host, chain, handler, thisObject) {
	            var watcher = ChangeWatcher.watch(host, chain, handler, thisObject);
	            if (watcher) {
	                handler.call(thisObject, watcher.getValue());
	            }
	            return watcher;
	        }
	    }, {
	        key: "watch",
	        value: function watch(host, chain, handler, thisObject) {
	            if (typeof chain == "string") chain = [chain];
	            if (chain.length > 0) {
	                var property = chain.shift();
	                var next = this.watch(undefined, chain, handler, thisObject);
	                var watcher = new ChangeWatcher(property, handler, thisObject, next);
	                watcher.reset(host);
	                return watcher;
	            } else {
	                return null;
	            }
	        }
	    }, {
	        key: "defineBindable",
	        value: function defineBindable(host, property) {
	            var data = ChangeWatcher.getPropertyDescriptor(host, property);
	            if (data && data.set && data.get) {
	                var orgSet = data.set;
	                data.set = function (value) {
	                    if (this[property] !== value) {
	                        orgSet.call(this, value);
	                        ChangeWatcher.propertyChange(this, property);
	                    }
	                };
	            } else if (!data || !data.get && !data.set) {
	                ChangeWatcher.bindableCount++;
	                var newProp = ChangeWatcher.bindables + ChangeWatcher.bindableCount + property;
	                host[newProp] = data ? data.value : undefined;
	                data = { enumerable: true, configurable: true };
	                data.get = function () {
	                    return this[newProp];
	                };
	                data.set = function (value) {
	                    if (this[newProp] !== value) {
	                        this[newProp] = value;
	                        ChangeWatcher.propertyChange(this, property);
	                    }
	                };
	            } else {
	                return false;
	            }
	            Object.defineProperty(host, property, data);
	        }
	    }, {
	        key: "propertyChange",
	        value: function propertyChange(host, property) {
	            if (host.hasOwnProperty(ChangeWatcher.bindables)) {
	                var properties = host[ChangeWatcher.bindables];
	                var listeners = properties[property];
	                for (var i in listeners) {
	                    var listener = listeners[i];
	                    listener.wrapHandler.call(listener.thisObj, property);
	                }
	            }
	        }
	    }]);

	    function ChangeWatcher(property, handler, thisObject, next) {
	        _classCallCheck(this, ChangeWatcher);

	        this.isExecuting = false;

	        this.property = property;
	        this.handler = handler;
	        this.next = next;
	        this.thisObject = thisObject;
	    }

	    _createClass(ChangeWatcher, [{
	        key: "unwatch",
	        value: function unwatch() {
	            this.reset(undefined);
	            this.handler = null;
	            if (this.next) {
	                this.next.handler = null;
	            }
	        }
	    }, {
	        key: "getValue",
	        value: function getValue() {
	            if (this.next) {
	                return this.next.getValue();
	            }
	            return this.getHostPropertyValue();
	        }
	    }, {
	        key: "setHandler",
	        value: function setHandler(handler, thisObject) {
	            this.handler = handler;
	            this.thisObject = thisObject;
	            if (this.next) {
	                this.next.setHandler(handler, thisObject);
	            }
	        }
	    }, {
	        key: "reset",
	        value: function reset(newHost) {
	            var _this = this;

	            if (_typeof(this.host) == "object") {
	                var properties = this.host[ChangeWatcher.bindables];
	                if (properties.hasOwnProperty(this.property)) {
	                    properties[this.property] = properties[this.property].filter(function (listener, index, array) {
	                        return listener.wrapHandler != _this.wrapHandler || listener.thisObj != _this;
	                    });
	                }
	            }
	            this.host = newHost;
	            if (_typeof(this.host) == "object") {
	                if (!this.host.hasOwnProperty(ChangeWatcher.bindables)) this.host[ChangeWatcher.bindables] = {};
	                var properties = this.host[ChangeWatcher.bindables];
	                if (!properties.hasOwnProperty(this.property)) {
	                    ChangeWatcher.defineBindable(this.host, this.property);
	                }
	                var listener = { wrapHandler: this.wrapHandler, thisObj: this };
	                if (!properties.hasOwnProperty(this.property)) {
	                    properties[this.property] = [listener];
	                } else {
	                    properties[this.property].push(listener);
	                }
	            }
	            if (this.next) this.next.reset(this.getHostPropertyValue());
	        }
	    }, {
	        key: "getHostPropertyValue",
	        value: function getHostPropertyValue() {
	            return this.host ? this.host[this.property] : undefined;
	        }
	    }, {
	        key: "wrapHandler",
	        value: function wrapHandler(property) {
	            if (property == this.property && !this.isExecuting) {
	                try {
	                    this.isExecuting = true;
	                    if (this.next) this.next.reset(this.getHostPropertyValue());
	                    this.handler.call(this.thisObject, this.getValue());
	                } finally {
	                    this.isExecuting = false;
	                }
	            }
	        }
	    }]);

	    return ChangeWatcher;
	}();

	ChangeWatcher.bindables = "__bindables__";
	ChangeWatcher.bindableCount = 0;

	var Binder = function () {
	    function Binder() {
	        _classCallCheck(this, Binder);
	    }

	    _createClass(Binder, [{
	        key: "unBinding",
	        value: function unBinding() {
	            if (this._watchers != null) {
	                this._watchers.forEach(function (watcher, index, array) {
	                    watcher.unwatch();
	                });
	                this._watchers = null;
	            }
	        }
	    }, {
	        key: "bindProperty",
	        value: function bindProperty(host, chain, site, prop) {
	            if (this._watchers == null) this._watchers = [];
	            this._watchers.push(ChangeWatcher.bindProperty(host, chain, site, prop));
	        }
	    }, {
	        key: "bindSetter",
	        value: function bindSetter(host, chain, handler, thisObject) {
	            if (this._watchers == null) this._watchers = [];
	            this._watchers.push(ChangeWatcher.bindHandler(host, chain, handler, thisObject));
	        }
	    }]);

	    return Binder;
	}();

	exports.default = Binder;

/***/ }
/******/ ]);