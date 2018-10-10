/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 275);
/******/ })
/************************************************************************/
/******/ ({

/***/ 1:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Level", function() { return Level; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "init", function() { return init; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "log", function() { return log; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getLogs", function() { return getLogs; });
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(2);

var LEVEL_STR = "level";
var Level;
(function (Level) {
    Level[Level["DEBUG"] = 0] = "DEBUG";
    Level[Level["INFO"] = 1] = "INFO";
    Level[Level["WARN"] = 2] = "WARN";
})(Level || (Level = {}));
;
var logLevel = Level.WARN;
var pendingLines = [];
var process = "";
function addListener() {
    browser.storage.onChanged.addListener(function (changes) {
        var levelChange = _utils__WEBPACK_IMPORTED_MODULE_0__["getSafe"](function () { return changes[LEVEL_STR].newValue; });
        if (levelChange) {
            console.log("[Diagnostics] level-changed: " + levelChange);
            logLevel = Level[levelChange];
        }
    });
}
function trimDiagnostics(diagnostics) {
    if (diagnostics !== undefined) {
        var entries = diagnostics.split("\n").length;
        if (entries > 100) {
            return diagnostics.replace(/(.*\n){50}/, "");
        }
        else {
            return diagnostics;
        }
    }
    return "";
}
function appendStorage(lines) {
    var diagString = "diagnostics" + process;
    return _utils__WEBPACK_IMPORTED_MODULE_0__["storageGet"](diagString).then(function (result) {
        var diagnostics = trimDiagnostics(result[diagString]);
        var newLines = lines.join("");
        return diagnostics + newLines;
    }).then(function (newDiagnostics) {
        return _utils__WEBPACK_IMPORTED_MODULE_0__["storageSet"](diagString, newDiagnostics);
    });
}
function logStorage(message) {
    if (pendingLines.push(message + "\n") >= 10) {
        appendStorage(pendingLines.slice());
        pendingLines = [];
    }
}
function logConsoleWarn(message) {
    console.warn(message);
}
function logConsoleInfo(message) {
    console.log(message);
}
function getTimeString() {
    var currentTime = new Date();
    return currentTime.getHours() + ":" + currentTime.getMinutes() + ":" + currentTime.getSeconds();
}
function logOutputs(level, message) {
    var timeString = getTimeString();
    var line = "[TB] " + Level[level] + " :" + timeString + " - " + message;
    if (level == Level.WARN) {
        logConsoleWarn(line);
    }
    else {
        logConsoleInfo(line);
    }
    logStorage(line);
}
function init(src) {
    process = src;
    _utils__WEBPACK_IMPORTED_MODULE_0__["storageGet"](LEVEL_STR).then(function (result) {
        var level = result[LEVEL_STR];
        if (level !== undefined) {
            logLevel = level;
        }
    });
}
function log(level, message) {
    var currentLevel = logLevel;
    var shouldLog = (level == Level.WARN) || (currentLevel == Level.DEBUG) ||
        (currentLevel == Level.INFO && level != Level.DEBUG);
    if (shouldLog) {
        logOutputs(level, message);
    }
}
function getLogs() {
    return appendStorage(pendingLines).then(function () {
        return _utils__WEBPACK_IMPORTED_MODULE_0__["storageGetAll"]();
    }).then(function (result) {
        return result.diagnosticsBackground;
    });
}
_utils__WEBPACK_IMPORTED_MODULE_0__["storageGet"](LEVEL_STR).then(function (result) {
    var levelChange = result[LEVEL_STR];
    if (levelChange !== undefined) {
        logLevel = Level[levelChange];
    }
});
addListener();


/***/ }),

/***/ 10:
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(process) {

var utils = __webpack_require__(6);
var normalizeHeaderName = __webpack_require__(12);

var DEFAULT_CONTENT_TYPE = {
  'Content-Type': 'application/x-www-form-urlencoded'
};

function setContentTypeIfUnset(headers, value) {
  if (!utils.isUndefined(headers) && utils.isUndefined(headers['Content-Type'])) {
    headers['Content-Type'] = value;
  }
}

function getDefaultAdapter() {
  var adapter;
  if (typeof XMLHttpRequest !== 'undefined') {
    // For browsers use XHR adapter
    adapter = __webpack_require__(13);
  } else if (typeof process !== 'undefined') {
    // For node use HTTP adapter
    adapter = __webpack_require__(13);
  }
  return adapter;
}

var defaults = {
  adapter: getDefaultAdapter(),

  transformRequest: [function transformRequest(data, headers) {
    normalizeHeaderName(headers, 'Content-Type');
    if (utils.isFormData(data) ||
      utils.isArrayBuffer(data) ||
      utils.isBuffer(data) ||
      utils.isStream(data) ||
      utils.isFile(data) ||
      utils.isBlob(data)
    ) {
      return data;
    }
    if (utils.isArrayBufferView(data)) {
      return data.buffer;
    }
    if (utils.isURLSearchParams(data)) {
      setContentTypeIfUnset(headers, 'application/x-www-form-urlencoded;charset=utf-8');
      return data.toString();
    }
    if (utils.isObject(data)) {
      setContentTypeIfUnset(headers, 'application/json;charset=utf-8');
      return JSON.stringify(data);
    }
    return data;
  }],

  transformResponse: [function transformResponse(data) {
    /*eslint no-param-reassign:0*/
    if (typeof data === 'string') {
      try {
        data = JSON.parse(data);
      } catch (e) { /* Ignore */ }
    }
    return data;
  }],

  /**
   * A timeout in milliseconds to abort a request. If set to 0 (default) a
   * timeout is not created.
   */
  timeout: 0,

  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',

  maxContentLength: -1,

  validateStatus: function validateStatus(status) {
    return status >= 200 && status < 300;
  }
};

defaults.headers = {
  common: {
    'Accept': 'application/json, text/plain, */*'
  }
};

utils.forEach(['delete', 'get', 'head'], function forEachMethodNoData(method) {
  defaults.headers[method] = {};
});

utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
  defaults.headers[method] = utils.merge(DEFAULT_CONTENT_TYPE);
});

module.exports = defaults;

/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(11)))

/***/ }),

/***/ 11:
/***/ (function(module, exports) {

// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };


/***/ }),

/***/ 12:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var utils = __webpack_require__(6);

module.exports = function normalizeHeaderName(headers, normalizedName) {
  utils.forEach(headers, function processHeader(value, name) {
    if (name !== normalizedName && name.toUpperCase() === normalizedName.toUpperCase()) {
      headers[normalizedName] = value;
      delete headers[name];
    }
  });
};


/***/ }),

/***/ 13:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var utils = __webpack_require__(6);
var settle = __webpack_require__(14);
var buildURL = __webpack_require__(17);
var parseHeaders = __webpack_require__(18);
var isURLSameOrigin = __webpack_require__(19);
var createError = __webpack_require__(15);
var btoa = (typeof window !== 'undefined' && window.btoa && window.btoa.bind(window)) || __webpack_require__(20);

module.exports = function xhrAdapter(config) {
  return new Promise(function dispatchXhrRequest(resolve, reject) {
    var requestData = config.data;
    var requestHeaders = config.headers;

    if (utils.isFormData(requestData)) {
      delete requestHeaders['Content-Type']; // Let the browser set it
    }

    var request = new XMLHttpRequest();
    var loadEvent = 'onreadystatechange';
    var xDomain = false;

    // For IE 8/9 CORS support
    // Only supports POST and GET calls and doesn't returns the response headers.
    // DON'T do this for testing b/c XMLHttpRequest is mocked, not XDomainRequest.
    if ("none" !== 'test' &&
        typeof window !== 'undefined' &&
        window.XDomainRequest && !('withCredentials' in request) &&
        !isURLSameOrigin(config.url)) {
      request = new window.XDomainRequest();
      loadEvent = 'onload';
      xDomain = true;
      request.onprogress = function handleProgress() {};
      request.ontimeout = function handleTimeout() {};
    }

    // HTTP basic authentication
    if (config.auth) {
      var username = config.auth.username || '';
      var password = config.auth.password || '';
      requestHeaders.Authorization = 'Basic ' + btoa(username + ':' + password);
    }

    request.open(config.method.toUpperCase(), buildURL(config.url, config.params, config.paramsSerializer), true);

    // Set the request timeout in MS
    request.timeout = config.timeout;

    // Listen for ready state
    request[loadEvent] = function handleLoad() {
      if (!request || (request.readyState !== 4 && !xDomain)) {
        return;
      }

      // The request errored out and we didn't get a response, this will be
      // handled by onerror instead
      // With one exception: request that using file: protocol, most browsers
      // will return status as 0 even though it's a successful request
      if (request.status === 0 && !(request.responseURL && request.responseURL.indexOf('file:') === 0)) {
        return;
      }

      // Prepare the response
      var responseHeaders = 'getAllResponseHeaders' in request ? parseHeaders(request.getAllResponseHeaders()) : null;
      var responseData = !config.responseType || config.responseType === 'text' ? request.responseText : request.response;
      var response = {
        data: responseData,
        // IE sends 1223 instead of 204 (https://github.com/axios/axios/issues/201)
        status: request.status === 1223 ? 204 : request.status,
        statusText: request.status === 1223 ? 'No Content' : request.statusText,
        headers: responseHeaders,
        config: config,
        request: request
      };

      settle(resolve, reject, response);

      // Clean up request
      request = null;
    };

    // Handle low level network errors
    request.onerror = function handleError() {
      // Real errors are hidden from us by the browser
      // onerror should only fire if it's a network error
      reject(createError('Network Error', config, null, request));

      // Clean up request
      request = null;
    };

    // Handle timeout
    request.ontimeout = function handleTimeout() {
      reject(createError('timeout of ' + config.timeout + 'ms exceeded', config, 'ECONNABORTED',
        request));

      // Clean up request
      request = null;
    };

    // Add xsrf header
    // This is only done if running in a standard browser environment.
    // Specifically not if we're in a web worker, or react-native.
    if (utils.isStandardBrowserEnv()) {
      var cookies = __webpack_require__(21);

      // Add xsrf header
      var xsrfValue = (config.withCredentials || isURLSameOrigin(config.url)) && config.xsrfCookieName ?
          cookies.read(config.xsrfCookieName) :
          undefined;

      if (xsrfValue) {
        requestHeaders[config.xsrfHeaderName] = xsrfValue;
      }
    }

    // Add headers to the request
    if ('setRequestHeader' in request) {
      utils.forEach(requestHeaders, function setRequestHeader(val, key) {
        if (typeof requestData === 'undefined' && key.toLowerCase() === 'content-type') {
          // Remove Content-Type if data is undefined
          delete requestHeaders[key];
        } else {
          // Otherwise add header to the request
          request.setRequestHeader(key, val);
        }
      });
    }

    // Add withCredentials to request if needed
    if (config.withCredentials) {
      request.withCredentials = true;
    }

    // Add responseType to request if needed
    if (config.responseType) {
      try {
        request.responseType = config.responseType;
      } catch (e) {
        // Expected DOMException thrown by browsers not compatible XMLHttpRequest Level 2.
        // But, this can be suppressed for 'json' type as it can be parsed by default 'transformResponse' function.
        if (config.responseType !== 'json') {
          throw e;
        }
      }
    }

    // Handle progress if needed
    if (typeof config.onDownloadProgress === 'function') {
      request.addEventListener('progress', config.onDownloadProgress);
    }

    // Not all browsers support upload events
    if (typeof config.onUploadProgress === 'function' && request.upload) {
      request.upload.addEventListener('progress', config.onUploadProgress);
    }

    if (config.cancelToken) {
      // Handle cancellation
      config.cancelToken.promise.then(function onCanceled(cancel) {
        if (!request) {
          return;
        }

        request.abort();
        reject(cancel);
        // Clean up request
        request = null;
      });
    }

    if (requestData === undefined) {
      requestData = null;
    }

    // Send the request
    request.send(requestData);
  });
};


/***/ }),

/***/ 14:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var createError = __webpack_require__(15);

/**
 * Resolve or reject a Promise based on response status.
 *
 * @param {Function} resolve A function that resolves the promise.
 * @param {Function} reject A function that rejects the promise.
 * @param {object} response The response.
 */
module.exports = function settle(resolve, reject, response) {
  var validateStatus = response.config.validateStatus;
  // Note: status is not exposed by XDomainRequest
  if (!response.status || !validateStatus || validateStatus(response.status)) {
    resolve(response);
  } else {
    reject(createError(
      'Request failed with status code ' + response.status,
      response.config,
      null,
      response.request,
      response
    ));
  }
};


/***/ }),

/***/ 15:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var enhanceError = __webpack_require__(16);

/**
 * Create an Error with the specified message, config, error code, request and response.
 *
 * @param {string} message The error message.
 * @param {Object} config The config.
 * @param {string} [code] The error code (for example, 'ECONNABORTED').
 * @param {Object} [request] The request.
 * @param {Object} [response] The response.
 * @returns {Error} The created error.
 */
module.exports = function createError(message, config, code, request, response) {
  var error = new Error(message);
  return enhanceError(error, config, code, request, response);
};


/***/ }),

/***/ 16:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/**
 * Update an Error with the specified config, error code, and response.
 *
 * @param {Error} error The error to update.
 * @param {Object} config The config.
 * @param {string} [code] The error code (for example, 'ECONNABORTED').
 * @param {Object} [request] The request.
 * @param {Object} [response] The response.
 * @returns {Error} The error.
 */
module.exports = function enhanceError(error, config, code, request, response) {
  error.config = config;
  if (code) {
    error.code = code;
  }
  error.request = request;
  error.response = response;
  return error;
};


/***/ }),

/***/ 17:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var utils = __webpack_require__(6);

function encode(val) {
  return encodeURIComponent(val).
    replace(/%40/gi, '@').
    replace(/%3A/gi, ':').
    replace(/%24/g, '$').
    replace(/%2C/gi, ',').
    replace(/%20/g, '+').
    replace(/%5B/gi, '[').
    replace(/%5D/gi, ']');
}

/**
 * Build a URL by appending params to the end
 *
 * @param {string} url The base of the url (e.g., http://www.google.com)
 * @param {object} [params] The params to be appended
 * @returns {string} The formatted url
 */
