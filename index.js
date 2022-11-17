const fs = require('fs');
const path = require('path');
const React = require('react');
const babelCore = require('@babel/core');
const reactDom = require('react-dom/server');

// define routes for output
const routesPath = './routes';
const absoluteRoutesPath = path.join(__dirname, routesPath);
const absoluteOutPath = path.join(__dirname, 'out');
const absoluteDistPath = path.join(__dirname, 'dist');
const absolutePublicPath = path.join(absoluteOutPath, 'public');

// get all the directories list
let routes = fs.readdirSync(absoluteRoutesPath);

// check whether the routes are directories, else ignore
routes = routes.filter((route) => {
  if (fs.lstatSync(`${absoluteRoutesPath}/${route}`).isDirectory()) {
    return route;
  }
});

const routeGenPromises = routes.map((route) => {
  buildRoute(route);
});

// fs.rmdirSync(absoluteDistPath);

function buildRoute(route) {
  fs.readdir(`${absoluteRoutesPath}/${route}`, function (err, files) {
    // check for the existance of [route].jsx file
    // if not, throw an error
    const doesJsxExist = files.some((file) => {
      return file === `${route}.jsx`;
    });
    if (!doesJsxExist) {
      throw new Error(
        `JSX file is missing for route: ${route}\nCreate a file named ${route}.jsx for page component.`
      );
    }

    // transform jsx to js
    babelCore
      .transformFileAsync(`${absoluteRoutesPath}/${route}/${route}.jsx`)
      .then((transformed) => {
        const code = transformed.code;

        // if (!fs.existsSync(absoluteDistPath)) {
        //   fs.mkdirSync(absoluteDistPath);
        // }

        // fs.writeFileSync(`${absoluteDistPath}/${route}.js`, transformed.code);

        // generate html markup and write to out
        fetchAndBuildMarkup(code, route);
      })
      .catch((err) => console.log(err, 'dddd'));
  });
}

function fetchAndBuildMarkup(code, route) {
  const jsModule = eval(code);

  // check if the page has fetcher
  // if yes, run the fetcher and pass the results
  if (jsModule['fetcher']) {
    jsModule['fetcher']().then((data) => generateMarkup(jsModule, route, data));
  } else {
    generateMarkup(jsModule, route);
  }
}

function generateMarkup(jsModule, route, props = {}) {
  // check for route skeleton, if doesn't exist use the default one
  let skeletonPath = path.join(__dirname, 'skeleton.html');
  if (fs.existsSync(`${absoluteRoutesPath}/${route}/skeleton.html`)) {
    skeletonPath = `${absoluteRoutesPath}/${route}/skeleton.html`;
  }

  const skeleton = fs.readFileSync(skeletonPath, 'utf-8');

  const routeMarkup = reactDom.renderToString(
    React.createElement(jsModule[capitalizeFirstLetter(route)], props)
  );

  if (!skeleton.includes('</body>')) {
    throw new Error(
      `Route "${route}"'s skeleton or default skeleton is invalid`
    );
  }

  // Generate a CSS file if exists and link it in markup
  const styleFile = buildCSS(route);

  if (!fs.existsSync(absoluteOutPath)) {
    fs.mkdirSync(absoluteOutPath);
  }

  if (!fs.existsSync(absolutePublicPath)) {
    fs.mkdirSync(absolutePublicPath);
  }

  // populate the skeleton with the generated markup
  let markup = skeleton.replace('</body>', `${routeMarkup}</body>`);

  if (styleFile) {
    markup = markup.replace(
      '</head>',
      `<link rel="stylesheet" href="${styleFile}" />`
    );
  }

  fs.writeFileSync(
    `${absolutePublicPath}/${route === 'home' ? 'index' : route}.html`,
    markup
  );
}

function buildCSS(route) {
  // check whether style file exists
  const routeStyleFile = `${absoluteRoutesPath}/${route}/style.css`;
  if (fs.existsSync(routeStyleFile)) {
    fs.copyFileSync(routeStyleFile, `${absoluteOutPath}/public/${route}.css`);
    return `${route}.css`;
  }
  return null;
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}
