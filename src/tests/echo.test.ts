/* test('default', () => {
  expect(1).toBe(1);
}); */

import request from 'sync-request';
import config from './../config.json';

const OK = 200;
const INPUT_ERROR = 400;
const port = config.port;
const url = config.url;

// Iteration 2

describe('HTTP tests using Jest', () => {
  test('Test successful echo', () => {
    const res = request(
      'GET',
            `${url}:${port}/echo`,
            {
              qs: {
                echo: 'Hello',
              }
            }
    );
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toEqual('Hello');
  });
  test('Test invalid echo', () => {
    try {
      const res = request(
        'GET',
              `${url}:${port}/echo`,
              {
                qs: {
                  echo: 'echo',
                }
              }
      );
      expect(res.statusCode).toBe(INPUT_ERROR);
    } catch (err) {
      expect(err).toStrictEqual({ message: 'BadRequestError: Cannot echo "echo"' });
    }
  });
});
