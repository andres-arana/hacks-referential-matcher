define(['underscore', 'jquery.csv'], function(_, csv) {
  function Data(text) {
    this.raw = csv.toArrays(text);
  };

  Data.prototype = {
    hasRecords: function() {
      return this.raw.length > 0;
    },

    recordCount: function() {
      return this.raw.length - 1;
    },

    fieldCount: function() {
      return this.raw[0].length;
    },

    headers: function() {
      return this.raw[0];
    },

    body: function() {
      return _(this.raw).tail();
    },
  };

  return Data;
});