module.exports = function buildURL(url, params, paramsSerializer) {
  /*eslint no-param-reassign:0*/
  if (!params) {
    return url;
  }

  var serializedParams;
  if (paramsSerializer) {
    serializedParams = paramsSerializer(params);
  } else if (utils.isURLSearchParams(params)) {
    serializedParams = params.toString();
  } else {
    var parts = [];

    utils.forEach(params, function serialize(val, key) {
      if (val === null || typeof val === 'undefined') {
        return;
      }

      if (utils.isArray(val)) {
        key = key + '[]';
      } else {
        val = [val];
      }

      utils.forEach(val, function parseValue(v) {
        if (utils.isDate(v)) {
          v = v.toISOString();
        } else if (utils.isObject(v)) {
          v = JSON.stringify(v);
        }
        parts.push(encode(key) + '=' + encode(v));
      });
    });

    serializedParams = parts.join('&');
  }

  if (serializedParams) {
    url += (url.indexOf('?') === -1 ? '?' : '&') + serializedParams;
  }

  return url;
};


/***/ }),

/***/ 18:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var utils = __webpack_require__(6);

// Headers whose duplicates are ignored by node
// c.f. https://nodejs.org/api/http.html#http_message_headers
var ignoreDuplicateOf = [
  'age', 'authorization', 'content-length', 'content-type', 'etag',
  'expires', 'from', 'host', 'if-modified-since', 'if-unmodified-since',
  'last-modified', 'location', 'max-forwards', 'proxy-authorization',
  'referer', 'retry-after', 'user-agent'
];

/**
 * Parse headers into an object
 *
 * ```
 * Date: Wed, 27 Aug 2014 08:58:49 GMT
 * Content-Type: application/json
 * Connection: keep-alive
 * Transfer-Encoding: chunked
 * ```
 *
 * @param {String} headers Headers needing to be parsed
 * @returns {Object} Headers parsed into an object
 */
module.exports = function parseHeaders(headers) {
  var parsed = {};
  var key;
  var val;
  var i;

  if (!headers) { return parsed; }

  utils.forEach(headers.split('\n'), function parser(line) {
    i = line.indexOf(':');
    key = utils.trim(line.substr(0, i)).toLowerCase();
    val = utils.trim(line.substr(i + 1));

    if (key) {
      if (parsed[key] && ignoreDuplicateOf.indexOf(key) >= 0) {
        return;
      }
      if (key === 'set-cookie') {
        parsed[key] = (parsed[key] ? parsed[key] : []).concat([val]);
      } else {
        parsed[key] = parsed[key] ? parsed[key] + ', ' + val : val;
      }
    }
  });

  return parsed;
};


/***/ }),

/***/ 19:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var utils = __webpack_require__(6);

module.exports = (
  utils.isStandardBrowserEnv() ?

  // Standard browser envs have full support of the APIs needed to test
  // whether the request URL is of the same origin as current location.
  (function standardBrowserEnv() {
    var msie = /(msie|trident)/i.test(navigator.userAgent);
    var urlParsingNode = document.createElement('a');
    var originURL;

    /**
    * Parse a URL to discover it's components
    *
    * @param {String} url The URL to be parsed
    * @returns {Object}
    */
    function resolveURL(url) {
      var href = url;

      if (msie) {
        // IE needs attribute set twice to normalize properties
        urlParsingNode.setAttribute('href', href);
        href = urlParsingNode.href;
      }

      urlParsingNode.setAttribute('href', href);

      // urlParsingNode provides the UrlUtils interface - http://url.spec.whatwg.org/#urlutils
      return {
        href: urlParsingNode.href,
        protocol: urlParsingNode.protocol ? urlParsingNode.protocol.replace(/:$/, '') : '',
        host: urlParsingNode.host,
        search: urlParsingNode.search ? urlParsingNode.search.replace(/^\?/, '') : '',
        hash: urlParsingNode.hash ? urlParsingNode.hash.replace(/^#/, '') : '',
        hostname: urlParsingNode.hostname,
        port: urlParsingNode.port,
        pathname: (urlParsingNode.pathname.charAt(0) === '/') ?
                  urlParsingNode.pathname :
                  '/' + urlParsingNode.pathname
      };
    }

    originURL = resolveURL(window.location.href);

    /**
    * Determine if a URL shares the same origin as the current location
    *
    * @param {String} requestURL The URL to test
    * @returns {boolean} True if URL shares the same origin, otherwise false
    */
    return function isURLSameOrigin(requestURL) {
      var parsed = (utils.isString(requestURL)) ? resolveURL(requestURL) : requestURL;
      return (parsed.protocol === originURL.protocol &&
            parsed.host === originURL.host);
    };
  })() :

  // Non standard browser envs (web workers, react-native) lack needed support.
  (function nonStandardBrowserEnv() {
    return function isURLSameOrigin() {
      return true;
    };
  })()
);


/***/ }),

/***/ 2:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getMonthString", function() { return getMonthString; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "storageGetAll", function() { return storageGetAll; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "storageGet", function() { return storageGet; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "storageSet", function() { return storageSet; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "storageClear", function() { return storageClear; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "BrowserType", function() { return BrowserType; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getBrowserType", function() { return getBrowserType; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getBrowserTitle", function() { return getBrowserTitle; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "PlatformClass", function() { return PlatformClass; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getPlatformClass", function() { return getPlatformClass; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isScreenRetina", function() { return isScreenRetina; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getCountryName", function() { return getCountryName; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getSafe", function() { return getSafe; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "testCall", function() { return testCall; });
/* harmony import */ var _ajax_helper__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(3);
///<reference types="web-ext-types"/>

/**********************************
  Months
 **********************************/
var months = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];
function getMonthString() {
    return months[(new Date).getMonth()];
}
/**********************************
  Storage
 **********************************/
function storageGetAll() {
    return browser.storage.local.get();
}
function storageGet(key) {
    return browser.storage.local.get(key);
}
function storageSet(keyStr, value) {
    var _a;
    return browser.storage.local.set((_a = {}, _a[keyStr] = value, _a));
}
function storageClear() {
    return browser.storage.local.clear();
}
/**********************************
  Browser and System Properties
 **********************************/
var BrowserType;
(function (BrowserType) {
    BrowserType[BrowserType["OPERA"] = 0] = "OPERA";
    BrowserType[BrowserType["FIREFOX"] = 1] = "FIREFOX";
    BrowserType[BrowserType["CHROME"] = 2] = "CHROME";
})(BrowserType || (BrowserType = {}));
function getBrowserType() {
    if (navigator.userAgent.indexOf("OPR") >= 0 || navigator.userAgent.indexOf("Opera") >= 0) {
        return BrowserType.OPERA;
    }
    else if (navigator.userAgent.indexOf("Firefox") >= 0) {
        return BrowserType.FIREFOX;
    }
    else {
        return BrowserType.CHROME;
    }
}
function getBrowserTitle() {
    var browser = getBrowserType();
    switch (browser) {
        case BrowserType.FIREFOX:
            return "Firefox";
        case BrowserType.OPERA:
            return "Opera";
        default:
            return "Chrome";
    }
}
var PlatformClass;
(function (PlatformClass) {
    PlatformClass["WINDOWS"] = "Windows";
    PlatformClass["LINUX"] = "Linux";
    PlatformClass["MAC"] = "Mac";
})(PlatformClass || (PlatformClass = {}));
function getPlatformClass() {
    if (window.navigator.platform.indexOf("Win") != -1) {
        return PlatformClass.WINDOWS;
    }
    else if (window.navigator.platform.indexOf("Linux") != -1) {
        return PlatformClass.LINUX;
    }
    return PlatformClass.MAC;
}
function isScreenRetina() {
    return window.devicePixelRatio > 1;
}
/**********************************
  Country Names
 **********************************/
function getCountryName(countryCode) {
    if (isoCountries.hasOwnProperty(countryCode)) {
        return isoCountries[countryCode];
    }
    else {
        return countryCode;
    }
}
var isoCountries = {
    'AF': 'Afghanistan',
    'AX': 'Aland Islands',
    'AL': 'Albania',
    'DZ': 'Algeria',
    'AS': 'American Samoa',
    'AD': 'Andorra',
    'AO': 'Angola',
    'AI': 'Anguilla',
    'AQ': 'Antarctica',
    'AG': 'Antigua And Barbuda',
    'AR': 'Argentina',
    'AM': 'Armenia',
    'AW': 'Aruba',
    'AU': 'Australia',
    'AT': 'Austria',
    'AZ': 'Azerbaijan',
    'BS': 'Bahamas',
    'BH': 'Bahrain',
    'BD': 'Bangladesh',
    'BB': 'Barbados',
    'BY': 'Belarus',
    'BE': 'Belgium',
    'BZ': 'Belize',
    'BJ': 'Benin',
    'BM': 'Bermuda',
    'BT': 'Bhutan',
    'BO': 'Bolivia',
    'BA': 'Bosnia And Herzegovina',
    'BW': 'Botswana',
    'BV': 'Bouvet Island',
    'BR': 'Brazil',
    'IO': 'British Indian Ocean Territory',
    'BN': 'Brunei Darussalam',
    'BG': 'Bulgaria',
    'BF': 'Burkina Faso',
    'BI': 'Burundi',
    'KH': 'Cambodia',
    'CM': 'Cameroon',
    'CA': 'Canada',
    'CV': 'Cape Verde',
    'KY': 'Cayman Islands',
    'CF': 'Central African Republic',
    'TD': 'Chad',
    'CL': 'Chile',
    'CN': 'China',
    'CX': 'Christmas Island',
    'CC': 'Cocos (Keeling) Islands',
    'CO': 'Colombia',
    'KM': 'Comoros',
    'CG': 'Congo',
    'CD': 'Congo, Democratic Republic',
    'CK': 'Cook Islands',
    'CR': 'Costa Rica',
    'CI': 'Cote D\'Ivoire',
    'HR': 'Croatia',
    'CU': 'Cuba',
    'CY': 'Cyprus',
    'CZ': 'Czech Republic',
    'DK': 'Denmark',
    'DJ': 'Djibouti',
    'DM': 'Dominica',
    'DO': 'Dominican Republic',
    'EC': 'Ecuador',
    'EG': 'Egypt',
    'SV': 'El Salvador',
    'GQ': 'Equatorial Guinea',
    'ER': 'Eritrea',
    'EE': 'Estonia',
    'ET': 'Ethiopia',
    'FK': 'Falkland Islands (Malvinas)',
    'FO': 'Faroe Islands',
    'FJ': 'Fiji',
    'FI': 'Finland',
    'FR': 'France',
    'GF': 'French Guiana',
    'PF': 'French Polynesia',
    'TF': 'French Southern Territories',
    'GA': 'Gabon',
    'GM': 'Gambia',
    'GE': 'Georgia',
    'DE': 'Germany',
    'GH': 'Ghana',
    'GI': 'Gibraltar',
    'GR': 'Greece',
    'GL': 'Greenland',
    'GD': 'Grenada',
    'GP': 'Guadeloupe',
    'GU': 'Guam',
    'GT': 'Guatemala',
    'GG': 'Guernsey',
    'GN': 'Guinea',
    'GW': 'Guinea-Bissau',
    'GY': 'Guyana',
    'HT': 'Haiti',
    'HM': 'Heard Island & Mcdonald Islands',
    'VA': 'Holy See (Vatican City State)',
    'HN': 'Honduras',
    'HK': 'Hong Kong',
    'HU': 'Hungary',
    'IS': 'Iceland',
    'IN': 'India',
    'ID': 'Indonesia',
    'IR': 'Iran, Islamic Republic Of',
    'IQ': 'Iraq',
    'IE': 'Ireland',
    'IM': 'Isle Of Man',
    'IL': 'Israel',
    'IT': 'Italy',
    'JM': 'Jamaica',
    'JP': 'Japan',
    'JE': 'Jersey',
    'JO': 'Jordan',
    'KZ': 'Kazakhstan',
    'KE': 'Kenya',
    'KI': 'Kiribati',
    'KR': 'Korea',
    'KW': 'Kuwait',
    'KG': 'Kyrgyzstan',
    'LA': 'Lao People\'s Democratic Republic',
    'LV': 'Latvia',
    'LB': 'Lebanon',
    'LS': 'Lesotho',
    'LR': 'Liberia',
    'LY': 'Libyan Arab Jamahiriya',
    'LI': 'Liechtenstein',
    'LT': 'Lithuania',
    'LU': 'Luxembourg',
    'MO': 'Macao',
    'MK': 'Macedonia',
    'MG': 'Madagascar',
    'MW': 'Malawi',
    'MY': 'Malaysia',
    'MV': 'Maldives',
    'ML': 'Mali',
    'MT': 'Malta',
    'MH': 'Marshall Islands',
    'MQ': 'Martinique',
    'MR': 'Mauritania',
    'MU': 'Mauritius',
    'YT': 'Mayotte',
    'MX': 'Mexico',
    'FM': 'Micronesia, Federated States Of',
    'MD': 'Moldova',
    'MC': 'Monaco',
    'MN': 'Mongolia',
    'ME': 'Montenegro',
    'MS': 'Montserrat',
    'MA': 'Morocco',
    'MZ': 'Mozambique',
    'MM': 'Myanmar',
    'NA': 'Namibia',
    'NR': 'Nauru',
    'NP': 'Nepal',
    'NL': 'Netherlands',
    'AN': 'Netherlands Antilles',
    'NC': 'New Caledonia',
    'NZ': 'New Zealand',
    'NI': 'Nicaragua',
    'NE': 'Niger',
    'NG': 'Nigeria',
    'NU': 'Niue',
    'NF': 'Norfolk Island',
    'MP': 'Northern Mariana Islands',
    'NO': 'Norway',
    'OM': 'Oman',
    'PK': 'Pakistan',
    'PW': 'Palau',
    'PS': 'Palestinian Territory, Occupied',
    'PA': 'Panama',
    'PG': 'Papua New Guinea',
    'PY': 'Paraguay',
    'PE': 'Peru',
    'PH': 'Philippines',
    'PN': 'Pitcairn',
    'PL': 'Poland',
    'PT': 'Portugal',
    'PR': 'Puerto Rico',
    'QA': 'Qatar',
    'RE': 'Reunion',
    'RO': 'Romania',
    'RU': 'Russian Federation',
    'RW': 'Rwanda',
    'BL': 'Saint Barthelemy',
    'SH': 'Saint Helena',
    'KN': 'Saint Kitts And Nevis',
    'LC': 'Saint Lucia',
    'MF': 'Saint Martin',
    'PM': 'Saint Pierre And Miquelon',
    'VC': 'Saint Vincent And Grenadines',
    'WS': 'Samoa',
    'SM': 'San Marino',
    'ST': 'Sao Tome And Principe',
    'SA': 'Saudi Arabia',
    'SN': 'Senegal',
    'RS': 'Serbia',
    'SC': 'Seychelles',
    'SL': 'Sierra Leone',
    'SG': 'Singapore',
    'SK': 'Slovakia',
    'SI': 'Slovenia',
    'SB': 'Solomon Islands',
    'SO': 'Somalia',
    'ZA': 'South Africa',
    'GS': 'South Georgia And Sandwich Isl.',
    'ES': 'Spain',
    'LK': 'Sri Lanka',
    'SD': 'Sudan',
    'SR': 'Suriname',
    'SJ': 'Svalbard And Jan Mayen',
    'SZ': 'Swaziland',
    'SE': 'Sweden',
    'CH': 'Switzerland',
    'SY': 'Syrian Arab Republic',
    'TW': 'Taiwan',
    'TJ': 'Tajikistan',
    'TZ': 'Tanzania',
    'TH': 'Thailand',
    'TL': 'Timor-Leste',
    'TG': 'Togo',
    'TK': 'Tokelau',
    'TO': 'Tonga',
    'TT': 'Trinidad And Tobago',
    'TN': 'Tunisia',
    'TR': 'Turkey',
    'TM': 'Turkmenistan',
    'TC': 'Turks And Caicos Islands',
    'TV': 'Tuvalu',
    'UG': 'Uganda',
    'UA': 'Ukraine',
    'AE': 'United Arab Emirates',
    'GB': 'United Kingdom',
    'US': 'United States',
    'UM': 'United States Outlying Islands',
    'UY': 'Uruguay',
    'UZ': 'Uzbekistan',
    'VU': 'Vanuatu',
    'VE': 'Venezuela',
    'VN': 'Viet Nam',
    'VG': 'Virgin Islands, British',
    'VI': 'Virgin Islands, U.S.',
    'WF': 'Wallis And Futuna',
    'EH': 'Western Sahara',
    'YE': 'Yemen',
    'ZM': 'Zambia',
    'ZW': 'Zimbabwe'
};
/**********************************
  Misc Helper Functions
 **********************************/
function getSafe(fn) {
    try {
        return fn();
    }
    catch (e) {
        return undefined;
    }
}
function testCall() {
    _ajax_helper__WEBPACK_IMPORTED_MODULE_0__["get"]({ url: "https://tunnelbear.com/core/status" });
}


/***/ }),

