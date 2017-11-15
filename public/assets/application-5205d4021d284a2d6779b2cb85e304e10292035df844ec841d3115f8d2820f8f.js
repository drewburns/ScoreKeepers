/*
Unobtrusive JavaScript
https://github.com/rails/rails/blob/master/actionview/app/assets/javascripts
Released under the MIT license
 */


(function() {
  var context = this;

  (function() {
    (function() {
      this.Rails = {
        linkClickSelector: 'a[data-confirm], a[data-method], a[data-remote]:not([disabled]), a[data-disable-with], a[data-disable]',
        buttonClickSelector: {
          selector: 'button[data-remote]:not([form]), button[data-confirm]:not([form])',
          exclude: 'form button'
        },
        inputChangeSelector: 'select[data-remote], input[data-remote], textarea[data-remote]',
        formSubmitSelector: 'form',
        formInputClickSelector: 'form input[type=submit], form input[type=image], form button[type=submit], form button:not([type]), input[type=submit][form], input[type=image][form], button[type=submit][form], button[form]:not([type])',
        formDisableSelector: 'input[data-disable-with]:enabled, button[data-disable-with]:enabled, textarea[data-disable-with]:enabled, input[data-disable]:enabled, button[data-disable]:enabled, textarea[data-disable]:enabled',
        formEnableSelector: 'input[data-disable-with]:disabled, button[data-disable-with]:disabled, textarea[data-disable-with]:disabled, input[data-disable]:disabled, button[data-disable]:disabled, textarea[data-disable]:disabled',
        fileInputSelector: 'input[name][type=file]:not([disabled])',
        linkDisableSelector: 'a[data-disable-with], a[data-disable]',
        buttonDisableSelector: 'button[data-remote][data-disable-with], button[data-remote][data-disable]'
      };

    }).call(this);
  }).call(context);

  var Rails = context.Rails;

  (function() {
    (function() {
      var expando, m;

      m = Element.prototype.matches || Element.prototype.matchesSelector || Element.prototype.mozMatchesSelector || Element.prototype.msMatchesSelector || Element.prototype.oMatchesSelector || Element.prototype.webkitMatchesSelector;

      Rails.matches = function(element, selector) {
        if (selector.exclude != null) {
          return m.call(element, selector.selector) && !m.call(element, selector.exclude);
        } else {
          return m.call(element, selector);
        }
      };

      expando = '_ujsData';

      Rails.getData = function(element, key) {
        var ref;
        return (ref = element[expando]) != null ? ref[key] : void 0;
      };

      Rails.setData = function(element, key, value) {
        if (element[expando] == null) {
          element[expando] = {};
        }
        return element[expando][key] = value;
      };

      Rails.$ = function(selector) {
        return Array.prototype.slice.call(document.querySelectorAll(selector));
      };

    }).call(this);
    (function() {
      var $, csrfParam, csrfToken;

      $ = Rails.$;

      csrfToken = Rails.csrfToken = function() {
        var meta;
        meta = document.querySelector('meta[name=csrf-token]');
        return meta && meta.content;
      };

      csrfParam = Rails.csrfParam = function() {
        var meta;
        meta = document.querySelector('meta[name=csrf-param]');
        return meta && meta.content;
      };

      Rails.CSRFProtection = function(xhr) {
        var token;
        token = csrfToken();
        if (token != null) {
          return xhr.setRequestHeader('X-CSRF-Token', token);
        }
      };

      Rails.refreshCSRFTokens = function() {
        var param, token;
        token = csrfToken();
        param = csrfParam();
        if ((token != null) && (param != null)) {
          return $('form input[name="' + param + '"]').forEach(function(input) {
            return input.value = token;
          });
        }
      };

    }).call(this);
    (function() {
      var CustomEvent, fire, matches;

      matches = Rails.matches;

      CustomEvent = window.CustomEvent;

      if (typeof CustomEvent !== 'function') {
        CustomEvent = function(event, params) {
          var evt;
          evt = document.createEvent('CustomEvent');
          evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
          return evt;
        };
        CustomEvent.prototype = window.Event.prototype;
      }

      fire = Rails.fire = function(obj, name, data) {
        var event;
        event = new CustomEvent(name, {
          bubbles: true,
          cancelable: true,
          detail: data
        });
        obj.dispatchEvent(event);
        return !event.defaultPrevented;
      };

      Rails.stopEverything = function(e) {
        fire(e.target, 'ujs:everythingStopped');
        e.preventDefault();
        e.stopPropagation();
        return e.stopImmediatePropagation();
      };

      Rails.delegate = function(element, selector, eventType, handler) {
        return element.addEventListener(eventType, function(e) {
          var target;
          target = e.target;
          while (!(!(target instanceof Element) || matches(target, selector))) {
            target = target.parentNode;
          }
          if (target instanceof Element && handler.call(target, e) === false) {
            e.preventDefault();
            return e.stopPropagation();
          }
        });
      };

    }).call(this);
    (function() {
      var AcceptHeaders, CSRFProtection, createXHR, fire, prepareOptions, processResponse;

      CSRFProtection = Rails.CSRFProtection, fire = Rails.fire;

      AcceptHeaders = {
        '*': '*/*',
        text: 'text/plain',
        html: 'text/html',
        xml: 'application/xml, text/xml',
        json: 'application/json, text/javascript',
        script: 'text/javascript, application/javascript, application/ecmascript, application/x-ecmascript'
      };

      Rails.ajax = function(options) {
        var xhr;
        options = prepareOptions(options);
        xhr = createXHR(options, function() {
          var response;
          response = processResponse(xhr.response, xhr.getResponseHeader('Content-Type'));
          if (Math.floor(xhr.status / 100) === 2) {
            if (typeof options.success === "function") {
              options.success(response, xhr.statusText, xhr);
            }
          } else {
            if (typeof options.error === "function") {
              options.error(response, xhr.statusText, xhr);
            }
          }
          return typeof options.complete === "function" ? options.complete(xhr, xhr.statusText) : void 0;
        });
        if (typeof options.beforeSend === "function") {
          options.beforeSend(xhr, options);
        }
        if (xhr.readyState === XMLHttpRequest.OPENED) {
          return xhr.send(options.data);
        } else {
          return fire(document, 'ajaxStop');
        }
      };

      prepareOptions = function(options) {
        options.url = options.url || location.href;
        options.type = options.type.toUpperCase();
        if (options.type === 'GET' && options.data) {
          if (options.url.indexOf('?') < 0) {
            options.url += '?' + options.data;
          } else {
            options.url += '&' + options.data;
          }
        }
        if (AcceptHeaders[options.dataType] == null) {
          options.dataType = '*';
        }
        options.accept = AcceptHeaders[options.dataType];
        if (options.dataType !== '*') {
          options.accept += ', */*; q=0.01';
        }
        return options;
      };

      createXHR = function(options, done) {
        var xhr;
        xhr = new XMLHttpRequest();
        xhr.open(options.type, options.url, true);
        xhr.setRequestHeader('Accept', options.accept);
        if (typeof options.data === 'string') {
          xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
        }
        if (!options.crossDomain) {
          xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
        }
        CSRFProtection(xhr);
        xhr.withCredentials = !!options.withCredentials;
        xhr.onreadystatechange = function() {
          if (xhr.readyState === XMLHttpRequest.DONE) {
            return done(xhr);
          }
        };
        return xhr;
      };

      processResponse = function(response, type) {
        var parser, script;
        if (typeof response === 'string' && typeof type === 'string') {
          if (type.match(/\bjson\b/)) {
            try {
              response = JSON.parse(response);
            } catch (error) {}
          } else if (type.match(/\b(?:java|ecma)script\b/)) {
            script = document.createElement('script');
            script.text = response;
            document.head.appendChild(script).parentNode.removeChild(script);
          } else if (type.match(/\b(xml|html|svg)\b/)) {
            parser = new DOMParser();
            type = type.replace(/;.+/, '');
            try {
              response = parser.parseFromString(response, type);
            } catch (error) {}
          }
        }
        return response;
      };

      Rails.href = function(element) {
        return element.href;
      };

      Rails.isCrossDomain = function(url) {
        var e, originAnchor, urlAnchor;
        originAnchor = document.createElement('a');
        originAnchor.href = location.href;
        urlAnchor = document.createElement('a');
        try {
          urlAnchor.href = url;
          return !(((!urlAnchor.protocol || urlAnchor.protocol === ':') && !urlAnchor.host) || (originAnchor.protocol + '//' + originAnchor.host === urlAnchor.protocol + '//' + urlAnchor.host));
        } catch (error) {
          e = error;
          return true;
        }
      };

    }).call(this);
    (function() {
      var matches, toArray;

      matches = Rails.matches;

      toArray = function(e) {
        return Array.prototype.slice.call(e);
      };

      Rails.serializeElement = function(element, additionalParam) {
        var inputs, params;
        inputs = [element];
        if (matches(element, 'form')) {
          inputs = toArray(element.elements);
        }
        params = [];
        inputs.forEach(function(input) {
          if (!input.name) {
            return;
          }
          if (matches(input, 'select')) {
            return toArray(input.options).forEach(function(option) {
              if (option.selected) {
                return params.push({
                  name: input.name,
                  value: option.value
                });
              }
            });
          } else if (input.checked || ['radio', 'checkbox', 'submit'].indexOf(input.type) === -1) {
            return params.push({
              name: input.name,
              value: input.value
            });
          }
        });
        if (additionalParam) {
          params.push(additionalParam);
        }
        return params.map(function(param) {
          if (param.name != null) {
            return (encodeURIComponent(param.name)) + "=" + (encodeURIComponent(param.value));
          } else {
            return param;
          }
        }).join('&');
      };

      Rails.formElements = function(form, selector) {
        if (matches(form, 'form')) {
          return toArray(form.elements).filter(function(el) {
            return matches(el, selector);
          });
        } else {
          return toArray(form.querySelectorAll(selector));
        }
      };

    }).call(this);
    (function() {
      var allowAction, fire, stopEverything;

      fire = Rails.fire, stopEverything = Rails.stopEverything;

      Rails.handleConfirm = function(e) {
        if (!allowAction(this)) {
          return stopEverything(e);
        }
      };

      allowAction = function(element) {
        var answer, callback, message;
        message = element.getAttribute('data-confirm');
        if (!message) {
          return true;
        }
        answer = false;
        if (fire(element, 'confirm')) {
          try {
            answer = confirm(message);
          } catch (error) {}
          callback = fire(element, 'confirm:complete', [answer]);
        }
        return answer && callback;
      };

    }).call(this);
    (function() {
      var disableFormElement, disableFormElements, disableLinkElement, enableFormElement, enableFormElements, enableLinkElement, formElements, getData, matches, setData, stopEverything;

      matches = Rails.matches, getData = Rails.getData, setData = Rails.setData, stopEverything = Rails.stopEverything, formElements = Rails.formElements;

      Rails.handleDisabledElement = function(e) {
        var element;
        element = this;
        if (element.disabled) {
          return stopEverything(e);
        }
      };

      Rails.enableElement = function(e) {
        var element;
        element = e instanceof Event ? e.target : e;
        if (matches(element, Rails.linkDisableSelector)) {
          return enableLinkElement(element);
        } else if (matches(element, Rails.buttonDisableSelector) || matches(element, Rails.formEnableSelector)) {
          return enableFormElement(element);
        } else if (matches(element, Rails.formSubmitSelector)) {
          return enableFormElements(element);
        }
      };

      Rails.disableElement = function(e) {
        var element;
        element = e instanceof Event ? e.target : e;
        if (matches(element, Rails.linkDisableSelector)) {
          return disableLinkElement(element);
        } else if (matches(element, Rails.buttonDisableSelector) || matches(element, Rails.formDisableSelector)) {
          return disableFormElement(element);
        } else if (matches(element, Rails.formSubmitSelector)) {
          return disableFormElements(element);
        }
      };

      disableLinkElement = function(element) {
        var replacement;
        replacement = element.getAttribute('data-disable-with');
        if (replacement != null) {
          setData(element, 'ujs:enable-with', element.innerHTML);
          element.innerHTML = replacement;
        }
        element.addEventListener('click', stopEverything);
        return setData(element, 'ujs:disabled', true);
      };

      enableLinkElement = function(element) {
        var originalText;
        originalText = getData(element, 'ujs:enable-with');
        if (originalText != null) {
          element.innerHTML = originalText;
          setData(element, 'ujs:enable-with', null);
        }
        element.removeEventListener('click', stopEverything);
        return setData(element, 'ujs:disabled', null);
      };

      disableFormElements = function(form) {
        return formElements(form, Rails.formDisableSelector).forEach(disableFormElement);
      };

      disableFormElement = function(element) {
        var replacement;
        replacement = element.getAttribute('data-disable-with');
        if (replacement != null) {
          if (matches(element, 'button')) {
            setData(element, 'ujs:enable-with', element.innerHTML);
            element.innerHTML = replacement;
          } else {
            setData(element, 'ujs:enable-with', element.value);
            element.value = replacement;
          }
        }
        element.disabled = true;
        return setData(element, 'ujs:disabled', true);
      };

      enableFormElements = function(form) {
        return formElements(form, Rails.formEnableSelector).forEach(enableFormElement);
      };

      enableFormElement = function(element) {
        var originalText;
        originalText = getData(element, 'ujs:enable-with');
        if (originalText != null) {
          if (matches(element, 'button')) {
            element.innerHTML = originalText;
          } else {
            element.value = originalText;
          }
          setData(element, 'ujs:enable-with', null);
        }
        element.disabled = false;
        return setData(element, 'ujs:disabled', null);
      };

    }).call(this);
    (function() {
      var stopEverything;

      stopEverything = Rails.stopEverything;

      Rails.handleMethod = function(e) {
        var csrfParam, csrfToken, form, formContent, href, link, method;
        link = this;
        method = link.getAttribute('data-method');
        if (!method) {
          return;
        }
        href = Rails.href(link);
        csrfToken = Rails.csrfToken();
        csrfParam = Rails.csrfParam();
        form = document.createElement('form');
        formContent = "<input name='_method' value='" + method + "' type='hidden' />";
        if ((csrfParam != null) && (csrfToken != null) && !Rails.isCrossDomain(href)) {
          formContent += "<input name='" + csrfParam + "' value='" + csrfToken + "' type='hidden' />";
        }
        formContent += '<input type="submit" />';
        form.method = 'post';
        form.action = href;
        form.target = link.target;
        form.innerHTML = formContent;
        form.style.display = 'none';
        document.body.appendChild(form);
        form.querySelector('[type="submit"]').click();
        return stopEverything(e);
      };

    }).call(this);
    (function() {
      var ajax, fire, getData, isCrossDomain, isRemote, matches, serializeElement, setData, stopEverything,
        slice = [].slice;

      matches = Rails.matches, getData = Rails.getData, setData = Rails.setData, fire = Rails.fire, stopEverything = Rails.stopEverything, ajax = Rails.ajax, isCrossDomain = Rails.isCrossDomain, serializeElement = Rails.serializeElement;

      isRemote = function(element) {
        var value;
        value = element.getAttribute('data-remote');
        return (value != null) && value !== 'false';
      };

      Rails.handleRemote = function(e) {
        var button, data, dataType, element, method, url, withCredentials;
        element = this;
        if (!isRemote(element)) {
          return true;
        }
        if (!fire(element, 'ajax:before')) {
          fire(element, 'ajax:stopped');
          return false;
        }
        withCredentials = element.getAttribute('data-with-credentials');
        dataType = element.getAttribute('data-type') || 'script';
        if (matches(element, Rails.formSubmitSelector)) {
          button = getData(element, 'ujs:submit-button');
          method = getData(element, 'ujs:submit-button-formmethod') || element.method;
          url = getData(element, 'ujs:submit-button-formaction') || element.getAttribute('action') || location.href;
          if (method.toUpperCase() === 'GET') {
            url = url.replace(/\?.*$/, '');
          }
          if (element.enctype === 'multipart/form-data') {
            data = new FormData(element);
            if (button != null) {
              data.append(button.name, button.value);
            }
          } else {
            data = serializeElement(element, button);
          }
          setData(element, 'ujs:submit-button', null);
          setData(element, 'ujs:submit-button-formmethod', null);
          setData(element, 'ujs:submit-button-formaction', null);
        } else if (matches(element, Rails.buttonClickSelector) || matches(element, Rails.inputChangeSelector)) {
          method = element.getAttribute('data-method');
          url = element.getAttribute('data-url');
          data = serializeElement(element, element.getAttribute('data-params'));
        } else {
          method = element.getAttribute('data-method');
          url = Rails.href(element);
          data = element.getAttribute('data-params');
        }
        ajax({
          type: method || 'GET',
          url: url,
          data: data,
          dataType: dataType,
          beforeSend: function(xhr, options) {
            if (fire(element, 'ajax:beforeSend', [xhr, options])) {
              return fire(element, 'ajax:send', [xhr]);
            } else {
              fire(element, 'ajax:stopped');
              return xhr.abort();
            }
          },
          success: function() {
            var args;
            args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
            return fire(element, 'ajax:success', args);
          },
          error: function() {
            var args;
            args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
            return fire(element, 'ajax:error', args);
          },
          complete: function() {
            var args;
            args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
            return fire(element, 'ajax:complete', args);
          },
          crossDomain: isCrossDomain(url),
          withCredentials: (withCredentials != null) && withCredentials !== 'false'
        });
        return stopEverything(e);
      };

      Rails.formSubmitButtonClick = function(e) {
        var button, form;
        button = this;
        form = button.form;
        if (!form) {
          return;
        }
        if (button.name) {
          setData(form, 'ujs:submit-button', {
            name: button.name,
            value: button.value
          });
        }
        setData(form, 'ujs:formnovalidate-button', button.formNoValidate);
        setData(form, 'ujs:submit-button-formaction', button.getAttribute('formaction'));
        return setData(form, 'ujs:submit-button-formmethod', button.getAttribute('formmethod'));
      };

      Rails.handleMetaClick = function(e) {
        var data, link, metaClick, method;
        link = this;
        method = (link.getAttribute('data-method') || 'GET').toUpperCase();
        data = link.getAttribute('data-params');
        metaClick = e.metaKey || e.ctrlKey;
        if (metaClick && method === 'GET' && !data) {
          return e.stopImmediatePropagation();
        }
      };

    }).call(this);
    (function() {
      var $, CSRFProtection, delegate, disableElement, enableElement, fire, formSubmitButtonClick, getData, handleConfirm, handleDisabledElement, handleMetaClick, handleMethod, handleRemote, refreshCSRFTokens;

      fire = Rails.fire, delegate = Rails.delegate, getData = Rails.getData, $ = Rails.$, refreshCSRFTokens = Rails.refreshCSRFTokens, CSRFProtection = Rails.CSRFProtection, enableElement = Rails.enableElement, disableElement = Rails.disableElement, handleDisabledElement = Rails.handleDisabledElement, handleConfirm = Rails.handleConfirm, handleRemote = Rails.handleRemote, formSubmitButtonClick = Rails.formSubmitButtonClick, handleMetaClick = Rails.handleMetaClick, handleMethod = Rails.handleMethod;

      if ((typeof jQuery !== "undefined" && jQuery !== null) && (jQuery.ajax != null) && !jQuery.rails) {
        jQuery.rails = Rails;
        jQuery.ajaxPrefilter(function(options, originalOptions, xhr) {
          if (!options.crossDomain) {
            return CSRFProtection(xhr);
          }
        });
      }

      Rails.start = function() {
        if (window._rails_loaded) {
          throw new Error('rails-ujs has already been loaded!');
        }
        window.addEventListener('pageshow', function() {
          $(Rails.formEnableSelector).forEach(function(el) {
            if (getData(el, 'ujs:disabled')) {
              return enableElement(el);
            }
          });
          return $(Rails.linkDisableSelector).forEach(function(el) {
            if (getData(el, 'ujs:disabled')) {
              return enableElement(el);
            }
          });
        });
        delegate(document, Rails.linkDisableSelector, 'ajax:complete', enableElement);
        delegate(document, Rails.linkDisableSelector, 'ajax:stopped', enableElement);
        delegate(document, Rails.buttonDisableSelector, 'ajax:complete', enableElement);
        delegate(document, Rails.buttonDisableSelector, 'ajax:stopped', enableElement);
        delegate(document, Rails.linkClickSelector, 'click', handleDisabledElement);
        delegate(document, Rails.linkClickSelector, 'click', handleConfirm);
        delegate(document, Rails.linkClickSelector, 'click', handleMetaClick);
        delegate(document, Rails.linkClickSelector, 'click', disableElement);
        delegate(document, Rails.linkClickSelector, 'click', handleRemote);
        delegate(document, Rails.linkClickSelector, 'click', handleMethod);
        delegate(document, Rails.buttonClickSelector, 'click', handleDisabledElement);
        delegate(document, Rails.buttonClickSelector, 'click', handleConfirm);
        delegate(document, Rails.buttonClickSelector, 'click', disableElement);
        delegate(document, Rails.buttonClickSelector, 'click', handleRemote);
        delegate(document, Rails.inputChangeSelector, 'change', handleDisabledElement);
        delegate(document, Rails.inputChangeSelector, 'change', handleConfirm);
        delegate(document, Rails.inputChangeSelector, 'change', handleRemote);
        delegate(document, Rails.formSubmitSelector, 'submit', handleDisabledElement);
        delegate(document, Rails.formSubmitSelector, 'submit', handleConfirm);
        delegate(document, Rails.formSubmitSelector, 'submit', handleRemote);
        delegate(document, Rails.formSubmitSelector, 'submit', function(e) {
          return setTimeout((function() {
            return disableElement(e);
          }), 13);
        });
        delegate(document, Rails.formSubmitSelector, 'ajax:send', disableElement);
        delegate(document, Rails.formSubmitSelector, 'ajax:complete', enableElement);
        delegate(document, Rails.formInputClickSelector, 'click', handleDisabledElement);
        delegate(document, Rails.formInputClickSelector, 'click', handleConfirm);
        delegate(document, Rails.formInputClickSelector, 'click', formSubmitButtonClick);
        document.addEventListener('DOMContentLoaded', refreshCSRFTokens);
        return window._rails_loaded = true;
      };

      if (window.Rails === Rails && fire(document, 'rails:attachBindings')) {
        Rails.start();
      }

    }).call(this);
  }).call(this);

  if (typeof module === "object" && module.exports) {
    module.exports = Rails;
  } else if (typeof define === "function" && define.amd) {
    define(Rails);
  }
}).call(this);
(function() {
  var context = this;

  (function() {
    (function() {
      var slice = [].slice;

      this.ActionCable = {
        INTERNAL: {
          "message_types": {
            "welcome": "welcome",
            "ping": "ping",
            "confirmation": "confirm_subscription",
            "rejection": "reject_subscription"
          },
          "default_mount_path": "/cable",
          "protocols": ["actioncable-v1-json", "actioncable-unsupported"]
        },
        WebSocket: window.WebSocket,
        logger: window.console,
        createConsumer: function(url) {
          var ref;
          if (url == null) {
            url = (ref = this.getConfig("url")) != null ? ref : this.INTERNAL.default_mount_path;
          }
          return new ActionCable.Consumer(this.createWebSocketURL(url));
        },
        getConfig: function(name) {
          var element;
          element = document.head.querySelector("meta[name='action-cable-" + name + "']");
          return element != null ? element.getAttribute("content") : void 0;
        },
        createWebSocketURL: function(url) {
          var a;
          if (url && !/^wss?:/i.test(url)) {
            a = document.createElement("a");
            a.href = url;
            a.href = a.href;
            a.protocol = a.protocol.replace("http", "ws");
            return a.href;
          } else {
            return url;
          }
        },
        startDebugging: function() {
          return this.debugging = true;
        },
        stopDebugging: function() {
          return this.debugging = null;
        },
        log: function() {
          var messages, ref;
          messages = 1 <= arguments.length ? slice.call(arguments, 0) : [];
          if (this.debugging) {
            messages.push(Date.now());
            return (ref = this.logger).log.apply(ref, ["[ActionCable]"].concat(slice.call(messages)));
          }
        }
      };

    }).call(this);
  }).call(context);

  var ActionCable = context.ActionCable;

  (function() {
    (function() {
      var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

      ActionCable.ConnectionMonitor = (function() {
        var clamp, now, secondsSince;

        ConnectionMonitor.pollInterval = {
          min: 3,
          max: 30
        };

        ConnectionMonitor.staleThreshold = 6;

        function ConnectionMonitor(connection) {
          this.connection = connection;
          this.visibilityDidChange = bind(this.visibilityDidChange, this);
          this.reconnectAttempts = 0;
        }

        ConnectionMonitor.prototype.start = function() {
          if (!this.isRunning()) {
            this.startedAt = now();
            delete this.stoppedAt;
            this.startPolling();
            document.addEventListener("visibilitychange", this.visibilityDidChange);
            return ActionCable.log("ConnectionMonitor started. pollInterval = " + (this.getPollInterval()) + " ms");
          }
        };

        ConnectionMonitor.prototype.stop = function() {
          if (this.isRunning()) {
            this.stoppedAt = now();
            this.stopPolling();
            document.removeEventListener("visibilitychange", this.visibilityDidChange);
            return ActionCable.log("ConnectionMonitor stopped");
          }
        };

        ConnectionMonitor.prototype.isRunning = function() {
          return (this.startedAt != null) && (this.stoppedAt == null);
        };

        ConnectionMonitor.prototype.recordPing = function() {
          return this.pingedAt = now();
        };

        ConnectionMonitor.prototype.recordConnect = function() {
          this.reconnectAttempts = 0;
          this.recordPing();
          delete this.disconnectedAt;
          return ActionCable.log("ConnectionMonitor recorded connect");
        };

        ConnectionMonitor.prototype.recordDisconnect = function() {
          this.disconnectedAt = now();
          return ActionCable.log("ConnectionMonitor recorded disconnect");
        };

        ConnectionMonitor.prototype.startPolling = function() {
          this.stopPolling();
          return this.poll();
        };

        ConnectionMonitor.prototype.stopPolling = function() {
          return clearTimeout(this.pollTimeout);
        };

        ConnectionMonitor.prototype.poll = function() {
          return this.pollTimeout = setTimeout((function(_this) {
            return function() {
              _this.reconnectIfStale();
              return _this.poll();
            };
          })(this), this.getPollInterval());
        };

        ConnectionMonitor.prototype.getPollInterval = function() {
          var interval, max, min, ref;
          ref = this.constructor.pollInterval, min = ref.min, max = ref.max;
          interval = 5 * Math.log(this.reconnectAttempts + 1);
          return Math.round(clamp(interval, min, max) * 1000);
        };

        ConnectionMonitor.prototype.reconnectIfStale = function() {
          if (this.connectionIsStale()) {
            ActionCable.log("ConnectionMonitor detected stale connection. reconnectAttempts = " + this.reconnectAttempts + ", pollInterval = " + (this.getPollInterval()) + " ms, time disconnected = " + (secondsSince(this.disconnectedAt)) + " s, stale threshold = " + this.constructor.staleThreshold + " s");
            this.reconnectAttempts++;
            if (this.disconnectedRecently()) {
              return ActionCable.log("ConnectionMonitor skipping reopening recent disconnect");
            } else {
              ActionCable.log("ConnectionMonitor reopening");
              return this.connection.reopen();
            }
          }
        };

        ConnectionMonitor.prototype.connectionIsStale = function() {
          var ref;
          return secondsSince((ref = this.pingedAt) != null ? ref : this.startedAt) > this.constructor.staleThreshold;
        };

        ConnectionMonitor.prototype.disconnectedRecently = function() {
          return this.disconnectedAt && secondsSince(this.disconnectedAt) < this.constructor.staleThreshold;
        };

        ConnectionMonitor.prototype.visibilityDidChange = function() {
          if (document.visibilityState === "visible") {
            return setTimeout((function(_this) {
              return function() {
                if (_this.connectionIsStale() || !_this.connection.isOpen()) {
                  ActionCable.log("ConnectionMonitor reopening stale connection on visibilitychange. visbilityState = " + document.visibilityState);
                  return _this.connection.reopen();
                }
              };
            })(this), 200);
          }
        };

        now = function() {
          return new Date().getTime();
        };

        secondsSince = function(time) {
          return (now() - time) / 1000;
        };

        clamp = function(number, min, max) {
          return Math.max(min, Math.min(max, number));
        };

        return ConnectionMonitor;

      })();

    }).call(this);
    (function() {
      var i, message_types, protocols, ref, supportedProtocols, unsupportedProtocol,
        slice = [].slice,
        bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
        indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

      ref = ActionCable.INTERNAL, message_types = ref.message_types, protocols = ref.protocols;

      supportedProtocols = 2 <= protocols.length ? slice.call(protocols, 0, i = protocols.length - 1) : (i = 0, []), unsupportedProtocol = protocols[i++];

      ActionCable.Connection = (function() {
        Connection.reopenDelay = 500;

        function Connection(consumer) {
          this.consumer = consumer;
          this.open = bind(this.open, this);
          this.subscriptions = this.consumer.subscriptions;
          this.monitor = new ActionCable.ConnectionMonitor(this);
          this.disconnected = true;
        }

        Connection.prototype.send = function(data) {
          if (this.isOpen()) {
            this.webSocket.send(JSON.stringify(data));
            return true;
          } else {
            return false;
          }
        };

        Connection.prototype.open = function() {
          if (this.isActive()) {
            ActionCable.log("Attempted to open WebSocket, but existing socket is " + (this.getState()));
            return false;
          } else {
            ActionCable.log("Opening WebSocket, current state is " + (this.getState()) + ", subprotocols: " + protocols);
            if (this.webSocket != null) {
              this.uninstallEventHandlers();
            }
            this.webSocket = new ActionCable.WebSocket(this.consumer.url, protocols);
            this.installEventHandlers();
            this.monitor.start();
            return true;
          }
        };

        Connection.prototype.close = function(arg) {
          var allowReconnect, ref1;
          allowReconnect = (arg != null ? arg : {
            allowReconnect: true
          }).allowReconnect;
          if (!allowReconnect) {
            this.monitor.stop();
          }
          if (this.isActive()) {
            return (ref1 = this.webSocket) != null ? ref1.close() : void 0;
          }
        };

        Connection.prototype.reopen = function() {
          var error;
          ActionCable.log("Reopening WebSocket, current state is " + (this.getState()));
          if (this.isActive()) {
            try {
              return this.close();
            } catch (error1) {
              error = error1;
              return ActionCable.log("Failed to reopen WebSocket", error);
            } finally {
              ActionCable.log("Reopening WebSocket in " + this.constructor.reopenDelay + "ms");
              setTimeout(this.open, this.constructor.reopenDelay);
            }
          } else {
            return this.open();
          }
        };

        Connection.prototype.getProtocol = function() {
          var ref1;
          return (ref1 = this.webSocket) != null ? ref1.protocol : void 0;
        };

        Connection.prototype.isOpen = function() {
          return this.isState("open");
        };

        Connection.prototype.isActive = function() {
          return this.isState("open", "connecting");
        };

        Connection.prototype.isProtocolSupported = function() {
          var ref1;
          return ref1 = this.getProtocol(), indexOf.call(supportedProtocols, ref1) >= 0;
        };

        Connection.prototype.isState = function() {
          var ref1, states;
          states = 1 <= arguments.length ? slice.call(arguments, 0) : [];
          return ref1 = this.getState(), indexOf.call(states, ref1) >= 0;
        };

        Connection.prototype.getState = function() {
          var ref1, state, value;
          for (state in WebSocket) {
            value = WebSocket[state];
            if (value === ((ref1 = this.webSocket) != null ? ref1.readyState : void 0)) {
              return state.toLowerCase();
            }
          }
          return null;
        };

        Connection.prototype.installEventHandlers = function() {
          var eventName, handler;
          for (eventName in this.events) {
            handler = this.events[eventName].bind(this);
            this.webSocket["on" + eventName] = handler;
          }
        };

        Connection.prototype.uninstallEventHandlers = function() {
          var eventName;
          for (eventName in this.events) {
            this.webSocket["on" + eventName] = function() {};
          }
        };

        Connection.prototype.events = {
          message: function(event) {
            var identifier, message, ref1, type;
            if (!this.isProtocolSupported()) {
              return;
            }
            ref1 = JSON.parse(event.data), identifier = ref1.identifier, message = ref1.message, type = ref1.type;
            switch (type) {
              case message_types.welcome:
                this.monitor.recordConnect();
                return this.subscriptions.reload();
              case message_types.ping:
                return this.monitor.recordPing();
              case message_types.confirmation:
                return this.subscriptions.notify(identifier, "connected");
              case message_types.rejection:
                return this.subscriptions.reject(identifier);
              default:
                return this.subscriptions.notify(identifier, "received", message);
            }
          },
          open: function() {
            ActionCable.log("WebSocket onopen event, using '" + (this.getProtocol()) + "' subprotocol");
            this.disconnected = false;
            if (!this.isProtocolSupported()) {
              ActionCable.log("Protocol is unsupported. Stopping monitor and disconnecting.");
              return this.close({
                allowReconnect: false
              });
            }
          },
          close: function(event) {
            ActionCable.log("WebSocket onclose event");
            if (this.disconnected) {
              return;
            }
            this.disconnected = true;
            this.monitor.recordDisconnect();
            return this.subscriptions.notifyAll("disconnected", {
              willAttemptReconnect: this.monitor.isRunning()
            });
          },
          error: function() {
            return ActionCable.log("WebSocket onerror event");
          }
        };

        return Connection;

      })();

    }).call(this);
    (function() {
      var slice = [].slice;

      ActionCable.Subscriptions = (function() {
        function Subscriptions(consumer) {
          this.consumer = consumer;
          this.subscriptions = [];
        }

        Subscriptions.prototype.create = function(channelName, mixin) {
          var channel, params, subscription;
          channel = channelName;
          params = typeof channel === "object" ? channel : {
            channel: channel
          };
          subscription = new ActionCable.Subscription(this.consumer, params, mixin);
          return this.add(subscription);
        };

        Subscriptions.prototype.add = function(subscription) {
          this.subscriptions.push(subscription);
          this.consumer.ensureActiveConnection();
          this.notify(subscription, "initialized");
          this.sendCommand(subscription, "subscribe");
          return subscription;
        };

        Subscriptions.prototype.remove = function(subscription) {
          this.forget(subscription);
          if (!this.findAll(subscription.identifier).length) {
            this.sendCommand(subscription, "unsubscribe");
          }
          return subscription;
        };

        Subscriptions.prototype.reject = function(identifier) {
          var i, len, ref, results, subscription;
          ref = this.findAll(identifier);
          results = [];
          for (i = 0, len = ref.length; i < len; i++) {
            subscription = ref[i];
            this.forget(subscription);
            this.notify(subscription, "rejected");
            results.push(subscription);
          }
          return results;
        };

        Subscriptions.prototype.forget = function(subscription) {
          var s;
          this.subscriptions = (function() {
            var i, len, ref, results;
            ref = this.subscriptions;
            results = [];
            for (i = 0, len = ref.length; i < len; i++) {
              s = ref[i];
              if (s !== subscription) {
                results.push(s);
              }
            }
            return results;
          }).call(this);
          return subscription;
        };

        Subscriptions.prototype.findAll = function(identifier) {
          var i, len, ref, results, s;
          ref = this.subscriptions;
          results = [];
          for (i = 0, len = ref.length; i < len; i++) {
            s = ref[i];
            if (s.identifier === identifier) {
              results.push(s);
            }
          }
          return results;
        };

        Subscriptions.prototype.reload = function() {
          var i, len, ref, results, subscription;
          ref = this.subscriptions;
          results = [];
          for (i = 0, len = ref.length; i < len; i++) {
            subscription = ref[i];
            results.push(this.sendCommand(subscription, "subscribe"));
          }
          return results;
        };

        Subscriptions.prototype.notifyAll = function() {
          var args, callbackName, i, len, ref, results, subscription;
          callbackName = arguments[0], args = 2 <= arguments.length ? slice.call(arguments, 1) : [];
          ref = this.subscriptions;
          results = [];
          for (i = 0, len = ref.length; i < len; i++) {
            subscription = ref[i];
            results.push(this.notify.apply(this, [subscription, callbackName].concat(slice.call(args))));
          }
          return results;
        };

        Subscriptions.prototype.notify = function() {
          var args, callbackName, i, len, results, subscription, subscriptions;
          subscription = arguments[0], callbackName = arguments[1], args = 3 <= arguments.length ? slice.call(arguments, 2) : [];
          if (typeof subscription === "string") {
            subscriptions = this.findAll(subscription);
          } else {
            subscriptions = [subscription];
          }
          results = [];
          for (i = 0, len = subscriptions.length; i < len; i++) {
            subscription = subscriptions[i];
            results.push(typeof subscription[callbackName] === "function" ? subscription[callbackName].apply(subscription, args) : void 0);
          }
          return results;
        };

        Subscriptions.prototype.sendCommand = function(subscription, command) {
          var identifier;
          identifier = subscription.identifier;
          return this.consumer.send({
            command: command,
            identifier: identifier
          });
        };

        return Subscriptions;

      })();

    }).call(this);
    (function() {
      ActionCable.Subscription = (function() {
        var extend;

        function Subscription(consumer, params, mixin) {
          this.consumer = consumer;
          if (params == null) {
            params = {};
          }
          this.identifier = JSON.stringify(params);
          extend(this, mixin);
        }

        Subscription.prototype.perform = function(action, data) {
          if (data == null) {
            data = {};
          }
          data.action = action;
          return this.send(data);
        };

        Subscription.prototype.send = function(data) {
          return this.consumer.send({
            command: "message",
            identifier: this.identifier,
            data: JSON.stringify(data)
          });
        };

        Subscription.prototype.unsubscribe = function() {
          return this.consumer.subscriptions.remove(this);
        };

        extend = function(object, properties) {
          var key, value;
          if (properties != null) {
            for (key in properties) {
              value = properties[key];
              object[key] = value;
            }
          }
          return object;
        };

        return Subscription;

      })();

    }).call(this);
    (function() {
      ActionCable.Consumer = (function() {
        function Consumer(url) {
          this.url = url;
          this.subscriptions = new ActionCable.Subscriptions(this);
          this.connection = new ActionCable.Connection(this);
        }

        Consumer.prototype.send = function(data) {
          return this.connection.send(data);
        };

        Consumer.prototype.connect = function() {
          return this.connection.open();
        };

        Consumer.prototype.disconnect = function() {
          return this.connection.close({
            allowReconnect: false
          });
        };

        Consumer.prototype.ensureActiveConnection = function() {
          if (!this.connection.isActive()) {
            return this.connection.open();
          }
        };

        return Consumer;

      })();

    }).call(this);
  }).call(this);

  if (typeof module === "object" && module.exports) {
    module.exports = ActionCable;
  } else if (typeof define === "function" && define.amd) {
    define(ActionCable);
  }
}).call(this);
// Action Cable provides the framework to deal with WebSockets in Rails.
// You can generate new channels where WebSocket features live using the `rails generate channel` command.
//




(function() {
  this.App || (this.App = {});

  App.cable = ActionCable.createConsumer();

}).call(this);
// Define settings for the uploader
var CLOUDINARY_PRESET_NAME = 'ctpreset';
var CLOUDINARY_RETRIEVE_URL = 'https://res.cloudinary.com/andrewburns';
var CLOUDINARY_UPLOAD_URL = 'https://api.cloudinary.com/v1_1/andrewburns/image/upload';


// Define the image uploader
function cloudinaryImageUploader(dialog) {
    var image, xhr, xhrComplete, xhrProgress;

    // Set up the event handlers
    dialog.addEventListener('imageuploader.cancelupload', function () {
        // Cancel the current upload
        // Stop the upload
        if (xhr) {
            xhr.upload.removeEventListener('progress', xhrProgress);
            xhr.removeEventListener('readystatechange', xhrComplete);
            xhr.abort();
        }

        // Set the dialog to empty
        dialog.state('empty');
    });

    dialog.addEventListener('imageuploader.clear', function () {
        // Clear the current image
        dialog.clear();
        image = null;
    });
    dialog.addEventListener('imageuploader.fileready', function (ev) {
        // Upload a file to Cloudinary
        var formData;
        var file = ev.detail().file;

        // Define functions to handle upload progress and completion
        function xhrProgress(ev) {
            // Set the progress for the upload
            dialog.progress((ev.loaded / ev.total) * 100);
        }

        function xhrComplete(ev) {
            var response;

            // Check the request is complete
            if (ev.target.readyState != 4) {
                return;
            }

            // Clear the request
            xhr = null
            xhrProgress = null
            xhrComplete = null

            // Handle the result of the upload
            if (parseInt(ev.target.status) == 200) {
                // Unpack the response (from JSON)
                response = JSON.parse(ev.target.responseText);

                // Store the image details
                image = {
                    angle: 0,
                    height: parseInt(response.height),
                    maxWidth: parseInt(response.width),
                    width: parseInt(response.width)
                };

                // Apply a draft size to the image for editing
                image.filename = parseCloudinaryURL(response.url)[0];
                image.url = buildCloudinaryURL(
                    image.filename,
                    [{c: 'fit', h: 600, w: 600}]
                );

                // Populate the dialog
                dialog.populate(image.url, [image.width, image.height]);

            } else {
                // The request failed, notify the user
                new ContentTools.FlashUI('no');
            }
        }

        // Set the dialog state to uploading and reset the progress bar to 0
        dialog.state('uploading');
        dialog.progress(0);
        // Build the form data to post to the server
        formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', CLOUDINARY_PRESET_NAME);

        // Make the request
        xhr = new XMLHttpRequest();
        xhr.upload.addEventListener('progress', xhrProgress);
        xhr.addEventListener('readystatechange', xhrComplete);
        xhr.open('POST', CLOUDINARY_UPLOAD_URL, true);
        xhr.send(formData);

    });
    function rotate(angle) {
        // Handle a request by the user to rotate the image
        var height, transforms, width;

        // Update the angle of the image
        image.angle += angle;

        // Stay within 0-360 degree range
        if (image.angle < 0) {
            image.angle += 360;
        } else if (image.angle > 270) {
            image.angle -= 360;
        }

        // Rotate the image's dimensions
        width = image.width;
        height = image.height;
        image.width = height;
        image.height = width;
        image.maxWidth = width;

        // Build the transform to rotate the image
        transforms = [{c: 'fit', h: 600, w: 600}];
        if (image.angle > 0) {
            transforms.unshift({a: image.angle});
        }

        // Build a URL for the transformed image
        image.url = buildCloudinaryURL(image.filename, transforms);

        // Update the image in the dialog
        dialog.populate(image.url, [image.width, image.height]);
    }

    dialog.addEventListener(
        'imageuploader.rotateccw',
        function () { rotate(-90); }
    );
    dialog.addEventListener(
        'imageUploader.rotatecw',
        function () { rotate(90); }
    );
    dialog.addEventListener('imageuploader.save', function () {
        // Handle a user saving an image
        var cropRegion, cropTransform, imageAttrs, ratio, transforms;

        // Build a list of transforms
        transforms = [];

        // Angle
        if (image.angle != 0) {
            transforms.push({a: image.angle});
        }

        // Crop
        cropRegion = dialog.cropRegion();
        if (cropRegion.toString() != [0, 0, 1, 1].toString()) {
            cropTransform = {
                c: 'crop',
                x: parseInt(image.width * cropRegion[1]),
                y: parseInt(image.height * cropRegion[0]),
                w: parseInt(image.width * (cropRegion[3] - cropRegion[1])),
                h: parseInt(image.height * (cropRegion[2] - cropRegion[0]))
            };
            transforms.push(cropTransform);

            // Update the image size based on the crop
            image.width = cropTransform.w;
            image.height = cropTransform.h;
            image.maxWidth = cropTransform.w;
        }

        // Resize (the image is inserted in the page at a default size)
        if (image.width > 400 || image.height > 400) {
            transforms.push({c: 'fit', w: 400, h: 400});

            // Update the size of the image in-line with the resize
            ratio = Math.min(400 / image.width, 400 / image.height);
            image.width *= ratio;
            image.height *= ratio;
        }

        // Build a URL for the image we'll insert
        image.url = buildCloudinaryURL(image.filename, transforms);

        // Build attributes for the image
        imageAttrs = {'alt': '', 'data-ce-max-width': image.maxWidth};

        // Save/insert the image
        dialog.save(image.url, [image.width, image.height]);
    });
    // Capture image resize events and update the Cloudinary URL
    ContentEdit.Root.get().bind('taint', function (element) {
        var args, filename, newSize, transforms, url;

        // Check the element tainted is an image
        if (element.type() != 'Image') {
            return;
        }

        // Parse the existing URL
        args = parseCloudinaryURL(element.attr('src'));
        filename = args[0];
        transforms = args[1];

        // If no filename is found then exit (not a Cloudinary image)
        if (!filename) {
            return;
        }

        // Remove any existing resize transform
        if (transforms.length > 0 &&
            transforms[transforms.length -1]['c'] == 'fill') {
            transforms.pop();
        }

        // Change the resize transform for the element
        transforms.push({c: 'fill', w: element.size()[0], h: element.size()[1]});
        url = buildCloudinaryURL(filename, transforms);
        if (url != element.attr('src')) {
            element.attr('src', url);
        }
    });
}

function buildCloudinaryURL(filename, transforms) {
    // Build a Cloudinary URL from a filename and the list of transforms
    // supplied. Transforms should be specified as objects (e.g {a: 90} becomes
    // 'a_90').
    var i, name, transform, transformArgs, transformPaths, urlParts;

    // Convert the transforms to paths
    transformPaths = [];
    for  (i = 0; i < transforms.length; i++) {
        transform = transforms[i];

        // Convert each of the object properties to a transform argument
        transformArgs = [];
        for (name in transform) {
            if (transform.hasOwnProperty(name)) {
                transformArgs.push(name + '_' + transform[name]);
            }
        }

        transformPaths.push(transformArgs.join(','));
    }

    // Build the URL
    urlParts = [CLOUDINARY_RETRIEVE_URL];
    if (transformPaths.length > 0) {
        urlParts.push(transformPaths.join('/'));
    }
    urlParts.push(filename);

    return urlParts.join('/');
}

function parseCloudinaryURL(url) {
    // Parse a Cloudinary URL and return the filename and list of transforms
    var filename, i, j, transform, transformArgs, transforms, urlParts;

    // Strip the URL down to just the transforms, version (optional) and
    // filename.
    url = url.replace(CLOUDINARY_RETRIEVE_URL, '');

    // Split the remaining path into parts
    urlParts = url.split('/');

    // The path starts with a '/' so the first part will be empty and can be
    // discarded.
    urlParts.shift();

    // Extract the filename
    filename = urlParts.pop();

    // Strip any version number from the URL
    if (urlParts.length > 0 && urlParts[urlParts.length - 1].match(/v\d+/)) {
        urlParts.pop();
    }

    // Convert the remaining parts into transforms (e.g `w_90,h_90,c_fit >
    // {w: 90, h: 90, c: 'fit'}`).
    transforms = [];
    for (i = 0; i < urlParts.length; i++) {
        transformArgs = urlParts[i].split(',');
        transform = {};
        for (j = 0; j < transformArgs.length; j++) {
            transform[transformArgs[j].split('_')[0]] =
                transformArgs[j].split('_')[1];
        }
        transforms.push(transform);
    }

    return [filename, transforms];
}

window.addEventListener('load', function() {
    var editor;
    ContentTools.StylePalette.add([
        new ContentTools.Style('Author', 'author', ['p'])
    ]);
    editor = ContentTools.EditorApp.get();
    editor.init('*[data-editable]', 'data-name');
    ContentTools.IMAGE_UPLOADER = cloudinaryImageUploader;


    editor.addEventListener('saved', function (ev) {
        var regions;

        // Check that something changed
        regions = ev.detail().regions;
        if (Object.keys(regions).length == 0) {
            return;
        }

        // Set the editor as busy while we save our changes
        this.busy(true);

        var title = document.getElementById('post_title');
        title.value = document.getElementById('post-title-block').textContent;

        var content = document.getElementById('post_content');
        content.value = regions['main-content'];

        var status = document.getElementById('status');
        console.log(status);

        $('#postsubmit').submit();

        // Send the update content to the server to be saved
        function onStateChange(ev) {
            // Check if the request is finished
            if (ev.target.readyState == 4) {
                editor.busy(false);
                if (ev.target.status == '200') {
                    // Save was successful, notify the user with a flash
                    new ContentTools.FlashUI('ok');
                } else {
                    // Save failed, notify the user with a flash
                    new ContentTools.FlashUI('no');
                }
            }
        }

    });


});



(function() {
  var FSM, exports;

  FSM = {};

  FSM.Machine = (function() {
    function Machine(context) {
      this.context = context;
      this._stateTransitions = {};
      this._stateTransitionsAny = {};
      this._defaultTransition = null;
      this._initialState = null;
      this._currentState = null;
    }

    Machine.prototype.addTransition = function(action, state, nextState, callback) {
      if (!nextState) {
        nextState = state;
      }
      return this._stateTransitions[[action, state]] = [nextState, callback];
    };

    Machine.prototype.addTransitions = function(actions, state, nextState, callback) {
      var action, _i, _len, _results;
      if (!nextState) {
        nextState = state;
      }
      _results = [];
      for (_i = 0, _len = actions.length; _i < _len; _i++) {
        action = actions[_i];
        _results.push(this.addTransition(action, state, nextState, callback));
      }
      return _results;
    };

    Machine.prototype.addTransitionAny = function(state, nextState, callback) {
      if (!nextState) {
        nextState = state;
      }
      return this._stateTransitionsAny[state] = [nextState, callback];
    };

    Machine.prototype.setDefaultTransition = function(state, callback) {
      return this._defaultTransition = [state, callback];
    };

    Machine.prototype.getTransition = function(action, state) {
      if (this._stateTransitions[[action, state]]) {
        return this._stateTransitions[[action, state]];
      } else if (this._stateTransitionsAny[state]) {
        return this._stateTransitionsAny[state];
      } else if (this._defaultTransition) {
        return this._defaultTransition;
      }
      throw new Error("Transition is undefined: (" + action + ", " + state + ")");
    };

    Machine.prototype.getCurrentState = function() {
      return this._currentState;
    };

    Machine.prototype.setInitialState = function(state) {
      this._initialState = state;
      if (!this._currentState) {
        return this.reset();
      }
    };

    Machine.prototype.reset = function() {
      return this._currentState = this._initialState;
    };

    Machine.prototype.process = function(action) {
      var result;
      result = this.getTransition(action, this._currentState);
      if (result[1]) {
        result[1].call(this.context || (this.context = this), action);
      }
      return this._currentState = result[0];
    };

    return Machine;

  })();

  if (typeof window !== 'undefined') {
    window.FSM = FSM;
  }

  if (typeof module !== 'undefined' && module.exports) {
    exports = module.exports = FSM;
  }

}).call(this);

(function() {
  var ALPHA_CHARS, ALPHA_NUMERIC_CHARS, ATTR_DELIM, ATTR_ENTITY_DOUBLE_DELIM, ATTR_ENTITY_NO_DELIM, ATTR_ENTITY_SINGLE_DELIM, ATTR_NAME, ATTR_NAME_CHARS, ATTR_NAME_FIND_VALUE, ATTR_OR_TAG_END, ATTR_VALUE_DOUBLE_DELIM, ATTR_VALUE_NO_DELIM, ATTR_VALUE_SINGLE_DELIM, CHAR_OR_ENTITY_OR_TAG, CLOSING_TAG, ENTITY, ENTITY_CHARS, HTMLString, OPENING_TAG, OPENNING_OR_CLOSING_TAG, TAG_NAME_CHARS, TAG_NAME_CLOSING, TAG_NAME_MUST_CLOSE, TAG_NAME_OPENING, TAG_OPENING_SELF_CLOSING, exports, _Parser,
    __slice = [].slice,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  HTMLString = {};

  if (typeof window !== 'undefined') {
    window.HTMLString = HTMLString;
  }

  if (typeof module !== 'undefined' && module.exports) {
    exports = module.exports = HTMLString;
  }

  HTMLString.String = (function() {
    String._parser = null;

    function String(html, preserveWhitespace) {
      if (preserveWhitespace == null) {
        preserveWhitespace = false;
      }
      this._preserveWhitespace = preserveWhitespace;
      if (html) {
        if (HTMLString.String._parser === null) {
          HTMLString.String._parser = new _Parser();
        }
        this.characters = HTMLString.String._parser.parse(html, this._preserveWhitespace).characters;
      } else {
        this.characters = [];
      }
    }

    String.prototype.isWhitespace = function() {
      var c, _i, _len, _ref;
      _ref = this.characters;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        c = _ref[_i];
        if (!c.isWhitespace()) {
          return false;
        }
      }
      return true;
    };

    String.prototype.length = function() {
      return this.characters.length;
    };

    String.prototype.preserveWhitespace = function() {
      return this._preserveWhitespace;
    };

    String.prototype.capitalize = function() {
      var c, newString;
      newString = this.copy();
      if (newString.length()) {
        c = newString.characters[0]._c.toUpperCase();
        newString.characters[0]._c = c;
      }
      return newString;
    };

    String.prototype.charAt = function(index) {
      return this.characters[index].copy();
    };

    String.prototype.concat = function() {
      var c, indexChar, inheritFormat, inheritedTags, newString, string, strings, tail, _i, _j, _k, _l, _len, _len1, _len2, _ref, _ref1;
      strings = 2 <= arguments.length ? __slice.call(arguments, 0, _i = arguments.length - 1) : (_i = 0, []), inheritFormat = arguments[_i++];
      if (!(typeof inheritFormat === 'undefined' || typeof inheritFormat === 'boolean')) {
        strings.push(inheritFormat);
        inheritFormat = true;
      }
      newString = this.copy();
      for (_j = 0, _len = strings.length; _j < _len; _j++) {
        string = strings[_j];
        if (string.length === 0) {
          continue;
        }
        tail = string;
        if (typeof string === 'string') {
          tail = new HTMLString.String(string, this._preserveWhitespace);
        }
        if (inheritFormat && newString.length()) {
          indexChar = newString.charAt(newString.length() - 1);
          inheritedTags = indexChar.tags();
          if (indexChar.isTag()) {
            inheritedTags.shift();
          }
          if (typeof string !== 'string') {
            tail = tail.copy();
          }
          _ref = tail.characters;
          for (_k = 0, _len1 = _ref.length; _k < _len1; _k++) {
            c = _ref[_k];
            c.addTags.apply(c, inheritedTags);
          }
        }
        _ref1 = tail.characters;
        for (_l = 0, _len2 = _ref1.length; _l < _len2; _l++) {
          c = _ref1[_l];
          newString.characters.push(c);
        }
      }
      return newString;
    };

    String.prototype.contains = function(substring) {
      var c, found, from, i, _i, _len, _ref;
      if (typeof substring === 'string') {
        return this.text().indexOf(substring) > -1;
      }
      from = 0;
      while (from <= (this.length() - substring.length())) {
        found = true;
        _ref = substring.characters;
        for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
          c = _ref[i];
          if (!c.eq(this.characters[i + from])) {
            found = false;
            break;
          }
        }
        if (found) {
          return true;
        }
        from++;
      }
      return false;
    };

    String.prototype.endsWith = function(substring) {
      var c, characters, i, _i, _len, _ref;
      if (typeof substring === 'string') {
        return substring === '' || this.text().slice(-substring.length) === substring;
      }
      characters = this.characters.slice().reverse();
      _ref = substring.characters.slice().reverse();
      for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
        c = _ref[i];
        if (!c.eq(characters[i])) {
          return false;
        }
      }
      return true;
    };

    String.prototype.format = function() {
      var c, from, i, newString, tags, to, _i;
      from = arguments[0], to = arguments[1], tags = 3 <= arguments.length ? __slice.call(arguments, 2) : [];
      if (to < 0) {
        to = this.length() + to + 1;
      }
      if (from < 0) {
        from = this.length() + from;
      }
      newString = this.copy();
      for (i = _i = from; from <= to ? _i < to : _i > to; i = from <= to ? ++_i : --_i) {
        c = newString.characters[i];
        c.addTags.apply(c, tags);
      }
      return newString;
    };

    String.prototype.hasTags = function() {
      var c, found, strict, tags, _i, _j, _len, _ref;
      tags = 2 <= arguments.length ? __slice.call(arguments, 0, _i = arguments.length - 1) : (_i = 0, []), strict = arguments[_i++];
      if (!(typeof strict === 'undefined' || typeof strict === 'boolean')) {
        tags.push(strict);
        strict = false;
      }
      found = false;
      _ref = this.characters;
      for (_j = 0, _len = _ref.length; _j < _len; _j++) {
        c = _ref[_j];
        if (c.hasTags.apply(c, tags)) {
          found = true;
        } else {
          if (strict) {
            return false;
          }
        }
      }
      return found;
    };

    String.prototype.html = function() {
      var c, closingTag, closingTags, head, html, openHeads, openTag, openTags, tag, _i, _j, _k, _l, _len, _len1, _len2, _len3, _len4, _m, _ref, _ref1, _ref2, _ref3;
      html = '';
      openTags = [];
      openHeads = [];
      closingTags = [];
      _ref = this.characters;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        c = _ref[_i];
        closingTags = [];
        _ref1 = openTags.slice().reverse();
        for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
          openTag = _ref1[_j];
          closingTags.push(openTag);
          if (!c.hasTags(openTag)) {
            for (_k = 0, _len2 = closingTags.length; _k < _len2; _k++) {
              closingTag = closingTags[_k];
              html += closingTag.tail();
              openTags.pop();
              openHeads.pop();
            }
            closingTags = [];
          }
        }
        _ref2 = c._tags;
        for (_l = 0, _len3 = _ref2.length; _l < _len3; _l++) {
          tag = _ref2[_l];
          if (openHeads.indexOf(tag.head()) === -1) {
            if (!tag.selfClosing()) {
              head = tag.head();
              html += head;
              openTags.push(tag);
              openHeads.push(head);
            }
          }
        }
        if (c._tags.length > 0 && c._tags[0].selfClosing()) {
          html += c._tags[0].head();
        }
        html += c.c();
      }
      _ref3 = openTags.reverse();
      for (_m = 0, _len4 = _ref3.length; _m < _len4; _m++) {
        tag = _ref3[_m];
        html += tag.tail();
      }
      return html;
    };

    String.prototype.indexOf = function(substring, from) {
      var c, found, i, _i, _len, _ref;
      if (from == null) {
        from = 0;
      }
      if (from < 0) {
        from = 0;
      }
      if (typeof substring === 'string') {
        return this.text().indexOf(substring, from);
      }
      while (from <= (this.length() - substring.length())) {
        found = true;
        _ref = substring.characters;
        for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
          c = _ref[i];
          if (!c.eq(this.characters[i + from])) {
            found = false;
            break;
          }
        }
        if (found) {
          return from;
        }
        from++;
      }
      return -1;
    };

    String.prototype.insert = function(index, substring, inheritFormat) {
      var c, head, indexChar, inheritedTags, middle, newString, tail, _i, _j, _k, _len, _len1, _len2, _ref, _ref1, _ref2;
      if (inheritFormat == null) {
        inheritFormat = true;
      }
      head = this.slice(0, index);
      tail = this.slice(index);
      if (index < 0) {
        index = this.length() + index;
      }
      middle = substring;
      if (typeof substring === 'string') {
        middle = new HTMLString.String(substring, this._preserveWhitespace);
      }
      if (inheritFormat && index > 0) {
        indexChar = this.charAt(index - 1);
        inheritedTags = indexChar.tags();
        if (indexChar.isTag()) {
          inheritedTags.shift();
        }
        if (typeof substring !== 'string') {
          middle = middle.copy();
        }
        _ref = middle.characters;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          c = _ref[_i];
          c.addTags.apply(c, inheritedTags);
        }
      }
      newString = head;
      _ref1 = middle.characters;
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        c = _ref1[_j];
        newString.characters.push(c);
      }
      _ref2 = tail.characters;
      for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
        c = _ref2[_k];
        newString.characters.push(c);
      }
      return newString;
    };

    String.prototype.lastIndexOf = function(substring, from) {
      var c, characters, found, i, skip, _i, _j, _len, _len1;
      if (from == null) {
        from = 0;
      }
      if (from < 0) {
        from = 0;
      }
      characters = this.characters.slice(from).reverse();
      from = 0;
      if (typeof substring === 'string') {
        if (!this.contains(substring)) {
          return -1;
        }
        substring = substring.split('').reverse();
        while (from <= (characters.length - substring.length)) {
          found = true;
          skip = 0;
          for (i = _i = 0, _len = substring.length; _i < _len; i = ++_i) {
            c = substring[i];
            if (characters[i + from].isTag()) {
              skip += 1;
            }
            if (c !== characters[skip + i + from].c()) {
              found = false;
              break;
            }
          }
          if (found) {
            return from;
          }
          from++;
        }
        return -1;
      }
      substring = substring.characters.slice().reverse();
      while (from <= (characters.length - substring.length)) {
        found = true;
        for (i = _j = 0, _len1 = substring.length; _j < _len1; i = ++_j) {
          c = substring[i];
          if (!c.eq(characters[i + from])) {
            found = false;
            break;
          }
        }
        if (found) {
          return from;
        }
        from++;
      }
      return -1;
    };

    String.prototype.optimize = function() {
      var c, closingTag, closingTags, head, lastC, len, openHeads, openTag, openTags, runLength, runLengthSort, runLengths, run_length, t, tag, _i, _j, _k, _l, _len, _len1, _len2, _len3, _len4, _len5, _len6, _m, _n, _o, _ref, _ref1, _ref2, _ref3, _ref4, _ref5, _results;
      openTags = [];
      openHeads = [];
      lastC = null;
      _ref = this.characters.slice().reverse();
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        c = _ref[_i];
        c._runLengthMap = {};
        c._runLengthMapSize = 0;
        closingTags = [];
        _ref1 = openTags.slice().reverse();
        for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
          openTag = _ref1[_j];
          closingTags.push(openTag);
          if (!c.hasTags(openTag)) {
            for (_k = 0, _len2 = closingTags.length; _k < _len2; _k++) {
              closingTag = closingTags[_k];
              openTags.pop();
              openHeads.pop();
            }
            closingTags = [];
          }
        }
        _ref2 = c._tags;
        for (_l = 0, _len3 = _ref2.length; _l < _len3; _l++) {
          tag = _ref2[_l];
          if (openHeads.indexOf(tag.head()) === -1) {
            if (!tag.selfClosing()) {
              openTags.push(tag);
              openHeads.push(tag.head());
            }
          }
        }
        for (_m = 0, _len4 = openTags.length; _m < _len4; _m++) {
          tag = openTags[_m];
          head = tag.head();
          if (!lastC) {
            c._runLengthMap[head] = [tag, 1];
            continue;
          }
          if (!c._runLengthMap[head]) {
            c._runLengthMap[head] = [tag, 0];
          }
          run_length = 0;
          if (lastC._runLengthMap[head]) {
            run_length = lastC._runLengthMap[head][1];
          }
          c._runLengthMap[head][1] = run_length + 1;
        }
        lastC = c;
      }
      runLengthSort = function(a, b) {
        return b[1] - a[1];
      };
      _ref3 = this.characters;
      _results = [];
      for (_n = 0, _len5 = _ref3.length; _n < _len5; _n++) {
        c = _ref3[_n];
        len = c._tags.length;
        if ((len > 0 && c._tags[0].selfClosing() && len < 3) || len < 2) {
          continue;
        }
        runLengths = [];
        _ref4 = c._runLengthMap;
        for (tag in _ref4) {
          runLength = _ref4[tag];
          runLengths.push(runLength);
        }
        runLengths.sort(runLengthSort);
        _ref5 = c._tags.slice();
        for (_o = 0, _len6 = _ref5.length; _o < _len6; _o++) {
          tag = _ref5[_o];
          if (!tag.selfClosing()) {
            c.removeTags(tag);
          }
        }
        _results.push(c.addTags.apply(c, (function() {
          var _len7, _p, _results1;
          _results1 = [];
          for (_p = 0, _len7 = runLengths.length; _p < _len7; _p++) {
            t = runLengths[_p];
            _results1.push(t[0]);
          }
          return _results1;
        })()));
      }
      return _results;
    };

    String.prototype.slice = function(from, to) {
      var c, newString;
      newString = new HTMLString.String('', this._preserveWhitespace);
      newString.characters = (function() {
        var _i, _len, _ref, _results;
        _ref = this.characters.slice(from, to);
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          c = _ref[_i];
          _results.push(c.copy());
        }
        return _results;
      }).call(this);
      return newString;
    };

    String.prototype.split = function(separator, limit) {
      var count, end, i, index, indexes, lastIndex, start, substrings, _i, _ref;
      if (separator == null) {
        separator = '';
      }
      if (limit == null) {
        limit = 0;
      }
      lastIndex = 0;
      count = 0;
      indexes = [0];
      while (true) {
        if (limit > 0 && count > limit) {
          break;
        }
        index = this.indexOf(separator, lastIndex);
        if (index === -1) {
          break;
        }
        indexes.push(index);
        lastIndex = index + 1;
      }
      indexes.push(this.length());
      substrings = [];
      for (i = _i = 0, _ref = indexes.length - 2; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
        start = indexes[i];
        if (i > 0) {
          start += 1;
        }
        end = indexes[i + 1];
        substrings.push(this.slice(start, end));
      }
      return substrings;
    };

    String.prototype.startsWith = function(substring) {
      var c, i, _i, _len, _ref;
      if (typeof substring === 'string') {
        return this.text().slice(0, substring.length) === substring;
      }
      _ref = substring.characters;
      for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
        c = _ref[i];
        if (!c.eq(this.characters[i])) {
          return false;
        }
      }
      return true;
    };

    String.prototype.substr = function(from, length) {
      if (length <= 0) {
        return new HTMLString.String('', this._preserveWhitespace);
      }
      if (from < 0) {
        from = this.length() + from;
      }
      if (length === void 0) {
        length = this.length() - from;
      }
      return this.slice(from, from + length);
    };

    String.prototype.substring = function(from, to) {
      if (to === void 0) {
        to = this.length();
      }
      return this.slice(from, to);
    };

    String.prototype.text = function() {
      var c, text, _i, _len, _ref;
      text = '';
      _ref = this.characters;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        c = _ref[_i];
        if (c.isTag()) {
          if (c.isTag('br')) {
            text += '\n';
          }
          continue;
        }
        if (c.c() === '&nbsp;') {
          text += c.c();
          continue;
        }
        text += c.c();
      }
      return this.constructor.decode(text);
    };

    String.prototype.toLowerCase = function() {
      var c, newString, _i, _len, _ref;
      newString = this.copy();
      _ref = newString.characters;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        c = _ref[_i];
        if (c._c.length === 1) {
          c._c = c._c.toLowerCase();
        }
      }
      return newString;
    };

    String.prototype.toUpperCase = function() {
      var c, newString, _i, _len, _ref;
      newString = this.copy();
      _ref = newString.characters;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        c = _ref[_i];
        if (c._c.length === 1) {
          c._c = c._c.toUpperCase();
        }
      }
      return newString;
    };

    String.prototype.trim = function() {
      var c, from, newString, to, _i, _j, _len, _len1, _ref, _ref1;
      _ref = this.characters;
      for (from = _i = 0, _len = _ref.length; _i < _len; from = ++_i) {
        c = _ref[from];
        if (!c.isWhitespace()) {
          break;
        }
      }
      _ref1 = this.characters.slice().reverse();
      for (to = _j = 0, _len1 = _ref1.length; _j < _len1; to = ++_j) {
        c = _ref1[to];
        if (!c.isWhitespace()) {
          break;
        }
      }
      to = this.length() - to - 1;
      newString = new HTMLString.String('', this._preserveWhitespace);
      newString.characters = (function() {
        var _k, _len2, _ref2, _results;
        _ref2 = this.characters.slice(from, +to + 1 || 9e9);
        _results = [];
        for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
          c = _ref2[_k];
          _results.push(c.copy());
        }
        return _results;
      }).call(this);
      return newString;
    };

    String.prototype.trimLeft = function() {
      var c, from, newString, to, _i, _len, _ref;
      to = this.length() - 1;
      _ref = this.characters;
      for (from = _i = 0, _len = _ref.length; _i < _len; from = ++_i) {
        c = _ref[from];
        if (!c.isWhitespace()) {
          break;
        }
      }
      newString = new HTMLString.String('', this._preserveWhitespace);
      newString.characters = (function() {
        var _j, _len1, _ref1, _results;
        _ref1 = this.characters.slice(from, +to + 1 || 9e9);
        _results = [];
        for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
          c = _ref1[_j];
          _results.push(c.copy());
        }
        return _results;
      }).call(this);
      return newString;
    };

    String.prototype.trimRight = function() {
      var c, from, newString, to, _i, _len, _ref;
      from = 0;
      _ref = this.characters.slice().reverse();
      for (to = _i = 0, _len = _ref.length; _i < _len; to = ++_i) {
        c = _ref[to];
        if (!c.isWhitespace()) {
          break;
        }
      }
      to = this.length() - to - 1;
      newString = new HTMLString.String('', this._preserveWhitespace);
      newString.characters = (function() {
        var _j, _len1, _ref1, _results;
        _ref1 = this.characters.slice(from, +to + 1 || 9e9);
        _results = [];
        for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
          c = _ref1[_j];
          _results.push(c.copy());
        }
        return _results;
      }).call(this);
      return newString;
    };

    String.prototype.unformat = function() {
      var c, from, i, newString, tags, to, _i;
      from = arguments[0], to = arguments[1], tags = 3 <= arguments.length ? __slice.call(arguments, 2) : [];
      if (to < 0) {
        to = this.length() + to + 1;
      }
      if (from < 0) {
        from = this.length() + from;
      }
      newString = this.copy();
      for (i = _i = from; from <= to ? _i < to : _i > to; i = from <= to ? ++_i : --_i) {
        c = newString.characters[i];
        c.removeTags.apply(c, tags);
      }
      return newString;
    };

    String.prototype.copy = function() {
      var c, stringCopy;
      stringCopy = new HTMLString.String('', this._preserveWhitespace);
      stringCopy.characters = (function() {
        var _i, _len, _ref, _results;
        _ref = this.characters;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          c = _ref[_i];
          _results.push(c.copy());
        }
        return _results;
      }).call(this);
      return stringCopy;
    };

    String.decode = function(string) {
      var textarea;
      textarea = document.createElement('textarea');
      textarea.innerHTML = string;
      return textarea.textContent;
    };

    String.encode = function(string) {
      var textarea;
      textarea = document.createElement('textarea');
      textarea.textContent = string;
      return textarea.innerHTML;
    };

    String.join = function(separator, strings) {
      var joined, s, _i, _len;
      joined = strings.shift();
      for (_i = 0, _len = strings.length; _i < _len; _i++) {
        s = strings[_i];
        joined = joined.concat(separator, s);
      }
      return joined;
    };

    return String;

  })();

  ALPHA_CHARS = 'AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz-_$'.split('');

  ALPHA_NUMERIC_CHARS = ALPHA_CHARS.concat('1234567890'.split(''));

  ATTR_NAME_CHARS = ALPHA_NUMERIC_CHARS.concat([':']);

  ENTITY_CHARS = ALPHA_NUMERIC_CHARS.concat(['#']);

  TAG_NAME_CHARS = ALPHA_NUMERIC_CHARS.concat([':']);

  CHAR_OR_ENTITY_OR_TAG = 1;

  ENTITY = 2;

  OPENNING_OR_CLOSING_TAG = 3;

  OPENING_TAG = 4;

  CLOSING_TAG = 5;

  TAG_NAME_OPENING = 6;

  TAG_NAME_CLOSING = 7;

  TAG_OPENING_SELF_CLOSING = 8;

  TAG_NAME_MUST_CLOSE = 9;

  ATTR_OR_TAG_END = 10;

  ATTR_NAME = 11;

  ATTR_NAME_FIND_VALUE = 12;

  ATTR_DELIM = 13;

  ATTR_VALUE_SINGLE_DELIM = 14;

  ATTR_VALUE_DOUBLE_DELIM = 15;

  ATTR_VALUE_NO_DELIM = 16;

  ATTR_ENTITY_NO_DELIM = 17;

  ATTR_ENTITY_SINGLE_DELIM = 18;

  ATTR_ENTITY_DOUBLE_DELIM = 19;

  _Parser = (function() {
    function _Parser() {
      this.fsm = new FSM.Machine(this);
      this.fsm.setInitialState(CHAR_OR_ENTITY_OR_TAG);
      this.fsm.addTransitionAny(CHAR_OR_ENTITY_OR_TAG, null, function(c) {
        return this._pushChar(c);
      });
      this.fsm.addTransition('<', CHAR_OR_ENTITY_OR_TAG, OPENNING_OR_CLOSING_TAG);
      this.fsm.addTransition('&', CHAR_OR_ENTITY_OR_TAG, ENTITY);
      this.fsm.addTransitions(ENTITY_CHARS, ENTITY, null, function(c) {
        return this.entity += c;
      });
      this.fsm.addTransition(';', ENTITY, CHAR_OR_ENTITY_OR_TAG, function() {
        this._pushChar("&" + this.entity + ";");
        return this.entity = '';
      });
      this.fsm.addTransitions([' ', '\n'], OPENNING_OR_CLOSING_TAG);
      this.fsm.addTransitions(ALPHA_CHARS, OPENNING_OR_CLOSING_TAG, OPENING_TAG, function() {
        return this._back();
      });
      this.fsm.addTransition('/', OPENNING_OR_CLOSING_TAG, CLOSING_TAG);
      this.fsm.addTransitions([' ', '\n'], OPENING_TAG);
      this.fsm.addTransitions(ALPHA_CHARS, OPENING_TAG, TAG_NAME_OPENING, function() {
        return this._back();
      });
      this.fsm.addTransitions([' ', '\n'], CLOSING_TAG);
      this.fsm.addTransitions(ALPHA_CHARS, CLOSING_TAG, TAG_NAME_CLOSING, function() {
        return this._back();
      });
      this.fsm.addTransitions(TAG_NAME_CHARS, TAG_NAME_OPENING, null, function(c) {
        return this.tagName += c;
      });
      this.fsm.addTransitions([' ', '\n'], TAG_NAME_OPENING, ATTR_OR_TAG_END);
      this.fsm.addTransition('/', TAG_NAME_OPENING, TAG_OPENING_SELF_CLOSING, function() {
        return this.selfClosing = true;
      });
      this.fsm.addTransition('>', TAG_NAME_OPENING, CHAR_OR_ENTITY_OR_TAG, function() {
        return this._pushTag();
      });
      this.fsm.addTransitions([' ', '\n'], TAG_OPENING_SELF_CLOSING);
      this.fsm.addTransition('>', TAG_OPENING_SELF_CLOSING, CHAR_OR_ENTITY_OR_TAG, function() {
        return this._pushTag();
      });
      this.fsm.addTransitions([' ', '\n'], ATTR_OR_TAG_END);
      this.fsm.addTransition('/', ATTR_OR_TAG_END, TAG_OPENING_SELF_CLOSING, function() {
        return this.selfClosing = true;
      });
      this.fsm.addTransition('>', ATTR_OR_TAG_END, CHAR_OR_ENTITY_OR_TAG, function() {
        return this._pushTag();
      });
      this.fsm.addTransitions(ALPHA_CHARS, ATTR_OR_TAG_END, ATTR_NAME, function() {
        return this._back();
      });
      this.fsm.addTransitions(TAG_NAME_CHARS, TAG_NAME_CLOSING, null, function(c) {
        return this.tagName += c;
      });
      this.fsm.addTransitions([' ', '\n'], TAG_NAME_CLOSING, TAG_NAME_MUST_CLOSE);
      this.fsm.addTransition('>', TAG_NAME_CLOSING, CHAR_OR_ENTITY_OR_TAG, function() {
        return this._popTag();
      });
      this.fsm.addTransitions([' ', '\n'], TAG_NAME_MUST_CLOSE);
      this.fsm.addTransition('>', TAG_NAME_MUST_CLOSE, CHAR_OR_ENTITY_OR_TAG, function() {
        return this._popTag();
      });
      this.fsm.addTransitions(ATTR_NAME_CHARS, ATTR_NAME, null, function(c) {
        return this.attributeName += c;
      });
      this.fsm.addTransitions([' ', '\n'], ATTR_NAME, ATTR_NAME_FIND_VALUE);
      this.fsm.addTransition('=', ATTR_NAME, ATTR_DELIM);
      this.fsm.addTransitions([' ', '\n'], ATTR_NAME_FIND_VALUE);
      this.fsm.addTransition('=', ATTR_NAME_FIND_VALUE, ATTR_DELIM);
      this.fsm.addTransitions('>', ATTR_NAME, ATTR_OR_TAG_END, function() {
        this._pushAttribute();
        return this._back();
      });
      this.fsm.addTransitionAny(ATTR_NAME_FIND_VALUE, ATTR_OR_TAG_END, function() {
        this._pushAttribute();
        return this._back();
      });
      this.fsm.addTransitions([' ', '\n'], ATTR_DELIM);
      this.fsm.addTransition('\'', ATTR_DELIM, ATTR_VALUE_SINGLE_DELIM);
      this.fsm.addTransition('"', ATTR_DELIM, ATTR_VALUE_DOUBLE_DELIM);
      this.fsm.addTransitions(ALPHA_NUMERIC_CHARS.concat(['&'], ATTR_DELIM, ATTR_VALUE_NO_DELIM, function() {
        return this._back();
      }));
      this.fsm.addTransition(' ', ATTR_VALUE_NO_DELIM, ATTR_OR_TAG_END, function() {
        return this._pushAttribute();
      });
      this.fsm.addTransitions(['/', '>'], ATTR_VALUE_NO_DELIM, ATTR_OR_TAG_END, function() {
        this._back();
        return this._pushAttribute();
      });
      this.fsm.addTransition('&', ATTR_VALUE_NO_DELIM, ATTR_ENTITY_NO_DELIM);
      this.fsm.addTransitionAny(ATTR_VALUE_NO_DELIM, null, function(c) {
        return this.attributeValue += c;
      });
      this.fsm.addTransition('\'', ATTR_VALUE_SINGLE_DELIM, ATTR_OR_TAG_END, function() {
        return this._pushAttribute();
      });
      this.fsm.addTransition('&', ATTR_VALUE_SINGLE_DELIM, ATTR_ENTITY_SINGLE_DELIM);
      this.fsm.addTransitionAny(ATTR_VALUE_SINGLE_DELIM, null, function(c) {
        return this.attributeValue += c;
      });
      this.fsm.addTransition('"', ATTR_VALUE_DOUBLE_DELIM, ATTR_OR_TAG_END, function() {
        return this._pushAttribute();
      });
      this.fsm.addTransition('&', ATTR_VALUE_DOUBLE_DELIM, ATTR_ENTITY_DOUBLE_DELIM);
      this.fsm.addTransitionAny(ATTR_VALUE_DOUBLE_DELIM, null, function(c) {
        return this.attributeValue += c;
      });
      this.fsm.addTransitions(ENTITY_CHARS, ATTR_ENTITY_NO_DELIM, null, function(c) {
        return this.entity += c;
      });
      this.fsm.addTransitions(ENTITY_CHARS, ATTR_ENTITY_SINGLE_DELIM, function(c) {
        return this.entity += c;
      });
      this.fsm.addTransitions(ENTITY_CHARS, ATTR_ENTITY_DOUBLE_DELIM, null, function(c) {
        return this.entity += c;
      });
      this.fsm.addTransition(';', ATTR_ENTITY_NO_DELIM, ATTR_VALUE_NO_DELIM, function() {
        this.attributeValue += "&" + this.entity + ";";
        return this.entity = '';
      });
      this.fsm.addTransition(';', ATTR_ENTITY_SINGLE_DELIM, ATTR_VALUE_SINGLE_DELIM, function() {
        this.attributeValue += "&" + this.entity + ";";
        return this.entity = '';
      });
      this.fsm.addTransition(';', ATTR_ENTITY_DOUBLE_DELIM, ATTR_VALUE_DOUBLE_DELIM, function() {
        this.attributeValue += "&" + this.entity + ";";
        return this.entity = '';
      });
    }

    _Parser.prototype._back = function() {
      return this.head--;
    };

    _Parser.prototype._pushAttribute = function() {
      this.attributes[this.attributeName] = this.attributeValue;
      this.attributeName = '';
      return this.attributeValue = '';
    };

    _Parser.prototype._pushChar = function(c) {
      var character, lastCharacter;
      character = new HTMLString.Character(c, this.tags);
      if (this._preserveWhitespace) {
        this.string.characters.push(character);
        return;
      }
      if (this.string.length() && !character.isTag() && !character.isEntity() && character.isWhitespace()) {
        lastCharacter = this.string.characters[this.string.length() - 1];
        if (lastCharacter.isWhitespace() && !lastCharacter.isTag() && !lastCharacter.isEntity()) {
          return;
        }
      }
      return this.string.characters.push(character);
    };

    _Parser.prototype._pushTag = function() {
      var tag, _ref;
      tag = new HTMLString.Tag(this.tagName, this.attributes);
      this.tags.push(tag);
      if (tag.selfClosing()) {
        this._pushChar('');
        this.tags.pop();
        if (!this.selfClosed && (_ref = this.tagName, __indexOf.call(HTMLString.Tag.SELF_CLOSING, _ref) >= 0)) {
          this.fsm.reset();
        }
      }
      this.tagName = '';
      this.selfClosed = false;
      return this.attributes = {};
    };

    _Parser.prototype._popTag = function() {
      var character, tag;
      while (true) {
        tag = this.tags.pop();
        if (this.string.length()) {
          character = this.string.characters[this.string.length() - 1];
          if (!character.isTag() && !character.isEntity() && character.isWhitespace()) {
            character.removeTags(tag);
          }
        }
        if (tag.name() === this.tagName.toLowerCase()) {
          break;
        }
      }
      return this.tagName = '';
    };

    _Parser.prototype.parse = function(html, preserveWhitespace) {
      var character, error;
      this._preserveWhitespace = preserveWhitespace;
      this.reset();
      html = this.preprocess(html);
      this.fsm.parser = this;
      while (this.head < html.length) {
        character = html[this.head];
        try {
          this.fsm.process(character);
        } catch (_error) {
          error = _error;
          throw new Error("Error at char " + this.head + " >> " + error);
        }
        this.head++;
      }
      return this.string;
    };

    _Parser.prototype.preprocess = function(html) {
      html = html.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
      html = html.replace(/<!--[\s\S]*?-->/g, '');
      if (!this._preserveWhitespace) {
        html = html.replace(/\s+/g, ' ');
      }
      return html;
    };

    _Parser.prototype.reset = function() {
      this.fsm.reset();
      this.head = 0;
      this.string = new HTMLString.String();
      this.entity = '';
      this.tags = [];
      this.tagName = '';
      this.selfClosing = false;
      this.attributes = {};
      this.attributeName = '';
      return this.attributeValue = '';
    };

    return _Parser;

  })();

  HTMLString.Tag = (function() {
    function Tag(name, attributes) {
      var k, v;
      this._name = name.toLowerCase();
      this._selfClosing = HTMLString.Tag.SELF_CLOSING[this._name] === true;
      this._head = null;
      this._attributes = {};
      for (k in attributes) {
        v = attributes[k];
        this._attributes[k] = v;
      }
    }

    Tag.SELF_CLOSING = {
      'area': true,
      'base': true,
      'br': true,
      'hr': true,
      'img': true,
      'input': true,
      'link meta': true,
      'wbr': true
    };

    Tag.prototype.head = function() {
      var components, k, v, _ref;
      if (!this._head) {
        components = [];
        _ref = this._attributes;
        for (k in _ref) {
          v = _ref[k];
          if (v) {
            components.push("" + k + "=\"" + v + "\"");
          } else {
            components.push("" + k);
          }
        }
        components.sort();
        components.unshift(this._name);
        this._head = "<" + (components.join(' ')) + ">";
      }
      return this._head;
    };

    Tag.prototype.name = function() {
      return this._name;
    };

    Tag.prototype.selfClosing = function() {
      return this._selfClosing;
    };

    Tag.prototype.tail = function() {
      if (this._selfClosing) {
        return '';
      }
      return "</" + this._name + ">";
    };

    Tag.prototype.attr = function(name, value) {
      if (value === void 0) {
        return this._attributes[name];
      }
      this._attributes[name] = value;
      return this._head = null;
    };

    Tag.prototype.removeAttr = function(name) {
      if (this._attributes[name] === void 0) {
        return;
      }
      delete this._attributes[name];
      return this._head = null;
    };

    Tag.prototype.copy = function() {
      return new HTMLString.Tag(this._name, this._attributes);
    };

    return Tag;

  })();

  HTMLString.Character = (function() {
    function Character(c, tags) {
      this._c = c;
      if (c.length > 1) {
        this._c = c.toLowerCase();
      }
      this._tags = [];
      this.addTags.apply(this, tags);
    }

    Character.prototype.c = function() {
      return this._c;
    };

    Character.prototype.isEntity = function() {
      return this._c.length > 1;
    };

    Character.prototype.isTag = function(tagName) {
      if (this._tags.length === 0 || !this._tags[0].selfClosing()) {
        return false;
      }
      if (tagName && this._tags[0].name() !== tagName) {
        return false;
      }
      return true;
    };

    Character.prototype.isWhitespace = function() {
      var _ref;
      return ((_ref = this._c) === ' ' || _ref === '\n' || _ref === '&nbsp;') || this.isTag('br');
    };

    Character.prototype.tags = function() {
      var t;
      return (function() {
        var _i, _len, _ref, _results;
        _ref = this._tags;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          t = _ref[_i];
          _results.push(t.copy());
        }
        return _results;
      }).call(this);
    };

    Character.prototype.addTags = function() {
      var tag, tags, _i, _len, _results;
      tags = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      _results = [];
      for (_i = 0, _len = tags.length; _i < _len; _i++) {
        tag = tags[_i];
        if (Array.isArray(tag)) {
          continue;
        }
        if (tag.selfClosing()) {
          if (!this.isTag()) {
            this._tags.unshift(tag.copy());
          }
          continue;
        }
        _results.push(this._tags.push(tag.copy()));
      }
      return _results;
    };

    Character.prototype.eq = function(c) {
      var tag, tags, _i, _j, _len, _len1, _ref, _ref1;
      if (this.c() !== c.c()) {
        return false;
      }
      if (this._tags.length !== c._tags.length) {
        return false;
      }
      tags = {};
      _ref = this._tags;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        tag = _ref[_i];
        tags[tag.head()] = true;
      }
      _ref1 = c._tags;
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        tag = _ref1[_j];
        if (!tags[tag.head()]) {
          return false;
        }
      }
      return true;
    };

    Character.prototype.hasTags = function() {
      var tag, tagHeads, tagNames, tags, _i, _j, _len, _len1, _ref;
      tags = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      tagNames = {};
      tagHeads = {};
      _ref = this._tags;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        tag = _ref[_i];
        tagNames[tag.name()] = true;
        tagHeads[tag.head()] = true;
      }
      for (_j = 0, _len1 = tags.length; _j < _len1; _j++) {
        tag = tags[_j];
        if (typeof tag === 'string') {
          if (tagNames[tag] === void 0) {
            return false;
          }
        } else {
          if (tagHeads[tag.head()] === void 0) {
            return false;
          }
        }
      }
      return true;
    };

    Character.prototype.removeTags = function() {
      var heads, names, newTags, tag, tags, _i, _len;
      tags = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      if (tags.length === 0) {
        this._tags = [];
        return;
      }
      names = {};
      heads = {};
      for (_i = 0, _len = tags.length; _i < _len; _i++) {
        tag = tags[_i];
        if (typeof tag === 'string') {
          names[tag] = tag;
        } else {
          heads[tag.head()] = tag;
        }
      }
      newTags = [];
      return this._tags = this._tags.filter(function(tag) {
        if (!heads[tag.head()] && !names[tag.name()]) {
          return tag;
        }
      });
    };

    Character.prototype.copy = function() {
      var t;
      return new HTMLString.Character(this._c, (function() {
        var _i, _len, _ref, _results;
        _ref = this._tags;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          t = _ref[_i];
          _results.push(t.copy());
        }
        return _results;
      }).call(this));
    };

    return Character;

  })();

}).call(this);

(function() {
  var ContentSelect, SELF_CLOSING_NODE_NAMES, exports, _containedBy, _getChildNodeAndOffset, _getNodeRange, _getOffsetOfChildNode,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  ContentSelect = {};

  ContentSelect.Range = (function() {
    function Range(from, to) {
      this.set(from, to);
    }

    Range.prototype.isCollapsed = function() {
      return this._from === this._to;
    };

    Range.prototype.span = function() {
      return this._to - this._from;
    };

    Range.prototype.collapse = function() {
      return this._to = this._from;
    };

    Range.prototype.eq = function(range) {
      return this.get()[0] === range.get()[0] && this.get()[1] === range.get()[1];
    };

    Range.prototype.get = function() {
      return [this._from, this._to];
    };

    Range.prototype.select = function(element) {
      var docRange, endNode, endNodeLen, endOffset, startNode, startNodeLen, startOffset, _ref, _ref1;
      ContentSelect.Range.unselectAll();
      docRange = document.createRange();
      _ref = _getChildNodeAndOffset(element, this._from), startNode = _ref[0], startOffset = _ref[1];
      _ref1 = _getChildNodeAndOffset(element, this._to), endNode = _ref1[0], endOffset = _ref1[1];
      startNodeLen = startNode.length || 0;
      endNodeLen = endNode.length || 0;
      docRange.setStart(startNode, Math.min(startOffset, startNodeLen));
      docRange.setEnd(endNode, Math.min(endOffset, endNodeLen));
      return window.getSelection().addRange(docRange);
    };

    Range.prototype.set = function(from, to) {
      from = Math.max(0, from);
      to = Math.max(0, to);
      this._from = Math.min(from, to);
      return this._to = Math.max(from, to);
    };

    Range.prepareElement = function(element) {
      var i, node, selfClosingNodes, _i, _len, _results;
      selfClosingNodes = element.querySelectorAll(SELF_CLOSING_NODE_NAMES.join(', '));
      _results = [];
      for (i = _i = 0, _len = selfClosingNodes.length; _i < _len; i = ++_i) {
        node = selfClosingNodes[i];
        node.parentNode.insertBefore(document.createTextNode(''), node);
        if (i < selfClosingNodes.length - 1) {
          _results.push(node.parentNode.insertBefore(document.createTextNode(''), node.nextSibling));
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    Range.query = function(element) {
      var docRange, endNode, endOffset, range, startNode, startOffset, _ref;
      range = new ContentSelect.Range(0, 0);
      try {
        docRange = window.getSelection().getRangeAt(0);
      } catch (_error) {
        return range;
      }
      if (element.firstChild === null && element.lastChild === null) {
        return range;
      }
      if (!_containedBy(docRange.startContainer, element)) {
        return range;
      }
      if (!_containedBy(docRange.endContainer, element)) {
        return range;
      }
      _ref = _getNodeRange(element, docRange), startNode = _ref[0], startOffset = _ref[1], endNode = _ref[2], endOffset = _ref[3];
      range.set(_getOffsetOfChildNode(element, startNode) + startOffset, _getOffsetOfChildNode(element, endNode) + endOffset);
      return range;
    };

    Range.rect = function() {
      var docRange, marker, rect;
      try {
        docRange = window.getSelection().getRangeAt(0);
      } catch (_error) {
        return null;
      }
      if (docRange.collapsed) {
        marker = document.createElement('span');
        docRange.insertNode(marker);
        rect = marker.getBoundingClientRect();
        marker.parentNode.removeChild(marker);
        return rect;
      } else {
        return docRange.getBoundingClientRect();
      }
    };

    Range.unselectAll = function() {
      if (window.getSelection()) {
        return window.getSelection().removeAllRanges();
      }
    };

    return Range;

  })();

  SELF_CLOSING_NODE_NAMES = ['br', 'img', 'input'];

  _containedBy = function(nodeA, nodeB) {
    while (nodeA) {
      if (nodeA === nodeB) {
        return true;
      }
      nodeA = nodeA.parentNode;
    }
    return false;
  };

  _getChildNodeAndOffset = function(parentNode, parentOffset) {
    var childNode, childOffset, childStack, n, _ref;
    if (parentNode.childNodes.length === 0) {
      return [parentNode, parentOffset];
    }
    childNode = null;
    childOffset = parentOffset;
    childStack = (function() {
      var _i, _len, _ref, _results;
      _ref = parentNode.childNodes;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        n = _ref[_i];
        _results.push(n);
      }
      return _results;
    })();
    while (childStack.length > 0) {
      childNode = childStack.shift();
      switch (childNode.nodeType) {
        case Node.TEXT_NODE:
          if (childNode.textContent.length >= childOffset) {
            return [childNode, childOffset];
          }
          childOffset -= childNode.textContent.length;
          break;
        case Node.ELEMENT_NODE:
          if (_ref = childNode.nodeName.toLowerCase(), __indexOf.call(SELF_CLOSING_NODE_NAMES, _ref) >= 0) {
            if (childOffset === 0) {
              return [childNode, 0];
            } else {
              childOffset = Math.max(0, childOffset - 1);
            }
          } else {
            if (childNode.childNodes) {
              Array.prototype.unshift.apply(childStack, (function() {
                var _i, _len, _ref1, _results;
                _ref1 = childNode.childNodes;
                _results = [];
                for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
                  n = _ref1[_i];
                  _results.push(n);
                }
                return _results;
              })());
            }
          }
      }
    }
    return [childNode, childOffset];
  };

  _getOffsetOfChildNode = function(parentNode, childNode) {
    var childStack, n, offset, otherChildNode, _ref, _ref1;
    if (parentNode.childNodes.length === 0) {
      return 0;
    }
    offset = 0;
    childStack = (function() {
      var _i, _len, _ref, _results;
      _ref = parentNode.childNodes;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        n = _ref[_i];
        _results.push(n);
      }
      return _results;
    })();
    while (childStack.length > 0) {
      otherChildNode = childStack.shift();
      if (otherChildNode === childNode) {
        if (_ref = otherChildNode.nodeName.toLowerCase(), __indexOf.call(SELF_CLOSING_NODE_NAMES, _ref) >= 0) {
          return offset + 1;
        }
        return offset;
      }
      switch (otherChildNode.nodeType) {
        case Node.TEXT_NODE:
          offset += otherChildNode.textContent.length;
          break;
        case Node.ELEMENT_NODE:
          if (_ref1 = otherChildNode.nodeName.toLowerCase(), __indexOf.call(SELF_CLOSING_NODE_NAMES, _ref1) >= 0) {
            offset += 1;
          } else {
            if (otherChildNode.childNodes) {
              Array.prototype.unshift.apply(childStack, (function() {
                var _i, _len, _ref2, _results;
                _ref2 = otherChildNode.childNodes;
                _results = [];
                for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
                  n = _ref2[_i];
                  _results.push(n);
                }
                return _results;
              })());
            }
          }
      }
    }
    return offset;
  };

  _getNodeRange = function(element, docRange) {
    var childNode, childNodes, endNode, endOffset, endRange, i, startNode, startOffset, startRange, _i, _j, _len, _len1, _ref;
    childNodes = element.childNodes;
    startRange = docRange.cloneRange();
    startRange.collapse(true);
    endRange = docRange.cloneRange();
    endRange.collapse(false);
    startNode = startRange.startContainer;
    startOffset = startRange.startOffset;
    endNode = endRange.endContainer;
    endOffset = endRange.endOffset;
    if (!startRange.comparePoint) {
      return [startNode, startOffset, endNode, endOffset];
    }
    if (startNode === element) {
      startNode = childNodes[childNodes.length - 1];
      startOffset = startNode.textContent.length;
      for (i = _i = 0, _len = childNodes.length; _i < _len; i = ++_i) {
        childNode = childNodes[i];
        if (startRange.comparePoint(childNode, 0) !== 1) {
          continue;
        }
        if (i === 0) {
          startNode = childNode;
          startOffset = 0;
        } else {
          startNode = childNodes[i - 1];
          startOffset = childNode.textContent.length;
        }
        if (_ref = startNode.nodeName.toLowerCase, __indexOf.call(SELF_CLOSING_NODE_NAMES, _ref) >= 0) {
          startOffset = 1;
        }
        break;
      }
    }
    if (docRange.collapsed) {
      return [startNode, startOffset, startNode, startOffset];
    }
    if (endNode === element) {
      endNode = childNodes[childNodes.length - 1];
      endOffset = endNode.textContent.length;
      for (i = _j = 0, _len1 = childNodes.length; _j < _len1; i = ++_j) {
        childNode = childNodes[i];
        if (endRange.comparePoint(childNode, 0) !== 1) {
          continue;
        }
        if (i === 0) {
          endNode = childNode;
        } else {
          endNode = childNodes[i - 1];
        }
        endOffset = childNode.textContent.length + 1;
      }
    }
    return [startNode, startOffset, endNode, endOffset];
  };

  if (typeof window !== 'undefined') {
    window.ContentSelect = ContentSelect;
  }

  if (typeof module !== 'undefined' && module.exports) {
    exports = module.exports = ContentSelect;
  }

}).call(this);

(function() {
  var ContentEdit, exports, _Root, _TagNames, _mergers,
    __slice = [].slice,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  ContentEdit = {
    ALIGNMENT_CLASS_NAMES: {
      'left': 'align-left',
      'right': 'align-right'
    },
    DEFAULT_MAX_ELEMENT_WIDTH: 800,
    DEFAULT_MIN_ELEMENT_WIDTH: 80,
    DRAG_HOLD_DURATION: 500,
    DROP_EDGE_SIZE: 50,
    HELPER_CHAR_LIMIT: 250,
    INDENT: '    ',
    LANGUAGE: 'en',
    LINE_ENDINGS: '\n',
    PREFER_LINE_BREAKS: false,
    RESIZE_CORNER_SIZE: 15,
    TRIM_WHITESPACE: true,
    _translations: {},
    _: function(s) {
      var lang;
      lang = ContentEdit.LANGUAGE;
      if (ContentEdit._translations[lang] && ContentEdit._translations[lang][s]) {
        return ContentEdit._translations[lang][s];
      }
      return s;
    },
    addTranslations: function(language, translations) {
      return ContentEdit._translations[language] = translations;
    },
    addCSSClass: function(domElement, className) {
      var c, classAttr, classNames;
      if (domElement.classList) {
        domElement.classList.add(className);
        return;
      }
      classAttr = domElement.getAttribute('class');
      if (classAttr) {
        classNames = (function() {
          var _i, _len, _ref, _results;
          _ref = classAttr.split(' ');
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            c = _ref[_i];
            _results.push(c);
          }
          return _results;
        })();
        if (classNames.indexOf(className) === -1) {
          return domElement.setAttribute('class', "" + classAttr + " " + className);
        }
      } else {
        return domElement.setAttribute('class', className);
      }
    },
    attributesToString: function(attributes) {
      var attributeStrings, name, names, value, _i, _len;
      if (!attributes) {
        return '';
      }
      names = (function() {
        var _results;
        _results = [];
        for (name in attributes) {
          _results.push(name);
        }
        return _results;
      })();
      names.sort();
      attributeStrings = [];
      for (_i = 0, _len = names.length; _i < _len; _i++) {
        name = names[_i];
        value = attributes[name];
        if (value === '') {
          attributeStrings.push(name);
        } else {
          value = HTMLString.String.encode(value);
          value = value.replace(/"/g, '&quot;');
          attributeStrings.push("" + name + "=\"" + value + "\"");
        }
      }
      return attributeStrings.join(' ');
    },
    removeCSSClass: function(domElement, className) {
      var c, classAttr, classNameIndex, classNames;
      if (domElement.classList) {
        domElement.classList.remove(className);
        if (domElement.classList.length === 0) {
          domElement.removeAttribute('class');
        }
        return;
      }
      classAttr = domElement.getAttribute('class');
      if (classAttr) {
        classNames = (function() {
          var _i, _len, _ref, _results;
          _ref = classAttr.split(' ');
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            c = _ref[_i];
            _results.push(c);
          }
          return _results;
        })();
        classNameIndex = classNames.indexOf(className);
        if (classNameIndex > -1) {
          classNames.splice(classNameIndex, 1);
          if (classNames.length) {
            return domElement.setAttribute('class', classNames.join(' '));
          } else {
            return domElement.removeAttribute('class');
          }
        }
      }
    }
  };

  if (typeof window !== 'undefined') {
    window.ContentEdit = ContentEdit;
  }

  if (typeof module !== 'undefined' && module.exports) {
    exports = module.exports = ContentEdit;
  }

  _TagNames = (function() {
    function _TagNames() {
      this._tagNames = {};
    }

    _TagNames.prototype.register = function() {
      var cls, tagName, tagNames, _i, _len, _results;
      cls = arguments[0], tagNames = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      _results = [];
      for (_i = 0, _len = tagNames.length; _i < _len; _i++) {
        tagName = tagNames[_i];
        _results.push(this._tagNames[tagName.toLowerCase()] = cls);
      }
      return _results;
    };

    _TagNames.prototype.match = function(tagName) {
      tagName = tagName.toLowerCase();
      if (this._tagNames[tagName]) {
        return this._tagNames[tagName];
      }
      return ContentEdit.Static;
    };

    return _TagNames;

  })();

  ContentEdit.TagNames = (function() {
    var instance;

    function TagNames() {}

    instance = null;

    TagNames.get = function() {
      return instance != null ? instance : instance = new _TagNames();
    };

    return TagNames;

  })();

  ContentEdit.Node = (function() {
    function Node() {
      this._bindings = {};
      this._parent = null;
      this._modified = null;
    }

    Node.prototype.lastModified = function() {
      return this._modified;
    };

    Node.prototype.parent = function() {
      return this._parent;
    };

    Node.prototype.parents = function() {
      var parent, parents;
      parents = [];
      parent = this._parent;
      while (parent) {
        parents.push(parent);
        parent = parent._parent;
      }
      return parents;
    };

    Node.prototype.type = function() {
      return 'Node';
    };

    Node.prototype.html = function(indent) {
      if (indent == null) {
        indent = '';
      }
      throw new Error('`html` not implemented');
    };

    Node.prototype.bind = function(eventName, callback) {
      if (this._bindings[eventName] === void 0) {
        this._bindings[eventName] = [];
      }
      this._bindings[eventName].push(callback);
      return callback;
    };

    Node.prototype.trigger = function() {
      var args, callback, eventName, _i, _len, _ref, _results;
      eventName = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      if (!this._bindings[eventName]) {
        return;
      }
      _ref = this._bindings[eventName];
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        callback = _ref[_i];
        if (!callback) {
          continue;
        }
        _results.push(callback.call.apply(callback, [this].concat(__slice.call(args))));
      }
      return _results;
    };

    Node.prototype.unbind = function(eventName, callback) {
      var i, suspect, _i, _len, _ref, _results;
      if (!eventName) {
        this._bindings = {};
        return;
      }
      if (!callback) {
        this._bindings[eventName] = void 0;
        return;
      }
      if (!this._bindings[eventName]) {
        return;
      }
      _ref = this._bindings[eventName];
      _results = [];
      for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
        suspect = _ref[i];
        if (suspect === callback) {
          _results.push(this._bindings[eventName].splice(i, 1));
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    Node.prototype.commit = function() {
      this._modified = null;
      return ContentEdit.Root.get().trigger('commit', this);
    };

    Node.prototype.taint = function() {
      var now, parent, root, _i, _len, _ref;
      now = Date.now();
      this._modified = now;
      _ref = this.parents();
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        parent = _ref[_i];
        parent._modified = now;
      }
      root = ContentEdit.Root.get();
      root._modified = now;
      return root.trigger('taint', this);
    };

    Node.prototype.closest = function(testFunc) {
      var parent;
      parent = this.parent();
      while (parent && !testFunc(parent)) {
        if (parent.parent) {
          parent = parent.parent();
        } else {
          parent = null;
        }
      }
      return parent;
    };

    Node.prototype.next = function() {
      var children, index, node, _i, _len, _ref;
      if (this.children && this.children.length > 0) {
        return this.children[0];
      }
      _ref = [this].concat(this.parents());
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        node = _ref[_i];
        if (!node.parent()) {
          return null;
        }
        children = node.parent().children;
        index = children.indexOf(node);
        if (index < children.length - 1) {
          return children[index + 1];
        }
      }
    };

    Node.prototype.nextContent = function() {
      return this.nextWithTest(function(node) {
        return node.content !== void 0;
      });
    };

    Node.prototype.nextSibling = function() {
      var index;
      index = this.parent().children.indexOf(this);
      if (index === this.parent().children.length - 1) {
        return null;
      }
      return this.parent().children[index + 1];
    };

    Node.prototype.nextWithTest = function(testFunc) {
      var node;
      node = this;
      while (node) {
        node = node.next();
        if (node && testFunc(node)) {
          return node;
        }
      }
    };

    Node.prototype.previous = function() {
      var children, node;
      if (!this.parent()) {
        return null;
      }
      children = this.parent().children;
      if (children[0] === this) {
        return this.parent();
      }
      node = children[children.indexOf(this) - 1];
      while (node.children && node.children.length) {
        node = node.children[node.children.length - 1];
      }
      return node;
    };

    Node.prototype.previousContent = function() {
      var node;
      return node = this.previousWithTest(function(node) {
        return node.content !== void 0;
      });
    };

    Node.prototype.previousSibling = function() {
      var index;
      index = this.parent().children.indexOf(this);
      if (index === 0) {
        return null;
      }
      return this.parent().children[index - 1];
    };

    Node.prototype.previousWithTest = function(testFunc) {
      var node;
      node = this;
      while (node) {
        node = node.previous();
        if (node && testFunc(node)) {
          return node;
        }
      }
    };

    Node.extend = function(cls) {
      var key, value, _ref;
      _ref = cls.prototype;
      for (key in _ref) {
        value = _ref[key];
        if (key === 'constructor') {
          continue;
        }
        this.prototype[key] = value;
      }
      for (key in cls) {
        value = cls[key];
        if (__indexOf.call('__super__', key) >= 0) {
          continue;
        }
        this.prototype[key] = value;
      }
      return this;
    };

    Node.fromDOMElement = function(domElement) {
      throw new Error('`fromDOMElement` not implemented');
    };

    return Node;

  })();

  ContentEdit.NodeCollection = (function(_super) {
    __extends(NodeCollection, _super);

    function NodeCollection() {
      NodeCollection.__super__.constructor.call(this);
      this.children = [];
    }

    NodeCollection.prototype.descendants = function() {
      var descendants, node, nodeStack;
      descendants = [];
      nodeStack = this.children.slice();
      while (nodeStack.length > 0) {
        node = nodeStack.shift();
        descendants.push(node);
        if (node.children && node.children.length > 0) {
          nodeStack = node.children.slice().concat(nodeStack);
        }
      }
      return descendants;
    };

    NodeCollection.prototype.isMounted = function() {
      return false;
    };

    NodeCollection.prototype.type = function() {
      return 'NodeCollection';
    };

    NodeCollection.prototype.attach = function(node, index) {
      if (node.parent()) {
        node.parent().detach(node);
      }
      node._parent = this;
      if (index !== void 0) {
        this.children.splice(index, 0, node);
      } else {
        this.children.push(node);
      }
      if (node.mount && this.isMounted()) {
        node.mount();
      }
      this.taint();
      return ContentEdit.Root.get().trigger('attach', this, node);
    };

    NodeCollection.prototype.commit = function() {
      var descendant, _i, _len, _ref;
      _ref = this.descendants();
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        descendant = _ref[_i];
        descendant._modified = null;
      }
      this._modified = null;
      return ContentEdit.Root.get().trigger('commit', this);
    };

    NodeCollection.prototype.detach = function(node) {
      var nodeIndex;
      nodeIndex = this.children.indexOf(node);
      if (nodeIndex === -1) {
        return;
      }
      if (node.unmount && this.isMounted() && node.isMounted()) {
        node.unmount();
      }
      this.children.splice(nodeIndex, 1);
      node._parent = null;
      this.taint();
      return ContentEdit.Root.get().trigger('detach', this, node);
    };

    return NodeCollection;

  })(ContentEdit.Node);

  ContentEdit.Element = (function(_super) {
    __extends(Element, _super);

    function Element(tagName, attributes) {
      Element.__super__.constructor.call(this);
      this._tagName = tagName.toLowerCase();
      this._attributes = attributes ? attributes : {};
      this._domElement = null;
      this._behaviours = {
        drag: true,
        drop: true,
        merge: true,
        remove: true,
        resize: true,
        spawn: true
      };
    }

    Element.prototype.attributes = function() {
      var attributes, name, value, _ref;
      attributes = {};
      _ref = this._attributes;
      for (name in _ref) {
        value = _ref[name];
        attributes[name] = value;
      }
      return attributes;
    };

    Element.prototype.cssTypeName = function() {
      return 'element';
    };

    Element.prototype.domElement = function() {
      return this._domElement;
    };

    Element.prototype.isFixed = function() {
      return this.parent() && this.parent().type() === 'Fixture';
    };

    Element.prototype.isFocused = function() {
      return ContentEdit.Root.get().focused() === this;
    };

    Element.prototype.isMounted = function() {
      return this._domElement !== null;
    };

    Element.prototype.type = function() {
      return 'Element';
    };

    Element.prototype.typeName = function() {
      return 'Element';
    };

    Element.prototype.addCSSClass = function(className) {
      var modified;
      modified = false;
      if (!this.hasCSSClass(className)) {
        modified = true;
        if (this.attr('class')) {
          this.attr('class', "" + (this.attr('class')) + " " + className);
        } else {
          this.attr('class', className);
        }
      }
      this._addCSSClass(className);
      if (modified) {
        return this.taint();
      }
    };

    Element.prototype.attr = function(name, value) {
      name = name.toLowerCase();
      if (value === void 0) {
        return this._attributes[name];
      }
      this._attributes[name] = value;
      if (this.isMounted() && name.toLowerCase() !== 'class') {
        this._domElement.setAttribute(name, value);
      }
      return this.taint();
    };

    Element.prototype.blur = function() {
      var root;
      root = ContentEdit.Root.get();
      if (this.isFocused()) {
        this._removeCSSClass('ce-element--focused');
        root._focused = null;
        return root.trigger('blur', this);
      }
    };

    Element.prototype.can = function(behaviour, allowed) {
      if (allowed === void 0) {
        return (!this.isFixed()) && this._behaviours[behaviour];
      }
      return this._behaviours[behaviour] = allowed;
    };

    Element.prototype.createDraggingDOMElement = function() {
      var helper;
      if (!this.isMounted()) {
        return;
      }
      helper = document.createElement('div');
      helper.setAttribute('class', "ce-drag-helper ce-drag-helper--type-" + (this.cssTypeName()));
      helper.setAttribute('data-ce-type', ContentEdit._(this.typeName()));
      return helper;
    };

    Element.prototype.drag = function(x, y) {
      var root;
      if (!(this.isMounted() && this.can('drag'))) {
        return;
      }
      root = ContentEdit.Root.get();
      root.startDragging(this, x, y);
      return root.trigger('drag', this);
    };

    Element.prototype.drop = function(element, placement) {
      var root;
      if (!this.can('drop')) {
        return;
      }
      root = ContentEdit.Root.get();
      if (element) {
        element._removeCSSClass('ce-element--drop');
        element._removeCSSClass("ce-element--drop-" + placement[0]);
        element._removeCSSClass("ce-element--drop-" + placement[1]);
        if (this.constructor.droppers[element.type()]) {
          this.constructor.droppers[element.type()](this, element, placement);
          root.trigger('drop', this, element, placement);
          return;
        } else if (element.constructor.droppers[this.type()]) {
          element.constructor.droppers[this.type()](this, element, placement);
          root.trigger('drop', this, element, placement);
          return;
        }
      }
      return root.trigger('drop', this, null, null);
    };

    Element.prototype.focus = function(supressDOMFocus) {
      var root;
      root = ContentEdit.Root.get();
      if (this.isFocused()) {
        return;
      }
      if (root.focused()) {
        root.focused().blur();
      }
      this._addCSSClass('ce-element--focused');
      root._focused = this;
      if (this.isMounted() && !supressDOMFocus) {
        this.domElement().focus();
      }
      return root.trigger('focus', this);
    };

    Element.prototype.hasCSSClass = function(className) {
      var c, classNames;
      if (this.attr('class')) {
        classNames = (function() {
          var _i, _len, _ref, _results;
          _ref = this.attr('class').split(' ');
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            c = _ref[_i];
            _results.push(c);
          }
          return _results;
        }).call(this);
        if (classNames.indexOf(className) > -1) {
          return true;
        }
      }
      return false;
    };

    Element.prototype.merge = function(element) {
      if (!(this.can('merge') && this.can('remove'))) {
        return false;
      }
      if (this.constructor.mergers[element.type()]) {
        return this.constructor.mergers[element.type()](element, this);
      } else if (element.constructor.mergers[this.type()]) {
        return element.constructor.mergers[this.type()](element, this);
      }
    };

    Element.prototype.mount = function() {
      var sibling;
      if (!this._domElement) {
        this._domElement = document.createElement(this.tagName());
      }
      sibling = this.nextSibling();
      if (sibling) {
        this.parent().domElement().insertBefore(this._domElement, sibling.domElement());
      } else {
        if (this.isFixed()) {
          this.parent().domElement().parentNode.replaceChild(this._domElement, this.parent().domElement());
          this.parent()._domElement = this._domElement;
        } else {
          this.parent().domElement().appendChild(this._domElement);
        }
      }
      this._addDOMEventListeners();
      this._addCSSClass('ce-element');
      this._addCSSClass("ce-element--type-" + (this.cssTypeName()));
      if (this.isFocused()) {
        this._addCSSClass('ce-element--focused');
      }
      return ContentEdit.Root.get().trigger('mount', this);
    };

    Element.prototype.removeAttr = function(name) {
      name = name.toLowerCase();
      if (!this._attributes[name]) {
        return;
      }
      delete this._attributes[name];
      if (this.isMounted() && name.toLowerCase() !== 'class') {
        this._domElement.removeAttribute(name);
      }
      return this.taint();
    };

    Element.prototype.removeCSSClass = function(className) {
      var c, classNameIndex, classNames;
      if (!this.hasCSSClass(className)) {
        return;
      }
      classNames = (function() {
        var _i, _len, _ref, _results;
        _ref = this.attr('class').split(' ');
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          c = _ref[_i];
          _results.push(c);
        }
        return _results;
      }).call(this);
      classNameIndex = classNames.indexOf(className);
      if (classNameIndex > -1) {
        classNames.splice(classNameIndex, 1);
      }
      if (classNames.length) {
        this.attr('class', classNames.join(' '));
      } else {
        this.removeAttr('class');
      }
      this._removeCSSClass(className);
      return this.taint();
    };

    Element.prototype.tagName = function(name) {
      if (name === void 0) {
        return this._tagName;
      }
      this._tagName = name.toLowerCase();
      if (this.isMounted()) {
        this.unmount();
        this.mount();
      }
      return this.taint();
    };

    Element.prototype.unmount = function() {
      this._removeDOMEventListeners();
      if (this.isFixed()) {
        this._removeCSSClass('ce-element');
        this._removeCSSClass("ce-element--type-" + (this.cssTypeName()));
        this._removeCSSClass('ce-element--focused');
        return;
      }
      if (this._domElement.parentNode) {
        this._domElement.parentNode.removeChild(this._domElement);
      }
      this._domElement = null;
      return ContentEdit.Root.get().trigger('unmount', this);
    };

    Element.prototype._addDOMEventListeners = function() {
      var eventHandler, eventName, _ref, _results;
      this._domEventHandlers = {
        'dragstart': (function(_this) {
          return function(ev) {
            return ev.preventDefault();
          };
        })(this),
        'focus': (function(_this) {
          return function(ev) {
            return ev.preventDefault();
          };
        })(this),
        'keydown': (function(_this) {
          return function(ev) {
            return _this._onKeyDown(ev);
          };
        })(this),
        'keyup': (function(_this) {
          return function(ev) {
            return _this._onKeyUp(ev);
          };
        })(this),
        'mousedown': (function(_this) {
          return function(ev) {
            if (ev.button === 0) {
              return _this._onMouseDown(ev);
            }
          };
        })(this),
        'mousemove': (function(_this) {
          return function(ev) {
            return _this._onMouseMove(ev);
          };
        })(this),
        'mouseover': (function(_this) {
          return function(ev) {
            return _this._onMouseOver(ev);
          };
        })(this),
        'mouseout': (function(_this) {
          return function(ev) {
            return _this._onMouseOut(ev);
          };
        })(this),
        'mouseup': (function(_this) {
          return function(ev) {
            if (ev.button === 0) {
              return _this._onMouseUp(ev);
            }
          };
        })(this),
        'dragover': (function(_this) {
          return function(ev) {
            return ev.preventDefault();
          };
        })(this),
        'drop': (function(_this) {
          return function(ev) {
            return _this._onNativeDrop(ev);
          };
        })(this),
        'paste': (function(_this) {
          return function(ev) {
            return _this._onPaste(ev);
          };
        })(this)
      };
      _ref = this._domEventHandlers;
      _results = [];
      for (eventName in _ref) {
        eventHandler = _ref[eventName];
        _results.push(this._domElement.addEventListener(eventName, eventHandler));
      }
      return _results;
    };

    Element.prototype._onKeyDown = function(ev) {};

    Element.prototype._onKeyUp = function(ev) {};

    Element.prototype._onMouseDown = function(ev) {
      if (this.focus) {
        return this.focus(true);
      }
    };

    Element.prototype._onMouseMove = function(ev) {
      return this._onOver(ev);
    };

    Element.prototype._onMouseOver = function(ev) {
      return this._onOver(ev);
    };

    Element.prototype._onMouseOut = function(ev) {
      var dragging, root;
      this._removeCSSClass('ce-element--over');
      root = ContentEdit.Root.get();
      dragging = root.dragging();
      if (dragging) {
        this._removeCSSClass('ce-element--drop');
        this._removeCSSClass('ce-element--drop-above');
        this._removeCSSClass('ce-element--drop-below');
        this._removeCSSClass('ce-element--drop-center');
        this._removeCSSClass('ce-element--drop-left');
        this._removeCSSClass('ce-element--drop-right');
        return root._dropTarget = null;
      }
    };

    Element.prototype._onMouseUp = function(ev) {
      return this._ieMouseDownEchoed = false;
    };

    Element.prototype._onNativeDrop = function(ev) {
      ev.preventDefault();
      ev.stopPropagation();
      return ContentEdit.Root.get().trigger('native-drop', this, ev);
    };

    Element.prototype._onPaste = function(ev) {
      ev.preventDefault();
      ev.stopPropagation();
      return ContentEdit.Root.get().trigger('paste', this, ev);
    };

    Element.prototype._onOver = function(ev) {
      var dragging, root;
      this._addCSSClass('ce-element--over');
      root = ContentEdit.Root.get();
      dragging = root.dragging();
      if (!dragging) {
        return;
      }
      if (dragging === this) {
        return;
      }
      if (root._dropTarget) {
        return;
      }
      if (!this.can('drop')) {
        return;
      }
      if (!(this.constructor.droppers[dragging.type()] || dragging.constructor.droppers[this.type()])) {
        return;
      }
      this._addCSSClass('ce-element--drop');
      return root._dropTarget = this;
    };

    Element.prototype._removeDOMEventListeners = function() {
      var eventHandler, eventName, _ref, _results;
      _ref = this._domEventHandlers;
      _results = [];
      for (eventName in _ref) {
        eventHandler = _ref[eventName];
        _results.push(this._domElement.removeEventListener(eventName, eventHandler));
      }
      return _results;
    };

    Element.prototype._addCSSClass = function(className) {
      if (!this.isMounted()) {
        return;
      }
      return ContentEdit.addCSSClass(this._domElement, className);
    };

    Element.prototype._attributesToString = function() {
      if (!(Object.getOwnPropertyNames(this._attributes).length > 0)) {
        return '';
      }
      return ' ' + ContentEdit.attributesToString(this._attributes);
    };

    Element.prototype._removeCSSClass = function(className) {
      if (!this.isMounted()) {
        return;
      }
      return ContentEdit.removeCSSClass(this._domElement, className);
    };

    Element.droppers = {};

    Element.mergers = {};

    Element.placements = ['above', 'below'];

    Element.getDOMElementAttributes = function(domElement) {
      var attribute, attributes, _i, _len, _ref;
      if (!domElement.hasAttributes()) {
        return {};
      }
      attributes = {};
      _ref = domElement.attributes;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        attribute = _ref[_i];
        attributes[attribute.name.toLowerCase()] = attribute.value;
      }
      return attributes;
    };

    Element._dropVert = function(element, target, placement) {
      var insertIndex;
      element.parent().detach(element);
      insertIndex = target.parent().children.indexOf(target);
      if (placement[0] === 'below') {
        insertIndex += 1;
      }
      return target.parent().attach(element, insertIndex);
    };

    Element._dropBoth = function(element, target, placement) {
      var aClassNames, alignLeft, alignRight, className, insertIndex, _i, _len, _ref;
      element.parent().detach(element);
      insertIndex = target.parent().children.indexOf(target);
      if (placement[0] === 'below' && placement[1] === 'center') {
        insertIndex += 1;
      }
      alignLeft = ContentEdit.ALIGNMENT_CLASS_NAMES['left'];
      alignRight = ContentEdit.ALIGNMENT_CLASS_NAMES['right'];
      if (element.a) {
        element._removeCSSClass(alignLeft);
        element._removeCSSClass(alignRight);
        if (element.a['class']) {
          aClassNames = [];
          _ref = element.a['class'].split(' ');
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            className = _ref[_i];
            if (className === alignLeft || className === alignRight) {
              continue;
            }
            aClassNames.push(className);
          }
          if (aClassNames.length) {
            element.a['class'] = aClassNames.join(' ');
          } else {
            delete element.a['class'];
          }
        }
      } else {
        element.removeCSSClass(alignLeft);
        element.removeCSSClass(alignRight);
      }
      if (placement[1] === 'left') {
        if (element.a) {
          if (element.a['class']) {
            element.a['class'] += ' ' + alignLeft;
          } else {
            element.a['class'] = alignLeft;
          }
          element._addCSSClass(alignLeft);
        } else {
          element.addCSSClass(alignLeft);
        }
      }
      if (placement[1] === 'right') {
        if (element.a) {
          if (element.a['class']) {
            element.a['class'] += ' ' + alignRight;
          } else {
            element.a['class'] = alignRight;
          }
          element._addCSSClass(alignRight);
        } else {
          element.addCSSClass(alignRight);
        }
      }
      return target.parent().attach(element, insertIndex);
    };

    return Element;

  })(ContentEdit.Node);

  ContentEdit.ElementCollection = (function(_super) {
    __extends(ElementCollection, _super);

    ElementCollection.extend(ContentEdit.NodeCollection);

    function ElementCollection(tagName, attributes) {
      ElementCollection.__super__.constructor.call(this, tagName, attributes);
      ContentEdit.NodeCollection.prototype.constructor.call(this);
    }

    ElementCollection.prototype.cssTypeName = function() {
      return 'element-collection';
    };

    ElementCollection.prototype.isMounted = function() {
      return this._domElement !== null;
    };

    ElementCollection.prototype.type = function() {
      return 'ElementCollection';
    };

    ElementCollection.prototype.createDraggingDOMElement = function() {
      var helper, text;
      if (!this.isMounted()) {
        return;
      }
      helper = ElementCollection.__super__.createDraggingDOMElement.call(this);
      text = this._domElement.textContent;
      if (text.length > ContentEdit.HELPER_CHAR_LIMIT) {
        text = text.substr(0, ContentEdit.HELPER_CHAR_LIMIT);
      }
      helper.innerHTML = text;
      return helper;
    };

    ElementCollection.prototype.detach = function(element) {
      ContentEdit.NodeCollection.prototype.detach.call(this, element);
      if (this.children.length === 0 && this.parent()) {
        return this.parent().detach(this);
      }
    };

    ElementCollection.prototype.html = function(indent) {
      var attributes, c, children, le;
      if (indent == null) {
        indent = '';
      }
      children = (function() {
        var _i, _len, _ref, _results;
        _ref = this.children;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          c = _ref[_i];
          _results.push(c.html(indent + ContentEdit.INDENT));
        }
        return _results;
      }).call(this);
      le = ContentEdit.LINE_ENDINGS;
      if (this.isFixed()) {
        return children.join(le);
      } else {
        attributes = this._attributesToString();
        return ("" + indent + "<" + (this.tagName()) + attributes + ">" + le) + ("" + (children.join(le)) + le) + ("" + indent + "</" + (this.tagName()) + ">");
      }
    };

    ElementCollection.prototype.mount = function() {
      var child, name, value, _i, _len, _ref, _ref1, _results;
      this._domElement = document.createElement(this._tagName);
      _ref = this._attributes;
      for (name in _ref) {
        value = _ref[name];
        this._domElement.setAttribute(name, value);
      }
      ElementCollection.__super__.mount.call(this);
      _ref1 = this.children;
      _results = [];
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        child = _ref1[_i];
        _results.push(child.mount());
      }
      return _results;
    };

    ElementCollection.prototype.unmount = function() {
      var child, _i, _len, _ref;
      _ref = this.children;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        child = _ref[_i];
        child.unmount();
      }
      return ElementCollection.__super__.unmount.call(this);
    };

    ElementCollection.prototype.blur = void 0;

    ElementCollection.prototype.focus = void 0;

    return ElementCollection;

  })(ContentEdit.Element);

  ContentEdit.ResizableElement = (function(_super) {
    __extends(ResizableElement, _super);

    function ResizableElement(tagName, attributes) {
      ResizableElement.__super__.constructor.call(this, tagName, attributes);
      this._domSizeInfoElement = null;
      this._aspectRatio = 1;
    }

    ResizableElement.prototype.aspectRatio = function() {
      return this._aspectRatio;
    };

    ResizableElement.prototype.maxSize = function() {
      var maxWidth;
      maxWidth = parseInt(this.attr('data-ce-max-width') || 0);
      if (!maxWidth) {
        maxWidth = ContentEdit.DEFAULT_MAX_ELEMENT_WIDTH;
      }
      maxWidth = Math.max(maxWidth, this.size()[0]);
      return [maxWidth, maxWidth * this.aspectRatio()];
    };

    ResizableElement.prototype.minSize = function() {
      var minWidth;
      minWidth = parseInt(this.attr('data-ce-min-width') || 0);
      if (!minWidth) {
        minWidth = ContentEdit.DEFAULT_MIN_ELEMENT_WIDTH;
      }
      minWidth = Math.min(minWidth, this.size()[0]);
      return [minWidth, minWidth * this.aspectRatio()];
    };

    ResizableElement.prototype.type = function() {
      return 'ResizableElement';
    };

    ResizableElement.prototype.mount = function() {
      ResizableElement.__super__.mount.call(this);
      return this._domElement.setAttribute('data-ce-size', this._getSizeInfo());
    };

    ResizableElement.prototype.resize = function(corner, x, y) {
      if (!(this.isMounted() && this.can('resize'))) {
        return;
      }
      return ContentEdit.Root.get().startResizing(this, corner, x, y, true);
    };

    ResizableElement.prototype.size = function(newSize) {
      var height, maxSize, minSize, width;
      if (!newSize) {
        width = parseInt(this.attr('width') || 1);
        height = parseInt(this.attr('height') || 1);
        return [width, height];
      }
      newSize[0] = parseInt(newSize[0]);
      newSize[1] = parseInt(newSize[1]);
      minSize = this.minSize();
      newSize[0] = Math.max(newSize[0], minSize[0]);
      newSize[1] = Math.max(newSize[1], minSize[1]);
      maxSize = this.maxSize();
      newSize[0] = Math.min(newSize[0], maxSize[0]);
      newSize[1] = Math.min(newSize[1], maxSize[1]);
      this.attr('width', parseInt(newSize[0]));
      this.attr('height', parseInt(newSize[1]));
      if (this.isMounted()) {
        this._domElement.style.width = "" + newSize[0] + "px";
        this._domElement.style.height = "" + newSize[1] + "px";
        return this._domElement.setAttribute('data-ce-size', this._getSizeInfo());
      }
    };

    ResizableElement.prototype._onMouseDown = function(ev) {
      var corner;
      ResizableElement.__super__._onMouseDown.call(this, ev);
      corner = this._getResizeCorner(ev.clientX, ev.clientY);
      if (corner) {
        return this.resize(corner, ev.clientX, ev.clientY);
      } else {
        clearTimeout(this._dragTimeout);
        return this._dragTimeout = setTimeout((function(_this) {
          return function() {
            return _this.drag(ev.pageX, ev.pageY);
          };
        })(this), 150);
      }
    };

    ResizableElement.prototype._onMouseMove = function(ev) {
      var corner;
      ResizableElement.__super__._onMouseMove.call(this);
      if (!this.can('resize')) {
        return;
      }
      this._removeCSSClass('ce-element--resize-top-left');
      this._removeCSSClass('ce-element--resize-top-right');
      this._removeCSSClass('ce-element--resize-bottom-left');
      this._removeCSSClass('ce-element--resize-bottom-right');
      corner = this._getResizeCorner(ev.clientX, ev.clientY);
      if (corner) {
        return this._addCSSClass("ce-element--resize-" + corner[0] + "-" + corner[1]);
      }
    };

    ResizableElement.prototype._onMouseOut = function(ev) {
      ResizableElement.__super__._onMouseOut.call(this);
      this._removeCSSClass('ce-element--resize-top-left');
      this._removeCSSClass('ce-element--resize-top-right');
      this._removeCSSClass('ce-element--resize-bottom-left');
      return this._removeCSSClass('ce-element--resize-bottom-right');
    };

    ResizableElement.prototype._onMouseUp = function(ev) {
      ResizableElement.__super__._onMouseUp.call(this);
      if (this._dragTimeout) {
        return clearTimeout(this._dragTimeout);
      }
    };

    ResizableElement.prototype._getResizeCorner = function(x, y) {
      var corner, cornerSize, rect, size, _ref;
      rect = this._domElement.getBoundingClientRect();
      _ref = [x - rect.left, y - rect.top], x = _ref[0], y = _ref[1];
      size = this.size();
      cornerSize = ContentEdit.RESIZE_CORNER_SIZE;
      cornerSize = Math.min(cornerSize, Math.max(parseInt(size[0] / 4), 1));
      cornerSize = Math.min(cornerSize, Math.max(parseInt(size[1] / 4), 1));
      corner = null;
      if (x < cornerSize) {
        if (y < cornerSize) {
          corner = ['top', 'left'];
        } else if (y > rect.height - cornerSize) {
          corner = ['bottom', 'left'];
        }
      } else if (x > rect.width - cornerSize) {
        if (y < cornerSize) {
          corner = ['top', 'right'];
        } else if (y > rect.height - cornerSize) {
          corner = ['bottom', 'right'];
        }
      }
      return corner;
    };

    ResizableElement.prototype._getSizeInfo = function() {
      var size;
      size = this.size();
      return "w " + size[0] + " × h " + size[1];
    };

    return ResizableElement;

  })(ContentEdit.Element);

  ContentEdit.Region = (function(_super) {
    __extends(Region, _super);

    function Region(domElement) {
      Region.__super__.constructor.call(this);
      this._domElement = domElement;
      this.setContent(domElement);
    }

    Region.prototype.domElement = function() {
      return this._domElement;
    };

    Region.prototype.isMounted = function() {
      return true;
    };

    Region.prototype.type = function() {
      return 'Region';
    };

    Region.prototype.html = function(indent) {
      var c, le;
      if (indent == null) {
        indent = '';
      }
      le = ContentEdit.LINE_ENDINGS;
      return ((function() {
        var _i, _len, _ref, _results;
        _ref = this.children;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          c = _ref[_i];
          _results.push(c.html(indent));
        }
        return _results;
      }).call(this)).join(le).trim();
    };

    Region.prototype.setContent = function(domElementOrHTML) {
      var c, child, childNode, childNodes, cls, domElement, element, tagNames, wrapper, _i, _j, _len, _len1, _ref;
      domElement = domElementOrHTML;
      if (domElementOrHTML.childNodes === void 0) {
        wrapper = document.createElement('div');
        wrapper.innerHTML = domElementOrHTML;
        domElement = wrapper;
      }
      _ref = this.children.slice();
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        child = _ref[_i];
        this.detach(child);
      }
      tagNames = ContentEdit.TagNames.get();
      childNodes = (function() {
        var _j, _len1, _ref1, _results;
        _ref1 = domElement.childNodes;
        _results = [];
        for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
          c = _ref1[_j];
          _results.push(c);
        }
        return _results;
      })();
      for (_j = 0, _len1 = childNodes.length; _j < _len1; _j++) {
        childNode = childNodes[_j];
        if (childNode.nodeType !== 1) {
          continue;
        }
        if (childNode.getAttribute('data-ce-tag')) {
          cls = tagNames.match(childNode.getAttribute('data-ce-tag'));
        } else {
          cls = tagNames.match(childNode.tagName);
        }
        element = cls.fromDOMElement(childNode);
        domElement.removeChild(childNode);
        if (element) {
          this.attach(element);
        }
      }
      return ContentEdit.Root.get().trigger('ready', this);
    };

    return Region;

  })(ContentEdit.NodeCollection);

  ContentEdit.Fixture = (function(_super) {
    __extends(Fixture, _super);

    function Fixture(domElement) {
      var cls, element, tagNames;
      Fixture.__super__.constructor.call(this);
      this._domElement = domElement;
      tagNames = ContentEdit.TagNames.get();
      if (this._domElement.getAttribute("data-ce-tag")) {
        cls = tagNames.match(this._domElement.getAttribute("data-ce-tag"));
      } else {
        cls = tagNames.match(this._domElement.tagName);
      }
      element = cls.fromDOMElement(this._domElement);
      this.children = [element];
      element._parent = this;
      element.mount();
      ContentEdit.Root.get().trigger('ready', this);
    }

    Fixture.prototype.domElement = function() {
      return this._domElement;
    };

    Fixture.prototype.isMounted = function() {
      return true;
    };

    Fixture.prototype.type = function() {
      return 'Fixture';
    };

    Fixture.prototype.html = function(indent) {
      var c, le;
      if (indent == null) {
        indent = '';
      }
      le = ContentEdit.LINE_ENDINGS;
      return ((function() {
        var _i, _len, _ref, _results;
        _ref = this.children;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          c = _ref[_i];
          _results.push(c.html(indent));
        }
        return _results;
      }).call(this)).join(le).trim();
    };

    return Fixture;

  })(ContentEdit.NodeCollection);

  _Root = (function(_super) {
    __extends(_Root, _super);

    function _Root() {
      this._onStopResizing = __bind(this._onStopResizing, this);
      this._onResize = __bind(this._onResize, this);
      this._onStopDragging = __bind(this._onStopDragging, this);
      this._onDrag = __bind(this._onDrag, this);
      _Root.__super__.constructor.call(this);
      this._focused = null;
      this._dragging = null;
      this._dropTarget = null;
      this._draggingDOMElement = null;
      this._resizing = null;
      this._resizingInit = null;
    }

    _Root.prototype.dragging = function() {
      return this._dragging;
    };

    _Root.prototype.dropTarget = function() {
      return this._dropTarget;
    };

    _Root.prototype.focused = function() {
      return this._focused;
    };

    _Root.prototype.resizing = function() {
      return this._resizing;
    };

    _Root.prototype.type = function() {
      return 'Root';
    };

    _Root.prototype.cancelDragging = function() {
      if (!this._dragging) {
        return;
      }
      document.body.removeChild(this._draggingDOMElement);
      document.removeEventListener('mousemove', this._onDrag);
      document.removeEventListener('mouseup', this._onStopDragging);
      this._dragging._removeCSSClass('ce-element--dragging');
      this._dragging = null;
      this._dropTarget = null;
      return ContentEdit.removeCSSClass(document.body, 'ce--dragging');
    };

    _Root.prototype.startDragging = function(element, x, y) {
      if (this._dragging) {
        return;
      }
      this._dragging = element;
      this._dragging._addCSSClass('ce-element--dragging');
      this._draggingDOMElement = this._dragging.createDraggingDOMElement();
      document.body.appendChild(this._draggingDOMElement);
      this._draggingDOMElement.style.left = "" + x + "px";
      this._draggingDOMElement.style.top = "" + y + "px";
      document.addEventListener('mousemove', this._onDrag);
      document.addEventListener('mouseup', this._onStopDragging);
      return ContentEdit.addCSSClass(document.body, 'ce--dragging');
    };

    _Root.prototype._getDropPlacement = function(x, y) {
      var horz, rect, vert, _ref;
      if (!this._dropTarget) {
        return null;
      }
      rect = this._dropTarget.domElement().getBoundingClientRect();
      _ref = [x - rect.left, y - rect.top], x = _ref[0], y = _ref[1];
      horz = 'center';
      if (x < ContentEdit.DROP_EDGE_SIZE) {
        horz = 'left';
      } else if (x > rect.width - ContentEdit.DROP_EDGE_SIZE) {
        horz = 'right';
      }
      vert = 'above';
      if (y > rect.height / 2) {
        vert = 'below';
      }
      return [vert, horz];
    };

    _Root.prototype._onDrag = function(ev) {
      var placement, _ref, _ref1;
      ContentSelect.Range.unselectAll();
      this._draggingDOMElement.style.left = "" + ev.pageX + "px";
      this._draggingDOMElement.style.top = "" + ev.pageY + "px";
      if (this._dropTarget) {
        placement = this._getDropPlacement(ev.clientX, ev.clientY);
        this._dropTarget._removeCSSClass('ce-element--drop-above');
        this._dropTarget._removeCSSClass('ce-element--drop-below');
        this._dropTarget._removeCSSClass('ce-element--drop-center');
        this._dropTarget._removeCSSClass('ce-element--drop-left');
        this._dropTarget._removeCSSClass('ce-element--drop-right');
        if (_ref = placement[0], __indexOf.call(this._dragging.constructor.placements, _ref) >= 0) {
          this._dropTarget._addCSSClass("ce-element--drop-" + placement[0]);
        }
        if (_ref1 = placement[1], __indexOf.call(this._dragging.constructor.placements, _ref1) >= 0) {
          return this._dropTarget._addCSSClass("ce-element--drop-" + placement[1]);
        }
      }
    };

    _Root.prototype._onStopDragging = function(ev) {
      var placement;
      placement = this._getDropPlacement(ev.clientX, ev.clientY);
      this._dragging.drop(this._dropTarget, placement);
      return this.cancelDragging();
    };

    _Root.prototype.startResizing = function(element, corner, x, y, fixed) {
      var measureDom, parentDom;
      if (this._resizing) {
        return;
      }
      this._resizing = element;
      this._resizingInit = {
        corner: corner,
        fixed: fixed,
        origin: [x, y],
        size: element.size()
      };
      this._resizing._addCSSClass('ce-element--resizing');
      parentDom = this._resizing.parent().domElement();
      measureDom = document.createElement('div');
      measureDom.setAttribute('class', 'ce-measure');
      parentDom.appendChild(measureDom);
      this._resizingParentWidth = measureDom.getBoundingClientRect().width;
      parentDom.removeChild(measureDom);
      document.addEventListener('mousemove', this._onResize);
      document.addEventListener('mouseup', this._onStopResizing);
      return ContentEdit.addCSSClass(document.body, 'ce--resizing');
    };

    _Root.prototype._onResize = function(ev) {
      var height, width, x, y;
      ContentSelect.Range.unselectAll();
      x = this._resizingInit.origin[0] - ev.clientX;
      if (this._resizingInit.corner[1] === 'right') {
        x = -x;
      }
      width = this._resizingInit.size[0] + x;
      width = Math.min(width, this._resizingParentWidth);
      if (this._resizingInit.fixed) {
        height = width * this._resizing.aspectRatio();
      } else {
        y = this._resizingInit.origin[1] - ev.clientY;
        if (this._resizingInit.corner[0] === 'bottom') {
          y = -y;
        }
        height = this._resizingInit.size[1] + y;
      }
      return this._resizing.size([width, height]);
    };

    _Root.prototype._onStopResizing = function(ev) {
      document.removeEventListener('mousemove', this._onResize);
      document.removeEventListener('mouseup', this._onStopResizing);
      this._resizing._removeCSSClass('ce-element--resizing');
      this._resizing = null;
      this._resizingInit = null;
      this._resizingParentWidth = null;
      return ContentEdit.removeCSSClass(document.body, 'ce--resizing');
    };

    return _Root;

  })(ContentEdit.Node);

  ContentEdit.Root = (function() {
    var instance;

    function Root() {}

    instance = null;

    Root.get = function() {
      return instance != null ? instance : instance = new _Root();
    };

    return Root;

  })();

  ContentEdit.Static = (function(_super) {
    __extends(Static, _super);

    function Static(tagName, attributes, content) {
      Static.__super__.constructor.call(this, tagName, attributes);
      this._content = content;
    }

    Static.prototype.cssTypeName = function() {
      return 'static';
    };

    Static.prototype.type = function() {
      return 'Static';
    };

    Static.prototype.typeName = function() {
      return 'Static';
    };

    Static.prototype.createDraggingDOMElement = function() {
      var helper, text;
      if (!this.isMounted()) {
        return;
      }
      helper = Static.__super__.createDraggingDOMElement.call(this);
      text = this._domElement.textContent;
      if (text.length > ContentEdit.HELPER_CHAR_LIMIT) {
        text = text.substr(0, ContentEdit.HELPER_CHAR_LIMIT);
      }
      helper.innerHTML = text;
      return helper;
    };

    Static.prototype.html = function(indent) {
      if (indent == null) {
        indent = '';
      }
      if (HTMLString.Tag.SELF_CLOSING[this._tagName]) {
        return "" + indent + "<" + this._tagName + (this._attributesToString()) + ">";
      }
      return ("" + indent + "<" + this._tagName + (this._attributesToString()) + ">") + ("" + this._content) + ("" + indent + "</" + this._tagName + ">");
    };

    Static.prototype.mount = function() {
      var name, value, _ref;
      this._domElement = document.createElement(this._tagName);
      _ref = this._attributes;
      for (name in _ref) {
        value = _ref[name];
        this._domElement.setAttribute(name, value);
      }
      this._domElement.innerHTML = this._content;
      return Static.__super__.mount.call(this);
    };

    Static.prototype.blur = void 0;

    Static.prototype.focus = void 0;

    Static.prototype._onMouseDown = function(ev) {
      Static.__super__._onMouseDown.call(this, ev);
      if (this.attr('data-ce-moveable') !== void 0) {
        clearTimeout(this._dragTimeout);
        return this._dragTimeout = setTimeout((function(_this) {
          return function() {
            return _this.drag(ev.pageX, ev.pageY);
          };
        })(this), 150);
      }
    };

    Static.prototype._onMouseOver = function(ev) {
      Static.__super__._onMouseOver.call(this, ev);
      return this._removeCSSClass('ce-element--over');
    };

    Static.prototype._onMouseUp = function(ev) {
      Static.__super__._onMouseUp.call(this, ev);
      if (this._dragTimeout) {
        return clearTimeout(this._dragTimeout);
      }
    };

    Static.droppers = {
      'Static': ContentEdit.Element._dropVert
    };

    Static.fromDOMElement = function(domElement) {
      return new this(domElement.tagName, this.getDOMElementAttributes(domElement), domElement.innerHTML);
    };

    return Static;

  })(ContentEdit.Element);

  ContentEdit.TagNames.get().register(ContentEdit.Static, 'static');

  ContentEdit.Text = (function(_super) {
    __extends(Text, _super);

    function Text(tagName, attributes, content) {
      Text.__super__.constructor.call(this, tagName, attributes);
      if (content instanceof HTMLString.String) {
        this.content = content;
      } else {
        if (ContentEdit.TRIM_WHITESPACE) {
          this.content = new HTMLString.String(content).trim();
        } else {
          this.content = new HTMLString.String(content, true);
        }
      }
    }

    Text.prototype.cssTypeName = function() {
      return 'text';
    };

    Text.prototype.type = function() {
      return 'Text';
    };

    Text.prototype.typeName = function() {
      return 'Text';
    };

    Text.prototype.blur = function() {
      if (this.isMounted()) {
        this._syncContent();
      }
      if (this.content.isWhitespace() && this.can('remove')) {
        if (this.parent()) {
          this.parent().detach(this);
        }
      } else if (this.isMounted()) {
        if (!document.documentMode && !/Edge/.test(navigator.userAgent)) {
          this._domElement.blur();
        }
        this._domElement.removeAttribute('contenteditable');
      }
      return Text.__super__.blur.call(this);
    };

    Text.prototype.createDraggingDOMElement = function() {
      var helper, text;
      if (!this.isMounted()) {
        return;
      }
      helper = Text.__super__.createDraggingDOMElement.call(this);
      text = HTMLString.String.encode(this._domElement.textContent);
      if (text.length > ContentEdit.HELPER_CHAR_LIMIT) {
        text = text.substr(0, ContentEdit.HELPER_CHAR_LIMIT);
      }
      helper.innerHTML = text;
      return helper;
    };

    Text.prototype.drag = function(x, y) {
      this.storeState();
      this._domElement.removeAttribute('contenteditable');
      return Text.__super__.drag.call(this, x, y);
    };

    Text.prototype.drop = function(element, placement) {
      Text.__super__.drop.call(this, element, placement);
      return this.restoreState();
    };

    Text.prototype.focus = function(supressDOMFocus) {
      if (this.isMounted()) {
        this._domElement.setAttribute('contenteditable', '');
      }
      return Text.__super__.focus.call(this, supressDOMFocus);
    };

    Text.prototype.html = function(indent) {
      var attributes, content, le;
      if (indent == null) {
        indent = '';
      }
      if (!this._lastCached || this._lastCached < this._modified) {
        if (ContentEdit.TRIM_WHITESPACE) {
          content = this.content.copy().trim();
        } else {
          content = this.content.copy();
        }
        content.optimize();
        this._lastCached = Date.now();
        this._cached = content.html();
      }
      le = ContentEdit.LINE_ENDINGS;
      attributes = this._attributesToString();
      return ("" + indent + "<" + this._tagName + attributes + ">" + le) + ("" + indent + ContentEdit.INDENT + this._cached + le) + ("" + indent + "</" + this._tagName + ">");
    };

    Text.prototype.mount = function() {
      var name, value, _ref;
      this._domElement = document.createElement(this._tagName);
      _ref = this._attributes;
      for (name in _ref) {
        value = _ref[name];
        this._domElement.setAttribute(name, value);
      }
      this.updateInnerHTML();
      return Text.__super__.mount.call(this);
    };

    Text.prototype.restoreState = function() {
      if (!this._savedSelection) {
        return;
      }
      if (!(this.isMounted() && this.isFocused())) {
        this._savedSelection = void 0;
        return;
      }
      this._domElement.setAttribute('contenteditable', '');
      this._addCSSClass('ce-element--focused');
      if (document.activeElement !== this.domElement()) {
        this.domElement().focus();
      }
      this._savedSelection.select(this._domElement);
      return this._savedSelection = void 0;
    };

    Text.prototype.selection = function(selection) {
      if (selection === void 0) {
        if (this.isMounted()) {
          return ContentSelect.Range.query(this._domElement);
        } else {
          return new ContentSelect.Range(0, 0);
        }
      }
      return selection.select(this._domElement);
    };

    Text.prototype.storeState = function() {
      if (!(this.isMounted() && this.isFocused())) {
        return;
      }
      return this._savedSelection = ContentSelect.Range.query(this._domElement);
    };

    Text.prototype.unmount = function() {
      this._domElement.removeAttribute('contenteditable');
      return Text.__super__.unmount.call(this);
    };

    Text.prototype.updateInnerHTML = function() {
      this._domElement.innerHTML = this.content.html();
      ContentSelect.Range.prepareElement(this._domElement);
      return this._flagIfEmpty();
    };

    Text.prototype._onKeyDown = function(ev) {
      switch (ev.keyCode) {
        case 40:
          return this._keyDown(ev);
        case 37:
          return this._keyLeft(ev);
        case 39:
          return this._keyRight(ev);
        case 38:
          return this._keyUp(ev);
        case 9:
          return this._keyTab(ev);
        case 8:
          return this._keyBack(ev);
        case 46:
          return this._keyDelete(ev);
        case 13:
          return this._keyReturn(ev);
      }
    };

    Text.prototype._onKeyUp = function(ev) {
      Text.__super__._onKeyUp.call(this, ev);
      return this._syncContent();
    };

    Text.prototype._onMouseDown = function(ev) {
      Text.__super__._onMouseDown.call(this, ev);
      clearTimeout(this._dragTimeout);
      this._dragTimeout = setTimeout((function(_this) {
        return function() {
          return _this.drag(ev.pageX, ev.pageY);
        };
      })(this), ContentEdit.DRAG_HOLD_DURATION);
      if (this.content.length() === 0 && ContentEdit.Root.get().focused() === this) {
        ev.preventDefault();
        if (document.activeElement !== this._domElement) {
          this._domElement.focus();
        }
        return new ContentSelect.Range(0, 0).select(this._domElement);
      }
    };

    Text.prototype._onMouseMove = function(ev) {
      if (this._dragTimeout) {
        clearTimeout(this._dragTimeout);
      }
      return Text.__super__._onMouseMove.call(this, ev);
    };

    Text.prototype._onMouseOut = function(ev) {
      if (this._dragTimeout) {
        clearTimeout(this._dragTimeout);
      }
      return Text.__super__._onMouseOut.call(this, ev);
    };

    Text.prototype._onMouseUp = function(ev) {
      if (this._dragTimeout) {
        clearTimeout(this._dragTimeout);
      }
      return Text.__super__._onMouseUp.call(this, ev);
    };

    Text.prototype._keyBack = function(ev) {
      var previous, selection;
      selection = ContentSelect.Range.query(this._domElement);
      if (!(selection.get()[0] === 0 && selection.isCollapsed())) {
        return;
      }
      ev.preventDefault();
      previous = this.previousContent();
      this._syncContent();
      if (previous) {
        return previous.merge(this);
      }
    };

    Text.prototype._keyDelete = function(ev) {
      var next, selection;
      selection = ContentSelect.Range.query(this._domElement);
      if (!(this._atEnd(selection) && selection.isCollapsed())) {
        return;
      }
      ev.preventDefault();
      next = this.nextContent();
      if (next) {
        return this.merge(next);
      }
    };

    Text.prototype._keyDown = function(ev) {
      return this._keyRight(ev);
    };

    Text.prototype._keyLeft = function(ev) {
      var previous, selection;
      selection = ContentSelect.Range.query(this._domElement);
      if (!(selection.get()[0] === 0 && selection.isCollapsed())) {
        return;
      }
      ev.preventDefault();
      previous = this.previousContent();
      if (previous) {
        previous.focus();
        selection = new ContentSelect.Range(previous.content.length(), previous.content.length());
        return selection.select(previous.domElement());
      } else {
        return ContentEdit.Root.get().trigger('previous-region', this.closest(function(node) {
          return node.type() === 'Fixture' || node.type() === 'Region';
        }));
      }
    };

    Text.prototype._keyReturn = function(ev) {
      var element, insertAt, lineBreakStr, selection, tail, tip;
      ev.preventDefault();
      if (this.content.isWhitespace() && !ev.shiftKey ^ ContentEdit.PREFER_LINE_BREAKS) {
        return;
      }
      selection = ContentSelect.Range.query(this._domElement);
      tip = this.content.substring(0, selection.get()[0]);
      tail = this.content.substring(selection.get()[1]);
      if (ev.shiftKey ^ ContentEdit.PREFER_LINE_BREAKS) {
        insertAt = selection.get()[0];
        lineBreakStr = '<br>';
        if (this.content.length() === insertAt) {
          if (this.content.length() === 0 || !this.content.characters[insertAt - 1].isTag('br')) {
            lineBreakStr = '<br><br>';
          }
        }
        this.content = this.content.insert(insertAt, new HTMLString.String(lineBreakStr, true), true);
        this.updateInnerHTML();
        insertAt += 1;
        selection = new ContentSelect.Range(insertAt, insertAt);
        selection.select(this.domElement());
        this.taint();
        return;
      }
      if (!this.can('spawn')) {
        return;
      }
      this.content = tip.trim();
      this.updateInnerHTML();
      element = new this.constructor('p', {}, tail.trim());
      this.parent().attach(element, this.parent().children.indexOf(this) + 1);
      if (tip.length()) {
        element.focus();
        selection = new ContentSelect.Range(0, 0);
        selection.select(element.domElement());
      } else {
        selection = new ContentSelect.Range(0, tip.length());
        selection.select(this._domElement);
      }
      return this.taint();
    };

    Text.prototype._keyRight = function(ev) {
      var next, selection;
      selection = ContentSelect.Range.query(this._domElement);
      if (!(this._atEnd(selection) && selection.isCollapsed())) {
        return;
      }
      ev.preventDefault();
      next = this.nextContent();
      if (next) {
        next.focus();
        selection = new ContentSelect.Range(0, 0);
        return selection.select(next.domElement());
      } else {
        return ContentEdit.Root.get().trigger('next-region', this.closest(function(node) {
          return node.type() === 'Fixture' || node.type() === 'Region';
        }));
      }
    };

    Text.prototype._keyTab = function(ev) {
      ev.preventDefault();
      if (this.isFixed()) {
        if (ev.shiftKey) {
          return ContentEdit.Root.get().trigger('previous-region', this.closest(function(node) {
            return node.type() === 'Fixture' || node.type() === 'Region';
          }));
        } else {
          return ContentEdit.Root.get().trigger('next-region', this.closest(function(node) {
            return node.type() === 'Fixture' || node.type() === 'Region';
          }));
        }
      }
    };

    Text.prototype._keyUp = function(ev) {
      return this._keyLeft(ev);
    };

    Text.prototype._atEnd = function(selection) {
      return selection.get()[0] >= this.content.length();
    };

    Text.prototype._flagIfEmpty = function() {
      if (this.content.length() === 0) {
        return this._addCSSClass('ce-element--empty');
      } else {
        return this._removeCSSClass('ce-element--empty');
      }
    };

    Text.prototype._syncContent = function(ev) {
      var newSnapshot, snapshot;
      snapshot = this.content.html();
      this.content = new HTMLString.String(this._domElement.innerHTML, this.content.preserveWhitespace());
      newSnapshot = this.content.html();
      if (snapshot !== newSnapshot) {
        this.taint();
      }
      return this._flagIfEmpty();
    };

    Text.droppers = {
      'Static': ContentEdit.Element._dropVert,
      'Text': ContentEdit.Element._dropVert
    };

    Text.mergers = {
      'Text': function(element, target) {
        var offset;
        offset = target.content.length();
        if (element.content.length()) {
          target.content = target.content.concat(element.content);
        }
        if (target.isMounted()) {
          target.updateInnerHTML();
        }
        target.focus();
        new ContentSelect.Range(offset, offset).select(target._domElement);
        if (element.parent()) {
          element.parent().detach(element);
        }
        return target.taint();
      }
    };

    Text.fromDOMElement = function(domElement) {
      return new this(domElement.tagName, this.getDOMElementAttributes(domElement), domElement.innerHTML.replace(/^\s+|\s+$/g, ''));
    };

    return Text;

  })(ContentEdit.Element);

  ContentEdit.TagNames.get().register(ContentEdit.Text, 'address', 'blockquote', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p');

  ContentEdit.PreText = (function(_super) {
    __extends(PreText, _super);

    PreText.TAB_INDENT = '    ';

    function PreText(tagName, attributes, content) {
      if (content instanceof HTMLString.String) {
        this.content = content;
      } else {
        this.content = new HTMLString.String(content, true);
      }
      ContentEdit.Element.call(this, tagName, attributes);
    }

    PreText.prototype.cssTypeName = function() {
      return 'pre-text';
    };

    PreText.prototype.type = function() {
      return 'PreText';
    };

    PreText.prototype.typeName = function() {
      return 'Preformatted';
    };

    PreText.prototype.blur = function() {
      if (this.isMounted()) {
        this._domElement.innerHTML = this.content.html();
      }
      return PreText.__super__.blur.call(this);
    };

    PreText.prototype.html = function(indent) {
      var content;
      if (indent == null) {
        indent = '';
      }
      if (!this._lastCached || this._lastCached < this._modified) {
        content = this.content.copy();
        content.optimize();
        this._lastCached = Date.now();
        this._cached = content.html();
      }
      return ("" + indent + "<" + this._tagName + (this._attributesToString()) + ">") + ("" + this._cached + "</" + this._tagName + ">");
    };

    PreText.prototype.updateInnerHTML = function() {
      var html;
      html = this.content.html();
      this._domElement.innerHTML = html;
      this._ensureEndZWS();
      ContentSelect.Range.prepareElement(this._domElement);
      return this._flagIfEmpty();
    };

    PreText.prototype._keyBack = function(ev) {
      var selection;
      selection = ContentSelect.Range.query(this._domElement);
      if (selection.get()[0] <= this.content.length()) {
        return PreText.__super__._keyBack.call(this, ev);
      }
      selection.set(this.content.length(), this.content.length());
      return selection.select(this._domElement);
    };

    PreText.prototype._keyReturn = function(ev) {
      var cursor, selection, tail, tip;
      ev.preventDefault();
      selection = ContentSelect.Range.query(this._domElement);
      cursor = selection.get()[0] + 1;
      if (selection.get()[0] === 0 && selection.isCollapsed()) {
        this.content = new HTMLString.String('\n', true).concat(this.content);
      } else if (this._atEnd(selection) && selection.isCollapsed()) {
        this.content = this.content.concat(new HTMLString.String('\n', true));
      } else if (selection.get()[0] === 0 && selection.get()[1] === this.content.length()) {
        this.content = new HTMLString.String('\n', true);
        cursor = 0;
      } else {
        tip = this.content.substring(0, selection.get()[0]);
        tail = this.content.substring(selection.get()[1]);
        this.content = tip.concat(new HTMLString.String('\n', true), tail);
      }
      this.updateInnerHTML();
      selection.set(cursor, cursor);
      selection.select(this._domElement);
      return this.taint();
    };

    PreText.prototype._keyTab = function(ev) {
      var blockLength, c, charIndex, endLine, firstLineShift, i, indentHTML, indentLength, indentText, j, line, lineLength, lines, selection, selectionLength, selectionOffset, startLine, tail, tip, _i, _j, _k, _l, _len, _len1, _ref;
      ev.preventDefault();
      blockLength = this.content.length();
      indentText = ContentEdit.PreText.TAB_INDENT;
      indentLength = indentText.length;
      lines = this.content.split('\n');
      selection = this.selection().get();
      selection[0] = Math.min(selection[0], blockLength);
      selection[1] = Math.min(selection[1], blockLength);
      charIndex = 0;
      startLine = -1;
      endLine = -1;
      for (i = _i = 0, _len = lines.length; _i < _len; i = ++_i) {
        line = lines[i];
        lineLength = line.length() + 1;
        if (selection[0] < charIndex + lineLength) {
          if (startLine === -1) {
            startLine = i;
          }
        }
        if (selection[1] < charIndex + lineLength) {
          if (endLine === -1) {
            endLine = i;
          }
        }
        if (startLine > -1 && endLine > -1) {
          break;
        }
        charIndex += lineLength;
      }
      if (startLine === endLine) {
        indentLength -= (selection[0] - charIndex) % indentLength;
        indentHTML = new HTMLString.String(Array(indentLength + 1).join(' '), true);
        tip = lines[startLine].substring(0, selection[0] - charIndex);
        tail = lines[startLine].substring(selection[1] - charIndex);
        lines[startLine] = tip.concat(indentHTML, tail);
        selectionOffset = indentLength;
      } else {
        if (ev.shiftKey) {
          firstLineShift = 0;
          for (i = _j = startLine; startLine <= endLine ? _j <= endLine : _j >= endLine; i = startLine <= endLine ? ++_j : --_j) {
            _ref = lines[i].characters.slice();
            for (j = _k = 0, _len1 = _ref.length; _k < _len1; j = ++_k) {
              c = _ref[j];
              if (j > (indentLength - 1)) {
                break;
              }
              if (!c.isWhitespace()) {
                break;
              }
              lines[i].characters.shift();
            }
            if (i === startLine) {
              firstLineShift = j;
            }
          }
          selectionOffset = Math.max(-indentLength, -firstLineShift);
        } else {
          indentHTML = new HTMLString.String(indentText, true);
          for (i = _l = startLine; startLine <= endLine ? _l <= endLine : _l >= endLine; i = startLine <= endLine ? ++_l : --_l) {
            lines[i] = indentHTML.concat(lines[i]);
          }
          selectionOffset = indentLength;
        }
      }
      this.content = HTMLString.String.join(new HTMLString.String('\n', true), lines);
      this.updateInnerHTML();
      selectionLength = this.content.length() - blockLength;
      return new ContentSelect.Range(selection[0] + selectionOffset, selection[1] + selectionLength).select(this._domElement);
    };

    PreText.prototype._syncContent = function(ev) {
      var newSnapshot, snapshot;
      this._ensureEndZWS();
      snapshot = this.content.html();
      this.content = new HTMLString.String(this._domElement.innerHTML.replace(/\u200B$/g, ''), this.content.preserveWhitespace());
      newSnapshot = this.content.html();
      if (snapshot !== newSnapshot) {
        this.taint();
      }
      return this._flagIfEmpty();
    };

    PreText.prototype._ensureEndZWS = function() {
      var html, _addZWS;
      if (!this._domElement.lastChild) {
        return;
      }
      html = this._domElement.innerHTML;
      if (html[html.length - 1] === '\u200B') {
        if (html.indexOf('\u200B') < html.length - 1) {
          return;
        }
      }
      _addZWS = (function(_this) {
        return function() {
          if (html.indexOf('\u200B') > -1) {
            _this._domElement.innerHTML = html.replace(/\u200B/g, '');
          }
          return _this._domElement.lastChild.textContent += '\u200B';
        };
      })(this);
      if (this._savedSelection) {
        return _addZWS();
      } else {
        this.storeState();
        _addZWS();
        return this.restoreState();
      }
    };

    PreText.droppers = {
      'PreText': ContentEdit.Element._dropVert,
      'Static': ContentEdit.Element._dropVert,
      'Text': ContentEdit.Element._dropVert
    };

    PreText.mergers = {};

    PreText.fromDOMElement = function(domElement) {
      return new this(domElement.tagName, this.getDOMElementAttributes(domElement), domElement.innerHTML);
    };

    return PreText;

  })(ContentEdit.Text);

  ContentEdit.TagNames.get().register(ContentEdit.PreText, 'pre');

  ContentEdit.Image = (function(_super) {
    __extends(Image, _super);

    function Image(attributes, a) {
      var size;
      Image.__super__.constructor.call(this, 'img', attributes);
      this.a = a ? a : null;
      size = this.size();
      this._aspectRatio = size[1] / size[0];
    }

    Image.prototype.cssTypeName = function() {
      return 'image';
    };

    Image.prototype.type = function() {
      return 'Image';
    };

    Image.prototype.typeName = function() {
      return 'Image';
    };

    Image.prototype.createDraggingDOMElement = function() {
      var helper;
      if (!this.isMounted()) {
        return;
      }
      helper = Image.__super__.createDraggingDOMElement.call(this);
      helper.style.backgroundImage = "url('" + this._attributes['src'] + "')";
      return helper;
    };

    Image.prototype.html = function(indent) {
      var attributes, img, le;
      if (indent == null) {
        indent = '';
      }
      img = "" + indent + "<img" + (this._attributesToString()) + ">";
      if (this.a) {
        le = ContentEdit.LINE_ENDINGS;
        attributes = ContentEdit.attributesToString(this.a);
        attributes = "" + attributes + " data-ce-tag=\"img\"";
        return ("" + indent + "<a " + attributes + ">" + le) + ("" + ContentEdit.INDENT + img + le) + ("" + indent + "</a>");
      } else {
        return img;
      }
    };

    Image.prototype.mount = function() {
      var classes, style;
      this._domElement = document.createElement('div');
      classes = '';
      if (this.a && this.a['class']) {
        classes += ' ' + this.a['class'];
      }
      if (this._attributes['class']) {
        classes += ' ' + this._attributes['class'];
      }
      this._domElement.setAttribute('class', classes);
      style = this._attributes['style'] ? this._attributes['style'] : '';
      style += "background-image:url('" + this._attributes['src'] + "');";
      if (this._attributes['width']) {
        style += "width:" + this._attributes['width'] + "px;";
      }
      if (this._attributes['height']) {
        style += "height:" + this._attributes['height'] + "px;";
      }
      this._domElement.setAttribute('style', style);
      return Image.__super__.mount.call(this);
    };

    Image.prototype.unmount = function() {
      var domElement, wrapper;
      if (this.isFixed()) {
        wrapper = document.createElement('div');
        wrapper.innerHTML = this.html();
        domElement = wrapper.querySelector('a, img');
        this._domElement.parentNode.replaceChild(domElement, this._domElement);
        this._domElement = domElement;
      }
      return Image.__super__.unmount.call(this);
    };

    Image.droppers = {
      'Image': ContentEdit.Element._dropBoth,
      'PreText': ContentEdit.Element._dropBoth,
      'Static': ContentEdit.Element._dropBoth,
      'Text': ContentEdit.Element._dropBoth
    };

    Image.placements = ['above', 'below', 'left', 'right', 'center'];

    Image.fromDOMElement = function(domElement) {
      var a, attributes, c, childNode, childNodes, height, width, _i, _len;
      a = null;
      if (domElement.tagName.toLowerCase() === 'a') {
        a = this.getDOMElementAttributes(domElement);
        childNodes = (function() {
          var _i, _len, _ref, _results;
          _ref = domElement.childNodes;
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            c = _ref[_i];
            _results.push(c);
          }
          return _results;
        })();
        for (_i = 0, _len = childNodes.length; _i < _len; _i++) {
          childNode = childNodes[_i];
          if (childNode.nodeType === 1 && childNode.tagName.toLowerCase() === 'img') {
            domElement = childNode;
            break;
          }
        }
        if (domElement.tagName.toLowerCase() === 'a') {
          domElement = document.createElement('img');
        }
      }
      attributes = this.getDOMElementAttributes(domElement);
      width = attributes['width'];
      height = attributes['height'];
      if (attributes['width'] === void 0) {
        if (attributes['height'] === void 0) {
          width = domElement.naturalWidth;
        } else {
          width = domElement.clientWidth;
        }
      }
      if (attributes['height'] === void 0) {
        if (attributes['width'] === void 0) {
          height = domElement.naturalHeight;
        } else {
          height = domElement.clientHeight;
        }
      }
      attributes['width'] = width;
      attributes['height'] = height;
      return new this(attributes, a);
    };

    return Image;

  })(ContentEdit.ResizableElement);

  ContentEdit.TagNames.get().register(ContentEdit.Image, 'img');

  ContentEdit.ImageFixture = (function(_super) {
    __extends(ImageFixture, _super);

    function ImageFixture(tagName, attributes, src) {
      ImageFixture.__super__.constructor.call(this, tagName, attributes);
      this._src = src;
    }

    ImageFixture.prototype.cssTypeName = function() {
      return 'image-fixture';
    };

    ImageFixture.prototype.type = function() {
      return 'ImageFixture';
    };

    ImageFixture.prototype.typeName = function() {
      return 'ImageFixture';
    };

    ImageFixture.prototype.html = function(indent) {
      var alt, attributes, img, le;
      if (indent == null) {
        indent = '';
      }
      le = ContentEdit.LINE_ENDINGS;
      attributes = this._attributesToString();
      alt = '';
      if (this._attributes['alt'] !== void 0) {
        alt = "alt=\"" + this._attributes['alt'] + "\"";
      }
      img = "" + indent + "<img src=\"" + (this.src()) + "\"" + alt + ">";
      return ("" + indent + "<" + (this.tagName()) + " " + attributes + ">" + le) + ("" + ContentEdit.INDENT + img + le) + ("" + indent + "</" + (this.tagName()) + ">");
    };

    ImageFixture.prototype.mount = function() {
      var classes, name, style, value, _ref;
      this._domElement = document.createElement(this.tagName());
      _ref = this._attributes;
      for (name in _ref) {
        value = _ref[name];
        if (name === 'alt' || name === 'style') {
          continue;
        }
        this._domElement.setAttribute(name, value);
      }
      classes = '';
      if (this.a && this.a['class']) {
        classes += ' ' + this.a['class'];
      }
      if (this._attributes['class']) {
        classes += ' ' + this._attributes['class'];
      }
      this._domElement.setAttribute('class', classes);
      style = this._attributes['style'] ? this._attributes['style'] : '';
      style = style.replace(/background-image:.+?(;|$)/i, '');
      style = [style.trim(), "background-image:url('" + (this.src()) + "');"].join(' ');
      this._domElement.setAttribute('style', style.trim());
      return ImageFixture.__super__.mount.call(this);
    };

    ImageFixture.prototype.src = function(src) {
      if (src === void 0) {
        return this._src;
      }
      this._src = src.toLowerCase();
      if (this.isMounted()) {
        this.unmount();
        this.mount();
      }
      return this.taint();
    };

    ImageFixture.prototype.unmount = function() {
      var domElement, wrapper;
      if (this.isFixed()) {
        wrapper = document.createElement('div');
        wrapper.innerHTML = this.html();
        domElement = wrapper.firstElementChild;
        this._domElement.parentNode.replaceChild(domElement, this._domElement);
        this._domElement = domElement;
        return this.parent()._domElement = this._domElement;
      } else {
        return ImageFixture.__super__.unmount.call(this);
      }
    };

    ImageFixture.prototype._attributesToString = function() {
      var attributes, k, style, v, _ref;
      if (this._attributes['style']) {
        style = this._attributes['style'] ? this._attributes['style'] : '';
        style = style.replace(/background-image:.+?(;|$)/i, '');
        style = [style.trim(), "background-image:url('" + (this.src()) + "');"].join(' ');
        this._attributes['style'] = style.trim();
      } else {
        this._attributes['style'] = "background-image:url('" + (this.src()) + "');";
      }
      attributes = {};
      _ref = this._attributes;
      for (k in _ref) {
        v = _ref[k];
        if (k === 'alt') {
          continue;
        }
        attributes[k] = v;
      }
      return ' ' + ContentEdit.attributesToString(attributes);
    };

    ImageFixture.droppers = {
      'ImageFixture': ContentEdit.Element._dropVert,
      'Image': ContentEdit.Element._dropVert,
      'PreText': ContentEdit.Element._dropVert,
      'Text': ContentEdit.Element._dropVert
    };

    ImageFixture.fromDOMElement = function(domElement) {
      var alt, attributes, c, childNode, childNodes, src, tagName, _i, _len;
      tagName = domElement.tagName;
      attributes = this.getDOMElementAttributes(domElement);
      src = '';
      alt = '';
      childNodes = (function() {
        var _i, _len, _ref, _results;
        _ref = domElement.childNodes;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          c = _ref[_i];
          _results.push(c);
        }
        return _results;
      })();
      for (_i = 0, _len = childNodes.length; _i < _len; _i++) {
        childNode = childNodes[_i];
        if (childNode.nodeType === 1 && childNode.tagName.toLowerCase() === 'img') {
          src = childNode.getAttribute('src') || '';
          alt = childNode.getAttribute('alt') || '';
          break;
        }
      }
      attributes = this.getDOMElementAttributes(domElement);
      attributes['alt'] = alt;
      return new this(domElement.tagName, attributes, src);
    };

    return ImageFixture;

  })(ContentEdit.Element);

  ContentEdit.TagNames.get().register(ContentEdit.ImageFixture, 'img-fixture');

  ContentEdit.Video = (function(_super) {
    __extends(Video, _super);

    function Video(tagName, attributes, sources) {
      var size;
      if (sources == null) {
        sources = [];
      }
      Video.__super__.constructor.call(this, tagName, attributes);
      this.sources = sources;
      size = this.size();
      this._aspectRatio = size[1] / size[0];
    }

    Video.prototype.cssTypeName = function() {
      return 'video';
    };

    Video.prototype.type = function() {
      return 'Video';
    };

    Video.prototype.typeName = function() {
      return 'Video';
    };

    Video.prototype._title = function() {
      var src;
      src = '';
      if (this.attr('src')) {
        src = this.attr('src');
      } else {
        if (this.sources.length) {
          src = this.sources[0]['src'];
        }
      }
      if (!src) {
        src = 'No video source set';
      }
      if (src.length > 80) {
        src = src.substr(0, 80) + '...';
      }
      return src;
    };

    Video.prototype.createDraggingDOMElement = function() {
      var helper;
      if (!this.isMounted()) {
        return;
      }
      helper = Video.__super__.createDraggingDOMElement.call(this);
      helper.innerHTML = this._title();
      return helper;
    };

    Video.prototype.html = function(indent) {
      var attributes, le, source, sourceStrings, _i, _len, _ref;
      if (indent == null) {
        indent = '';
      }
      le = ContentEdit.LINE_ENDINGS;
      if (this.tagName() === 'video') {
        sourceStrings = [];
        _ref = this.sources;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          source = _ref[_i];
          attributes = ContentEdit.attributesToString(source);
          sourceStrings.push("" + indent + ContentEdit.INDENT + "<source " + attributes + ">");
        }
        return ("" + indent + "<video" + (this._attributesToString()) + ">" + le) + sourceStrings.join(le) + ("" + le + indent + "</video>");
      } else {
        return ("" + indent + "<" + this._tagName + (this._attributesToString()) + ">") + ("</" + this._tagName + ">");
      }
    };

    Video.prototype.mount = function() {
      var style;
      this._domElement = document.createElement('div');
      if (this.a && this.a['class']) {
        this._domElement.setAttribute('class', this.a['class']);
      } else if (this._attributes['class']) {
        this._domElement.setAttribute('class', this._attributes['class']);
      }
      style = this._attributes['style'] ? this._attributes['style'] : '';
      if (this._attributes['width']) {
        style += "width:" + this._attributes['width'] + "px;";
      }
      if (this._attributes['height']) {
        style += "height:" + this._attributes['height'] + "px;";
      }
      this._domElement.setAttribute('style', style);
      this._domElement.setAttribute('data-ce-title', this._title());
      return Video.__super__.mount.call(this);
    };

    Video.prototype.unmount = function() {
      var domElement, wrapper;
      if (this.isFixed()) {
        wrapper = document.createElement('div');
        wrapper.innerHTML = this.html();
        domElement = wrapper.querySelector('iframe');
        this._domElement.parentNode.replaceChild(domElement, this._domElement);
        this._domElement = domElement;
      }
      return Video.__super__.unmount.call(this);
    };

    Video.droppers = {
      'Image': ContentEdit.Element._dropBoth,
      'PreText': ContentEdit.Element._dropBoth,
      'Static': ContentEdit.Element._dropBoth,
      'Text': ContentEdit.Element._dropBoth,
      'Video': ContentEdit.Element._dropBoth
    };

    Video.placements = ['above', 'below', 'left', 'right', 'center'];

    Video.fromDOMElement = function(domElement) {
      var c, childNode, childNodes, sources, _i, _len;
      childNodes = (function() {
        var _i, _len, _ref, _results;
        _ref = domElement.childNodes;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          c = _ref[_i];
          _results.push(c);
        }
        return _results;
      })();
      sources = [];
      for (_i = 0, _len = childNodes.length; _i < _len; _i++) {
        childNode = childNodes[_i];
        if (childNode.nodeType === 1 && childNode.tagName.toLowerCase() === 'source') {
          sources.push(this.getDOMElementAttributes(childNode));
        }
      }
      return new this(domElement.tagName, this.getDOMElementAttributes(domElement), sources);
    };

    return Video;

  })(ContentEdit.ResizableElement);

  ContentEdit.TagNames.get().register(ContentEdit.Video, 'iframe', 'video');

  ContentEdit.List = (function(_super) {
    __extends(List, _super);

    function List(tagName, attributes) {
      List.__super__.constructor.call(this, tagName, attributes);
    }

    List.prototype.cssTypeName = function() {
      return 'list';
    };

    List.prototype.type = function() {
      return 'List';
    };

    List.prototype.typeName = function() {
      return 'List';
    };

    List.prototype._onMouseOver = function(ev) {
      if (this.parent().type() === 'ListItem') {
        return;
      }
      List.__super__._onMouseOver.call(this, ev);
      return this._removeCSSClass('ce-element--over');
    };

    List.droppers = {
      'Image': ContentEdit.Element._dropBoth,
      'ImageFixture': ContentEdit.Element._dropVert,
      'List': ContentEdit.Element._dropVert,
      'PreText': ContentEdit.Element._dropVert,
      'Static': ContentEdit.Element._dropVert,
      'Text': ContentEdit.Element._dropVert,
      'Video': ContentEdit.Element._dropBoth
    };

    List.fromDOMElement = function(domElement) {
      var c, childNode, childNodes, list, _i, _len;
      list = new this(domElement.tagName, this.getDOMElementAttributes(domElement));
      childNodes = (function() {
        var _i, _len, _ref, _results;
        _ref = domElement.childNodes;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          c = _ref[_i];
          _results.push(c);
        }
        return _results;
      })();
      for (_i = 0, _len = childNodes.length; _i < _len; _i++) {
        childNode = childNodes[_i];
        if (childNode.nodeType !== 1) {
          continue;
        }
        if (childNode.tagName.toLowerCase() !== 'li') {
          continue;
        }
        list.attach(ContentEdit.ListItem.fromDOMElement(childNode));
      }
      if (list.children.length === 0) {
        return null;
      }
      return list;
    };

    return List;

  })(ContentEdit.ElementCollection);

  ContentEdit.TagNames.get().register(ContentEdit.List, 'ol', 'ul');

  ContentEdit.ListItem = (function(_super) {
    __extends(ListItem, _super);

    function ListItem(attributes) {
      ListItem.__super__.constructor.call(this, 'li', attributes);
      this._behaviours['indent'] = true;
    }

    ListItem.prototype.cssTypeName = function() {
      return 'list-item';
    };

    ListItem.prototype.list = function() {
      if (this.children.length === 2) {
        return this.children[1];
      }
      return null;
    };

    ListItem.prototype.listItemText = function() {
      if (this.children.length > 0) {
        return this.children[0];
      }
      return null;
    };

    ListItem.prototype.type = function() {
      return 'ListItem';
    };

    ListItem.prototype.html = function(indent) {
      var lines;
      if (indent == null) {
        indent = '';
      }
      lines = ["" + indent + "<li" + (this._attributesToString()) + ">"];
      if (this.listItemText()) {
        lines.push(this.listItemText().html(indent + ContentEdit.INDENT));
      }
      if (this.list()) {
        lines.push(this.list().html(indent + ContentEdit.INDENT));
      }
      lines.push("" + indent + "</li>");
      return lines.join(ContentEdit.LINE_ENDINGS);
    };

    ListItem.prototype.indent = function() {
      var sibling;
      if (!this.can('indent')) {
        return;
      }
      if (this.parent().children.indexOf(this) === 0) {
        return;
      }
      sibling = this.previousSibling();
      if (!sibling.list()) {
        sibling.attach(new ContentEdit.List(sibling.parent().tagName()));
      }
      this.listItemText().storeState();
      this.parent().detach(this);
      sibling.list().attach(this);
      return this.listItemText().restoreState();
    };

    ListItem.prototype.remove = function() {
      var child, i, index, _i, _len, _ref;
      if (!this.parent()) {
        return;
      }
      index = this.parent().children.indexOf(this);
      if (this.list()) {
        _ref = this.list().children.slice();
        for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
          child = _ref[i];
          child.parent().detach(child);
          this.parent().attach(child, i + index);
        }
      }
      return this.parent().detach(this);
    };

    ListItem.prototype.unindent = function() {
      var child, grandParent, i, itemIndex, list, parent, parentIndex, selection, sibling, siblings, text, _i, _j, _k, _l, _len, _len1, _len2, _len3, _ref, _ref1;
      if (!this.can('indent')) {
        return;
      }
      parent = this.parent();
      grandParent = parent.parent();
      siblings = parent.children.slice(parent.children.indexOf(this) + 1, parent.children.length);
      if (grandParent.type() === 'ListItem') {
        this.listItemText().storeState();
        parent.detach(this);
        grandParent.parent().attach(this, grandParent.parent().children.indexOf(grandParent) + 1);
        if (siblings.length && !this.list()) {
          this.attach(new ContentEdit.List(parent.tagName()));
        }
        for (_i = 0, _len = siblings.length; _i < _len; _i++) {
          sibling = siblings[_i];
          sibling.parent().detach(sibling);
          this.list().attach(sibling);
        }
        return this.listItemText().restoreState();
      } else {
        text = new ContentEdit.Text('p', this.attr('class') ? {
          'class': this.attr('class')
        } : {}, this.listItemText().content);
        selection = null;
        if (this.listItemText().isFocused()) {
          selection = ContentSelect.Range.query(this.listItemText().domElement());
        }
        parentIndex = grandParent.children.indexOf(parent);
        itemIndex = parent.children.indexOf(this);
        if (itemIndex === 0) {
          list = null;
          if (parent.children.length === 1) {
            if (this.list()) {
              list = new ContentEdit.List(parent.tagName());
            }
            grandParent.detach(parent);
          } else {
            parent.detach(this);
          }
          grandParent.attach(text, parentIndex);
          if (list) {
            grandParent.attach(list, parentIndex + 1);
          }
          if (this.list()) {
            _ref = this.list().children.slice();
            for (i = _j = 0, _len1 = _ref.length; _j < _len1; i = ++_j) {
              child = _ref[i];
              child.parent().detach(child);
              if (list) {
                list.attach(child);
              } else {
                parent.attach(child, i);
              }
            }
          }
        } else if (itemIndex === parent.children.length - 1) {
          parent.detach(this);
          grandParent.attach(text, parentIndex + 1);
          if (this.list()) {
            grandParent.attach(this.list(), parentIndex + 2);
          }
        } else {
          parent.detach(this);
          grandParent.attach(text, parentIndex + 1);
          list = new ContentEdit.List(parent.tagName());
          grandParent.attach(list, parentIndex + 2);
          if (this.list()) {
            _ref1 = this.list().children.slice();
            for (_k = 0, _len2 = _ref1.length; _k < _len2; _k++) {
              child = _ref1[_k];
              child.parent().detach(child);
              list.attach(child);
            }
          }
          for (_l = 0, _len3 = siblings.length; _l < _len3; _l++) {
            sibling = siblings[_l];
            sibling.parent().detach(sibling);
            list.attach(sibling);
          }
        }
        if (selection) {
          text.focus();
          return selection.select(text.domElement());
        }
      }
    };

    ListItem.prototype._onMouseOver = function(ev) {
      ListItem.__super__._onMouseOver.call(this, ev);
      return this._removeCSSClass('ce-element--over');
    };

    ListItem.prototype._addDOMEventListeners = function() {};

    ListItem.prototype._removeDOMEventListners = function() {};

    ListItem.fromDOMElement = function(domElement) {
      var childNode, content, listDOMElement, listElement, listItem, listItemText, _i, _len, _ref, _ref1;
      listItem = new this(this.getDOMElementAttributes(domElement));
      content = '';
      listDOMElement = null;
      _ref = domElement.childNodes;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        childNode = _ref[_i];
        if (childNode.nodeType === 1) {
          if ((_ref1 = childNode.tagName.toLowerCase()) === 'ul' || _ref1 === 'ol' || _ref1 === 'li') {
            if (!listDOMElement) {
              listDOMElement = childNode;
            }
          } else {
            content += childNode.outerHTML;
          }
        } else {
          content += HTMLString.String.encode(childNode.textContent);
        }
      }
      content = content.replace(/^\s+|\s+$/g, '');
      listItemText = new ContentEdit.ListItemText(content);
      listItem.attach(listItemText);
      if (listDOMElement) {
        listElement = ContentEdit.List.fromDOMElement(listDOMElement);
        listItem.attach(listElement);
      }
      return listItem;
    };

    return ListItem;

  })(ContentEdit.ElementCollection);

  ContentEdit.ListItemText = (function(_super) {
    __extends(ListItemText, _super);

    function ListItemText(content) {
      ListItemText.__super__.constructor.call(this, 'div', {}, content);
    }

    ListItemText.prototype.cssTypeName = function() {
      return 'list-item-text';
    };

    ListItemText.prototype.type = function() {
      return 'ListItemText';
    };

    ListItemText.prototype.typeName = function() {
      return 'List item';
    };

    ListItemText.prototype.blur = function() {
      if (this.content.isWhitespace() && this.can('remove')) {
        this.parent().remove();
      } else if (this.isMounted()) {
        this._domElement.blur();
        this._domElement.removeAttribute('contenteditable');
      }
      return ContentEdit.Element.prototype.blur.call(this);
    };

    ListItemText.prototype.can = function(behaviour, allowed) {
      if (allowed) {
        throw new Error('Cannot set behaviour for ListItemText');
      }
      return this.parent().can(behaviour);
    };

    ListItemText.prototype.html = function(indent) {
      var content;
      if (indent == null) {
        indent = '';
      }
      if (!this._lastCached || this._lastCached < this._modified) {
        if (ContentEdit.TRIM_WHITESPACE) {
          content = this.content.copy().trim();
        } else {
          content = this.content.copy();
        }
        content.optimize();
        this._lastCached = Date.now();
        this._cached = content.html();
      }
      return "" + indent + this._cached;
    };

    ListItemText.prototype._onMouseDown = function(ev) {
      var initDrag;
      ContentEdit.Element.prototype._onMouseDown.call(this, ev);
      initDrag = (function(_this) {
        return function() {
          var listRoot;
          if (ContentEdit.Root.get().dragging() === _this) {
            ContentEdit.Root.get().cancelDragging();
            listRoot = _this.closest(function(node) {
              return node.parent().type() === 'Region';
            });
            return listRoot.drag(ev.pageX, ev.pageY);
          } else {
            _this.drag(ev.pageX, ev.pageY);
            return _this._dragTimeout = setTimeout(initDrag, ContentEdit.DRAG_HOLD_DURATION * 2);
          }
        };
      })(this);
      clearTimeout(this._dragTimeout);
      return this._dragTimeout = setTimeout(initDrag, ContentEdit.DRAG_HOLD_DURATION);
    };

    ListItemText.prototype._onMouseMove = function(ev) {
      if (this._dragTimeout) {
        clearTimeout(this._dragTimeout);
      }
      return ContentEdit.Element.prototype._onMouseMove.call(this, ev);
    };

    ListItemText.prototype._onMouseUp = function(ev) {
      if (this._dragTimeout) {
        clearTimeout(this._dragTimeout);
      }
      return ContentEdit.Element.prototype._onMouseUp.call(this, ev);
    };

    ListItemText.prototype._keyTab = function(ev) {
      ev.preventDefault();
      if (ev.shiftKey) {
        return this.parent().unindent();
      } else {
        return this.parent().indent();
      }
    };

    ListItemText.prototype._keyReturn = function(ev) {
      var grandParent, list, listItem, selection, tail, tip;
      ev.preventDefault();
      if (this.content.isWhitespace()) {
        this.parent().unindent();
        return;
      }
      if (!this.can('spawn')) {
        return;
      }
      ContentSelect.Range.query(this._domElement);
      selection = ContentSelect.Range.query(this._domElement);
      tip = this.content.substring(0, selection.get()[0]);
      tail = this.content.substring(selection.get()[1]);
      if (tip.length() + tail.length() === 0) {
        this.parent().unindent();
        return;
      }
      this.content = tip.trim();
      this.updateInnerHTML();
      grandParent = this.parent().parent();
      listItem = new ContentEdit.ListItem(this.attr('class') ? {
        'class': this.attr('class')
      } : {});
      grandParent.attach(listItem, grandParent.children.indexOf(this.parent()) + 1);
      listItem.attach(new ContentEdit.ListItemText(tail.trim()));
      list = this.parent().list();
      if (list) {
        this.parent().detach(list);
        listItem.attach(list);
      }
      if (tip.length()) {
        listItem.listItemText().focus();
        selection = new ContentSelect.Range(0, 0);
        selection.select(listItem.listItemText().domElement());
      } else {
        selection = new ContentSelect.Range(0, tip.length());
        selection.select(this._domElement);
      }
      return this.taint();
    };

    ListItemText.droppers = {
      'ListItemText': function(element, target, placement) {
        var elementParent, insertIndex, listItem, targetParent;
        elementParent = element.parent();
        targetParent = target.parent();
        elementParent.remove();
        elementParent.detach(element);
        listItem = new ContentEdit.ListItem(elementParent._attributes);
        listItem.attach(element);
        if (targetParent.list() && placement[0] === 'below') {
          targetParent.list().attach(listItem, 0);
          return;
        }
        insertIndex = targetParent.parent().children.indexOf(targetParent);
        if (placement[0] === 'below') {
          insertIndex += 1;
        }
        return targetParent.parent().attach(listItem, insertIndex);
      },
      'Text': function(element, target, placement) {
        var cssClass, insertIndex, listItem, targetParent, text;
        if (element.type() === 'Text') {
          targetParent = target.parent();
          element.parent().detach(element);
          cssClass = element.attr('class');
          listItem = new ContentEdit.ListItem(cssClass ? {
            'class': cssClass
          } : {});
          listItem.attach(new ContentEdit.ListItemText(element.content));
          if (targetParent.list() && placement[0] === 'below') {
            targetParent.list().attach(listItem, 0);
            return;
          }
          insertIndex = targetParent.parent().children.indexOf(targetParent);
          if (placement[0] === 'below') {
            insertIndex += 1;
          }
          targetParent.parent().attach(listItem, insertIndex);
          listItem.listItemText().focus();
          if (element._savedSelection) {
            return element._savedSelection.select(listItem.listItemText().domElement());
          }
        } else {
          cssClass = element.attr('class');
          text = new ContentEdit.Text('p', cssClass ? {
            'class': cssClass
          } : {}, element.content);
          element.parent().remove();
          insertIndex = target.parent().children.indexOf(target);
          if (placement[0] === 'below') {
            insertIndex += 1;
          }
          target.parent().attach(text, insertIndex);
          text.focus();
          if (element._savedSelection) {
            return element._savedSelection.select(text.domElement());
          }
        }
      }
    };

    ListItemText.mergers = {
      'ListItemText': function(element, target) {
        var offset;
        offset = target.content.length();
        if (element.content.length()) {
          target.content = target.content.concat(element.content);
        }
        if (target.isMounted()) {
          target._domElement.innerHTML = target.content.html();
        }
        target.focus();
        new ContentSelect.Range(offset, offset).select(target._domElement);
        if (element.type() === 'Text') {
          if (element.parent()) {
            element.parent().detach(element);
          }
        } else {
          element.parent().remove();
        }
        return target.taint();
      }
    };

    return ListItemText;

  })(ContentEdit.Text);

  _mergers = ContentEdit.ListItemText.mergers;

  _mergers['Text'] = _mergers['ListItemText'];

  ContentEdit.Table = (function(_super) {
    __extends(Table, _super);

    function Table(attributes) {
      Table.__super__.constructor.call(this, 'table', attributes);
    }

    Table.prototype.cssTypeName = function() {
      return 'table';
    };

    Table.prototype.typeName = function() {
      return 'Table';
    };

    Table.prototype.type = function() {
      return 'Table';
    };

    Table.prototype.firstSection = function() {
      var section;
      if (section = this.thead()) {
        return section;
      } else if (section = this.tbody()) {
        return section;
      } else if (section = this.tfoot()) {
        return section;
      }
      return null;
    };

    Table.prototype.lastSection = function() {
      var section;
      if (section = this.tfoot()) {
        return section;
      } else if (section = this.tbody()) {
        return section;
      } else if (section = this.thead()) {
        return section;
      }
      return null;
    };

    Table.prototype.tbody = function() {
      return this._getChild('tbody');
    };

    Table.prototype.tfoot = function() {
      return this._getChild('tfoot');
    };

    Table.prototype.thead = function() {
      return this._getChild('thead');
    };

    Table.prototype._onMouseOver = function(ev) {
      Table.__super__._onMouseOver.call(this, ev);
      return this._removeCSSClass('ce-element--over');
    };

    Table.prototype._getChild = function(tagName) {
      var child, _i, _len, _ref;
      _ref = this.children;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        child = _ref[_i];
        if (child.tagName() === tagName) {
          return child;
        }
      }
      return null;
    };

    Table.droppers = {
      'Image': ContentEdit.Element._dropBoth,
      'ImageFixture': ContentEdit.Element._dropVert,
      'List': ContentEdit.Element._dropVert,
      'PreText': ContentEdit.Element._dropVert,
      'Static': ContentEdit.Element._dropVert,
      'Table': ContentEdit.Element._dropVert,
      'Text': ContentEdit.Element._dropVert,
      'Video': ContentEdit.Element._dropBoth
    };

    Table.fromDOMElement = function(domElement) {
      var c, childNode, childNodes, orphanRows, row, section, table, tagName, _i, _j, _len, _len1;
      table = new this(this.getDOMElementAttributes(domElement));
      childNodes = (function() {
        var _i, _len, _ref, _results;
        _ref = domElement.childNodes;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          c = _ref[_i];
          _results.push(c);
        }
        return _results;
      })();
      orphanRows = [];
      for (_i = 0, _len = childNodes.length; _i < _len; _i++) {
        childNode = childNodes[_i];
        if (childNode.nodeType !== 1) {
          continue;
        }
        tagName = childNode.tagName.toLowerCase();
        if (table._getChild(tagName)) {
          continue;
        }
        switch (tagName) {
          case 'tbody':
          case 'tfoot':
          case 'thead':
            section = ContentEdit.TableSection.fromDOMElement(childNode);
            table.attach(section);
            break;
          case 'tr':
            orphanRows.push(ContentEdit.TableRow.fromDOMElement(childNode));
        }
      }
      if (orphanRows.length > 0) {
        if (!table._getChild('tbody')) {
          table.attach(new ContentEdit.TableSection('tbody'));
        }
        for (_j = 0, _len1 = orphanRows.length; _j < _len1; _j++) {
          row = orphanRows[_j];
          table.tbody().attach(row);
        }
      }
      if (table.children.length === 0) {
        return null;
      }
      return table;
    };

    return Table;

  })(ContentEdit.ElementCollection);

  ContentEdit.TagNames.get().register(ContentEdit.Table, 'table');

  ContentEdit.TableSection = (function(_super) {
    __extends(TableSection, _super);

    function TableSection(tagName, attributes) {
      TableSection.__super__.constructor.call(this, tagName, attributes);
    }

    TableSection.prototype.cssTypeName = function() {
      return 'table-section';
    };

    TableSection.prototype.type = function() {
      return 'TableSection';
    };

    TableSection.prototype._onMouseOver = function(ev) {
      TableSection.__super__._onMouseOver.call(this, ev);
      return this._removeCSSClass('ce-element--over');
    };

    TableSection.fromDOMElement = function(domElement) {
      var c, childNode, childNodes, section, _i, _len;
      section = new this(domElement.tagName, this.getDOMElementAttributes(domElement));
      childNodes = (function() {
        var _i, _len, _ref, _results;
        _ref = domElement.childNodes;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          c = _ref[_i];
          _results.push(c);
        }
        return _results;
      })();
      for (_i = 0, _len = childNodes.length; _i < _len; _i++) {
        childNode = childNodes[_i];
        if (childNode.nodeType !== 1) {
          continue;
        }
        if (childNode.tagName.toLowerCase() !== 'tr') {
          continue;
        }
        section.attach(ContentEdit.TableRow.fromDOMElement(childNode));
      }
      return section;
    };

    return TableSection;

  })(ContentEdit.ElementCollection);

  ContentEdit.TableRow = (function(_super) {
    __extends(TableRow, _super);

    function TableRow(attributes) {
      TableRow.__super__.constructor.call(this, 'tr', attributes);
    }

    TableRow.prototype.cssTypeName = function() {
      return 'table-row';
    };

    TableRow.prototype.isEmpty = function() {
      var cell, text, _i, _len, _ref;
      _ref = this.children;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        cell = _ref[_i];
        text = cell.tableCellText();
        if (text && text.content.length() > 0) {
          return false;
        }
      }
      return true;
    };

    TableRow.prototype.type = function() {
      return 'TableRow';
    };

    TableRow.prototype.typeName = function() {
      return 'Table row';
    };

    TableRow.prototype._onMouseOver = function(ev) {
      TableRow.__super__._onMouseOver.call(this, ev);
      return this._removeCSSClass('ce-element--over');
    };

    TableRow.droppers = {
      'TableRow': ContentEdit.Element._dropVert
    };

    TableRow.fromDOMElement = function(domElement) {
      var c, childNode, childNodes, row, tagName, _i, _len;
      row = new this(this.getDOMElementAttributes(domElement));
      childNodes = (function() {
        var _i, _len, _ref, _results;
        _ref = domElement.childNodes;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          c = _ref[_i];
          _results.push(c);
        }
        return _results;
      })();
      for (_i = 0, _len = childNodes.length; _i < _len; _i++) {
        childNode = childNodes[_i];
        if (childNode.nodeType !== 1) {
          continue;
        }
        tagName = childNode.tagName.toLowerCase();
        if (!(tagName === 'td' || tagName === 'th')) {
          continue;
        }
        row.attach(ContentEdit.TableCell.fromDOMElement(childNode));
      }
      return row;
    };

    return TableRow;

  })(ContentEdit.ElementCollection);

  ContentEdit.TableCell = (function(_super) {
    __extends(TableCell, _super);

    function TableCell(tagName, attributes) {
      TableCell.__super__.constructor.call(this, tagName, attributes);
    }

    TableCell.prototype.cssTypeName = function() {
      return 'table-cell';
    };

    TableCell.prototype.tableCellText = function() {
      if (this.children.length > 0) {
        return this.children[0];
      }
      return null;
    };

    TableCell.prototype.type = function() {
      return 'TableCell';
    };

    TableCell.prototype.html = function(indent) {
      var lines;
      if (indent == null) {
        indent = '';
      }
      lines = ["" + indent + "<" + (this.tagName()) + (this._attributesToString()) + ">"];
      if (this.tableCellText()) {
        lines.push(this.tableCellText().html(indent + ContentEdit.INDENT));
      }
      lines.push("" + indent + "</" + (this.tagName()) + ">");
      return lines.join(ContentEdit.LINE_ENDINGS);
    };

    TableCell.prototype._onMouseOver = function(ev) {
      TableCell.__super__._onMouseOver.call(this, ev);
      return this._removeCSSClass('ce-element--over');
    };

    TableCell.prototype._addDOMEventListeners = function() {};

    TableCell.prototype._removeDOMEventListners = function() {};

    TableCell.fromDOMElement = function(domElement) {
      var tableCell, tableCellText;
      tableCell = new this(domElement.tagName, this.getDOMElementAttributes(domElement));
      tableCellText = new ContentEdit.TableCellText(domElement.innerHTML.replace(/^\s+|\s+$/g, ''));
      tableCell.attach(tableCellText);
      return tableCell;
    };

    return TableCell;

  })(ContentEdit.ElementCollection);

  ContentEdit.TableCellText = (function(_super) {
    __extends(TableCellText, _super);

    function TableCellText(content) {
      TableCellText.__super__.constructor.call(this, 'div', {}, content);
    }

    TableCellText.prototype.cssTypeName = function() {
      return 'table-cell-text';
    };

    TableCellText.prototype.type = function() {
      return 'TableCellText';
    };

    TableCellText.prototype._isInFirstRow = function() {
      var cell, row, section, table;
      cell = this.parent();
      row = cell.parent();
      section = row.parent();
      table = section.parent();
      if (section !== table.firstSection()) {
        return false;
      }
      return row === section.children[0];
    };

    TableCellText.prototype._isInLastRow = function() {
      var cell, row, section, table;
      cell = this.parent();
      row = cell.parent();
      section = row.parent();
      table = section.parent();
      if (section !== table.lastSection()) {
        return false;
      }
      return row === section.children[section.children.length - 1];
    };

    TableCellText.prototype._isLastInSection = function() {
      var cell, row, section;
      cell = this.parent();
      row = cell.parent();
      section = row.parent();
      if (row !== section.children[section.children.length - 1]) {
        return false;
      }
      return cell === row.children[row.children.length - 1];
    };

    TableCellText.prototype.blur = function() {
      if (this.isMounted()) {
        this._domElement.blur();
        this._domElement.removeAttribute('contenteditable');
      }
      return ContentEdit.Element.prototype.blur.call(this);
    };

    TableCellText.prototype.can = function(behaviour, allowed) {
      if (allowed) {
        throw new Error('Cannot set behaviour for ListItemText');
      }
      return this.parent().can(behaviour);
    };

    TableCellText.prototype.html = function(indent) {
      var content;
      if (indent == null) {
        indent = '';
      }
      if (!this._lastCached || this._lastCached < this._modified) {
        if (ContentEdit.TRIM_WHITESPACE) {
          content = this.content.copy().trim();
        } else {
          content = this.content.copy();
        }
        content.optimize();
        this._lastCached = Date.now();
        this._cached = content.html();
      }
      return "" + indent + this._cached;
    };

    TableCellText.prototype._onMouseDown = function(ev) {
      var initDrag;
      ContentEdit.Element.prototype._onMouseDown.call(this, ev);
      initDrag = (function(_this) {
        return function() {
          var cell, table;
          cell = _this.parent();
          if (ContentEdit.Root.get().dragging() === cell.parent()) {
            ContentEdit.Root.get().cancelDragging();
            table = cell.parent().parent().parent();
            return table.drag(ev.pageX, ev.pageY);
          } else {
            cell.parent().drag(ev.pageX, ev.pageY);
            return _this._dragTimeout = setTimeout(initDrag, ContentEdit.DRAG_HOLD_DURATION * 2);
          }
        };
      })(this);
      clearTimeout(this._dragTimeout);
      return this._dragTimeout = setTimeout(initDrag, ContentEdit.DRAG_HOLD_DURATION);
    };

    TableCellText.prototype._keyBack = function(ev) {
      var cell, previous, row, selection;
      selection = ContentSelect.Range.query(this._domElement);
      if (!(selection.get()[0] === 0 && selection.isCollapsed())) {
        return;
      }
      ev.preventDefault();
      cell = this.parent();
      row = cell.parent();
      if (!(row.isEmpty() && row.can('remove'))) {
        return;
      }
      if (this.content.length() === 0 && row.children.indexOf(cell) === 0) {
        previous = this.previousContent();
        if (previous) {
          previous.focus();
          selection = new ContentSelect.Range(previous.content.length(), previous.content.length());
          selection.select(previous.domElement());
        }
        return row.parent().detach(row);
      }
    };

    TableCellText.prototype._keyDelete = function(ev) {
      var lastChild, nextElement, row, selection;
      row = this.parent().parent();
      if (!(row.isEmpty() && row.can('remove'))) {
        return;
      }
      ev.preventDefault();
      lastChild = row.children[row.children.length - 1];
      nextElement = lastChild.tableCellText().nextContent();
      if (nextElement) {
        nextElement.focus();
        selection = new ContentSelect.Range(0, 0);
        selection.select(nextElement.domElement());
      }
      return row.parent().detach(row);
    };

    TableCellText.prototype._keyDown = function(ev) {
      var cell, cellIndex, lastCell, next, nextRow, row, selection;
      selection = ContentSelect.Range.query(this._domElement);
      if (!(this._atEnd(selection) && selection.isCollapsed())) {
        return;
      }
      ev.preventDefault();
      cell = this.parent();
      if (this._isInLastRow()) {
        row = cell.parent();
        lastCell = row.children[row.children.length - 1].tableCellText();
        next = lastCell.nextContent();
        if (next) {
          return next.focus();
        } else {
          return ContentEdit.Root.get().trigger('next-region', this.closest(function(node) {
            return node.type() === 'Fixture' || node.type() === 'Region';
          }));
        }
      } else {
        nextRow = cell.parent().nextWithTest(function(node) {
          return node.type() === 'TableRow';
        });
        cellIndex = cell.parent().children.indexOf(cell);
        cellIndex = Math.min(cellIndex, nextRow.children.length);
        return nextRow.children[cellIndex].tableCellText().focus();
      }
    };

    TableCellText.prototype._keyReturn = function(ev) {
      ev.preventDefault();
      return this._keyTab({
        'shiftKey': false,
        'preventDefault': function() {}
      });
    };

    TableCellText.prototype._keyTab = function(ev) {
      var cell, child, grandParent, newCell, newCellText, row, section, _i, _len, _ref;
      ev.preventDefault();
      cell = this.parent();
      if (ev.shiftKey) {
        if (this._isInFirstRow() && cell.parent().children[0] === cell) {
          return;
        }
        return this.previousContent().focus();
      } else {
        if (!this.can('spawn')) {
          return;
        }
        grandParent = cell.parent().parent();
        if (grandParent.tagName() === 'tbody' && this._isLastInSection()) {
          row = new ContentEdit.TableRow();
          _ref = cell.parent().children;
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            child = _ref[_i];
            newCell = new ContentEdit.TableCell(child.tagName(), child._attributes);
            newCellText = new ContentEdit.TableCellText('');
            newCell.attach(newCellText);
            row.attach(newCell);
          }
          section = this.closest(function(node) {
            return node.type() === 'TableSection';
          });
          section.attach(row);
          return row.children[0].tableCellText().focus();
        } else {
          return this.nextContent().focus();
        }
      }
    };

    TableCellText.prototype._keyUp = function(ev) {
      var cell, cellIndex, previous, previousRow, row, selection;
      selection = ContentSelect.Range.query(this._domElement);
      if (!(selection.get()[0] === 0 && selection.isCollapsed())) {
        return;
      }
      ev.preventDefault();
      cell = this.parent();
      if (this._isInFirstRow()) {
        row = cell.parent();
        previous = row.children[0].previousContent();
        if (previous) {
          return previous.focus();
        } else {
          return ContentEdit.Root.get().trigger('previous-region', this.closest(function(node) {
            return node.type() === 'Fixture' || node.type() === 'Region';
          }));
        }
      } else {
        previousRow = cell.parent().previousWithTest(function(node) {
          return node.type() === 'TableRow';
        });
        cellIndex = cell.parent().children.indexOf(cell);
        cellIndex = Math.min(cellIndex, previousRow.children.length);
        return previousRow.children[cellIndex].tableCellText().focus();
      }
    };

    TableCellText.droppers = {};

    TableCellText.mergers = {};

    return TableCellText;

  })(ContentEdit.Text);

}).call(this);

(function() {
  var AttributeUI, ContentTools, CropMarksUI, StyleUI, exports, _EditorApp,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __slice = [].slice;

  ContentTools = {
    Tools: {},
    CANCEL_MESSAGE: 'Your changes have not been saved, do you really want to lose them?'.trim(),
    DEFAULT_TOOLS: [['bold', 'italic', 'link', 'align-left', 'align-center', 'align-right'], ['heading', 'subheading', 'paragraph', 'unordered-list', 'ordered-list', 'table', 'indent', 'unindent', 'line-break'], ['image', 'video', 'preformatted'], ['undo', 'redo', 'remove']],
    DEFAULT_VIDEO_HEIGHT: 300,
    DEFAULT_VIDEO_WIDTH: 400,
    HIGHLIGHT_HOLD_DURATION: 2000,
    INSPECTOR_IGNORED_ELEMENTS: ['Fixture', 'ListItemText', 'Region', 'TableCellText'],
    IMAGE_UPLOADER: null,
    MIN_CROP: 10,
    RESTRICTED_ATTRIBUTES: {
      '*': ['style'],
      'img': ['height', 'src', 'width', 'data-ce-max-width', 'data-ce-min-width'],
      'iframe': ['height', 'width']
    },
    getEmbedVideoURL: function(url) {
      var domains, id, k, kv, m, netloc, paramStr, params, paramsStr, parser, path, v, _i, _len, _ref;
      domains = {
        'www.youtube.com': 'youtube',
        'youtu.be': 'youtube',
        'vimeo.com': 'vimeo',
        'player.vimeo.com': 'vimeo'
      };
      parser = document.createElement('a');
      parser.href = url;
      netloc = parser.hostname.toLowerCase();
      path = parser.pathname;
      if (path !== null && path.substr(0, 1) !== "/") {
        path = "/" + path;
      }
      params = {};
      paramsStr = parser.search.slice(1);
      _ref = paramsStr.split('&');
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        kv = _ref[_i];
        kv = kv.split("=");
        if (kv[0]) {
          params[kv[0]] = kv[1];
        }
      }
      switch (domains[netloc]) {
        case 'youtube':
          if (path.toLowerCase() === '/watch') {
            if (!params['v']) {
              return null;
            }
            id = params['v'];
            delete params['v'];
          } else {
            m = path.match(/\/([A-Za-z0-9_-]+)$/i);
            if (!m) {
              return null;
            }
            id = m[1];
          }
          url = "https://www.youtube.com/embed/" + id;
          paramStr = ((function() {
            var _results;
            _results = [];
            for (k in params) {
              v = params[k];
              _results.push("" + k + "=" + v);
            }
            return _results;
          })()).join('&');
          if (paramStr) {
            url += "?" + paramStr;
          }
          return url;
        case 'vimeo':
          m = path.match(/\/(\w+\/\w+\/){0,1}(\d+)/i);
          if (!m) {
            return null;
          }
          url = "https://player.vimeo.com/video/" + m[2];
          paramStr = ((function() {
            var _results;
            _results = [];
            for (k in params) {
              v = params[k];
              _results.push("" + k + "=" + v);
            }
            return _results;
          })()).join('&');
          if (paramStr) {
            url += "?" + paramStr;
          }
          return url;
      }
      return null;
    },
    getRestrictedAtributes: function(tagName) {
      var restricted;
      restricted = [];
      if (ContentTools.RESTRICTED_ATTRIBUTES[tagName]) {
        restricted = restricted.concat(ContentTools.RESTRICTED_ATTRIBUTES[tagName]);
      }
      if (ContentTools.RESTRICTED_ATTRIBUTES['*']) {
        restricted = restricted.concat(ContentTools.RESTRICTED_ATTRIBUTES['*']);
      }
      return restricted;
    },
    getScrollPosition: function() {
      var isCSS1Compat, supportsPageOffset;
      supportsPageOffset = window.pageXOffset !== void 0;
      isCSS1Compat = (document.compatMode || 4) === 4;
      if (supportsPageOffset) {
        return [window.pageXOffset, window.pageYOffset];
      } else if (isCSS1Compat) {
        return [document.documentElement.scrollLeft, document.documentElement.scrollTop];
      } else {
        return [document.body.scrollLeft, document.body.scrollTop];
      }
    }
  };

  if (typeof window !== 'undefined') {
    window.ContentTools = ContentTools;
  }

  if (typeof module !== 'undefined' && module.exports) {
    exports = module.exports = ContentTools;
  }

  ContentTools.ComponentUI = (function() {
    function ComponentUI() {
      this._bindings = {};
      this._parent = null;
      this._children = [];
      this._domElement = null;
    }

    ComponentUI.prototype.children = function() {
      return this._children.slice();
    };

    ComponentUI.prototype.domElement = function() {
      return this._domElement;
    };

    ComponentUI.prototype.isMounted = function() {
      return this._domElement !== null;
    };

    ComponentUI.prototype.parent = function() {
      return this._parent;
    };

    ComponentUI.prototype.attach = function(component, index) {
      if (component.parent()) {
        component.parent().detach(component);
      }
      component._parent = this;
      if (index !== void 0) {
        return this._children.splice(index, 0, component);
      } else {
        return this._children.push(component);
      }
    };

    ComponentUI.prototype.addCSSClass = function(className) {
      if (!this.isMounted()) {
        return;
      }
      return ContentEdit.addCSSClass(this._domElement, className);
    };

    ComponentUI.prototype.detach = function(component) {
      var componentIndex;
      componentIndex = this._children.indexOf(component);
      if (componentIndex === -1) {
        return;
      }
      return this._children.splice(componentIndex, 1);
    };

    ComponentUI.prototype.mount = function() {};

    ComponentUI.prototype.removeCSSClass = function(className) {
      if (!this.isMounted()) {
        return;
      }
      return ContentEdit.removeCSSClass(this._domElement, className);
    };

    ComponentUI.prototype.unmount = function() {
      if (!this.isMounted()) {
        return;
      }
      this._removeDOMEventListeners();
      if (this._domElement.parentNode) {
        this._domElement.parentNode.removeChild(this._domElement);
      }
      return this._domElement = null;
    };

    ComponentUI.prototype.addEventListener = function(eventName, callback) {
      if (this._bindings[eventName] === void 0) {
        this._bindings[eventName] = [];
      }
      this._bindings[eventName].push(callback);
    };

    ComponentUI.prototype.createEvent = function(eventName, detail) {
      return new ContentTools.Event(eventName, detail);
    };

    ComponentUI.prototype.dispatchEvent = function(ev) {
      var callback, _i, _len, _ref;
      if (!this._bindings[ev.name()]) {
        return !ev.defaultPrevented();
      }
      _ref = this._bindings[ev.name()];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        callback = _ref[_i];
        if (ev.propagationStopped()) {
          break;
        }
        if (!callback) {
          continue;
        }
        callback.call(this, ev);
      }
      return !ev.defaultPrevented();
    };

    ComponentUI.prototype.removeEventListener = function(eventName, callback) {
      var i, suspect, _i, _len, _ref, _results;
      if (!eventName) {
        this._bindings = {};
        return;
      }
      if (!callback) {
        this._bindings[eventName] = void 0;
        return;
      }
      if (!this._bindings[eventName]) {
        return;
      }
      _ref = this._bindings[eventName];
      _results = [];
      for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
        suspect = _ref[i];
        if (suspect === callback) {
          _results.push(this._bindings[eventName].splice(i, 1));
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    ComponentUI.prototype._addDOMEventListeners = function() {};

    ComponentUI.prototype._removeDOMEventListeners = function() {};

    ComponentUI.createDiv = function(classNames, attributes, content) {
      var domElement, name, value;
      domElement = document.createElement('div');
      if (classNames && classNames.length > 0) {
        domElement.setAttribute('class', classNames.join(' '));
      }
      if (attributes) {
        for (name in attributes) {
          value = attributes[name];
          domElement.setAttribute(name, value);
        }
      }
      if (content) {
        domElement.innerHTML = content;
      }
      return domElement;
    };

    return ComponentUI;

  })();

  ContentTools.WidgetUI = (function(_super) {
    __extends(WidgetUI, _super);

    function WidgetUI() {
      return WidgetUI.__super__.constructor.apply(this, arguments);
    }

    WidgetUI.prototype.attach = function(component, index) {
      WidgetUI.__super__.attach.call(this, component, index);
      if (!this.isMounted()) {
        return component.mount();
      }
    };

    WidgetUI.prototype.detach = function(component) {
      WidgetUI.__super__.detach.call(this, component);
      if (this.isMounted()) {
        return component.unmount();
      }
    };

    WidgetUI.prototype.detatch = function(component) {
      console.log('Please call detach, detatch will be removed in release 1.4.x');
      return this.detach(component);
    };

    WidgetUI.prototype.show = function() {
      var fadeIn;
      if (this._hideTimeout) {
        clearTimeout(this._hideTimeout);
        this._hideTimeout = null;
        this.unmount();
      }
      if (!this.isMounted()) {
        this.mount();
      }
      fadeIn = (function(_this) {
        return function() {
          _this.addCSSClass('ct-widget--active');
          return _this._showTimeout = null;
        };
      })(this);
      return this._showTimeout = setTimeout(fadeIn, 100);
    };

    WidgetUI.prototype.hide = function() {
      var monitorForHidden;
      if (this._showTimeout) {
        clearTimeout(this._showTimeout);
        this._showTimeout = null;
      }
      this.removeCSSClass('ct-widget--active');
      monitorForHidden = (function(_this) {
        return function() {
          _this._hideTimeout = null;
          if (!window.getComputedStyle) {
            _this.unmount();
            return;
          }
          if (parseFloat(window.getComputedStyle(_this._domElement).opacity) < 0.01) {
            return _this.unmount();
          } else {
            return _this._hideTimeout = setTimeout(monitorForHidden, 250);
          }
        };
      })(this);
      if (this.isMounted()) {
        return this._hideTimeout = setTimeout(monitorForHidden, 250);
      }
    };

    return WidgetUI;

  })(ContentTools.ComponentUI);

  ContentTools.AnchoredComponentUI = (function(_super) {
    __extends(AnchoredComponentUI, _super);

    function AnchoredComponentUI() {
      return AnchoredComponentUI.__super__.constructor.apply(this, arguments);
    }

    AnchoredComponentUI.prototype.mount = function(domParent, before) {
      if (before == null) {
        before = null;
      }
      domParent.insertBefore(this._domElement, before);
      return this._addDOMEventListeners();
    };

    return AnchoredComponentUI;

  })(ContentTools.ComponentUI);

  ContentTools.Event = (function() {
    function Event(name, detail) {
      this._name = name;
      this._detail = detail;
      this._timeStamp = Date.now();
      this._defaultPrevented = false;
      this._propagationStopped = false;
    }

    Event.prototype.defaultPrevented = function() {
      return this._defaultPrevented;
    };

    Event.prototype.detail = function() {
      return this._detail;
    };

    Event.prototype.name = function() {
      return this._name;
    };

    Event.prototype.propagationStopped = function() {
      return this._propagationStopped;
    };

    Event.prototype.timeStamp = function() {
      return this._timeStamp;
    };

    Event.prototype.preventDefault = function() {
      return this._defaultPrevented = true;
    };

    Event.prototype.stopImmediatePropagation = function() {
      return this._propagationStopped = true;
    };

    return Event;

  })();

  ContentTools.FlashUI = (function(_super) {
    __extends(FlashUI, _super);

    function FlashUI(modifier) {
      FlashUI.__super__.constructor.call(this);
      this.mount(modifier);
    }

    FlashUI.prototype.mount = function(modifier) {
      var monitorForHidden;
      this._domElement = this.constructor.createDiv(['ct-flash', 'ct-flash--active', "ct-flash--" + modifier, 'ct-widget', 'ct-widget--active']);
      FlashUI.__super__.mount.call(this, ContentTools.EditorApp.get().domElement());
      monitorForHidden = (function(_this) {
        return function() {
          if (!window.getComputedStyle) {
            _this.unmount();
            return;
          }
          if (parseFloat(window.getComputedStyle(_this._domElement).opacity) < 0.01) {
            return _this.unmount();
          } else {
            return setTimeout(monitorForHidden, 250);
          }
        };
      })(this);
      return setTimeout(monitorForHidden, 250);
    };

    return FlashUI;

  })(ContentTools.AnchoredComponentUI);

  ContentTools.IgnitionUI = (function(_super) {
    __extends(IgnitionUI, _super);

    function IgnitionUI() {
      IgnitionUI.__super__.constructor.call(this);
      this._revertToState = 'ready';
      this._state = 'ready';
    }

    IgnitionUI.prototype.busy = function(busy) {
      if (this.dispatchEvent(this.createEvent('busy', {
        busy: busy
      }))) {
        if (busy === (this._state === 'busy')) {
          return;
        }
        if (busy) {
          this._revertToState = this._state;
          return this.state('busy');
        } else {
          return this.state(this._revertToState);
        }
      }
    };

    IgnitionUI.prototype.cancel = function() {
      if (this.dispatchEvent(this.createEvent('cancel'))) {
        return this.state('ready');
      }
    };

    IgnitionUI.prototype.confirm = function() {
      if (this.dispatchEvent(this.createEvent('confirm'))) {
        return this.state('ready');
      }
    };

    IgnitionUI.prototype.edit = function() {
      if (this.dispatchEvent(this.createEvent('edit'))) {
        return this.state('editing');
      }
    };

    IgnitionUI.prototype.mount = function() {
      IgnitionUI.__super__.mount.call(this);
      this._domElement = this.constructor.createDiv(['ct-widget', 'ct-ignition', 'ct-ignition--ready']);
      this.parent().domElement().appendChild(this._domElement);
      this._domEdit = this.constructor.createDiv(['ct-ignition__button', 'ct-ignition__button--edit']);
      this._domElement.appendChild(this._domEdit);
      this._domConfirm = this.constructor.createDiv(['ct-ignition__button', 'ct-ignition__button--confirm']);
      this._domElement.appendChild(this._domConfirm);
      this._domCancel = this.constructor.createDiv(['ct-ignition__button', 'ct-ignition__button--cancel']);
      this._domElement.appendChild(this._domCancel);
      this._domBusy = this.constructor.createDiv(['ct-ignition__button', 'ct-ignition__button--busy']);
      this._domElement.appendChild(this._domBusy);
      return this._addDOMEventListeners();
    };

    IgnitionUI.prototype.state = function(state) {
      if (state === void 0) {
        return this._state;
      }
      if (this._state === state) {
        return;
      }
      if (!this.dispatchEvent(this.createEvent('statechange', {
        state: state
      }))) {
        return;
      }
      this._state = state;
      this.removeCSSClass('ct-ignition--busy');
      this.removeCSSClass('ct-ignition--editing');
      this.removeCSSClass('ct-ignition--ready');
      if (this._state === 'busy') {
        return this.addCSSClass('ct-ignition--busy');
      } else if (this._state === 'editing') {
        return this.addCSSClass('ct-ignition--editing');
      } else if (this._state === 'ready') {
        return this.addCSSClass('ct-ignition--ready');
      }
    };

    IgnitionUI.prototype.unmount = function() {
      IgnitionUI.__super__.unmount.call(this);
      this._domEdit = null;
      this._domConfirm = null;
      return this._domCancel = null;
    };

    IgnitionUI.prototype._addDOMEventListeners = function() {
      this._domEdit.addEventListener('click', (function(_this) {
        return function(ev) {
          ev.preventDefault();
          return _this.edit();
        };
      })(this));
      this._domConfirm.addEventListener('click', (function(_this) {
        return function(ev) {
          ev.preventDefault();
          return _this.confirm();
        };
      })(this));
      return this._domCancel.addEventListener('click', (function(_this) {
        return function(ev) {
          ev.preventDefault();
          return _this.cancel();
        };
      })(this));
    };

    return IgnitionUI;

  })(ContentTools.WidgetUI);

  ContentTools.InspectorUI = (function(_super) {
    __extends(InspectorUI, _super);

    function InspectorUI() {
      InspectorUI.__super__.constructor.call(this);
      this._tagUIs = [];
    }

    InspectorUI.prototype.mount = function() {
      this._domElement = this.constructor.createDiv(['ct-widget', 'ct-inspector']);
      this.parent().domElement().appendChild(this._domElement);
      this._domTags = this.constructor.createDiv(['ct-inspector__tags', 'ct-tags']);
      this._domElement.appendChild(this._domTags);
      this._domCounter = this.constructor.createDiv(['ct-inspector__counter']);
      this._domElement.appendChild(this._domCounter);
      this.updateCounter();
      this._addDOMEventListeners();
      this._handleFocusChange = (function(_this) {
        return function() {
          return _this.updateTags();
        };
      })(this);
      ContentEdit.Root.get().bind('blur', this._handleFocusChange);
      ContentEdit.Root.get().bind('focus', this._handleFocusChange);
      return ContentEdit.Root.get().bind('mount', this._handleFocusChange);
    };

    InspectorUI.prototype.unmount = function() {
      InspectorUI.__super__.unmount.call(this);
      this._domTags = null;
      ContentEdit.Root.get().unbind('blur', this._handleFocusChange);
      ContentEdit.Root.get().unbind('focus', this._handleFocusChange);
      return ContentEdit.Root.get().unbind('mount', this._handleFocusChange);
    };

    InspectorUI.prototype.updateCounter = function() {
      var column, completeText, element, line, lines, region, sub, word_count, _i, _len, _ref;
      if (!this.isMounted()) {
        return;
      }
      completeText = '';
      _ref = ContentTools.EditorApp.get().orderedRegions();
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        region = _ref[_i];
        if (!region) {
          continue;
        }
        completeText += region.domElement().textContent;
      }
      completeText = completeText.trim();
      completeText = completeText.replace(/<\/?[a-z][^>]*>/gi, '');
      completeText = completeText.replace(/[\u200B]+/, '');
      completeText = completeText.replace(/['";:,.?¿\-!¡]+/g, '');
      word_count = (completeText.match(/\S+/g) || []).length;
      word_count = word_count.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      element = ContentEdit.Root.get().focused();
      if (!(element && element.type() === 'PreText' && element.selection().isCollapsed())) {
        this._domCounter.textContent = word_count;
        return;
      }
      line = 0;
      column = 1;
      sub = element.content.substring(0, element.selection().get()[0]);
      lines = sub.text().split('\n');
      line = lines.length;
      column = lines[lines.length - 1].length + 1;
      line = line.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      column = column.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      return this._domCounter.textContent = "" + word_count + " / " + line + ":" + column;
    };

    InspectorUI.prototype.updateTags = function() {
      var element, elements, tag, _i, _j, _len, _len1, _ref, _results;
      element = ContentEdit.Root.get().focused();
      _ref = this._tagUIs;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        tag = _ref[_i];
        tag.unmount();
      }
      this._tagUIs = [];
      if (!element) {
        return;
      }
      elements = element.parents();
      elements.reverse();
      elements.push(element);
      _results = [];
      for (_j = 0, _len1 = elements.length; _j < _len1; _j++) {
        element = elements[_j];
        if (ContentTools.INSPECTOR_IGNORED_ELEMENTS.indexOf(element.type()) !== -1) {
          continue;
        }
        tag = new ContentTools.TagUI(element);
        this._tagUIs.push(tag);
        _results.push(tag.mount(this._domTags));
      }
      return _results;
    };

    InspectorUI.prototype._addDOMEventListeners = function() {
      return this._updateCounterInterval = setInterval((function(_this) {
        return function() {
          return _this.updateCounter();
        };
      })(this), 250);
    };

    InspectorUI.prototype._removeDOMEventListeners = function() {
      return clearInterval(this._updateCounterInterval);
    };

    return InspectorUI;

  })(ContentTools.WidgetUI);

  ContentTools.TagUI = (function(_super) {
    __extends(TagUI, _super);

    function TagUI(element) {
      this.element = element;
      this._onMouseDown = __bind(this._onMouseDown, this);
      TagUI.__super__.constructor.call(this);
    }

    TagUI.prototype.mount = function(domParent, before) {
      if (before == null) {
        before = null;
      }
      this._domElement = this.constructor.createDiv(['ct-tag']);
      this._domElement.textContent = this.element.tagName();
      return TagUI.__super__.mount.call(this, domParent, before);
    };

    TagUI.prototype._addDOMEventListeners = function() {
      return this._domElement.addEventListener('mousedown', this._onMouseDown);
    };

    TagUI.prototype._onMouseDown = function(ev) {
      var app, dialog, modal;
      ev.preventDefault();
      if (this.element.storeState) {
        this.element.storeState();
      }
      app = ContentTools.EditorApp.get();
      modal = new ContentTools.ModalUI();
      dialog = new ContentTools.PropertiesDialog(this.element);
      dialog.addEventListener('cancel', (function(_this) {
        return function() {
          modal.hide();
          dialog.hide();
          if (_this.element.restoreState) {
            return _this.element.restoreState();
          }
        };
      })(this));
      dialog.addEventListener('save', (function(_this) {
        return function(ev) {
          var applied, attributes, className, classNames, cssClass, detail, element, innerHTML, name, styles, value, _i, _j, _len, _len1, _ref, _ref1;
          detail = ev.detail();
          attributes = detail.changedAttributes;
          styles = detail.changedStyles;
          innerHTML = detail.innerHTML;
          for (name in attributes) {
            value = attributes[name];
            if (name === 'class') {
              if (value === null) {
                value = '';
              }
              classNames = {};
              _ref = value.split(' ');
              for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                className = _ref[_i];
                className = className.trim();
                if (!className) {
                  continue;
                }
                classNames[className] = true;
                if (!_this.element.hasCSSClass(className)) {
                  _this.element.addCSSClass(className);
                }
              }
              _ref1 = _this.element.attr('class').split(' ');
              for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
                className = _ref1[_j];
                className = className.trim();
                if (classNames[className] === void 0) {
                  _this.element.removeCSSClass(className);
                }
              }
            } else {
              if (value === null) {
                _this.element.removeAttr(name);
              } else {
                _this.element.attr(name, value);
              }
            }
          }
          for (cssClass in styles) {
            applied = styles[cssClass];
            if (applied) {
              _this.element.addCSSClass(cssClass);
            } else {
              _this.element.removeCSSClass(cssClass);
            }
          }
          if (innerHTML !== null) {
            if (innerHTML !== dialog.getElementInnerHTML()) {
              element = _this.element;
              if (!element.content) {
                element = element.children[0];
              }
              element.content = new HTMLString.String(innerHTML, element.content.preserveWhitespace());
              element.updateInnerHTML();
              element.taint();
              element.selection(new ContentSelect.Range(0, 0));
              element.storeState();
            }
          }
          modal.hide();
          dialog.hide();
          if (_this.element.restoreState) {
            return _this.element.restoreState();
          }
        };
      })(this));
      app.attach(modal);
      app.attach(dialog);
      modal.show();
      return dialog.show();
    };

    return TagUI;

  })(ContentTools.AnchoredComponentUI);

  ContentTools.ModalUI = (function(_super) {
    __extends(ModalUI, _super);

    function ModalUI(transparent, allowScrolling) {
      ModalUI.__super__.constructor.call(this);
      this._transparent = transparent;
      this._allowScrolling = allowScrolling;
    }

    ModalUI.prototype.mount = function() {
      this._domElement = this.constructor.createDiv(['ct-widget', 'ct-modal']);
      this.parent().domElement().appendChild(this._domElement);
      if (this._transparent) {
        this.addCSSClass('ct-modal--transparent');
      }
      if (!this._allowScrolling) {
        ContentEdit.addCSSClass(document.body, 'ct--no-scroll');
      }
      return this._addDOMEventListeners();
    };

    ModalUI.prototype.unmount = function() {
      if (!this._allowScrolling) {
        ContentEdit.removeCSSClass(document.body, 'ct--no-scroll');
      }
      return ModalUI.__super__.unmount.call(this);
    };

    ModalUI.prototype._addDOMEventListeners = function() {
      return this._domElement.addEventListener('click', (function(_this) {
        return function(ev) {
          return _this.dispatchEvent(_this.createEvent('click'));
        };
      })(this));
    };

    return ModalUI;

  })(ContentTools.WidgetUI);

  ContentTools.ToolboxUI = (function(_super) {
    __extends(ToolboxUI, _super);

    function ToolboxUI(tools) {
      this._onStopDragging = __bind(this._onStopDragging, this);
      this._onStartDragging = __bind(this._onStartDragging, this);
      this._onDrag = __bind(this._onDrag, this);
      ToolboxUI.__super__.constructor.call(this);
      this._tools = tools;
      this._dragging = false;
      this._draggingOffset = null;
      this._domGrip = null;
      this._toolUIs = {};
    }

    ToolboxUI.prototype.isDragging = function() {
      return this._dragging;
    };

    ToolboxUI.prototype.hide = function() {
      this._removeDOMEventListeners();
      return ToolboxUI.__super__.hide.call(this);
    };

    ToolboxUI.prototype.mount = function() {
      var coord, position, restore;
      this._domElement = this.constructor.createDiv(['ct-widget', 'ct-toolbox']);
      this.parent().domElement().appendChild(this._domElement);
      this._domGrip = this.constructor.createDiv(['ct-toolbox__grip', 'ct-grip']);
      this._domElement.appendChild(this._domGrip);
      this._domGrip.appendChild(this.constructor.createDiv(['ct-grip__bump']));
      this._domGrip.appendChild(this.constructor.createDiv(['ct-grip__bump']));
      this._domGrip.appendChild(this.constructor.createDiv(['ct-grip__bump']));
      this._domToolGroups = this.constructor.createDiv(['ct-tool-groups']);
      this._domElement.appendChild(this._domToolGroups);
      this.tools(this._tools);
      restore = window.localStorage.getItem('ct-toolbox-position');
      if (restore && /^\d+,\d+$/.test(restore)) {
        position = (function() {
          var _i, _len, _ref, _results;
          _ref = restore.split(',');
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            coord = _ref[_i];
            _results.push(parseInt(coord));
          }
          return _results;
        })();
        this._domElement.style.left = "" + position[0] + "px";
        this._domElement.style.top = "" + position[1] + "px";
        this._contain();
      }
      return this._addDOMEventListeners();
    };

    ToolboxUI.prototype.tools = function(tools) {
      var domToolGroup, i, tool, toolGroup, toolName, toolUI, _i, _len, _ref, _ref1, _results;
      if (tools === void 0) {
        return this._tools;
      }
      this._tools = tools;
      if (!this.isMounted()) {
        return;
      }
      _ref = this._toolUIs;
      for (toolName in _ref) {
        toolUI = _ref[toolName];
        toolUI.unmount();
      }
      this._toolUIs = {};
      while (this._domToolGroups.lastChild) {
        this._domToolGroups.removeChild(this._domToolGroups.lastChild);
      }
      _ref1 = this._tools;
      _results = [];
      for (i = _i = 0, _len = _ref1.length; _i < _len; i = ++_i) {
        toolGroup = _ref1[i];
        domToolGroup = this.constructor.createDiv(['ct-tool-group']);
        this._domToolGroups.appendChild(domToolGroup);
        _results.push((function() {
          var _j, _len1, _results1;
          _results1 = [];
          for (_j = 0, _len1 = toolGroup.length; _j < _len1; _j++) {
            toolName = toolGroup[_j];
            tool = ContentTools.ToolShelf.fetch(toolName);
            this._toolUIs[toolName] = new ContentTools.ToolUI(tool);
            this._toolUIs[toolName].mount(domToolGroup);
            this._toolUIs[toolName].disabled(true);
            _results1.push(this._toolUIs[toolName].addEventListener('applied', (function(_this) {
              return function() {
                return _this.updateTools();
              };
            })(this)));
          }
          return _results1;
        }).call(this));
      }
      return _results;
    };

    ToolboxUI.prototype.updateTools = function() {
      var element, name, selection, toolUI, _ref, _results;
      element = ContentEdit.Root.get().focused();
      selection = null;
      if (element && element.selection) {
        selection = element.selection();
      }
      _ref = this._toolUIs;
      _results = [];
      for (name in _ref) {
        toolUI = _ref[name];
        _results.push(toolUI.update(element, selection));
      }
      return _results;
    };

    ToolboxUI.prototype.unmount = function() {
      ToolboxUI.__super__.unmount.call(this);
      return this._domGrip = null;
    };

    ToolboxUI.prototype._addDOMEventListeners = function() {
      this._domGrip.addEventListener('mousedown', this._onStartDragging);
      this._handleResize = (function(_this) {
        return function(ev) {
          var containResize;
          if (_this._resizeTimeout) {
            clearTimeout(_this._resizeTimeout);
          }
          containResize = function() {
            return _this._contain();
          };
          return _this._resizeTimeout = setTimeout(containResize, 250);
        };
      })(this);
      window.addEventListener('resize', this._handleResize);
      this._updateTools = (function(_this) {
        return function() {
          var app, element, name, selection, toolUI, update, _ref, _results;
          app = ContentTools.EditorApp.get();
          update = false;
          element = ContentEdit.Root.get().focused();
          selection = null;
          if (element === _this._lastUpdateElement) {
            if (element && element.selection) {
              selection = element.selection();
              if (_this._lastUpdateSelection) {
                if (!selection.eq(_this._lastUpdateSelection)) {
                  update = true;
                }
              } else {
                update = true;
              }
            }
          } else {
            update = true;
          }
          if (app.history) {
            if (_this._lastUpdateHistoryLength !== app.history.length()) {
              update = true;
            }
            _this._lastUpdateHistoryLength = app.history.length();
            if (_this._lastUpdateHistoryIndex !== app.history.index()) {
              update = true;
            }
            _this._lastUpdateHistoryIndex = app.history.index();
          }
          _this._lastUpdateElement = element;
          _this._lastUpdateSelection = selection;
          if (update) {
            _ref = _this._toolUIs;
            _results = [];
            for (name in _ref) {
              toolUI = _ref[name];
              _results.push(toolUI.update(element, selection));
            }
            return _results;
          }
        };
      })(this);
      this._updateToolsInterval = setInterval(this._updateTools, 100);
      this._handleKeyDown = (function(_this) {
        return function(ev) {
          var Paragraph, element, os, redo, undo, version;
          element = ContentEdit.Root.get().focused();
          if (element && !element.content) {
            if (ev.keyCode === 46) {
              ev.preventDefault();
              return ContentTools.Tools.Remove.apply(element, null, function() {});
            }
            if (ev.keyCode === 13) {
              ev.preventDefault();
              Paragraph = ContentTools.Tools.Paragraph;
              return Paragraph.apply(element, null, function() {});
            }
          }
          version = navigator.appVersion;
          os = 'linux';
          if (version.indexOf('Mac') !== -1) {
            os = 'mac';
          } else if (version.indexOf('Win') !== -1) {
            os = 'windows';
          }
          redo = false;
          undo = false;
          switch (os) {
            case 'linux' && !ev.altKey:
              if (ev.keyCode === 90 && ev.ctrlKey) {
                redo = ev.shiftKey;
                undo = !redo;
              }
              break;
            case 'mac' && !(ev.altKey || ev.ctrlKey):
              if (ev.keyCode === 90 && ev.metaKey) {
                redo = ev.shiftKey;
                undo = !redo;
              }
              break;
            case 'windows' && !ev.altKey || ev.shiftKey:
              if (ev.keyCode === 89 && ev.ctrlKey) {
                redo = true;
              }
              if (ev.keyCode === 90 && ev.ctrlKey) {
                undo = true;
              }
          }
          if (undo && ContentTools.Tools.Undo.canApply(null, null)) {
            ContentTools.Tools.Undo.apply(null, null, function() {});
          }
          if (redo && ContentTools.Tools.Redo.canApply(null, null)) {
            return ContentTools.Tools.Redo.apply(null, null, function() {});
          }
        };
      })(this);
      return window.addEventListener('keydown', this._handleKeyDown);
    };

    ToolboxUI.prototype._contain = function() {
      var rect;
      if (!this.isMounted()) {
        return;
      }
      rect = this._domElement.getBoundingClientRect();
      if (rect.left + rect.width > window.innerWidth) {
        this._domElement.style.left = "" + (window.innerWidth - rect.width) + "px";
      }
      if (rect.top + rect.height > window.innerHeight) {
        this._domElement.style.top = "" + (window.innerHeight - rect.height) + "px";
      }
      if (rect.left < 0) {
        this._domElement.style.left = '0px';
      }
      if (rect.top < 0) {
        this._domElement.style.top = '0px';
      }
      rect = this._domElement.getBoundingClientRect();
      return window.localStorage.setItem('ct-toolbox-position', "" + rect.left + "," + rect.top);
    };

    ToolboxUI.prototype._removeDOMEventListeners = function() {
      if (this.isMounted()) {
        this._domGrip.removeEventListener('mousedown', this._onStartDragging);
      }
      window.removeEventListener('keydown', this._handleKeyDown);
      window.removeEventListener('resize', this._handleResize);
      return clearInterval(this._updateToolsInterval);
    };

    ToolboxUI.prototype._onDrag = function(ev) {
      ContentSelect.Range.unselectAll();
      this._domElement.style.left = "" + (ev.clientX - this._draggingOffset.x) + "px";
      return this._domElement.style.top = "" + (ev.clientY - this._draggingOffset.y) + "px";
    };

    ToolboxUI.prototype._onStartDragging = function(ev) {
      var rect;
      ev.preventDefault();
      if (this.isDragging()) {
        return;
      }
      this._dragging = true;
      this.addCSSClass('ct-toolbox--dragging');
      rect = this._domElement.getBoundingClientRect();
      this._draggingOffset = {
        x: ev.clientX - rect.left,
        y: ev.clientY - rect.top
      };
      document.addEventListener('mousemove', this._onDrag);
      document.addEventListener('mouseup', this._onStopDragging);
      return ContentEdit.addCSSClass(document.body, 'ce--dragging');
    };

    ToolboxUI.prototype._onStopDragging = function(ev) {
      if (!this.isDragging()) {
        return;
      }
      this._contain();
      document.removeEventListener('mousemove', this._onDrag);
      document.removeEventListener('mouseup', this._onStopDragging);
      this._draggingOffset = null;
      this._dragging = false;
      this.removeCSSClass('ct-toolbox--dragging');
      return ContentEdit.removeCSSClass(document.body, 'ce--dragging');
    };

    return ToolboxUI;

  })(ContentTools.WidgetUI);

  ContentTools.ToolUI = (function(_super) {
    __extends(ToolUI, _super);

    function ToolUI(tool) {
      this._onMouseUp = __bind(this._onMouseUp, this);
      this._onMouseLeave = __bind(this._onMouseLeave, this);
      this._onMouseDown = __bind(this._onMouseDown, this);
      this._addDOMEventListeners = __bind(this._addDOMEventListeners, this);
      ToolUI.__super__.constructor.call(this);
      this.tool = tool;
      this._mouseDown = false;
      this._disabled = false;
    }

    ToolUI.prototype.apply = function(element, selection) {
      var callback, detail;
      if (!this.tool.canApply(element, selection)) {
        return;
      }
      detail = {
        'element': element,
        'selection': selection
      };
      callback = (function(_this) {
        return function(applied) {
          if (applied) {
            return _this.dispatchEvent(_this.createEvent('applied', detail));
          }
        };
      })(this);
      if (this.dispatchEvent(this.createEvent('apply', detail))) {
        return this.tool.apply(element, selection, callback);
      }
    };

    ToolUI.prototype.disabled = function(disabledState) {
      if (disabledState === void 0) {
        return this._disabled;
      }
      if (this._disabled === disabledState) {
        return;
      }
      this._disabled = disabledState;
      if (disabledState) {
        this._mouseDown = false;
        this.addCSSClass('ct-tool--disabled');
        return this.removeCSSClass('ct-tool--applied');
      } else {
        return this.removeCSSClass('ct-tool--disabled');
      }
    };

    ToolUI.prototype.mount = function(domParent, before) {
      if (before == null) {
        before = null;
      }
      this._domElement = this.constructor.createDiv(['ct-tool', "ct-tool--" + this.tool.icon]);
      this._domElement.setAttribute('data-ct-tooltip', ContentEdit._(this.tool.label));
      return ToolUI.__super__.mount.call(this, domParent, before);
    };

    ToolUI.prototype.update = function(element, selection) {
      if (this.tool.requiresElement) {
        if (!(element && element.isMounted())) {
          this.disabled(true);
          return;
        }
      }
      if (this.tool.canApply(element, selection)) {
        this.disabled(false);
      } else {
        this.disabled(true);
        return;
      }
      if (this.tool.isApplied(element, selection)) {
        return this.addCSSClass('ct-tool--applied');
      } else {
        return this.removeCSSClass('ct-tool--applied');
      }
    };

    ToolUI.prototype._addDOMEventListeners = function() {
      this._domElement.addEventListener('mousedown', this._onMouseDown);
      this._domElement.addEventListener('mouseleave', this._onMouseLeave);
      return this._domElement.addEventListener('mouseup', this._onMouseUp);
    };

    ToolUI.prototype._onMouseDown = function(ev) {
      ev.preventDefault();
      if (this.disabled()) {
        return;
      }
      this._mouseDown = true;
      return this.addCSSClass('ct-tool--down');
    };

    ToolUI.prototype._onMouseLeave = function(ev) {
      this._mouseDown = false;
      return this.removeCSSClass('ct-tool--down');
    };

    ToolUI.prototype._onMouseUp = function(ev) {
      var element, selection;
      if (this._mouseDown) {
        element = ContentEdit.Root.get().focused();
        if (this.tool.requiresElement) {
          if (!(element && element.isMounted())) {
            return;
          }
        }
        selection = null;
        if (element && element.selection) {
          selection = element.selection();
        }
        this.apply(element, selection);
      }
      this._mouseDown = false;
      return this.removeCSSClass('ct-tool--down');
    };

    return ToolUI;

  })(ContentTools.AnchoredComponentUI);

  ContentTools.AnchoredDialogUI = (function(_super) {
    __extends(AnchoredDialogUI, _super);

    function AnchoredDialogUI() {
      AnchoredDialogUI.__super__.constructor.call(this);
      this._position = [0, 0];
    }

    AnchoredDialogUI.prototype.mount = function() {
      this._domElement = this.constructor.createDiv(['ct-widget', 'ct-anchored-dialog']);
      this.parent().domElement().appendChild(this._domElement);
      this._contain();
      this._domElement.style.top = "" + this._position[1] + "px";
      return this._domElement.style.left = "" + this._position[0] + "px";
    };

    AnchoredDialogUI.prototype.position = function(newPosition) {
      if (newPosition === void 0) {
        return this._position.slice();
      }
      this._position = newPosition.slice();
      if (this.isMounted()) {
        this._contain();
        this._domElement.style.top = "" + this._position[1] + "px";
        return this._domElement.style.left = "" + this._position[0] + "px";
      }
    };

    AnchoredDialogUI.prototype._contain = function() {
      var halfWidth, pageWidth, rect;
      if (!this.isMounted()) {
        return;
      }
      rect = this._domElement.getBoundingClientRect();
      halfWidth = rect.width / 2 + 5;
      pageWidth = document.documentElement.clientWidth || document.body.clientWidth;
      if ((this._position[0] + halfWidth) > pageWidth) {
        this._position[0] = pageWidth - halfWidth;
      }
      if (this._position[0] < halfWidth) {
        this._position[0] = halfWidth;
      }
      if (this._position[1] + rect.top < 5) {
        return this._position[1] = Math.abs(rect.top) + 5;
      }
    };

    return AnchoredDialogUI;

  })(ContentTools.WidgetUI);

  ContentTools.DialogUI = (function(_super) {
    __extends(DialogUI, _super);

    function DialogUI(caption) {
      if (caption == null) {
        caption = '';
      }
      DialogUI.__super__.constructor.call(this);
      this._busy = false;
      this._caption = caption;
    }

    DialogUI.prototype.busy = function(busy) {
      if (busy === void 0) {
        return this._busy;
      }
      if (this._busy === busy) {
        return;
      }
      this._busy = busy;
      if (!this.isMounted()) {
        return;
      }
      if (this._busy) {
        return ContentEdit.addCSSClass(this._domElement, 'ct-dialog--busy');
      } else {
        return ContentEdit.removeCSSClass(this._domElement, 'ct-dialog--busy');
      }
    };

    DialogUI.prototype.caption = function(caption) {
      if (caption === void 0) {
        return this._caption;
      }
      this._caption = caption;
      return this._domCaption.textContent = ContentEdit._(caption);
    };

    DialogUI.prototype.mount = function() {
      var dialogCSSClasses, domBody, domHeader;
      if (document.activeElement) {
        document.activeElement.blur();
        window.getSelection().removeAllRanges();
      }
      dialogCSSClasses = ['ct-widget', 'ct-dialog'];
      if (this._busy) {
        dialogCSSClasses.push('ct-dialog--busy');
      }
      this._domElement = this.constructor.createDiv(dialogCSSClasses);
      this.parent().domElement().appendChild(this._domElement);
      domHeader = this.constructor.createDiv(['ct-dialog__header']);
      this._domElement.appendChild(domHeader);
      this._domCaption = this.constructor.createDiv(['ct-dialog__caption']);
      domHeader.appendChild(this._domCaption);
      this.caption(this._caption);
      this._domClose = this.constructor.createDiv(['ct-dialog__close']);
      domHeader.appendChild(this._domClose);
      domBody = this.constructor.createDiv(['ct-dialog__body']);
      this._domElement.appendChild(domBody);
      this._domView = this.constructor.createDiv(['ct-dialog__view']);
      domBody.appendChild(this._domView);
      this._domControls = this.constructor.createDiv(['ct-dialog__controls']);
      domBody.appendChild(this._domControls);
      this._domBusy = this.constructor.createDiv(['ct-dialog__busy']);
      return this._domElement.appendChild(this._domBusy);
    };

    DialogUI.prototype.unmount = function() {
      DialogUI.__super__.unmount.call(this);
      this._domBusy = null;
      this._domCaption = null;
      this._domClose = null;
      this._domControls = null;
      return this._domView = null;
    };

    DialogUI.prototype._addDOMEventListeners = function() {
      this._handleEscape = (function(_this) {
        return function(ev) {
          if (_this._busy) {
            return;
          }
          if (ev.keyCode === 27) {
            return _this.dispatchEvent(_this.createEvent('cancel'));
          }
        };
      })(this);
      document.addEventListener('keyup', this._handleEscape);
      return this._domClose.addEventListener('click', (function(_this) {
        return function(ev) {
          ev.preventDefault();
          if (_this._busy) {
            return;
          }
          return _this.dispatchEvent(_this.createEvent('cancel'));
        };
      })(this));
    };

    DialogUI.prototype._removeDOMEventListeners = function() {
      return document.removeEventListener('keyup', this._handleEscape);
    };

    return DialogUI;

  })(ContentTools.WidgetUI);

  ContentTools.ImageDialog = (function(_super) {
    __extends(ImageDialog, _super);

    function ImageDialog() {
      ImageDialog.__super__.constructor.call(this, 'Insert image');
      this._cropMarks = null;
      this._imageURL = null;
      this._imageSize = null;
      this._progress = 0;
      this._state = 'empty';
      if (ContentTools.IMAGE_UPLOADER) {
        ContentTools.IMAGE_UPLOADER(this);
      }
    }

    ImageDialog.prototype.cropRegion = function() {
      if (this._cropMarks) {
        return this._cropMarks.region();
      }
      return [0, 0, 1, 1];
    };

    ImageDialog.prototype.addCropMarks = function() {
      if (this._cropMarks) {
        return;
      }
      this._cropMarks = new CropMarksUI(this._imageSize);
      this._cropMarks.mount(this._domView);
      return ContentEdit.addCSSClass(this._domCrop, 'ct-control--active');
    };

    ImageDialog.prototype.clear = function() {
      if (this._domImage) {
        this._domImage.parentNode.removeChild(this._domImage);
        this._domImage = null;
      }
      this._imageURL = null;
      this._imageSize = null;
      return this.state('empty');
    };

    ImageDialog.prototype.mount = function() {
      var domActions, domProgressBar, domTools;
      ImageDialog.__super__.mount.call(this);
      ContentEdit.addCSSClass(this._domElement, 'ct-image-dialog');
      ContentEdit.addCSSClass(this._domElement, 'ct-image-dialog--empty');
      ContentEdit.addCSSClass(this._domView, 'ct-image-dialog__view');
      domTools = this.constructor.createDiv(['ct-control-group', 'ct-control-group--left']);
      this._domControls.appendChild(domTools);
      this._domRotateCCW = this.constructor.createDiv(['ct-control', 'ct-control--icon', 'ct-control--rotate-ccw']);
      this._domRotateCCW.setAttribute('data-ct-tooltip', ContentEdit._('Rotate') + ' -90°');
      domTools.appendChild(this._domRotateCCW);
      this._domRotateCW = this.constructor.createDiv(['ct-control', 'ct-control--icon', 'ct-control--rotate-cw']);
      this._domRotateCW.setAttribute('data-ct-tooltip', ContentEdit._('Rotate') + ' 90°');
      domTools.appendChild(this._domRotateCW);
      this._domCrop = this.constructor.createDiv(['ct-control', 'ct-control--icon', 'ct-control--crop']);
      this._domCrop.setAttribute('data-ct-tooltip', ContentEdit._('Crop marks'));
      domTools.appendChild(this._domCrop);
      domProgressBar = this.constructor.createDiv(['ct-progress-bar']);
      domTools.appendChild(domProgressBar);
      this._domProgress = this.constructor.createDiv(['ct-progress-bar__progress']);
      domProgressBar.appendChild(this._domProgress);
      domActions = this.constructor.createDiv(['ct-control-group', 'ct-control-group--right']);
      this._domControls.appendChild(domActions);
      this._domUpload = this.constructor.createDiv(['ct-control', 'ct-control--text', 'ct-control--upload']);
      this._domUpload.textContent = ContentEdit._('Upload');
      domActions.appendChild(this._domUpload);
      this._domInput = document.createElement('input');
      this._domInput.setAttribute('class', 'ct-image-dialog__file-upload');
      this._domInput.setAttribute('name', 'file');
      this._domInput.setAttribute('type', 'file');
      this._domInput.setAttribute('accept', 'image/*');
      this._domUpload.appendChild(this._domInput);
      this._domInsert = this.constructor.createDiv(['ct-control', 'ct-control--text', 'ct-control--insert']);
      this._domInsert.textContent = ContentEdit._('Insert');
      domActions.appendChild(this._domInsert);
      this._domCancelUpload = this.constructor.createDiv(['ct-control', 'ct-control--text', 'ct-control--cancel']);
      this._domCancelUpload.textContent = ContentEdit._('Cancel');
      domActions.appendChild(this._domCancelUpload);
      this._domClear = this.constructor.createDiv(['ct-control', 'ct-control--text', 'ct-control--clear']);
      this._domClear.textContent = ContentEdit._('Clear');
      domActions.appendChild(this._domClear);
      this._addDOMEventListeners();
      return this.dispatchEvent(this.createEvent('imageuploader.mount'));
    };

    ImageDialog.prototype.populate = function(imageURL, imageSize) {
      this._imageURL = imageURL;
      this._imageSize = imageSize;
      if (!this._domImage) {
        this._domImage = this.constructor.createDiv(['ct-image-dialog__image']);
        this._domView.appendChild(this._domImage);
      }
      this._domImage.style['background-image'] = "url(" + imageURL + ")";
      return this.state('populated');
    };

    ImageDialog.prototype.progress = function(progress) {
      if (progress === void 0) {
        return this._progress;
      }
      this._progress = progress;
      if (!this.isMounted()) {
        return;
      }
      return this._domProgress.style.width = "" + this._progress + "%";
    };

    ImageDialog.prototype.removeCropMarks = function() {
      if (!this._cropMarks) {
        return;
      }
      this._cropMarks.unmount();
      this._cropMarks = null;
      return ContentEdit.removeCSSClass(this._domCrop, 'ct-control--active');
    };

    ImageDialog.prototype.save = function(imageURL, imageSize, imageAttrs) {
      return this.dispatchEvent(this.createEvent('save', {
        'imageURL': imageURL,
        'imageSize': imageSize,
        'imageAttrs': imageAttrs
      }));
    };

    ImageDialog.prototype.state = function(state) {
      var prevState;
      if (state === void 0) {
        return this._state;
      }
      if (this._state === state) {
        return;
      }
      prevState = this._state;
      this._state = state;
      if (!this.isMounted()) {
        return;
      }
      ContentEdit.addCSSClass(this._domElement, "ct-image-dialog--" + this._state);
      return ContentEdit.removeCSSClass(this._domElement, "ct-image-dialog--" + prevState);
    };

    ImageDialog.prototype.unmount = function() {
      ImageDialog.__super__.unmount.call(this);
      this._domCancelUpload = null;
      this._domClear = null;
      this._domCrop = null;
      this._domInput = null;
      this._domInsert = null;
      this._domProgress = null;
      this._domRotateCCW = null;
      this._domRotateCW = null;
      this._domUpload = null;
      return this.dispatchEvent(this.createEvent('imageuploader.unmount'));
    };

    ImageDialog.prototype._addDOMEventListeners = function() {
      ImageDialog.__super__._addDOMEventListeners.call(this);
      this._domInput.addEventListener('change', (function(_this) {
        return function(ev) {
          var file;
          file = ev.target.files[0];
          if (!file) {
            return;
          }
          ev.target.value = '';
          if (ev.target.value) {
            ev.target.type = 'text';
            ev.target.type = 'file';
          }
          return _this.dispatchEvent(_this.createEvent('imageuploader.fileready', {
            file: file
          }));
        };
      })(this));
      this._domCancelUpload.addEventListener('click', (function(_this) {
        return function(ev) {
          return _this.dispatchEvent(_this.createEvent('imageuploader.cancelupload'));
        };
      })(this));
      this._domClear.addEventListener('click', (function(_this) {
        return function(ev) {
          _this.removeCropMarks();
          return _this.dispatchEvent(_this.createEvent('imageuploader.clear'));
        };
      })(this));
      this._domRotateCCW.addEventListener('click', (function(_this) {
        return function(ev) {
          _this.removeCropMarks();
          return _this.dispatchEvent(_this.createEvent('imageuploader.rotateccw'));
        };
      })(this));
      this._domRotateCW.addEventListener('click', (function(_this) {
        return function(ev) {
          _this.removeCropMarks();
          return _this.dispatchEvent(_this.createEvent('imageuploader.rotatecw'));
        };
      })(this));
      this._domCrop.addEventListener('click', (function(_this) {
        return function(ev) {
          if (_this._cropMarks) {
            return _this.removeCropMarks();
          } else {
            return _this.addCropMarks();
          }
        };
      })(this));
      return this._domInsert.addEventListener('click', (function(_this) {
        return function(ev) {
          return _this.dispatchEvent(_this.createEvent('imageuploader.save'));
        };
      })(this));
    };

    return ImageDialog;

  })(ContentTools.DialogUI);

  CropMarksUI = (function(_super) {
    __extends(CropMarksUI, _super);

    function CropMarksUI(imageSize) {
      CropMarksUI.__super__.constructor.call(this);
      this._bounds = null;
      this._dragging = null;
      this._draggingOrigin = null;
      this._imageSize = imageSize;
    }

    CropMarksUI.prototype.mount = function(domParent, before) {
      if (before == null) {
        before = null;
      }
      this._domElement = this.constructor.createDiv(['ct-crop-marks']);
      this._domClipper = this.constructor.createDiv(['ct-crop-marks__clipper']);
      this._domElement.appendChild(this._domClipper);
      this._domRulers = [this.constructor.createDiv(['ct-crop-marks__ruler', 'ct-crop-marks__ruler--top-left']), this.constructor.createDiv(['ct-crop-marks__ruler', 'ct-crop-marks__ruler--bottom-right'])];
      this._domClipper.appendChild(this._domRulers[0]);
      this._domClipper.appendChild(this._domRulers[1]);
      this._domHandles = [this.constructor.createDiv(['ct-crop-marks__handle', 'ct-crop-marks__handle--top-left']), this.constructor.createDiv(['ct-crop-marks__handle', 'ct-crop-marks__handle--bottom-right'])];
      this._domElement.appendChild(this._domHandles[0]);
      this._domElement.appendChild(this._domHandles[1]);
      CropMarksUI.__super__.mount.call(this, domParent, before);
      return this._fit(domParent);
    };

    CropMarksUI.prototype.region = function() {
      return [parseFloat(this._domHandles[0].style.top) / this._bounds[1], parseFloat(this._domHandles[0].style.left) / this._bounds[0], parseFloat(this._domHandles[1].style.top) / this._bounds[1], parseFloat(this._domHandles[1].style.left) / this._bounds[0]];
    };

    CropMarksUI.prototype.unmount = function() {
      CropMarksUI.__super__.unmount.call(this);
      this._domClipper = null;
      this._domHandles = null;
      return this._domRulers = null;
    };

    CropMarksUI.prototype._addDOMEventListeners = function() {
      CropMarksUI.__super__._addDOMEventListeners.call(this);
      this._domHandles[0].addEventListener('mousedown', (function(_this) {
        return function(ev) {
          if (ev.button === 0) {
            return _this._startDrag(0, ev.clientY, ev.clientX);
          }
        };
      })(this));
      return this._domHandles[1].addEventListener('mousedown', (function(_this) {
        return function(ev) {
          if (ev.button === 0) {
            return _this._startDrag(1, ev.clientY, ev.clientX);
          }
        };
      })(this));
    };

    CropMarksUI.prototype._drag = function(top, left) {
      var height, minCrop, offsetLeft, offsetTop, width;
      if (this._dragging === null) {
        return;
      }
      ContentSelect.Range.unselectAll();
      offsetTop = top - this._draggingOrigin[1];
      offsetLeft = left - this._draggingOrigin[0];
      height = this._bounds[1];
      left = 0;
      top = 0;
      width = this._bounds[0];
      minCrop = Math.min(Math.min(ContentTools.MIN_CROP, height), width);
      if (this._dragging === 0) {
        height = parseInt(this._domHandles[1].style.top) - minCrop;
        width = parseInt(this._domHandles[1].style.left) - minCrop;
      } else {
        left = parseInt(this._domHandles[0].style.left) + minCrop;
        top = parseInt(this._domHandles[0].style.top) + minCrop;
      }
      offsetTop = Math.min(Math.max(top, offsetTop), height);
      offsetLeft = Math.min(Math.max(left, offsetLeft), width);
      this._domHandles[this._dragging].style.top = "" + offsetTop + "px";
      this._domHandles[this._dragging].style.left = "" + offsetLeft + "px";
      this._domRulers[this._dragging].style.top = "" + offsetTop + "px";
      return this._domRulers[this._dragging].style.left = "" + offsetLeft + "px";
    };

    CropMarksUI.prototype._fit = function(domParent) {
      var height, heightScale, left, ratio, rect, top, width, widthScale;
      rect = domParent.getBoundingClientRect();
      widthScale = rect.width / this._imageSize[0];
      heightScale = rect.height / this._imageSize[1];
      ratio = Math.min(widthScale, heightScale);
      width = ratio * this._imageSize[0];
      height = ratio * this._imageSize[1];
      left = (rect.width - width) / 2;
      top = (rect.height - height) / 2;
      this._domElement.style.width = "" + width + "px";
      this._domElement.style.height = "" + height + "px";
      this._domElement.style.top = "" + top + "px";
      this._domElement.style.left = "" + left + "px";
      this._domHandles[0].style.top = '0px';
      this._domHandles[0].style.left = '0px';
      this._domHandles[1].style.top = "" + height + "px";
      this._domHandles[1].style.left = "" + width + "px";
      this._domRulers[0].style.top = '0px';
      this._domRulers[0].style.left = '0px';
      this._domRulers[1].style.top = "" + height + "px";
      this._domRulers[1].style.left = "" + width + "px";
      return this._bounds = [width, height];
    };

    CropMarksUI.prototype._startDrag = function(handleIndex, top, left) {
      var domHandle;
      domHandle = this._domHandles[handleIndex];
      this._dragging = handleIndex;
      this._draggingOrigin = [left - parseInt(domHandle.style.left), top - parseInt(domHandle.style.top)];
      this._onMouseMove = (function(_this) {
        return function(ev) {
          return _this._drag(ev.clientY, ev.clientX);
        };
      })(this);
      document.addEventListener('mousemove', this._onMouseMove);
      this._onMouseUp = (function(_this) {
        return function(ev) {
          return _this._stopDrag();
        };
      })(this);
      return document.addEventListener('mouseup', this._onMouseUp);
    };

    CropMarksUI.prototype._stopDrag = function() {
      document.removeEventListener('mousemove', this._onMouseMove);
      document.removeEventListener('mouseup', this._onMouseUp);
      this._dragging = null;
      return this._draggingOrigin = null;
    };

    return CropMarksUI;

  })(ContentTools.AnchoredComponentUI);

  ContentTools.LinkDialog = (function(_super) {
    var NEW_WINDOW_TARGET;

    __extends(LinkDialog, _super);

    NEW_WINDOW_TARGET = '_blank';

    function LinkDialog(href, target) {
      if (href == null) {
        href = '';
      }
      if (target == null) {
        target = '';
      }
      LinkDialog.__super__.constructor.call(this);
      this._href = href;
      this._target = target;
    }

    LinkDialog.prototype.mount = function() {
      LinkDialog.__super__.mount.call(this);
      this._domInput = document.createElement('input');
      this._domInput.setAttribute('class', 'ct-anchored-dialog__input');
      this._domInput.setAttribute('name', 'href');
      this._domInput.setAttribute('placeholder', ContentEdit._('Enter a link') + '...');
      this._domInput.setAttribute('type', 'text');
      this._domInput.setAttribute('value', this._href);
      this._domElement.appendChild(this._domInput);
      this._domTargetButton = this.constructor.createDiv(['ct-anchored-dialog__target-button']);
      this._domElement.appendChild(this._domTargetButton);
      if (this._target === NEW_WINDOW_TARGET) {
        ContentEdit.addCSSClass(this._domTargetButton, 'ct-anchored-dialog__target-button--active');
      }
      this._domButton = this.constructor.createDiv(['ct-anchored-dialog__button']);
      this._domElement.appendChild(this._domButton);
      return this._addDOMEventListeners();
    };

    LinkDialog.prototype.save = function() {
      var detail;
      if (!this.isMounted()) {
        this.dispatchEvent(this.createEvent('save'));
        return;
      }
      detail = {
        href: this._domInput.value.trim()
      };
      if (this._target) {
        detail.target = this._target;
      }
      return this.dispatchEvent(this.createEvent('save', detail));
    };

    LinkDialog.prototype.show = function() {
      LinkDialog.__super__.show.call(this);
      this._domInput.focus();
      if (this._href) {
        return this._domInput.select();
      }
    };

    LinkDialog.prototype.unmount = function() {
      if (this.isMounted()) {
        this._domInput.blur();
      }
      LinkDialog.__super__.unmount.call(this);
      this._domButton = null;
      return this._domInput = null;
    };

    LinkDialog.prototype._addDOMEventListeners = function() {
      this._domInput.addEventListener('keypress', (function(_this) {
        return function(ev) {
          if (ev.keyCode === 13) {
            return _this.save();
          }
        };
      })(this));
      this._domTargetButton.addEventListener('click', (function(_this) {
        return function(ev) {
          ev.preventDefault();
          if (_this._target === NEW_WINDOW_TARGET) {
            _this._target = '';
            return ContentEdit.removeCSSClass(_this._domTargetButton, 'ct-anchored-dialog__target-button--active');
          } else {
            _this._target = NEW_WINDOW_TARGET;
            return ContentEdit.addCSSClass(_this._domTargetButton, 'ct-anchored-dialog__target-button--active');
          }
        };
      })(this));
      return this._domButton.addEventListener('click', (function(_this) {
        return function(ev) {
          ev.preventDefault();
          return _this.save();
        };
      })(this));
    };

    return LinkDialog;

  })(ContentTools.AnchoredDialogUI);

  ContentTools.PropertiesDialog = (function(_super) {
    __extends(PropertiesDialog, _super);

    function PropertiesDialog(element) {
      var _ref;
      this.element = element;
      PropertiesDialog.__super__.constructor.call(this, 'Properties');
      this._attributeUIs = [];
      this._focusedAttributeUI = null;
      this._styleUIs = [];
      this._supportsCoding = this.element.content;
      if ((_ref = this.element.type()) === 'ListItem' || _ref === 'TableCell') {
        this._supportsCoding = true;
      }
    }

    PropertiesDialog.prototype.caption = function(caption) {
      if (caption === void 0) {
        return this._caption;
      }
      this._caption = caption;
      return this._domCaption.textContent = ContentEdit._(caption) + (": " + (this.element.tagName()));
    };

    PropertiesDialog.prototype.changedAttributes = function() {
      var attributeUI, attributes, changedAttributes, name, restricted, value, _i, _len, _ref, _ref1;
      attributes = {};
      changedAttributes = {};
      _ref = this._attributeUIs;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        attributeUI = _ref[_i];
        name = attributeUI.name();
        value = attributeUI.value();
        if (name === '') {
          continue;
        }
        attributes[name.toLowerCase()] = true;
        if (this.element.attr(name) !== value) {
          changedAttributes[name] = value;
        }
      }
      restricted = ContentTools.getRestrictedAtributes(this.element.tagName());
      _ref1 = this.element.attributes();
      for (name in _ref1) {
        value = _ref1[name];
        if (restricted && restricted.indexOf(name.toLowerCase()) !== -1) {
          continue;
        }
        if (attributes[name] === void 0) {
          changedAttributes[name] = null;
        }
      }
      return changedAttributes;
    };

    PropertiesDialog.prototype.changedStyles = function() {
      var cssClass, styleUI, styles, _i, _len, _ref;
      styles = {};
      _ref = this._styleUIs;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        styleUI = _ref[_i];
        cssClass = styleUI.style.cssClass();
        if (this.element.hasCSSClass(cssClass) !== styleUI.applied()) {
          styles[cssClass] = styleUI.applied();
        }
      }
      return styles;
    };

    PropertiesDialog.prototype.getElementInnerHTML = function() {
      if (!this._supportsCoding) {
        return null;
      }
      if (this.element.content) {
        return this.element.content.html();
      }
      return this.element.children[0].content.html();
    };

    PropertiesDialog.prototype.mount = function() {
      var attributeNames, attributes, domActions, domTabs, lastTab, name, restricted, style, styleUI, value, _i, _j, _len, _len1, _ref;
      PropertiesDialog.__super__.mount.call(this);
      ContentEdit.addCSSClass(this._domElement, 'ct-properties-dialog');
      ContentEdit.addCSSClass(this._domView, 'ct-properties-dialog__view');
      this._domStyles = this.constructor.createDiv(['ct-properties-dialog__styles']);
      this._domStyles.setAttribute('data-ct-empty', ContentEdit._('No styles available for this tag'));
      this._domView.appendChild(this._domStyles);
      _ref = ContentTools.StylePalette.styles(this.element);
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        style = _ref[_i];
        styleUI = new StyleUI(style, this.element.hasCSSClass(style.cssClass()));
        this._styleUIs.push(styleUI);
        styleUI.mount(this._domStyles);
      }
      this._domAttributes = this.constructor.createDiv(['ct-properties-dialog__attributes']);
      this._domView.appendChild(this._domAttributes);
      restricted = ContentTools.getRestrictedAtributes(this.element.tagName());
      attributes = this.element.attributes();
      attributeNames = [];
      for (name in attributes) {
        value = attributes[name];
        if (restricted && restricted.indexOf(name.toLowerCase()) !== -1) {
          continue;
        }
        attributeNames.push(name);
      }
      attributeNames.sort();
      for (_j = 0, _len1 = attributeNames.length; _j < _len1; _j++) {
        name = attributeNames[_j];
        value = attributes[name];
        this._addAttributeUI(name, value);
      }
      this._addAttributeUI('', '');
      this._domCode = this.constructor.createDiv(['ct-properties-dialog__code']);
      this._domView.appendChild(this._domCode);
      this._domInnerHTML = document.createElement('textarea');
      this._domInnerHTML.setAttribute('class', 'ct-properties-dialog__inner-html');
      this._domInnerHTML.setAttribute('name', 'code');
      this._domInnerHTML.value = this.getElementInnerHTML();
      this._domCode.appendChild(this._domInnerHTML);
      domTabs = this.constructor.createDiv(['ct-control-group', 'ct-control-group--left']);
      this._domControls.appendChild(domTabs);
      this._domStylesTab = this.constructor.createDiv(['ct-control', 'ct-control--icon', 'ct-control--styles']);
      this._domStylesTab.setAttribute('data-ct-tooltip', ContentEdit._('Styles'));
      domTabs.appendChild(this._domStylesTab);
      this._domAttributesTab = this.constructor.createDiv(['ct-control', 'ct-control--icon', 'ct-control--attributes']);
      this._domAttributesTab.setAttribute('data-ct-tooltip', ContentEdit._('Attributes'));
      domTabs.appendChild(this._domAttributesTab);
      this._domCodeTab = this.constructor.createDiv(['ct-control', 'ct-control--icon', 'ct-control--code']);
      this._domCodeTab.setAttribute('data-ct-tooltip', ContentEdit._('Code'));
      domTabs.appendChild(this._domCodeTab);
      if (!this._supportsCoding) {
        ContentEdit.addCSSClass(this._domCodeTab, 'ct-control--muted');
      }
      this._domRemoveAttribute = this.constructor.createDiv(['ct-control', 'ct-control--icon', 'ct-control--remove', 'ct-control--muted']);
      this._domRemoveAttribute.setAttribute('data-ct-tooltip', ContentEdit._('Remove'));
      domTabs.appendChild(this._domRemoveAttribute);
      domActions = this.constructor.createDiv(['ct-control-group', 'ct-control-group--right']);
      this._domControls.appendChild(domActions);
      this._domApply = this.constructor.createDiv(['ct-control', 'ct-control--text', 'ct-control--apply']);
      this._domApply.textContent = ContentEdit._('Apply');
      domActions.appendChild(this._domApply);
      lastTab = window.localStorage.getItem('ct-properties-dialog-tab');
      if (lastTab === 'attributes') {
        ContentEdit.addCSSClass(this._domElement, 'ct-properties-dialog--attributes');
        ContentEdit.addCSSClass(this._domAttributesTab, 'ct-control--active');
      } else if (lastTab === 'code' && this._supportsCoding) {
        ContentEdit.addCSSClass(this._domElement, 'ct-properties-dialog--code');
        ContentEdit.addCSSClass(this._domCodeTab, 'ct-control--active');
      } else {
        ContentEdit.addCSSClass(this._domElement, 'ct-properties-dialog--styles');
        ContentEdit.addCSSClass(this._domStylesTab, 'ct-control--active');
      }
      return this._addDOMEventListeners();
    };

    PropertiesDialog.prototype.save = function() {
      var detail, innerHTML;
      innerHTML = null;
      if (this._supportsCoding) {
        innerHTML = this._domInnerHTML.value;
      }
      detail = {
        changedAttributes: this.changedAttributes(),
        changedStyles: this.changedStyles(),
        innerHTML: innerHTML
      };
      return this.dispatchEvent(this.createEvent('save', detail));
    };

    PropertiesDialog.prototype._addAttributeUI = function(name, value) {
      var attributeUI, dialog;
      dialog = this;
      attributeUI = new AttributeUI(name, value);
      this._attributeUIs.push(attributeUI);
      attributeUI.addEventListener('blur', function(ev) {
        var index, lastAttributeUI, length;
        dialog._focusedAttributeUI = null;
        ContentEdit.addCSSClass(dialog._domRemoveAttribute, 'ct-control--muted');
        index = dialog._attributeUIs.indexOf(this);
        length = dialog._attributeUIs.length;
        if (this.name() === '' && index < (length - 1)) {
          this.unmount();
          dialog._attributeUIs.splice(index, 1);
        }
        lastAttributeUI = dialog._attributeUIs[length - 1];
        if (lastAttributeUI) {
          if (lastAttributeUI.name() && lastAttributeUI.value()) {
            return dialog._addAttributeUI('', '');
          }
        }
      });
      attributeUI.addEventListener('focus', function(ev) {
        dialog._focusedAttributeUI = this;
        return ContentEdit.removeCSSClass(dialog._domRemoveAttribute, 'ct-control--muted');
      });
      attributeUI.addEventListener('namechange', function(ev) {
        var element, otherAttributeUI, restricted, valid, _i, _len, _ref;
        element = dialog.element;
        name = this.name().toLowerCase();
        restricted = ContentTools.getRestrictedAtributes(element.tagName());
        valid = true;
        if (restricted && restricted.indexOf(name) !== -1) {
          valid = false;
        }
        _ref = dialog._attributeUIs;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          otherAttributeUI = _ref[_i];
          if (name === '') {
            continue;
          }
          if (otherAttributeUI === this) {
            continue;
          }
          if (otherAttributeUI.name().toLowerCase() !== name) {
            continue;
          }
          valid = false;
        }
        this.valid(valid);
        if (valid) {
          return ContentEdit.removeCSSClass(dialog._domApply, 'ct-control--muted');
        } else {
          return ContentEdit.addCSSClass(dialog._domApply, 'ct-control--muted');
        }
      });
      attributeUI.mount(this._domAttributes);
      return attributeUI;
    };

    PropertiesDialog.prototype._addDOMEventListeners = function() {
      var selectTab, validateCode;
      PropertiesDialog.__super__._addDOMEventListeners.call(this);
      selectTab = (function(_this) {
        return function(selected) {
          var selectedCap, tab, tabCap, tabs, _i, _len;
          tabs = ['attributes', 'code', 'styles'];
          for (_i = 0, _len = tabs.length; _i < _len; _i++) {
            tab = tabs[_i];
            if (tab === selected) {
              continue;
            }
            tabCap = tab.charAt(0).toUpperCase() + tab.slice(1);
            ContentEdit.removeCSSClass(_this._domElement, "ct-properties-dialog--" + tab);
            ContentEdit.removeCSSClass(_this["_dom" + tabCap + "Tab"], 'ct-control--active');
          }
          selectedCap = selected.charAt(0).toUpperCase() + selected.slice(1);
          ContentEdit.addCSSClass(_this._domElement, "ct-properties-dialog--" + selected);
          ContentEdit.addCSSClass(_this["_dom" + selectedCap + "Tab"], 'ct-control--active');
          return window.localStorage.setItem('ct-properties-dialog-tab', selected);
        };
      })(this);
      this._domStylesTab.addEventListener('mousedown', (function(_this) {
        return function() {
          return selectTab('styles');
        };
      })(this));
      this._domAttributesTab.addEventListener('mousedown', (function(_this) {
        return function() {
          return selectTab('attributes');
        };
      })(this));
      if (this._supportsCoding) {
        this._domCodeTab.addEventListener('mousedown', (function(_this) {
          return function() {
            return selectTab('code');
          };
        })(this));
      }
      this._domRemoveAttribute.addEventListener('mousedown', (function(_this) {
        return function(ev) {
          var index, last;
          ev.preventDefault();
          if (_this._focusedAttributeUI) {
            index = _this._attributeUIs.indexOf(_this._focusedAttributeUI);
            last = index === (_this._attributeUIs.length - 1);
            _this._focusedAttributeUI.unmount();
            _this._attributeUIs.splice(index, 1);
            if (last) {
              return _this._addAttributeUI('', '');
            }
          }
        };
      })(this));
      validateCode = (function(_this) {
        return function(ev) {
          var content;
          try {
            content = new HTMLString.String(_this._domInnerHTML.value);
            ContentEdit.removeCSSClass(_this._domInnerHTML, 'ct-properties-dialog__inner-html--invalid');
            return ContentEdit.removeCSSClass(_this._domApply, 'ct-control--muted');
          } catch (_error) {
            ContentEdit.addCSSClass(_this._domInnerHTML, 'ct-properties-dialog__inner-html--invalid');
            return ContentEdit.addCSSClass(_this._domApply, 'ct-control--muted');
          }
        };
      })(this);
      this._domInnerHTML.addEventListener('input', validateCode);
      this._domInnerHTML.addEventListener('propertychange', validateCode);
      return this._domApply.addEventListener('click', (function(_this) {
        return function(ev) {
          var cssClass;
          ev.preventDefault();
          cssClass = _this._domApply.getAttribute('class');
          if (cssClass.indexOf('ct-control--muted') === -1) {
            return _this.save();
          }
        };
      })(this));
    };

    return PropertiesDialog;

  })(ContentTools.DialogUI);

  StyleUI = (function(_super) {
    __extends(StyleUI, _super);

    function StyleUI(style, applied) {
      this.style = style;
      StyleUI.__super__.constructor.call(this);
      this._applied = applied;
    }

    StyleUI.prototype.applied = function(applied) {
      if (applied === void 0) {
        return this._applied;
      }
      if (this._applied === applied) {
        return;
      }
      this._applied = applied;
      if (this._applied) {
        return ContentEdit.addCSSClass(this._domElement, 'ct-section--applied');
      } else {
        return ContentEdit.removeCSSClass(this._domElement, 'ct-section--applied');
      }
    };

    StyleUI.prototype.mount = function(domParent, before) {
      var label;
      if (before == null) {
        before = null;
      }
      this._domElement = this.constructor.createDiv(['ct-section']);
      if (this._applied) {
        ContentEdit.addCSSClass(this._domElement, 'ct-section--applied');
      }
      label = this.constructor.createDiv(['ct-section__label']);
      label.textContent = this.style.name();
      this._domElement.appendChild(label);
      this._domElement.appendChild(this.constructor.createDiv(['ct-section__switch']));
      return StyleUI.__super__.mount.call(this, domParent, before);
    };

    StyleUI.prototype._addDOMEventListeners = function() {
      var toggleSection;
      toggleSection = (function(_this) {
        return function(ev) {
          ev.preventDefault();
          if (_this.applied()) {
            return _this.applied(false);
          } else {
            return _this.applied(true);
          }
        };
      })(this);
      return this._domElement.addEventListener('click', toggleSection);
    };

    return StyleUI;

  })(ContentTools.AnchoredComponentUI);

  AttributeUI = (function(_super) {
    __extends(AttributeUI, _super);

    function AttributeUI(name, value) {
      AttributeUI.__super__.constructor.call(this);
      this._initialName = name;
      this._initialValue = value;
    }

    AttributeUI.prototype.name = function() {
      return this._domName.value.trim();
    };

    AttributeUI.prototype.value = function() {
      return this._domValue.value.trim();
    };

    AttributeUI.prototype.mount = function(domParent, before) {
      if (before == null) {
        before = null;
      }
      this._domElement = this.constructor.createDiv(['ct-attribute']);
      this._domName = document.createElement('input');
      this._domName.setAttribute('class', 'ct-attribute__name');
      this._domName.setAttribute('name', 'name');
      this._domName.setAttribute('placeholder', ContentEdit._('Name'));
      this._domName.setAttribute('type', 'text');
      this._domName.setAttribute('value', this._initialName);
      this._domElement.appendChild(this._domName);
      this._domValue = document.createElement('input');
      this._domValue.setAttribute('class', 'ct-attribute__value');
      this._domValue.setAttribute('name', 'value');
      this._domValue.setAttribute('placeholder', ContentEdit._('Value'));
      this._domValue.setAttribute('type', 'text');
      this._domValue.setAttribute('value', this._initialValue);
      this._domElement.appendChild(this._domValue);
      return AttributeUI.__super__.mount.call(this, domParent, before);
    };

    AttributeUI.prototype.valid = function(valid) {
      if (valid) {
        return ContentEdit.removeCSSClass(this._domName, 'ct-attribute__name--invalid');
      } else {
        return ContentEdit.addCSSClass(this._domName, 'ct-attribute__name--invalid');
      }
    };

    AttributeUI.prototype._addDOMEventListeners = function() {
      this._domName.addEventListener('blur', (function(_this) {
        return function() {
          var name, nextDomAttribute, nextNameDom;
          name = _this.name();
          nextDomAttribute = _this._domElement.nextSibling;
          _this.dispatchEvent(_this.createEvent('blur'));
          if (name === '' && nextDomAttribute) {
            nextNameDom = nextDomAttribute.querySelector('.ct-attribute__name');
            return nextNameDom.focus();
          }
        };
      })(this));
      this._domName.addEventListener('focus', (function(_this) {
        return function() {
          return _this.dispatchEvent(_this.createEvent('focus'));
        };
      })(this));
      this._domName.addEventListener('input', (function(_this) {
        return function() {
          return _this.dispatchEvent(_this.createEvent('namechange'));
        };
      })(this));
      this._domName.addEventListener('keydown', (function(_this) {
        return function(ev) {
          if (ev.keyCode === 13) {
            return _this._domValue.focus();
          }
        };
      })(this));
      this._domValue.addEventListener('blur', (function(_this) {
        return function() {
          return _this.dispatchEvent(_this.createEvent('blur'));
        };
      })(this));
      this._domValue.addEventListener('focus', (function(_this) {
        return function() {
          return _this.dispatchEvent(_this.createEvent('focus'));
        };
      })(this));
      return this._domValue.addEventListener('keydown', (function(_this) {
        return function(ev) {
          var nextDomAttribute, nextNameDom;
          if (ev.keyCode !== 13 && (ev.keyCode !== 9 || ev.shiftKey)) {
            return;
          }
          ev.preventDefault();
          nextDomAttribute = _this._domElement.nextSibling;
          if (!nextDomAttribute) {
            _this._domValue.blur();
            nextDomAttribute = _this._domElement.nextSibling;
          }
          if (nextDomAttribute) {
            nextNameDom = nextDomAttribute.querySelector('.ct-attribute__name');
            return nextNameDom.focus();
          }
        };
      })(this));
    };

    return AttributeUI;

  })(ContentTools.AnchoredComponentUI);

  ContentTools.TableDialog = (function(_super) {
    __extends(TableDialog, _super);

    function TableDialog(table) {
      this.table = table;
      if (this.table) {
        TableDialog.__super__.constructor.call(this, 'Update table');
      } else {
        TableDialog.__super__.constructor.call(this, 'Insert table');
      }
    }

    TableDialog.prototype.mount = function() {
      var cfg, domBodyLabel, domControlGroup, domFootLabel, domHeadLabel, footCSSClasses, headCSSClasses;
      TableDialog.__super__.mount.call(this);
      cfg = {
        columns: 3,
        foot: false,
        head: true
      };
      if (this.table) {
        cfg = {
          columns: this.table.firstSection().children[0].children.length,
          foot: this.table.tfoot(),
          head: this.table.thead()
        };
      }
      ContentEdit.addCSSClass(this._domElement, 'ct-table-dialog');
      ContentEdit.addCSSClass(this._domView, 'ct-table-dialog__view');
      headCSSClasses = ['ct-section'];
      if (cfg.head) {
        headCSSClasses.push('ct-section--applied');
      }
      this._domHeadSection = this.constructor.createDiv(headCSSClasses);
      this._domView.appendChild(this._domHeadSection);
      domHeadLabel = this.constructor.createDiv(['ct-section__label']);
      domHeadLabel.textContent = ContentEdit._('Table head');
      this._domHeadSection.appendChild(domHeadLabel);
      this._domHeadSwitch = this.constructor.createDiv(['ct-section__switch']);
      this._domHeadSection.appendChild(this._domHeadSwitch);
      this._domBodySection = this.constructor.createDiv(['ct-section', 'ct-section--applied', 'ct-section--contains-input']);
      this._domView.appendChild(this._domBodySection);
      domBodyLabel = this.constructor.createDiv(['ct-section__label']);
      domBodyLabel.textContent = ContentEdit._('Table body (columns)');
      this._domBodySection.appendChild(domBodyLabel);
      this._domBodyInput = document.createElement('input');
      this._domBodyInput.setAttribute('class', 'ct-section__input');
      this._domBodyInput.setAttribute('maxlength', '2');
      this._domBodyInput.setAttribute('name', 'columns');
      this._domBodyInput.setAttribute('type', 'text');
      this._domBodyInput.setAttribute('value', cfg.columns);
      this._domBodySection.appendChild(this._domBodyInput);
      footCSSClasses = ['ct-section'];
      if (cfg.foot) {
        footCSSClasses.push('ct-section--applied');
      }
      this._domFootSection = this.constructor.createDiv(footCSSClasses);
      this._domView.appendChild(this._domFootSection);
      domFootLabel = this.constructor.createDiv(['ct-section__label']);
      domFootLabel.textContent = ContentEdit._('Table foot');
      this._domFootSection.appendChild(domFootLabel);
      this._domFootSwitch = this.constructor.createDiv(['ct-section__switch']);
      this._domFootSection.appendChild(this._domFootSwitch);
      domControlGroup = this.constructor.createDiv(['ct-control-group', 'ct-control-group--right']);
      this._domControls.appendChild(domControlGroup);
      this._domApply = this.constructor.createDiv(['ct-control', 'ct-control--text', 'ct-control--apply']);
      this._domApply.textContent = 'Apply';
      domControlGroup.appendChild(this._domApply);
      return this._addDOMEventListeners();
    };

    TableDialog.prototype.save = function() {
      var detail, footCSSClass, headCSSClass;
      footCSSClass = this._domFootSection.getAttribute('class');
      headCSSClass = this._domHeadSection.getAttribute('class');
      detail = {
        columns: parseInt(this._domBodyInput.value),
        foot: footCSSClass.indexOf('ct-section--applied') > -1,
        head: headCSSClass.indexOf('ct-section--applied') > -1
      };
      return this.dispatchEvent(this.createEvent('save', detail));
    };

    TableDialog.prototype.unmount = function() {
      TableDialog.__super__.unmount.call(this);
      this._domBodyInput = null;
      this._domBodySection = null;
      this._domApply = null;
      this._domHeadSection = null;
      this._domHeadSwitch = null;
      this._domFootSection = null;
      return this._domFootSwitch = null;
    };

    TableDialog.prototype._addDOMEventListeners = function() {
      var toggleSection;
      TableDialog.__super__._addDOMEventListeners.call(this);
      toggleSection = function(ev) {
        ev.preventDefault();
        if (this.getAttribute('class').indexOf('ct-section--applied') > -1) {
          return ContentEdit.removeCSSClass(this, 'ct-section--applied');
        } else {
          return ContentEdit.addCSSClass(this, 'ct-section--applied');
        }
      };
      this._domHeadSection.addEventListener('click', toggleSection);
      this._domFootSection.addEventListener('click', toggleSection);
      this._domBodySection.addEventListener('click', (function(_this) {
        return function(ev) {
          return _this._domBodyInput.focus();
        };
      })(this));
      this._domBodyInput.addEventListener('input', (function(_this) {
        return function(ev) {
          var valid;
          valid = /^[1-9]\d{0,1}$/.test(ev.target.value);
          if (valid) {
            ContentEdit.removeCSSClass(_this._domBodyInput, 'ct-section__input--invalid');
            return ContentEdit.removeCSSClass(_this._domApply, 'ct-control--muted');
          } else {
            ContentEdit.addCSSClass(_this._domBodyInput, 'ct-section__input--invalid');
            return ContentEdit.addCSSClass(_this._domApply, 'ct-control--muted');
          }
        };
      })(this));
      return this._domApply.addEventListener('click', (function(_this) {
        return function(ev) {
          var cssClass;
          ev.preventDefault();
          cssClass = _this._domApply.getAttribute('class');
          if (cssClass.indexOf('ct-control--muted') === -1) {
            return _this.save();
          }
        };
      })(this));
    };

    return TableDialog;

  })(ContentTools.DialogUI);

  ContentTools.VideoDialog = (function(_super) {
    __extends(VideoDialog, _super);

    function VideoDialog() {
      VideoDialog.__super__.constructor.call(this, 'Insert video');
    }

    VideoDialog.prototype.clearPreview = function() {
      if (this._domPreview) {
        this._domPreview.parentNode.removeChild(this._domPreview);
        return this._domPreview = void 0;
      }
    };

    VideoDialog.prototype.mount = function() {
      var domControlGroup;
      VideoDialog.__super__.mount.call(this);
      ContentEdit.addCSSClass(this._domElement, 'ct-video-dialog');
      ContentEdit.addCSSClass(this._domView, 'ct-video-dialog__preview');
      domControlGroup = this.constructor.createDiv(['ct-control-group']);
      this._domControls.appendChild(domControlGroup);
      this._domInput = document.createElement('input');
      this._domInput.setAttribute('class', 'ct-video-dialog__input');
      this._domInput.setAttribute('name', 'url');
      this._domInput.setAttribute('placeholder', ContentEdit._('Paste YouTube or Vimeo URL') + '...');
      this._domInput.setAttribute('type', 'text');
      domControlGroup.appendChild(this._domInput);
      this._domButton = this.constructor.createDiv(['ct-control', 'ct-control--text', 'ct-control--insert', 'ct-control--muted']);
      this._domButton.textContent = ContentEdit._('Insert');
      domControlGroup.appendChild(this._domButton);
      return this._addDOMEventListeners();
    };

    VideoDialog.prototype.preview = function(url) {
      this.clearPreview();
      this._domPreview = document.createElement('iframe');
      this._domPreview.setAttribute('frameborder', '0');
      this._domPreview.setAttribute('height', '100%');
      this._domPreview.setAttribute('src', url);
      this._domPreview.setAttribute('width', '100%');
      return this._domView.appendChild(this._domPreview);
    };

    VideoDialog.prototype.save = function() {
      var embedURL, videoURL;
      videoURL = this._domInput.value.trim();
      embedURL = ContentTools.getEmbedVideoURL(videoURL);
      if (embedURL) {
        return this.dispatchEvent(this.createEvent('save', {
          'url': embedURL
        }));
      } else {
        return this.dispatchEvent(this.createEvent('save', {
          'url': videoURL
        }));
      }
    };

    VideoDialog.prototype.show = function() {
      VideoDialog.__super__.show.call(this);
      return this._domInput.focus();
    };

    VideoDialog.prototype.unmount = function() {
      if (this.isMounted()) {
        this._domInput.blur();
      }
      VideoDialog.__super__.unmount.call(this);
      this._domButton = null;
      this._domInput = null;
      return this._domPreview = null;
    };

    VideoDialog.prototype._addDOMEventListeners = function() {
      VideoDialog.__super__._addDOMEventListeners.call(this);
      this._domInput.addEventListener('input', (function(_this) {
        return function(ev) {
          var updatePreview;
          if (ev.target.value) {
            ContentEdit.removeCSSClass(_this._domButton, 'ct-control--muted');
          } else {
            ContentEdit.addCSSClass(_this._domButton, 'ct-control--muted');
          }
          if (_this._updatePreviewTimeout) {
            clearTimeout(_this._updatePreviewTimeout);
          }
          updatePreview = function() {
            var embedURL, videoURL;
            videoURL = _this._domInput.value.trim();
            embedURL = ContentTools.getEmbedVideoURL(videoURL);
            if (embedURL) {
              return _this.preview(embedURL);
            } else {
              return _this.clearPreview();
            }
          };
          return _this._updatePreviewTimeout = setTimeout(updatePreview, 500);
        };
      })(this));
      this._domInput.addEventListener('keypress', (function(_this) {
        return function(ev) {
          if (ev.keyCode === 13) {
            return _this.save();
          }
        };
      })(this));
      return this._domButton.addEventListener('click', (function(_this) {
        return function(ev) {
          var cssClass;
          ev.preventDefault();
          cssClass = _this._domButton.getAttribute('class');
          if (cssClass.indexOf('ct-control--muted') === -1) {
            return _this.save();
          }
        };
      })(this));
    };

    return VideoDialog;

  })(ContentTools.DialogUI);

  _EditorApp = (function(_super) {
    __extends(_EditorApp, _super);

    function _EditorApp() {
      _EditorApp.__super__.constructor.call(this);
      this.history = null;
      this._state = 'dormant';
      this._busy = false;
      this._namingProp = null;
      this._fixtureTest = function(domElement) {
        return domElement.hasAttribute('data-fixture');
      };
      this._regionQuery = null;
      this._domRegions = null;
      this._regions = {};
      this._orderedRegions = [];
      this._rootLastModified = null;
      this._regionsLastModified = {};
      this._ignition = null;
      this._inspector = null;
      this._toolbox = null;
      this._emptyRegionsAllowed = false;
    }

    _EditorApp.prototype.ctrlDown = function() {
      return this._ctrlDown;
    };

    _EditorApp.prototype.domRegions = function() {
      return this._domRegions;
    };

    _EditorApp.prototype.getState = function() {
      return this._state;
    };

    _EditorApp.prototype.ignition = function() {
      return this._ignition;
    };

    _EditorApp.prototype.inspector = function() {
      return this._inspector;
    };

    _EditorApp.prototype.isDormant = function() {
      return this._state === 'dormant';
    };

    _EditorApp.prototype.isReady = function() {
      return this._state === 'ready';
    };

    _EditorApp.prototype.isEditing = function() {
      return this._state === 'editing';
    };

    _EditorApp.prototype.orderedRegions = function() {
      var name;
      return (function() {
        var _i, _len, _ref, _results;
        _ref = this._orderedRegions;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          name = _ref[_i];
          _results.push(this._regions[name]);
        }
        return _results;
      }).call(this);
    };

    _EditorApp.prototype.regions = function() {
      return this._regions;
    };

    _EditorApp.prototype.shiftDown = function() {
      return this._shiftDown;
    };

    _EditorApp.prototype.toolbox = function() {
      return this._toolbox;
    };

    _EditorApp.prototype.busy = function(busy) {
      if (busy === void 0) {
        this._busy = busy;
      }
      this._busy = busy;
      if (this._ignition) {
        return this._ignition.busy(busy);
      }
    };

    _EditorApp.prototype.createPlaceholderElement = function(region) {
      return new ContentEdit.Text('p', {}, '');
    };

    _EditorApp.prototype.init = function(queryOrDOMElements, namingProp, fixtureTest, withIgnition) {
      if (namingProp == null) {
        namingProp = 'id';
      }
      if (fixtureTest == null) {
        fixtureTest = null;
      }
      if (withIgnition == null) {
        withIgnition = true;
      }
      this._namingProp = namingProp;
      if (fixtureTest) {
        this._fixtureTest = fixtureTest;
      }
      this.mount();
      if (withIgnition) {
        this._ignition = new ContentTools.IgnitionUI();
        this.attach(this._ignition);
        this._ignition.addEventListener('edit', (function(_this) {
          return function(ev) {
            ev.preventDefault();
            _this.start();
            return _this._ignition.state('editing');
          };
        })(this));
        this._ignition.addEventListener('confirm', (function(_this) {
          return function(ev) {
            ev.preventDefault();
            if (_this._ignition.state() !== 'editing') {
              return;
            }
            _this._ignition.state('ready');
            return _this.stop(true);
          };
        })(this));
        this._ignition.addEventListener('cancel', (function(_this) {
          return function(ev) {
            ev.preventDefault();
            if (_this._ignition.state() !== 'editing') {
              return;
            }
            _this.stop(false);
            if (_this.isEditing()) {
              return _this._ignition.state('editing');
            } else {
              return _this._ignition.state('ready');
            }
          };
        })(this));
      }
      this._toolbox = new ContentTools.ToolboxUI(ContentTools.DEFAULT_TOOLS);
      this.attach(this._toolbox);
      this._inspector = new ContentTools.InspectorUI();
      this.attach(this._inspector);
      this._state = 'ready';
      this._handleDetach = (function(_this) {
        return function(element) {
          return _this._preventEmptyRegions();
        };
      })(this);
      this._handleClipboardPaste = (function(_this) {
        return function(element, ev) {
          var clipboardData;
          clipboardData = null;
          if (ev.clipboardData) {
            clipboardData = ev.clipboardData.getData('text/plain');
          }
          if (window.clipboardData) {
            clipboardData = window.clipboardData.getData('TEXT');
          }
          return _this.paste(element, clipboardData);
        };
      })(this);
      this._handleNextRegionTransition = (function(_this) {
        return function(region) {
          var child, element, index, regions, _i, _len, _ref;
          regions = _this.orderedRegions();
          index = regions.indexOf(region);
          if (index >= (regions.length - 1)) {
            return;
          }
          region = regions[index + 1];
          element = null;
          _ref = region.descendants();
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            child = _ref[_i];
            if (child.content !== void 0) {
              element = child;
              break;
            }
          }
          if (element) {
            element.focus();
            element.selection(new ContentSelect.Range(0, 0));
            return;
          }
          return ContentEdit.Root.get().trigger('next-region', region);
        };
      })(this);
      this._handlePreviousRegionTransition = (function(_this) {
        return function(region) {
          var child, descendants, element, index, length, regions, _i, _len;
          regions = _this.orderedRegions();
          index = regions.indexOf(region);
          if (index <= 0) {
            return;
          }
          region = regions[index - 1];
          element = null;
          descendants = region.descendants();
          descendants.reverse();
          for (_i = 0, _len = descendants.length; _i < _len; _i++) {
            child = descendants[_i];
            if (child.content !== void 0) {
              element = child;
              break;
            }
          }
          if (element) {
            length = element.content.length();
            element.focus();
            element.selection(new ContentSelect.Range(length, length));
            return;
          }
          return ContentEdit.Root.get().trigger('previous-region', region);
        };
      })(this);
      ContentEdit.Root.get().bind('detach', this._handleDetach);
      ContentEdit.Root.get().bind('paste', this._handleClipboardPaste);
      ContentEdit.Root.get().bind('next-region', this._handleNextRegionTransition);
      ContentEdit.Root.get().bind('previous-region', this._handlePreviousRegionTransition);
      return this.syncRegions(queryOrDOMElements);
    };

    _EditorApp.prototype.destroy = function() {
      ContentEdit.Root.get().unbind('detach', this._handleDetach);
      ContentEdit.Root.get().unbind('paste', this._handleClipboardPaste);
      ContentEdit.Root.get().unbind('next-region', this._handleNextRegionTransition);
      ContentEdit.Root.get().unbind('previous-region', this._handlePreviousRegionTransition);
      this.removeEventListener();
      this.unmount();
      return this._children = [];
    };

    _EditorApp.prototype.highlightRegions = function(highlight) {
      var domRegion, _i, _len, _ref, _results;
      _ref = this._domRegions;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        domRegion = _ref[_i];
        if (highlight) {
          _results.push(ContentEdit.addCSSClass(domRegion, 'ct--highlight'));
        } else {
          _results.push(ContentEdit.removeCSSClass(domRegion, 'ct--highlight'));
        }
      }
      return _results;
    };

    _EditorApp.prototype.mount = function() {
      this._domElement = this.constructor.createDiv(['ct-app']);
      document.body.insertBefore(this._domElement, null);
      return this._addDOMEventListeners();
    };

    _EditorApp.prototype.paste = function(element, clipboardData) {
      var character, content, cursor, encodeHTML, i, insertAt, insertIn, insertNode, item, itemText, lastItem, line, lineLength, lines, replaced, selection, spawn, tags, tail, tip, type, _i, _len;
      content = clipboardData;
      lines = content.split('\n');
      lines = lines.filter(function(line) {
        return line.trim() !== '';
      });
      if (!lines) {
        return;
      }
      encodeHTML = HTMLString.String.encode;
      spawn = true;
      type = element.type();
      if (lines.length === 1) {
        spawn = false;
      }
      if (type === 'PreText') {
        spawn = false;
      }
      if (!element.can('spawn')) {
        spawn = false;
      }
      if (spawn) {
        if (type === 'ListItemText') {
          insertNode = element.parent();
          insertIn = element.parent().parent();
          insertAt = insertIn.children.indexOf(insertNode) + 1;
        } else {
          insertNode = element;
          if (insertNode.parent().type() !== 'Region') {
            insertNode = element.closest(function(node) {
              return node.parent().type() === 'Region';
            });
          }
          insertIn = insertNode.parent();
          insertAt = insertIn.children.indexOf(insertNode) + 1;
        }
        for (i = _i = 0, _len = lines.length; _i < _len; i = ++_i) {
          line = lines[i];
          line = encodeHTML(line);
          if (type === 'ListItemText') {
            item = new ContentEdit.ListItem();
            itemText = new ContentEdit.ListItemText(line);
            item.attach(itemText);
            lastItem = itemText;
          } else {
            item = new ContentEdit.Text('p', {}, line);
            lastItem = item;
          }
          insertIn.attach(item, insertAt + i);
        }
        lineLength = lastItem.content.length();
        lastItem.focus();
        return lastItem.selection(new ContentSelect.Range(lineLength, lineLength));
      } else {
        content = encodeHTML(content);
        content = new HTMLString.String(content, type === 'PreText');
        selection = element.selection();
        cursor = selection.get()[0] + content.length();
        tip = element.content.substring(0, selection.get()[0]);
        tail = element.content.substring(selection.get()[1]);
        replaced = element.content.substring(selection.get()[0], selection.get()[1]);
        if (replaced.length()) {
          character = replaced.characters[0];
          tags = character.tags();
          if (character.isTag()) {
            tags.shift();
          }
          if (tags.length >= 1) {
            content = content.format.apply(content, [0, content.length()].concat(__slice.call(tags)));
          }
        }
        element.content = tip.concat(content);
        element.content = element.content.concat(tail, false);
        element.updateInnerHTML();
        element.taint();
        selection.set(cursor, cursor);
        return element.selection(selection);
      }
    };

    _EditorApp.prototype.unmount = function() {
      var child, _i, _len, _ref;
      if (!this.isMounted()) {
        return;
      }
      _ref = this._children;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        child = _ref[_i];
        child.unmount();
      }
      this._domElement.parentNode.removeChild(this._domElement);
      this._domElement = null;
      this._removeDOMEventListeners();
      this._ignition = null;
      this._inspector = null;
      return this._toolbox = null;
    };

    _EditorApp.prototype.revert = function() {
      var confirmMessage;
      if (!this.dispatchEvent(this.createEvent('revert'))) {
        return;
      }
      if (ContentTools.CANCEL_MESSAGE) {
        confirmMessage = ContentEdit._(ContentTools.CANCEL_MESSAGE);
        if (ContentEdit.Root.get().lastModified() > this._rootLastModified && !window.confirm(confirmMessage)) {
          return false;
        }
      }
      this.revertToSnapshot(this.history.goTo(0), false);
      return true;
    };

    _EditorApp.prototype.revertToSnapshot = function(snapshot, restoreEditable) {
      var child, domRegions, name, region, wrapper, _i, _len, _ref, _ref1, _ref2;
      if (restoreEditable == null) {
        restoreEditable = true;
      }
      domRegions = [];
      _ref = this._regions;
      for (name in _ref) {
        region = _ref[name];
        _ref1 = region.children;
        for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
          child = _ref1[_i];
          child.unmount();
        }
        if (region.children.length === 1 && region.children[0].isFixed()) {
          wrapper = this.constructor.createDiv();
          wrapper.innerHTML = snapshot.regions[name];
          domRegions.push(wrapper.firstElementChild);
          region.domElement().parentNode.replaceChild(wrapper.firstElementChild, region.domElement());
        } else {
          domRegions.push(region.domElement());
          region.domElement().innerHTML = snapshot.regions[name];
        }
      }
      this._domRegions = domRegions;
      if (restoreEditable) {
        if (ContentEdit.Root.get().focused()) {
          ContentEdit.Root.get().focused().blur();
        }
        this._regions = {};
        this.syncRegions(null, true);
        ContentEdit.Root.get()._modified = snapshot.rootModified;
        _ref2 = this._regions;
        for (name in _ref2) {
          region = _ref2[name];
          if (snapshot.regionModifieds[name]) {
            region._modified = snapshot.regionModifieds[name];
          }
        }
        this.history.replaceRegions(this._regions);
        this.history.restoreSelection(snapshot);
        return this._inspector.updateTags();
      }
    };

    _EditorApp.prototype.save = function(passive) {
      var child, domRegions, html, modifiedRegions, name, region, root, wrapper, _i, _len, _ref, _ref1;
      if (!this.dispatchEvent(this.createEvent('save', {
        passive: passive
      }))) {
        return;
      }
      root = ContentEdit.Root.get();
      if (root.focused()) {
        root.focused().blur();
      }
      if (root.lastModified() === this._rootLastModified && passive) {
        this.dispatchEvent(this.createEvent('saved', {
          regions: {},
          passive: passive
        }));
        return;
      }
      domRegions = [];
      modifiedRegions = {};
      _ref = this._regions;
      for (name in _ref) {
        region = _ref[name];
        html = region.html();
        if (region.children.length === 1 && !region.type() === 'Fixture') {
          child = region.children[0];
          if (child.content && !child.content.html()) {
            html = '';
          }
        }
        if (!passive) {
          _ref1 = region.children;
          for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
            child = _ref1[_i];
            child.unmount();
          }
          if (region.children.length === 1 && region.children[0].isFixed()) {
            wrapper = this.constructor.createDiv();
            wrapper.innerHTML = html;
            domRegions.push(wrapper.firstElementChild);
            region.domElement().parentNode.replaceChild(wrapper.firstElementChild, region.domElement());
          } else {
            domRegions.push(region.domElement());
            region.domElement().innerHTML = html;
          }
        }
        if (region.lastModified() === this._regionsLastModified[name]) {
          continue;
        }
        modifiedRegions[name] = html;
        this._regionsLastModified[name] = region.lastModified();
      }
      this._domRegions = domRegions;
      return this.dispatchEvent(this.createEvent('saved', {
        regions: modifiedRegions,
        passive: passive
      }));
    };

    _EditorApp.prototype.setRegionOrder = function(regionNames) {
      return this._orderedRegions = regionNames.slice();
    };

    _EditorApp.prototype.start = function() {
      if (!this.dispatchEvent(this.createEvent('start'))) {
        return;
      }
      this.busy(true);
      this.syncRegions();
      this._initRegions();
      this._preventEmptyRegions();
      this._rootLastModified = ContentEdit.Root.get().lastModified();
      this.history = new ContentTools.History(this._regions);
      this.history.watch();
      this._state = 'editing';
      this._toolbox.show();
      this._inspector.show();
      this.busy(false);
      return this.dispatchEvent(this.createEvent('started'));
    };

    _EditorApp.prototype.stop = function(save) {
      var focused;
      if (!this.dispatchEvent(this.createEvent('stop', {
        save: save
      }))) {
        return;
      }
      focused = ContentEdit.Root.get().focused();
      if (focused && focused.isMounted() && focused._syncContent !== void 0) {
        focused._syncContent();
      }
      if (save) {
        this.save();
      } else {
        if (!this.revert()) {
          return;
        }
      }
      this.history.stopWatching();
      this.history = null;
      this._toolbox.hide();
      this._inspector.hide();
      this._regions = {};
      this._state = 'ready';
      if (ContentEdit.Root.get().focused()) {
        this._allowEmptyRegions((function(_this) {
          return function() {
            return ContentEdit.Root.get().focused().blur();
          };
        })(this));
      }
      return this.dispatchEvent(this.createEvent('stopped'));
    };

    _EditorApp.prototype.syncRegions = function(regionQuery, restoring) {
      if (regionQuery) {
        this._regionQuery = regionQuery;
      }
      this._domRegions = [];
      if (this._regionQuery) {
        if (typeof this._regionQuery === 'string' || this._regionQuery instanceof String) {
          this._domRegions = document.querySelectorAll(this._regionQuery);
        } else {
          this._domRegions = this._regionQuery;
        }
      }
      if (this._state === 'editing') {
        this._initRegions(restoring);
        this._preventEmptyRegions();
      }
      if (this._ignition) {
        if (this._domRegions.length) {
          return this._ignition.show();
        } else {
          return this._ignition.hide();
        }
      }
    };

    _EditorApp.prototype._addDOMEventListeners = function() {
      this._handleHighlightOn = (function(_this) {
        return function(ev) {
          var _ref;
          if ((_ref = ev.keyCode) === 17 || _ref === 224 || _ref === 91 || _ref === 93) {
            _this._ctrlDown = true;
          }
          if (ev.keyCode === 16 && !_this._ctrlDown) {
            if (_this._highlightTimeout) {
              return;
            }
            _this._shiftDown = true;
            _this._highlightTimeout = setTimeout(function() {
              return _this.highlightRegions(true);
            }, ContentTools.HIGHLIGHT_HOLD_DURATION);
            return;
          }
          clearTimeout(_this._highlightTimeout);
          return _this.highlightRegions(false);
        };
      })(this);
      this._handleHighlightOff = (function(_this) {
        return function(ev) {
          var _ref;
          if ((_ref = ev.keyCode) === 17 || _ref === 224) {
            _this._ctrlDown = false;
            return;
          }
          if (ev.keyCode === 16) {
            _this._shiftDown = false;
            if (_this._highlightTimeout) {
              clearTimeout(_this._highlightTimeout);
              _this._highlightTimeout = null;
            }
            return _this.highlightRegions(false);
          }
        };
      })(this);
      this._handleVisibility = (function(_this) {
        return function(ev) {
          if (!document.hasFocus()) {
            clearTimeout(_this._highlightTimeout);
            return _this.highlightRegions(false);
          }
        };
      })(this);
      document.addEventListener('keydown', this._handleHighlightOn);
      document.addEventListener('keyup', this._handleHighlightOff);
      document.addEventListener('visibilitychange', this._handleVisibility);
      this._handleBeforeUnload = (function(_this) {
        return function(ev) {
          var cancelMessage;
          if (_this._state === 'editing' && ContentTools.CANCEL_MESSAGE) {
            cancelMessage = ContentEdit._(ContentTools.CANCEL_MESSAGE);
            (ev || window.event).returnValue = cancelMessage;
            return cancelMessage;
          }
        };
      })(this);
      window.addEventListener('beforeunload', this._handleBeforeUnload);
      this._handleUnload = (function(_this) {
        return function(ev) {
          return _this.destroy();
        };
      })(this);
      return window.addEventListener('unload', this._handleUnload);
    };

    _EditorApp.prototype._allowEmptyRegions = function(callback) {
      this._emptyRegionsAllowed = true;
      callback();
      return this._emptyRegionsAllowed = false;
    };

    _EditorApp.prototype._preventEmptyRegions = function() {
      var child, hasEditableChildren, lastModified, name, placeholder, region, _i, _len, _ref, _ref1, _results;
      if (this._emptyRegionsAllowed) {
        return;
      }
      _ref = this._regions;
      _results = [];
      for (name in _ref) {
        region = _ref[name];
        lastModified = region.lastModified();
        hasEditableChildren = false;
        _ref1 = region.children;
        for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
          child = _ref1[_i];
          if (child.type() !== 'Static') {
            hasEditableChildren = true;
            break;
          }
        }
        if (hasEditableChildren) {
          continue;
        }
        placeholder = this.createPlaceholderElement(region);
        region.attach(placeholder);
        _results.push(region._modified = lastModified);
      }
      return _results;
    };

    _EditorApp.prototype._removeDOMEventListeners = function() {
      document.removeEventListener('keydown', this._handleHighlightOn);
      document.removeEventListener('keyup', this._handleHighlightOff);
      window.removeEventListener('beforeunload', this._handleBeforeUnload);
      return window.removeEventListener('unload', this._handleUnload);
    };

    _EditorApp.prototype._initRegions = function(restoring) {
      var domRegion, domRegions, found, i, index, name, region, _i, _len, _ref, _ref1, _results;
      if (restoring == null) {
        restoring = false;
      }
      found = {};
      domRegions = [];
      this._orderedRegions = [];
      _ref = this._domRegions;
      for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
        domRegion = _ref[i];
        name = domRegion.getAttribute(this._namingProp);
        if (!name) {
          name = i;
        }
        found[name] = true;
        this._orderedRegions.push(name);
        if (this._regions[name] && this._regions[name].domElement() === domRegion) {
          continue;
        }
        if (this._fixtureTest(domRegion)) {
          this._regions[name] = new ContentEdit.Fixture(domRegion);
        } else {
          this._regions[name] = new ContentEdit.Region(domRegion);
        }
        domRegions.push(this._regions[name].domElement());
        if (!restoring) {
          this._regionsLastModified[name] = this._regions[name].lastModified();
        }
      }
      this._domRegions = domRegions;
      _ref1 = this._regions;
      _results = [];
      for (name in _ref1) {
        region = _ref1[name];
        if (found[name]) {
          continue;
        }
        delete this._regions[name];
        delete this._regionsLastModified[name];
        index = this._orderedRegions.indexOf(name);
        if (index > -1) {
          _results.push(this._orderedRegions.splice(index, 1));
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    return _EditorApp;

  })(ContentTools.ComponentUI);

  ContentTools.EditorApp = (function() {
    var instance;

    function EditorApp() {}

    instance = null;

    EditorApp.get = function() {
      var cls;
      cls = ContentTools.EditorApp.getCls();
      return instance != null ? instance : instance = new cls();
    };

    EditorApp.getCls = function() {
      return _EditorApp;
    };

    return EditorApp;

  })();

  ContentTools.History = (function() {
    function History(regions) {
      this._lastSnapshotTaken = null;
      this._regions = {};
      this.replaceRegions(regions);
      this._snapshotIndex = -1;
      this._snapshots = [];
      this._store();
    }

    History.prototype.canRedo = function() {
      return this._snapshotIndex < this._snapshots.length - 1;
    };

    History.prototype.canUndo = function() {
      return this._snapshotIndex > 0;
    };

    History.prototype.index = function() {
      return this._snapshotIndex;
    };

    History.prototype.length = function() {
      return this._snapshots.length;
    };

    History.prototype.snapshot = function() {
      return this._snapshots[this._snapshotIndex];
    };

    History.prototype.goTo = function(index) {
      this._snapshotIndex = Math.min(this._snapshots.length - 1, Math.max(0, index));
      return this.snapshot();
    };

    History.prototype.redo = function() {
      return this.goTo(this._snapshotIndex + 1);
    };

    History.prototype.replaceRegions = function(regions) {
      var k, v, _results;
      this._regions = {};
      _results = [];
      for (k in regions) {
        v = regions[k];
        _results.push(this._regions[k] = v);
      }
      return _results;
    };

    History.prototype.restoreSelection = function(snapshot) {
      var element, region;
      if (!snapshot.selected) {
        return;
      }
      region = this._regions[snapshot.selected.region];
      element = region.descendants()[snapshot.selected.element];
      element.focus();
      if (element.selection && snapshot.selected.selection) {
        return element.selection(snapshot.selected.selection);
      }
    };

    History.prototype.stopWatching = function() {
      if (this._watchInterval) {
        clearInterval(this._watchInterval);
      }
      if (this._delayedStoreTimeout) {
        return clearTimeout(this._delayedStoreTimeout);
      }
    };

    History.prototype.undo = function() {
      return this.goTo(this._snapshotIndex - 1);
    };

    History.prototype.watch = function() {
      var watch;
      this._lastSnapshotTaken = Date.now();
      watch = (function(_this) {
        return function() {
          var delayedStore, lastModified;
          lastModified = ContentEdit.Root.get().lastModified();
          if (lastModified === null) {
            return;
          }
          if (lastModified > _this._lastSnapshotTaken) {
            if (_this._delayedStoreRequested === lastModified) {
              return;
            }
            if (_this._delayedStoreTimeout) {
              clearTimeout(_this._delayedStoreTimeout);
            }
            delayedStore = function() {
              _this._lastSnapshotTaken = lastModified;
              return _this._store();
            };
            _this._delayedStoreRequested = lastModified;
            return _this._delayedStoreTimeout = setTimeout(delayedStore, 500);
          }
        };
      })(this);
      return this._watchInterval = setInterval(watch, 50);
    };

    History.prototype._store = function() {
      var element, name, other_region, region, snapshot, _ref, _ref1;
      snapshot = {
        regions: {},
        regionModifieds: {},
        rootModified: ContentEdit.Root.get().lastModified(),
        selected: null
      };
      _ref = this._regions;
      for (name in _ref) {
        region = _ref[name];
        snapshot.regions[name] = region.html();
        snapshot.regionModifieds[name] = region.lastModified();
      }
      element = ContentEdit.Root.get().focused();
      if (element) {
        snapshot.selected = {};
        region = element.closest(function(node) {
          return node.type() === 'Region' || node.type() === 'Fixture';
        });
        if (!region) {
          return;
        }
        _ref1 = this._regions;
        for (name in _ref1) {
          other_region = _ref1[name];
          if (region === other_region) {
            snapshot.selected.region = name;
            break;
          }
        }
        snapshot.selected.element = region.descendants().indexOf(element);
        if (element.selection) {
          snapshot.selected.selection = element.selection();
        }
      }
      if (this._snapshotIndex < (this._snapshots.length - 1)) {
        this._snapshots = this._snapshots.slice(0, this._snapshotIndex + 1);
      }
      this._snapshotIndex++;
      return this._snapshots.splice(this._snapshotIndex, 0, snapshot);
    };

    return History;

  })();

  ContentTools.StylePalette = (function() {
    function StylePalette() {}

    StylePalette._styles = [];

    StylePalette.add = function(styles) {
      return this._styles = this._styles.concat(styles);
    };

    StylePalette.styles = function(element) {
      var tagName;
      if (element === void 0) {
        return this._styles.slice();
      }
      tagName = element.tagName();
      return this._styles.filter(function(style) {
        if (!style._applicableTo) {
          return true;
        }
        return style._applicableTo.indexOf(tagName) !== -1;
      });
    };

    return StylePalette;

  })();

  ContentTools.Style = (function() {
    function Style(name, cssClass, applicableTo) {
      this._name = name;
      this._cssClass = cssClass;
      if (applicableTo) {
        this._applicableTo = applicableTo;
      } else {
        this._applicableTo = null;
      }
    }

    Style.prototype.applicableTo = function() {
      return this._applicableTo;
    };

    Style.prototype.cssClass = function() {
      return this._cssClass;
    };

    Style.prototype.name = function() {
      return this._name;
    };

    return Style;

  })();

  ContentTools.ToolShelf = (function() {
    function ToolShelf() {}

    ToolShelf._tools = {};

    ToolShelf.stow = function(cls, name) {
      return this._tools[name] = cls;
    };

    ToolShelf.fetch = function(name) {
      if (!this._tools[name]) {
        throw new Error("`" + name + "` has not been stowed on the tool shelf");
      }
      return this._tools[name];
    };

    return ToolShelf;

  })();

  ContentTools.Tool = (function() {
    function Tool() {}

    Tool.label = 'Tool';

    Tool.icon = 'tool';

    Tool.requiresElement = true;

    Tool.canApply = function(element, selection) {
      return false;
    };

    Tool.isApplied = function(element, selection) {
      return false;
    };

    Tool.apply = function(element, selection, callback) {
      throw new Error('Not implemented');
    };

    Tool.editor = function() {
      return ContentTools.EditorApp.get();
    };

    Tool.dispatchEditorEvent = function(name, detail) {
      return this.editor().dispatchEvent(this.editor().createEvent(name, detail));
    };

    Tool._insertAt = function(element) {
      var insertIndex, insertNode;
      insertNode = element;
      if (insertNode.parent().type() !== 'Region') {
        insertNode = element.closest(function(node) {
          return node.parent().type() === 'Region';
        });
      }
      insertIndex = insertNode.parent().children.indexOf(insertNode) + 1;
      return [insertNode, insertIndex];
    };

    return Tool;

  })();

  ContentTools.Tools.Bold = (function(_super) {
    __extends(Bold, _super);

    function Bold() {
      return Bold.__super__.constructor.apply(this, arguments);
    }

    ContentTools.ToolShelf.stow(Bold, 'bold');

    Bold.label = 'Bold';

    Bold.icon = 'bold';

    Bold.tagName = 'b';

    Bold.canApply = function(element, selection) {
      if (!element.content) {
        return false;
      }
      return selection && !selection.isCollapsed();
    };

    Bold.isApplied = function(element, selection) {
      var from, to, _ref;
      if (element.content === void 0 || !element.content.length()) {
        return false;
      }
      _ref = selection.get(), from = _ref[0], to = _ref[1];
      if (from === to) {
        to += 1;
      }
      return element.content.slice(from, to).hasTags(this.tagName, true);
    };

    Bold.apply = function(element, selection, callback) {
      var from, to, toolDetail, _ref;
      toolDetail = {
        'tool': this,
        'element': element,
        'selection': selection
      };
      if (!this.dispatchEditorEvent('tool-apply', toolDetail)) {
        return;
      }
      element.storeState();
      _ref = selection.get(), from = _ref[0], to = _ref[1];
      if (this.isApplied(element, selection)) {
        element.content = element.content.unformat(from, to, new HTMLString.Tag(this.tagName));
      } else {
        element.content = element.content.format(from, to, new HTMLString.Tag(this.tagName));
      }
      element.content.optimize();
      element.updateInnerHTML();
      element.taint();
      element.restoreState();
      callback(true);
      return this.dispatchEditorEvent('tool-applied', toolDetail);
    };

    return Bold;

  })(ContentTools.Tool);

  ContentTools.Tools.Italic = (function(_super) {
    __extends(Italic, _super);

    function Italic() {
      return Italic.__super__.constructor.apply(this, arguments);
    }

    ContentTools.ToolShelf.stow(Italic, 'italic');

    Italic.label = 'Italic';

    Italic.icon = 'italic';

    Italic.tagName = 'i';

    return Italic;

  })(ContentTools.Tools.Bold);

  ContentTools.Tools.Link = (function(_super) {
    __extends(Link, _super);

    function Link() {
      return Link.__super__.constructor.apply(this, arguments);
    }

    ContentTools.ToolShelf.stow(Link, 'link');

    Link.label = 'Link';

    Link.icon = 'link';

    Link.tagName = 'a';

    Link.getAttr = function(attrName, element, selection) {
      var c, from, selectedContent, tag, to, _i, _j, _len, _len1, _ref, _ref1, _ref2;
      if (element.type() === 'Image') {
        if (element.a) {
          return element.a[attrName];
        }
      } else if (element.isFixed() && element.tagName() === 'a') {
        return element.attr(attrName);
      } else {
        _ref = selection.get(), from = _ref[0], to = _ref[1];
        selectedContent = element.content.slice(from, to);
        _ref1 = selectedContent.characters;
        for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
          c = _ref1[_i];
          if (!c.hasTags('a')) {
            continue;
          }
          _ref2 = c.tags();
          for (_j = 0, _len1 = _ref2.length; _j < _len1; _j++) {
            tag = _ref2[_j];
            if (tag.name() === 'a') {
              return tag.attr(attrName);
            }
          }
        }
      }
      return '';
    };

    Link.canApply = function(element, selection) {
      var character;
      if (element.type() === 'Image') {
        return true;
      } else if (element.isFixed() && element.tagName() === 'a') {
        return true;
      } else {
        if (!element.content) {
          return false;
        }
        if (!selection) {
          return false;
        }
        if (selection.isCollapsed()) {
          character = element.content.characters[selection.get()[0]];
          if (!character || !character.hasTags('a')) {
            return false;
          }
        }
        return true;
      }
    };

    Link.isApplied = function(element, selection) {
      if (element.type() === 'Image') {
        return element.a;
      } else if (element.isFixed() && element.tagName() === 'a') {
        return true;
      } else {
        return Link.__super__.constructor.isApplied.call(this, element, selection);
      }
    };

    Link.apply = function(element, selection, callback) {
      var allowScrolling, app, applied, characters, dialog, domElement, ends, from, measureSpan, modal, rect, scrollX, scrollY, selectTag, starts, to, toolDetail, transparent, _ref, _ref1;
      toolDetail = {
        'tool': this,
        'element': element,
        'selection': selection
      };
      if (!this.dispatchEditorEvent('tool-apply', toolDetail)) {
        return;
      }
      applied = false;
      if (element.type() === 'Image') {
        rect = element.domElement().getBoundingClientRect();
      } else if (element.isFixed() && element.tagName() === 'a') {
        rect = element.domElement().getBoundingClientRect();
      } else {
        if (selection.isCollapsed()) {
          characters = element.content.characters;
          starts = selection.get(0)[0];
          ends = starts;
          while (starts > 0 && characters[starts - 1].hasTags('a')) {
            starts -= 1;
          }
          while (ends < characters.length && characters[ends].hasTags('a')) {
            ends += 1;
          }
          selection = new ContentSelect.Range(starts, ends);
          selection.select(element.domElement());
        }
        element.storeState();
        selectTag = new HTMLString.Tag('span', {
          'class': 'ct--puesdo-select'
        });
        _ref = selection.get(), from = _ref[0], to = _ref[1];
        element.content = element.content.format(from, to, selectTag);
        element.updateInnerHTML();
        domElement = element.domElement();
        measureSpan = domElement.getElementsByClassName('ct--puesdo-select');
        rect = measureSpan[0].getBoundingClientRect();
      }
      app = ContentTools.EditorApp.get();
      modal = new ContentTools.ModalUI(transparent = true, allowScrolling = true);
      modal.addEventListener('click', function() {
        this.unmount();
        dialog.hide();
        if (element.content) {
          element.content = element.content.unformat(from, to, selectTag);
          element.updateInnerHTML();
          element.restoreState();
        }
        callback(applied);
        if (applied) {
          return ContentTools.Tools.Link.dispatchEditorEvent('tool-applied', toolDetail);
        }
      });
      dialog = new ContentTools.LinkDialog(this.getAttr('href', element, selection), this.getAttr('target', element, selection));
      _ref1 = ContentTools.getScrollPosition(), scrollX = _ref1[0], scrollY = _ref1[1];
      dialog.position([rect.left + (rect.width / 2) + scrollX, rect.top + (rect.height / 2) + scrollY]);
      dialog.addEventListener('save', function(ev) {
        var a, alignmentClassNames, className, detail, linkClasses, _i, _j, _len, _len1;
        detail = ev.detail();
        applied = true;
        if (element.type() === 'Image') {
          alignmentClassNames = ['align-center', 'align-left', 'align-right'];
          if (detail.href) {
            element.a = {
              href: detail.href
            };
            if (element.a) {
              element.a["class"] = element.a['class'];
            }
            if (detail.target) {
              element.a.target = detail.target;
            }
            for (_i = 0, _len = alignmentClassNames.length; _i < _len; _i++) {
              className = alignmentClassNames[_i];
              if (element.hasCSSClass(className)) {
                element.removeCSSClass(className);
                element.a['class'] = className;
                break;
              }
            }
          } else {
            linkClasses = [];
            if (element.a['class']) {
              linkClasses = element.a['class'].split(' ');
            }
            for (_j = 0, _len1 = alignmentClassNames.length; _j < _len1; _j++) {
              className = alignmentClassNames[_j];
              if (linkClasses.indexOf(className) > -1) {
                element.addCSSClass(className);
                break;
              }
            }
            element.a = null;
          }
          element.unmount();
          element.mount();
        } else if (element.isFixed() && element.tagName() === 'a') {
          element.attr('href', detail.href);
        } else {
          element.content = element.content.unformat(from, to, 'a');
          if (detail.href) {
            a = new HTMLString.Tag('a', detail);
            element.content = element.content.format(from, to, a);
            element.content.optimize();
          }
          element.updateInnerHTML();
        }
        element.taint();
        return modal.dispatchEvent(modal.createEvent('click'));
      });
      app.attach(modal);
      app.attach(dialog);
      modal.show();
      return dialog.show();
    };

    return Link;

  })(ContentTools.Tools.Bold);

  ContentTools.Tools.Heading = (function(_super) {
    __extends(Heading, _super);

    function Heading() {
      return Heading.__super__.constructor.apply(this, arguments);
    }

    ContentTools.ToolShelf.stow(Heading, 'heading');

    Heading.label = 'Heading';

    Heading.icon = 'heading';

    Heading.tagName = 'h1';

    Heading.canApply = function(element, selection) {
      if (element.isFixed()) {
        return false;
      }
      return element.content !== void 0 && ['Text', 'PreText'].indexOf(element.type()) !== -1;
    };

    Heading.isApplied = function(element, selection) {
      if (!element.content) {
        return false;
      }
      if (['Text', 'PreText'].indexOf(element.type()) === -1) {
        return false;
      }
      return element.tagName() === this.tagName;
    };

    Heading.apply = function(element, selection, callback) {
      var content, insertAt, parent, textElement, toolDetail;
      toolDetail = {
        'tool': this,
        'element': element,
        'selection': selection
      };
      if (!this.dispatchEditorEvent('tool-apply', toolDetail)) {
        return;
      }
      element.storeState();
      if (element.type() === 'PreText') {
        content = element.content.html().replace(/&nbsp;/g, ' ');
        textElement = new ContentEdit.Text(this.tagName, {}, content);
        parent = element.parent();
        insertAt = parent.children.indexOf(element);
        parent.detach(element);
        parent.attach(textElement, insertAt);
        element.blur();
        textElement.focus();
        textElement.selection(selection);
      } else {
        element.removeAttr('class');
        if (element.tagName() === this.tagName) {
          element.tagName('p');
        } else {
          element.tagName(this.tagName);
        }
        element.restoreState();
      }
      this.dispatchEditorEvent('tool-applied', toolDetail);
      return callback(true);
    };

    return Heading;

  })(ContentTools.Tool);

  ContentTools.Tools.Subheading = (function(_super) {
    __extends(Subheading, _super);

    function Subheading() {
      return Subheading.__super__.constructor.apply(this, arguments);
    }

    ContentTools.ToolShelf.stow(Subheading, 'subheading');

    Subheading.label = 'Subheading';

    Subheading.icon = 'subheading';

    Subheading.tagName = 'h2';

    return Subheading;

  })(ContentTools.Tools.Heading);

  ContentTools.Tools.Paragraph = (function(_super) {
    __extends(Paragraph, _super);

    function Paragraph() {
      return Paragraph.__super__.constructor.apply(this, arguments);
    }

    ContentTools.ToolShelf.stow(Paragraph, 'paragraph');

    Paragraph.label = 'Paragraph';

    Paragraph.icon = 'paragraph';

    Paragraph.tagName = 'p';

    Paragraph.canApply = function(element, selection) {
      if (element.isFixed()) {
        return false;
      }
      return element !== void 0;
    };

    Paragraph.apply = function(element, selection, callback) {
      var forceAdd, paragraph, region, toolDetail;
      forceAdd = this.editor().ctrlDown();
      if (ContentTools.Tools.Heading.canApply(element) && !forceAdd) {
        return Paragraph.__super__.constructor.apply.call(this, element, selection, callback);
      } else {
        toolDetail = {
          'tool': this,
          'element': element,
          'selection': selection
        };
        if (!this.dispatchEditorEvent('tool-apply', toolDetail)) {
          return;
        }
        if (element.parent().type() !== 'Region') {
          element = element.closest(function(node) {
            return node.parent().type() === 'Region';
          });
        }
        region = element.parent();
        paragraph = new ContentEdit.Text('p');
        region.attach(paragraph, region.children.indexOf(element) + 1);
        paragraph.focus();
        callback(true);
        return this.dispatchEditorEvent('tool-applied', toolDetail);
      }
    };

    return Paragraph;

  })(ContentTools.Tools.Heading);

  ContentTools.Tools.Preformatted = (function(_super) {
    __extends(Preformatted, _super);

    function Preformatted() {
      return Preformatted.__super__.constructor.apply(this, arguments);
    }

    ContentTools.ToolShelf.stow(Preformatted, 'preformatted');

    Preformatted.label = 'Preformatted';

    Preformatted.icon = 'preformatted';

    Preformatted.tagName = 'pre';

    Preformatted.apply = function(element, selection, callback) {
      var insertAt, parent, preText, text, toolDetail;
      toolDetail = {
        'tool': this,
        'element': element,
        'selection': selection
      };
      if (!this.dispatchEditorEvent('tool-apply', toolDetail)) {
        return;
      }
      if (element.type() === 'PreText') {
        ContentTools.Tools.Paragraph.apply(element, selection, callback);
        return;
      }
      text = element.content.text();
      preText = new ContentEdit.PreText('pre', {}, HTMLString.String.encode(text));
      parent = element.parent();
      insertAt = parent.children.indexOf(element);
      parent.detach(element);
      parent.attach(preText, insertAt);
      element.blur();
      preText.focus();
      preText.selection(selection);
      callback(true);
      return this.dispatchEditorEvent('tool-applied', toolDetail);
    };

    return Preformatted;

  })(ContentTools.Tools.Heading);

  ContentTools.Tools.AlignLeft = (function(_super) {
    __extends(AlignLeft, _super);

    function AlignLeft() {
      return AlignLeft.__super__.constructor.apply(this, arguments);
    }

    ContentTools.ToolShelf.stow(AlignLeft, 'align-left');

    AlignLeft.label = 'Align left';

    AlignLeft.icon = 'align-left';

    AlignLeft.className = 'text-left';

    AlignLeft.canApply = function(element, selection) {
      return element.content !== void 0;
    };

    AlignLeft.isApplied = function(element, selection) {
      var _ref;
      if (!this.canApply(element)) {
        return false;
      }
      if ((_ref = element.type()) === 'ListItemText' || _ref === 'TableCellText') {
        element = element.parent();
      }
      return element.hasCSSClass(this.className);
    };

    AlignLeft.apply = function(element, selection, callback) {
      var alignmentClassNames, className, toolDetail, _i, _len, _ref;
      toolDetail = {
        'tool': this,
        'element': element,
        'selection': selection
      };
      if (!this.dispatchEditorEvent('tool-apply', toolDetail)) {
        return;
      }
      if ((_ref = element.type()) === 'ListItemText' || _ref === 'TableCellText') {
        element = element.parent();
      }
      alignmentClassNames = [ContentTools.Tools.AlignLeft.className, ContentTools.Tools.AlignCenter.className, ContentTools.Tools.AlignRight.className];
      for (_i = 0, _len = alignmentClassNames.length; _i < _len; _i++) {
        className = alignmentClassNames[_i];
        if (element.hasCSSClass(className)) {
          element.removeCSSClass(className);
          if (className === this.className) {
            return callback(true);
          }
        }
      }
      element.addCSSClass(this.className);
      callback(true);
      return this.dispatchEditorEvent('tool-applied', toolDetail);
    };

    return AlignLeft;

  })(ContentTools.Tool);

  ContentTools.Tools.AlignCenter = (function(_super) {
    __extends(AlignCenter, _super);

    function AlignCenter() {
      return AlignCenter.__super__.constructor.apply(this, arguments);
    }

    ContentTools.ToolShelf.stow(AlignCenter, 'align-center');

    AlignCenter.label = 'Align center';

    AlignCenter.icon = 'align-center';

    AlignCenter.className = 'text-center';

    return AlignCenter;

  })(ContentTools.Tools.AlignLeft);

  ContentTools.Tools.AlignRight = (function(_super) {
    __extends(AlignRight, _super);

    function AlignRight() {
      return AlignRight.__super__.constructor.apply(this, arguments);
    }

    ContentTools.ToolShelf.stow(AlignRight, 'align-right');

    AlignRight.label = 'Align right';

    AlignRight.icon = 'align-right';

    AlignRight.className = 'text-right';

    return AlignRight;

  })(ContentTools.Tools.AlignLeft);

  ContentTools.Tools.UnorderedList = (function(_super) {
    __extends(UnorderedList, _super);

    function UnorderedList() {
      return UnorderedList.__super__.constructor.apply(this, arguments);
    }

    ContentTools.ToolShelf.stow(UnorderedList, 'unordered-list');

    UnorderedList.label = 'Bullet list';

    UnorderedList.icon = 'unordered-list';

    UnorderedList.listTag = 'ul';

    UnorderedList.canApply = function(element, selection) {
      var _ref;
      if (element.isFixed()) {
        return false;
      }
      return element.content !== void 0 && ((_ref = element.parent().type()) === 'Region' || _ref === 'ListItem');
    };

    UnorderedList.apply = function(element, selection, callback) {
      var insertAt, list, listItem, listItemText, parent, toolDetail;
      toolDetail = {
        'tool': this,
        'element': element,
        'selection': selection
      };
      if (!this.dispatchEditorEvent('tool-apply', toolDetail)) {
        return;
      }
      if (element.parent().type() === 'ListItem') {
        element.storeState();
        list = element.closest(function(node) {
          return node.type() === 'List';
        });
        list.tagName(this.listTag);
        element.restoreState();
      } else {
        listItemText = new ContentEdit.ListItemText(element.content.copy());
        listItem = new ContentEdit.ListItem();
        listItem.attach(listItemText);
        list = new ContentEdit.List(this.listTag, {});
        list.attach(listItem);
        parent = element.parent();
        insertAt = parent.children.indexOf(element);
        parent.detach(element);
        parent.attach(list, insertAt);
        listItemText.focus();
        listItemText.selection(selection);
      }
      callback(true);
      return this.dispatchEditorEvent('tool-applied', toolDetail);
    };

    return UnorderedList;

  })(ContentTools.Tool);

  ContentTools.Tools.OrderedList = (function(_super) {
    __extends(OrderedList, _super);

    function OrderedList() {
      return OrderedList.__super__.constructor.apply(this, arguments);
    }

    ContentTools.ToolShelf.stow(OrderedList, 'ordered-list');

    OrderedList.label = 'Numbers list';

    OrderedList.icon = 'ordered-list';

    OrderedList.listTag = 'ol';

    return OrderedList;

  })(ContentTools.Tools.UnorderedList);

  ContentTools.Tools.Table = (function(_super) {
    __extends(Table, _super);

    function Table() {
      return Table.__super__.constructor.apply(this, arguments);
    }

    ContentTools.ToolShelf.stow(Table, 'table');

    Table.label = 'Table';

    Table.icon = 'table';

    Table.canApply = function(element, selection) {
      if (element.isFixed()) {
        return false;
      }
      return element !== void 0;
    };

    Table.apply = function(element, selection, callback) {
      var app, dialog, modal, table, toolDetail;
      toolDetail = {
        'tool': this,
        'element': element,
        'selection': selection
      };
      if (!this.dispatchEditorEvent('tool-apply', toolDetail)) {
        return;
      }
      if (element.storeState) {
        element.storeState();
      }
      app = ContentTools.EditorApp.get();
      modal = new ContentTools.ModalUI();
      table = element.closest(function(node) {
        return node && node.type() === 'Table';
      });
      dialog = new ContentTools.TableDialog(table);
      dialog.addEventListener('cancel', (function(_this) {
        return function() {
          modal.hide();
          dialog.hide();
          if (element.restoreState) {
            element.restoreState();
          }
          return callback(false);
        };
      })(this));
      dialog.addEventListener('save', (function(_this) {
        return function(ev) {
          var index, keepFocus, node, tableCfg, _ref;
          tableCfg = ev.detail();
          keepFocus = true;
          if (table) {
            _this._updateTable(tableCfg, table);
            keepFocus = element.closest(function(node) {
              return node && node.type() === 'Table';
            });
          } else {
            table = _this._createTable(tableCfg);
            _ref = _this._insertAt(element), node = _ref[0], index = _ref[1];
            node.parent().attach(table, index);
            keepFocus = false;
          }
          if (keepFocus) {
            element.restoreState();
          } else {
            table.firstSection().children[0].children[0].children[0].focus();
          }
          modal.hide();
          dialog.hide();
          callback(true);
          return _this.dispatchEditorEvent('tool-applied', toolDetail);
        };
      })(this));
      app.attach(modal);
      app.attach(dialog);
      modal.show();
      return dialog.show();
    };

    Table._adjustColumns = function(section, columns) {
      var cell, cellTag, cellText, currentColumns, diff, i, row, _i, _len, _ref, _results;
      _ref = section.children;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        row = _ref[_i];
        cellTag = row.children[0].tagName();
        currentColumns = row.children.length;
        diff = columns - currentColumns;
        if (diff < 0) {
          _results.push((function() {
            var _j, _results1;
            _results1 = [];
            for (i = _j = diff; diff <= 0 ? _j < 0 : _j > 0; i = diff <= 0 ? ++_j : --_j) {
              cell = row.children[row.children.length - 1];
              _results1.push(row.detach(cell));
            }
            return _results1;
          })());
        } else if (diff > 0) {
          _results.push((function() {
            var _j, _results1;
            _results1 = [];
            for (i = _j = 0; 0 <= diff ? _j < diff : _j > diff; i = 0 <= diff ? ++_j : --_j) {
              cell = new ContentEdit.TableCell(cellTag);
              row.attach(cell);
              cellText = new ContentEdit.TableCellText('');
              _results1.push(cell.attach(cellText));
            }
            return _results1;
          })());
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    Table._createTable = function(tableCfg) {
      var body, foot, head, table;
      table = new ContentEdit.Table();
      if (tableCfg.head) {
        head = this._createTableSection('thead', 'th', tableCfg.columns);
        table.attach(head);
      }
      body = this._createTableSection('tbody', 'td', tableCfg.columns);
      table.attach(body);
      if (tableCfg.foot) {
        foot = this._createTableSection('tfoot', 'td', tableCfg.columns);
        table.attach(foot);
      }
      return table;
    };

    Table._createTableSection = function(sectionTag, cellTag, columns) {
      var cell, cellText, i, row, section, _i;
      section = new ContentEdit.TableSection(sectionTag);
      row = new ContentEdit.TableRow();
      section.attach(row);
      for (i = _i = 0; 0 <= columns ? _i < columns : _i > columns; i = 0 <= columns ? ++_i : --_i) {
        cell = new ContentEdit.TableCell(cellTag);
        row.attach(cell);
        cellText = new ContentEdit.TableCellText('');
        cell.attach(cellText);
      }
      return section;
    };

    Table._updateTable = function(tableCfg, table) {
      var columns, foot, head, section, _i, _len, _ref;
      if (!tableCfg.head && table.thead()) {
        table.detach(table.thead());
      }
      if (!tableCfg.foot && table.tfoot()) {
        table.detach(table.tfoot());
      }
      columns = table.firstSection().children[0].children.length;
      if (tableCfg.columns !== columns) {
        _ref = table.children;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          section = _ref[_i];
          this._adjustColumns(section, tableCfg.columns);
        }
      }
      if (tableCfg.head && !table.thead()) {
        head = this._createTableSection('thead', 'th', tableCfg.columns);
        table.attach(head);
      }
      if (tableCfg.foot && !table.tfoot()) {
        foot = this._createTableSection('tfoot', 'td', tableCfg.columns);
        return table.attach(foot);
      }
    };

    return Table;

  })(ContentTools.Tool);

  ContentTools.Tools.Indent = (function(_super) {
    __extends(Indent, _super);

    function Indent() {
      return Indent.__super__.constructor.apply(this, arguments);
    }

    ContentTools.ToolShelf.stow(Indent, 'indent');

    Indent.label = 'Indent';

    Indent.icon = 'indent';

    Indent.canApply = function(element, selection) {
      return element.parent().type() === 'ListItem' && element.parent().parent().children.indexOf(element.parent()) > 0;
    };

    Indent.apply = function(element, selection, callback) {
      var toolDetail;
      toolDetail = {
        'tool': this,
        'element': element,
        'selection': selection
      };
      if (!this.dispatchEditorEvent('tool-apply', toolDetail)) {
        return;
      }
      element.parent().indent();
      callback(true);
      return this.dispatchEditorEvent('tool-applied', toolDetail);
    };

    return Indent;

  })(ContentTools.Tool);

  ContentTools.Tools.Unindent = (function(_super) {
    __extends(Unindent, _super);

    function Unindent() {
      return Unindent.__super__.constructor.apply(this, arguments);
    }

    ContentTools.ToolShelf.stow(Unindent, 'unindent');

    Unindent.label = 'Unindent';

    Unindent.icon = 'unindent';

    Unindent.canApply = function(element, selection) {
      return element.parent().type() === 'ListItem';
    };

    Unindent.apply = function(element, selection, callback) {
      var toolDetail;
      toolDetail = {
        'tool': this,
        'element': element,
        'selection': selection
      };
      if (!this.dispatchEditorEvent('tool-apply', toolDetail)) {
        return;
      }
      element.parent().unindent();
      callback(true);
      return this.dispatchEditorEvent('tool-applied', toolDetail);
    };

    return Unindent;

  })(ContentTools.Tool);

  ContentTools.Tools.LineBreak = (function(_super) {
    __extends(LineBreak, _super);

    function LineBreak() {
      return LineBreak.__super__.constructor.apply(this, arguments);
    }

    ContentTools.ToolShelf.stow(LineBreak, 'line-break');

    LineBreak.label = 'Line break';

    LineBreak.icon = 'line-break';

    LineBreak.canApply = function(element, selection) {
      return element.content;
    };

    LineBreak.apply = function(element, selection, callback) {
      var br, cursor, tail, tip, toolDetail;
      toolDetail = {
        'tool': this,
        'element': element,
        'selection': selection
      };
      if (!this.dispatchEditorEvent('tool-apply', toolDetail)) {
        return;
      }
      cursor = selection.get()[0] + 1;
      tip = element.content.substring(0, selection.get()[0]);
      tail = element.content.substring(selection.get()[1]);
      br = new HTMLString.String('<br>', element.content.preserveWhitespace());
      element.content = tip.concat(br, tail);
      element.updateInnerHTML();
      element.taint();
      selection.set(cursor, cursor);
      element.selection(selection);
      callback(true);
      return this.dispatchEditorEvent('tool-applied', toolDetail);
    };

    return LineBreak;

  })(ContentTools.Tool);

  ContentTools.Tools.Image = (function(_super) {
    __extends(Image, _super);

    function Image() {
      return Image.__super__.constructor.apply(this, arguments);
    }

    ContentTools.ToolShelf.stow(Image, 'image');

    Image.label = 'Image';

    Image.icon = 'image';

    Image.canApply = function(element, selection) {
      if (element.isFixed()) {
        if (element.type() !== 'ImageFixture') {
          return false;
        }
      }
      return true;
    };

    Image.apply = function(element, selection, callback) {
      var app, dialog, modal, toolDetail;
      toolDetail = {
        'tool': this,
        'element': element,
        'selection': selection
      };
      if (!this.dispatchEditorEvent('tool-apply', toolDetail)) {
        return;
      }
      if (element.storeState) {
        element.storeState();
      }
      app = ContentTools.EditorApp.get();
      modal = new ContentTools.ModalUI();
      dialog = new ContentTools.ImageDialog();
      dialog.addEventListener('cancel', (function(_this) {
        return function() {
          modal.hide();
          dialog.hide();
          if (element.restoreState) {
            element.restoreState();
          }
          return callback(false);
        };
      })(this));
      dialog.addEventListener('save', (function(_this) {
        return function(ev) {
          var detail, image, imageAttrs, imageSize, imageURL, index, node, _ref;
          detail = ev.detail();
          imageURL = detail.imageURL;
          imageSize = detail.imageSize;
          imageAttrs = detail.imageAttrs;
          if (!imageAttrs) {
            imageAttrs = {};
          }
          imageAttrs.height = imageSize[1];
          imageAttrs.src = imageURL;
          imageAttrs.width = imageSize[0];
          if (element.type() === 'ImageFixture') {
            element.src(imageURL);
          } else {
            image = new ContentEdit.Image(imageAttrs);
            _ref = _this._insertAt(element), node = _ref[0], index = _ref[1];
            node.parent().attach(image, index);
            image.focus();
          }
          modal.hide();
          dialog.hide();
          callback(true);
          return _this.dispatchEditorEvent('tool-applied', toolDetail);
        };
      })(this));
      app.attach(modal);
      app.attach(dialog);
      modal.show();
      return dialog.show();
    };

    return Image;

  })(ContentTools.Tool);

  ContentTools.Tools.Video = (function(_super) {
    __extends(Video, _super);

    function Video() {
      return Video.__super__.constructor.apply(this, arguments);
    }

    ContentTools.ToolShelf.stow(Video, 'video');

    Video.label = 'Video';

    Video.icon = 'video';

    Video.canApply = function(element, selection) {
      return !element.isFixed();
    };

    Video.apply = function(element, selection, callback) {
      var app, dialog, modal, toolDetail;
      toolDetail = {
        'tool': this,
        'element': element,
        'selection': selection
      };
      if (!this.dispatchEditorEvent('tool-apply', toolDetail)) {
        return;
      }
      if (element.storeState) {
        element.storeState();
      }
      app = ContentTools.EditorApp.get();
      modal = new ContentTools.ModalUI();
      dialog = new ContentTools.VideoDialog();
      dialog.addEventListener('cancel', (function(_this) {
        return function() {
          modal.hide();
          dialog.hide();
          if (element.restoreState) {
            element.restoreState();
          }
          return callback(false);
        };
      })(this));
      dialog.addEventListener('save', (function(_this) {
        return function(ev) {
          var applied, index, node, url, video, _ref;
          url = ev.detail().url;
          if (url) {
            video = new ContentEdit.Video('iframe', {
              'frameborder': 0,
              'height': ContentTools.DEFAULT_VIDEO_HEIGHT,
              'src': url,
              'width': ContentTools.DEFAULT_VIDEO_WIDTH
            });
            _ref = _this._insertAt(element), node = _ref[0], index = _ref[1];
            node.parent().attach(video, index);
            video.focus();
          } else {
            if (element.restoreState) {
              element.restoreState();
            }
          }
          modal.hide();
          dialog.hide();
          applied = url !== '';
          callback(applied);
          if (applied) {
            return _this.dispatchEditorEvent('tool-applied', toolDetail);
          }
        };
      })(this));
      app.attach(modal);
      app.attach(dialog);
      modal.show();
      return dialog.show();
    };

    return Video;

  })(ContentTools.Tool);

  ContentTools.Tools.Undo = (function(_super) {
    __extends(Undo, _super);

    function Undo() {
      return Undo.__super__.constructor.apply(this, arguments);
    }

    ContentTools.ToolShelf.stow(Undo, 'undo');

    Undo.label = 'Undo';

    Undo.icon = 'undo';

    Undo.requiresElement = false;

    Undo.canApply = function(element, selection) {
      var app;
      app = ContentTools.EditorApp.get();
      return app.history && app.history.canUndo();
    };

    Undo.apply = function(element, selection, callback) {
      var app, snapshot, toolDetail;
      toolDetail = {
        'tool': this,
        'element': element,
        'selection': selection
      };
      if (!this.dispatchEditorEvent('tool-apply', toolDetail)) {
        return;
      }
      app = this.editor();
      app.history.stopWatching();
      snapshot = app.history.undo();
      app.revertToSnapshot(snapshot);
      app.history.watch();
      return this.dispatchEditorEvent('tool-applied', toolDetail);
    };

    return Undo;

  })(ContentTools.Tool);

  ContentTools.Tools.Redo = (function(_super) {
    __extends(Redo, _super);

    function Redo() {
      return Redo.__super__.constructor.apply(this, arguments);
    }

    ContentTools.ToolShelf.stow(Redo, 'redo');

    Redo.label = 'Redo';

    Redo.icon = 'redo';

    Redo.requiresElement = false;

    Redo.canApply = function(element, selection) {
      var app;
      app = ContentTools.EditorApp.get();
      return app.history && app.history.canRedo();
    };

    Redo.apply = function(element, selection, callback) {
      var app, snapshot, toolDetail;
      toolDetail = {
        'tool': this,
        'element': element,
        'selection': selection
      };
      if (!this.dispatchEditorEvent('tool-apply', toolDetail)) {
        return;
      }
      app = ContentTools.EditorApp.get();
      app.history.stopWatching();
      snapshot = app.history.redo();
      app.revertToSnapshot(snapshot);
      app.history.watch();
      return this.dispatchEditorEvent('tool-applied', toolDetail);
    };

    return Redo;

  })(ContentTools.Tool);

  ContentTools.Tools.Remove = (function(_super) {
    __extends(Remove, _super);

    function Remove() {
      return Remove.__super__.constructor.apply(this, arguments);
    }

    ContentTools.ToolShelf.stow(Remove, 'remove');

    Remove.label = 'Remove';

    Remove.icon = 'remove';

    Remove.canApply = function(element, selection) {
      return !element.isFixed();
    };

    Remove.apply = function(element, selection, callback) {
      var app, list, row, table, toolDetail;
      toolDetail = {
        'tool': this,
        'element': element,
        'selection': selection
      };
      if (!this.dispatchEditorEvent('tool-apply', toolDetail)) {
        return;
      }
      app = this.editor();
      element.blur();
      if (element.nextContent()) {
        element.nextContent().focus();
      } else if (element.previousContent()) {
        element.previousContent().focus();
      }
      if (!element.isMounted()) {
        callback(true);
        this.dispatchEditorEvent('tool-applied', toolDetail);
        return;
      }
      switch (element.type()) {
        case 'ListItemText':
          if (app.ctrlDown()) {
            list = element.closest(function(node) {
              return node.parent().type() === 'Region';
            });
            list.parent().detach(list);
          } else {
            element.parent().parent().detach(element.parent());
          }
          break;
        case 'TableCellText':
          if (app.ctrlDown()) {
            table = element.closest(function(node) {
              return node.type() === 'Table';
            });
            table.parent().detach(table);
          } else {
            row = element.parent().parent();
            row.parent().detach(row);
          }
          break;
        default:
          element.parent().detach(element);
          break;
      }
      callback(true);
      return this.dispatchEditorEvent('tool-applied', toolDetail);
    };

    return Remove;

  })(ContentTools.Tool);

}).call(this);

// By: Hans Fj�llemark and John Papa
// https://github.com/CodeSeven/toastr
// 
// Modified to support css styling instead of inline styling
// Inspired by https://github.com/Srirangan/notifer.js/

;(function(window, $) {
    window.toastr = (function() {
        var 
            defaults = {
                tapToDismiss: true,
                toastClass: 'toast',
                containerId: 'toast-container',
                debug: false,
                fadeIn: 300,
                fadeOut: 1000,
                extendedTimeOut: 1000,
                iconClasses: {
                    error: 'toast-error',
                    info: 'toast-info',
                    success: 'toast-success',
                    warning: 'toast-warning'
                },
                iconClass: 'toast-info',
                positionClass: 'toast-top-right',
                timeOut: 5000, // Set timeOut to 0 to make it sticky
                titleClass: 'toast-title',
                messageClass: 'toast-message'
            },


            error = function(message, title) {
                return notify({
                    iconClass: getOptions().iconClasses.error,
                    message: message,
                    title: title
                })
            },

            getContainer = function(options) {
                var $container = $('#' + options.containerId)

                if ($container.length)
                    return $container

                $container = $('<div/>')
                    .attr('id', options.containerId)
                    .addClass(options.positionClass)

                $container.appendTo($('body'))

                return $container
            },

            getOptions = function() {
                return $.extend({}, defaults, toastr.options)
            },

            info = function(message, title) {
                return notify({
                    iconClass: getOptions().iconClasses.info,
                    message: message,
                    title: title
                })
            },

            notify = function(map) {
                var 
                    options = getOptions(),
                    iconClass = map.iconClass || options.iconClass,
                    intervalId = null,
                    $container = getContainer(options),
                    $toastElement = $('<div/>'),
                    $titleElement = $('<div/>'),
                    $messageElement = $('<div/>'),
                    response = { options: options, map: map }

                if (map.iconClass) {
                    $toastElement.addClass(options.toastClass).addClass(iconClass)
                }

                if (map.title) {
                    $titleElement.append(map.title).addClass(options.titleClass)
                    $toastElement.append($titleElement)
                }

                if (map.message) {
                    $messageElement.append(map.message).addClass(options.messageClass)
                    $toastElement.append($messageElement)
                }

                var fadeAway = function() {
                    if ($(':focus', $toastElement).length > 0)
                		return
                	
                    var fade = function() {
                        return $toastElement.fadeOut(options.fadeOut)
                    }

                    $.when(fade()).done(function() {
                        if ($toastElement.is(':visible')) {
                            return
                        }
                        $toastElement.remove()
                        if ($container.children().length === 0)
                            $container.remove()
                    })
                }

                var delayedFadeAway = function() {
                    if (options.timeOut > 0 || options.extendedTimeOut > 0) {
                        intervalId = setTimeout(fadeAway, options.extendedTimeOut)
                    }
                }

                var stickAround = function() {
                    clearTimeout(intervalId)
                    $toastElement.stop(true, true)
                        .fadeIn(options.fadeIn)
                }

                $toastElement.hide()
                $container.prepend($toastElement)
                $toastElement.fadeIn(options.fadeIn)

                if (options.timeOut > 0) {
                    intervalId = setTimeout(fadeAway, options.timeOut)
                }

                $toastElement.hover(stickAround, delayedFadeAway)

                if (options.tapToDismiss) {
                    $toastElement.click(fadeAway)
                }

                if (options.debug) {
                    console.log(response)
                }
                return $toastElement
            },

            success = function(message, title) {
                return notify({
                    iconClass: getOptions().iconClasses.success,
                    message: message,
                    title: title
                })
            },

            warning = function(message, title) {
                return notify({
                    iconClass: getOptions().iconClasses.warning,
                    message: message,
                    title: title
                })
            }

        return {
            error: error,
            info: info,
            options: {},
            success: success,
            warning: warning
        }
    })()
} (window, jQuery));
/*
 * Foundation Responsive Library
 * http://foundation.zurb.com
 * Copyright 2014, ZURB
 * Free to use under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
*/


(function ($, window, document, undefined) {
  'use strict';

  var header_helpers = function (class_array) {
    var i = class_array.length;
    var head = $('head');

    while (i--) {
      if(head.has('.' + class_array[i]).length === 0) {
        head.append('<meta class="' + class_array[i] + '" />');
      }
    }
  };

  header_helpers([
    'foundation-mq-small',
    'foundation-mq-medium',
    'foundation-mq-large',
    'foundation-mq-xlarge',
    'foundation-mq-xxlarge',
    'foundation-data-attribute-namespace']);

  // Enable FastClick if present

  $(function() {
    if (typeof FastClick !== 'undefined') {
      // Don't attach to body if undefined
      if (typeof document.body !== 'undefined') {
        FastClick.attach(document.body);
      }
    }
  });

  // private Fast Selector wrapper,
  // returns jQuery object. Only use where
  // getElementById is not available.
  var S = function (selector, context) {
    if (typeof selector === 'string') {
      if (context) {
        var cont;
        if (context.jquery) {
          cont = context[0];
          if (!cont) return context;
        } else {
          cont = context;
        }
        return $(cont.querySelectorAll(selector));
      }

      return $(document.querySelectorAll(selector));
    }

    return $(selector, context);
  };

  // Namespace functions.

  var attr_name = function (init) {
    var arr = [];
    if (!init) arr.push('data');
    if (this.namespace.length > 0) arr.push(this.namespace);
    arr.push(this.name);

    return arr.join('-');
  };

  var add_namespace = function (str) {
    var parts = str.split('-'),
        i = parts.length,
        arr = [];

    while (i--) {
      if (i !== 0) {
        arr.push(parts[i]);
      } else {
        if (this.namespace.length > 0) {
          arr.push(this.namespace, parts[i]);
        } else {
          arr.push(parts[i]);
        }
      }
    }

    return arr.reverse().join('-');
  };

  // Event binding and data-options updating.

  var bindings = function (method, options) {
    var self = this,
        should_bind_events = !S(this).data(this.attr_name(true));


    if (S(this.scope).is('[' + this.attr_name() +']')) {
      S(this.scope).data(this.attr_name(true) + '-init', $.extend({}, this.settings, (options || method), this.data_options(S(this.scope))));

      if (should_bind_events) {
        this.events(this.scope);
      }

    } else {
      S('[' + this.attr_name() +']', this.scope).each(function () {
        var should_bind_events = !S(this).data(self.attr_name(true) + '-init');
        S(this).data(self.attr_name(true) + '-init', $.extend({}, self.settings, (options || method), self.data_options(S(this))));

        if (should_bind_events) {
          self.events(this);
        }
      });
    }
    // # Patch to fix #5043 to move this *after* the if/else clause in order for Backbone and similar frameworks to have improved control over event binding and data-options updating.
    if (typeof method === 'string') {
      return this[method].call(this, options);
    }

  };

  var single_image_loaded = function (image, callback) {
    function loaded () {
      callback(image[0]);
    }

    function bindLoad () {
      this.one('load', loaded);

      if (/MSIE (\d+\.\d+);/.test(navigator.userAgent)) {
        var src = this.attr( 'src' ),
            param = src.match( /\?/ ) ? '&' : '?';

        param += 'random=' + (new Date()).getTime();
        this.attr('src', src + param);
      }
    }

    if (!image.attr('src')) {
      loaded();
      return;
    }

    if (image[0].complete || image[0].readyState === 4) {
      loaded();
    } else {
      bindLoad.call(image);
    }
  };

  /*
    https://github.com/paulirish/matchMedia.js
  */

  window.matchMedia = window.matchMedia || (function( doc ) {

    "use strict";

    var bool,
        docElem = doc.documentElement,
        refNode = docElem.firstElementChild || docElem.firstChild,
        // fakeBody required for <FF4 when executed in <head>
        fakeBody = doc.createElement( "body" ),
        div = doc.createElement( "div" );

    div.id = "mq-test-1";
    div.style.cssText = "position:absolute;top:-100em";
    fakeBody.style.background = "none";
    fakeBody.appendChild(div);

    return function (q) {

      div.innerHTML = "&shy;<style media=\"" + q + "\"> #mq-test-1 { width: 42px; }</style>";

      docElem.insertBefore( fakeBody, refNode );
      bool = div.offsetWidth === 42;
      docElem.removeChild( fakeBody );

      return {
        matches: bool,
        media: q
      };

    };

  }( document ));

  /*
   * jquery.requestAnimationFrame
   * https://github.com/gnarf37/jquery-requestAnimationFrame
   * Requires jQuery 1.8+
   *
   * Copyright (c) 2012 Corey Frang
   * Licensed under the MIT license.
   */

  (function($) {

  // requestAnimationFrame polyfill adapted from Erik Möller
  // fixes from Paul Irish and Tino Zijdel
  // http://paulirish.com/2011/requestanimationframe-for-smart-animating/
  // http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating

  var animating,
      lastTime = 0,
      vendors = ['webkit', 'moz'],
      requestAnimationFrame = window.requestAnimationFrame,
      cancelAnimationFrame = window.cancelAnimationFrame,
      jqueryFxAvailable = 'undefined' !== typeof jQuery.fx;

  for (; lastTime < vendors.length && !requestAnimationFrame; lastTime++) {
    requestAnimationFrame = window[ vendors[lastTime] + "RequestAnimationFrame" ];
    cancelAnimationFrame = cancelAnimationFrame ||
      window[ vendors[lastTime] + "CancelAnimationFrame" ] ||
      window[ vendors[lastTime] + "CancelRequestAnimationFrame" ];
  }

  function raf() {
    if (animating) {
      requestAnimationFrame(raf);

      if (jqueryFxAvailable) {
        jQuery.fx.tick();
      }
    }
  }

  if (requestAnimationFrame) {
    // use rAF
    window.requestAnimationFrame = requestAnimationFrame;
    window.cancelAnimationFrame = cancelAnimationFrame;

    if (jqueryFxAvailable) {
      jQuery.fx.timer = function (timer) {
        if (timer() && jQuery.timers.push(timer) && !animating) {
          animating = true;
          raf();
        }
      };

      jQuery.fx.stop = function () {
        animating = false;
      };
    }
  } else {
    // polyfill
    window.requestAnimationFrame = function (callback) {
      var currTime = new Date().getTime(),
        timeToCall = Math.max(0, 16 - (currTime - lastTime)),
        id = window.setTimeout(function () {
          callback(currTime + timeToCall);
        }, timeToCall);
      lastTime = currTime + timeToCall;
      return id;
    };

    window.cancelAnimationFrame = function (id) {
      clearTimeout(id);
    };

  }

  }( jQuery ));


  function removeQuotes (string) {
    if (typeof string === 'string' || string instanceof String) {
      string = string.replace(/^['\\/"]+|(;\s?})+|['\\/"]+$/g, '');
    }

    return string;
  }

  window.Foundation = {
    name : 'Foundation',

    version : '5.4.5',

    media_queries : {
      small : S('.foundation-mq-small').css('font-family').replace(/^[\/\\'"]+|(;\s?})+|[\/\\'"]+$/g, ''),
      medium : S('.foundation-mq-medium').css('font-family').replace(/^[\/\\'"]+|(;\s?})+|[\/\\'"]+$/g, ''),
      large : S('.foundation-mq-large').css('font-family').replace(/^[\/\\'"]+|(;\s?})+|[\/\\'"]+$/g, ''),
      xlarge: S('.foundation-mq-xlarge').css('font-family').replace(/^[\/\\'"]+|(;\s?})+|[\/\\'"]+$/g, ''),
      xxlarge: S('.foundation-mq-xxlarge').css('font-family').replace(/^[\/\\'"]+|(;\s?})+|[\/\\'"]+$/g, '')
    },

    stylesheet : $('<style></style>').appendTo('head')[0].sheet,

    global: {
      namespace: undefined
    },

    init : function (scope, libraries, method, options, response) {
      var args = [scope, method, options, response],
          responses = [];

      // check RTL
      this.rtl = /rtl/i.test(S('html').attr('dir'));

      // set foundation global scope
      this.scope = scope || this.scope;

      this.set_namespace();

      if (libraries && typeof libraries === 'string' && !/reflow/i.test(libraries)) {
        if (this.libs.hasOwnProperty(libraries)) {
          responses.push(this.init_lib(libraries, args));
        }
      } else {
        for (var lib in this.libs) {
          responses.push(this.init_lib(lib, libraries));
        }
      }

      S(window).load(function(){
        S(window)
          .trigger('resize.fndtn.clearing')
          .trigger('resize.fndtn.dropdown')
          .trigger('resize.fndtn.equalizer')
          .trigger('resize.fndtn.interchange')
          .trigger('resize.fndtn.joyride')
          .trigger('resize.fndtn.magellan')
          .trigger('resize.fndtn.topbar')
          .trigger('resize.fndtn.slider');
      });

      return scope;
    },

    init_lib : function (lib, args) {
      if (this.libs.hasOwnProperty(lib)) {
        this.patch(this.libs[lib]);

        if (args && args.hasOwnProperty(lib)) {
            if (typeof this.libs[lib].settings !== 'undefined') {
                $.extend(true, this.libs[lib].settings, args[lib]);
            }
            else if (typeof this.libs[lib].defaults !== 'undefined') {
                $.extend(true, this.libs[lib].defaults, args[lib]);
            }
          return this.libs[lib].init.apply(this.libs[lib], [this.scope, args[lib]]);
        }

        args = args instanceof Array ? args : new Array(args);    // PATCH: added this line
        return this.libs[lib].init.apply(this.libs[lib], args);
      }

      return function () {};
    },

    patch : function (lib) {
      lib.scope = this.scope;
      lib.namespace = this.global.namespace;
      lib.rtl = this.rtl;
      lib['data_options'] = this.utils.data_options;
      lib['attr_name'] = attr_name;
      lib['add_namespace'] = add_namespace;
      lib['bindings'] = bindings;
      lib['S'] = this.utils.S;
    },

    inherit : function (scope, methods) {
      var methods_arr = methods.split(' '),
          i = methods_arr.length;

      while (i--) {
        if (this.utils.hasOwnProperty(methods_arr[i])) {
          scope[methods_arr[i]] = this.utils[methods_arr[i]];
        }
      }
    },

    set_namespace: function () {

      // Description:
      //    Don't bother reading the namespace out of the meta tag
      //    if the namespace has been set globally in javascript
      //
      // Example:
      //    Foundation.global.namespace = 'my-namespace';
      // or make it an empty string:
      //    Foundation.global.namespace = '';
      //
      //

      // If the namespace has not been set (is undefined), try to read it out of the meta element.
      // Otherwise use the globally defined namespace, even if it's empty ('')
      var namespace = ( this.global.namespace === undefined ) ? $('.foundation-data-attribute-namespace').css('font-family') : this.global.namespace;

      // Finally, if the namsepace is either undefined or false, set it to an empty string.
      // Otherwise use the namespace value.
      this.global.namespace = ( namespace === undefined || /false/i.test(namespace) ) ? '' : namespace;
    },

    libs : {},

    // methods that can be inherited in libraries
    utils : {

      // Description:
      //    Fast Selector wrapper returns jQuery object. Only use where getElementById
      //    is not available.
      //
      // Arguments:
      //    Selector (String): CSS selector describing the element(s) to be
      //    returned as a jQuery object.
      //
      //    Scope (String): CSS selector describing the area to be searched. Default
      //    is document.
      //
      // Returns:
      //    Element (jQuery Object): jQuery object containing elements matching the
      //    selector within the scope.
      S : S,

      // Description:
      //    Executes a function a max of once every n milliseconds
      //
      // Arguments:
      //    Func (Function): Function to be throttled.
      //
      //    Delay (Integer): Function execution threshold in milliseconds.
      //
      // Returns:
      //    Lazy_function (Function): Function with throttling applied.
      throttle : function (func, delay) {
        var timer = null;

        return function () {
          var context = this, args = arguments;

          if (timer == null) {
            timer = setTimeout(function () {
              func.apply(context, args);
              timer = null;
            }, delay);
          }
        };
      },

      // Description:
      //    Executes a function when it stops being invoked for n seconds
      //    Modified version of _.debounce() http://underscorejs.org
      //
      // Arguments:
      //    Func (Function): Function to be debounced.
      //
      //    Delay (Integer): Function execution threshold in milliseconds.
      //
      //    Immediate (Bool): Whether the function should be called at the beginning
      //    of the delay instead of the end. Default is false.
      //
      // Returns:
      //    Lazy_function (Function): Function with debouncing applied.
      debounce : function (func, delay, immediate) {
        var timeout, result;
        return function () {
          var context = this, args = arguments;
          var later = function () {
            timeout = null;
            if (!immediate) result = func.apply(context, args);
          };
          var callNow = immediate && !timeout;
          clearTimeout(timeout);
          timeout = setTimeout(later, delay);
          if (callNow) result = func.apply(context, args);
          return result;
        };
      },

      // Description:
      //    Parses data-options attribute
      //
      // Arguments:
      //    El (jQuery Object): Element to be parsed.
      //
      // Returns:
      //    Options (Javascript Object): Contents of the element's data-options
      //    attribute.
      data_options : function (el, data_attr_name) {
        data_attr_name = data_attr_name || 'options';
        var opts = {}, ii, p, opts_arr,
            data_options = function (el) {
              var namespace = Foundation.global.namespace;

              if (namespace.length > 0) {
                return el.data(namespace + '-' + data_attr_name);
              }

              return el.data(data_attr_name);
            };

        var cached_options = data_options(el);

        if (typeof cached_options === 'object') {
          return cached_options;
        }

        opts_arr = (cached_options || ':').split(';');
        ii = opts_arr.length;

        function isNumber (o) {
          return ! isNaN (o-0) && o !== null && o !== "" && o !== false && o !== true;
        }

        function trim (str) {
          if (typeof str === 'string') return $.trim(str);
          return str;
        }

        while (ii--) {
          p = opts_arr[ii].split(':');
          p = [p[0], p.slice(1).join(':')];

          if (/true/i.test(p[1])) p[1] = true;
          if (/false/i.test(p[1])) p[1] = false;
          if (isNumber(p[1])) {
            if (p[1].indexOf('.') === -1) {
              p[1] = parseInt(p[1], 10);
            } else {
              p[1] = parseFloat(p[1]);
            }
          }

          if (p.length === 2 && p[0].length > 0) {
            opts[trim(p[0])] = trim(p[1]);
          }
        }

        return opts;
      },

      // Description:
      //    Adds JS-recognizable media queries
      //
      // Arguments:
      //    Media (String): Key string for the media query to be stored as in
      //    Foundation.media_queries
      //
      //    Class (String): Class name for the generated <meta> tag
      register_media : function (media, media_class) {
        if(Foundation.media_queries[media] === undefined) {
          $('head').append('<meta class="' + media_class + '"/>');
          Foundation.media_queries[media] = removeQuotes($('.' + media_class).css('font-family'));
        }
      },

      // Description:
      //    Add custom CSS within a JS-defined media query
      //
      // Arguments:
      //    Rule (String): CSS rule to be appended to the document.
      //
      //    Media (String): Optional media query string for the CSS rule to be
      //    nested under.
      add_custom_rule : function (rule, media) {
        if (media === undefined && Foundation.stylesheet) {
          Foundation.stylesheet.insertRule(rule, Foundation.stylesheet.cssRules.length);
        } else {
          var query = Foundation.media_queries[media];

          if (query !== undefined) {
            Foundation.stylesheet.insertRule('@media ' +
              Foundation.media_queries[media] + '{ ' + rule + ' }');
          }
        }
      },

      // Description:
      //    Performs a callback function when an image is fully loaded
      //
      // Arguments:
      //    Image (jQuery Object): Image(s) to check if loaded.
      //
      //    Callback (Function): Function to execute when image is fully loaded.
      image_loaded : function (images, callback) {
        var self = this,
            unloaded = images.length;

        if (unloaded === 0) {
          callback(images);
        }

        images.each(function () {
          single_image_loaded(self.S(this), function () {
            unloaded -= 1;
            if (unloaded === 0) {
              callback(images);
            }
          });
        });
      },

      // Description:
      //    Returns a random, alphanumeric string
      //
      // Arguments:
      //    Length (Integer): Length of string to be generated. Defaults to random
      //    integer.
      //
      // Returns:
      //    Rand (String): Pseudo-random, alphanumeric string.
      random_str : function () {
        if (!this.fidx) this.fidx = 0;
        this.prefix = this.prefix || [(this.name || 'F'), (+new Date).toString(36)].join('-');

        return this.prefix + (this.fidx++).toString(36);
      }
    }
  };

  $.fn.foundation = function () {
    var args = Array.prototype.slice.call(arguments, 0);

    return this.each(function () {
      Foundation.init.apply(Foundation, [this].concat(args));
      return this;
    });
  };

}(jQuery, window, window.document));
;(function ($, window, document, undefined) {
  'use strict';

  Foundation.libs.abide = {
    name : 'abide',

    version : '5.4.5',

    settings : {
      live_validate : true,
      focus_on_invalid : true,
      error_labels: true, // labels with a for="inputId" will recieve an `error` class
      timeout : 1000,
      patterns : {
        alpha: /^[a-zA-Z]+$/,
        alpha_numeric : /^[a-zA-Z0-9]+$/,
        integer: /^[-+]?\d+$/,
        number: /^[-+]?\d*(?:[\.\,]\d+)?$/,

        // amex, visa, diners
        card : /^(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|6(?:011|5[0-9][0-9])[0-9]{12}|3[47][0-9]{13}|3(?:0[0-5]|[68][0-9])[0-9]{11}|(?:2131|1800|35\d{3})\d{11})$/,
        cvv : /^([0-9]){3,4}$/,

        // http://www.whatwg.org/specs/web-apps/current-work/multipage/states-of-the-type-attribute.html#valid-e-mail-address
        email : /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/,

        url: /^(https?|ftp|file|ssh):\/\/(((([a-zA-Z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-zA-Z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-zA-Z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-zA-Z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-zA-Z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-zA-Z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-zA-Z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-zA-Z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-zA-Z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-zA-Z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-zA-Z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-zA-Z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-zA-Z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/,
        // abc.de
        domain: /^([a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,6}$/,

        datetime: /^([0-2][0-9]{3})\-([0-1][0-9])\-([0-3][0-9])T([0-5][0-9])\:([0-5][0-9])\:([0-5][0-9])(Z|([\-\+]([0-1][0-9])\:00))$/,
        // YYYY-MM-DD
        date: /(?:19|20)[0-9]{2}-(?:(?:0[1-9]|1[0-2])-(?:0[1-9]|1[0-9]|2[0-9])|(?:(?!02)(?:0[1-9]|1[0-2])-(?:30))|(?:(?:0[13578]|1[02])-31))$/,
        // HH:MM:SS
        time : /^(0[0-9]|1[0-9]|2[0-3])(:[0-5][0-9]){2}$/,
        dateISO: /^\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2}$/,
        // MM/DD/YYYY
        month_day_year : /^(0[1-9]|1[012])[- \/.](0[1-9]|[12][0-9]|3[01])[- \/.]\d{4}$/,
        // DD/MM/YYYY
        day_month_year : /^(0[1-9]|[12][0-9]|3[01])[- \/.](0[1-9]|1[012])[- \/.]\d{4}$/,

        // #FFF or #FFFFFF
        color: /^#?([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$/
      },
      validators : {
        equalTo: function(el, required, parent) {
          var from  = document.getElementById(el.getAttribute(this.add_namespace('data-equalto'))).value,
              to    = el.value,
              valid = (from === to);

          return valid;
        }
      }
    },

    timer : null,

    init : function (scope, method, options) {
      this.bindings(method, options);
    },

    events : function (scope) {
      var self = this,
          form = self.S(scope).attr('novalidate', 'novalidate'),
          settings = form.data(this.attr_name(true) + '-init') || {};

      this.invalid_attr = this.add_namespace('data-invalid');

      form
        .off('.abide')
        .on('submit.fndtn.abide validate.fndtn.abide', function (e) {
          var is_ajax = /ajax/i.test(self.S(this).attr(self.attr_name()));
          return self.validate(self.S(this).find('input, textarea, select').get(), e, is_ajax);
        })
        .on('reset', function() {
          return self.reset($(this));
        })
        .find('input, textarea, select')
          .off('.abide')
          .on('blur.fndtn.abide change.fndtn.abide', function (e) {
            self.validate([this], e);
          })
          .on('keydown.fndtn.abide', function (e) {
            if (settings.live_validate === true) {
              clearTimeout(self.timer);
              self.timer = setTimeout(function () {
                self.validate([this], e);
              }.bind(this), settings.timeout);
            }
          });
    },

    reset : function (form) {
      form.removeAttr(this.invalid_attr);
      $(this.invalid_attr, form).removeAttr(this.invalid_attr);
      $('.error', form).not('small').removeClass('error');
    },

    validate : function (els, e, is_ajax) {
      var validations = this.parse_patterns(els),
          validation_count = validations.length,
          form = this.S(els[0]).closest('form'),
          submit_event = /submit/.test(e.type);

      // Has to count up to make sure the focus gets applied to the top error
      for (var i=0; i < validation_count; i++) {
        if (!validations[i] && (submit_event || is_ajax)) {
          if (this.settings.focus_on_invalid) els[i].focus();
          form.trigger('invalid');
          this.S(els[i]).closest('form').attr(this.invalid_attr, '');
          return false;
        }
      }

      if (submit_event || is_ajax) {
        form.trigger('valid');
      }

      form.removeAttr(this.invalid_attr);

      if (is_ajax) return false;

      return true;
    },

    parse_patterns : function (els) {
      var i = els.length,
          el_patterns = [];

      while (i--) {
        el_patterns.push(this.pattern(els[i]));
      }

      return this.check_validation_and_apply_styles(el_patterns);
    },

    pattern : function (el) {
      var type = el.getAttribute('type'),
          required = typeof el.getAttribute('required') === 'string';

      var pattern = el.getAttribute('pattern') || '';

      if (this.settings.patterns.hasOwnProperty(pattern) && pattern.length > 0) {
        return [el, this.settings.patterns[pattern], required];
      } else if (pattern.length > 0) {
        return [el, new RegExp(pattern), required];
      }

      if (this.settings.patterns.hasOwnProperty(type)) {
        return [el, this.settings.patterns[type], required];
      }

      pattern = /.*/;

      return [el, pattern, required];
    },

    check_validation_and_apply_styles : function (el_patterns) {
      var i = el_patterns.length,
          validations = [],
          form = this.S(el_patterns[0][0]).closest('[data-' + this.attr_name(true) + ']'),
          settings = form.data(this.attr_name(true) + '-init') || {};
      while (i--) {
        var el = el_patterns[i][0],
            required = el_patterns[i][2],
            value = el.value.trim(),
            direct_parent = this.S(el).parent(),
            validator = el.getAttribute(this.add_namespace('data-abide-validator')),
            is_radio = el.type === "radio",
            is_checkbox = el.type === "checkbox",
            label = this.S('label[for="' + el.getAttribute('id') + '"]'),
            valid_length = (required) ? (el.value.length > 0) : true,
            el_validations = [];

        var parent, valid;

        // support old way to do equalTo validations
        if(el.getAttribute(this.add_namespace('data-equalto'))) { validator = "equalTo" }

        if (!direct_parent.is('label')) {
          parent = direct_parent;
        } else {
          parent = direct_parent.parent();
        }

        if (validator) {
          valid = this.settings.validators[validator].apply(this, [el, required, parent]);
          el_validations.push(valid);
        }

        if (is_radio && required) {
          el_validations.push(this.valid_radio(el, required));
        } else if (is_checkbox && required) {
          el_validations.push(this.valid_checkbox(el, required));
        } else {

          if (el_patterns[i][1].test(value) && valid_length ||
            !required && el.value.length < 1 || $(el).attr('disabled')) {
            el_validations.push(true);
          } else {
            el_validations.push(false);
          }

          el_validations = [el_validations.every(function(valid){return valid;})];

          if(el_validations[0]){
            this.S(el).removeAttr(this.invalid_attr);
            el.setAttribute('aria-invalid', 'false');
            el.removeAttribute('aria-describedby');
            parent.removeClass('error');
            if (label.length > 0 && this.settings.error_labels) {
              label.removeClass('error').removeAttr('role');
            }
            $(el).triggerHandler('valid');
          } else {
            this.S(el).attr(this.invalid_attr, '');
            el.setAttribute('aria-invalid', 'true');

            // Try to find the error associated with the input
            var errorElem = parent.find('small.error, span.error');
            var errorID = errorElem.length > 0 ? errorElem[0].id : "";
            if (errorID.length > 0) el.setAttribute('aria-describedby', errorID);

            // el.setAttribute('aria-describedby', $(el).find('.error')[0].id);
            parent.addClass('error');
            if (label.length > 0 && this.settings.error_labels) {
              label.addClass('error').attr('role', 'alert');
            }
            $(el).triggerHandler('invalid');
          }
          validations.push(el_validations[0]);
        }
      }
      validations = [validations.every(function(valid){return valid;})];
      return validations;
    },

    valid_checkbox : function(el, required) {
      var el = this.S(el),
          valid = (el.is(':checked') || !required);

      if (valid) {
        el.removeAttr(this.invalid_attr).parent().removeClass('error');
      } else {
        el.attr(this.invalid_attr, '').parent().addClass('error');
      }

      return valid;
    },

    valid_radio : function (el, required) {
      var name = el.getAttribute('name'),
          group = this.S(el).closest('[data-' + this.attr_name(true) + ']').find("[name='"+name+"']"),
          count = group.length,
          valid = false;

      // Has to count up to make sure the focus gets applied to the top error
      for (var i=0; i < count; i++) {
        if (group[i].checked) valid = true;
      }

      // Has to count up to make sure the focus gets applied to the top error
      for (var i=0; i < count; i++) {
        if (valid) {
          this.S(group[i]).removeAttr(this.invalid_attr).parent().removeClass('error');
        } else {
          this.S(group[i]).attr(this.invalid_attr, '').parent().addClass('error');
        }
      }

      return valid;
    },

    valid_equal: function(el, required, parent) {
      var from  = document.getElementById(el.getAttribute(this.add_namespace('data-equalto'))).value,
          to    = el.value,
          valid = (from === to);

      if (valid) {
        this.S(el).removeAttr(this.invalid_attr);
        parent.removeClass('error');
        if (label.length > 0 && settings.error_labels) label.removeClass('error');
      } else {
        this.S(el).attr(this.invalid_attr, '');
        parent.addClass('error');
        if (label.length > 0 && settings.error_labels) label.addClass('error');
      }

      return valid;
    },

    valid_oneof: function(el, required, parent, doNotValidateOthers) {
      var el = this.S(el),
        others = this.S('[' + this.add_namespace('data-oneof') + ']'),
        valid = others.filter(':checked').length > 0;

      if (valid) {
        el.removeAttr(this.invalid_attr).parent().removeClass('error');
      } else {
        el.attr(this.invalid_attr, '').parent().addClass('error');
      }

      if (!doNotValidateOthers) {
        var _this = this;
        others.each(function() {
          _this.valid_oneof.call(_this, this, null, null, true);
        });
      }

      return valid;
    }
  };
}(jQuery, window, window.document));
;(function ($, window, document, undefined) {
  'use strict';

  Foundation.libs.accordion = {
    name : 'accordion',

    version : '5.4.5',

    settings : {
      active_class: 'active',
      multi_expand: false,
      toggleable: true,
      callback : function () {}
    },

    init : function (scope, method, options) {
      this.bindings(method, options);
    },

    events : function () {
      var self = this;
      var S = this.S;
      S(this.scope)
      .off('.fndtn.accordion')
      .on('click.fndtn.accordion', '[' + this.attr_name() + '] > dd > a', function (e) {
        var accordion = S(this).closest('[' + self.attr_name() + ']'),
            groupSelector = self.attr_name() + '=' + accordion.attr(self.attr_name()),
            settings = accordion.data(self.attr_name(true) + '-init'),
            target = S('#' + this.href.split('#')[1]),
            aunts = $('> dd', accordion),
            siblings = aunts.children('.content'),
            active_content = siblings.filter('.' + settings.active_class);
        e.preventDefault();

        if (accordion.attr(self.attr_name())) {
          siblings = siblings.add('[' + groupSelector + '] dd > .content');
          aunts = aunts.add('[' + groupSelector + '] dd');
        }

        if (settings.toggleable && target.is(active_content)) {
          target.parent('dd').toggleClass(settings.active_class, false);
          target.toggleClass(settings.active_class, false);
          settings.callback(target);
          target.triggerHandler('toggled', [accordion]);
          accordion.triggerHandler('toggled', [target]);
          return;
        }

        if (!settings.multi_expand) {
          siblings.removeClass(settings.active_class);
          aunts.removeClass(settings.active_class);
        }

        target.addClass(settings.active_class).parent().addClass(settings.active_class);
        settings.callback(target);
        target.triggerHandler('toggled', [accordion]);
        accordion.triggerHandler('toggled', [target]);
      });
    },

    off : function () {},

    reflow : function () {}
  };
}(jQuery, window, window.document));
;(function ($, window, document, undefined) {
  'use strict';

  Foundation.libs.alert = {
    name : 'alert',

    version : '5.4.5',

    settings : {
      callback: function (){}
    },

    init : function (scope, method, options) {
      this.bindings(method, options);
    },

    events : function () {
      var self = this,
          S = this.S;

      $(this.scope).off('.alert').on('click.fndtn.alert', '[' + this.attr_name() + '] .close', function (e) {
          var alertBox = S(this).closest('[' + self.attr_name() + ']'),
              settings = alertBox.data(self.attr_name(true) + '-init') || self.settings;

        e.preventDefault();
        if (Modernizr.csstransitions) {
          alertBox.addClass("alert-close");
          alertBox.on('transitionend webkitTransitionEnd oTransitionEnd', function(e) {
            S(this).trigger('close').trigger('close.fndtn.alert').remove();
            settings.callback();
          });
        } else {
          alertBox.fadeOut(300, function () {
            S(this).trigger('close').trigger('close.fndtn.alert').remove();
            settings.callback();
          });
        }
      });
    },

    reflow : function () {}
  };
}(jQuery, window, window.document));
;(function ($, window, document, undefined) {
  'use strict';

  Foundation.libs.clearing = {
    name : 'clearing',

    version: '5.4.5',

    settings : {
      templates : {
        viewing : '<a href="#" class="clearing-close">&times;</a>' +
          '<div class="visible-img" style="display: none"><div class="clearing-touch-label"></div><img src="data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs%3D" alt="" />' +
          '<p class="clearing-caption"></p><a href="#" class="clearing-main-prev"><span></span></a>' +
          '<a href="#" class="clearing-main-next"><span></span></a></div>'
      },

      // comma delimited list of selectors that, on click, will close clearing,
      // add 'div.clearing-blackout, div.visible-img' to close on background click
      close_selectors : '.clearing-close, div.clearing-blackout', 

      // Default to the entire li element.
      open_selectors : '',

      // Image will be skipped in carousel.
      skip_selector : '',

      touch_label : '',

      // event initializers and locks
      init : false,
      locked : false
    },

    init : function (scope, method, options) {
      var self = this;
      Foundation.inherit(this, 'throttle image_loaded');

      this.bindings(method, options);

      if (self.S(this.scope).is('[' + this.attr_name() + ']')) {
        this.assemble(self.S('li', this.scope));
      } else {
        self.S('[' + this.attr_name() + ']', this.scope).each(function () {
          self.assemble(self.S('li', this));
        });
      }
    },

    events : function (scope) {
      var self = this,
          S = self.S,
          $scroll_container = $('.scroll-container');

      if ($scroll_container.length > 0) {
        this.scope = $scroll_container;
      }

      S(this.scope)
        .off('.clearing')
        .on('click.fndtn.clearing', 'ul[' + this.attr_name() + '] li ' + this.settings.open_selectors,
          function (e, current, target) {
            var current = current || S(this),
                target = target || current,
                next = current.next('li'),
                settings = current.closest('[' + self.attr_name() + ']').data(self.attr_name(true) + '-init'),
                image = S(e.target);

            e.preventDefault();

            if (!settings) {
              self.init();
              settings = current.closest('[' + self.attr_name() + ']').data(self.attr_name(true) + '-init');
            }

            // if clearing is open and the current image is
            // clicked, go to the next image in sequence
            if (target.hasClass('visible') &&
              current[0] === target[0] &&
              next.length > 0 && self.is_open(current)) {
              target = next;
              image = S('img', target);
            }

            // set current and target to the clicked li if not otherwise defined.
            self.open(image, current, target);
            self.update_paddles(target);
          })

        .on('click.fndtn.clearing', '.clearing-main-next',
          function (e) { self.nav(e, 'next') })
        .on('click.fndtn.clearing', '.clearing-main-prev',
          function (e) { self.nav(e, 'prev') })
        .on('click.fndtn.clearing', this.settings.close_selectors,
          function (e) { Foundation.libs.clearing.close(e, this) });

      $(document).on('keydown.fndtn.clearing',
          function (e) { self.keydown(e) });

      S(window).off('.clearing').on('resize.fndtn.clearing',
        function () { self.resize() });

      this.swipe_events(scope);
    },

    swipe_events : function (scope) {
      var self = this,
      S = self.S;

      S(this.scope)
        .on('touchstart.fndtn.clearing', '.visible-img', function(e) {
          if (!e.touches) { e = e.originalEvent; }
          var data = {
                start_page_x: e.touches[0].pageX,
                start_page_y: e.touches[0].pageY,
                start_time: (new Date()).getTime(),
                delta_x: 0,
                is_scrolling: undefined
              };

          S(this).data('swipe-transition', data);
          e.stopPropagation();
        })
        .on('touchmove.fndtn.clearing', '.visible-img', function(e) {
          if (!e.touches) { e = e.originalEvent; }
          // Ignore pinch/zoom events
          if(e.touches.length > 1 || e.scale && e.scale !== 1) return;

          var data = S(this).data('swipe-transition');

          if (typeof data === 'undefined') {
            data = {};
          }

          data.delta_x = e.touches[0].pageX - data.start_page_x;

          if (Foundation.rtl) {
            data.delta_x = -data.delta_x;
          }

          if (typeof data.is_scrolling === 'undefined') {
            data.is_scrolling = !!( data.is_scrolling || Math.abs(data.delta_x) < Math.abs(e.touches[0].pageY - data.start_page_y) );
          }

          if (!data.is_scrolling && !data.active) {
            e.preventDefault();
            var direction = (data.delta_x < 0) ? 'next' : 'prev';
            data.active = true;
            self.nav(e, direction);
          }
        })
        .on('touchend.fndtn.clearing', '.visible-img', function(e) {
          S(this).data('swipe-transition', {});
          e.stopPropagation();
        });
    },

    assemble : function ($li) {
      var $el = $li.parent();

      if ($el.parent().hasClass('carousel')) {
        return;
      }
      
      $el.after('<div id="foundationClearingHolder"></div>');

      var grid = $el.detach(),
          grid_outerHTML = '';

      if (grid[0] == null) {
        return;
      } else {
        grid_outerHTML = grid[0].outerHTML;
      }
      
      var holder = this.S('#foundationClearingHolder'),
          settings = $el.data(this.attr_name(true) + '-init'),
          data = {
            grid: '<div class="carousel">' + grid_outerHTML + '</div>',
            viewing: settings.templates.viewing
          },
          wrapper = '<div class="clearing-assembled"><div>' + data.viewing +
            data.grid + '</div></div>',
          touch_label = this.settings.touch_label;

      if (Modernizr.touch) {
        wrapper = $(wrapper).find('.clearing-touch-label').html(touch_label).end();
      }

      holder.after(wrapper).remove();
    },

    open : function ($image, current, target) {
      var self = this,
          body = $(document.body),
          root = target.closest('.clearing-assembled'),
          container = self.S('div', root).first(),
          visible_image = self.S('.visible-img', container),
          image = self.S('img', visible_image).not($image),
          label = self.S('.clearing-touch-label', container),
          error = false;

      // Event to disable scrolling on touch devices when Clearing is activated
      $('body').on('touchmove',function(e){
        e.preventDefault();
      });

      image.error(function () {
        error = true;
      });

      function startLoad() {
        setTimeout(function () {
          this.image_loaded(image, function () {
            if (image.outerWidth() === 1 && !error) {
              startLoad.call(this);
            } else {
              cb.call(this, image);
            }
          }.bind(this));
        }.bind(this), 100);
      }

      function cb (image) {
        var $image = $(image);
        $image.css('visibility', 'visible');
        // toggle the gallery
        body.css('overflow', 'hidden');
        root.addClass('clearing-blackout');
        container.addClass('clearing-container');
        visible_image.show();
        this.fix_height(target)
          .caption(self.S('.clearing-caption', visible_image), self.S('img', target))
          .center_and_label(image, label)
          .shift(current, target, function () {
            target.closest('li').siblings().removeClass('visible');
            target.closest('li').addClass('visible');
          });
        visible_image.trigger('opened.fndtn.clearing')
      }

      if (!this.locked()) {
        visible_image.trigger('open.fndtn.clearing');
        // set the image to the selected thumbnail
        image
          .attr('src', this.load($image))
          .css('visibility', 'hidden');

        startLoad.call(this);
      }
    },

    close : function (e, el) {
      e.preventDefault();

      var root = (function (target) {
            if (/blackout/.test(target.selector)) {
              return target;
            } else {
              return target.closest('.clearing-blackout');
            }
          }($(el))),
          body = $(document.body), container, visible_image;

      if (el === e.target && root) {
        body.css('overflow', '');
        container = $('div', root).first();
        visible_image = $('.visible-img', container);
        visible_image.trigger('close.fndtn.clearing');
        this.settings.prev_index = 0;
        $('ul[' + this.attr_name() + ']', root)
          .attr('style', '').closest('.clearing-blackout')
          .removeClass('clearing-blackout');
        container.removeClass('clearing-container');
        visible_image.hide();
        visible_image.trigger('closed.fndtn.clearing');        
      }

      // Event to re-enable scrolling on touch devices
      $('body').off('touchmove');

      return false;
    },

    is_open : function (current) {
      return current.parent().prop('style').length > 0;
    },

    keydown : function (e) {
      var clearing = $('.clearing-blackout ul[' + this.attr_name() + ']'),
          NEXT_KEY = this.rtl ? 37 : 39,
          PREV_KEY = this.rtl ? 39 : 37,
          ESC_KEY = 27;

      if (e.which === NEXT_KEY) this.go(clearing, 'next');
      if (e.which === PREV_KEY) this.go(clearing, 'prev');
      if (e.which === ESC_KEY) this.S('a.clearing-close').trigger('click').trigger('click.fndtn.clearing');
    },

    nav : function (e, direction) {
      var clearing = $('ul[' + this.attr_name() + ']', '.clearing-blackout');

      e.preventDefault();
      this.go(clearing, direction);
    },

    resize : function () {
      var image = $('img', '.clearing-blackout .visible-img'),
          label = $('.clearing-touch-label', '.clearing-blackout');

      if (image.length) {
        this.center_and_label(image, label);
        image.trigger('resized.fndtn.clearing')
      }
    },

    // visual adjustments
    fix_height : function (target) {
      var lis = target.parent().children(),
          self = this;

      lis.each(function () {
        var li = self.S(this),
            image = li.find('img');

        if (li.height() > image.outerHeight()) {
          li.addClass('fix-height');
        }
      })
      .closest('ul')
      .width(lis.length * 100 + '%');

      return this;
    },

    update_paddles : function (target) {
      target = target.closest('li');
      var visible_image = target
        .closest('.carousel')
        .siblings('.visible-img');

      if (target.next().length > 0) {
        this.S('.clearing-main-next', visible_image).removeClass('disabled');
      } else {
        this.S('.clearing-main-next', visible_image).addClass('disabled');
      }

      if (target.prev().length > 0) {
        this.S('.clearing-main-prev', visible_image).removeClass('disabled');
      } else {
        this.S('.clearing-main-prev', visible_image).addClass('disabled');
      }
    },

    center_and_label : function (target, label) {
      if (!this.rtl) {
        target.css({
          marginLeft : -(target.outerWidth() / 2),
          marginTop : -(target.outerHeight() / 2)
        });

        if (label.length > 0) {
          label.css({
            marginLeft : -(label.outerWidth() / 2),
            marginTop : -(target.outerHeight() / 2)-label.outerHeight()-10
          });
        }
      } else {
        target.css({
          marginRight : -(target.outerWidth() / 2),
          marginTop : -(target.outerHeight() / 2),
          left: 'auto',
          right: '50%'
        });

        if (label.length > 0) {
          label.css({
            marginRight : -(label.outerWidth() / 2),
            marginTop : -(target.outerHeight() / 2)-label.outerHeight()-10,
            left: 'auto',
            right: '50%'
          });
        }
      }
      return this;
    },

    // image loading and preloading

    load : function ($image) {
      var href;

      if ($image[0].nodeName === "A") {
        href = $image.attr('href');
      } else {
        href = $image.parent().attr('href');
      }

      this.preload($image);

      if (href) return href;
      return $image.attr('src');
    },

    preload : function ($image) {
      this
        .img($image.closest('li').next())
        .img($image.closest('li').prev());
    },

    img : function (img) {
      if (img.length) {
        var new_img = new Image(),
            new_a = this.S('a', img);

        if (new_a.length) {
          new_img.src = new_a.attr('href');
        } else {
          new_img.src = this.S('img', img).attr('src');
        }
      }
      return this;
    },

    // image caption

    caption : function (container, $image) {
      var caption = $image.attr('data-caption');

      if (caption) {
        container
          .html(caption)
          .show();
      } else {
        container
          .text('')
          .hide();
      }
      return this;
    }, 

    // directional methods

    go : function ($ul, direction) {
      var current = this.S('.visible', $ul),
          target = current[direction]();

      // Check for skip selector.
      if (this.settings.skip_selector && target.find(this.settings.skip_selector).length != 0) {
        target = target[direction]();
      }

      if (target.length) {
        this.S('img', target)
          .trigger('click', [current, target]).trigger('click.fndtn.clearing', [current, target])
          .trigger('change.fndtn.clearing');
      }
    },

    shift : function (current, target, callback) {
      var clearing = target.parent(),
          old_index = this.settings.prev_index || target.index(),
          direction = this.direction(clearing, current, target),
          dir = this.rtl ? 'right' : 'left',
          left = parseInt(clearing.css('left'), 10),
          width = target.outerWidth(),
          skip_shift;

      var dir_obj = {};

      // we use jQuery animate instead of CSS transitions because we
      // need a callback to unlock the next animation
      // needs support for RTL **
      if (target.index() !== old_index && !/skip/.test(direction)){
        if (/left/.test(direction)) {
          this.lock();
          dir_obj[dir] = left + width;
          clearing.animate(dir_obj, 300, this.unlock());
        } else if (/right/.test(direction)) {
          this.lock();
          dir_obj[dir] = left - width;
          clearing.animate(dir_obj, 300, this.unlock());
        }
      } else if (/skip/.test(direction)) {
        // the target image is not adjacent to the current image, so
        // do we scroll right or not
        skip_shift = target.index() - this.settings.up_count;
        this.lock();

        if (skip_shift > 0) {
          dir_obj[dir] = -(skip_shift * width);
          clearing.animate(dir_obj, 300, this.unlock());
        } else {
          dir_obj[dir] = 0;
          clearing.animate(dir_obj, 300, this.unlock());
        }
      }

      callback();
    },

    direction : function ($el, current, target) {
      var lis = this.S('li', $el),
          li_width = lis.outerWidth() + (lis.outerWidth() / 4),
          up_count = Math.floor(this.S('.clearing-container').outerWidth() / li_width) - 1,
          target_index = lis.index(target),
          response;

      this.settings.up_count = up_count;

      if (this.adjacent(this.settings.prev_index, target_index)) {
        if ((target_index > up_count) && target_index > this.settings.prev_index) {
          response = 'right';
        } else if ((target_index > up_count - 1) && target_index <= this.settings.prev_index) {
          response = 'left';
        } else {
          response = false;
        }
      } else {
        response = 'skip';
      }

      this.settings.prev_index = target_index;

      return response;
    },

    adjacent : function (current_index, target_index) {
      for (var i = target_index + 1; i >= target_index - 1; i--) {
        if (i === current_index) return true;
      }
      return false;
    },

    // lock management

    lock : function () {
      this.settings.locked = true;
    },

    unlock : function () {
      this.settings.locked = false;
    },

    locked : function () {
      return this.settings.locked;
    },

    off : function () {
      this.S(this.scope).off('.fndtn.clearing');
      this.S(window).off('.fndtn.clearing');
    },

    reflow : function () {
      this.init();
    }
  };

}(jQuery, window, window.document));
;(function ($, window, document, undefined) {
  'use strict';

  Foundation.libs.dropdown = {
    name : 'dropdown',

    version : '5.4.5',

    settings : {
      active_class: 'open',
      mega_class: 'mega',
      align: 'bottom',
      is_hover: false,
      opened: function(){},
      closed: function(){}
    },

    init : function (scope, method, options) {
      Foundation.inherit(this, 'throttle');

      this.bindings(method, options);
    },

    events : function (scope) {
      var self = this,
          S = self.S;

      S(this.scope)
        .off('.dropdown')
        .on('click.fndtn.dropdown', '[' + this.attr_name() + ']', function (e) {
          var settings = S(this).data(self.attr_name(true) + '-init') || self.settings;
          if (!settings.is_hover || Modernizr.touch) {
            e.preventDefault();
            self.toggle($(this));
          }
        })
        .on('mouseenter.fndtn.dropdown', '[' + this.attr_name() + '], [' + this.attr_name() + '-content]', function (e) {
          var $this = S(this),
              dropdown,
              target;

          clearTimeout(self.timeout);

          if ($this.data(self.data_attr())) {
            dropdown = S('#' + $this.data(self.data_attr()));
            target = $this;
          } else {
            dropdown = $this;
            target = S("[" + self.attr_name() + "='" + dropdown.attr('id') + "']");
          }

          var settings = target.data(self.attr_name(true) + '-init') || self.settings;

          if(S(e.target).data(self.data_attr()) && settings.is_hover) {
            self.closeall.call(self);
          }

          if (settings.is_hover) self.open.apply(self, [dropdown, target]);
        })
        .on('mouseleave.fndtn.dropdown', '[' + this.attr_name() + '], [' + this.attr_name() + '-content]', function (e) {
          var $this = S(this);
          self.timeout = setTimeout(function () {
            if ($this.data(self.data_attr())) {
              var settings = $this.data(self.data_attr(true) + '-init') || self.settings;
              if (settings.is_hover) self.close.call(self, S('#' + $this.data(self.data_attr())));
            } else {
              var target   = S('[' + self.attr_name() + '="' + S(this).attr('id') + '"]'),
                  settings = target.data(self.attr_name(true) + '-init') || self.settings;
              if (settings.is_hover) self.close.call(self, $this);
            }
          }.bind(this), 150);
        })
        .on('click.fndtn.dropdown', function (e) {
          var parent = S(e.target).closest('[' + self.attr_name() + '-content]');

          if (S(e.target).closest('[' + self.attr_name() + ']').length > 0) {
            return;
          }
          if (!(S(e.target).data('revealId')) &&
            (parent.length > 0 && (S(e.target).is('[' + self.attr_name() + '-content]') ||
              $.contains(parent.first()[0], e.target)))) {
            e.stopPropagation();
            return;
          }

          self.close.call(self, S('[' + self.attr_name() + '-content]'));
        })
        .on('opened.fndtn.dropdown', '[' + self.attr_name() + '-content]', function () {
            self.settings.opened.call(this);
        })
        .on('closed.fndtn.dropdown', '[' + self.attr_name() + '-content]', function () {
            self.settings.closed.call(this);
        });

      S(window)
        .off('.dropdown')
        .on('resize.fndtn.dropdown', self.throttle(function () {
          self.resize.call(self);
        }, 50));

      this.resize();
    },

    close: function (dropdown) {
      var self = this;
      dropdown.each(function () {
        var original_target = $('[' + self.attr_name() + '=' + dropdown[0].id + ']') || $('aria-controls=' + dropdown[0].id+ ']');
        original_target.attr('aria-expanded', "false");
        if (self.S(this).hasClass(self.settings.active_class)) {
          self.S(this)
            .css(Foundation.rtl ? 'right':'left', '-99999px')
            .attr('aria-hidden', "true")
            .removeClass(self.settings.active_class)
            .prev('[' + self.attr_name() + ']')
            .removeClass(self.settings.active_class)
            .removeData('target');

          self.S(this).trigger('closed').trigger('closed.fndtn.dropdown', [dropdown]);
        }
      });
    },

    closeall: function() {
      var self = this;
      $.each(self.S('[' + this.attr_name() + '-content]'), function() {
        self.close.call(self, self.S(this));
      });
    },

    open: function (dropdown, target) {
        this
          .css(dropdown
            .addClass(this.settings.active_class), target);
        dropdown.prev('[' + this.attr_name() + ']').addClass(this.settings.active_class);
        dropdown.data('target', target.get(0)).trigger('opened').trigger('opened.fndtn.dropdown', [dropdown, target]);
        dropdown.attr('aria-hidden', 'false');
        target.attr('aria-expanded', 'true');
        dropdown.focus();
    },

    data_attr: function () {
      if (this.namespace.length > 0) {
        return this.namespace + '-' + this.name;
      }

      return this.name;
    },

    toggle : function (target) {
      var dropdown = this.S('#' + target.data(this.data_attr()));
      if (dropdown.length === 0) {
        // No dropdown found, not continuing
        return;
      }

      this.close.call(this, this.S('[' + this.attr_name() + '-content]').not(dropdown));

      if (dropdown.hasClass(this.settings.active_class)) {
        this.close.call(this, dropdown);
        if (dropdown.data('target') !== target.get(0))
          this.open.call(this, dropdown, target);
      } else {
        this.open.call(this, dropdown, target);
      }
    },

    resize : function () {
      var dropdown = this.S('[' + this.attr_name() + '-content].open'),
          target = this.S("[" + this.attr_name() + "='" + dropdown.attr('id') + "']");

      if (dropdown.length && target.length) {
        this.css(dropdown, target);
      }
    },

    css : function (dropdown, target) {
      var left_offset = Math.max((target.width() - dropdown.width()) / 2, 8),
          settings = target.data(this.attr_name(true) + '-init') || this.settings;

      this.clear_idx();

      if (this.small()) {
        var p = this.dirs.bottom.call(dropdown, target, settings);

        dropdown.attr('style', '').removeClass('drop-left drop-right drop-top').css({
          position : 'absolute',
          width: '95%',
          'max-width': 'none',
          top: p.top
        });

        dropdown.css(Foundation.rtl ? 'right':'left', left_offset);
      } else {

        this.style(dropdown, target, settings);
      }

      return dropdown;
    },

    style : function (dropdown, target, settings) {
      var css = $.extend({position: 'absolute'},
        this.dirs[settings.align].call(dropdown, target, settings));

      dropdown.attr('style', '').css(css);
    },

    // return CSS property object
    // `this` is the dropdown
    dirs : {
      // Calculate target offset
      _base : function (t) {
        var o_p = this.offsetParent(),
            o = o_p.offset(),
            p = t.offset();

        p.top -= o.top;
        p.left -= o.left;

        return p;
      },
      top: function (t, s) {
        var self = Foundation.libs.dropdown,
            p = self.dirs._base.call(this, t);

        this.addClass('drop-top');

        if (t.outerWidth() < this.outerWidth() || self.small() || this.hasClass(s.mega_menu)) {
          self.adjust_pip(this,t,s,p);
        }

        if (Foundation.rtl) {
          return {left: p.left - this.outerWidth() + t.outerWidth(),
            top: p.top - this.outerHeight()};
        }

        return {left: p.left, top: p.top - this.outerHeight()};
      },
      bottom: function (t,s) {
        var self = Foundation.libs.dropdown,
            p = self.dirs._base.call(this, t);

        if (t.outerWidth() < this.outerWidth() || self.small() || this.hasClass(s.mega_menu)) {
          self.adjust_pip(this,t,s,p);
        }

        if (self.rtl) {
          return {left: p.left - this.outerWidth() + t.outerWidth(), top: p.top + t.outerHeight()};
        }

        return {left: p.left, top: p.top + t.outerHeight()};
      },
      left: function (t, s) {
        var p = Foundation.libs.dropdown.dirs._base.call(this, t);

        this.addClass('drop-left');

        return {left: p.left - this.outerWidth(), top: p.top};
      },
      right: function (t, s) {
        var p = Foundation.libs.dropdown.dirs._base.call(this, t);

        this.addClass('drop-right');

        return {left: p.left + t.outerWidth(), top: p.top};
      }
    },

    // Insert rule to style psuedo elements
    adjust_pip : function (dropdown,target,settings,position) {
      var sheet = Foundation.stylesheet,
          pip_offset_base = 8;

      if (dropdown.hasClass(settings.mega_class)) {
        pip_offset_base = position.left + (target.outerWidth()/2) - 8;
      }
      else if (this.small()) {
        pip_offset_base += position.left - 8;
      }

      this.rule_idx = sheet.cssRules.length;

      var sel_before = '.f-dropdown.open:before',
          sel_after  = '.f-dropdown.open:after',
          css_before = 'left: ' + pip_offset_base + 'px;',
          css_after  = 'left: ' + (pip_offset_base - 1) + 'px;';

      if (sheet.insertRule) {
        sheet.insertRule([sel_before, '{', css_before, '}'].join(' '), this.rule_idx);
        sheet.insertRule([sel_after, '{', css_after, '}'].join(' '), this.rule_idx + 1);
      } else {
        sheet.addRule(sel_before, css_before, this.rule_idx);
        sheet.addRule(sel_after, css_after, this.rule_idx + 1);
      }
    },

    // Remove old dropdown rule index
    clear_idx : function () {
      var sheet = Foundation.stylesheet;

      if (this.rule_idx) {
        sheet.deleteRule(this.rule_idx);
        sheet.deleteRule(this.rule_idx);
        delete this.rule_idx;
      }
    },

    small : function () {
      return matchMedia(Foundation.media_queries.small).matches &&
        !matchMedia(Foundation.media_queries.medium).matches;
    },

    off: function () {
      this.S(this.scope).off('.fndtn.dropdown');
      this.S('html, body').off('.fndtn.dropdown');
      this.S(window).off('.fndtn.dropdown');
      this.S('[data-dropdown-content]').off('.fndtn.dropdown');
    },

    reflow : function () {}
  };
}(jQuery, window, window.document));
;(function ($, window, document, undefined) {
  'use strict';

  Foundation.libs.interchange = {
    name : 'interchange',

    version : '5.4.5',

    cache : {},

    images_loaded : false,
    nodes_loaded : false,

    settings : {
      load_attr : 'interchange',

      named_queries : {
        'default' : 'only screen',
        small : Foundation.media_queries.small,
        medium : Foundation.media_queries.medium,
        large : Foundation.media_queries.large,
        xlarge : Foundation.media_queries.xlarge,
        xxlarge: Foundation.media_queries.xxlarge,
        landscape : 'only screen and (orientation: landscape)',
        portrait : 'only screen and (orientation: portrait)',
        retina : 'only screen and (-webkit-min-device-pixel-ratio: 2),' +
          'only screen and (min--moz-device-pixel-ratio: 2),' +
          'only screen and (-o-min-device-pixel-ratio: 2/1),' +
          'only screen and (min-device-pixel-ratio: 2),' +
          'only screen and (min-resolution: 192dpi),' +
          'only screen and (min-resolution: 2dppx)'
      },

      directives : {
        replace: function (el, path, trigger) {
          // The trigger argument, if called within the directive, fires
          // an event named after the directive on the element, passing
          // any parameters along to the event that you pass to trigger.
          //
          // ex. trigger(), trigger([a, b, c]), or trigger(a, b, c)
          //
          // This allows you to bind a callback like so:
          // $('#interchangeContainer').on('replace', function (e, a, b, c) {
          //   console.log($(this).html(), a, b, c);
          // });

          if (/IMG/.test(el[0].nodeName)) {
            var orig_path = el[0].src;

            if (new RegExp(path, 'i').test(orig_path)) return;

            el[0].src = path;

            return trigger(el[0].src);
          }
          var last_path = el.data(this.data_attr + '-last-path'),
              self = this;

          if (last_path == path) return;

          if (/\.(gif|jpg|jpeg|tiff|png)([?#].*)?/i.test(path)) {
            $(el).css('background-image', 'url('+path+')');
            el.data('interchange-last-path', path);
            return trigger(path);
          }

          return $.get(path, function (response) {
            el.html(response);
            el.data(self.data_attr + '-last-path', path);
            trigger();
          });

        }
      }
    },

    init : function (scope, method, options) {
      Foundation.inherit(this, 'throttle random_str');

      this.data_attr = this.set_data_attr();
      $.extend(true, this.settings, method, options);
      this.bindings(method, options);
      this.load('images');
      this.load('nodes');
    },

    get_media_hash : function() {
        var mediaHash='';
        for (var queryName in this.settings.named_queries ) {
            mediaHash += matchMedia(this.settings.named_queries[queryName]).matches.toString();
        }
        return mediaHash;
    },

    events : function () {
      var self = this, prevMediaHash;

      $(window)
        .off('.interchange')
        .on('resize.fndtn.interchange', self.throttle(function () {
            var currMediaHash = self.get_media_hash();
            if (currMediaHash !== prevMediaHash) {
                self.resize();
            }
            prevMediaHash = currMediaHash;
        }, 50));

      return this;
    },

    resize : function () {
      var cache = this.cache;

      if(!this.images_loaded || !this.nodes_loaded) {
        setTimeout($.proxy(this.resize, this), 50);
        return;
      }

      for (var uuid in cache) {
        if (cache.hasOwnProperty(uuid)) {
          var passed = this.results(uuid, cache[uuid]);

          if (passed) {
            this.settings.directives[passed
              .scenario[1]].call(this, passed.el, passed.scenario[0], function () {
                if (arguments[0] instanceof Array) { 
                  var args = arguments[0];
                } else { 
                  var args = Array.prototype.slice.call(arguments, 0);
                }

                passed.el.trigger(passed.scenario[1], args);
              });
          }
        }
      }

    },

    results : function (uuid, scenarios) {
      var count = scenarios.length;

      if (count > 0) {
        var el = this.S('[' + this.add_namespace('data-uuid') + '="' + uuid + '"]');

        while (count--) {
          var mq, rule = scenarios[count][2];
          if (this.settings.named_queries.hasOwnProperty(rule)) {
            mq = matchMedia(this.settings.named_queries[rule]);
          } else {
            mq = matchMedia(rule);
          }
          if (mq.matches) {
            return {el: el, scenario: scenarios[count]};
          }
        }
      }

      return false;
    },

    load : function (type, force_update) {
      if (typeof this['cached_' + type] === 'undefined' || force_update) {
        this['update_' + type]();
      }

      return this['cached_' + type];
    },

    update_images : function () {
      var images = this.S('img[' + this.data_attr + ']'),
          count = images.length,
          i = count,
          loaded_count = 0,
          data_attr = this.data_attr;

      this.cache = {};
      this.cached_images = [];
      this.images_loaded = (count === 0);

      while (i--) {
        loaded_count++;
        if (images[i]) {
          var str = images[i].getAttribute(data_attr) || '';

          if (str.length > 0) {
            this.cached_images.push(images[i]);
          }
        }

        if (loaded_count === count) {
          this.images_loaded = true;
          this.enhance('images');
        }
      }

      return this;
    },

    update_nodes : function () {
      var nodes = this.S('[' + this.data_attr + ']').not('img'),
          count = nodes.length,
          i = count,
          loaded_count = 0,
          data_attr = this.data_attr;

      this.cached_nodes = [];
      this.nodes_loaded = (count === 0);


      while (i--) {
        loaded_count++;
        var str = nodes[i].getAttribute(data_attr) || '';

        if (str.length > 0) {
          this.cached_nodes.push(nodes[i]);
        }

        if(loaded_count === count) {
          this.nodes_loaded = true;
          this.enhance('nodes');
        }
      }

      return this;
    },

    enhance : function (type) {
      var i = this['cached_' + type].length;

      while (i--) {
        this.object($(this['cached_' + type][i]));
      }

      return $(window).trigger('resize').trigger('resize.fndtn.interchange');
    },

    convert_directive : function (directive) {

      var trimmed = this.trim(directive);

      if (trimmed.length > 0) {
        return trimmed;
      }

      return 'replace';
    },

    parse_scenario : function (scenario) {
      // This logic had to be made more complex since some users were using commas in the url path
      // So we cannot simply just split on a comma
      var directive_match = scenario[0].match(/(.+),\s*(\w+)\s*$/),
      media_query         = scenario[1];

      if (directive_match) {
        var path  = directive_match[1],
        directive = directive_match[2];
      }
      else {
        var cached_split = scenario[0].split(/,\s*$/),
        path             = cached_split[0],
        directive        = '';               
      }

      return [this.trim(path), this.convert_directive(directive), this.trim(media_query)];
    },

    object : function(el) {
      var raw_arr = this.parse_data_attr(el),
          scenarios = [], 
          i = raw_arr.length;

      if (i > 0) {
        while (i--) {
          var split = raw_arr[i].split(/\((.*?)(\))$/);

          if (split.length > 1) {
            var params = this.parse_scenario(split);
            scenarios.push(params);
          }
        }
      }

      return this.store(el, scenarios);
    },

    store : function (el, scenarios) {
      var uuid = this.random_str(),
          current_uuid = el.data(this.add_namespace('uuid', true));

      if (this.cache[current_uuid]) return this.cache[current_uuid];

      el.attr(this.add_namespace('data-uuid'), uuid);

      return this.cache[uuid] = scenarios;
    },

    trim : function(str) {

      if (typeof str === 'string') {
        return $.trim(str);
      }

      return str;
    },

    set_data_attr: function (init) {
      if (init) {
        if (this.namespace.length > 0) {
          return this.namespace + '-' + this.settings.load_attr;
        }

        return this.settings.load_attr;
      }

      if (this.namespace.length > 0) {
        return 'data-' + this.namespace + '-' + this.settings.load_attr;
      }

      return 'data-' + this.settings.load_attr;
    },

    parse_data_attr : function (el) {
      var raw = el.attr(this.attr_name()).split(/\[(.*?)\]/),
          i = raw.length, 
          output = [];

      while (i--) {
        if (raw[i].replace(/[\W\d]+/, '').length > 4) {
          output.push(raw[i]);
        }
      }

      return output;
    },

    reflow : function () {
      this.load('images', true);
      this.load('nodes', true);
    }

  };

}(jQuery, window, window.document));
;(function ($, window, document, undefined) {
  'use strict';

  var Modernizr = Modernizr || false;

  Foundation.libs.joyride = {
    name : 'joyride',

    version : '5.4.5',

    defaults : {
      expose                   : false,     // turn on or off the expose feature
      modal                    : true,      // Whether to cover page with modal during the tour
      keyboard                 : true,      // enable left, right and esc keystrokes
      tip_location             : 'bottom',  // 'top' or 'bottom' in relation to parent
      nub_position             : 'auto',    // override on a per tooltip bases
      scroll_speed             : 1500,      // Page scrolling speed in milliseconds, 0 = no scroll animation
      scroll_animation         : 'linear',  // supports 'swing' and 'linear', extend with jQuery UI.
      timer                    : 0,         // 0 = no timer , all other numbers = timer in milliseconds
      start_timer_on_click     : true,      // true or false - true requires clicking the first button start the timer
      start_offset             : 0,         // the index of the tooltip you want to start on (index of the li)
      next_button              : true,      // true or false to control whether a next button is used
      prev_button              : true,      // true or false to control whether a prev button is used
      tip_animation            : 'fade',    // 'pop' or 'fade' in each tip
      pause_after              : [],        // array of indexes where to pause the tour after
      exposed                  : [],        // array of expose elements
      tip_animation_fade_speed : 300,       // when tipAnimation = 'fade' this is speed in milliseconds for the transition
      cookie_monster           : false,     // true or false to control whether cookies are used
      cookie_name              : 'joyride', // Name the cookie you'll use
      cookie_domain            : false,     // Will this cookie be attached to a domain, ie. '.notableapp.com'
      cookie_expires           : 365,       // set when you would like the cookie to expire.
      tip_container            : 'body',    // Where will the tip be attached
      abort_on_close           : true,      // When true, the close event will not fire any callback
      tip_location_patterns    : {
        top: ['bottom'],
        bottom: [], // bottom should not need to be repositioned
        left: ['right', 'top', 'bottom'],
        right: ['left', 'top', 'bottom']
      },
      post_ride_callback     : function (){},    // A method to call once the tour closes (canceled or complete)
      post_step_callback     : function (){},    // A method to call after each step
      pre_step_callback      : function (){},    // A method to call before each step
      pre_ride_callback      : function (){},    // A method to call before the tour starts (passed index, tip, and cloned exposed element)
      post_expose_callback   : function (){},    // A method to call after an element has been exposed
      template : { // HTML segments for tip layout
        link          : '<a href="#close" class="joyride-close-tip">&times;</a>',
        timer         : '<div class="joyride-timer-indicator-wrap"><span class="joyride-timer-indicator"></span></div>',
        tip           : '<div class="joyride-tip-guide"><span class="joyride-nub"></span></div>',
        wrapper       : '<div class="joyride-content-wrapper"></div>',
        button        : '<a href="#" class="small button joyride-next-tip"></a>',
        prev_button   : '<a href="#" class="small button joyride-prev-tip"></a>',
        modal         : '<div class="joyride-modal-bg"></div>',
        expose        : '<div class="joyride-expose-wrapper"></div>',
        expose_cover  : '<div class="joyride-expose-cover"></div>'
      },
      expose_add_class : '' // One or more space-separated class names to be added to exposed element
    },

    init : function (scope, method, options) {
      Foundation.inherit(this, 'throttle random_str');

      this.settings = this.settings || $.extend({}, this.defaults, (options || method));

      this.bindings(method, options)
    },

    go_next : function() {
      if (this.settings.$li.next().length < 1) {
        this.end();
      } else if (this.settings.timer > 0) {
        clearTimeout(this.settings.automate);
        this.hide();
        this.show();
        this.startTimer();
      } else {
        this.hide();
        this.show();
      }
    },

    go_prev : function() {
      if (this.settings.$li.prev().length < 1) {
        // Do nothing if there are no prev element
      } else if (this.settings.timer > 0) {
        clearTimeout(this.settings.automate);
        this.hide();
        this.show(null, true);
        this.startTimer();
      } else {
        this.hide();
        this.show(null, true);
      }
    },

    events : function () {
      var self = this;

      $(this.scope)
        .off('.joyride')
        .on('click.fndtn.joyride', '.joyride-next-tip, .joyride-modal-bg', function (e) {
          e.preventDefault();
          this.go_next()
        }.bind(this))
        .on('click.fndtn.joyride', '.joyride-prev-tip', function (e) {
          e.preventDefault();
          this.go_prev();
        }.bind(this))

        .on('click.fndtn.joyride', '.joyride-close-tip', function (e) {
          e.preventDefault();
          this.end(this.settings.abort_on_close);
        }.bind(this))

        .on("keyup.joyride", function(e) {
          if (!this.settings.keyboard) return;

          switch (e.which) {
            case 39: // right arrow
              e.preventDefault();
              this.go_next();
              break;
            case 37: // left arrow
              e.preventDefault();
              this.go_prev();
              break;
            case 27: // escape
              e.preventDefault();
              this.end(this.settings.abort_on_close);
          }
        }.bind(this));

      $(window)
        .off('.joyride')
        .on('resize.fndtn.joyride', self.throttle(function () {
          if ($('[' + self.attr_name() + ']').length > 0 && self.settings.$next_tip && self.settings.riding) {
            if (self.settings.exposed.length > 0) {
              var $els = $(self.settings.exposed);

              $els.each(function () {
                var $this = $(this);
                self.un_expose($this);
                self.expose($this);
              });
            }

            if (self.is_phone()) {
              self.pos_phone();
            } else {
              self.pos_default(false);
            }
          }
        }, 100));
    },

    start : function () {
      var self = this,
          $this = $('[' + this.attr_name() + ']', this.scope),
          integer_settings = ['timer', 'scrollSpeed', 'startOffset', 'tipAnimationFadeSpeed', 'cookieExpires'],
          int_settings_count = integer_settings.length;

      if (!$this.length > 0) return;

      if (!this.settings.init) this.events();

      this.settings = $this.data(this.attr_name(true) + '-init');

      // non configureable settings
      this.settings.$content_el = $this;
      this.settings.$body = $(this.settings.tip_container);
      this.settings.body_offset = $(this.settings.tip_container).position();
      this.settings.$tip_content = this.settings.$content_el.find('> li');
      this.settings.paused = false;
      this.settings.attempts = 0;
      this.settings.riding = true;

      // can we create cookies?
      if (typeof $.cookie !== 'function') {
        this.settings.cookie_monster = false;
      }

      // generate the tips and insert into dom.
      if (!this.settings.cookie_monster || this.settings.cookie_monster && !$.cookie(this.settings.cookie_name)) {
        this.settings.$tip_content.each(function (index) {
          var $this = $(this);
          this.settings = $.extend({}, self.defaults, self.data_options($this));

          // Make sure that settings parsed from data_options are integers where necessary
          var i = int_settings_count;
          while (i--) {
            self.settings[integer_settings[i]] = parseInt(self.settings[integer_settings[i]], 10);
          }
          self.create({$li : $this, index : index});
        });

        // show first tip
        if (!this.settings.start_timer_on_click && this.settings.timer > 0) {
          this.show('init');
          this.startTimer();
        } else {
          this.show('init');
        }

      }
    },

    resume : function () {
      this.set_li();
      this.show();
    },

    tip_template : function (opts) {
      var $blank, content;

      opts.tip_class = opts.tip_class || '';

      $blank = $(this.settings.template.tip).addClass(opts.tip_class);
      content = $.trim($(opts.li).html()) +
        this.prev_button_text(opts.prev_button_text, opts.index) +
        this.button_text(opts.button_text) +
        this.settings.template.link +
        this.timer_instance(opts.index);

      $blank.append($(this.settings.template.wrapper));
      $blank.first().attr(this.add_namespace('data-index'), opts.index);
      $('.joyride-content-wrapper', $blank).append(content);

      return $blank[0];
    },

    timer_instance : function (index) {
      var txt;

      if ((index === 0 && this.settings.start_timer_on_click && this.settings.timer > 0) || this.settings.timer === 0) {
        txt = '';
      } else {
        txt = $(this.settings.template.timer)[0].outerHTML;
      }
      return txt;
    },

    button_text : function (txt) {
      if (this.settings.tip_settings.next_button) {
        txt = $.trim(txt) || 'Next';
        txt = $(this.settings.template.button).append(txt)[0].outerHTML;
      } else {
        txt = '';
      }
      return txt;
    },

    prev_button_text : function (txt, idx) {
      if (this.settings.tip_settings.prev_button) {
        txt = $.trim(txt) || 'Previous';

        // Add the disabled class to the button if it's the first element
        if (idx == 0)
          txt = $(this.settings.template.prev_button).append(txt).addClass('disabled')[0].outerHTML;
        else
          txt = $(this.settings.template.prev_button).append(txt)[0].outerHTML;
      } else {
        txt = '';
      }
      return txt;
    },

    create : function (opts) {
      this.settings.tip_settings = $.extend({}, this.settings, this.data_options(opts.$li));
      var buttonText = opts.$li.attr(this.add_namespace('data-button'))
        || opts.$li.attr(this.add_namespace('data-text')),
          prevButtonText = opts.$li.attr(this.add_namespace('data-button-prev'))
        || opts.$li.attr(this.add_namespace('data-prev-text')),
        tipClass = opts.$li.attr('class'),
        $tip_content = $(this.tip_template({
          tip_class : tipClass,
          index : opts.index,
          button_text : buttonText,
          prev_button_text : prevButtonText,
          li : opts.$li
        }));

      $(this.settings.tip_container).append($tip_content);
    },

    show : function (init, is_prev) {
      var $timer = null;

      // are we paused?
      if (this.settings.$li === undefined
        || ($.inArray(this.settings.$li.index(), this.settings.pause_after) === -1)) {

        // don't go to the next li if the tour was paused
        if (this.settings.paused) {
          this.settings.paused = false;
        } else {
          this.set_li(init, is_prev);
        }

        this.settings.attempts = 0;

        if (this.settings.$li.length && this.settings.$target.length > 0) {
          if (init) { //run when we first start
            this.settings.pre_ride_callback(this.settings.$li.index(), this.settings.$next_tip);
            if (this.settings.modal) {
              this.show_modal();
            }
          }

          this.settings.pre_step_callback(this.settings.$li.index(), this.settings.$next_tip);

          if (this.settings.modal && this.settings.expose) {
            this.expose();
          }

          this.settings.tip_settings = $.extend({}, this.settings, this.data_options(this.settings.$li));

          this.settings.timer = parseInt(this.settings.timer, 10);

          this.settings.tip_settings.tip_location_pattern = this.settings.tip_location_patterns[this.settings.tip_settings.tip_location];

          // scroll if not modal
          if (!/body/i.test(this.settings.$target.selector)) {
            this.scroll_to();
          }

          if (this.is_phone()) {
            this.pos_phone(true);
          } else {
            this.pos_default(true);
          }

          $timer = this.settings.$next_tip.find('.joyride-timer-indicator');

          if (/pop/i.test(this.settings.tip_animation)) {

            $timer.width(0);

            if (this.settings.timer > 0) {

              this.settings.$next_tip.show();

              setTimeout(function () {
                $timer.animate({
                  width: $timer.parent().width()
                }, this.settings.timer, 'linear');
              }.bind(this), this.settings.tip_animation_fade_speed);

            } else {
              this.settings.$next_tip.show();

            }


          } else if (/fade/i.test(this.settings.tip_animation)) {

            $timer.width(0);

            if (this.settings.timer > 0) {

              this.settings.$next_tip
                .fadeIn(this.settings.tip_animation_fade_speed)
                .show();

              setTimeout(function () {
                $timer.animate({
                  width: $timer.parent().width()
                }, this.settings.timer, 'linear');
              }.bind(this), this.settings.tip_animation_fade_speed);

            } else {
              this.settings.$next_tip.fadeIn(this.settings.tip_animation_fade_speed);
            }
          }

          this.settings.$current_tip = this.settings.$next_tip;

        // skip non-existant targets
        } else if (this.settings.$li && this.settings.$target.length < 1) {

          this.show();

        } else {

          this.end();

        }
      } else {

        this.settings.paused = true;

      }

    },

    is_phone : function () {
      return matchMedia(Foundation.media_queries.small).matches &&
        !matchMedia(Foundation.media_queries.medium).matches;
    },

    hide : function () {
      if (this.settings.modal && this.settings.expose) {
        this.un_expose();
      }

      if (!this.settings.modal) {
        $('.joyride-modal-bg').hide();
      }

      // Prevent scroll bouncing...wait to remove from layout
      this.settings.$current_tip.css('visibility', 'hidden');
      setTimeout($.proxy(function() {
        this.hide();
        this.css('visibility', 'visible');
      }, this.settings.$current_tip), 0);
      this.settings.post_step_callback(this.settings.$li.index(),
        this.settings.$current_tip);
    },

    set_li : function (init, is_prev) {
      if (init) {
        this.settings.$li = this.settings.$tip_content.eq(this.settings.start_offset);
        this.set_next_tip();
        this.settings.$current_tip = this.settings.$next_tip;
      } else {
        if (is_prev)
          this.settings.$li = this.settings.$li.prev();
        else
          this.settings.$li = this.settings.$li.next();
        this.set_next_tip();
      }

      this.set_target();
    },

    set_next_tip : function () {
      this.settings.$next_tip = $(".joyride-tip-guide").eq(this.settings.$li.index());
      this.settings.$next_tip.data('closed', '');
    },

    set_target : function () {
      var cl = this.settings.$li.attr(this.add_namespace('data-class')),
          id = this.settings.$li.attr(this.add_namespace('data-id')),
          $sel = function () {
            if (id) {
              return $(document.getElementById(id));
            } else if (cl) {
              return $('.' + cl).first();
            } else {
              return $('body');
            }
          };

      this.settings.$target = $sel();
    },

    scroll_to : function () {
      var window_half, tipOffset;

      window_half = $(window).height() / 2;
      tipOffset = Math.ceil(this.settings.$target.offset().top - window_half + this.settings.$next_tip.outerHeight());

      if (tipOffset != 0) {
        $('html, body').stop().animate({
          scrollTop: tipOffset
        }, this.settings.scroll_speed, 'swing');
      }
    },

    paused : function () {
      return ($.inArray((this.settings.$li.index() + 1), this.settings.pause_after) === -1);
    },

    restart : function () {
      this.hide();
      this.settings.$li = undefined;
      this.show('init');
    },

    pos_default : function (init) {
      var $nub = this.settings.$next_tip.find('.joyride-nub'),
          nub_width = Math.ceil($nub.outerWidth() / 2),
          nub_height = Math.ceil($nub.outerHeight() / 2),
          toggle = init || false;

      // tip must not be "display: none" to calculate position
      if (toggle) {
        this.settings.$next_tip.css('visibility', 'hidden');
        this.settings.$next_tip.show();
      }

      if (!/body/i.test(this.settings.$target.selector)) {
      	  var topAdjustment = this.settings.tip_settings.tipAdjustmentY ? parseInt(this.settings.tip_settings.tipAdjustmentY) : 0,
			        leftAdjustment = this.settings.tip_settings.tipAdjustmentX ? parseInt(this.settings.tip_settings.tipAdjustmentX) : 0;

          if (this.bottom()) {
            if (this.rtl) {
              this.settings.$next_tip.css({
                top: (this.settings.$target.offset().top + nub_height + this.settings.$target.outerHeight() + topAdjustment),
                left: this.settings.$target.offset().left + this.settings.$target.outerWidth() - this.settings.$next_tip.outerWidth() + leftAdjustment});
            } else {
              this.settings.$next_tip.css({
                top: (this.settings.$target.offset().top + nub_height + this.settings.$target.outerHeight() + topAdjustment),
                left: this.settings.$target.offset().left + leftAdjustment});
            }

            this.nub_position($nub, this.settings.tip_settings.nub_position, 'top');

          } else if (this.top()) {
            if (this.rtl) {
              this.settings.$next_tip.css({
                top: (this.settings.$target.offset().top - this.settings.$next_tip.outerHeight() - nub_height + topAdjustment),
                left: this.settings.$target.offset().left + this.settings.$target.outerWidth() - this.settings.$next_tip.outerWidth()});
            } else {
              this.settings.$next_tip.css({
                top: (this.settings.$target.offset().top - this.settings.$next_tip.outerHeight() - nub_height + topAdjustment),
                left: this.settings.$target.offset().left + leftAdjustment});
            }

            this.nub_position($nub, this.settings.tip_settings.nub_position, 'bottom');

          } else if (this.right()) {

            this.settings.$next_tip.css({
              top: this.settings.$target.offset().top + topAdjustment,
              left: (this.settings.$target.outerWidth() + this.settings.$target.offset().left + nub_width + leftAdjustment)});

            this.nub_position($nub, this.settings.tip_settings.nub_position, 'left');

          } else if (this.left()) {

            this.settings.$next_tip.css({
              top: this.settings.$target.offset().top + topAdjustment,
              left: (this.settings.$target.offset().left - this.settings.$next_tip.outerWidth() - nub_width + leftAdjustment)});

            this.nub_position($nub, this.settings.tip_settings.nub_position, 'right');

          }

          if (!this.visible(this.corners(this.settings.$next_tip)) && this.settings.attempts < this.settings.tip_settings.tip_location_pattern.length) {

            $nub.removeClass('bottom')
              .removeClass('top')
              .removeClass('right')
              .removeClass('left');

            this.settings.tip_settings.tip_location = this.settings.tip_settings.tip_location_pattern[this.settings.attempts];

            this.settings.attempts++;

            this.pos_default();

          }

      } else if (this.settings.$li.length) {

        this.pos_modal($nub);

      }

      if (toggle) {
        this.settings.$next_tip.hide();
        this.settings.$next_tip.css('visibility', 'visible');
      }

    },

    pos_phone : function (init) {
      var tip_height = this.settings.$next_tip.outerHeight(),
          tip_offset = this.settings.$next_tip.offset(),
          target_height = this.settings.$target.outerHeight(),
          $nub = $('.joyride-nub', this.settings.$next_tip),
          nub_height = Math.ceil($nub.outerHeight() / 2),
          toggle = init || false;

      $nub.removeClass('bottom')
        .removeClass('top')
        .removeClass('right')
        .removeClass('left');

      if (toggle) {
        this.settings.$next_tip.css('visibility', 'hidden');
        this.settings.$next_tip.show();
      }

      if (!/body/i.test(this.settings.$target.selector)) {

        if (this.top()) {

            this.settings.$next_tip.offset({top: this.settings.$target.offset().top - tip_height - nub_height});
            $nub.addClass('bottom');

        } else {

          this.settings.$next_tip.offset({top: this.settings.$target.offset().top + target_height + nub_height});
          $nub.addClass('top');

        }

      } else if (this.settings.$li.length) {
        this.pos_modal($nub);
      }

      if (toggle) {
        this.settings.$next_tip.hide();
        this.settings.$next_tip.css('visibility', 'visible');
      }
    },

    pos_modal : function ($nub) {
      this.center();
      $nub.hide();

      this.show_modal();
    },

    show_modal : function () {
      if (!this.settings.$next_tip.data('closed')) {
        var joyridemodalbg =  $('.joyride-modal-bg');
        if (joyridemodalbg.length < 1) {
          $('body').append(this.settings.template.modal).show();
        }

        if (/pop/i.test(this.settings.tip_animation)) {
            joyridemodalbg.show();
        } else {
            joyridemodalbg.fadeIn(this.settings.tip_animation_fade_speed);
        }
      }
    },

    expose : function () {
      var expose,
          exposeCover,
          el,
          origCSS,
          origClasses,
          randId = 'expose-' + this.random_str(6);

      if (arguments.length > 0 && arguments[0] instanceof $) {
        el = arguments[0];
      } else if(this.settings.$target && !/body/i.test(this.settings.$target.selector)){
        el = this.settings.$target;
      }  else {
        return false;
      }

      if(el.length < 1){
        if(window.console){
          console.error('element not valid', el);
        }
        return false;
      }

      expose = $(this.settings.template.expose);
      this.settings.$body.append(expose);
      expose.css({
        top: el.offset().top,
        left: el.offset().left,
        width: el.outerWidth(true),
        height: el.outerHeight(true)
      });

      exposeCover = $(this.settings.template.expose_cover);

      origCSS = {
        zIndex: el.css('z-index'),
        position: el.css('position')
      };

      origClasses = el.attr('class') == null ? '' : el.attr('class');

      el.css('z-index',parseInt(expose.css('z-index'))+1);

      if (origCSS.position == 'static') {
        el.css('position','relative');
      }

      el.data('expose-css',origCSS);
      el.data('orig-class', origClasses);
      el.attr('class', origClasses + ' ' + this.settings.expose_add_class);

      exposeCover.css({
        top: el.offset().top,
        left: el.offset().left,
        width: el.outerWidth(true),
        height: el.outerHeight(true)
      });

      if (this.settings.modal) this.show_modal();

      this.settings.$body.append(exposeCover);
      expose.addClass(randId);
      exposeCover.addClass(randId);
      el.data('expose', randId);
      this.settings.post_expose_callback(this.settings.$li.index(), this.settings.$next_tip, el);
      this.add_exposed(el);
    },

    un_expose : function () {
      var exposeId,
          el,
          expose ,
          origCSS,
          origClasses,
          clearAll = false;

      if (arguments.length > 0 && arguments[0] instanceof $) {
        el = arguments[0];
      } else if(this.settings.$target && !/body/i.test(this.settings.$target.selector)){
        el = this.settings.$target;
      }  else {
        return false;
      }

      if(el.length < 1){
        if (window.console) {
          console.error('element not valid', el);
        }
        return false;
      }

      exposeId = el.data('expose');
      expose = $('.' + exposeId);

      if (arguments.length > 1) {
        clearAll = arguments[1];
      }

      if (clearAll === true) {
        $('.joyride-expose-wrapper,.joyride-expose-cover').remove();
      } else {
        expose.remove();
      }

      origCSS = el.data('expose-css');

      if (origCSS.zIndex == 'auto') {
        el.css('z-index', '');
      } else {
        el.css('z-index', origCSS.zIndex);
      }

      if (origCSS.position != el.css('position')) {
        if(origCSS.position == 'static') {// this is default, no need to set it.
          el.css('position', '');
        } else {
          el.css('position', origCSS.position);
        }
      }

      origClasses = el.data('orig-class');
      el.attr('class', origClasses);
      el.removeData('orig-classes');

      el.removeData('expose');
      el.removeData('expose-z-index');
      this.remove_exposed(el);
    },

    add_exposed: function(el){
      this.settings.exposed = this.settings.exposed || [];
      if (el instanceof $ || typeof el === 'object') {
        this.settings.exposed.push(el[0]);
      } else if (typeof el == 'string') {
        this.settings.exposed.push(el);
      }
    },

    remove_exposed: function(el){
      var search, i;
      if (el instanceof $) {
        search = el[0]
      } else if (typeof el == 'string'){
        search = el;
      }

      this.settings.exposed = this.settings.exposed || [];
      i = this.settings.exposed.length;

      while (i--) {
        if (this.settings.exposed[i] == search) {
          this.settings.exposed.splice(i, 1);
          return;
        }
      }
    },

    center : function () {
      var $w = $(window);

      this.settings.$next_tip.css({
        top : ((($w.height() - this.settings.$next_tip.outerHeight()) / 2) + $w.scrollTop()),
        left : ((($w.width() - this.settings.$next_tip.outerWidth()) / 2) + $w.scrollLeft())
      });

      return true;
    },

    bottom : function () {
      return /bottom/i.test(this.settings.tip_settings.tip_location);
    },

    top : function () {
      return /top/i.test(this.settings.tip_settings.tip_location);
    },

    right : function () {
      return /right/i.test(this.settings.tip_settings.tip_location);
    },

    left : function () {
      return /left/i.test(this.settings.tip_settings.tip_location);
    },

    corners : function (el) {
      var w = $(window),
          window_half = w.height() / 2,
          //using this to calculate since scroll may not have finished yet.
          tipOffset = Math.ceil(this.settings.$target.offset().top - window_half + this.settings.$next_tip.outerHeight()),
          right = w.width() + w.scrollLeft(),
          offsetBottom =  w.height() + tipOffset,
          bottom = w.height() + w.scrollTop(),
          top = w.scrollTop();

      if (tipOffset < top) {
        if (tipOffset < 0) {
          top = 0;
        } else {
          top = tipOffset;
        }
      }

      if (offsetBottom > bottom) {
        bottom = offsetBottom;
      }

      return [
        el.offset().top < top,
        right < el.offset().left + el.outerWidth(),
        bottom < el.offset().top + el.outerHeight(),
        w.scrollLeft() > el.offset().left
      ];
    },

    visible : function (hidden_corners) {
      var i = hidden_corners.length;

      while (i--) {
        if (hidden_corners[i]) return false;
      }

      return true;
    },

    nub_position : function (nub, pos, def) {
      if (pos === 'auto') {
        nub.addClass(def);
      } else {
        nub.addClass(pos);
      }
    },

    startTimer : function () {
      if (this.settings.$li.length) {
        this.settings.automate = setTimeout(function () {
          this.hide();
          this.show();
          this.startTimer();
        }.bind(this), this.settings.timer);
      } else {
        clearTimeout(this.settings.automate);
      }
    },

    end : function (abort) {
      if (this.settings.cookie_monster) {
        $.cookie(this.settings.cookie_name, 'ridden', { expires: this.settings.cookie_expires, domain: this.settings.cookie_domain });
      }

      if (this.settings.timer > 0) {
        clearTimeout(this.settings.automate);
      }

      if (this.settings.modal && this.settings.expose) {
        this.un_expose();
      }

      // Unplug keystrokes listener
      $(this.scope).off('keyup.joyride')

      this.settings.$next_tip.data('closed', true);
      this.settings.riding = false;

      $('.joyride-modal-bg').hide();
      this.settings.$current_tip.hide();

      if (typeof abort === 'undefined' || abort === false) {
        this.settings.post_step_callback(this.settings.$li.index(), this.settings.$current_tip);
        this.settings.post_ride_callback(this.settings.$li.index(), this.settings.$current_tip);
      }

      $('.joyride-tip-guide').remove();
    },

    off : function () {
      $(this.scope).off('.joyride');
      $(window).off('.joyride');
      $('.joyride-close-tip, .joyride-next-tip, .joyride-modal-bg').off('.joyride');
      $('.joyride-tip-guide, .joyride-modal-bg').remove();
      clearTimeout(this.settings.automate);
      this.settings = {};
    },

    reflow : function () {}
  };
}(jQuery, window, window.document));
;(function ($, window, document, undefined) {
  'use strict';

  Foundation.libs['magellan-expedition'] = {
    name : 'magellan-expedition',

    version : '5.4.5',

    settings : {
      active_class: 'active',
      threshold: 0, // pixels from the top of the expedition for it to become fixes
      destination_threshold: 20, // pixels from the top of destination for it to be considered active
      throttle_delay: 30, // calculation throttling to increase framerate
      fixed_top: 0 // top distance in pixels assigend to the fixed element on scroll
    },

    init : function (scope, method, options) {
      Foundation.inherit(this, 'throttle');
      this.bindings(method, options);
    },

    events : function () {
      var self = this,
          S = self.S,
          settings = self.settings;

      // initialize expedition offset
      self.set_expedition_position();

      S(self.scope)
        .off('.magellan')
        .on('click.fndtn.magellan', '[' + self.add_namespace('data-magellan-arrival') + '] a[href^="#"]', function (e) {
          e.preventDefault();
          var expedition = $(this).closest('[' + self.attr_name() + ']'),
              settings = expedition.data('magellan-expedition-init'),
              hash = this.hash.split('#').join(''),
              target = $("a[name='"+hash+"']");

          if (target.length === 0) {
            target = $('#'+hash);

          }


          // Account for expedition height if fixed position
          var scroll_top = target.offset().top - settings.destination_threshold + 1;
          scroll_top = scroll_top - expedition.outerHeight();

          $('html, body').stop().animate({
            'scrollTop': scroll_top
          }, 700, 'swing', function () {
            if(history.pushState) {
              history.pushState(null, null, '#'+hash);
            }
            else {
              location.hash = '#'+hash;
            }
          });
        })
        .on('scroll.fndtn.magellan', self.throttle(this.check_for_arrivals.bind(this), settings.throttle_delay));

      $(window)
        .on('resize.fndtn.magellan', self.throttle(this.set_expedition_position.bind(this), settings.throttle_delay));
    },

    check_for_arrivals : function() {
      var self = this;
      self.update_arrivals();
      self.update_expedition_positions();
    },

    set_expedition_position : function() {
      var self = this;
      $('[' + this.attr_name() + '=fixed]', self.scope).each(function(idx, el) {
        var expedition = $(this),
            settings = expedition.data('magellan-expedition-init'),
            styles = expedition.attr('styles'), // save styles
            top_offset, fixed_top;

        expedition.attr('style', '');
        top_offset = expedition.offset().top + settings.threshold;

        //set fixed-top by attribute
        fixed_top = parseInt(expedition.data('magellan-fixed-top'));
        if(!isNaN(fixed_top))
            self.settings.fixed_top = fixed_top;

        expedition.data(self.data_attr('magellan-top-offset'), top_offset);
        expedition.attr('style', styles);
      });
    },

    update_expedition_positions : function() {
      var self = this,
          window_top_offset = $(window).scrollTop();

      $('[' + this.attr_name() + '=fixed]', self.scope).each(function() {
        var expedition = $(this),
            settings = expedition.data('magellan-expedition-init'),
            styles = expedition.attr('style'), // save styles
            top_offset = expedition.data('magellan-top-offset');

        //scroll to the top distance
        if (window_top_offset+self.settings.fixed_top >= top_offset) {
          // Placeholder allows height calculations to be consistent even when
          // appearing to switch between fixed/non-fixed placement
          var placeholder = expedition.prev('[' + self.add_namespace('data-magellan-expedition-clone') + ']');
          if (placeholder.length === 0) {
            placeholder = expedition.clone();
            placeholder.removeAttr(self.attr_name());
            placeholder.attr(self.add_namespace('data-magellan-expedition-clone'),'');
            expedition.before(placeholder);
          }
          expedition.css({position:'fixed', top: settings.fixed_top}).addClass('fixed');
        } else {
          expedition.prev('[' + self.add_namespace('data-magellan-expedition-clone') + ']').remove();
          expedition.attr('style',styles).css('position','').css('top','').removeClass('fixed');
        }
      });
    },

    update_arrivals : function() {
      var self = this,
          window_top_offset = $(window).scrollTop();

      $('[' + this.attr_name() + ']', self.scope).each(function() {
        var expedition = $(this),
            settings = expedition.data(self.attr_name(true) + '-init'),
            offsets = self.offsets(expedition, window_top_offset),
            arrivals = expedition.find('[' + self.add_namespace('data-magellan-arrival') + ']'),
            active_item = false;
        offsets.each(function(idx, item) {
          if (item.viewport_offset >= item.top_offset) {
            var arrivals = expedition.find('[' + self.add_namespace('data-magellan-arrival') + ']');
            arrivals.not(item.arrival).removeClass(settings.active_class);
            item.arrival.addClass(settings.active_class);
            active_item = true;
            return true;
          }
        });

        if (!active_item) arrivals.removeClass(settings.active_class);
      });
    },

    offsets : function(expedition, window_offset) {
      var self = this,
          settings = expedition.data(self.attr_name(true) + '-init'),
          viewport_offset = window_offset;

      return expedition.find('[' + self.add_namespace('data-magellan-arrival') + ']').map(function(idx, el) {
        var name = $(this).data(self.data_attr('magellan-arrival')),
            dest = $('[' + self.add_namespace('data-magellan-destination') + '=' + name + ']');
        if (dest.length > 0) {
          var top_offset = Math.floor(dest.offset().top - settings.destination_threshold - expedition.outerHeight());
          return {
            destination : dest,
            arrival : $(this),
            top_offset : top_offset,
            viewport_offset : viewport_offset
          }
        }
      }).sort(function(a, b) {
        if (a.top_offset < b.top_offset) return -1;
        if (a.top_offset > b.top_offset) return 1;
        return 0;
      });
    },

    data_attr: function (str) {
      if (this.namespace.length > 0) {
        return this.namespace + '-' + str;
      }

      return str;
    },

    off : function () {
      this.S(this.scope).off('.magellan');
      this.S(window).off('.magellan');
    },

    reflow : function () {
      var self = this;
      // remove placeholder expeditions used for height calculation purposes
      $('[' + self.add_namespace('data-magellan-expedition-clone') + ']', self.scope).remove();
    }
  };
}(jQuery, window, window.document));
;(function ($, window, document, undefined) {
  'use strict';

  Foundation.libs.offcanvas = {
    name : 'offcanvas',

    version : '5.4.5',

    settings : {
      open_method: 'move',
      close_on_click: false
    },

    init : function (scope, method, options) {
      this.bindings(method, options);
    },

    events : function () {
      var self = this,
          S = self.S,
          move_class = '',
          right_postfix = '',
          left_postfix = '';

      if (this.settings.open_method === 'move') {
        move_class = 'move-';
        right_postfix = 'right';
        left_postfix = 'left';
      } else if (this.settings.open_method === 'overlap_single') {
        move_class = 'offcanvas-overlap-';
        right_postfix = 'right';
        left_postfix = 'left';
      } else if (this.settings.open_method === 'overlap') {
        move_class = 'offcanvas-overlap';
      }

      S(this.scope).off('.offcanvas')
        .on('click.fndtn.offcanvas', '.left-off-canvas-toggle', function (e) {
          self.click_toggle_class(e, move_class + right_postfix);
          if (self.settings.open_method !== 'overlap'){
            S(".left-submenu").removeClass(move_class + right_postfix);
          }
          $('.left-off-canvas-toggle').attr('aria-expanded', 'true');
        })
        .on('click.fndtn.offcanvas', '.left-off-canvas-menu a', function (e) {
          var settings = self.get_settings(e);
          var parent = S(this).parent();

          if(settings.close_on_click && !parent.hasClass("has-submenu") && !parent.hasClass("back")){
            self.hide.call(self, move_class + right_postfix, self.get_wrapper(e));
            parent.parent().removeClass(move_class + right_postfix);
          }else if(S(this).parent().hasClass("has-submenu")){
            e.preventDefault();
            S(this).siblings(".left-submenu").toggleClass(move_class + right_postfix);
          }else if(parent.hasClass("back")){
            e.preventDefault();
            parent.parent().removeClass(move_class + right_postfix);
          }
          $('.left-off-canvas-toggle').attr('aria-expanded', 'true');
        })
        .on('click.fndtn.offcanvas', '.right-off-canvas-toggle', function (e) {
          self.click_toggle_class(e, move_class + left_postfix);
          if (self.settings.open_method !== 'overlap'){
            S(".right-submenu").removeClass(move_class + left_postfix);
          }
          $('.right-off-canvas-toggle').attr('aria-expanded', 'true');
        })
        .on('click.fndtn.offcanvas', '.right-off-canvas-menu a', function (e) {
          var settings = self.get_settings(e);
          var parent = S(this).parent();

          if(settings.close_on_click && !parent.hasClass("has-submenu") && !parent.hasClass("back")){
            self.hide.call(self, move_class + left_postfix, self.get_wrapper(e));
            parent.parent().removeClass(move_class + left_postfix);
          }else if(S(this).parent().hasClass("has-submenu")){
            e.preventDefault();
            S(this).siblings(".right-submenu").toggleClass(move_class + left_postfix);
          }else if(parent.hasClass("back")){
            e.preventDefault();
            parent.parent().removeClass(move_class + left_postfix);
          }
          $('.right-off-canvas-toggle').attr('aria-expanded', 'true');
        })
        .on('click.fndtn.offcanvas', '.exit-off-canvas', function (e) {
          self.click_remove_class(e, move_class + left_postfix);
          S(".right-submenu").removeClass(move_class + left_postfix);
          if (right_postfix){
            self.click_remove_class(e, move_class + right_postfix);
            S(".left-submenu").removeClass(move_class + left_postfix);
          }
          $('.right-off-canvas-toggle').attr('aria-expanded', 'true');
        })
        .on('click.fndtn.offcanvas', '.exit-off-canvas', function (e) {
          self.click_remove_class(e, move_class + left_postfix);
          $('.left-off-canvas-toggle').attr('aria-expanded', 'false');
          if (right_postfix) {
            self.click_remove_class(e, move_class + right_postfix);
            $('.right-off-canvas-toggle').attr('aria-expanded', "false");
          }
        });
    },

    toggle: function(class_name, $off_canvas) {
      $off_canvas = $off_canvas || this.get_wrapper();
      if ($off_canvas.is('.' + class_name)) {
        this.hide(class_name, $off_canvas);
      } else {
        this.show(class_name, $off_canvas);
      }
    },

    show: function(class_name, $off_canvas) {
      $off_canvas = $off_canvas || this.get_wrapper();
      $off_canvas.trigger('open').trigger('open.fndtn.offcanvas');
      $off_canvas.addClass(class_name);
    },

    hide: function(class_name, $off_canvas) {
      $off_canvas = $off_canvas || this.get_wrapper();
      $off_canvas.trigger('close').trigger('close.fndtn.offcanvas');
      $off_canvas.removeClass(class_name);
    },

    click_toggle_class: function(e, class_name) {
      e.preventDefault();
      var $off_canvas = this.get_wrapper(e);
      this.toggle(class_name, $off_canvas);
    },

    click_remove_class: function(e, class_name) {
      e.preventDefault();
      var $off_canvas = this.get_wrapper(e);
      this.hide(class_name, $off_canvas);
    },

    get_settings: function(e) {
      var offcanvas  = this.S(e.target).closest('[' + this.attr_name() + ']');
      return offcanvas.data(this.attr_name(true) + '-init') || this.settings;
    },

    get_wrapper: function(e) {
      var $off_canvas = this.S(e ? e.target : this.scope).closest('.off-canvas-wrap');

      if ($off_canvas.length === 0) {
        $off_canvas = this.S('.off-canvas-wrap');
      }
      return $off_canvas;
    },

    reflow : function () {}
  };
}(jQuery, window, window.document));
;(function ($, window, document, undefined) {
  'use strict';

  var noop = function() {};

  var Orbit = function(el, settings) {
    // Don't reinitialize plugin
    if (el.hasClass(settings.slides_container_class)) {
      return this;
    }

    var self = this,
        container,
        slides_container = el,
        number_container,
        bullets_container,
        timer_container,
        idx = 0,
        animate,
        timer,
        locked = false,
        adjust_height_after = false;


    self.slides = function() {
      return slides_container.children(settings.slide_selector);
    };

    self.slides().first().addClass(settings.active_slide_class);

    self.update_slide_number = function(index) {
      if (settings.slide_number) {
        number_container.find('span:first').text(parseInt(index)+1);
        number_container.find('span:last').text(self.slides().length);
      }
      if (settings.bullets) {
        bullets_container.children().removeClass(settings.bullets_active_class);
        $(bullets_container.children().get(index)).addClass(settings.bullets_active_class);
      }
    };

    self.update_active_link = function(index) {
      var link = $('[data-orbit-link="'+self.slides().eq(index).attr('data-orbit-slide')+'"]');
      link.siblings().removeClass(settings.bullets_active_class);
      link.addClass(settings.bullets_active_class);
    };

    self.build_markup = function() {
      slides_container.wrap('<div class="'+settings.container_class+'"></div>');
      container = slides_container.parent();
      slides_container.addClass(settings.slides_container_class);

      if (settings.stack_on_small) {
        container.addClass(settings.stack_on_small_class);
      }

      if (settings.navigation_arrows) {
        container.append($('<a href="#"><span></span></a>').addClass(settings.prev_class));
        container.append($('<a href="#"><span></span></a>').addClass(settings.next_class));
      }

      if (settings.timer) {
        timer_container = $('<div>').addClass(settings.timer_container_class);
        timer_container.append('<span>');
        timer_container.append($('<div>').addClass(settings.timer_progress_class));
        timer_container.addClass(settings.timer_paused_class);
        container.append(timer_container);
      }

      if (settings.slide_number) {
        number_container = $('<div>').addClass(settings.slide_number_class);
        number_container.append('<span></span> ' + settings.slide_number_text + ' <span></span>');
        container.append(number_container);
      }

      if (settings.bullets) {
        bullets_container = $('<ol>').addClass(settings.bullets_container_class);
        container.append(bullets_container);
        bullets_container.wrap('<div class="orbit-bullets-container"></div>');
        self.slides().each(function(idx, el) {
          var bullet = $('<li>').attr('data-orbit-slide', idx).on('click', self.link_bullet);;
          bullets_container.append(bullet);
        });
      }

    };

    self._goto = function(next_idx, start_timer) {
      // if (locked) {return false;}
      if (next_idx === idx) {return false;}
      if (typeof timer === 'object') {timer.restart();}
      var slides = self.slides();

      var dir = 'next';
      locked = true;
      if (next_idx < idx) {dir = 'prev';}
      if (next_idx >= slides.length) {
        if (!settings.circular) return false;
        next_idx = 0;
      } else if (next_idx < 0) {
        if (!settings.circular) return false;
        next_idx = slides.length - 1;
      }

      var current = $(slides.get(idx));
      var next = $(slides.get(next_idx));

      current.css('zIndex', 2);
      current.removeClass(settings.active_slide_class);
      next.css('zIndex', 4).addClass(settings.active_slide_class);

      slides_container.trigger('before-slide-change.fndtn.orbit');
      settings.before_slide_change();
      self.update_active_link(next_idx);

      var callback = function() {
        var unlock = function() {
          idx = next_idx;
          locked = false;
          if (start_timer === true) {timer = self.create_timer(); timer.start();}
          self.update_slide_number(idx);
          slides_container.trigger('after-slide-change.fndtn.orbit',[{slide_number: idx, total_slides: slides.length}]);
          settings.after_slide_change(idx, slides.length);
        };
        if (slides_container.height() != next.height() && settings.variable_height) {
          slides_container.animate({'height': next.height()}, 250, 'linear', unlock);
        } else {
          unlock();
        }
      };

      if (slides.length === 1) {callback(); return false;}

      var start_animation = function() {
        if (dir === 'next') {animate.next(current, next, callback);}
        if (dir === 'prev') {animate.prev(current, next, callback);}
      };

      if (next.height() > slides_container.height() && settings.variable_height) {
        slides_container.animate({'height': next.height()}, 250, 'linear', start_animation);
      } else {
        start_animation();
      }
    };

    self.next = function(e) {
      e.stopImmediatePropagation();
      e.preventDefault();
      self._goto(idx + 1);
    };

    self.prev = function(e) {
      e.stopImmediatePropagation();
      e.preventDefault();
      self._goto(idx - 1);
    };

    self.link_custom = function(e) {
      e.preventDefault();
      var link = $(this).attr('data-orbit-link');
      if ((typeof link === 'string') && (link = $.trim(link)) != "") {
        var slide = container.find('[data-orbit-slide='+link+']');
        if (slide.index() != -1) {self._goto(slide.index());}
      }
    };

    self.link_bullet = function(e) {
      var index = $(this).attr('data-orbit-slide');
      if ((typeof index === 'string') && (index = $.trim(index)) != "") {
        if(isNaN(parseInt(index)))
        {
          var slide = container.find('[data-orbit-slide='+index+']');
          if (slide.index() != -1) {self._goto(slide.index() + 1);}
        }
        else
        {
          self._goto(parseInt(index));
        }
      }

    }

    self.timer_callback = function() {
      self._goto(idx + 1, true);
    }

    self.compute_dimensions = function() {
      var current = $(self.slides().get(idx));
      var h = current.height();
      if (!settings.variable_height) {
        self.slides().each(function(){
          if ($(this).height() > h) { h = $(this).height(); }
        });
      }
      slides_container.height(h);
    };

    self.create_timer = function() {
      var t = new Timer(
        container.find('.'+settings.timer_container_class),
        settings,
        self.timer_callback
      );
      return t;
    };

    self.stop_timer = function() {
      if (typeof timer === 'object') timer.stop();
    };

    self.toggle_timer = function() {
      var t = container.find('.'+settings.timer_container_class);
      if (t.hasClass(settings.timer_paused_class)) {
        if (typeof timer === 'undefined') {timer = self.create_timer();}
        timer.start();
      }
      else {
        if (typeof timer === 'object') {timer.stop();}
      }
    };

    self.init = function() {
      self.build_markup();
      if (settings.timer) {
        timer = self.create_timer();
        Foundation.utils.image_loaded(this.slides().children('img'), timer.start);
      }
      animate = new FadeAnimation(settings, slides_container);
      if (settings.animation === 'slide')
        animate = new SlideAnimation(settings, slides_container);

      container.on('click', '.'+settings.next_class, self.next);
      container.on('click', '.'+settings.prev_class, self.prev);

      if (settings.next_on_click) {
        container.on('click', '.'+settings.slides_container_class+' [data-orbit-slide]', self.link_bullet);
      }

      container.on('click', self.toggle_timer);
      if (settings.swipe) {
        container.on('touchstart.fndtn.orbit', function(e) {
          if (!e.touches) {e = e.originalEvent;}
          var data = {
            start_page_x: e.touches[0].pageX,
            start_page_y: e.touches[0].pageY,
            start_time: (new Date()).getTime(),
            delta_x: 0,
            is_scrolling: undefined
          };
          container.data('swipe-transition', data);
          e.stopPropagation();
        })
        .on('touchmove.fndtn.orbit', function(e) {
          if (!e.touches) { e = e.originalEvent; }
          // Ignore pinch/zoom events
          if(e.touches.length > 1 || e.scale && e.scale !== 1) return;

          var data = container.data('swipe-transition');
          if (typeof data === 'undefined') {data = {};}

          data.delta_x = e.touches[0].pageX - data.start_page_x;

          if ( typeof data.is_scrolling === 'undefined') {
            data.is_scrolling = !!( data.is_scrolling || Math.abs(data.delta_x) < Math.abs(e.touches[0].pageY - data.start_page_y) );
          }

          if (!data.is_scrolling && !data.active) {
            e.preventDefault();
            var direction = (data.delta_x < 0) ? (idx+1) : (idx-1);
            data.active = true;
            self._goto(direction);
          }
        })
        .on('touchend.fndtn.orbit', function(e) {
          container.data('swipe-transition', {});
          e.stopPropagation();
        })
      }
      container.on('mouseenter.fndtn.orbit', function(e) {
        if (settings.timer && settings.pause_on_hover) {
          self.stop_timer();
        }
      })
      .on('mouseleave.fndtn.orbit', function(e) {
        if (settings.timer && settings.resume_on_mouseout) {
          timer.start();
        }
      });

      $(document).on('click', '[data-orbit-link]', self.link_custom);
      $(window).on('load resize', self.compute_dimensions);
      Foundation.utils.image_loaded(this.slides().children('img'), self.compute_dimensions);
      Foundation.utils.image_loaded(this.slides().children('img'), function() {
        container.prev('.'+settings.preloader_class).css('display', 'none');
        self.update_slide_number(0);
        self.update_active_link(0);
        slides_container.trigger('ready.fndtn.orbit');
      });
    };

    self.init();
  };

  var Timer = function(el, settings, callback) {
    var self = this,
        duration = settings.timer_speed,
        progress = el.find('.'+settings.timer_progress_class),
        start,
        timeout,
        left = -1;

    this.update_progress = function(w) {
      var new_progress = progress.clone();
      new_progress.attr('style', '');
      new_progress.css('width', w+'%');
      progress.replaceWith(new_progress);
      progress = new_progress;
    };

    this.restart = function() {
      clearTimeout(timeout);
      el.addClass(settings.timer_paused_class);
      left = -1;
      self.update_progress(0);
    };

    this.start = function() {
      if (!el.hasClass(settings.timer_paused_class)) {return true;}
      left = (left === -1) ? duration : left;
      el.removeClass(settings.timer_paused_class);
      start = new Date().getTime();
      progress.animate({'width': '100%'}, left, 'linear');
      timeout = setTimeout(function() {
        self.restart();
        callback();
      }, left);
      el.trigger('timer-started.fndtn.orbit')
    };

    this.stop = function() {
      if (el.hasClass(settings.timer_paused_class)) {return true;}
      clearTimeout(timeout);
      el.addClass(settings.timer_paused_class);
      var end = new Date().getTime();
      left = left - (end - start);
      var w = 100 - ((left / duration) * 100);
      self.update_progress(w);
      el.trigger('timer-stopped.fndtn.orbit');
    };
  };

  var SlideAnimation = function(settings, container) {
    var duration = settings.animation_speed;
    var is_rtl = ($('html[dir=rtl]').length === 1);
    var margin = is_rtl ? 'marginRight' : 'marginLeft';
    var animMargin = {};
    animMargin[margin] = '0%';

    this.next = function(current, next, callback) {
      current.animate({marginLeft:'-100%'}, duration);
      next.animate(animMargin, duration, function() {
        current.css(margin, '100%');
        callback();
      });
    };

    this.prev = function(current, prev, callback) {
      current.animate({marginLeft:'100%'}, duration);
      prev.css(margin, '-100%');
      prev.animate(animMargin, duration, function() {
        current.css(margin, '100%');
        callback();
      });
    };
  };

  var FadeAnimation = function(settings, container) {
    var duration = settings.animation_speed;
    var is_rtl = ($('html[dir=rtl]').length === 1);
    var margin = is_rtl ? 'marginRight' : 'marginLeft';

    this.next = function(current, next, callback) {
      next.css({'margin':'0%', 'opacity':'0.01'});
      next.animate({'opacity':'1'}, duration, 'linear', function() {
        current.css('margin', '100%');
        callback();
      });
    };

    this.prev = function(current, prev, callback) {
      prev.css({'margin':'0%', 'opacity':'0.01'});
      prev.animate({'opacity':'1'}, duration, 'linear', function() {
        current.css('margin', '100%');
        callback();
      });
    };
  };


  Foundation.libs = Foundation.libs || {};

  Foundation.libs.orbit = {
    name: 'orbit',

    version: '5.4.5',

    settings: {
      animation: 'slide',
      timer_speed: 10000,
      pause_on_hover: true,
      resume_on_mouseout: false,
      next_on_click: true,
      animation_speed: 500,
      stack_on_small: false,
      navigation_arrows: true,
      slide_number: true,
      slide_number_text: 'of',
      container_class: 'orbit-container',
      stack_on_small_class: 'orbit-stack-on-small',
      next_class: 'orbit-next',
      prev_class: 'orbit-prev',
      timer_container_class: 'orbit-timer',
      timer_paused_class: 'paused',
      timer_progress_class: 'orbit-progress',
      slides_container_class: 'orbit-slides-container',
      preloader_class: 'preloader',
      slide_selector: '*',
      bullets_container_class: 'orbit-bullets',
      bullets_active_class: 'active',
      slide_number_class: 'orbit-slide-number',
      caption_class: 'orbit-caption',
      active_slide_class: 'active',
      orbit_transition_class: 'orbit-transitioning',
      bullets: true,
      circular: true,
      timer: true,
      variable_height: false,
      swipe: true,
      before_slide_change: noop,
      after_slide_change: noop
    },

    init : function (scope, method, options) {
      var self = this;
      this.bindings(method, options);
    },

    events : function (instance) {
      var orbit_instance = new Orbit(this.S(instance), this.S(instance).data('orbit-init'));
      this.S(instance).data(this.name + '-instance', orbit_instance);
    },

    reflow : function () {
      var self = this;

      if (self.S(self.scope).is('[data-orbit]')) {
        var $el = self.S(self.scope);
        var instance = $el.data(self.name + '-instance');
        instance.compute_dimensions();
      } else {
        self.S('[data-orbit]', self.scope).each(function(idx, el) {
          var $el = self.S(el);
          var opts = self.data_options($el);
          var instance = $el.data(self.name + '-instance');
          instance.compute_dimensions();
        });
      }
    }
  };


}(jQuery, window, window.document));
;(function ($, window, document, undefined) {
  'use strict';

  Foundation.libs.reveal = {
    name : 'reveal',

    version : '5.4.5',

    locked : false,

    settings : {
      animation: 'fadeAndPop',
      animation_speed: 250,
      close_on_background_click: true,
      close_on_esc: true,
      dismiss_modal_class: 'close-reveal-modal',
      bg_class: 'reveal-modal-bg',
      root_element: 'body',
      open: function(){},
      opened: function(){},
      close: function(){},
      closed: function(){},
      bg : $('.reveal-modal-bg'),
      css : {
        open : {
          'opacity': 0,
          'visibility': 'visible',
          'display' : 'block'
        },
        close : {
          'opacity': 1,
          'visibility': 'hidden',
          'display': 'none'
        }
      }
    },

    init : function (scope, method, options) {
      $.extend(true, this.settings, method, options);
      this.bindings(method, options);
    },

    events : function (scope) {
      var self = this,
          S = self.S;

      S(this.scope)
        .off('.reveal')
        .on('click.fndtn.reveal', '[' + this.add_namespace('data-reveal-id') + ']:not([disabled])', function (e) {
          e.preventDefault();
        
          if (!self.locked) {
            var element = S(this),
                ajax = element.data(self.data_attr('reveal-ajax'));

            self.locked = true;

            if (typeof ajax === 'undefined') {
              self.open.call(self, element);
            } else {
              var url = ajax === true ? element.attr('href') : ajax;

              self.open.call(self, element, {url: url});
            }
          }
        });

      S(document)
        .on('click.fndtn.reveal', this.close_targets(), function (e) {

          e.preventDefault();

          if (!self.locked) {
            var settings = S('[' + self.attr_name() + '].open').data(self.attr_name(true) + '-init'),
                bg_clicked = S(e.target)[0] === S('.' + settings.bg_class)[0];

            if (bg_clicked) {
              if (settings.close_on_background_click) {
                e.stopPropagation();
              } else {
                return;
              }
            }

            self.locked = true;
            self.close.call(self, bg_clicked ? S('[' + self.attr_name() + '].open') : S(this).closest('[' + self.attr_name() + ']'));
          }
        });

      if(S('[' + self.attr_name() + ']', this.scope).length > 0) {
        S(this.scope)
          // .off('.reveal')
          .on('open.fndtn.reveal', this.settings.open)
          .on('opened.fndtn.reveal', this.settings.opened)
          .on('opened.fndtn.reveal', this.open_video)
          .on('close.fndtn.reveal', this.settings.close)
          .on('closed.fndtn.reveal', this.settings.closed)
          .on('closed.fndtn.reveal', this.close_video);
      } else {
        S(this.scope)
          // .off('.reveal')
          .on('open.fndtn.reveal', '[' + self.attr_name() + ']', this.settings.open)
          .on('opened.fndtn.reveal', '[' + self.attr_name() + ']', this.settings.opened)
          .on('opened.fndtn.reveal', '[' + self.attr_name() + ']', this.open_video)
          .on('close.fndtn.reveal', '[' + self.attr_name() + ']', this.settings.close)
          .on('closed.fndtn.reveal', '[' + self.attr_name() + ']', this.settings.closed)
          .on('closed.fndtn.reveal', '[' + self.attr_name() + ']', this.close_video);
      }

      return true;
    },

    // PATCH #3: turning on key up capture only when a reveal window is open
    key_up_on : function (scope) {
      var self = this;

      // PATCH #1: fixing multiple keyup event trigger from single key press
      self.S('body').off('keyup.fndtn.reveal').on('keyup.fndtn.reveal', function ( event ) {
        var open_modal = self.S('[' + self.attr_name() + '].open'),
            settings = open_modal.data(self.attr_name(true) + '-init') || self.settings ;
        // PATCH #2: making sure that the close event can be called only while unlocked,
        //           so that multiple keyup.fndtn.reveal events don't prevent clean closing of the reveal window.
        if ( settings && event.which === 27  && settings.close_on_esc && !self.locked) { // 27 is the keycode for the Escape key
          self.close.call(self, open_modal);
        }
      });

      return true;
    },

    // PATCH #3: turning on key up capture only when a reveal window is open
    key_up_off : function (scope) {
      this.S('body').off('keyup.fndtn.reveal');
      return true;
    },


    open : function (target, ajax_settings) {
      var self = this,
          modal;

      if (target) {
        if (typeof target.selector !== 'undefined') {
          // Find the named node; only use the first one found, since the rest of the code assumes there's only one node
          modal = self.S('#' + target.data(self.data_attr('reveal-id'))).first();
        } else {
          modal = self.S(this.scope);

          ajax_settings = target;
        }
      } else {
        modal = self.S(this.scope);
      }

      var settings = modal.data(self.attr_name(true) + '-init');
      settings = settings || this.settings;


      if (modal.hasClass('open') && target.attr('data-reveal-id') == modal.attr('id')) {
        return self.close(modal);
      }

      if (!modal.hasClass('open')) {
        var open_modal = self.S('[' + self.attr_name() + '].open');

        if (typeof modal.data('css-top') === 'undefined') {
          modal.data('css-top', parseInt(modal.css('top'), 10))
            .data('offset', this.cache_offset(modal));
        }

        this.key_up_on(modal);    // PATCH #3: turning on key up capture only when a reveal window is open
        modal.trigger('open').trigger('open.fndtn.reveal');

        if (open_modal.length < 1) {
          this.toggle_bg(modal, true);
        }

        if (typeof ajax_settings === 'string') {
          ajax_settings = {
            url: ajax_settings
          };
        }

        if (typeof ajax_settings === 'undefined' || !ajax_settings.url) {
          if (open_modal.length > 0) {
            this.hide(open_modal, settings.css.close);
          }

          this.show(modal, settings.css.open);
        } else {
          var old_success = typeof ajax_settings.success !== 'undefined' ? ajax_settings.success : null;

          $.extend(ajax_settings, {
            success: function (data, textStatus, jqXHR) {
              if ( $.isFunction(old_success) ) {
                old_success(data, textStatus, jqXHR);
              }

              modal.html(data);
              self.S(modal).foundation('section', 'reflow');
              self.S(modal).children().foundation();

              if (open_modal.length > 0) {
                self.hide(open_modal, settings.css.close);
              }
              self.show(modal, settings.css.open);
            }
          });

          $.ajax(ajax_settings);
        }
      }
      self.S(window).trigger('resize');
    },

    close : function (modal) {
      var modal = modal && modal.length ? modal : this.S(this.scope),
          open_modals = this.S('[' + this.attr_name() + '].open'),
          settings = modal.data(this.attr_name(true) + '-init') || this.settings;

      if (open_modals.length > 0) {
        this.locked = true;
        this.key_up_off(modal);   // PATCH #3: turning on key up capture only when a reveal window is open
        modal.trigger('close').trigger('close.fndtn.reveal');
        this.toggle_bg(modal, false);
        this.hide(open_modals, settings.css.close, settings);
      }
    },

    close_targets : function () {
      var base = '.' + this.settings.dismiss_modal_class;

      if (this.settings.close_on_background_click) {
        return base + ', .' + this.settings.bg_class;
      }

      return base;
    },

    toggle_bg : function (modal, state) {
      if (this.S('.' + this.settings.bg_class).length === 0) {
        this.settings.bg = $('<div />', {'class': this.settings.bg_class})
          .appendTo('body').hide();
      }

      var visible = this.settings.bg.filter(':visible').length > 0;
      if ( state != visible ) {
        if ( state == undefined ? visible : !state ) {
          this.hide(this.settings.bg);
        } else {
          this.show(this.settings.bg);
        }
      }
    },

    show : function (el, css) {
      // is modal
      if (css) {
        var settings = el.data(this.attr_name(true) + '-init') || this.settings,
            root_element = settings.root_element;

        if (el.parent(root_element).length === 0) {
          var placeholder = el.wrap('<div style="display: none;" />').parent();

          el.on('closed.fndtn.reveal.wrapped', function() {
            el.detach().appendTo(placeholder);
            el.unwrap().unbind('closed.fndtn.reveal.wrapped');
          });

          el.detach().appendTo(root_element);
        }

        var animData = getAnimationData(settings.animation);
        if (!animData.animate) {
          this.locked = false;
        }
        if (animData.pop) {
          css.top = $(window).scrollTop() - el.data('offset') + 'px';
          var end_css = {
            top: $(window).scrollTop() + el.data('css-top') + 'px',
            opacity: 1
          };

          return setTimeout(function () {
            return el
              .css(css)
              .animate(end_css, settings.animation_speed, 'linear', function () {
                this.locked = false;
                el.trigger('opened').trigger('opened.fndtn.reveal');
              }.bind(this))
              .addClass('open');
          }.bind(this), settings.animation_speed / 2);
        }

        if (animData.fade) {
          css.top = $(window).scrollTop() + el.data('css-top') + 'px';
          var end_css = {opacity: 1};

          return setTimeout(function () {
            return el
              .css(css)
              .animate(end_css, settings.animation_speed, 'linear', function () {
                this.locked = false;
                el.trigger('opened').trigger('opened.fndtn.reveal');
              }.bind(this))
              .addClass('open');
          }.bind(this), settings.animation_speed / 2);
        }

        return el.css(css).show().css({opacity: 1}).addClass('open').trigger('opened').trigger('opened.fndtn.reveal');
      }

      var settings = this.settings;

      // should we animate the background?
      if (getAnimationData(settings.animation).fade) {
        return el.fadeIn(settings.animation_speed / 2);
      }

      this.locked = false;

      return el.show();
    },

    hide : function (el, css) {
      // is modal
      if (css) {
        var settings = el.data(this.attr_name(true) + '-init');
        settings = settings || this.settings;

        var animData = getAnimationData(settings.animation);
        if (!animData.animate) {
          this.locked = false;
        }
        if (animData.pop) {
          var end_css = {
            top: - $(window).scrollTop() - el.data('offset') + 'px',
            opacity: 0
          };

          return setTimeout(function () {
            return el
              .animate(end_css, settings.animation_speed, 'linear', function () {
                this.locked = false;
                el.css(css).trigger('closed').trigger('closed.fndtn.reveal');
              }.bind(this))
              .removeClass('open');
          }.bind(this), settings.animation_speed / 2);
        }

        if (animData.fade) {
          var end_css = {opacity: 0};

          return setTimeout(function () {
            return el
              .animate(end_css, settings.animation_speed, 'linear', function () {
                this.locked = false;
                el.css(css).trigger('closed').trigger('closed.fndtn.reveal');
              }.bind(this))
              .removeClass('open');
          }.bind(this), settings.animation_speed / 2);
        }

        return el.hide().css(css).removeClass('open').trigger('closed').trigger('closed.fndtn.reveal');
      }

      var settings = this.settings;

      // should we animate the background?
      if (getAnimationData(settings.animation).fade) {
        return el.fadeOut(settings.animation_speed / 2);
      }

      return el.hide();
    },

    close_video : function (e) {
      var video = $('.flex-video', e.target),
          iframe = $('iframe', video);

      if (iframe.length > 0) {
        iframe.attr('data-src', iframe[0].src);
        iframe.attr('src', iframe.attr('src'));
        video.hide();
      }
    },

    open_video : function (e) {
      var video = $('.flex-video', e.target),
          iframe = video.find('iframe');

      if (iframe.length > 0) {
        var data_src = iframe.attr('data-src');
        if (typeof data_src === 'string') {
          iframe[0].src = iframe.attr('data-src');
        } else {
          var src = iframe[0].src;
          iframe[0].src = undefined;
          iframe[0].src = src;
        }
        video.show();
      }
    },

    data_attr: function (str) {
      if (this.namespace.length > 0) {
        return this.namespace + '-' + str;
      }

      return str;
    },

    cache_offset : function (modal) {
      var offset = modal.show().height() + parseInt(modal.css('top'), 10);

      modal.hide();

      return offset;
    },

    off : function () {
      $(this.scope).off('.fndtn.reveal');
    },

    reflow : function () {}
  };

  /*
   * getAnimationData('popAndFade') // {animate: true,  pop: true,  fade: true}
   * getAnimationData('fade')       // {animate: true,  pop: false, fade: true}
   * getAnimationData('pop')        // {animate: true,  pop: true,  fade: false}
   * getAnimationData('foo')        // {animate: false, pop: false, fade: false}
   * getAnimationData(null)         // {animate: false, pop: false, fade: false}
   */
  function getAnimationData(str) {
    var fade = /fade/i.test(str);
    var pop = /pop/i.test(str);
    return {
      animate: fade || pop,
      pop: pop,
      fade: fade
    };
  }
}(jQuery, window, window.document));
;(function ($, window, document, undefined) {
  'use strict';

  Foundation.libs.slider = {
    name : 'slider',

    version : '5.4.5',

    settings: {
      start: 0,
      end: 100,
      step: 1,
      initial: null,
      display_selector: '',
      vertical: false,
      on_change: function(){}
    },

    cache : {},

    init : function (scope, method, options) {
      Foundation.inherit(this,'throttle');
      this.bindings(method, options);
      this.reflow();
    },

    events : function() {
      var self = this;

      $(this.scope)
        .off('.slider')
        .on('mousedown.fndtn.slider touchstart.fndtn.slider pointerdown.fndtn.slider',
        '[' + self.attr_name() + ']:not(.disabled, [disabled]) .range-slider-handle', function(e) {
          if (!self.cache.active) {
            e.preventDefault();
            self.set_active_slider($(e.target));
          }
        })
        .on('mousemove.fndtn.slider touchmove.fndtn.slider pointermove.fndtn.slider', function(e) {
          if (!!self.cache.active) {
            e.preventDefault();
            if ($.data(self.cache.active[0], 'settings').vertical) {
              var scroll_offset = 0;
              if (!e.pageY) {
                scroll_offset = window.scrollY;
              }
              self.calculate_position(self.cache.active, (e.pageY || 
                                                          e.originalEvent.clientY || 
                                                          e.originalEvent.touches[0].clientY || 
                                                          e.currentPoint.y) 
                                                          + scroll_offset);
            } else {
              self.calculate_position(self.cache.active, e.pageX || 
                                                         e.originalEvent.clientX || 
                                                         e.originalEvent.touches[0].clientX || 
                                                         e.currentPoint.x);
            }
          }
        })
        .on('mouseup.fndtn.slider touchend.fndtn.slider pointerup.fndtn.slider', function(e) {
          self.remove_active_slider();
        })
        .on('change.fndtn.slider', function(e) {
          self.settings.on_change();
        });

      self.S(window)
        .on('resize.fndtn.slider', self.throttle(function(e) {
          self.reflow();
        }, 300));
    },

    set_active_slider : function($handle) {
      this.cache.active = $handle;
    },

    remove_active_slider : function() {
      this.cache.active = null;
    },

    calculate_position : function($handle, cursor_x) {
      var self = this,
          settings = $.data($handle[0], 'settings'),
          handle_l = $.data($handle[0], 'handle_l'),
          handle_o = $.data($handle[0], 'handle_o'),
          bar_l = $.data($handle[0], 'bar_l'),
          bar_o = $.data($handle[0], 'bar_o');

      requestAnimationFrame(function(){
        var pct;

        if (Foundation.rtl && !settings.vertical) {
          pct = self.limit_to(((bar_o+bar_l-cursor_x)/bar_l),0,1);
        } else {
          pct = self.limit_to(((cursor_x-bar_o)/bar_l),0,1);
        }

        pct = settings.vertical ? 1-pct : pct;

        var norm = self.normalized_value(pct, settings.start, settings.end, settings.step);

        self.set_ui($handle, norm);
      });
    },

    set_ui : function($handle, value) {
      var settings = $.data($handle[0], 'settings'),
          handle_l = $.data($handle[0], 'handle_l'),
          bar_l = $.data($handle[0], 'bar_l'),
          norm_pct = this.normalized_percentage(value, settings.start, settings.end),
          handle_offset = norm_pct*(bar_l-handle_l)-1,
          progress_bar_length = norm_pct*100;

      if (Foundation.rtl && !settings.vertical) {
        handle_offset = -handle_offset;
      }

      handle_offset = settings.vertical ? -handle_offset + bar_l - handle_l + 1 : handle_offset;
      this.set_translate($handle, handle_offset, settings.vertical);

      if (settings.vertical) {
        $handle.siblings('.range-slider-active-segment').css('height', progress_bar_length + '%');
      } else {
        $handle.siblings('.range-slider-active-segment').css('width', progress_bar_length + '%');
      }

      $handle.parent().attr(this.attr_name(), value).trigger('change').trigger('change.fndtn.slider');

      $handle.parent().children('input[type=hidden]').val(value);

      if (!$handle[0].hasAttribute('aria-valuemin')) {
        $handle.attr({
          'aria-valuemin': settings.start,
          'aria-valuemax': settings.end,
        });
      }
      $handle.attr('aria-valuenow', value);

      // if (settings.input_id != '') {
      //   $(settings.display_selector).each(function(){
      //     if (this.hasOwnProperty('value')) {
      //       $(this).val(value);
      //     } else {
      //       $(this).text(value);
      //     }
      //   });
      // }

    },

    normalized_percentage : function(val, start, end) {
      return Math.min(1, (val - start)/(end - start));
    },

    normalized_value : function(val, start, end, step) {
      var range = end - start,
          point = val*range,
          mod = (point-(point%step)) / step,
          rem = point % step,
          round = ( rem >= step*0.5 ? step : 0);
      return (mod*step + round) + start;
    },

    set_translate : function(ele, offset, vertical) {
      if (vertical) {
        $(ele)
          .css('-webkit-transform', 'translateY('+offset+'px)')
          .css('-moz-transform', 'translateY('+offset+'px)')
          .css('-ms-transform', 'translateY('+offset+'px)')
          .css('-o-transform', 'translateY('+offset+'px)')
          .css('transform', 'translateY('+offset+'px)');
      } else {
        $(ele)
          .css('-webkit-transform', 'translateX('+offset+'px)')
          .css('-moz-transform', 'translateX('+offset+'px)')
          .css('-ms-transform', 'translateX('+offset+'px)')
          .css('-o-transform', 'translateX('+offset+'px)')
          .css('transform', 'translateX('+offset+'px)');
      }
    },

    limit_to : function(val, min, max) {
      return Math.min(Math.max(val, min), max);
    },

    initialize_settings : function(handle) {
      var settings = $.extend({}, this.settings, this.data_options($(handle).parent()));

      if (settings.vertical) {
        $.data(handle, 'bar_o', $(handle).parent().offset().top);
        $.data(handle, 'bar_l', $(handle).parent().outerHeight());
        $.data(handle, 'handle_o', $(handle).offset().top);
        $.data(handle, 'handle_l', $(handle).outerHeight());
      } else {
        $.data(handle, 'bar_o', $(handle).parent().offset().left);
        $.data(handle, 'bar_l', $(handle).parent().outerWidth());
        $.data(handle, 'handle_o', $(handle).offset().left);
        $.data(handle, 'handle_l', $(handle).outerWidth());
      }

      $.data(handle, 'bar', $(handle).parent());
      $.data(handle, 'settings', settings);
    },

    set_initial_position : function($ele) {
      var settings = $.data($ele.children('.range-slider-handle')[0], 'settings'),
          initial = (!!settings.initial ? settings.initial : Math.floor((settings.end-settings.start)*0.5/settings.step)*settings.step+settings.start),
          $handle = $ele.children('.range-slider-handle');
      this.set_ui($handle, initial);
    },

    set_value : function(value) {
      var self = this;
      $('[' + self.attr_name() + ']', this.scope).each(function(){
        $(this).attr(self.attr_name(), value);
      });
      if (!!$(this.scope).attr(self.attr_name())) {
        $(this.scope).attr(self.attr_name(), value);
      }
      self.reflow();
    },

    reflow : function() {
      var self = this;
      self.S('[' + this.attr_name() + ']').each(function() {
        var handle = $(this).children('.range-slider-handle')[0],
            val = $(this).attr(self.attr_name());
        self.initialize_settings(handle);

        if (val) {
          self.set_ui($(handle), parseFloat(val));
        } else {
          self.set_initial_position($(this));
        }
      });
    }
  };

}(jQuery, window, window.document));
;(function ($, window, document, undefined) {
  'use strict';

  Foundation.libs.tab = {
    name : 'tab',

    version : '5.4.5',

    settings : {
      active_class: 'active',
      callback : function () {},
      deep_linking: false,
      scroll_to_content: true,
      is_hover: false
    },

    default_tab_hashes: [],

    init : function (scope, method, options) {
      var self = this,
          S = this.S;

      this.bindings(method, options);
      this.handle_location_hash_change();

      // Store the default active tabs which will be referenced when the
      // location hash is absent, as in the case of navigating the tabs and
      // returning to the first viewing via the browser Back button.
      S('[' + this.attr_name() + '] > .active > a', this.scope).each(function () {
        self.default_tab_hashes.push(this.hash);
      });
    },

    events : function () {
      var self = this,
          S = this.S;

      var usual_tab_behavior =  function (e) {
          var settings = S(this).closest('[' + self.attr_name() +']').data(self.attr_name(true) + '-init');
          if (!settings.is_hover || Modernizr.touch) {
            e.preventDefault();
            e.stopPropagation();
            self.toggle_active_tab(S(this).parent());
          }
        };

      S(this.scope)
        .off('.tab')
        // Click event: tab title
        .on('focus.fndtn.tab', '[' + this.attr_name() + '] > * > a', usual_tab_behavior )
        .on('click.fndtn.tab', '[' + this.attr_name() + '] > * > a', usual_tab_behavior )
        // Hover event: tab title
        .on('mouseenter.fndtn.tab', '[' + this.attr_name() + '] > * > a', function (e) {
          var settings = S(this).closest('[' + self.attr_name() +']').data(self.attr_name(true) + '-init');
          if (settings.is_hover) self.toggle_active_tab(S(this).parent());
        });

      // Location hash change event
      S(window).on('hashchange.fndtn.tab', function (e) {
        e.preventDefault();
        self.handle_location_hash_change();
      });
    },

    handle_location_hash_change : function () {

      var self = this,
          S = this.S;

      S('[' + this.attr_name() + ']', this.scope).each(function () {
        var settings = S(this).data(self.attr_name(true) + '-init');
        if (settings.deep_linking) {
          // Match the location hash to a label
          var hash;
          if (settings.scroll_to_content) {
            hash = self.scope.location.hash;
          } else {
            // prefix the hash to prevent anchor scrolling
            hash = self.scope.location.hash.replace('fndtn-', '');
          }
          if (hash != '') {
            // Check whether the location hash references a tab content div or
            // another element on the page (inside or outside the tab content div)
            var hash_element = S(hash);
            if (hash_element.hasClass('content') && hash_element.parent().hasClass('tab-content')) {
              // Tab content div
              self.toggle_active_tab($('[' + self.attr_name() + '] > * > a[href=' + hash + ']').parent());
            } else {
              // Not the tab content div. If inside the tab content, find the
              // containing tab and toggle it as active.
              var hash_tab_container_id = hash_element.closest('.content').attr('id');
              if (hash_tab_container_id != undefined) {
                self.toggle_active_tab($('[' + self.attr_name() + '] > * > a[href=#' + hash_tab_container_id + ']').parent(), hash);
              }
            }
          } else {
            // Reference the default tab hashes which were initialized in the init function
            for (var ind in self.default_tab_hashes) {
              self.toggle_active_tab($('[' + self.attr_name() + '] > * > a[href=' + self.default_tab_hashes[ind] + ']').parent());
            }
          }
        }
       });
     },

    toggle_active_tab: function (tab, location_hash) {
      var S = this.S,
          tabs = tab.closest('[' + this.attr_name() + ']'),
          tab_link = tab.find('a'),
          anchor = tab.children('a').first(),
          target_hash = '#' + anchor.attr('href').split('#')[1],
          target = S(target_hash),
          siblings = tab.siblings(),
          settings = tabs.data(this.attr_name(true) + '-init'),
          interpret_keyup_action = function(e) {
            // Light modification of Heydon Pickering's Practical ARIA Examples: http://heydonworks.com/practical_aria_examples/js/a11y.js 

            // define current, previous and next (possible) tabs

            var $original = $(this);
            var $prev = $(this).parents('li').prev().children('[role="tab"]');
            var $next = $(this).parents('li').next().children('[role="tab"]');
            var $target;

            // find the direction (prev or next)

            switch (e.keyCode) {
              case 37:
                $target = $prev;
                break;
              case 39:
                $target = $next;
                break;
              default:
                $target = false
                  break;
            }

            if ($target.length) {
              $original.attr({
                'tabindex' : '-1',
                'aria-selected' : null
              });
              $target.attr({
                'tabindex' : '0',
                'aria-selected' : true
              }).focus();
            }

            // Hide panels

            $('[role="tabpanel"]')
              .attr('aria-hidden', 'true');

            // Show panel which corresponds to target

            $('#' + $(document.activeElement).attr('href').substring(1))
              .attr('aria-hidden', null);

          };

      // allow usage of data-tab-content attribute instead of href
      if (S(this).data(this.data_attr('tab-content'))) {
        target_hash = '#' + S(this).data(this.data_attr('tab-content')).split('#')[1];
        target = S(target_hash);
      }

      if (settings.deep_linking) {

        if (settings.scroll_to_content) {
          // retain current hash to scroll to content
          window.location.hash = location_hash || target_hash;
          if (location_hash == undefined || location_hash == target_hash) {
            tab.parent()[0].scrollIntoView();
          } else {
            S(target_hash)[0].scrollIntoView();
          }
        } else {
          // prefix the hashes so that the browser doesn't scroll down
          if (location_hash != undefined) {
            window.location.hash = 'fndtn-' + location_hash.replace('#', '');
          } else {
            window.location.hash = 'fndtn-' + target_hash.replace('#', '');
          }
        }
      }

      // WARNING: The activation and deactivation of the tab content must
      // occur after the deep linking in order to properly refresh the browser
      // window (notably in Chrome).
      // Clean up multiple attr instances to done once
      tab.addClass(settings.active_class).triggerHandler('opened');
      tab_link.attr({"aria-selected": "true",  tabindex: 0});
      siblings.removeClass(settings.active_class)
      siblings.find('a').attr({"aria-selected": "false",  tabindex: -1});
      target.siblings().removeClass(settings.active_class).attr({"aria-hidden": "true",  tabindex: -1}).end().addClass(settings.active_class).attr('aria-hidden', 'false').find(':first-child').attr('tabindex', 0);
      settings.callback(tab);
      target.children().attr('tab-index', 0);
      target.triggerHandler('toggled', [tab]);
      tabs.triggerHandler('toggled', [target]);

      tab_link.on('keydown', interpret_keyup_action );
    },

    data_attr: function (str) {
      if (this.namespace.length > 0) {
        return this.namespace + '-' + str;
      }

      return str;
    },

    off : function () {},

    reflow : function () {}
  };
}(jQuery, window, window.document));
;(function ($, window, document, undefined) {
  'use strict';

  Foundation.libs.tooltip = {
    name : 'tooltip',

    version : '5.4.5',

    settings : {
      additional_inheritable_classes : [],
      tooltip_class : '.tooltip',
      append_to: 'body',
      touch_close_text: 'Tap To Close',
      disable_for_touch: false,
      hover_delay: 200,
      show_on : 'all',
      tip_template : function (selector, content) {
        return '<span data-selector="' + selector + '" id="' + selector + '" class="'
          + Foundation.libs.tooltip.settings.tooltip_class.substring(1)
          + '" role="tooltip">' + content + '<span class="nub"></span></span>';
      }
    },

    cache : {},

    init : function (scope, method, options) {
      Foundation.inherit(this, 'random_str');
      this.bindings(method, options);
    },

    should_show: function (target, tip) {
      var settings = $.extend({}, this.settings, this.data_options(target));

      if (settings.show_on === 'all') {
        return true;
      } else if (this.small() && settings.show_on === 'small') {
        return true;
      } else if (this.medium() && settings.show_on === 'medium') {
        return true;
      } else if (this.large() && settings.show_on === 'large') {
        return true;
      }
      return false;
    },

    medium : function () {
      return matchMedia(Foundation.media_queries['medium']).matches;
    },

    large : function () {
      return matchMedia(Foundation.media_queries['large']).matches;
    },

    events : function (instance) {
      var self = this,
          S = self.S;

      self.create(this.S(instance));

      $(this.scope)
        .off('.tooltip')
        .on('mouseenter.fndtn.tooltip mouseleave.fndtn.tooltip touchstart.fndtn.tooltip MSPointerDown.fndtn.tooltip',
          '[' + this.attr_name() + ']', function (e) {
          var $this = S(this),
              settings = $.extend({}, self.settings, self.data_options($this)),
              is_touch = false;

          if (Modernizr.touch && /touchstart|MSPointerDown/i.test(e.type) && S(e.target).is('a')) {
            return false;
          }

          if (/mouse/i.test(e.type) && self.ie_touch(e)) return false;

          if ($this.hasClass('open')) {
            if (Modernizr.touch && /touchstart|MSPointerDown/i.test(e.type)) e.preventDefault();
            self.hide($this);
          } else {
            if (settings.disable_for_touch && Modernizr.touch && /touchstart|MSPointerDown/i.test(e.type)) {
              return;
            } else if(!settings.disable_for_touch && Modernizr.touch && /touchstart|MSPointerDown/i.test(e.type)) {
              e.preventDefault();
              S(settings.tooltip_class + '.open').hide();
              is_touch = true;
            }

            if (/enter|over/i.test(e.type)) {
              this.timer = setTimeout(function () {
                var tip = self.showTip($this);
              }.bind(this), self.settings.hover_delay);
            } else if (e.type === 'mouseout' || e.type === 'mouseleave') {
              clearTimeout(this.timer);
              self.hide($this);
            } else {
              self.showTip($this);
            }
          }
        })
        .on('mouseleave.fndtn.tooltip touchstart.fndtn.tooltip MSPointerDown.fndtn.tooltip', '[' + this.attr_name() + '].open', function (e) {
          if (/mouse/i.test(e.type) && self.ie_touch(e)) return false;

          if($(this).data('tooltip-open-event-type') == 'touch' && e.type == 'mouseleave') {
            return;
          }
          else if($(this).data('tooltip-open-event-type') == 'mouse' && /MSPointerDown|touchstart/i.test(e.type)) {
            self.convert_to_touch($(this));
          } else {
            self.hide($(this));
          }
        })
        .on('DOMNodeRemoved DOMAttrModified', '[' + this.attr_name() + ']:not(a)', function (e) {
          self.hide(S(this));
        });
    },

    ie_touch : function (e) {
      // How do I distinguish between IE11 and Windows Phone 8?????
      return false;
    },

    showTip : function ($target) {
      var $tip = this.getTip($target);
      if (this.should_show($target, $tip)){
        return this.show($target);
      }
      return;
    },

    getTip : function ($target) {
      var selector = this.selector($target),
          settings = $.extend({}, this.settings, this.data_options($target)),
          tip = null;

      if (selector) {
        tip = this.S('span[data-selector="' + selector + '"]' + settings.tooltip_class);
      }

      return (typeof tip === 'object') ? tip : false;
    },

    selector : function ($target) {
      var id = $target.attr('id'),
          dataSelector = $target.attr(this.attr_name()) || $target.attr('data-selector');

      if ((id && id.length < 1 || !id) && typeof dataSelector != 'string') {
        dataSelector = this.random_str(6);
        $target
          .attr('data-selector', dataSelector)
          .attr('aria-describedby', dataSelector);
      }

      return (id && id.length > 0) ? id : dataSelector;
    },

    create : function ($target) {
      var self = this,
          settings = $.extend({}, this.settings, this.data_options($target)),
          tip_template = this.settings.tip_template;

      if (typeof settings.tip_template === 'string' && window.hasOwnProperty(settings.tip_template)) {
        tip_template = window[settings.tip_template];
      }

      var $tip = $(tip_template(this.selector($target), $('<div></div>').html($target.attr('title')).html())),
          classes = this.inheritable_classes($target);

      $tip.addClass(classes).appendTo(settings.append_to);

      if (Modernizr.touch) {
        $tip.append('<span class="tap-to-close">'+settings.touch_close_text+'</span>');
        $tip.on('touchstart.fndtn.tooltip MSPointerDown.fndtn.tooltip', function(e) {
          self.hide($target);
        });
      }

      $target.removeAttr('title').attr('title','');
    },

    reposition : function (target, tip, classes) {
      var width, nub, nubHeight, nubWidth, column, objPos;

      tip.css('visibility', 'hidden').show();

      width = target.data('width');
      nub = tip.children('.nub');
      nubHeight = nub.outerHeight();
      nubWidth = nub.outerHeight();

      if (this.small()) {
        tip.css({'width' : '100%' });
      } else {
        tip.css({'width' : (width) ? width : 'auto'});
      }

      objPos = function (obj, top, right, bottom, left, width) {
        return obj.css({
          'top' : (top) ? top : 'auto',
          'bottom' : (bottom) ? bottom : 'auto',
          'left' : (left) ? left : 'auto',
          'right' : (right) ? right : 'auto'
        }).end();
      };

      objPos(tip, (target.offset().top + target.outerHeight() + 10), 'auto', 'auto', target.offset().left);

      if (this.small()) {
        objPos(tip, (target.offset().top + target.outerHeight() + 10), 'auto', 'auto', 12.5, $(this.scope).width());
        tip.addClass('tip-override');
        objPos(nub, -nubHeight, 'auto', 'auto', target.offset().left);
      } else {
        var left = target.offset().left;
        if (Foundation.rtl) {
          nub.addClass('rtl');
          left = target.offset().left + target.outerWidth() - tip.outerWidth();
        }
        objPos(tip, (target.offset().top + target.outerHeight() + 10), 'auto', 'auto', left);
        tip.removeClass('tip-override');
        if (classes && classes.indexOf('tip-top') > -1) {
          if (Foundation.rtl) nub.addClass('rtl');
          objPos(tip, (target.offset().top - tip.outerHeight()), 'auto', 'auto', left)
            .removeClass('tip-override');
        } else if (classes && classes.indexOf('tip-left') > -1) {
          objPos(tip, (target.offset().top + (target.outerHeight() / 2) - (tip.outerHeight() / 2)), 'auto', 'auto', (target.offset().left - tip.outerWidth() - nubHeight))
            .removeClass('tip-override');
          nub.removeClass('rtl');
        } else if (classes && classes.indexOf('tip-right') > -1) {
          objPos(tip, (target.offset().top + (target.outerHeight() / 2) - (tip.outerHeight() / 2)), 'auto', 'auto', (target.offset().left + target.outerWidth() + nubHeight))
            .removeClass('tip-override');
          nub.removeClass('rtl');
        }
      }

      tip.css('visibility', 'visible').hide();
    },

    small : function () {
      return matchMedia(Foundation.media_queries.small).matches &&
        !matchMedia(Foundation.media_queries.medium).matches;
    },

    inheritable_classes : function ($target) {
      var settings = $.extend({}, this.settings, this.data_options($target)),
          inheritables = ['tip-top', 'tip-left', 'tip-bottom', 'tip-right', 'radius', 'round'].concat(settings.additional_inheritable_classes),
          classes = $target.attr('class'),
          filtered = classes ? $.map(classes.split(' '), function (el, i) {
            if ($.inArray(el, inheritables) !== -1) {
              return el;
            }
          }).join(' ') : '';

      return $.trim(filtered);
    },

    convert_to_touch : function($target) {
      var self = this,
          $tip = self.getTip($target),
          settings = $.extend({}, self.settings, self.data_options($target));

      if ($tip.find('.tap-to-close').length === 0) {
        $tip.append('<span class="tap-to-close">'+settings.touch_close_text+'</span>');
        $tip.on('click.fndtn.tooltip.tapclose touchstart.fndtn.tooltip.tapclose MSPointerDown.fndtn.tooltip.tapclose', function(e) {
          self.hide($target);
        });
      }

      $target.data('tooltip-open-event-type', 'touch');
    },

    show : function ($target) {
      var $tip = this.getTip($target);

      if ($target.data('tooltip-open-event-type') == 'touch') {
        this.convert_to_touch($target);
      }

      this.reposition($target, $tip, $target.attr('class'));
      $target.addClass('open');
      $tip.fadeIn(150);
    },

    hide : function ($target) {
      var $tip = this.getTip($target);

      $tip.fadeOut(150, function() {
        $tip.find('.tap-to-close').remove();
        $tip.off('click.fndtn.tooltip.tapclose MSPointerDown.fndtn.tapclose');
        $target.removeClass('open');
      });
    },

    off : function () {
      var self = this;
      this.S(this.scope).off('.fndtn.tooltip');
      this.S(this.settings.tooltip_class).each(function (i) {
        $('[' + self.attr_name() + ']').eq(i).attr('title', $(this).text());
      }).remove();
    },

    reflow : function () {}
  };
}(jQuery, window, window.document));
;(function ($, window, document, undefined) {
  'use strict';

  Foundation.libs.topbar = {
    name : 'topbar',

    version: '5.4.5',

    settings : {
      index : 0,
      sticky_class : 'sticky',
      custom_back_text: true,
      back_text: 'Back',
      mobile_show_parent_link: true,
      is_hover: true,
      scrolltop : true, // jump to top when sticky nav menu toggle is clicked
      sticky_on : 'all'
    },

    init : function (section, method, options) {
      Foundation.inherit(this, 'add_custom_rule register_media throttle');
      var self = this;

      self.register_media('topbar', 'foundation-mq-topbar');

      this.bindings(method, options);

      self.S('[' + this.attr_name() + ']', this.scope).each(function () {
        var topbar = $(this),
            settings = topbar.data(self.attr_name(true) + '-init'),
            section = self.S('section, .top-bar-section', this);
        topbar.data('index', 0);
        var topbarContainer = topbar.parent();
        if (topbarContainer.hasClass('fixed') || self.is_sticky(topbar, topbarContainer, settings) ) {
          self.settings.sticky_class = settings.sticky_class;
          self.settings.sticky_topbar = topbar;
          topbar.data('height', topbarContainer.outerHeight());
          topbar.data('stickyoffset', topbarContainer.offset().top);
        } else {
          topbar.data('height', topbar.outerHeight());
        }

        if (!settings.assembled) {
          self.assemble(topbar);
        }

        if (settings.is_hover) {
          self.S('.has-dropdown', topbar).addClass('not-click');
        } else {
          self.S('.has-dropdown', topbar).removeClass('not-click');
        }

        // Pad body when sticky (scrolled) or fixed.
        self.add_custom_rule('.f-topbar-fixed { padding-top: ' + topbar.data('height') + 'px }');

        if (topbarContainer.hasClass('fixed')) {
          self.S('body').addClass('f-topbar-fixed');
        }
      });

    },

    is_sticky: function (topbar, topbarContainer, settings) {
      var sticky = topbarContainer.hasClass(settings.sticky_class);

      if (sticky && settings.sticky_on === 'all') {
        return true;
      } else if (sticky && this.small() && settings.sticky_on === 'small') {
        return (matchMedia(Foundation.media_queries.small).matches && !matchMedia(Foundation.media_queries.medium).matches &&
            !matchMedia(Foundation.media_queries.large).matches);
        //return true;
      } else if (sticky && this.medium() && settings.sticky_on === 'medium') {
        return (matchMedia(Foundation.media_queries.small).matches && matchMedia(Foundation.media_queries.medium).matches &&
            !matchMedia(Foundation.media_queries.large).matches);
        //return true;
      } else if(sticky && this.large() && settings.sticky_on === 'large') {
        return (matchMedia(Foundation.media_queries.small).matches && matchMedia(Foundation.media_queries.medium).matches &&
            matchMedia(Foundation.media_queries.large).matches);
        //return true;
      }

      return false;
    },

    toggle: function (toggleEl) {
      var self = this,
          topbar;

      if (toggleEl) {
        topbar = self.S(toggleEl).closest('[' + this.attr_name() + ']');
      } else {
        topbar = self.S('[' + this.attr_name() + ']');
      }

      var settings = topbar.data(this.attr_name(true) + '-init');

      var section = self.S('section, .top-bar-section', topbar);

      if (self.breakpoint()) {
        if (!self.rtl) {
          section.css({left: '0%'});
          $('>.name', section).css({left: '100%'});
        } else {
          section.css({right: '0%'});
          $('>.name', section).css({right: '100%'});
        }

        self.S('li.moved', section).removeClass('moved');
        topbar.data('index', 0);

        topbar
          .toggleClass('expanded')
          .css('height', '');
      }

      if (settings.scrolltop) {
        if (!topbar.hasClass('expanded')) {
          if (topbar.hasClass('fixed')) {
            topbar.parent().addClass('fixed');
            topbar.removeClass('fixed');
            self.S('body').addClass('f-topbar-fixed');
          }
        } else if (topbar.parent().hasClass('fixed')) {
          if (settings.scrolltop) {
            topbar.parent().removeClass('fixed');
            topbar.addClass('fixed');
            self.S('body').removeClass('f-topbar-fixed');

            window.scrollTo(0,0);
          } else {
            topbar.parent().removeClass('expanded');
          }
        }
      } else {
        if (self.is_sticky(topbar, topbar.parent(), settings)) {
          topbar.parent().addClass('fixed');
        }

        if (topbar.parent().hasClass('fixed')) {
          if (!topbar.hasClass('expanded')) {
            topbar.removeClass('fixed');
            topbar.parent().removeClass('expanded');
            self.update_sticky_positioning();
          } else {
            topbar.addClass('fixed');
            topbar.parent().addClass('expanded');
            self.S('body').addClass('f-topbar-fixed');
          }
        }
      }
    },

    timer : null,

    events : function (bar) {
      var self = this,
          S = this.S;

      S(this.scope)
        .off('.topbar')
        .on('click.fndtn.topbar', '[' + this.attr_name() + '] .toggle-topbar', function (e) {
          e.preventDefault();
          self.toggle(this);
        })
        .on('click.fndtn.topbar','.top-bar .top-bar-section li a[href^="#"],[' + this.attr_name() + '] .top-bar-section li a[href^="#"]',function (e) {
            var li = $(this).closest('li');
            if(self.breakpoint() && !li.hasClass('back') && !li.hasClass('has-dropdown'))
            {
            self.toggle();
            }
        })
        .on('click.fndtn.topbar', '[' + this.attr_name() + '] li.has-dropdown', function (e) {
          var li = S(this),
              target = S(e.target),
              topbar = li.closest('[' + self.attr_name() + ']'),
              settings = topbar.data(self.attr_name(true) + '-init');

          if(target.data('revealId')) {
            self.toggle();
            return;
          }

          if (self.breakpoint()) return;
          if (settings.is_hover && !Modernizr.touch) return;

          e.stopImmediatePropagation();

          if (li.hasClass('hover')) {
            li
              .removeClass('hover')
              .find('li')
              .removeClass('hover');

            li.parents('li.hover')
              .removeClass('hover');
          } else {
            li.addClass('hover');

            $(li).siblings().removeClass('hover');

            if (target[0].nodeName === 'A' && target.parent().hasClass('has-dropdown')) {
              e.preventDefault();
            }
          }
        })
        .on('click.fndtn.topbar', '[' + this.attr_name() + '] .has-dropdown>a', function (e) {
          if (self.breakpoint()) {

            e.preventDefault();

            var $this = S(this),
                topbar = $this.closest('[' + self.attr_name() + ']'),
                section = topbar.find('section, .top-bar-section'),
                dropdownHeight = $this.next('.dropdown').outerHeight(),
                $selectedLi = $this.closest('li');

            topbar.data('index', topbar.data('index') + 1);
            $selectedLi.addClass('moved');

            if (!self.rtl) {
              section.css({left: -(100 * topbar.data('index')) + '%'});
              section.find('>.name').css({left: 100 * topbar.data('index') + '%'});
            } else {
              section.css({right: -(100 * topbar.data('index')) + '%'});
              section.find('>.name').css({right: 100 * topbar.data('index') + '%'});
            }

            topbar.css('height', $this.siblings('ul').outerHeight(true) + topbar.data('height'));
          }
        });

      S(window).off(".topbar").on("resize.fndtn.topbar", self.throttle(function() {
          self.resize.call(self);
      }, 50)).trigger("resize").trigger("resize.fndtn.topbar").load(function(){
          // Ensure that the offset is calculated after all of the pages resources have loaded
          S(this).trigger("resize.fndtn.topbar");
      });

      S('body').off('.topbar').on('click.fndtn.topbar', function (e) {
        var parent = S(e.target).closest('li').closest('li.hover');

        if (parent.length > 0) {
          return;
        }

        S('[' + self.attr_name() + '] li.hover').removeClass('hover');
      });

      // Go up a level on Click
      S(this.scope).on('click.fndtn.topbar', '[' + this.attr_name() + '] .has-dropdown .back', function (e) {
        e.preventDefault();

        var $this = S(this),
            topbar = $this.closest('[' + self.attr_name() + ']'),
            section = topbar.find('section, .top-bar-section'),
            settings = topbar.data(self.attr_name(true) + '-init'),
            $movedLi = $this.closest('li.moved'),
            $previousLevelUl = $movedLi.parent();

        topbar.data('index', topbar.data('index') - 1);

        if (!self.rtl) {
          section.css({left: -(100 * topbar.data('index')) + '%'});
          section.find('>.name').css({left: 100 * topbar.data('index') + '%'});
        } else {
          section.css({right: -(100 * topbar.data('index')) + '%'});
          section.find('>.name').css({right: 100 * topbar.data('index') + '%'});
        }

        if (topbar.data('index') === 0) {
          topbar.css('height', '');
        } else {
          topbar.css('height', $previousLevelUl.outerHeight(true) + topbar.data('height'));
        }

        setTimeout(function () {
          $movedLi.removeClass('moved');
        }, 300);
      });

      // Show dropdown menus when their items are focused
      S(this.scope).find('.dropdown a')
        .focus(function() {
          $(this).parents('.has-dropdown').addClass('hover');
        })
        .blur(function() {
          $(this).parents('.has-dropdown').removeClass('hover');
        });
    },

    resize : function () {
      var self = this;
      self.S('[' + this.attr_name() + ']').each(function () {
        var topbar = self.S(this),
            settings = topbar.data(self.attr_name(true) + '-init');

        var stickyContainer = topbar.parent('.' + self.settings.sticky_class);
        var stickyOffset;

        if (!self.breakpoint()) {
          var doToggle = topbar.hasClass('expanded');
          topbar
            .css('height', '')
            .removeClass('expanded')
            .find('li')
            .removeClass('hover');

            if(doToggle) {
              self.toggle(topbar);
            }
        }

        if(self.is_sticky(topbar, stickyContainer, settings)) {
          if(stickyContainer.hasClass('fixed')) {
            // Remove the fixed to allow for correct calculation of the offset.
            stickyContainer.removeClass('fixed');

            stickyOffset = stickyContainer.offset().top;
            if(self.S(document.body).hasClass('f-topbar-fixed')) {
              stickyOffset -= topbar.data('height');
            }

            topbar.data('stickyoffset', stickyOffset);
            stickyContainer.addClass('fixed');
          } else {
            stickyOffset = stickyContainer.offset().top;
            topbar.data('stickyoffset', stickyOffset);
          }
        }

      });
    },

    breakpoint : function () {
      return !matchMedia(Foundation.media_queries['topbar']).matches;
    },

    small : function () {
      return matchMedia(Foundation.media_queries['small']).matches;
    },

    medium : function () {
      return matchMedia(Foundation.media_queries['medium']).matches;
    },

    large : function () {
      return matchMedia(Foundation.media_queries['large']).matches;
    },

    assemble : function (topbar) {
      var self = this,
          settings = topbar.data(this.attr_name(true) + '-init'),
          section = self.S('section, .top-bar-section', topbar);

      // Pull element out of the DOM for manipulation
      section.detach();

      self.S('.has-dropdown>a', section).each(function () {
        var $link = self.S(this),
            $dropdown = $link.siblings('.dropdown'),
            url = $link.attr('href'),
            $titleLi;


        if (!$dropdown.find('.title.back').length) {

          if (settings.mobile_show_parent_link == true && url) {
            $titleLi = $('<li class="title back js-generated"><h5><a href="javascript:void(0)"></a></h5></li><li class="parent-link show-for-small"><a class="parent-link js-generated" href="' + url + '">' + $link.html() +'</a></li>');
          } else {
            $titleLi = $('<li class="title back js-generated"><h5><a href="javascript:void(0)"></a></h5>');
          }

          // Copy link to subnav
          if (settings.custom_back_text == true) {
            $('h5>a', $titleLi).html(settings.back_text);
          } else {
            $('h5>a', $titleLi).html('&laquo; ' + $link.html());
          }
          $dropdown.prepend($titleLi);
        }
      });

      // Put element back in the DOM
      section.appendTo(topbar);

      // check for sticky
      this.sticky();

      this.assembled(topbar);
    },

    assembled : function (topbar) {
      topbar.data(this.attr_name(true), $.extend({}, topbar.data(this.attr_name(true)), {assembled: true}));
    },

    height : function (ul) {
      var total = 0,
          self = this;

      $('> li', ul).each(function () {
        total += self.S(this).outerHeight(true);
      });

      return total;
    },

    sticky : function () {
      var self = this;

      this.S(window).on('scroll', function() {
        self.update_sticky_positioning();
      });
    },

    update_sticky_positioning: function() {
      var klass = '.' + this.settings.sticky_class,
          $window = this.S(window),
          self = this;

      if (self.settings.sticky_topbar && self.is_sticky(this.settings.sticky_topbar,this.settings.sticky_topbar.parent(), this.settings)) {
        var distance = this.settings.sticky_topbar.data('stickyoffset');
        if (!self.S(klass).hasClass('expanded')) {
          if ($window.scrollTop() > (distance)) {
            if (!self.S(klass).hasClass('fixed')) {
              self.S(klass).addClass('fixed');
              self.S('body').addClass('f-topbar-fixed');
            }
          } else if ($window.scrollTop() <= distance) {
            if (self.S(klass).hasClass('fixed')) {
              self.S(klass).removeClass('fixed');
              self.S('body').removeClass('f-topbar-fixed');
            }
          }
        }
      }
    },

    off : function () {
      this.S(this.scope).off('.fndtn.topbar');
      this.S(window).off('.fndtn.topbar');
    },

    reflow : function () {}
  };
}(jQuery, window, window.document));
;(function ($, window, document, undefined) {
  'use strict';

  Foundation.libs.equalizer = {
    name : 'equalizer',

    version : '5.4.5',

    settings : {
      use_tallest: true,
      before_height_change: $.noop,
      after_height_change: $.noop,
      equalize_on_stack: false
    },

    init : function (scope, method, options) {
      Foundation.inherit(this, 'image_loaded');
      this.bindings(method, options);
      this.reflow();
    },

    events : function () {
      this.S(window).off('.equalizer').on('resize.fndtn.equalizer', function(e){
        this.reflow();
      }.bind(this));
    },

    equalize: function(equalizer) {
      var isStacked = false,
          vals = equalizer.find('[' + this.attr_name() + '-watch]:visible'),
          settings = equalizer.data(this.attr_name(true)+'-init');

      if (vals.length === 0) return;
      var firstTopOffset = vals.first().offset().top;
      settings.before_height_change();
      equalizer.trigger('before-height-change').trigger('before-height-change.fndth.equalizer');
      vals.height('inherit');
      vals.each(function(){
        var el = $(this);
        if (el.offset().top !== firstTopOffset) {
          isStacked = true;
        }
      });

      if (settings.equalize_on_stack === false) {
        if (isStacked) return;
      };

      var heights = vals.map(function(){ return $(this).outerHeight(false) }).get();

      if (settings.use_tallest) {
        var max = Math.max.apply(null, heights);
        vals.css('height', max);
      } else {
        var min = Math.min.apply(null, heights);
        vals.css('height', min);
      }
      settings.after_height_change();
      equalizer.trigger('after-height-change').trigger('after-height-change.fndtn.equalizer');
    },

    reflow : function () {
      var self = this;

      this.S('[' + this.attr_name() + ']', this.scope).each(function(){
        var $eq_target = $(this);
        self.image_loaded(self.S('img', this), function(){
          self.equalize($eq_target)
        });
      });
    }
  };
})(jQuery, window, window.document);


















// This is a manifest file that'll be compiled into application.js, which will include all the files
// listed below.
//
// Any JavaScript/Coffee file within this directory, lib/assets/javascripts, or any plugin's
// vendor/assets/javascripts directory can be referenced here using a relative path.
//
// It's not advisable to add code directly here, but if you do, it'll appear at the bottom of the
// compiled file. JavaScript code in this file should be added after the last require_* statement.
//
// Read Sprockets README (https://github.com/rails/sprockets#sprockets-directives) for details
// about supported directives.
//







$(document).foundation();
