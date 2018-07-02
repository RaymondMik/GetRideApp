const env = process.env.NODE_ENV || 'development';

if (env === 'development'|| env === 'test') {
  const configuration = require('./config.json');

  // assign process variables (PORT,  MONGODB_URI) according to object in config
  for (let config in configuration[env]) {
    if (configuration[env].hasOwnProperty(config)) {
      process.env[config] = configuration[env][config]
    }
  }
}