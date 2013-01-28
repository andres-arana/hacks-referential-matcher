requirejs.config({
  paths: {
    'underscore': 'externals/underscore',
    'jquery': 'externals/jquery',
    'jquery.csv': 'externals/jquery.csv'
  },

  shim: {
    'underscore': {
      exports: '_',
    },
    'jquery': {
      exports: '$',
    },
    'jquery.csv': ['jquery'],
  },
});

requirejs(['jquery', 'underscore', 'jquery.csv'], function($, _) {
function CSV(text) {
  this.data = $.csv.toArrays(text);

  this.hasData = function() {
    return this.data.length > 0;
  };

  this.records = function() {
    return this.data.length - 1;
  };

  this.fields = function() {
    return this.data[0].length;
  };

  this.headers = function() {
    return this.data[0];
  };

  this.body = function() {
    return _(this.data).tail();
  };
};

function Matcher(csv, options) {
  this.match = function() {
    var results = [];
    var rawData = csv.body();
    var groupedByEnvironment = _(rawData).groupBy(function(record) {
      return record[options.environment];
    });
    var groupedByCode = _(rawData).groupBy(function(record) {
      return _(options.codes).map(function(code) {
        return record[code];
      }).join("###");
    });
    var allEnvironments = _(groupedByEnvironment).keys();
    var allCodes = _(groupedByCode).keys();

    _(allCodes).each(function(code) {
      var actualCode = code.split("###");
      var fields = _.zip(options.codes, actualCode);
      var description = undefined;
      _(allEnvironments).each(function(env) {
        var records = groupedByEnvironment[env];
        var matchingRecords = _(records).filter(function(record) {
          var fieldMatches = _(fields).map(function(field) {
            return record[field[0]] == field[1];
          });
          return _(fieldMatches).all(_.identity);
        });

        if (matchingRecords.length <= 0) {
          results.push("Code [" + code + "] is not defined for environment [" + env + "]");
        } else if (matchingRecords.length > 1) {
          results.push("Code [" + code + "] is defined multiple times for environment [" + env + "]");
        } else {
          var record = matchingRecords[0];
          var currentRecordDescription = _(options.descriptions).map(function(index) {
            return record[index];
          }).join("###");
          if (description === undefined) {
            description = currentRecordDescription;
          } else if (description != currentRecordDescription) {
              results.push("Code [" + code + "] has different descriptions in some environments");
          }
        }
      });
    });

    return _(results).uniq();
  };
};

var resultsView = {
  bind: function(matches) {
    if (matches.length > 0) {
      $("#result-log").html("");
      _(matches).each(function(match) {
        $("#result-log").append("<li>" + match + "</li>");
      });
    } else {
      $("#result-log").html("<li>There are no inconsistencies!</li>");
    }

    $("#csv-match-message").hide();
    $("#results").show();
  },
}

var configView = {
  bind: function(csv) {

    function bindEnvironments() {
      var environments = $("#environment");
      environments.html("");
      _(csv.headers()).each(function(item, index) {
        $("<option>").val(index).text(item).appendTo(environments);
      });
    };

    function bindHeaders(field) {
      field.html("");
      _(csv.headers()).each(function(item, index) {
        var label = $("<label>");
        label.append($('<input type="checkbox">').val(index));
        label.append(item);

        field.append(label);
      });
    };

    function extractCheckedInputs(section) {
      return $(section + " label input:checked").map(function() {
        return $(this).val();
      }).get();
    }

    function config() {
      return {
        environment: $("#environment").val(),
        codes: extractCheckedInputs("#codes"),
        descriptions: extractCheckedInputs("#descriptions"),
      };
    };

    $("#csv-config-records").html(csv.records());
    $("#csv-config-fields").html(csv.fields());
    bindEnvironments();
    bindHeaders($("#codes"));
    bindHeaders($("#descriptions"));

    $("#match").unbind("click").click(function() {
      var options = config();
      var matcher = new Matcher(csv, options);
      resultsView.bind(matcher.match());
    });

    $("#csv-config-message").hide();
    $("#csv-config").show();
  },

};

var dataView = {
  bind: function() {
    $(document).ready(function() {

      $("#csv-file-analyze").click(function() {
        var csv = new CSV($("#csv-file").val());
        if (csv.hasData()) {
          configView.bind(csv);
        }
      });

    });
  },
};

dataView.bind();

});