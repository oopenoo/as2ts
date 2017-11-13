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

let parse_property = function(buf) {
    var property = {};
    var static_pro = new Array();
    let pos = 0;
    let reg = null;
    let result = null;

    reg = /(?:private|public|protected)\s+((?:static)\s)*((?:get|set)\s)*(\w+)\(.*{/g;
    while ((result = reg.exec(buf)) != null)  {
        var mb = result[3];
        if ( typeof(result[1]) !== 'undefined' ) {
            static_pro.push(mb);
        } else if ( typeof(result[2]) !== 'undefined' ) {
            property[mb] = 1;
        } else {
            property[mb] = 1;
        }
        console.log(mb + " | " + result[1] + "|" + result[2]);
    }
    reg = /(?:private|public|protected)\s*(static\s+)*(\w+):\w+.*;/g;
    while ((result = reg.exec(buf)) != null)  {
        var mb = result[2];
        if ( typeof(result[1]) !== 'undefined' ) {
            static_pro.push(mb);
        } else {
            property[mb] = 1;
        }
        pos = Math.max(pos,reg.lastIndex);
    };


    console.log( " pos=" + pos + " match:" );
    let ret = new Object;

    ret.pos = pos;
    ret.static_pro = static_pro;
    ret.property = new Array();
    for (let name in property) {
        ret.property.push(name);
    }
    return ret;
};
    
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

    let info = parse_property(buf);
    var arr = info.static_pro;
    var memebers = info.property;

    pos = info.pos;
    // console.log( " pos=" + pos );

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

let foo_test_buff = `
/** @private */
private static CustomList:any[] = [];
/**@private 矩阵变换信息。*/
protected _transform:Matrix;
/**@private */
protected _tfChanged:boolean;
/**@private */
protected _x:number = 0;
/**@private */
private static RUNTIMEVERION:string = __JS__("window.conch?conchConfig.getRuntimeVersion().substr(conchConfig.getRuntimeVersion().lastIndexOf('-')+1):''");

/**@private */
public createConchModel():any {
    return __JS__("new ConchNode()");
}

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
/**@inheritDoc */
public destroy(destroyChild:boolean = true):void {
    this._releaseMem();
    super.destroy(destroyChild);
    this._style && this._style.destroy();
    this._transform && this._transform.destroy();
    this._transform = null;
    this._style = null;
    this._graphics = null;
    this.cacheAs = 1;
    if (value == "bitmap") conchModel && conchModel.cacheAs(1);
}
public static fromImage(url:string):Sprite {
    return new Sprite().loadImage(url);
}
`;

function foo1()
{
    let buf = foo_test_buff;
    
    
    /*
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
*/

}

function foo2()
{
    let buf = foo_test_buff;
    let info = parse_property(buf);
    let funcs; 
    console.log("\n------------------\n static functions:");
    funcs = info.static_pro;
    for (let i = 0; i < funcs.length; i++)
    {
        let func_name = funcs[i];
        console.log(func_name);
    }
    console.log("\n------------------\n property:");
    funcs = info.property;
    for (let i = 0; i < funcs.length; i++)
    {
        let func_name = funcs[i];
        console.log(func_name);
    }
}
// foo2();
main();