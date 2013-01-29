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
    'jquery.csv': {
      deps: ['jquery'],
      exports: '$.csv',
    },
  },
});

requirejs(['jquery', 'underscore', 'app/data', 'app/table'], function($, _, Data, Table) {

function Matcher(data, schema) {
  this.table = new Table(data, schema);

  this.match = function() {
    var table = this.table;
    var results = [];
    _(table.allCodes()).each(function(code) {
      var description = undefined;
      _(table.allEnvironments()).each(function(env) {
        var records = table.whereEnvironmentIs(env).find(code.asCriteria());

        if (records.length <= 0) {
          results.push("Code [" + code + "] is not defined for environment [" + env + "]");
        } else if (records.length > 1) {
          results.push("Code [" + code + "] is defined multiple times for environment [" + env + "]");
        } else {
          var record = records[0];
          var currentRecordDescription = _(schema.descriptions).map(function(index) {
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
  bind: function(data) {

    function bindEnvironments() {
      var environments = $("#environment");
      environments.html("");
      _(data.headers()).each(function(item, index) {
        $("<option>").val(index).text(item).appendTo(environments);
      });
    };

    function bindHeaders(field) {
      field.html("");
      _(data.headers()).each(function(item, index) {
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

    $("#csv-config-records").html(data.recordCount());
    $("#csv-config-fields").html(data.fieldCount());
    bindEnvironments();
    bindHeaders($("#codes"));
    bindHeaders($("#descriptions"));

    $("#match").unbind("click").click(function() {
      var options = config();
      var matcher = new Matcher(data, options);
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
        var data = new Data($("#csv-file").val());
        if (data.hasRecords()) {
          configView.bind(data);
        }
      });

    });
  },
};

dataView.bind();

});
