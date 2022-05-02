const fs = require("fs");
const yargs = require("yargs/yargs");
const { hideBin } = require("yargs/helpers");
const clc = require("cli-color");
const path = require("path");
const argv = yargs(hideBin(process.argv)).argv;

export class Console {

    public handle() {
        if (argv._.length > 1) {
            var cmd = argv._[0].toString();
            var srcname = argv._[1].toString();
            var template = "template.txt";
            var cmdPath = cmd.replace(":", "/");
            var srcPath = "";
            var filePath = path.join(__dirname, '..', '..', "template", cmdPath, template);
            switch (cmd.toLowerCase()) {
                case "controller":
                    srcPath = path.join(process.cwd(), "src", "controllers", srcname + ".ts");
                    break;
                case "middleware":
                    srcPath = path.join(process.cwd(), "src", "middlewares", srcname + ".ts");
                    break;
                case "model":
                    srcPath = path.join(process.cwd(), "src", "models", srcname + ".ts");
                    break;
                case "schema":
                    srcPath = path.join(process.cwd(), "src", "schema", srcname + ".ts");
                    break;
                case "repository":
                    srcPath = path.join(process.cwd(), "src", "repository", srcname + ".ts");
                    if(argv.crud){
                        var filePath = path.join(__dirname, '..', '..', "template", cmdPath, 'crud.txt');
                    }
                    break;
                case "socket":
                case "socket:controller":
                    srcPath = path.join(process.cwd(), "src", "sockets", srcname + ".ts");
                    break;
                case "socket:middleware":
                    srcPath = path.join(process.cwd(), "src", "sockets", srcname + ".ts");
                    break;
                case "view":
                    var ext = "html.twig";
                    srcPath = path.join(process.cwd(), "src", "views", srcname + "." + ext);
                    if (argv.folder) {
                        var viewFolder = argv.folder;
                        srcPath = path.join(process.cwd(), "src", "views", viewFolder);
                        if (!fs.existsSync(srcPath)) {
                            fs.mkdirSync(srcPath);
                        }
                        srcPath = path.join(srcPath, srcname + "." + ext);
                    }
                    if (argv.ext) {
                        ext = argv.ext;
                    }
                    var viewPath = path.join(
                        process.cwd(),
                        "node_modules",
                        "easy-ts-api",
                        "template",
                        "view",
                        "index." + ext
                    );
                    if (fs.existsSync(viewPath)) {
                        var content = fs.readFileSync(viewPath);
                        fs.writeFileSync(srcPath, content.toString());
                        console.log(
                            clc.white.bgGreen(`${cmd.replace(":", " ")} created successfully`)
                        );
                    }
                    break;
                default:
                    this.showHelp();
                    break;
            }
            if (fs.existsSync(filePath)) {
                var content = fs.readFileSync(filePath);
                content = content.toString().replaceAll("{{name}}", srcname);
                console.log(srcPath);
                fs.writeFileSync(srcPath, content);
                console.log(
                    clc.white.bgGreen(`${cmd.replace(":", " ")} ${srcname} created successfully`)
                );
            }
        } else {
            if (argv.helpme) {
                this.showHelp();
            } else {
                console.log(
                    clc.white.bgRed("Unknow command, use --helpme to show avalaible command.")
                );
            }
        }
    }
    public showHelp() {
        console.log("List of avalaible command: ");
        console.log("\tcontroller <name> -- to create controller");
        console.log("\tmiddleware <name> -- to create middleware");
        console.log("\tmodel <name> -- to create model");
        console.log("\trepository <model name> -- to create repository");
        console.log("\tsocket <name> -- to create controller");
        console.log("\tsocket:middleware <name> -- to create controller");
        console.log("\tview <name> --folder=<folder> --ext=<extension>  -- to create view");
    }
}