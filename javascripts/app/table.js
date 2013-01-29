define(['underscore'], function(_) {
  function Table(data, schema) {
    var _self = this;

    this.schema = schema;
    this.data = data;
    this.raw = data.body();
    this.views = {
      byEnv: _(_self.raw).groupBy(function(record) {
        return record[schema.environment];
      }),

      byCode: _(_self.raw).groupBy(function(record) {
        return _(schema.codes).map(function(code) {
          return record[code];
        }).join("###");
      }),
    };
  };
  
  Table.prototype = {
    allEnvironments: function() {
      return _(this.views.byEnv).keys();
    },

    allCodes: function() {
      return _(this.views.byCode).keys().map(function(code) {
        return {
          asString: function() {
            return code;
          },

          asCriteria: function() {
            var values = code.split("###");
            return _.zip(schema.codes, values).map(function(entry) {
              return { field: entry[0], value: entry[1] };
            });
          },
        };
      });
    },

    whereEnvironmentIs: function(env) {
      var _self = this;

      return {
        find: function(criteria) {
          var records = _self.views.byEnv[env];
          return _(records).filter(function(record) {
            var results = _(criteria).map(function(c) {
              return record[c.field] == c.value;
            });
            return _(results).all(_.identity);
          });
        },
      };
    },
  
  };

  return Table;
});
