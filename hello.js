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

let memeber_add_this = function(buf, mname) {
    let patt;
    patt = /([\s\)\(\.=)])((?!(?:get|this|set))\w+[\s\)\(=)]+)(#1)([\s\)\(\.=)])/g;
    patt = new RegExp( patt.source.replace("#1", mname), "g");
    // console.log("source:\n" + patt.source );
    console.log( buf.match(patt) );
    buf = buf.replace(patt, "$1$2this.$3$4");
    
    patt = /(\n\s+)(#1)([\s\)\(\.=)])/g;
    patt = new RegExp( patt.source.replace("#1", mname), "g");
    console.log( buf.match(patt) );
    buf = buf.replace(patt, "$1this.$2$3");
    // console.log( buf );
    return buf;
}

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
    // console.log( " pos=" + pos );

    var memebers = new Array();
    reg = /(?:private|public|protected)\s+(\w+):\w+.*;/g;
    while ((result = reg.exec(str)) != null)  {
        var mb = result[1];
        memebers.push(mb);
        pos = Math.max(pos,reg.lastIndex);
    }
    console.log( " pos=" + pos );




    // module    
    str = str.replace(/([^\\n]*)module {/, "$1module laya {");

    // static members
    var buf = str.substr(pos);
    for (let i = 0; i < arr.length; i++)
    {
        var mbname = arr[i];
        var patt1 = new RegExp("([^\\n\\.]+)("+mbname+")","g");
        // console.log("\n------------------ " + mbname);
        // console.log( buf.match(patt1) );
        buf = buf.replace(patt1, "$1" + class_name + ".$2");
    }
    memebers.push("cacheAs");
    memebers.push("_childs");
    // normal members
    for (let i = 0; i < memebers.length; i++)
    {
        buf = memeber_add_this(buf, memebers[i]);
    }
    
    str = str.substr(0,pos) + buf;


    // [Event(name = "resize", type = "laya.events.Event")]
    // str = str.replace(/[^\n]\[.*\]/g, "$1");
    console.log("***");
    console.log( str.match( /[^\n/\[]+\[Event.*\]/g ));
    str = str.replace(/([^\n/\[]+)(\[Event.*\])/g, "$1// $2");

    str = str.replace(/(public\s+set\s+\w+\([^\)]*\)\s*):\s*void/g, "$1");
    str = str.replace(/public\s+dynamic\s+class\s+(\w+)/g, "export class $1");
    str = str.replace(/:Vector\.</g, ":Array<")
    
    //console.log(str.match( /:Vector\.</g ));
    return str;
};

let readText = function (f) {
    return fs.readFileSync(f).toString();
};

function writeText(f, text) {
    fs.writeFileSync(f, text);
}

function main() {
    let srctsfile = process.argv[2];
    console.log('>' + srctsfile );
    let text = readText(srctsfile); //  "\tpublic set lineJoin(value:string):void {";
    text = convert(text);
    let dstfname = srctsfile;
    dstfname = dstfname.replace(/\.ts/, '.tx');
    writeText(dstfname, text);
    console.log( 'OK' );
    console.log( '' );
}

function foo1()
{
    let buf = `
    public set cacheAsBitmap(value:boolean):void {
        //TODO:去掉关联
        cacheAs = value ? (_$P["hasFilter"] ? "none" : "normal") : "none";
        if (cacheAs == "good") {

        }
    }
    public get cacheAs():string {
        return _$P.cacheCanvas == null ? "none" : _$P.cacheCanvas.type;
    }
    public set cacheAs(value:string):void {
    }
    this.cacheAs = 1;
    if (value == "bitmap") conchModel && conchModel.cacheAs(1);
    `;
    let mname = 'cacheAs';
    let patt;

    patt = /([\s\)\(\.=)])((?!(?:get|this|set))\w+[\s\)\(=)]+)(#1)([\s\)\(\.=)])/g;
    patt = new RegExp( patt.source.replace("#1", mname), "g");
    // console.log("source:\n" + patt.source );
    console.log( buf.match(patt) );
    buf = buf.replace(patt, "$1$2this.$3$4");

    patt = /(\n\s+)(#1)([\s\)\(\.=)])/g;
    patt = new RegExp( patt.source.replace("#1", mname), "g");
    console.log( buf.match(patt) );
    buf = buf.replace(patt, "$1this.$2$3");
    console.log( buf );
}
main();