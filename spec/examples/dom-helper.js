function initializeDom() {
    //insert wrapper (for styling purposes only)
    var div = document.createElement('div');
    div.id = 'test-wrapper';
    //insert placeholder
    var placeholder = document.createElement('div');
    placeholder.id = 'test-placeholder';

    //add to page
    div.appendChild(placeholder);
    document.body.appendChild(div);

    //disable timestamp
    window.console.timeStamp = function() {};
}

//global vizabi helps us know if something should be initialized
var vizabi;
function initializeVizabi(viz, options, done) {

    var interval = 1000;
    if (typeof vizabi === 'undefined') {
        window.initializeDom();
    }
    vizabi = new Vizabi(viz, "#test-placeholder", options);

    window.setTimeout(function() {
        done();
    }, interval);
    return vizabi;
}

function mobile(bool, orientation) {

    var placeholder = $("#test-placeholder");
    if(bool) {
        placeholder.addClass('mobile');
        if(!orientation) orientation = "portrait";
        if(orientation === 'landscape') {
            placeholder.addClass('landscape');
        }
        else {
            placeholder.removeClass('landscape');
        }
    }
    else {
        placeholder.removeClass('mobile');
        placeholder.removeClass('landscape');
    }
    forceResizeEvt();
}

function mapSet(model) {
    return mapParameter(model, '_set');
}

function mapReady(model) {
    return mapParameter(model, '_ready');
}

function mapParameter(model, par) {
    var map = {};
    for (var i in model._data) {
        var submodel = model._data[i];
        if (submodel == null || (typeof submodel._id === "undefined")) continue;
        map[i] = {};
        map[i] = mapParameter(submodel, par);
        map[i][par] = submodel[par];
    }
    return map;
}

function forceResizeEvt() {
    //force resize
    event = document.createEvent("HTMLEvents");
    event.initEvent("resize", true, true);
    event.eventName = "resize";
    window.dispatchEvent(event);
}

//simulate d3 click
jQuery.fn.d3Click = function () {
  this.each(function (i, e) {
    var evt = document.createEvent("MouseEvents");
    evt.initMouseEvent("click", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);

    e.dispatchEvent(evt);
  });
};