define ["underscore", "coffee!app/datatable"], (_, DataTable) ->
  class Categorizer
    constructor: (rawData, schema) ->
      @table = new DataTable rawData, schema

    categorize: ->
      _(@table.allCodes()).map (code) =>
        code: code
        environments: _(@table.allEnvironments()).map (env) =>
          code: env
          records: @table.whereEnvironmentIs(env).find(code.asCriteria())

