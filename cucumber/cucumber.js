var selectors = {
    "main search field": ".single-topbar-search-field",
    "main search form": ".single-topbar-search-form",
    "main header": "#check-out-here-top h1",
    "platforms menu": "#platforms"
};

var features = [];
features.push({
    "title": "Do a Search on HERE",
    "description": "Using a web browser\n  I want to perform a place search on HERE",
    "scenarios": [
        {
            "title": "HERE Place Search",
            "given": [
                {
                    "step": "I visit [text]",
                    "variables": ["https://here.com/"]
                }
            ],
            "when": [
                {
                    "step": "I enter [text] into [selector]",
                    "variables": ["cheese", "main search field"]
                },
                {
                    "step": "I submit the form [selector]",
                    "variables": ["main search form"]
                }
            ],
            "then": [
                {
                    "step": "I should see place search results",
                    "variables": []
                }
            ]
        }
    ]
});
features[0].scenarios.push({
    "title": "HERE search layout",
    "given": [
        {
            "step": "I visit [text]",
            "variables": ["https://here.com/"]
        }
    ],
    "then": [
        {
            "step": "[selector] should have [property] of [comparator] [value]",
            "variables": ["main search field", "width", "", "176px"]
        }
    ]
});
features[0].scenarios.push({
    "title": "HERE help layout",
    "given": [
        {
            "step": "I visit [text]",
            "variables": ["https://here.com/"]
        },
        {
            "step": "the window size is [text] by [text]",
            "variables": ["1024px", "768px"]
        }
    ],
    "then": [
        {
            "step": "[selector] should have [property] of [comparator] [value]",
            "variables": ["main search field", "width", "", "176px"]
        }
    ]
});

function createCucumber(features) {
    var outputFeature = [], i, l, _i, _l, __i, __l, crlf = "\n", depth = 0, firstOfType = true, currentStep,
        scenarios, given, when, then;
    if (!validateFeatures(features)) {
        return false;
    }
    for(i = 0, l = features.length; i < l; i++) {
        outputFeature.push(features[i].title);
        outputFeature.push(crlf);
        outputFeature.push(features[i].description);
        outputFeature.push(crlf);
        scenarios = features[i].scenarios;
        for(_i = 0, _l = scenarios.length; _i < _l; _i++) {
            depth = 2;
            outputFeature.push(crlf);
            outputFeature.push(tabs(depth));
            outputFeature.push("Scenario: ");
            outputFeature.push(scenarios[_i].title);
            outputFeature.push(crlf);
            depth = 4;
            outputFeature = outputFeature.concat(processSteps(scenarios[_i].given, "Given", depth));
            outputFeature = outputFeature.concat(processSteps(scenarios[_i].when, "When", depth));
            outputFeature = outputFeature.concat(processSteps(scenarios[_i].then, "Then", depth));
        }

    }
    return outputFeature.join('');
}

function processSteps(steps, stepName, depth) {
    var currentStep, returnableArray = [], i, l;
    steps = steps || [];
    for(i = 0, l = steps.length; i < l; i++) {
        returnableArray.push(tabs(depth));
        returnableArray.push((i === 0)?stepName + " ":"And ");

        currentStep = replacePlaceholders(steps[i].step, steps[i].variables) || steps[i].step;

        returnableArray.push(currentStep);
        returnableArray.push("\n");
    }
    return returnableArray;
}

function replacePlaceholders(step, variables) {
    var numberOfPlaceholders = step.split(']').length - 1, i, placeHolderType, formatString;
    if(variables.length === numberOfPlaceholders) {
        for(i = 0; i < numberOfPlaceholders; i++) {
            placeHolderType = step.match(/\[(\w*)\]/)[1];
            switch(placeHolderType) {
                case 'text':
                    formatString = '"' + variables[i] + '"';
                    break;
                case 'selector':
                    formatString = '{{' + variables[i] + '}}';
                    break;
                case 'comparator':
                    formatString = variables[i]?'{{' + variables[i] + '}}':'';
                    break;
                case 'property':
                    formatString = '*' + variables[i] + '*';
                    break;
                case 'value':
                    formatString = '`' + variables[i] + '`';
                    break;
                default:
                    formatString = variables[i];
            }
            step = step.replace(/\[\w*\]/, formatString);
        }
    }
    return step;
}

function tabs(tabdepth) {
    var returnable = "", i;
    for(i = tabdepth; i>0; i--) {
        returnable += " ";
    }
    return returnable;
}

function validateFeatures() {
    // later
    return true;
}
createCucumber(features);