describe("* Model Dependencies", function() {
    var viz;

    var cases = [{
        title: "Dependencies with hooks, independent data and no data models",
        deps: [{
            name: "A",
            type: "external"
        }, {
            name: "B",
            type: "hook",
            dep: "A"
        }, {
            name: "C",
            type: "hook",
            dep: "A"
        }, {
            name: "D",
            dep: "A"
        }]
    }, {
        title: "Dependencies with hooks and no data models only",
        deps: [{
            name: "A",
            type: "hook"
        }, {
            name: "B",
            type: "hook",
            dep: "A"
        }, {
            name: "C",
            type: "hook",
            dep: "B"
        }, {
            name: "D",
            dep: "A"
        }, {
            name: "E",
            type: "hook",
            dep: "C"
        }]
    }, {
        title: "Dependencies with no data models",
        deps: [{
            name: "A",
        }, {
            name: "B",
            dep: "A"
        }, {
            name: "C",
            dep: "B"
        }, {
            name: "D",
            dep: "C"
        }]
    }, {
        title: "Dependencies with independent data only",
        deps: [{
            name: "A",
            type: "external",
        }, {
            name: "B",
            type: "external",
            dep: "A"
        }, {
            name: "C",
            type: "external",
            dep: "B"
        }, {
            name: "D",
            type: "external",
            dep: "C"
        }]
    }, {
        title: "Dependencies with multi dependency models",
        deps: [{
            name: "A",
            type: "external",
        }, {
            name: "B",
            type: "external",
            dep: "A"
        }, {
            name: "C",
            type: "hook",
            dep: ["B", "A"]
        }]
    }, {
        title: "Dependencies with multi dependency models 2",
        deps: [{
            name: "A",
        }, {
            name: "B",
            dep: "A"
        }, {
            name: "C",
            type: "hook",
            dep: ["B", "A"]
        }, {
            name: "D",
            type: "external",
            dep: ["B", "C"]
        }]
    }, {
        title: "Circular dependency",
        fail: true,
        deps: [{
            name: "A",
            dep: "C"
        }, {
            name: "B",
            type: "external",
            dep: "A"
        }, {
            name: "C",
            type: "hook",
            dep: ["B"]
        }]
    }];


    //for each dependency case, create a set of tests
    for (var i = 0; i < cases.length; i++) {
        var dep_case = cases[i];

        describe(dep_case.title, function() {

            var options = {
                //state
                state: {

                    //timespan of the visualization
                    time: {
                        start: 1990,
                        end: 1995,
                        value: 1990,
                        step: 1,
                        playable: false,
                        speed: 50,
                        formatInput: "%Y"
                    },

                    //entities we want to show
                    entities: {
                        show: {
                            dim: "geo",
                            filter: {
                                "geo": ['swe', 'nor', 'fin'],
                                "geo.category": ["country"]
                            }
                        }
                    },

                    //define dependencies
                    deps: dep_case.deps

                },

                //where do we get data from?
                data: {
                    reader: 'local-json',
                    path: 'local_data/waffles/{{LANGUAGE}}/basic-indicators.json'
                }

            };

            if (dep_case.fail) {

                beforeEach(function(done) {
                    spyOn(console, 'error');
                    viz = initializeVizabi("_examples-data-loading/data-loading-2", options, done);
                    mobile(true); //test with mobile resolution;
                });

                it('should print error to console', function() {
                    expect(console.error).toHaveBeenCalled();
                });

            } else {

                beforeAll(function(done) {
                    viz = initializeVizabi("_examples-data-loading/data-loading-2", options, done);
                    mobile(true); //test with mobile resolution;
                });

                it("should be instantiated", function() {
                    expect(viz).not.toBeNull();
                    expect(typeof viz).toBe('object');
                });

                it("should not have an empty div", function() {
                    var contents = $(viz._placeholder).children();
                    expect(contents.length).toBeGreaterThan(0);
                });

                it("should be ready (and all models ready accordingly)", function() {
                    var ready = viz._tool.model._ready;
                    if (!ready) {
                        console.log(JSON.stringify(mapReady(viz._tool.model), null, 4));
                    }
                    expect(ready).toBeTruthy();
                });
            }


        });

    };

});