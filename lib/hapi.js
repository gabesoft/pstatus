const pstatus = require('./index');
const Joi = require('joi');
const Boom = require('boom');
const Hoek = require('hoek');

const internals = {
  defaults: {
    endpoint: '/pstatus',
    auth: false
  },
  options: Joi.object({
    endpoint: Joi.string().allow(null),
    auth: Joi.object()
  })
};

/**
 * Hapi.js plugin that adds the process status functionality.
 */
exports.register = function pstatusPlugin(plugin, options, pluginNext) {
  const validate = internals.options.validate(options);

  if (validate.error) {
    return pluginNext(validate.error);
  }

  const settings = Hoek.clone(internals.defaults);
  Hoek.merge(settings, options);

  plugin.dependency([], (server, serverNext) => {
    server.route({
      method: 'GET',
      path: settings.endpoint,
      config: {
        auth: settings.auth,
        handler: (request, reply) => {
          pstatus((err, status) => {
            if (err) {
              reply(Boom.wrap(err, 500));
            } else {
              reply(status);
            }
          });
        },
        plugins: {
          pstatus: false
        }
      }
    });

    serverNext();
  });

  pluginNext();
};

exports.register.attributes = {
  pkg: require('../package.json')
};
