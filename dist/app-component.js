"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.AppComponent = void 0;
var _justPascalCase = _interopRequireDefault(require("just-pascal-case"));
var _events = require("./lib/events");
var _vue = require("vue");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }
function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }
function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
function _iterableToArrayLimit(arr, i) { var _i = null == arr ? null : "undefined" != typeof Symbol && arr[Symbol.iterator] || arr["@@iterator"]; if (null != _i) { var _s, _e, _x, _r, _arr = [], _n = !0, _d = !1; try { if (_x = (_i = _i.call(arr)).next, 0 === i) { if (Object(_i) !== _i) return; _n = !1; } else for (; !(_n = (_s = _x.call(_i)).done) && (_arr.push(_s.value), _arr.length !== i); _n = !0); } catch (err) { _d = !0, _e = err; } finally { try { if (!_n && null != _i["return"] && (_r = _i["return"](), Object(_r) !== _r)) return; } finally { if (_d) throw _e; } } return _arr; } }
function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
var AppComponent = /*#__PURE__*/function () {
  /**
   * Create global app helper
   *
   * @param {string} name - helper name
   * @param {*} component - helper name
   */
  function AppComponent(name, component) {
    _classCallCheck(this, AppComponent);
    this.name = name;
    this.component = component;

    // app components eventBus
    this.eventbus = null;
  }

  /**
   * Mount our Course Builder Vue App
   *
   * @param {Object} props
   */
  _createClass(AppComponent, [{
    key: "mount",
    value: function mount() {
      var _this = this,
        _this$plugins;
      var props = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      _events.EventDispatcher.dispatch('beforemount', this);
      this.vueApp = (0, _vue.createApp)(this.component, props);
      // register components
      if (this.components && Object.keys(this.components).length) {
        Object.entries(this.components).forEach(function (_ref) {
          var _ref2 = _slicedToArray(_ref, 2),
            name = _ref2[0],
            component = _ref2[1];
          _this.vueApp.component(name, component);
        });
      }

      // register plugins
      if ((_this$plugins = this.plugins) !== null && _this$plugins !== void 0 && _this$plugins.length) {
        this.plugins.forEach(function (obj) {
          _this.vueApp.use(obj.plugin, obj.options);
        });
      }

      // register components
      if (this.provides && Object.keys(this.provides).length) {
        Object.entries(this.provides).forEach(function (_ref3) {
          var _ref4 = _slicedToArray(_ref3, 2),
            key = _ref4[0],
            value = _ref4[1];
          _this.vueApp.provide(key, value);
        });
      }
      this.vueApp.mount(this.wrapper);
      _events.EventDispatcher.dispatch('mounted', this);
    }

    /**
     * Unmount component by clearing its wrapper
     */
  }, {
    key: "unmount",
    value: function unmount() {
      this.wrapper.innerHTML = '';
    }

    /**
     * Register components, that are used by vue
     *
     * @param {Object} components
     */
  }, {
    key: "registerComponents",
    value: function registerComponents(components) {
      this.components = components;
      return this;
    }

    /**
     * Register plugins, that are used by vue
     *
     * @param {Array} plugins
     */
  }, {
    key: "registerPlugins",
    value: function registerPlugins(plugins) {
      var _this$plugins2;
      if (!this.plugins) {
        this.plugins = [];
      }
      (_this$plugins2 = this.plugins).push.apply(_this$plugins2, _toConsumableArray(plugins));
      return this;
    }

    /**
     * Register EventBus
     *
     * @param {Object} eventbus
     */
  }, {
    key: "registerEventbus",
    value: function registerEventbus(eventbus) {
      this.eventbus = eventbus;
      return this;
    }

    /**
     * Register global injection inside app
     *
     * @param {string} key
     * @param {Object} value
     */
  }, {
    key: "registerProvide",
    value: function registerProvide(key, value) {
      if (!this.provides) {
        this.provides = {};
      }
      this.provides[key] = value;
      return this;
    }

    /**
     * Register plugins, that are used by vue
     *
     * @param {Object} plugin
     * @param {Object} options
     */
  }, {
    key: "registerPlugin",
    value: function registerPlugin(plugin, options) {
      if (!this.plugins) {
        this.plugins = [];
      }
      this.plugins.push({
        plugin: plugin,
        options: options
      });
      return this;
    }

    /**
     * @returns {string}
     */
  }, {
    key: "wrapperId",
    get: function get() {
      return "".concat(this.name, "-app");
    }

    /**
     * Helper to get the mounted wrapper element
     *
     * @returns {Element}
     */
  }, {
    key: "wrapper",
    get: function get() {
      return document.querySelector("#".concat(this.wrapperId));
    }

    /**
     *
     * @param {string} name
     * @param {*} component
     * @returns {this}
     */
  }], [{
    key: "make",
    value: function make(name, component) {
      var pascalName = (0, _justPascalCase["default"])(name);
      var appComponent = new this(name, component);
      window[pascalName] = appComponent;
      return appComponent;
    }
  }]);
  return AppComponent;
}();
exports.AppComponent = AppComponent;