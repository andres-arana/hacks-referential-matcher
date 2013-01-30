define ['underscore', 'coffee!app/record'], (_, Record) ->
  class DataTable
    constructor: (matrix, @schema) ->
      @data = matrix.contents()
      @views = 
        byEnvironment: _(@data).groupBy (record) =>
          record[@schema.environment]
        byCode: _(@data).groupBy (record) =>
          _(@schema.codes).map((code) => record[code]).join "###"

    allEnvironments: ->
      _(@views.byEnvironment).keys()

    allCodes: ->
      _(@views.byCode).keys().map (code) =>
        asString: ->
          code
        asCriteria: =>
          values = code.split "###"
          _.zip(@schema.codes, values).map (entry) ->
            field: entry[0], value: entry[1]

    whereEnvironmentIs: (env) ->
      find: (criteria) =>
        records = @views.byEnvironment[env]
        records = _(records).filter (record) ->
          _(criteria).all (c) ->
            record[c.field] == c.value

        _(records).map (record) =>
          new Record record, @schema
