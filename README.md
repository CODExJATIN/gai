# GAI — Git + AI CLI Tool

A minimal, terminal-native CLI tool that supercharges your Git workflow with AI. Use it to automatically generate conventional commit messages, explain terminal errors, and initialize smart repositories.



## Installation

Install `gai` globally via npm:

```bash
npm install -g @codexjatin/gai
```

### Development Setup

To contribute or run from source:

1. Clone the repository
2. Install dependencies: `npm install`
3. Link the package: `npm link`

## Setup

First, initialize your AI provider (supports **Google Gemini** and local **Ollama**):

```bash
gai start
```

This will walk you through an interactive setup to choose your provider, enter your API key, and select a model.

## Commands

### `gai commit`
Generates a concise, 1-line conventional commit message based on your currently staged changes (`git diff --staged`).

```bash
git add .
gai commit
```

**Options:**
- `-y, --yes`: Skip the confirmation prompt and auto-commit immediately.

### `gai init`
A smarter `git init`. This command will:
1. Initialize a new local Git repository (or run in the current folder)
2. Scan your project structure using AI to automatically generate a tailored `.gitignore`
3. Optionally create and push to a remote **GitHub repository** (requires the `gh` CLI)

```bash
gai init
```

### `gai explain`
Pass an error message or log directly to the AI to get a simple, plain-text explanation and suggested fix.

```bash
gai explain "TypeError: undefined is not a function"
```

You can also pipe terminal output directly into it:
```bash
npm run build 2>&1 | gai explain
```

### `gai config`
Manage your AI settings directly from the terminal without having to run through the interactive setup again. Configurations are namespaced per provider, so switching providers won't overwrite your settings.

```bash
# View all config
gai config get

# Switch active provider
gai config switch ollama
gai config switch gemini

# Set specific provider options
gai config set model gemini-2.0-flash
gai config set apiKey <your-new-key>
gai config set endpoint http://localhost:11434
```

## Providers Supported

- **Gemini** (Uses the official `@google/genai` SDK)
- **Ollama** (Runs completely locally, no internet connection required)

## Configuration
Settings are stored locally in `~/.gai/config.json`.

<p align="center">
  <img src="https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif" width="300" />
</p>

> **Fun Fact**  
> Every single commit in this project is generated using `gai commit`.