/***/ 20:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


// btoa polyfill for IE<10 courtesy https://github.com/davidchambers/Base64.js

var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

function E() {
  this.message = 'String contains an invalid character';
}
E.prototype = new Error;
E.prototype.code = 5;
E.prototype.name = 'InvalidCharacterError';

function btoa(input) {
  var str = String(input);
  var output = '';
  for (
    // initialize result and counter
    var block, charCode, idx = 0, map = chars;
    // if the next str index does not exist:
    //   change the mapping table to "="
    //   check if d has no fractional digits
    str.charAt(idx | 0) || (map = '=', idx % 1);
    // "8 - idx % 1 * 8" generates the sequence 2, 4, 6, 8
    output += map.charAt(63 & block >> 8 - idx % 1 * 8)
  ) {
    charCode = str.charCodeAt(idx += 3 / 4);
    if (charCode > 0xFF) {
      throw new E();
    }
    block = block << 8 | charCode;
  }
  return output;
}

module.exports = btoa;


/***/ }),

/***/ 21:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var utils = __webpack_require__(6);

module.exports = (
  utils.isStandardBrowserEnv() ?

  // Standard browser envs support document.cookie
  (function standardBrowserEnv() {
    return {
      write: function write(name, value, expires, path, domain, secure) {
        var cookie = [];
        cookie.push(name + '=' + encodeURIComponent(value));

        if (utils.isNumber(expires)) {
          cookie.push('expires=' + new Date(expires).toGMTString());
        }

        if (utils.isString(path)) {
          cookie.push('path=' + path);
        }

        if (utils.isString(domain)) {
          cookie.push('domain=' + domain);
        }

        if (secure === true) {
          cookie.push('secure');
        }

        document.cookie = cookie.join('; ');
      },

      read: function read(name) {
        var match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
        return (match ? decodeURIComponent(match[3]) : null);
      },

      remove: function remove(name) {
        this.write(name, '', Date.now() - 86400000);
      }
    };
  })() :

  // Non standard browser env (web workers, react-native) lack needed support.
  (function nonStandardBrowserEnv() {
    return {
      write: function write() {},
      read: function read() { return null; },
      remove: function remove() {}
    };
  })()
);


/***/ }),

/***/ 22:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var utils = __webpack_require__(6);

function InterceptorManager() {
  this.handlers = [];
}

/**
 * Add a new interceptor to the stack
 *
 * @param {Function} fulfilled The function to handle `then` for a `Promise`
 * @param {Function} rejected The function to handle `reject` for a `Promise`
 *
 * @return {Number} An ID used to remove interceptor later
 */
InterceptorManager.prototype.use = function use(fulfilled, rejected) {
  this.handlers.push({
    fulfilled: fulfilled,
    rejected: rejected
  });
  return this.handlers.length - 1;
};

/**
 * Remove an interceptor from the stack
 *
 * @param {Number} id The ID that was returned by `use`
 */
InterceptorManager.prototype.eject = function eject(id) {
  if (this.handlers[id]) {
    this.handlers[id] = null;
  }
};

/**
 * Iterate over all the registered interceptors
 *
 * This method is particularly useful for skipping over any
 * interceptors that may have become `null` calling `eject`.
 *
 * @param {Function} fn The function to call for each interceptor
 */
InterceptorManager.prototype.forEach = function forEach(fn) {
  utils.forEach(this.handlers, function forEachHandler(h) {
    if (h !== null) {
      fn(h);
    }
  });
};

module.exports = InterceptorManager;


/***/ }),

/***/ 23:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var utils = __webpack_require__(6);
var transformData = __webpack_require__(24);
var isCancel = __webpack_require__(25);
var defaults = __webpack_require__(10);
var isAbsoluteURL = __webpack_require__(26);
var combineURLs = __webpack_require__(27);

/**
 * Throws a `Cancel` if cancellation has been requested.
 */
function throwIfCancellationRequested(config) {
  if (config.cancelToken) {
    config.cancelToken.throwIfRequested();
  }
}

/**
 * Dispatch a request to the server using the configured adapter.
 *
 * @param {object} config The config that is to be used for the request
 * @returns {Promise} The Promise to be fulfilled
 */
module.exports = function dispatchRequest(config) {
  throwIfCancellationRequested(config);

  // Support baseURL config
  if (config.baseURL && !isAbsoluteURL(config.url)) {
    config.url = combineURLs(config.baseURL, config.url);
  }

  // Ensure headers exist
  config.headers = config.headers || {};

  // Transform request data
  config.data = transformData(
    config.data,
    config.headers,
    config.transformRequest
  );

  // Flatten headers
  config.headers = utils.merge(
    config.headers.common || {},
    config.headers[config.method] || {},
    config.headers || {}
  );

  utils.forEach(
    ['delete', 'get', 'head', 'post', 'put', 'patch', 'common'],
    function cleanHeaderConfig(method) {
      delete config.headers[method];
    }
  );

  var adapter = config.adapter || defaults.adapter;

  return adapter(config).then(function onAdapterResolution(response) {
    throwIfCancellationRequested(config);

    // Transform response data
    response.data = transformData(
      response.data,
      response.headers,
      config.transformResponse
    );

    return response;
  }, function onAdapterRejection(reason) {
    if (!isCancel(reason)) {
      throwIfCancellationRequested(config);

      // Transform response data
      if (reason && reason.response) {
        reason.response.data = transformData(
          reason.response.data,
          reason.response.headers,
          config.transformResponse
        );
      }
    }

    return Promise.reject(reason);
  });
};


/***/ }),

/***/ 24:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var utils = __webpack_require__(6);

/**
 * Transform the data for a request or a response
 *
 * @param {Object|String} data The data to be transformed
 * @param {Array} headers The headers for the request or response
 * @param {Array|Function} fns A single function or Array of functions
 * @returns {*} The resulting transformed data
 */
module.exports = function transformData(data, headers, fns) {
  /*eslint no-param-reassign:0*/
  utils.forEach(fns, function transform(fn) {
    data = fn(data, headers);
  });

  return data;
};


/***/ }),

/***/ 25:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = function isCancel(value) {
  return !!(value && value.__CANCEL__);
};


/***/ }),

/***/ 26:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/**
 * Determines whether the specified URL is absolute
 *
 * @param {string} url The URL to test
 * @returns {boolean} True if the specified URL is absolute, otherwise false
 */
module.exports = function isAbsoluteURL(url) {
  // A URL is considered absolute if it begins with "<scheme>://" or "//" (protocol-relative URL).
  // RFC 3986 defines scheme name as a sequence of characters beginning with a letter and followed
  // by any combination of letters, digits, plus, period, or hyphen.
  return /^([a-z][a-z\d\+\-\.]*:)?\/\//i.test(url);
};


/***/ }),

/***/ 27:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/**
 * Creates a new URL by combining the specified URLs
 *
 * @param {string} baseURL The base URL
 * @param {string} relativeURL The relative URL
 * @returns {string} The combined URL
 */
module.exports = function combineURLs(baseURL, relativeURL) {
  return relativeURL
    ? baseURL.replace(/\/+$/, '') + '/' + relativeURL.replace(/^\/+/, '')
    : baseURL;
};


/***/ }),

