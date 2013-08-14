// Feature Parser
// ===
//
// This takes an object describing a hierarchy of
// features, scenarios, given, when and then statements
// and outputs a human-readable cucumber file in HTML markup or plain text

var cucumber = {};

(function() {

    function createCucumber(features, exportFormat) {
        var outputFeature = [],
            i, l, _i, _l, __i, __l, crlf = "\n",
            depth = 0,
            firstOfType = true,
            currentStep,
            scenarios, id, given, when, then;
        exportFormat = exportFormat || false;
        if (!validateFeatures(features)) {
            return false;
        }
        for (i = 0, l = features.length; i < l; i++) {
            outputFeature.push(format('title', 'Feature: ', exportFormat));
            outputFeature.push(format('editable title', features[i].title, exportFormat));
            outputFeature.push(crlf);
            outputFeature.push(format('editable title', features[i].description, exportFormat));
            outputFeature.push(crlf);
            scenarios = features[i].scenarios;
            for (_i = 0, _l = scenarios.length; _i < _l; _i++) {
                depth = 2;
                outputFeature.push(crlf);
                outputFeature.push(tabs(depth));
                outputFeature.push(format('title', "Scenario: ", exportFormat));
                outputFeature.push(format('editable title', scenarios[_i].title, exportFormat));
                outputFeature.push(crlf);
                depth = 4;
                id = '_' + i + '_' + _i;
                outputFeature = outputFeature.concat(processSteps(scenarios[_i].given, "Given", depth, id, exportFormat));
                outputFeature = outputFeature.concat(processSteps(scenarios[_i].when, "When", depth, id, exportFormat));
                outputFeature = outputFeature.concat(processSteps(scenarios[_i].then, "Then", depth, id, exportFormat));
            }

        }
        return outputFeature.join('');
    }

    function processSteps(steps, stepName, depth, id, exportFormat) {
        var currentStep, returnableArray = [],
            i, l;
        steps = steps || [];
        for (i = 0, l = steps.length; i < l; i++) {
            returnableArray.push(tabs(depth));
            returnableArray.push((i === 0) ? stepName + " " : "And ");

            currentStep = replacePlaceholders(steps[i].step, steps[i].variables, id + '_' + i, exportFormat) || steps[i].step;

            returnableArray.push(currentStep);
            returnableArray.push("\n");
        }
        return returnableArray;
    }

    function replacePlaceholders(step, variables, id, exportFormat) {
        var numberOfPlaceholders = step.split(']').length - 1,
            i, placeHolderType, formatString;
        if (variables.length === numberOfPlaceholders) {
            for (i = 0; i < numberOfPlaceholders; i++) {
                placeHolderType = step.match(/\[(\w*)\]/)[1];
                switch (placeHolderType) {
                    case 'text':
                        formatString = format('editable', variables[i], exportFormat);
                        break;
                    case 'selector':
                        formatString = exportFormat ? '"' + selectorPathToName(variables[i], ghost.selectors) + '"' : createSelectorsList(variables[i], id);
                        break;
                    case 'comparator':
                        formatString = variables[i] ? '{{' + variables[i] + '}}' : '';
                        break;
                    case 'property':
                        formatString = exportFormat ? '"' + util.uncamelize(variables[i]) + '"' : createPropertyList(variables[i], id + '_' + i);
                        break;
                    case 'value':
                        formatString = format('editable', variables[i], exportFormat);
                        break;
                    default:
                        formatString = variables[i];
                }
                step = step.replace(/\[\w*\]/, formatString);
                step = step.replace('  ', ' ');

            }
        }
        return step;
    }

    function tabs(tabdepth) {
        var returnable = "",
            i;
        for (i = tabdepth; i > 0; i--) {
            returnable += " ";
        }
        return returnable;
    }

    function validateFeatures() {
        // later
        return true;
    }

    function createPropertyList(selected, id) {
        var properties = {
            'Typography': ['font-size', 'font-family', 'font-weight', 'font-style', 'color', 'text-transform', 'text-decoration', 'letter-spacing', 'word-spacing', 'line-height', 'text-align', 'vertical-align', 'direction'],
            'Background': ['background-color', 'background-image', 'background-repeat', 'background-position', 'background-attachment'],
            'Shape': ['width', 'height', 'top', 'right', 'bottom', 'left', 'margin-top', 'margin-right ', 'margin-bottom', 'margin-left', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left', 'clip', 'overflow-x', 'overflow-y'],
            'Border': ['border-top-width', 'border-right-width', 'border-bottom-width', 'border-left-width', 'border-top-color', 'border-right-color', 'border-bottom-color', 'border-left-color', 'border-top-style', 'border-right-style', 'border-bottom-style', 'border-left-style', 'border-top-left-radius', 'border-top-right-radius', 'border-bottom-right-radius', 'border-bottom-left-radius'],
            'Position': ['position', 'z-index', 'float', 'clear'],
            'Appearance': ['opacity', 'display', 'visibility'],
            'Other': ['white-space', 'cursor', 'list-style-image', 'list-style-position', 'list-style-type', 'marker-offset']
        }, key, select, optgroup, option, i, l;
        selected = util.uncamelize(selected);

        select = document.createElement('select');
        select.id = id;
        for (key in properties) {
            optgroup = document.createElement('optgroup');
            optgroup.setAttribute('label', key);
            for (i = 0, l = properties[key].length; i < l; i++) {
                option = new Option(properties[key][i]);
                if (properties[key][i] === selected) {
                    option.setAttribute('selected', true);
                }
                optgroup.appendChild(option);
            }
            select.appendChild(optgroup);
        }
        return select.outerHTML;
    }

    /* Until we have more complicated layout requirements */

    function format(formatType, data, exportFormat) {
        if (exportFormat) {
            if (formatType === 'title' || formatType === 'editable title') {
                return data;
            }
            return '"' + data + '"';
        }
        return '<span class="' + formatType + '">' + data + '</span>';
    }

    /* Selector Panel */

    function formatSelectors(selectors) {
        var dl = document.createElement('dl'),
            i, l, dt, dd;

        for (i = 0, l = selectors.length; i < l; i++) {
            dt = document.createElement('dt');
            dd = document.createElement('dd');

            dt.innerHTML = selectors[i].name;
            dd.innerHTML = selectors[i].path;

            dl.appendChild(dt);
            dl.appendChild(dd);
        }

        return dl.outerHTML;
    }

    function exportFormatSelectors(selectors) {
        var returnable = {};

        for (i = 0, l = selectors.length; i < l; i++) {
            returnable[selectors[i].name] = selectors[i].path;
        }



        return "module.exports = " + JSON.stringify(returnable);
    }

    function createSelectorsList(selected, id) {
        var key, select, optgroup, option, i, l,
            selectors = ghost.selectors;

        select = document.createElement('select');
        select.id = id;
        for (i = 0, l = selectors.length; i < l; i++) {
            option = new Option(selectors[i].name);
            if (selectors[i].path === selected) {
                option.setAttribute('selected', true);
            }
            select.appendChild(option);
        }
        return select.outerHTML;
    }

    function selectorPathToName(path, selectors) {
        var tempselectors;
        tempselectors = selectors.filter(function(e) {
            return e.path === path;
        });
        if (tempselectors[0]) {
            return tempselectors[0].name;
        }
        return false;
    }

    cucumber = {
        scenarios: {
            html: function(features) {
                return createCucumber(features, false);
            },
            text: function(features) {
                return createCucumber(features, true);
            }
        },
        selectors: {
            html: function(selectors) {
                return formatSelectors(selectors);
            },
            text: function(selectors) {
                return exportFormatSelectors(selectors);
            },
            getName: selectorPathToName
        }
    };
}());


var util = {
    uncamelize: function(str) {
        return str.replace(/[A-Z]/g, '-$&').toLowerCase();
    },
    camelize: function(str) {
        return str.replace(/[\s\-](\w)/g, function(str, letter) {
            return letter.toUpperCase();
        });
    }
};