

module.exports = function(ctx) {
    // make sure android platform is part of build
    if (ctx.opts.platforms.indexOf('android') < 0) {
        return;
    }

    var fs = ctx.requireCordovaModule('fs'),
     path = ctx.requireCordovaModule('path');
        //deferral = ctx.requireCordovaModule('q').defer();
    var q = ctx.requireCordovaModule('q');
    var deferred = q.defer();

    var promisesToRun = [];

    // var platformRoot = path.join(ctx.opts.projectRoot, 'platforms/android');

    // var gradleFile = path.join(platformRoot, 'build-extras.gradle');

    // var copyFile = fs.createReadStream(path.join(ctx.opts.projectRoot,'scripts/build-extras.gradle')).pipe(fs.createWriteStream(gradleFile));
    // promisesToRun.push(copyFile);
    var _ = require('lodash');
    var xml2js = require('xml2js');
    var parser = new xml2js.Parser();
    var xpath = require('xpath')
  , dom = require('xmldom').DOMParser;
    var configFilePath = path.normalize(path.join(ctx.opts.projectRoot + '/config.xml'));

    fs.readFile(configFilePath, { encoding:'utf8' }, function(err, data) {
        if(err) throw err;
        // console.log(data);
        var doc = new dom().parseFromString(data);
        var select = xpath.useNamespaces({"myns": "http://www.w3.org/ns/widgets"});
        var title = select("//myns:config-file[@parent='CFBundleDisplayName']/myns:string/text()", doc)[0].nodeValue;
        var appName = title;
        var filePath='/platforms/android/app/src/main/res/values/strings.xml'
        var stringXmlFilePath = path.normalize(path.join(ctx.opts.projectRoot + filePath));
        var stringXmlJson;
        if (! fileExists(stringXmlFilePath)) {
            //stringXmlJson
            stringXmlJson = {
                "resources": {
                    "string":[]
                }
            };
            console.log("file not exist");
            deferred.resolve();
            //promisesToRun.push(processResult(context, lang.lang, langJson, stringXmlJson));
        }
        else {
            //lets read from strings.xml into json
            fs.readFile(stringXmlFilePath, { encoding:'utf8' }, function(err, data) {
                if(err) throw err;
                parser.parseString(data, function (err, result) {
                    if(err) throw err;
                    stringXmlJson = result;

                    // initialize xmlJson to have strings
                    if (!_.has(stringXmlJson, "resources") || !_.has(stringXmlJson.resources, "string")) {
                        stringXmlJson.resources = {
                            "string":[]
                        };
                    }
                    console.log(stringXmlJson.resources.string[0]._);

                    stringXmlJson.resources.string[0]._ = appName;

                    var writeStringsXml = fs.writeFile(stringXmlFilePath, buildXML(stringXmlJson), { encoding:'utf8' }, function(err) {
                        if(err) throw err;
                        console.log('Saved:' + stringXmlFilePath);
                        deferred.resolve();
                    });
                    
                });
            });
        }
        console.log("title == " + title);
    });
    

    return deferred;

    function fileExists(path) {
        var fs = require('fs-extra');
        try  {
            return fs.statSync(path).isFile();
        }
        catch (e) {
            return false;
        }
    }

   function buildXML(obj) {
        var builder = new xml2js.Builder();
        builder.options.renderOpts.indent = '\t';
        var x = builder.buildObject(obj);
        return x.toString();
    }


};