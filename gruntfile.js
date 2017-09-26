module.exports = function (grunt) {
    grunt.initConfig({
        ts: {
            build: {
                tsconfig: true
            },
            options: {
                fast: "never"
            }
        },

        exec: {
            package: {
                command: "tfx extension create --rev-version --manifests vss-extension.json --output-path ./dist",
                stdout: true,
                stderr: true
            }
            // publish: {
            //     command: "tfx extension publish --service-url https://marketplace.visualstudio.com --manifests vss-extension.json",
            //     stdout: true,
            //     stderr: true
            // }
        },

        copy: {
            scripts: {
                files: [{
                    expand: true, 
                    flatten: true, 
                    src: ["node_modules/vss-web-extension-sdk/lib/VSS.SDK.min.js"],
                    dest: "build",
                    filter: "isFile" 
                }]
            }
        },

        clean: {
            all: ["scripts/**/*.js", "*.vsix", "build"]
        }
    });
    
    
    grunt.loadNpmTasks("grunt-ts");
    grunt.loadNpmTasks("grunt-exec");
    grunt.loadNpmTasks("grunt-contrib-copy");
    grunt.loadNpmTasks("grunt-contrib-clean");

    
    grunt.registerTask("cleanup", ["clean:all"]);
    grunt.registerTask("build", ["cleanup", "ts:build", "copy:scripts"]);
    grunt.registerTask("package", ["build", "exec:package"]);
    //grunt.registerTask("publish", ["package", "exec:publish"]);
    
    grunt.registerTask("default", ["build"]);
};