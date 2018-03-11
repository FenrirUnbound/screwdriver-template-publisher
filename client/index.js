'use strict';

const request = require('request-promise-native');
const url = require('url');

async function sendGet(host, pathname, bearer) {
  const body = await request({
    auth: {
      bearer
    },
    json: true,
    method: 'GET',
    uri: url.format({
      host,
      pathname,
      protocol: 'https'
    })
  });

  return body;
}

async function sendPost(host, pathname, bearer, payload) {
  const options = {
    auth: { bearer },
    body: payload,
    json: true,
    method: 'POST',
    url: url.format({
      host,
      pathname,
      protocol: 'https'
    })
  };

  return request(options);
}

class Client {
  constructor({ host, apiToken }) {
    this.host = host;
    this.apiToken = process.env.TOKEN || apiToken || '';
    this.token = null;
  }

  async login() {
    const body = await request({
      json: true,
      method: 'GET',
      uri: url.format({
        host: this.host,
        pathname: '/v4/auth/token',
        protocol: 'https',
        query: {
          api_token: this.apiToken
        }
      })
    });

    this.token = body.token;

    return body.token;
  }


  async startBuild(jobId) {
    if (!this.token) {
      await this.login();
    }

    const pathname = '/v4/builds';
    const payload = { jobId };
    const body = await sendPost(this.host, pathname, this.token, payload);

    return body;
  }

  async getEvent(eventId) {
    if (!this.token) {
      await this.login();
    }

    const pathname = `/v4/events/${eventId}`;
    const body = await sendGet(this.host, pathname, this.token);

    return body;
  }

  async getEventBuilds(eventId) {
    if (!this.token) {
      await this.login();
    }

    const pathname = `/v4/events/${eventId}/builds`;
    const body = await sendGet(this.host, pathname, this.token);

    return body;
  }

  async getPipeline(pipelineId) {
    if (!this.token) {
      await this.login();
    }

    const pathname = `/v4/pipelines/${pipelineId}`;
    const body = await sendGet(this.host, pathname, this.token);

    return body;
  }

  async getPipelineJobs(pipelineId) {
    if (!this.token) {
      await this.login();
    }

    const pathname = `/v4/pipelines/${pipelineId}/jobs`;
    const payload = await sendGet(this.host, pathname, this.token);

    return payload;
  }

  async getWorkflowCommits(pipelineId) {
    const [ pipeline, jobs ]  = await Promise.all([
        this.getPipeline(pipelineId),
        this.getPipelineJobs(pipelineId)
    ]);
    const jobNames = pipeline.workflowGraph.edges.reduce((acc, edge) => {
      if (edge.src === '~commit') {
        acc[edge.dest] = true;
      }

      return acc;
    }, {});
    const jobInfo = jobs.reduce((acc, job) => {
      if (jobNames.hasOwnProperty(job.name)) {
        acc.push(job);
      }

      return acc;
    }, []);

    return jobInfo;
  }
}

module.exports = Client;
