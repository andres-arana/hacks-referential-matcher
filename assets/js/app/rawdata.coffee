define ["underscore", "jquery.csv"], (_, csv) ->
  class RawData
    constructor: (text) ->
      @raw = csv.toArrays text

    hasRecords: ->
      @raw.length > 1

    recordCount: ->
      @raw.length - 1

    fieldCount: ->
      @raw[0].length

    headers: ->
      @raw[0]

    contents: ->
      _(@raw).tail()
