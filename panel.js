// This one acts in the context of the panel in the Dev Tools
//
// Can use
// chrome.devtools.*
// chrome.extension.*

var ghost = {};

(function() {

    var feature, selectors = [],
        injected = false,
        currentScenario;

    var $ = function(e) {
        return document.querySelector(e);
    },
        $$ = function(e) {
            return document.querySelectorAll(e);
        };


    $('#generatetest').addEventListener('click', makeNewTest, false);
    $('#addscenario').addEventListener('click', function(e) {
        addScenario();
        e.preventDefault();
        e.stopPropagation();
        return false;
    }, false);
    $('#exportfeature').addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        exportFeature();
        return false;
    }, false);
    $('#exportselectors').addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        exportSelectors();
        return false;
    }, false);

    function makeNewFeature() {
        return {
            "title": null,
            "description": null,
            "scenarios": []
        };
    }

    function makeNewTest() {
        if (feature) {
            if (!window.confirm("Clear current scenarios?")) {
                return;
            }
        }
        feature = makeNewFeature();

        // prompt dialog
        if (true) {
            prompter("Name of feature?", function(e, str) {
                feature.title = str;
                if (e) {
                    prompter("Description of feature?", function(e, str) {
                        feature.description = str;
                        if (!injected) {
                            sendObjectToInspectedPage({
                                action: "script",
                                content: "interact.js"
                            });
                        }
                    });
                } else {
                    feature = null;
                }
            });
        } else {
            feature.title = window.prompt("Name of feature?");
            if (feature.title) {
                feature.description = window.prompt("Description of feature?");
                if (!injected) {
                    sendObjectToInspectedPage({
                        action: "script",
                        content: "interact.js"
                    });
                }
            } else {
                feature = null;
            }
        }
    }

    function updateFeaturePane() {
        if (feature) {
            $('#exportselectors a').style.display = 'block';
            $('#exportfeature a').style.display = 'block';
            $('#addscenario a').style.display = 'block';

            $('#testoutput').innerHTML = cucumber.scenarios.html([feature]);
        }
    }

    function updateSelectorPane() {
        $('#selectoroutput').innerHTML = cucumber.selectors.html(selectors);
    }

    function addScenarioToFeature(scenario) {
        feature.scenarios.push(scenario);
    }

    function addSelectorToFeature(selector) {
        if (cucumber.selectors.getName(selector.path, selectors)) {
            return;
        }
        selectors.push(selector);
    }

    function successfullyInjected() {
        injected = true;
    }

    function prompter(question, callback) {
        $('#prompt form').onsubmit = function(e) {
            e.preventDefault();
            e.stopPropagation();
            return false;
        }
        $('#prompt input').value = '';
        var hidePrompt = function(callback, val) {
            return function(e) {
                e.preventDefault();
                e.stopPropagation();
                $('#prompt').classList.remove('show');
                callback(val, $('#prompt input').value);
                return false;
            };
        };
        $('#prompt p').innerHTML = question;
        $('#prompt .ok').onclick = hidePrompt(callback, true);
        $('#prompt .cancel').onclick = hidePrompt(callback, false);
        $('#prompt').classList.add('show');
        $('#prompt input').focus();
    }

    function addScenario() {
        var scenario = newScenario();
        scenario.title = prompt('Scenario description?');
        if (scenario.title) {
            feature.scenarios.push(scenario);
            currentScenario = feature.scenarios.length - 1;
        }
    }

    function setupScenario(setup) {
        var scenario, selector;
        if (feature.scenarios.length === 0) {
            feature.scenarios.push(newScenario());
            currentScenario = feature.scenarios.length - 1;
        }
        if (!currentScenario) {
            currentScenario = feature.scenarios.length - 1;
        }
        scenario = feature.scenarios[currentScenario];

        // function subSetup(e, str) {
        //     scenario.title = str;
        //     if (e) {
        //         if (scenario.given.length === 0) {
        //             scenario.given.push({
        //                 "step": "I visit [text]",
        //                 "variables": [setup.location]
        //             });
        //         }

        //         setup.selector = cucumber.selectors.getName(setup.path, selectors);

        //         if (!setup.selector) {
        //             setup.selector = prompt('Element description?');
        //         }

        //         if (setup.selector) {
        //             addSelectorToFeature({
        //                 name: setup.selector,
        //                 path: setup.path
        //             });

        //             setup.property = prompt('Property to measure?');
        //             if (setup.property) {
        //                 setup.property = util.camelize(setup.property);
        //                 if (setup.property) {
        //                     setup.value = setup.styles[setup.property];
        //                     setupThen(setup);
        //                 }
        //             }

        //         }
        //         updateSelectorPane();
        //         updateFeaturePane();
        //     }
        // }

        // if (!scenario.title) {
        //     prompter("Scenario description?", subSetup);
        // } else {
        //     subSetup(true, scenario.title);
        // }



        if (!scenario.title) {
            scenario.title = prompt('Scenario description?');
        }

        if (scenario.given.length === 0) {
            scenario.given.push({
                "step": "I visit [text]",
                "variables": [setup.location]
            });
        }

        setup.selector = cucumber.selectors.getName(setup.path, selectors);

        if (!setup.selector) {
            setup.selector = prompt('Element description?');
        }

        if (setup.selector) {
            addSelectorToFeature({
                name: setup.selector,
                path: setup.path
            });

            setup.property = prompt('Property to measure?');
            if (setup.property) {
                setup.property = util.camelize(setup.property);
                if (setup.property) {
                    setup.value = setup.styles[setup.property];
                    setupThen(setup);
                }
            }

        }
        updateSelectorPane();
        updateFeaturePane();
    }

    function setupThen(setup) {
        var scenario = feature.scenarios[currentScenario];
        scenario.then.push({
            "step": "[selector] should have [property] of [comparator] [value]",
            "variables": [setup.path, setup.property, "", setup.value]
        });
        updateSelectorPane();
        updateFeaturePane();
    }

    function newScenario(title) {
        var returnable = {};
        returnable.title = title;
        returnable.given = [];
        returnable.when = [];
        returnable.then = [];
        return returnable;
    }

    function exportFeature() {
        var exportableContent = cucumber.scenarios.text([feature]),
            exportableBlob = new Blob([exportableContent], {
                type: "text/plain"
            });

        // Currently opens in a new window. Want to download instead        
        window.open(webkitURL.createObjectURL(exportableBlob));
    }

    function exportSelectors() {
        var exportableContent = cucumber.selectors.text(selectors);
        exportableBlob = new Blob([exportableContent], {
            type: "text/plain"
        });

        // Currently opens in a new window. Want to download instead        
        window.open(webkitURL.createObjectURL(exportableBlob));
    }

    ghost = {
        init: successfullyInjected,
        add: {
            feature: null,
            scenario: addScenarioToFeature,
            selector: addSelectorToFeature
        },
        update: {
            feature: updateFeaturePane,
            scenario: setupScenario,
            selector: updateSelectorPane
        },
        selectors: selectors
    };
}());