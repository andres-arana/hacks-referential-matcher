define ["underscore"], (_) ->
  class DataHierarchy
    constructor: (table) ->
      @data = _(table.allCodes()).map (code) ->
        code: code
        environments: _(table.allEnvironments()).map (env) ->
          code: env
          records: table.whereEnvironmentIs(env).find(code.asCriteria())

