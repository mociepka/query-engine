(function() {
  var CoffeeScript, Js2coffee, codeChanged, coffeeMode, coffeeModeInstance, editor, editors, key, queryEngine, _i, _len, _ref;

  CoffeeScript = window.CoffeeScript;

  queryEngine = window.queryEngine;

  Js2coffee = window.Js2coffee;

  editors = window.editors = {};

  coffeeMode = require('ace/mode/coffee').Mode;

  coffeeModeInstance = new coffeeMode();

  $(window).resize(function() {
    var padHeight, padWidth;

    padWidth = $(window).width() / 2 - 20;
    padHeight = $(window).height() - $('.header:first').height() - 80;
    return $('.pad,.editor').width(padWidth).height(padHeight);
  }).trigger('resize');

  $(document).keydown(function(e) {
    var isInput;

    isInput = $(document.activeElement).is(':input');
    if (e.keyCode === 8 && !isInput) {
      return e.preventDefault();
    }
  });

  _ref = ['code', 'result'];
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    key = _ref[_i];
    editor = ace.edit(key);
    editor.setTheme('ace/theme/textmate');
    editor.setShowPrintMargin(false);
    editor.getSession().setMode(coffeeModeInstance);
    editor.setHighlightActiveLine(true);
    editor.getSession().setTabSize(4);
    editor.getSession().setUseSoftTabs(false);
    editors[key] = editor;
  }

  codeChanged = function() {
    var codeCoffeeScript, codeJavaScript, collection, err, errMessage;

    try {
      codeCoffeeScript = editors.code.getSession().getValue();
      codeJavaScript = CoffeeScript.compile(codeCoffeeScript);
      collection = eval(codeJavaScript);
      return window.updateResults(collection);
    } catch (_error) {
      err = _error;
      errMessage = err.stack.toString();
      console.log(errMessage);
      return editors.result.getSession().setValue(errMessage);
    }
  };

  window.updateResults = function(collection) {
    var resultArray, resultCoffee, resultJavaScript;

    resultArray = collection != null ? collection.toJSON() : void 0;
    resultJavaScript = JSON.stringify(resultArray);
    resultCoffee = Js2coffee.build("var result = " + resultJavaScript);
    return editors.result.getSession().setValue(resultCoffee);
  };

  editors.code.getSession().on('change', codeChanged);

  editors.code.getSession().setValue("# Create our project collection from an array of models\n# and set several pills that we can use for searching\nprojectCollection = window.queryEngine.createLiveCollection([\n			id: 1\n			title: \"Query Engine\"\n			tags: [\"backbone\", \"node.js\"]\n			description: \"Query-Engine provides extensive Querying, Filtering, and Searching abilities for Backbone.js Collections as well as JavaScript arrays and objects\"\n		,\n			id: 2\n			title: \"Joe\"\n			tags: [\"testing\", \"node.js\"]\n			description: \"Node.js asynchronous testing framework, runner and reporter\"\n	])\nprojectSearchCollection = projectCollection.createLiveChildCollection()\n	.setPill('id', {\n		prefixes: ['id:']\n		callback: (model,value) ->\n			pass = model.get('id') is parseInt(value,10)\n			return pass\n	})\n	.setPill('tag', {\n		logicalOperator: 'AND'\n		prefixes: ['tag:']\n		callback: (model,value) ->\n			for tag in model.get('tags')\n				searchRegex = queryEngine.createSafeRegex(value)\n				pass = searchRegex.test(tag)\n				break  if pass\n			return pass\n	})\n	.setPill('title', {\n		prefixes: ['title:']\n		callback: (model,value) ->\n			valueRegex = queryEngine.createSafeRegex(value)\n			pass = valueRegex.test(model.get('title'))\n			return pass\n	})\n	.setFilter('search', (model,searchString) ->\n		return true  unless searchString?\n		searchRegex = queryEngine.createSafeRegex(searchString)\n		pass = searchRegex.test(model.get('description'))\n		return pass\n	)\n	.query()\n\n# Setup Search\n$searchbar = $('#searchbar').val('tag:node.js')\n$searchbar.off('keyup').on 'keyup', (event) ->\n	searchString = $(this).val()\n	window.updateResults  projectSearchCollection.setSearchString(searchString).query()\n\n# Return our project collection\nreturn projectSearchCollection");

}).call(this);