/***/ 275:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "appState", function() { return appState; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getCountry", function() { return getCountry; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getPopupState", function() { return getPopupState; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "changeAppStateCountry", function() { return changeAppStateCountry; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "toggleOff", function() { return toggleOff; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "closePopup", function() { return closePopup; });
/* harmony import */ var _common_logger__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(1);
/* harmony import */ var _common_utils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(2);
/* harmony import */ var _common_ports__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(31);
/* harmony import */ var _api__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(276);
/* harmony import */ var _proxy__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(278);
/* harmony import */ var _browser__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(279);
/* harmony import */ var _watchers__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(277);
///<reference path="../../typings/tunnelbear/index.d.ts"/>







function log(level, message) {
    _common_logger__WEBPACK_IMPORTED_MODULE_0__["log"](level, "[Background - Core] " + message);
}
var serverRotatedTime = Date.now();
var proxyTimer;
_common_ports__WEBPACK_IMPORTED_MODULE_2__["init"](true);
_common_logger__WEBPACK_IMPORTED_MODULE_0__["init"]("Background");
log(_common_logger__WEBPACK_IMPORTED_MODULE_0__["Level"].DEBUG, "App Started");
var appState = new _watchers__WEBPACK_IMPORTED_MODULE_6__["AppStateWatcher"]();
appState.addWatch("app-watcher", function (newState) {
    if (!_api__WEBPACK_IMPORTED_MODULE_3__["regResponse"].isNil()) {
        _common_ports__WEBPACK_IMPORTED_MODULE_2__["sendMessage"](_common_ports__WEBPACK_IMPORTED_MODULE_2__["PortName"].POPUP_STATE, getPopupState());
    }
});
function getCountry() {
    return appState.country;
}
function getServers() {
    if (_api__WEBPACK_IMPORTED_MODULE_3__["regResponse"].vpnServers !== undefined) {
        return _api__WEBPACK_IMPORTED_MODULE_3__["regResponse"].vpnServers.map(function (server) { return server.host; });
    }
    return [];
}
function updateProxyAll() {
    var servers = getServers();
    appState.lastServers = servers;
    if (servers.length > 0) {
        _proxy__WEBPACK_IMPORTED_MODULE_4__["proxyAll"](appState.toggled, servers);
    }
    else {
        log(_common_logger__WEBPACK_IMPORTED_MODULE_0__["Level"].WARN, "empty list of servers");
    }
}
function shouldRotate() {
    var hour = 60 * 60 * 1000;
    var interval = hour * 3;
    if ((Date.now() - serverRotatedTime) >= interval) {
        return true;
    }
    return false;
}
function getBackgroundServers() {
    var lastServers = appState.lastServers;
    var regServers = getServers();
    if (lastServers.length == 0) {
        appState.lastServers = regServers;
    }
    if (shouldRotate() === true && regServers.length > 0) {
        log(_common_logger__WEBPACK_IMPORTED_MODULE_0__["Level"].DEBUG, "--- Rotating servers ---");
        serverRotatedTime = Date.now();
        appState.lastServers = regServers;
    }
    return appState.lastServers;
}
function proxyTimerCallback() {
    var toggled = appState.toggled;
    if (toggled === true) {
        var servers = getBackgroundServers();
        if (servers.length > 0) {
            _proxy__WEBPACK_IMPORTED_MODULE_4__["proxyAll"](toggled, servers);
        }
        else {
            log(_common_logger__WEBPACK_IMPORTED_MODULE_0__["Level"].WARN, "Timer: empty list of servers");
            _api__WEBPACK_IMPORTED_MODULE_3__["register"](false, getCountry());
        }
    }
}
function startProxyTimer() {
    proxyTimer = window.setInterval(proxyTimerCallback, 3500);
}
// Promise with boolean result indicates whether or not app-state changed and should be sent to subscribers
function evalProxy() {
    return _browser__WEBPACK_IMPORTED_MODULE_5__["evalProxy"]().then(function (result) {
        if (appState.permissions.error !== result.error) {
            appState.permissions = result;
            return true;
        }
        return false;
    });
}
function apiLocation() {
    return _api__WEBPACK_IMPORTED_MODULE_3__["location"]().then(function (response) {
        log(_common_logger__WEBPACK_IMPORTED_MODULE_0__["Level"].DEBUG, "[API/Location] response: " + JSON.stringify(response));
        if (response.latitude === undefined || response.longitude === undefined) {
            return { latitude: 0, longitude: 0, city: "", countryName: "" };
        }
        else {
            var originLocation = {
                latitude: response.latitude,
                longitude: response.longitude
            };
            if (response.city && response.countryName) {
                originLocation.city = response.city;
                originLocation.countryName = response.countryName;
            }
            if (response.connected) {
                originLocation.connected = response.connected === 1;
            }
            appState.originLocation = originLocation;
            return appState.originLocation;
        }
    }).catch(function () {
        return { latitude: 0, longitude: 0, city: "", countryName: "" };
    });
}
function getLocation() {
    apiLocation().then(function (origin) {
        _common_ports__WEBPACK_IMPORTED_MODULE_2__["sendMessage"](_common_ports__WEBPACK_IMPORTED_MODULE_2__["PortName"].LOCATION, origin);
    });
}
function closeTwitter() {
    appState.canShowTwitter = false;
    _common_ports__WEBPACK_IMPORTED_MODULE_2__["sendMessage"](_common_ports__WEBPACK_IMPORTED_MODULE_2__["PortName"].POPUP_STATE, getPopupState());
    _common_utils__WEBPACK_IMPORTED_MODULE_1__["storageSet"]("twitter", Date.now());
}
function getPopupState() {
    var countries = _api__WEBPACK_IMPORTED_MODULE_3__["regResponse"].countryInfo;
    return {
        isToggled: appState.toggled,
        countries: countries,
        selectedCountry: countries.filter(function (country) { return country.code === getCountry(); })[0],
        emailConfirmed: _api__WEBPACK_IMPORTED_MODULE_3__["regResponse"].emailConfirmed,
        isFullVersion: _api__WEBPACK_IMPORTED_MODULE_3__["regResponse"].fullVersion,
        twitterPromo: _api__WEBPACK_IMPORTED_MODULE_3__["regResponse"].twitterPromo,
        twitterPromoEnabled: _api__WEBPACK_IMPORTED_MODULE_3__["regResponse"].twitterPromoEnabled,
        canShowTwitter: appState.canShowTwitter,
        dataCap: _api__WEBPACK_IMPORTED_MODULE_3__["regResponse"].dataCap,
        dataAllowed: _api__WEBPACK_IMPORTED_MODULE_3__["regResponse"].dataAllowed,
        permissionsError: appState.permissions
    };
}
function portCallback(portName, message) {
    switch (portName) {
        case _common_ports__WEBPACK_IMPORTED_MODULE_2__["PortName"].POPUP_STATE: {
            getLocation();
            _api__WEBPACK_IMPORTED_MODULE_3__["register"](false, getCountry()).then(function () {
                return evalProxy();
            }).then(function () {
                _common_ports__WEBPACK_IMPORTED_MODULE_2__["sendMessage"](_common_ports__WEBPACK_IMPORTED_MODULE_2__["PortName"].POPUP_STATE, getPopupState());
            });
            break;
        }
        case _common_ports__WEBPACK_IMPORTED_MODULE_2__["PortName"].UPGRADE: {
            _api__WEBPACK_IMPORTED_MODULE_3__["upgradeAccount"]();
            break;
        }
        case _common_ports__WEBPACK_IMPORTED_MODULE_2__["PortName"].REVIEW: {
            if (!_api__WEBPACK_IMPORTED_MODULE_3__["regResponse"].isNil()) {
                _common_ports__WEBPACK_IMPORTED_MODULE_2__["sendMessage"](_common_ports__WEBPACK_IMPORTED_MODULE_2__["PortName"].REVIEW, _api__WEBPACK_IMPORTED_MODULE_3__["regResponse"].value);
            }
            break;
        }
        case _common_ports__WEBPACK_IMPORTED_MODULE_2__["PortName"].SETTINGS: {
            switch (message) {
                case "help": {
                    _api__WEBPACK_IMPORTED_MODULE_3__["openHelp"]();
                    break;
                }
                case "account": {
                    _api__WEBPACK_IMPORTED_MODULE_3__["openAccount"]();
                    break;
                }
                case "review": {
                    _api__WEBPACK_IMPORTED_MODULE_3__["openReview"]();
                    break;
                }
                case "privacy": {
                    _api__WEBPACK_IMPORTED_MODULE_3__["openPrivacyPolicy"]();
                    break;
                }
                case "logout": {
                    _api__WEBPACK_IMPORTED_MODULE_3__["logout"]();
                    _browser__WEBPACK_IMPORTED_MODULE_5__["logout"]();
                    break;
                }
                case "extensions": {
                    _api__WEBPACK_IMPORTED_MODULE_3__["openExtensions"]();
                    break;
                }
                case "feedback": {
                    _api__WEBPACK_IMPORTED_MODULE_3__["openFeedback"]();
                    _api__WEBPACK_IMPORTED_MODULE_3__["sendFeedback"]();
                    break;
                }
                case "close-twitter": {
                    closeTwitter();
                    break;
                }
                case "tweet-now": {
                    _api__WEBPACK_IMPORTED_MODULE_3__["openAccountTweet"]();
                    break;
                }
            }
            break;
        }
    }
}
_common_ports__WEBPACK_IMPORTED_MODULE_2__["subscribeTo"](_common_ports__WEBPACK_IMPORTED_MODULE_2__["PortName"].POPUP_STATE, portCallback);
_common_ports__WEBPACK_IMPORTED_MODULE_2__["subscribeTo"](_common_ports__WEBPACK_IMPORTED_MODULE_2__["PortName"].UPGRADE, portCallback);
_common_ports__WEBPACK_IMPORTED_MODULE_2__["subscribeTo"](_common_ports__WEBPACK_IMPORTED_MODULE_2__["PortName"].REVIEW, portCallback);
_common_ports__WEBPACK_IMPORTED_MODULE_2__["subscribeTo"](_common_ports__WEBPACK_IMPORTED_MODULE_2__["PortName"].SETTINGS, portCallback);
function changeAppStateCountry(country) {
    appState.country = country;
}
function persistToggle(state) {
    log(_common_logger__WEBPACK_IMPORTED_MODULE_0__["Level"].DEBUG, "persisting state");
    _common_utils__WEBPACK_IMPORTED_MODULE_1__["storageSet"]("isToggled", state);
    _common_utils__WEBPACK_IMPORTED_MODULE_1__["storageSet"]("lastCountry", getCountry());
}
function toggleCountryParam(country) {
    _api__WEBPACK_IMPORTED_MODULE_3__["register"](false, country).then(function () {
        updateProxyAll();
        getLocation();
    });
    changeAppStateCountry(country);
    persistToggle(appState.toggled);
}
function disconnectProxy() {
    _browser__WEBPACK_IMPORTED_MODULE_5__["resetProxy"]();
}
function toggleAll() {
    log(_common_logger__WEBPACK_IMPORTED_MODULE_0__["Level"].DEBUG, "[Background - Core] toggle-all");
    appState.toggled = !appState.toggled;
    persistToggle(appState.toggled);
    updateProxyAll();
    getLocation();
    if (appState.toggled === true) {
        log(_common_logger__WEBPACK_IMPORTED_MODULE_0__["Level"].DEBUG, "[Background - Core] test call triggered");
        _common_utils__WEBPACK_IMPORTED_MODULE_1__["testCall"]();
    }
}
function toggleOff() {
    var toggled = appState.toggled;
    if (toggled === true) {
        _browser__WEBPACK_IMPORTED_MODULE_5__["toggleIcon"](false);
        toggleAll();
    }
    disconnectProxy();
}
function closePopup() {
    _common_ports__WEBPACK_IMPORTED_MODULE_2__["sendMessage"](_common_ports__WEBPACK_IMPORTED_MODULE_2__["PortName"].SETTINGS, "close");
}
_api__WEBPACK_IMPORTED_MODULE_3__["regResponse"].addWatch("reg-watcher-core", function (newValue) {
    if (newValue.dataAllowed <= 0) {
        log(_common_logger__WEBPACK_IMPORTED_MODULE_0__["Level"].DEBUG, "No data left");
    }
    if (newValue.status !== "OK") {
        var message = JSON.stringify(newValue.message);
        log(_common_logger__WEBPACK_IMPORTED_MODULE_0__["Level"].WARN, "Registration failure: " + message + " disabling proxy");
    }
});
_common_utils__WEBPACK_IMPORTED_MODULE_1__["storageGet"](["lastCountry", "twitter"]).then(function (result) {
    // lastCountry
    var country = result.lastCountry;
    var toggled = appState.toggled;
    log(_common_logger__WEBPACK_IMPORTED_MODULE_0__["Level"].DEBUG, "lastCountry loaded is " + country);
    if (country !== undefined) {
        if (toggled === true) {
            toggleCountryParam(country);
        }
        else {
            appState.country = country;
        }
    }
    // twitter
    var twitterLastTime = result.twitter;
    if (twitterLastTime !== undefined) {
        var currentDate = Date.now();
        var diff = currentDate - twitterLastTime;
        var diffSeconds = diff / 1000;
        var twoDaysSeconds = 48 * 60 * 60;
        if (twoDaysSeconds > diffSeconds) {
            appState.canShowTwitter = false;
        }
    }
}).then(function () {
    return _api__WEBPACK_IMPORTED_MODULE_3__["registerIgnoreErrors"](getCountry());
}).then(function () {
    _browser__WEBPACK_IMPORTED_MODULE_5__["registerListeners"](toggleAll, toggleCountryParam, disconnectProxy);
}).catch(function () {
    _browser__WEBPACK_IMPORTED_MODULE_5__["registerListeners"](toggleAll, toggleCountryParam, disconnectProxy);
}).then(startProxyTimer);


/***/ }),

/***/ 276:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "TBEAR_UNINSTALL_URL", function() { return TBEAR_UNINSTALL_URL; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "regResponse", function() { return regResponse; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "outOfData", function() { return outOfData; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "lowAccount", function() { return lowAccount; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "upgradeAccount", function() { return upgradeAccount; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "openHelp", function() { return openHelp; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "openAccount", function() { return openAccount; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "openFeedback", function() { return openFeedback; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "openReview", function() { return openReview; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "openExtensions", function() { return openExtensions; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "openPrivacyPolicy", function() { return openPrivacyPolicy; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "openTwitter", function() { return openTwitter; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "openAccountTweet", function() { return openAccountTweet; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "logout", function() { return logout; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "registerIgnoreErrors", function() { return registerIgnoreErrors; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "register", function() { return register; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "location", function() { return location; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "sendFeedback", function() { return sendFeedback; });
/* harmony import */ var _common_logger__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(1);
/* harmony import */ var _common_utils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(2);
/* harmony import */ var _common_ajax_helper__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(3);
/* harmony import */ var _common_ports__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(31);
/* harmony import */ var _core__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(275);
/* harmony import */ var _watchers__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(277);






function log(level, message) {
    _common_logger__WEBPACK_IMPORTED_MODULE_0__["log"](level, "[API] " + message);
}
var TBEAR_BASE_API_URL = "https://api.tunnelbear.com";
var TBEAR_BASE_URL = "https://www.tunnelbear.com";
var TBEAR_HELP_URL = "https://help.tunnelbear.com";
var TBEAR_UNINSTALL_URL = TBEAR_BASE_URL + "/account#/feedback";
var versionString = (function () {
    var prefix = (_common_utils__WEBPACK_IMPORTED_MODULE_1__["getBrowserType"]() === _common_utils__WEBPACK_IMPORTED_MODULE_1__["BrowserType"].FIREFOX) ? "f" :
        (_common_utils__WEBPACK_IMPORTED_MODULE_1__["getBrowserType"]() === _common_utils__WEBPACK_IMPORTED_MODULE_1__["BrowserType"].CHROME) ? "c" : "o";
    var number = browser.runtime.getManifest().version;
    return prefix + number;
})();
function uuid() {
    var nums = function (len) { return Array(len).fill(16).map(function (n) { return Math.floor((Math.random() * n)); }); };
    return nums(8).concat(["-"])
        .concat(nums(4)).concat(["-4"])
        .concat(nums(3)).concat(["-"])
        .concat([(0x8 | (0x3 & Math.floor(Math.random() * 16)))])
        .concat(nums(3)).concat(["-"])
        .concat(nums(12))
        .map(function (element) { return String(element); })
        .join("");
}
var deviceId = "";
var regResponse = new _watchers__WEBPACK_IMPORTED_MODULE_5__["RegResponseWatcher"]();
regResponse.addWatch("reg-watcher-api", function () {
    _common_ports__WEBPACK_IMPORTED_MODULE_3__["sendMessage"](_common_ports__WEBPACK_IMPORTED_MODULE_3__["PortName"].POPUP_STATE, _core__WEBPACK_IMPORTED_MODULE_4__["getPopupState"]());
});
function persistResponse(response) {
    log(_common_logger__WEBPACK_IMPORTED_MODULE_0__["Level"].DEBUG, response.status + " " + JSON.stringify(response.message));
    regResponse.value = response;
    return response;
}
function outOfData() {
    browser.tabs.create({ url: TBEAR_BASE_URL + "/account#/upgrade?notice=no_data&v=" + versionString });
}
function lowAccount() {
    if (regResponse.emailConfirmed === true) {
        browser.tabs.create({ url: TBEAR_BASE_URL + "/account#/upgrade?notice=low_data&v=" + versionString });
    }
    else {
        browser.tabs.create({ url: TBEAR_BASE_URL + "/account#/upgrade?notice=confirm_email&v=" + versionString });
    }
}
function upgradeAccount() {
    if (regResponse.emailConfirmed === true) {
        browser.tabs.create({ url: TBEAR_BASE_URL + "/account#/upgrade?v=" + versionString });
    }
    else {
        browser.tabs.create({ url: TBEAR_BASE_URL + "/account#/upgrade?notice=confirm_email&v=" + versionString });
    }
}
function openHelp() {
    browser.tabs.create({ url: TBEAR_HELP_URL });
}
function openAccount() {
    browser.tabs.create({ url: TBEAR_BASE_URL + "/account#/overview" });
}
function openFeedback() {
    browser.tabs.create({ url: TBEAR_BASE_URL + "/support/contact.html" });
}
function openReview() {
    if (_common_utils__WEBPACK_IMPORTED_MODULE_1__["getBrowserType"]() === _common_utils__WEBPACK_IMPORTED_MODULE_1__["BrowserType"].OPERA) {
        browser.tabs.create({ url: "https://addons.opera.com/extensions/details/tunnelbear/" });
    }
    else if (_common_utils__WEBPACK_IMPORTED_MODULE_1__["getBrowserType"]() === _common_utils__WEBPACK_IMPORTED_MODULE_1__["BrowserType"].CHROME) {
        browser.tabs.create({ url: "https://chrome.google.com/webstore/detail/tunnelbear/" + browser.runtime.id + "/reviews" });
    }
    else {
        browser.tabs.create({ url: "https://addons.mozilla.org/en-US/firefox/addon/" + "tunnelbear-vpn-firefox" });
    }
}
function openExtensions() {
    if (_common_utils__WEBPACK_IMPORTED_MODULE_1__["getBrowserType"]() === _common_utils__WEBPACK_IMPORTED_MODULE_1__["BrowserType"].CHROME) {
        browser.tabs.create({ url: "chrome://extensions/?id=" + browser.runtime.id });
    }
    else if (_common_utils__WEBPACK_IMPORTED_MODULE_1__["getBrowserType"]() === _common_utils__WEBPACK_IMPORTED_MODULE_1__["BrowserType"].OPERA) {
        browser.tabs.create({ url: "opera://extensions" });
    }
    else {
        browser.tabs.create({ url: "about:addons" });
    }
}
function openPrivacyPolicy() {
    browser.tabs.create({ url: TBEAR_BASE_URL + "/privacy-policy" });
}
function openTwitter() {
    var tweet = regResponse.templateTweet;
    browser.tabs.update(undefined, { url: "https://twitter.com/intent/tweet?text=" + tweet });
}
function openAccountTweet() {
    browser.tabs.create({ url: TBEAR_BASE_URL + "/account#/twitter" });
}
function logout() {
    regResponse.resetDefaultValue();
    _common_utils__WEBPACK_IMPORTED_MODULE_1__["storageClear"]();
    browser.tabs.create({ url: TBEAR_BASE_URL + "/account#/login?v=" + versionString });
}
function registerErrorHandler(error) {
    if (error.response !== undefined) {
        var status_1 = error.response.status;
        var statusText = error.response.statusText;
        log(_common_logger__WEBPACK_IMPORTED_MODULE_0__["Level"].WARN, "Register Error: " + status_1 + " " + statusText);
        if (status_1 === 403) {
            _core__WEBPACK_IMPORTED_MODULE_4__["toggleOff"]();
            _core__WEBPACK_IMPORTED_MODULE_4__["closePopup"]();
            browser.tabs.create({ url: TBEAR_BASE_URL + "/account#/signup?v=" + versionString });
        }
    }
    else {
        log(_common_logger__WEBPACK_IMPORTED_MODULE_0__["Level"].WARN, "Register error: unable to reach server");
    }
}
function registerIgnoreErrors(country) {
    log(_common_logger__WEBPACK_IMPORTED_MODULE_0__["Level"].DEBUG, "register ignoring errors " + country + " " + deviceId);
    return _common_ajax_helper__WEBPACK_IMPORTED_MODULE_2__["post"]({
        url: TBEAR_BASE_API_URL + "/core/register",
        params: {
            "json": "1",
            "v": versionString,
            "country": country,
            "deviceId": deviceId,
            "getToken": false
        }
    }).then(function (response) {
        return persistResponse(response.data);
    });
}
function register(getToken, country) {
    log(_common_logger__WEBPACK_IMPORTED_MODULE_0__["Level"].DEBUG, "register params " + versionString + " " + country + " " + deviceId);
    return _common_ajax_helper__WEBPACK_IMPORTED_MODULE_2__["post"]({
        url: TBEAR_BASE_API_URL + "/core/register",
        params: {
            "json": "1",
            "v": versionString,
            "country": country,
            "deviceId": deviceId,
            "getToken": getToken
        }
    }).then(function (response) {
        return persistResponse(response.data);
    }).catch(function (error) {
        registerErrorHandler(error);
        throw error;
    });
}
function location() {
    return new Promise(function (resolve, reject) {
        // Give the proxy some time to change
        setTimeout(function () {
            _common_ajax_helper__WEBPACK_IMPORTED_MODULE_2__["get"]({
                url: TBEAR_BASE_API_URL + "/core/bearsmyip/location",
                timeout: 3000
            }).then(function (response) {
                resolve(response.data);
            }).catch(function (error) {
                reject(error);
            });
        }, 200);
    });
}
function sendFeedback() {
    _common_logger__WEBPACK_IMPORTED_MODULE_0__["getLogs"]().then(function (background) {
        var formData = new FormData();
        formData.append("v", versionString);
        formData.append("feedback", "");
        formData.append("data", background);
        _common_ajax_helper__WEBPACK_IMPORTED_MODULE_2__["post"]({
            url: TBEAR_BASE_API_URL + "/core/api/uploadLogsText",
            data: formData,
            timeout: 2000
        });
    });
}
_common_utils__WEBPACK_IMPORTED_MODULE_1__["storageGet"]("deviceId").then(function (result) {
    var storedDeviceId = result.deviceId;
    if (storedDeviceId !== undefined) {
        deviceId = storedDeviceId;
    }
    else {
        deviceId = uuid();
        _common_utils__WEBPACK_IMPORTED_MODULE_1__["storageSet"]("deviceId", deviceId);
    }
});


/***/ }),

/***/ 277:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "RegResponseWatcher", function() { return RegResponseWatcher; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "AppStateWatcher", function() { return AppStateWatcher; });
///<reference path="../../typings/tunnelbear/index.d.ts"/>
var __extends = (undefined && undefined.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var ValueWatcher = /** @class */ (function () {
    function ValueWatcher(initialValue) {
        this.watchFunctions = new Map();
        this.internalValue = initialValue;
    }
    ValueWatcher.prototype.addWatch = function (name, watcher) {
        this.watchFunctions.set(name, watcher);
    };
    ValueWatcher.prototype.triggerWatch = function () {
        var _this = this;
        this.watchFunctions.forEach(function (func) { return func(_this.internalValue); });
    };
    Object.defineProperty(ValueWatcher.prototype, "value", {
        get: function () {
            return this.internalValue;
        },
        set: function (newValue) {
            this.internalValue = newValue;
            if (newValue !== undefined) {
                this.triggerWatch();
            }
        },
        enumerable: true,
        configurable: true
    });
    return ValueWatcher;
}());
var defaultRegReponse = {
    emailConfirmed: "1",
    fullVersion: "1",
    templateTweet: "",
    dataCap: "3000000000000",
    dataAllowed: "3000000000000",
    vpnServers: [],
    countryInfo: [{ code: 0, iso: "US", lat: 37, lon: -95.7, enabled: true, paidOnly: false }],
    twitterPromo: "1",
    twitterPromoEnabled: false,
    status: "OK",
    message: ""
};
var RegResponseWatcher = /** @class */ (function (_super) {
    __extends(RegResponseWatcher, _super);
    function RegResponseWatcher() {
        return _super.call(this, defaultRegReponse) || this;
    }
    RegResponseWatcher.prototype.isNil = function () {
        return this.internalValue === undefined;
    };
    RegResponseWatcher.prototype.resetDefaultValue = function () {
        this.internalValue = defaultRegReponse;
    };
    Object.defineProperty(RegResponseWatcher.prototype, "emailConfirmed", {
        // Getters
        get: function () {
            return this.internalValue.emailConfirmed === "1";
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RegResponseWatcher.prototype, "fullVersion", {
        get: function () {
            return this.internalValue.fullVersion === "1";
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RegResponseWatcher.prototype, "templateTweet", {
        get: function () {
            return this.internalValue.templateTweet;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RegResponseWatcher.prototype, "dataCap", {
        get: function () {
            return Number(this.internalValue.dataCap);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RegResponseWatcher.prototype, "dataAllowed", {
        get: function () {
            return Number(this.internalValue.dataAllowed);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RegResponseWatcher.prototype, "vpnServers", {
        get: function () {
            return this.internalValue.vpnServers;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RegResponseWatcher.prototype, "countryInfo", {
        get: function () {
            return this.internalValue.countryInfo;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RegResponseWatcher.prototype, "twitterPromo", {
        get: function () {
            return this.internalValue.twitterPromo === "1";
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RegResponseWatcher.prototype, "twitterPromoEnabled", {
        get: function () {
            return this.internalValue.twitterPromoEnabled;
        },
        enumerable: true,
        configurable: true
    });
    return RegResponseWatcher;
}(ValueWatcher));

var AppStateWatcher = /** @class */ (function (_super) {
    __extends(AppStateWatcher, _super);
    function AppStateWatcher() {
        return _super.call(this, {
            country: 0,
            permissions: { error: false, details: "" },
            originLocation: { latitude: 0, longitude: 0, city: "", countryName: "" },
            lastServers: [],
            toggled: false,
            canShowTwitter: true
        }) || this;
    }
    Object.defineProperty(AppStateWatcher.prototype, "country", {
        // Getters
        get: function () {
            return this.internalValue.country;
        },
        // Setters
        set: function (country) {
            this.internalValue.country = country;
            this.triggerWatch();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AppStateWatcher.prototype, "permissions", {
        get: function () {
            return this.internalValue.permissions;
        },
        set: function (permissions) {
            this.internalValue.permissions = permissions;
            this.triggerWatch();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AppStateWatcher.prototype, "originLocation", {
        get: function () {
            return this.internalValue.originLocation;
        },
        set: function (location) {
            this.internalValue.originLocation = location;
            this.triggerWatch();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AppStateWatcher.prototype, "lastServers", {
        get: function () {
            return this.internalValue.lastServers;
        },
        set: function (servers) {
            this.internalValue.lastServers = servers;
            this.triggerWatch();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AppStateWatcher.prototype, "toggled", {
        get: function () {
            return this.internalValue.toggled;
        },
        set: function (toggled) {
            this.internalValue.toggled = toggled;
            this.triggerWatch();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AppStateWatcher.prototype, "canShowTwitter", {
        get: function () {
            return this.internalValue.canShowTwitter;
        },
        set: function (canShowTwitter) {
            this.internalValue.canShowTwitter = canShowTwitter;
            this.triggerWatch();
        },
        enumerable: true,
        configurable: true
    });
    return AppStateWatcher;
}(ValueWatcher));



/***/ }),

/***/ 278:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "proxyAll", function() { return proxyAll; });
/* harmony import */ var _common_logger__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(1);
/* harmony import */ var _browser__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(279);


var lastServers = [];
function log(level, message) {
    _common_logger__WEBPACK_IMPORTED_MODULE_0__["log"](level, "[Proxy] " + message);
}
function shouldReset(servers) {
    return servers.map(function (server) { return lastServers.indexOf(server) >= 0; }).indexOf(false) >= 0;
}
function proxyAll(enabled, servers) {
    if (enabled) {
        log(_common_logger__WEBPACK_IMPORTED_MODULE_0__["Level"].DEBUG, "[Background - Proxy] : Enabling");
        if (browser.privacy.network.webRTCMultipleRoutesEnabled !== undefined) {
            browser.privacy.network.webRTCMultipleRoutesEnabled.set({ value: false });
        }
        if (browser.privacy.network.webRTCNonProxiedUdpEnabled !== undefined) {
            browser.privacy.network.webRTCNonProxiedUdpEnabled.set({ value: false });
        }
        if (browser.privacy.network.webRTCIPHandlingPolicy !== undefined) {
            browser.privacy.network.webRTCIPHandlingPolicy.set({ value: "disable_non_proxied_udp" });
        }
        if (browser.privacy.network.networkPredictionEnabled !== undefined) {
            browser.privacy.network.networkPredictionEnabled.set({ value: false });
        }
    }
    else {
        log(_common_logger__WEBPACK_IMPORTED_MODULE_0__["Level"].INFO, "[Background - Proxy] : Disabling");
        if (browser.privacy.network.webRTCMultipleRoutesEnabled !== undefined) {
            browser.privacy.network.webRTCMultipleRoutesEnabled.set({ value: true });
        }
        if (browser.privacy.network.webRTCNonProxiedUdpEnabled !== undefined) {
            browser.privacy.network.webRTCNonProxiedUdpEnabled.set({ value: true });
        }
        if (browser.privacy.network.webRTCIPHandlingPolicy !== undefined) {
            browser.privacy.network.webRTCIPHandlingPolicy.set({ value: "default" });
        }
        if (browser.privacy.network.networkPredictionEnabled !== undefined) {
            browser.privacy.network.networkPredictionEnabled.set({ value: true });
        }
    }
    if (shouldReset(servers)) {
        lastServers = servers;
    }
    _browser__WEBPACK_IMPORTED_MODULE_1__["setProxy"](enabled, lastServers);
}
browser.proxy.onProxyError.addListener(function (error) {
    log(_common_logger__WEBPACK_IMPORTED_MODULE_0__["Level"].WARN, "proxy error" + JSON.stringify(lastServers));
    log(_common_logger__WEBPACK_IMPORTED_MODULE_0__["Level"].WARN, JSON.stringify(error));
});


/***/ }),

/***/ 279:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "toggleIcon", function() { return toggleIcon; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "logout", function() { return logout; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "registerListeners", function() { return registerListeners; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "resetProxy", function() { return resetProxy; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "setProxy", function() { return setProxy; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "evalProxy", function() { return evalProxy; });
/* harmony import */ var _common_logger__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(1);
/* harmony import */ var _common_utils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(2);
/* harmony import */ var _api__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(276);
/* harmony import */ var _core__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(275);
/* harmony import */ var _common_ports__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(31);
/* harmony import */ var _token_manager__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(280);
///<reference types="chrome"/>






var ICON_OFF_SRC = __webpack_require__(281);
var ICON_OFF_SRC_2X = __webpack_require__(282);
var ICON_ON_SRC = __webpack_require__(283);
var ICON_ON_SRC_2X = __webpack_require__(284);
function log(level, message) {
    _common_logger__WEBPACK_IMPORTED_MODULE_0__["log"](level, "[BROWSER] " + message);
}
var tokenManager = new _token_manager__WEBPACK_IMPORTED_MODULE_5__["default"]();
var lastDataAllowed = 0;
var LOW_DATA_CAP = 100;
var canWarnLowData = false;
var toggleOffBackground = function () { };
var lastErrorRegister = 0;
var pendingRequests = new Set();
function proxiesString(servers) {
    return servers.map(function (server) { return "HTTPS " + server + ":8080;"; }).join(" ");
}
var DIRECT = { type: "direct" };
var FirefoxFunctions = /** @class */ (function () {
    function FirefoxFunctions() {
    }
    FirefoxFunctions.prototype.makeProxyRequestListener = function () {
        var _this = this;
        return function (details) {
            var url = new URL(details.url);
            if (url.hostname === "localhost" || url.hostname === "127.0.0.1") {
                return DIRECT;
            }
            if (url.protocol === "https:" && url.hostname === "api.tunnelbear.com") {
                return DIRECT;
            }
            return _core__WEBPACK_IMPORTED_MODULE_3__["appState"].toggled ? _this.proxyInfo : DIRECT;
        };
    };
    FirefoxFunctions.prototype.browserResetProxy = function () {
        if (this.proxyRequestListener !== undefined) {
            browser.proxy.onRequest.removeListener(this.proxyRequestListener);
            this.proxyRequestListener = undefined;
        }
    };
    FirefoxFunctions.prototype.browserSetProxy = function (isEnabled, servers) {
        if (this.proxyRequestListener === undefined) {
            this.proxyRequestListener = this.makeProxyRequestListener();
            browser.proxy.onRequest.addListener(this.proxyRequestListener, { urls: ["<all_urls>"] });
        }
        this.proxyInfo = servers.map(function (server) { return { type: "https", host: server, port: "8080" }; });
    };
    FirefoxFunctions.prototype.browserEvalProxy = function () {
        // Firefox doesn't seem to have a way to check if we are the only extension controlling the proxy
        return Promise.resolve({ error: false, details: "" });
    };
    FirefoxFunctions.prototype.browserRegisterOnAuthListener = function () {
        browser.webRequest.onAuthRequired.addListener(function (details) {
            log(_common_logger__WEBPACK_IMPORTED_MODULE_0__["Level"].DEBUG, "---- onAuthRequired ---");
            var proxyInfo = details.proxyInfo;
            var tabId = details.tabId;
            var requestId = details.requestId;
            if (proxyInfo !== undefined) {
                var proxy = proxyInfo.host;
                if (pendingRequests.has(requestId)) {
                    log(_common_logger__WEBPACK_IMPORTED_MODULE_0__["Level"].WARN, "Bad credentials for request: " + requestId);
                    return { cancel: true };
                }
                else if (proxy.indexOf("lazerpenguin.com") > 0) {
                    pendingRequests.add(requestId);
                    return tokenManager.getToken(proxy).then(function (token) {
                        return { authCredentials: { username: token, password: token } };
                    }).catch(function (error) {
                        handleTokenError(tabId, error);
                        return { cancel: true };
                    });
                }
            }
        }, { urls: ["<all_urls>"] }, ["blocking"]);
    };
    return FirefoxFunctions;
}());
var ChromeFunctions = /** @class */ (function () {
    function ChromeFunctions() {
    }
    ChromeFunctions.prototype.browserResetProxy = function () {
        chrome.proxy.settings.set({
            value: { mode: "direct" },
            scope: "regular"
        }, function (details) { return log(_common_logger__WEBPACK_IMPORTED_MODULE_0__["Level"].DEBUG, JSON.stringify(details)); });
    };
    ChromeFunctions.prototype.browserSetProxy = function (isEnabled, servers) {
        var proxies = proxiesString(servers);
        var pacString = "\n    var pac_date = " + Date.now() + ";\n    \n    function FindProxyForURL(url, host) {\n    var diff = new Date().getTime() - pac_date;\n    var seconds = diff / 1000;\n    if(seconds > 4) {\n      return 'DIRECT';\n    }\n    if (shExpMatch(url, 'https://api.tunnelbear.com/*')) {\n      return 'DIRECT';\n    }\n    if (shExpMatch(host, 'localhost')) {\n      return 'DIRECT';\n    }\n    if (shExpMatch(host, '127.0.0.1')){\n      return 'DIRECT';\n    }\n    return '" + (isEnabled ? proxies : "DIRECT") + "';\n    }";
        chrome.proxy.settings.set({
            value: { mode: "pac_script", pacScript: { data: pacString } },
            scope: "regular"
        }, function () { });
    };
    ChromeFunctions.prototype.browserEvalProxy = function () {
        return new Promise(function (resolve) {
            return chrome.proxy.settings.get({ incognito: false }, function (details) {
                var levelOfControl = details.levelOfControl;
                var hasPermissions = !(levelOfControl === "controlled_by_other_extensions" || levelOfControl === "not_controllable");
                if (hasPermissions) {
                    return resolve({ error: false, details: "" });
                }
                else {
                    chrome.management.getAll(function (apps) {
                        var appId = chrome.runtime.id;
                        var culprits = apps.filter(function (app) { return app.permissions.indexOf("proxy") >= 0; });
                        var culprit = culprits.filter(function (app) { return app.id !== appId; })[0];
                        var icon16 = (culprit.icons !== undefined && culprit.icons.length > 0) ? culprit.icons[0] : {};
                        var icon32 = (culprit.icons !== undefined && culprit.icons.length > 1) ? culprit.icons[1] : icon16;
                        var icon = _common_utils__WEBPACK_IMPORTED_MODULE_1__["isScreenRetina"]() ? icon32 : icon16;
                        log(_common_logger__WEBPACK_IMPORTED_MODULE_0__["Level"].DEBUG, JSON.stringify(culprit));
                        resolve({ error: true, details: culprit.shortName, icon: icon });
                    });
                }
            });
        });
    };
    ChromeFunctions.prototype.browserRegisterOnAuthListener = function () {
        chrome.webRequest.onAuthRequired.addListener(function (details, callback) {
            log(_common_logger__WEBPACK_IMPORTED_MODULE_0__["Level"].DEBUG, "---- onAuthRequired ---");
            var proxy = details.challenger.host;
            var tabId = details.tabId;
            log(_common_logger__WEBPACK_IMPORTED_MODULE_0__["Level"].INFO, "onAuthRequired for proxy: " + proxy);
            if (proxy.indexOf("lazerpenguin.com") > 0) {
                tokenManager.getToken(proxy).then(function (token) {
                    if (callback !== undefined) {
                        callback({ authCredentials: { username: token, password: token } });
                    }
                }).catch(function (error) {
                    handleTokenError(tabId, error);
                    if (callback !== undefined) {
                        callback({ cancel: true });
                    }
                });
            }
            else {
                if (callback !== undefined) {
                    callback({});
                }
            }
        }, { urls: ["<all_urls>"] }, ["asyncBlocking"]);
    };
    return ChromeFunctions;
}());
var whichBrowser = (_common_utils__WEBPACK_IMPORTED_MODULE_1__["getBrowserType"]() === _common_utils__WEBPACK_IMPORTED_MODULE_1__["BrowserType"].CHROME ||
    _common_utils__WEBPACK_IMPORTED_MODULE_1__["getBrowserType"]() === _common_utils__WEBPACK_IMPORTED_MODULE_1__["BrowserType"].OPERA) ? new ChromeFunctions() : new FirefoxFunctions();
function handleTokenError(tabId, error) {
    if (0 < tabId && error === "No data left") {
        log(_common_logger__WEBPACK_IMPORTED_MODULE_0__["Level"].INFO, "No data -disconnecting");
        toggleOffBackground();
    }
}
var IconType;
(function (IconType) {
    IconType[IconType["NONE"] = 0] = "NONE";
    IconType[IconType["OFF"] = 1] = "OFF";
    IconType[IconType["WARN"] = 2] = "WARN";
    IconType[IconType["ALERT"] = 3] = "ALERT";
})(IconType || (IconType = {}));
function toggleIcon(isToggled) {
    if (isToggled) {
        browser.browserAction.setIcon({ path: { 19: ICON_ON_SRC, 38: ICON_ON_SRC_2X } });
    }
    else {
        browser.browserAction.setIcon({ path: { 19: ICON_OFF_SRC, 38: ICON_OFF_SRC_2X } });
    }
}
function setExtensionBadge(text, type) {
    log(_common_logger__WEBPACK_IMPORTED_MODULE_0__["Level"].INFO, "Setting extension badge " + text);
    browser.browserAction.setBadgeText({ text: text });
    switch (type) {
        case IconType.NONE: {
            log(_common_logger__WEBPACK_IMPORTED_MODULE_0__["Level"].DEBUG, "setting extension badge to nothing");
            break;
        }
        case IconType.OFF: {
            browser.browserAction.setBadgeBackgroundColor({ color: "#7d6549" });
            break;
        }
        case IconType.WARN: {
            browser.browserAction.setBadgeBackgroundColor({ color: "#e48b2d" });
            break;
        }
        case IconType.ALERT: {
            browser.browserAction.setBadgeBackgroundColor({ color: "#d64a2f" });
            break;
        }
    }
}
function setDataLevel(dataAllowed, isToggled) {
    if (dataAllowed === undefined) {
        setExtensionBadge("", IconType.NONE);
        return;
    }
    // The badge is not scaled correctly in Opera MacOS, so don't show the badges
    var isOpera = _common_utils__WEBPACK_IMPORTED_MODULE_1__["getBrowserType"]() === _common_utils__WEBPACK_IMPORTED_MODULE_1__["BrowserType"].OPERA;
    var isMac = _common_utils__WEBPACK_IMPORTED_MODULE_1__["getPlatformClass"]() === _common_utils__WEBPACK_IMPORTED_MODULE_1__["PlatformClass"].MAC;
    if (isOpera && isMac) {
        setExtensionBadge("", IconType.NONE);
        return;
    }
    if ((dataAllowed / 1048576 < LOW_DATA_CAP) && (dataAllowed > 0)) {
        log(_common_logger__WEBPACK_IMPORTED_MODULE_0__["Level"].INFO, "Low Data : Can warn user? " + canWarnLowData);
        if (canWarnLowData && isToggled) {
            canWarnLowData = false;
            _api__WEBPACK_IMPORTED_MODULE_2__["lowAccount"]();
        }
        setExtensionBadge("Low", IconType.WARN);
    }
    if (dataAllowed <= 0) {
        log(_common_logger__WEBPACK_IMPORTED_MODULE_0__["Level"].INFO, "No more Data");
        setExtensionBadge("0mb", IconType.ALERT);
        toggleOffBackground();
    }
    if (dataAllowed / 1048576 > LOW_DATA_CAP) {
        canWarnLowData = true;
        if (isToggled) {
            setExtensionBadge("", IconType.NONE);
        }
        else {
            setExtensionBadge("Off", IconType.OFF);
        }
    }
}
function adjustTimer(interval) {
    log(_common_logger__WEBPACK_IMPORTED_MODULE_0__["Level"].DEBUG, "adjusting timer to: " + interval);
    clearInterval(registerTimer);
    registerTimer = window.setInterval(register, interval);
}
function evaluateTimer(newDataAllowed) {
    var newData = newDataAllowed / 1048576;
    var diffDataUsage = lastDataAllowed - newData;
    if (diffDataUsage > 0) {
        log(_common_logger__WEBPACK_IMPORTED_MODULE_0__["Level"].DEBUG, "[DATA] usage since last time: " + diffDataUsage);
        if (diffDataUsage < 1) {
            adjustTimer(60000);
        }
        else if (diffDataUsage < 5) {
            adjustTimer(50000);
        }
        else if (diffDataUsage < 10) {
            adjustTimer(40000);
        }
        else if (diffDataUsage < 15) {
            adjustTimer(35000);
        }
        else if (diffDataUsage < 20) {
            adjustTimer(30000);
        }
        else {
            adjustTimer(25000);
        }
    }
    lastDataAllowed = newDataAllowed;
}
function logout() {
    tokenManager.logout();
}
function register() {
    if (_core__WEBPACK_IMPORTED_MODULE_3__["appState"].toggled === true) {
        log(_common_logger__WEBPACK_IMPORTED_MODULE_0__["Level"].DEBUG, "TIMER registering");
        _api__WEBPACK_IMPORTED_MODULE_2__["registerIgnoreErrors"](_core__WEBPACK_IMPORTED_MODULE_3__["getCountry"]());
    }
}
function registerListeners(toggleAllCallback, changeCountryCallback, disconnectProxyCallback) {
    log(_common_logger__WEBPACK_IMPORTED_MODULE_0__["Level"].INFO, "AppStart - Registering listeners");
    function toggleAll() {
        var isToggled = !_core__WEBPACK_IMPORTED_MODULE_3__["appState"].toggled;
        var dataAllowed = _api__WEBPACK_IMPORTED_MODULE_2__["regResponse"].dataAllowed;
        setDataLevel(dataAllowed, isToggled);
        toggleIcon(isToggled);
        toggleAllCallback();
    }
    function incognitoTunnelling() {
        browser.extension.isAllowedIncognitoAccess().then(function (isAllowed) {
            if (isAllowed) {
                var toggled = _core__WEBPACK_IMPORTED_MODULE_3__["appState"].toggled;
                if (toggled === false && !_api__WEBPACK_IMPORTED_MODULE_2__["regResponse"].isNil()) {
                    toggleAll();
                }
                browser.windows.create({ url: "https://bearsmyip.com", incognito: true });
            }
            else {
                _api__WEBPACK_IMPORTED_MODULE_2__["openExtensions"]();
            }
        });
    }
    function toggleOff() {
        log(_common_logger__WEBPACK_IMPORTED_MODULE_0__["Level"].DEBUG, "calling toggle-off");
        var isToggled = _core__WEBPACK_IMPORTED_MODULE_3__["appState"].toggled;
        if (isToggled) {
            log(_common_logger__WEBPACK_IMPORTED_MODULE_0__["Level"].INFO, "Toggling off");
            toggleIcon(false);
            toggleAllCallback();
            disconnectProxyCallback();
            _api__WEBPACK_IMPORTED_MODULE_2__["outOfData"]();
        }
        else {
            log(_common_logger__WEBPACK_IMPORTED_MODULE_0__["Level"].INFO, "Already toggled-off");
        }
    }
    toggleOffBackground = toggleOff;
    browser.commands.onCommand.addListener(function (command) {
        log(_common_logger__WEBPACK_IMPORTED_MODULE_0__["Level"].DEBUG, "Command: " + command);
        if (command === "toggle-tunnelling") {
            toggleAll();
        }
        else if (command === "incognito-tunnelling") {
            incognitoTunnelling();
        }
        else if (command === "send-feedback") {
            _api__WEBPACK_IMPORTED_MODULE_2__["sendFeedback"]();
        }
    });
    function firstInstall(handler) {
        _common_utils__WEBPACK_IMPORTED_MODULE_1__["storageGet"]("installed").then(function (result) {
            var installed = (result !== undefined) && (result.installed === true);
            handler(installed);
        });
    }
    browser.runtime.onInstalled.addListener(function () {
        log(_common_logger__WEBPACK_IMPORTED_MODULE_0__["Level"].INFO, "app installed");
        firstInstall(function (installed) {
            if (!installed) {
                _common_utils__WEBPACK_IMPORTED_MODULE_1__["storageSet"]("installed", Date.now());
            }
        });
        _common_utils__WEBPACK_IMPORTED_MODULE_1__["storageGet"]("isToggled").then(function (result) {
            var toggled = result.isToggled;
            if (toggled === undefined) {
                // Only auto-launch if it's the first time intalled
                _api__WEBPACK_IMPORTED_MODULE_2__["register"](true, _core__WEBPACK_IMPORTED_MODULE_3__["getCountry"]()).then(function () {
                    if (!_api__WEBPACK_IMPORTED_MODULE_2__["regResponse"].isNil()) {
                        toggleAll();
                    }
                });
            }
        });
    });
    browser.runtime.onMessageExternal.addListener(function (request, sender, response) {
        log(_common_logger__WEBPACK_IMPORTED_MODULE_0__["Level"].DEBUG, "Got external message: " + JSON.stringify(request));
        var toggle = request.toggled;
        var openTab = request.opentab;
        var strMessage = request.message;
        var twitter = strMessage === "twitter";
        var isToggled = _core__WEBPACK_IMPORTED_MODULE_3__["appState"].toggled;
        if (toggle !== undefined) {
            _api__WEBPACK_IMPORTED_MODULE_2__["registerIgnoreErrors"](_core__WEBPACK_IMPORTED_MODULE_3__["getCountry"]()).then(function () {
                var dataAllowed = _api__WEBPACK_IMPORTED_MODULE_2__["regResponse"].dataAllowed;
                if (dataAllowed > 0 && isToggled === false) {
                    toggleAll();
                }
            });
        }
        if (openTab !== undefined) {
            if (openTab === "") {
                browser.tabs.create({});
            }
            else {
                browser.tabs.create({ url: openTab });
            }
        }
        if (twitter) {
            _api__WEBPACK_IMPORTED_MODULE_2__["openTwitter"]();
        }
    });
    browser.runtime.onMessage.addListener(function (request, sender) {
        if (request === _common_ports__WEBPACK_IMPORTED_MODULE_4__["PortName"].POPUP_STATE) {
            return Promise.resolve(_core__WEBPACK_IMPORTED_MODULE_3__["getPopupState"]());
        }
        log(_common_logger__WEBPACK_IMPORTED_MODULE_0__["Level"].DEBUG, "Got content-script message: " + JSON.stringify(request));
        var toggle = request.toggled;
        var country = request.country;
        var isToggled = _core__WEBPACK_IMPORTED_MODULE_3__["appState"].toggled;
        if (toggle !== undefined && country !== undefined && toggle === true) {
            _api__WEBPACK_IMPORTED_MODULE_2__["registerIgnoreErrors"](country).then(function () {
                var dataAllowed = _api__WEBPACK_IMPORTED_MODULE_2__["regResponse"].dataAllowed;
                if (dataAllowed > 0 && isToggled === false) {
                    toggleAll();
                }
            });
            _core__WEBPACK_IMPORTED_MODULE_3__["changeAppStateCountry"](country);
        }
    });
    function portCallback(portName, message) {
        if (message === "toggle-all") {
            toggleAll();
        }
        else {
            log(_common_logger__WEBPACK_IMPORTED_MODULE_0__["Level"].DEBUG, "not a normal command");
        }
        var command = message["COMMAND"];
        if (command !== undefined && command === "change-country") {
            changeCountryCallback(message["PARAM"]);
        }
    }
    _common_ports__WEBPACK_IMPORTED_MODULE_4__["subscribeTo"](_common_ports__WEBPACK_IMPORTED_MODULE_4__["PortName"].BROWSER, portCallback);
    function onRequestCompleted(details) {
        pendingRequests.delete(details.requestId);
    }
    browser.webRequest.onErrorOccurred.addListener(function (details) {
        onRequestCompleted(details);
        var errorStatus = details.error;
        var isToggled = _core__WEBPACK_IMPORTED_MODULE_3__["appState"].toggled;
        log(_common_logger__WEBPACK_IMPORTED_MODULE_0__["Level"].DEBUG, "WebRequestOnErrorOccured: " + JSON.stringify(details));
        if (isToggled === true && (errorStatus.indexOf("ERR_PROXY_CONNECTION_FAILED") > -1 ||
            errorStatus.indexOf("ERR_CONNECTION_RESET") > -1 ||
            errorStatus.indexOf("ERR_NETWORK_IO_SUSPENDED") > -1 ||
            errorStatus.indexOf("NS_ERROR_PROXY_CONNECTION_REFUSED") > -1 ||
            errorStatus.indexOf("NS_ERROR_NET_RESET") > -1)) {
            if (lastErrorRegister === 0 || (Date.now() - lastErrorRegister) > 15000) {
                log(_common_logger__WEBPACK_IMPORTED_MODULE_0__["Level"].WARN, "Registering again, possible server error");
                lastErrorRegister = Date.now();
                register();
            }
            else {
                log(_common_logger__WEBPACK_IMPORTED_MODULE_0__["Level"].WARN, "Not registering - registered too many times");
            }
        }
    }, { urls: ["<all_urls>"] });
    browser.webRequest.onCompleted.addListener(onRequestCompleted, { urls: ["<all_urls>"] });
    whichBrowser.browserRegisterOnAuthListener();
    _common_utils__WEBPACK_IMPORTED_MODULE_1__["storageGet"]("isToggled").then(function (result) {
        var toggled = result.isToggled;
        if (toggled === true) {
            toggleAll();
        }
    });
}
function resetProxy() {
    whichBrowser.browserResetProxy();
}
function setProxy(isEnabled, servers) {
    whichBrowser.browserSetProxy(isEnabled, servers);
}
function evalProxy() {
    return whichBrowser.browserEvalProxy();
}
browser.runtime.setUninstallURL(_api__WEBPACK_IMPORTED_MODULE_2__["TBEAR_UNINSTALL_URL"]);
var registerTimer = window.setInterval(register, 40000);
_api__WEBPACK_IMPORTED_MODULE_2__["regResponse"].addWatch("reg-watcher-browser", function (newValue) {
    var dataAllowed = newValue.dataAllowed;
    var isToggled = _core__WEBPACK_IMPORTED_MODULE_3__["appState"].toggled;
    log(_common_logger__WEBPACK_IMPORTED_MODULE_0__["Level"].DEBUG, "API.reg-response changed!");
    setDataLevel(dataAllowed, isToggled);
    evaluateTimer(dataAllowed);
});


/***/ }),

/***/ 28:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/**
 * A `Cancel` is an object that is thrown when an operation is canceled.
 *
 * @class
 * @param {string=} message The message.
 */
function Cancel(message) {
  this.message = message;
}

Cancel.prototype.toString = function toString() {
  return 'Cancel' + (this.message ? ': ' + this.message : '');
};

Cancel.prototype.__CANCEL__ = true;

module.exports = Cancel;


/***/ }),

/***/ 280:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _common_logger__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(1);
/* harmony import */ var _api__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(276);


function log(level, message) {
    _common_logger__WEBPACK_IMPORTED_MODULE_0__["log"](level, "[Token-Manager] " + message);
}
var TokenManager = /** @class */ (function () {
    function TokenManager() {
        this.currentToken = "";
        this.currentProxies = new Map();
        this.registerPromise = undefined;
        this.requestInProgress = false;
    }
    TokenManager.prototype.logout = function () {
        this.currentToken = "";
        this.currentProxies.clear();
    };
    TokenManager.prototype.getToken = function (proxy) {
        var proxyToken = this.currentProxies.get(proxy);
        log(_common_logger__WEBPACK_IMPORTED_MODULE_0__["Level"].INFO, "[Get-Token] - current token for " + proxy + " " + proxyToken);
        if (this.currentToken === "") {
            return this.newToken(proxy);
        }
        return this.validateToken(proxy, proxyToken);
    };
    TokenManager.prototype.newToken = function (proxy) {
        var _this = this;
        if (this.requestInProgress === false || this.registerPromise === undefined) {
            log(_common_logger__WEBPACK_IMPORTED_MODULE_0__["Level"].INFO, "Fetching new token for " + proxy);
            this.requestInProgress = true;
            this.registerPromise = _api__WEBPACK_IMPORTED_MODULE_1__["register"](true, 0).then(function (response) {
                _this.requestInProgress = false;
                var status = response.status;
                var token = response.vpnToken;
                var dataAllowed = Number(response.dataAllowed);
                var message = response.message;
                log(_common_logger__WEBPACK_IMPORTED_MODULE_0__["Level"].DEBUG, "RegResponse: " + status + " token: " + token);
                if (dataAllowed <= 0) {
                    throw "No data left";
                }
                else if (status !== "OK") {
                    throw message;
                }
                return token;
            }).catch(function (error) {
                _this.requestInProgress = false;
                log(_common_logger__WEBPACK_IMPORTED_MODULE_0__["Level"].WARN, "Error fetching token: " + JSON.stringify(error));
                throw error;
            });
        }
        return this.registerPromise;
    };
    TokenManager.prototype.validateToken = function (proxy, proxyToken) {
        log(_common_logger__WEBPACK_IMPORTED_MODULE_0__["Level"].INFO, "Validating token " + proxyToken + " for " + proxy);
        // If proxy is in array, means we need to get a new token or give the current one if its different from the one set
        if (proxyToken !== undefined) {
            if (proxyToken !== this.currentToken) {
                // Token is different
                this.setToken(proxy, this.currentToken);
                return Promise.resolve(this.currentToken);
            }
            else {
                // Token is the same, so need to get a new one since its erroring out
                return this.newToken(proxy);
            }
        }
        else {
            this.setToken(proxy, this.currentToken);
            return Promise.resolve(this.currentToken);
        }
    };
    TokenManager.prototype.setToken = function (proxy, token) {
        log(_common_logger__WEBPACK_IMPORTED_MODULE_0__["Level"].INFO, "Setting token: " + token + " for proxy: " + proxy);
        this.currentToken = token;
        if (proxy !== undefined) {
            this.currentProxies.set(proxy, token);
        }
    };
    return TokenManager;
}());
/* harmony default export */ __webpack_exports__["default"] = (TokenManager);


/***/ }),

/***/ 281:
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "images/icon_off.png";

/***/ }),

/***/ 282:
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "images/icon_off2x.png";

/***/ }),

/***/ 283:
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "images/icon_on.png";

/***/ }),

/***/ 284:
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "images/icon_on2x.png";

/***/ }),

/***/ 29:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var Cancel = __webpack_require__(28);

/**
 * A `CancelToken` is an object that can be used to request cancellation of an operation.
 *
 * @class
 * @param {Function} executor The executor function.
 */
function CancelToken(executor) {
  if (typeof executor !== 'function') {
    throw new TypeError('executor must be a function.');
  }

  var resolvePromise;
  this.promise = new Promise(function promiseExecutor(resolve) {
    resolvePromise = resolve;
  });

  var token = this;
  executor(function cancel(message) {
    if (token.reason) {
      // Cancellation has already been requested
      return;
    }

    token.reason = new Cancel(message);
    resolvePromise(token.reason);
  });
}

/**
 * Throws a `Cancel` if cancellation has been requested.
 */
CancelToken.prototype.throwIfRequested = function throwIfRequested() {
  if (this.reason) {
    throw this.reason;
  }
};

/**
 * Returns an object that contains a new `CancelToken` and a function that, when called,
 * cancels the `CancelToken`.
 */
CancelToken.source = function source() {
  var cancel;
  var token = new CancelToken(function executor(c) {
    cancel = c;
  });
  return {
    token: token,
    cancel: cancel
  };
};

module.exports = CancelToken;


/***/ }),

/***/ 3:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "post", function() { return post; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "get", function() { return get; });
/* harmony import */ var axios__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(4);
/* harmony import */ var axios__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(axios__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _logger__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(1);


function log(level, message) {
    _logger__WEBPACK_IMPORTED_MODULE_1__["log"](level, "[Ajax-Helper] " + message);
}
var CSRFToken = "";
var rateLimitCount = 20;
var rateLimitExpiry = 30;
var maxNbCalls = 40;
var lastCalls = [];
function addCall(url) {
    lastCalls.push({ url: url, time: Date.now() });
}
function trimCalls() {
    if (lastCalls.length > maxNbCalls) {
        log(_logger__WEBPACK_IMPORTED_MODULE_1__["Level"].DEBUG, "------- trimming calls -------");
        lastCalls.shift();
    }
}
function isRecentCall(call, url) {
    var sameKey = url === call.url;
    var diffSeconds = (Date.now() - call.time) / 1000;
    var isRecent = diffSeconds < rateLimitExpiry;
    return sameKey && isRecent;
}
function canCall(url) {
    trimCalls();
    var callOccurences = lastCalls.filter(function (call) { return isRecentCall(call, url); }).length;
    log(_logger__WEBPACK_IMPORTED_MODULE_1__["Level"].DEBUG, "call occurrences for " + url + " is: " + callOccurences);
    if (callOccurences > rateLimitCount) {
        return false;
    }
    return true;
}
axios__WEBPACK_IMPORTED_MODULE_0___default.a.interceptors.request.use(function (config) {
    config.headers = Object.assign({ "tb-csrf-token": CSRFToken }, config.headers);
    return config;
});
axios__WEBPACK_IMPORTED_MODULE_0___default.a.interceptors.response.use(function (response) {
    var token = response.headers["tb-csrf-token"];
    CSRFToken = token;
    return response;
});
function makeAjaxRequest(method, req) {
    if (!req.ignoreRateLimiting) {
        addCall(req.url);
    }
    if (!req.ignoreRateLimiting && !canCall(req.url)) {
        log(_logger__WEBPACK_IMPORTED_MODULE_1__["Level"].WARN, "rate limiting call made to : " + req.url);
        return Promise.reject("rate limited call to : " + req.url);
    }
    var config = {
        method: method,
        url: req.url,
        responseType: "json"
    };
    if (req.params !== undefined) {
        config.params = req.params;
    }
    if (req.timeout !== undefined) {
        config.timeout = req.timeout;
    }
    if (req.data !== undefined) {
        config.data = req.data;
    }
    log(_logger__WEBPACK_IMPORTED_MODULE_1__["Level"].DEBUG, "call made to : " + req.url);
    return axios__WEBPACK_IMPORTED_MODULE_0___default.a(config);
}
function post(req) {
    return makeAjaxRequest("post", req);
}
function get(req) {
    return makeAjaxRequest("get", req);
}


/***/ }),

/***/ 30:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/**
 * Syntactic sugar for invoking a function and expanding an array for arguments.
 *
 * Common use case would be to use `Function.prototype.apply`.
 *
 *  ```js
 *  function f(x, y, z) {}
 *  var args = [1, 2, 3];
 *  f.apply(null, args);
 *  ```
 *
 * With `spread` this example can be re-written.
 *
 *  ```js
 *  spread(function(x, y, z) {})([1, 2, 3]);
 *  ```
 *
 * @param {Function} callback
 * @returns {Function}
 */
module.exports = function spread(callback) {
  return function wrap(arr) {
    return callback.apply(null, arr);
  };
};


/***/ }),

/***/ 31:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "PortName", function() { return PortName; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "init", function() { return init; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "sendMessage", function() { return sendMessage; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "setup", function() { return setup; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "subscribeTo", function() { return subscribeTo; });
/* harmony import */ var _logger__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(1);

function log(level, message) {
    Object(_logger__WEBPACK_IMPORTED_MODULE_0__["log"])(level, "[Common - Ports] " + message);
}
var PortName;
(function (PortName) {
    PortName["REVIEW"] = "REVIEW";
    PortName["SETTINGS"] = "SETTINGS";
    PortName["LOCATION"] = "LOCATION";
    PortName["APP_STATE"] = "APP_STATE";
    PortName["REGISTER"] = "REGISTER";
    PortName["UPGRADE"] = "UPGRADE";
    PortName["BROWSER"] = "BROWSER";
    PortName["POPUP_STATE"] = "POPUP_STATE";
})(PortName || (PortName = {}));
var ports = new Map();
var listeners = new Map();
var persistent = false;
// Common
function init(persist) {
    persistent = persist;
}
function sendMessage(portName, message) {
    var port = ports.get(portName);
    if (port !== undefined) {
        port.postMessage(message);
    }
}
// Sender setup
function setup(portName, callback) {
    var port = browser.runtime.connect(undefined, { name: portName });
    ports.set(portName, port);
    port.onMessage.addListener(callback);
}
// Receiver setup
function disconnectHandler(portName) {
    ports.delete(portName);
}
function subscribeTo(portName, callback) {
    listeners.set(portName, callback);
}
function makeMessageHandler(portName) {
    return function (message) {
        var listener = listeners.get(portName);
        log(_logger__WEBPACK_IMPORTED_MODULE_0__["Level"].DEBUG, "[" + portName + "] got message: " + message);
        if (listener !== undefined) {
            listener(portName, message);
        }
    };
}
browser.runtime.onConnect.addListener(function (port) {
    if (persistent) {
        log(_logger__WEBPACK_IMPORTED_MODULE_0__["Level"].DEBUG, " got port " + port.name);
        ports.set(PortName[port.name], port);
        port.onDisconnect.addListener(function (port) {
            disconnectHandler(PortName[port.name]);
        });
        port.onMessage.addListener(makeMessageHandler(PortName[port.name]));
    }
});


/***/ }),

/***/ 4:
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(5);

/***/ }),

/***/ 5:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var utils = __webpack_require__(6);
var bind = __webpack_require__(7);
var Axios = __webpack_require__(9);
var defaults = __webpack_require__(10);

/**
 * Create an instance of Axios
 *
 * @param {Object} defaultConfig The default config for the instance
 * @return {Axios} A new instance of Axios
 */
function createInstance(defaultConfig) {
  var context = new Axios(defaultConfig);
  var instance = bind(Axios.prototype.request, context);

  // Copy axios.prototype to instance
  utils.extend(instance, Axios.prototype, context);

  // Copy context to instance
  utils.extend(instance, context);

  return instance;
}

// Create the default instance to be exported
var axios = createInstance(defaults);

// Expose Axios class to allow class inheritance
axios.Axios = Axios;

// Factory for creating new instances
axios.create = function create(instanceConfig) {
  return createInstance(utils.merge(defaults, instanceConfig));
};

// Expose Cancel & CancelToken
axios.Cancel = __webpack_require__(28);
axios.CancelToken = __webpack_require__(29);
axios.isCancel = __webpack_require__(25);

// Expose all/spread
axios.all = function all(promises) {
  return Promise.all(promises);
};
axios.spread = __webpack_require__(30);

module.exports = axios;

// Allow use of default import syntax in TypeScript
module.exports.default = axios;


/***/ }),

/***/ 6:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var bind = __webpack_require__(7);
var isBuffer = __webpack_require__(8);

/*global toString:true*/

// utils is a library of generic helper functions non-specific to axios

var toString = Object.prototype.toString;

/**
 * Determine if a value is an Array
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an Array, otherwise false
 */
function isArray(val) {
  return toString.call(val) === '[object Array]';
}

/**
 * Determine if a value is an ArrayBuffer
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an ArrayBuffer, otherwise false
 */
function isArrayBuffer(val) {
  return toString.call(val) === '[object ArrayBuffer]';
}

/**
 * Determine if a value is a FormData
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an FormData, otherwise false
 */
function isFormData(val) {
  return (typeof FormData !== 'undefined') && (val instanceof FormData);
}

/**
 * Determine if a value is a view on an ArrayBuffer
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a view on an ArrayBuffer, otherwise false
 */
function isArrayBufferView(val) {
  var result;
  if ((typeof ArrayBuffer !== 'undefined') && (ArrayBuffer.isView)) {
    result = ArrayBuffer.isView(val);
  } else {
    result = (val) && (val.buffer) && (val.buffer instanceof ArrayBuffer);
  }
  return result;
}

/**
 * Determine if a value is a String
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a String, otherwise false
 */
function isString(val) {
  return typeof val === 'string';
}

/**
 * Determine if a value is a Number
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Number, otherwise false
 */
function isNumber(val) {
  return typeof val === 'number';
}

/**
 * Determine if a value is undefined
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if the value is undefined, otherwise false
 */
function isUndefined(val) {
  return typeof val === 'undefined';
}

/**
 * Determine if a value is an Object
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an Object, otherwise false
 */
function isObject(val) {
  return val !== null && typeof val === 'object';
}

/**
 * Determine if a value is a Date
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Date, otherwise false
 */
function isDate(val) {
  return toString.call(val) === '[object Date]';
}

/**
 * Determine if a value is a File
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a File, otherwise false
 */
function isFile(val) {
  return toString.call(val) === '[object File]';
}

/**
 * Determine if a value is a Blob
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Blob, otherwise false
 */
function isBlob(val) {
  return toString.call(val) === '[object Blob]';
}

/**
 * Determine if a value is a Function
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Function, otherwise false
 */
function isFunction(val) {
  return toString.call(val) === '[object Function]';
}

/**
 * Determine if a value is a Stream
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Stream, otherwise false
 */
function isStream(val) {
  return isObject(val) && isFunction(val.pipe);
}

/**
 * Determine if a value is a URLSearchParams object
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a URLSearchParams object, otherwise false
 */
function isURLSearchParams(val) {
  return typeof URLSearchParams !== 'undefined' && val instanceof URLSearchParams;
}

/**
 * Trim excess whitespace off the beginning and end of a string
 *
 * @param {String} str The String to trim
 * @returns {String} The String freed of excess whitespace
 */
function trim(str) {
  return str.replace(/^\s*/, '').replace(/\s*$/, '');
}

/**
 * Determine if we're running in a standard browser environment
 *
 * This allows axios to run in a web worker, and react-native.
 * Both environments support XMLHttpRequest, but not fully standard globals.
 *
 * web workers:
 *  typeof window -> undefined
 *  typeof document -> undefined
 *
 * react-native:
 *  navigator.product -> 'ReactNative'
 */
function isStandardBrowserEnv() {
  if (typeof navigator !== 'undefined' && navigator.product === 'ReactNative') {
    return false;
  }
  return (
    typeof window !== 'undefined' &&
    typeof document !== 'undefined'
  );
}

/**
 * Iterate over an Array or an Object invoking a function for each item.
 *
 * If `obj` is an Array callback will be called passing
 * the value, index, and complete array for each item.
 *
 * If 'obj' is an Object callback will be called passing
 * the value, key, and complete object for each property.
 *
 * @param {Object|Array} obj The object to iterate
 * @param {Function} fn The callback to invoke for each item
 */
function forEach(obj, fn) {
  // Don't bother if no value provided
  if (obj === null || typeof obj === 'undefined') {
    return;
  }

  // Force an array if not already something iterable
  if (typeof obj !== 'object') {
    /*eslint no-param-reassign:0*/
    obj = [obj];
  }

  if (isArray(obj)) {
    // Iterate over array values
    for (var i = 0, l = obj.length; i < l; i++) {
      fn.call(null, obj[i], i, obj);
    }
  } else {
    // Iterate over object keys
    for (var key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        fn.call(null, obj[key], key, obj);
      }
    }
  }
}

/**
 * Accepts varargs expecting each argument to be an object, then
 * immutably merges the properties of each object and returns result.
 *
 * When multiple objects contain the same key the later object in
 * the arguments list will take precedence.
 *
 * Example:
 *
 * ```js
 * var result = merge({foo: 123}, {foo: 456});
 * console.log(result.foo); // outputs 456
 * ```
 *
 * @param {Object} obj1 Object to merge
 * @returns {Object} Result of all merge properties
 */
function merge(/* obj1, obj2, obj3, ... */) {
  var result = {};
  function assignValue(val, key) {
    if (typeof result[key] === 'object' && typeof val === 'object') {
      result[key] = merge(result[key], val);
    } else {
      result[key] = val;
    }
  }

  for (var i = 0, l = arguments.length; i < l; i++) {
    forEach(arguments[i], assignValue);
  }
  return result;
}

/**
 * Extends object a by mutably adding to it the properties of object b.
 *
 * @param {Object} a The object to be extended
 * @param {Object} b The object to copy properties from
 * @param {Object} thisArg The object to bind function to
 * @return {Object} The resulting value of object a
 */
function extend(a, b, thisArg) {
  forEach(b, function assignValue(val, key) {
    if (thisArg && typeof val === 'function') {
      a[key] = bind(val, thisArg);
    } else {
      a[key] = val;
    }
  });
  return a;
}

module.exports = {
  isArray: isArray,
  isArrayBuffer: isArrayBuffer,
  isBuffer: isBuffer,
  isFormData: isFormData,
  isArrayBufferView: isArrayBufferView,
  isString: isString,
  isNumber: isNumber,
  isObject: isObject,
  isUndefined: isUndefined,
  isDate: isDate,
  isFile: isFile,
  isBlob: isBlob,
  isFunction: isFunction,
  isStream: isStream,
  isURLSearchParams: isURLSearchParams,
  isStandardBrowserEnv: isStandardBrowserEnv,
  forEach: forEach,
  merge: merge,
  extend: extend,
  trim: trim
};


/***/ }),

/***/ 7:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = function bind(fn, thisArg) {
  return function wrap() {
    var args = new Array(arguments.length);
    for (var i = 0; i < args.length; i++) {
      args[i] = arguments[i];
    }
    return fn.apply(thisArg, args);
  };
};


/***/ }),

/***/ 8:
/***/ (function(module, exports) {

/*!
 * Determine if an object is a Buffer
 *
 * @author   Feross Aboukhadijeh <https://feross.org>
 * @license  MIT
 */

// The _isBuffer check is for Safari 5-7 support, because it's missing
// Object.prototype.constructor. Remove this eventually
module.exports = function (obj) {
  return obj != null && (isBuffer(obj) || isSlowBuffer(obj) || !!obj._isBuffer)
}

function isBuffer (obj) {
  return !!obj.constructor && typeof obj.constructor.isBuffer === 'function' && obj.constructor.isBuffer(obj)
}

// For Node v0.10 support. Remove this eventually.
function isSlowBuffer (obj) {
  return typeof obj.readFloatLE === 'function' && typeof obj.slice === 'function' && isBuffer(obj.slice(0, 0))
}


/***/ }),

/***/ 9:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var defaults = __webpack_require__(10);
var utils = __webpack_require__(6);
var InterceptorManager = __webpack_require__(22);
var dispatchRequest = __webpack_require__(23);

/**
 * Create a new instance of Axios
 *
 * @param {Object} instanceConfig The default config for the instance
 */
function Axios(instanceConfig) {
  this.defaults = instanceConfig;
  this.interceptors = {
    request: new InterceptorManager(),
    response: new InterceptorManager()
  };
}

/**
 * Dispatch a request
 *
 * @param {Object} config The config specific for this request (merged with this.defaults)
 */
Axios.prototype.request = function request(config) {
  /*eslint no-param-reassign:0*/
  // Allow for axios('example/url'[, config]) a la fetch API
  if (typeof config === 'string') {
    config = utils.merge({
      url: arguments[0]
    }, arguments[1]);
  }

  config = utils.merge(defaults, {method: 'get'}, this.defaults, config);
  config.method = config.method.toLowerCase();

  // Hook up interceptors middleware
  var chain = [dispatchRequest, undefined];
  var promise = Promise.resolve(config);

  this.interceptors.request.forEach(function unshiftRequestInterceptors(interceptor) {
    chain.unshift(interceptor.fulfilled, interceptor.rejected);
  });

  this.interceptors.response.forEach(function pushResponseInterceptors(interceptor) {
    chain.push(interceptor.fulfilled, interceptor.rejected);
  });

  while (chain.length) {
    promise = promise.then(chain.shift(), chain.shift());
  }

  return promise;
};

// Provide aliases for supported request methods
utils.forEach(['delete', 'get', 'head', 'options'], function forEachMethodNoData(method) {
  /*eslint func-names:0*/
  Axios.prototype[method] = function(url, config) {
    return this.request(utils.merge(config || {}, {
      method: method,
      url: url
    }));
  };
});

utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
  /*eslint func-names:0*/
  Axios.prototype[method] = function(url, data, config) {
    return this.request(utils.merge(config || {}, {
      method: method,
      url: url,
      data: data
    }));
  };
});

module.exports = Axios;


/***/ })

/******/ });