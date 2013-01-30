define ["underscore", "jquery.csv"], (_, csv) ->
  class DataMatrix
    constructor: (text) ->
      @data = csv.toArrays text

    hasRecords: ->
      @data.length > 1

    recordCount: ->
      @data.length - 1

    fieldCount: ->
      @data[0].length

    headers: ->
      @data[0]

    contents: ->
      _(@data).tail()
