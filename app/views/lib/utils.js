// Generated by CoffeeScript 1.6.3
var utils;

utils = {
  exportValueMap: {
    "correct": 1,
    "checked": 1,
    "incorrect": "0",
    "unchecked": "0",
    "missing": ".",
    "not_asked": ".",
    "skipped": 999
  },
  exportValue: function(databaseValue) {
    if (databaseValue == null) {
      databaseValue = "no_record";
    }
    if (utils.exportValueMap[databaseValue] != null) {
      return utils.exportValueMap[databaseValue];
    } else {
      return String(databaseValue);
    }
  },
  pair: function(key, value) {
    var o;
    if (value === void 0) {
      value = "no_record";
    }
    o = {};
    o[key] = value;
    return o;
  },
  cell: function(subtest, key, value) {
    var machineName;
    if (typeof subtest === "string") {
      machineName = "" + subtest + "-" + key;
    } else {
      machineName = "" + subtest.subtestId + "-" + key;
    }
    return {
      key: key,
      value: value,
      machineName: machineName
    };
  },
  unpair: function(pair) {
    var key, value;
    for (key in pair) {
      value = pair[key];
      return [key, value];
    }
    return "object not found";
  }
};

if (typeof exports === "object") {
  exports.clone = utils.clone;
  exports.exportValue = utils.exportValue;
  exports.pair = utils.pair;
  exports.cell = utils.cell;
  exports.unpair = utils.unpair;
}
