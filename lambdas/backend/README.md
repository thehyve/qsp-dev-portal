# Backend code

This is uploaded as a Lambda to AWS API gateway.

To start development, run
```shell
yarn install
yarn add --force file:../_common
```

In every session, or in your `~/.bashrc` or `~/.zshrc`, include
```shell
export AWS_SDK_LOAD_CONFIG=true
```

To test the code, run
```shell
yarn test
```

To make a local request including API Gateway context, run, e.g.,
```shell
yarn request '{"httpMethod": "GET", "path": "/catalog"}'
# to parse the output with jq, use for example:
(yarn request '{"httpMethod": "GET", "path": "/catalog"}' 2>&1 >/dev/null ) | jq
```

To run a local server, run
```shell
yarn local
```
