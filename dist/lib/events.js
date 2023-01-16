"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.EventDispatcher = void 0;
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); Object.defineProperty(subClass, "prototype", { writable: false }); if (superClass) _setPrototypeOf(subClass, superClass); }
function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }
function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } else if (call !== void 0) { throw new TypeError("Derived constructors may only return object or undefined"); } return _assertThisInitialized(self); }
function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
function _wrapNativeSuper(Class) { var _cache = typeof Map === "function" ? new Map() : undefined; _wrapNativeSuper = function _wrapNativeSuper(Class) { if (Class === null || !_isNativeFunction(Class)) return Class; if (typeof Class !== "function") { throw new TypeError("Super expression must either be null or a function"); } if (typeof _cache !== "undefined") { if (_cache.has(Class)) return _cache.get(Class); _cache.set(Class, Wrapper); } function Wrapper() { return _construct(Class, arguments, _getPrototypeOf(this).constructor); } Wrapper.prototype = Object.create(Class.prototype, { constructor: { value: Wrapper, enumerable: false, writable: true, configurable: true } }); return _setPrototypeOf(Wrapper, Class); }; return _wrapNativeSuper(Class); }
function _construct(Parent, args, Class) { if (_isNativeReflectConstruct()) { _construct = Reflect.construct.bind(); } else { _construct = function _construct(Parent, args, Class) { var a = [null]; a.push.apply(a, args); var Constructor = Function.bind.apply(Parent, a); var instance = new Constructor(); if (Class) _setPrototypeOf(instance, Class.prototype); return instance; }; } return _construct.apply(null, arguments); }
function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }
function _isNativeFunction(fn) { return Function.toString.call(fn).indexOf("[native code]") !== -1; }
function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }
var AppComponentBeforemount = /*#__PURE__*/function (_Event) {
  _inherits(AppComponentBeforemount, _Event);
  var _super = _createSuper(AppComponentBeforemount);
  function AppComponentBeforemount(componentName) {
    var _this;
    _classCallCheck(this, AppComponentBeforemount);
    _this = _super.call(this, 'app-component-beforemount');
    _this.componentName = componentName;
    return _this;
  }
  return _createClass(AppComponentBeforemount);
}( /*#__PURE__*/_wrapNativeSuper(Event));
var AppComponentInitialized = /*#__PURE__*/function (_Event2) {
  _inherits(AppComponentInitialized, _Event2);
  var _super2 = _createSuper(AppComponentInitialized);
  function AppComponentInitialized(componentName) {
    var _this2;
    _classCallCheck(this, AppComponentInitialized);
    _this2 = _super2.call(this, 'app-component-initialized');
    _this2.componentName = componentName;
    return _this2;
  }
  return _createClass(AppComponentInitialized);
}( /*#__PURE__*/_wrapNativeSuper(Event));
var AppComponentInit = /*#__PURE__*/function (_Event3) {
  _inherits(AppComponentInit, _Event3);
  var _super3 = _createSuper(AppComponentInit);
  function AppComponentInit(componentName) {
    var _this3;
    _classCallCheck(this, AppComponentInit);
    _this3 = _super3.call(this, 'app-component-init');
    _this3.componentName = componentName;
    return _this3;
  }
  return _createClass(AppComponentInit);
}( /*#__PURE__*/_wrapNativeSuper(Event));
var AppComponentMounted = /*#__PURE__*/function (_Event4) {
  _inherits(AppComponentMounted, _Event4);
  var _super4 = _createSuper(AppComponentMounted);
  function AppComponentMounted(componentName) {
    var _this4;
    _classCallCheck(this, AppComponentMounted);
    _this4 = _super4.call(this, 'app-component-mounted');
    _this4.componentName = componentName;
    return _this4;
  }
  return _createClass(AppComponentMounted);
}( /*#__PURE__*/_wrapNativeSuper(Event));
var EventDispatcher = /*#__PURE__*/function () {
  function EventDispatcher() {
    _classCallCheck(this, EventDispatcher);
  }
  _createClass(EventDispatcher, null, [{
    key: "dispatch",
    value: function dispatch(eventName, componentName) {
      var event;
      if (eventName === 'beforemount') {
        event = new AppComponentBeforemount(componentName);
      }
      if (eventName === 'initialized') {
        event = new AppComponentInitialized(componentName);
      }
      if (eventName === 'init') {
        event = new AppComponentInit(componentName);
      }
      if (eventName === 'mounted') {
        event = new AppComponentMounted(componentName);
      }
      window.dispatchEvent(event);
    }
  }]);
  return EventDispatcher;
}();
exports.EventDispatcher = EventDispatcher;