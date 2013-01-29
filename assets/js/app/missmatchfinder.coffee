define ["underscore", "coffee!app/categorizer"], (_, Categorizer) ->
  messages =
    forUndefinedCode: (code, environment) ->
      "Code [#{code.asString()}] is not defined in [#{environment.code}]"

    forRedefinedCode: (code, environment) ->
      "Code [#{code.asString()}] is defined multiple times in [#{environment.code}]"

    forDescriptionDiff: (code) ->
      "Code [#{code.asString()}] has different descriptions in some environments."

  findCodeMissmatches = (categories) ->
    result = _(categories).map (category) ->
      _(category.environments).map (environment) ->
        if environment.records.length <= 0
          messages.forUndefinedCode category.code, environment
        else if environment.records.length > 1
          messages.forRedefinedCode category.code, environment
        else
          []
    _(result).flatten()

  findDescriptionMissmatches = (categories) ->
    result = _(categories).map (category) ->
      descriptions = _(category.environments).filter (environment) ->
        environment.records.length == 1
      descriptions = _(descriptions).map (environment) ->
        environment.records[0].description()
      descriptions = _(descriptions).uniq()

      if descriptions.length > 1
        message = messages.forDescriptionDiff category.code
      else
        []
    _(result).flatten()

  class MissmatchFinder
    constructor: (data, schema) ->
      categorizer = new Categorizer data, schema
      @categories = categorizer.categorize()

    findMissmatches: ->
      codeMissmatches = findCodeMissmatches @categories
      descriptionMissmatches = findDescriptionMissmatches @categories
      _.union codeMissmatches, descriptionMissmatches
