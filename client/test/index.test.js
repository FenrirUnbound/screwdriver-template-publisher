'use strict';

const assert = require('chai').assert;
const Client = require('../');

describe('main', () => {
  let client;

  beforeEach(() => {
    client = new Client({
      host: 'api.screwdriver.cd'
    });
  });

  describe('login', () => {
    it('gets a jwt', () => {
      return client.login()
      .then((jwt) => {
        assert.isString(jwt);
      });
    });
  });

  describe('events', () => {
    it('gets an event builds', () => {
      return client.getEventBuilds(12638)
      .then((payload) => {
        console.log(payload);
      });
    });
  });

  describe('pipelines', () => {
    it('gets a pipeline workflow commits', () => {
      return client.getWorkflowCommits(271)
      .then((payload) => {
        assert.isArray(payload);

        assert.strictEqual(payload[0].id, 2106);
      });
    });
  });

  describe('builds', () => {
    it.skip('starts a build', () => {
      return client.startBuild(2106)
      .then((payload) => {
        console.log(payload);
      });
    });
  });
});
