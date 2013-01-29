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

requirejs(['jquery', 'underscore', 'coffee!app/rawdata', 'coffee!app/missmatchfinder'], function($, _, RawData, MissmatchFinder) {

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
      var matcher = new MissmatchFinder(data, options);
      resultsView.bind(matcher.findMissmatches());
    });

    $("#csv-config-message").hide();
    $("#csv-config").show();
  },

};

var dataView = {
  bind: function() {
    $(document).ready(function() {

      $("#csv-file-analyze").click(function() {
        var data = new RawData($("#csv-file").val());
        if (data.hasRecords()) {
          configView.bind(data);
        }
      });

    });
  },
};

dataView.bind();

});
