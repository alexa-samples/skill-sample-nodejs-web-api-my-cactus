## Web Application Usage Instructions

You are in the subdirectory for the web Application for the my cactus skill. To use this, you will need to have [npm](https://www.npmjs.com/) installed. 

## Structure of the webapp directory

All of the source JS code is in the `./src` directory. 3D Art/animations and audio assets can be found under `./dist/assets/source-art` and `./dist/assets/audio`, respectively. 

This web application relies on glb files for the meshes and animations. [ThreeJS](https://threejs.org/)'s gltf loader is used to import the .glb files. 

Also included in the `./dist` directory is the index.html file. This is what is served to the Alexa device and contains a reference to the compiled JS. The JS in `./src` uses [webpack](https://webpack.js.org/) to modularize the code and pack this into a single main.js file which is served from a web server. The main file to be run is `./src/index.js`. This contains the game loop, rendering logic, and asset loading logic. Game object controllers can be found in the [blinds.js](./src/blinds.js). [badges.js](./src/badges.js), [cactus.js](./src/cactus.js), [pail.js](./src/pail.js), and [spider.js](./src/spider.js) files. Each of these expose methods for handling animations, setup, update, etc for that object alone.  The other notable code file is the selector.js which includes the selection logic used in the update loop. 

There is a set of [mock data](./src/mockStartupData.json) for startup on a computer where the Alexa JS runtime is not available. To ease creation of this, or testing on devices which are not Alexa-enabled, you can adjust the mock data 

The node dependencies include http-server for development purposes which will start a web server locally. You will need to use another tool to create a publicly accessible https endpoint to serve on your Alexa device. One example is [ngrok](https://ngrok.com/).

Another option is to use the publicly accessible resources made when you deploy the skill code. See the README.md in the skill directory for more information. 

This is for demonstration purposes. When deploying to production, you will want to use something more advanced than a local http-server. For instance, you can use S3 + Cloudfront with a nicer DNS bound to your cloudfront url (remember, your customers will see your domain and uri!).

## How to run the web application

All dependencies are declared in the package.json file. There are also some build commands for your convenience. 

1. Fork/clone/download this repository and navigate to this directory (webapp).
2. Run `npm init` to initialize your dependencies. Threejs as a core dependency and http-server and webpack as dev dependencies.
3. Now, you can make use of the custom commands. Run using `npm run <command>`.

### NPM run command purposes

`npm run buildOpen`: webpacks the src js files, runs the http-server, and opens the page on localhost. Builds everything and starts a fresh instance. 
`npm run build`: performs the webpack build only. 
`npm run open`: starts the server and opens the page on localhost.
`npm run buildConstant`: sets webpack to listen on file changes and builds immediately upon saving. Useful for rapid iteration.
`npm run uploadS3`: uploads the assets to S3 bucket set in the environment variable, MY_CACTUS_S3. Note you will need to build/deploy the skill side of the project before the S3 bucket that will be used in the code is created. Use the public domain for the bucket as the value for MT_CACTUS_S3.

If you need to kill the server, use ctrl+c and restart with one of the open commands. 
Note, the server is started in "no-cache" mode (-c-1 flag) for MUCH easier development and debugging. You do not want to run your production application like this as it will slow down the customer experience on repeat skill invocations. 

## Running tests manually

First make sure jasmine dependency is installed:

 cd lambda
 npm install --save-dev jasmine

Now initialize jasmine:

 npx jasmine init

Now, you can run tests from the `lambda` directory with 

 npm test



## Bugs?

Please open bug reports on Github using Github issues. Include the steps taken to reproduce. You can use this for suggested improvements, as well.

Feel free to fork and open a pull request if you have a fix or improvement to make, also!