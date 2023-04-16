# ApexHackthon


## TSG
### 1. How to set webpack.config.js

If you encounter an error about the missing Node.js core module while running the project, such as' http ', you need to follow the following steps to configure the webpackconfig.js file:



1. Open the 'webpack. config. js' file in the project.

2. Find the 'resolve' attribute in the 'module. exports' object.

3. Add a new attribute called 'fallback' inside the 'resolve' object.

4. Add an object for this' fallback 'attribute, which contains the polyfill that needs to be added. For example, if you need the 'HTTP' module, you can add it as follows:

```javascript
module.exports = {
  // ... other configurations ...

  resolve: {
    // ... other resolve configurations ...

    fallback: {
      // ... other fallback configurations ...
      http: require.resolve('stream-http'),
    },
  },

  // ... other configurations ...
};
