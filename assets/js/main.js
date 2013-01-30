requirejs.config({
  paths: {
    'underscore': 'externals/underscore',
    'jquery': 'externals/jquery',
    'jquery.csv': 'externals/jquery.csv',
    'coffee-script': 'externals/coffee-script',
    'coffee': 'requirejs/cs'
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

requirejs(['jquery', 'underscore', 'coffee!app/datamatrix', 'coffee!app/datatable', 'coffee!app/datahierarchy', 'coffee!app/missmatchfinder'], function($, _, DataMatrix, DataTable, DataHierarchy, MissmatchFinder) {

var resultsView = {
  bind: function(missmatches) {
    if (missmatches.length > 0) {
      $("#result-log").html("");
      _(missmatches).each(function(match) {
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
  bind: function(matrix) {

    function bindEnvironments() {
      var environments = $("#environment");
      environments.html("");
      _(matrix.headers()).each(function(item, index) {
        $("<option>").val(index).text(item).appendTo(environments);
      });
    };

    function bindHeaders(field) {
      field.html("");
      _(matrix.headers()).each(function(item, index) {
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

    $("#csv-config-records").html(matrix.recordCount());
    $("#csv-config-fields").html(matrix.fieldCount());
    bindEnvironments();
    bindHeaders($("#codes"));
    bindHeaders($("#descriptions"));

    $("#match").unbind("click").click(function() {
      var options = config();
      var table = new DataTable(matrix, options);
      var hierarchy = new DataHierarchy(table);
      var missmatchFinder = new MissmatchFinder(hierarchy);
      resultsView.bind(missmatchFinder.find());
    });

    $("#csv-config-message").hide();
    $("#csv-config").show();
  },

};

var dataView = {
  bind: function() {
    $(document).ready(function() {

      $("#csv-file-analyze").click(function() {
        var matrix = new DataMatrix($("#csv-file").val());
        if (matrix.hasRecords()) {
          configView.bind(matrix);
        }
      });

    });
  },
};

dataView.bind();

});
