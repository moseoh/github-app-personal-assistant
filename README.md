# personal-assistant-github-app

> A GitHub App built with [Probot](https://github.com/probot/probot) that A GitHub App that automates personal repository tasks like issue management and pull request labeling.

## Setup

```sh
# Install dependencies
npm install

# Run the bot
npm start
```

## Docker

```sh
# 1. Build container
docker build -t personal-assistant-github-app .

# 2. Start container
docker run -e APP_ID=<app-id> -e PRIVATE_KEY=<pem-value> personal-assistant-github-app
```

## Contributing

If you have suggestions for how personal-assistant-github-app could be improved, or want to report a bug, open an issue! We'd love all and any contributions.

For more, check out the [Contributing Guide](CONTRIBUTING.md).

## License

[ISC](LICENSE) © 2025 moseoh
