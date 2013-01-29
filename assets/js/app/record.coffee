define ["underscore"], (_) ->
  class Record
    constructor: (@data, @schema) ->

    description: ->
      descriptions = _(@schema.descriptions).map (index) =>
        @data[index]

      descriptions.join "###"

