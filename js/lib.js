// from http://stackoverflow.com/questions/979975/how-to-get-the-value-from-url-parameter
// Could be improved on.
function getURLParameters()
{
    var sURL = window.document.URL.toString();
    var params = {};
    if (sURL.indexOf("?") > 0)
    {
        var arrParams = sURL.split("?");
        var arrURLParams = arrParams[1].split("&");
        for (var i=0;i<arrURLParams.length;i++)
        {
            var sParam =  arrURLParams[i].split("=");
            if (sParam[1] != "")
                params[sParam[0]] = unescape(sParam[1]);
            else
                params[sParam[0]] = null;
        }
    }
    return params;

}

function assert(condition, message) {
    if (!condition) {
        throw message || "Assertion failed";
    }
}

String.prototype.format = function() {
    // 'Added {0} by {1} to your collection'.format(title, artist)
    // http://stackoverflow.com/a/2648463
    var s = this,
        i = arguments.length;

    while (i--) {
        s = s.replace(new RegExp('\\{' + i + '\\}', 'gm'), arguments[i]);
    }
    return s;
};