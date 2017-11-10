var fs = require('fs');
var as2ts;
(function (_as2ts) {
    function main() {
        new as2ts();
    }
    var as2ts = (function () {
        function as2ts() {
        }
        return as2ts;
    })();
    _as2ts.main = main;
    _as2ts.as2ts = as2ts;
})(as2ts || (as2ts = {}));

as2ts.main();
let convert = function (str) {
    var reg = /demo/g;
    var result;
    var class_name = "";
    
    result = /class\s+(\w+)\s+{/.exec(str);
    if (result != null) {
        class_name = result[1];
    }
    console.log( "class name:" + class_name );
    //console.log(str.match(/(public\s+set\s+\w+\([^\)]*\)\s*):\s*void/g));

    // console.log(str.match( /\/\/import\s+(\w+\.)+\w+;/g ));
    ///import laya.utils.Stat;
    reg = /\/\/import\s+((?:\w+\.)+)(\w+);/g
    result = str.match(reg);
    // for (var index = 0; index < result.length; index++)
    // {
    //     console.log(result[index]);
    // }
    str = str.replace(reg, "import $2 = $1$2;");
    
    var pos = 0;
    var arr = new Array();
    reg = /(?:private|public|protected)\s*static\s+(\w+):\w+.*;/g;
    while ((result = reg.exec(str)) != null)  {
        var mb = result[1];
        arr.push(mb);
        pos = Math.max(pos,reg.lastIndex);
    }
    console.log( " pos=" + pos );
    
    str = str.replace(/([^\\n]*)module {/, "$1module laya {");

    var buf = str.substr(pos);
    for (var i = 0; i < arr.length; i++)
    {
        var mbname = arr[i];
        var patt1 = new RegExp("([^\\n\\.]+)("+mbname+")","g");
        console.log("\n------------------ " + mbname);
        console.log( buf.match(patt1) );
        buf = buf.replace(patt1, "$1" + class_name + ".$2");
    }
    str = str.substr(0,pos) + buf;

    str = str.replace(/(public\s+set\s+\w+\([^\)]*\)\s*):\s*void/g, "$1");
    str = str.replace(/public\s+dynamic\s+class\s+(\w+)/g, "export class $1");
    
    return str;
};

let readText = function (f) {
    return fs.readFileSync(f).toString();
};

function writeText(f, text) {
    fs.writeFileSync(f, text);
}

let srctsfile = process.argv[2];
console.log('>' + srctsfile );
let text = readText(srctsfile); //  "\tpublic set lineJoin(value:string):void {";
text = convert(text);
let dstfname = srctsfile;
dstfname = dstfname.replace(/\.ts/, '.tx');
writeText(dstfname, text);
console.log( 'OK' );
console.log( '' );