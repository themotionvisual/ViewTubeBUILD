# Gemini CLI Commands

Commands are categorized by their prefix or usage context. The Gemini CLI can be run via npx

## Run

- `npx @google/gemini-cli`
- `npx @google/gemini-cli "Your prompt here"`
- `npm install -g @google/gemini-cli` (Then just run `gemini` directly)

## Interactive Slash Commands (/)

These are used within the Gemini CLI REPL to control the environment and session:

### Core Control

- `/help` (or `/?`): For help on gemini-cli.
- `/about`: Show version info.
- `/quit` (or `/exit`): Exit the CLI.
- `/clear`: Clear the screen and conversation history.
- `/stats`: Check session stats (usage: `/stats [session|model|tools]`).
- `/docs`: Open full Gemini CLI documentation in your browser.
- `/theme`: Change the theme.
- `/bug`: Submit a bug report.
- `/shortcuts`: Toggle the shortcuts panel above the input.
- `/footer`: Configure items appearing in the statusline.

### Session & History

- `/resume` (or `/chat`): Browse auto-saved conversations and manage chat checkpoints.
- `/compress`: Summarize context to save tokens.
- `/copy`: Copy the last output or code snippet to clipboard.
- `/rewind`: Jump back to a specific message and restart.
- `/restore`: Undo changes from a specific tool call.

### Workflow & Modes

- `/plan`: Switch to Plan Mode and view current plan.
- `/vim`: Toggle Vim mode on/off.
- `/shells`: Toggle background shells visibility.
- `/tasks`: Toggle background tasks view.
- `/init`: Generate a tailored GEMINI.md file for the project.

### Agent & Tool Management

- `/agents`: Manage subagents.
- `/commands`: Manage custom slash commands (usage: `/commands [reload]`).
- `/extensions`: Manage extensions.
- `/hooks`: Manage lifecycle hooks.
- `/mcp`: Manage Model Context Protocol servers.
- `/skills`: Manage expert workflows (list, enable, disable).
- `/tools`: List available tools (use `/tools desc` for descriptions).
- `/memory`: Commands for interacting with memory.

### Configuration

- `/auth`: Manage authentication.
- `/directory`: Manage workspace directories.
- `/editor`: Set external editor preference.
- `/ide`: Manage IDE integration.
- `/model`: Manage model configuration.
- `/permissions`: Manage folder trust settings.
- `/privacy`: Display data consent and privacy notice.
- `/policies`: Manage policies.
- `/upgrade`: Upgrade your Gemini Code Assist tier.

## At Commands (@)

Used to inject context directly into your prompt:

- `@<path>`: Injects the content of a file or directory (e.g., `@src/main.ts` or `@docs/`).
- `@`: Sent as-is to the model (useful for talking about the symbol itself).

## Shell & Passthrough Commands (!)

- `!<command>`: Executes a one-off shell command (e.g., `!ls -la`).
- `!` (Lone symbol): Toggles "Shell Mode" where all input is treated as a shell command.

## External CLI Commands

Commands executed from your system terminal:

- `gemini`: Starts an interactive session.
- `gemini update`: Updates the CLI.
- `gemini extensions <subcommand>`: Manages extensions (install, list, update).
- `gemini mcp <subcommand>`: Manages MCP servers.
- `gemini skills <subcommand>`: Manages skills.

---

## 2. Workflows

- **Default Mode**: Interactive chat with per-tool approval prompts.
- **Plan Mode**: Read-only research environment. Generates a Markdown plan for approval.
- **ACP Mode (--acp)**: Agent Client Protocol mode for programmatic control via JSON-RPC.
- **Headless Mode (-p / --prompt)**: Non-interactive execution for scripts/CI.
- **YOLO Mode (--approval-mode yolo)**: Automatic approval of all tool calls.

---

## 3. Process Management & Steering

### Starting & Stopping

- **Interrupt**: Press `Ctrl+C` while the agent is working.
- **Quit**: `Ctrl+C` (on empty input), `Ctrl+D`, or `/quit`.
- **Suspend**: `Ctrl+Z` to background the process.

### Steering (Real-time Guidance)

- **Steering Hints**: Type feedback while the agent is working and press Enter.
- **Approval Cycling**: `Shift+Tab` to cycle between Default, Auto-Edit, and Plan modes.
- **Plan Editing**: `Ctrl+X` when a plan is presented to edit it externally.
- **Input Queuing**: `Tab` while the agent is busy to queue the next prompt.
- **YOLO Toggle**: `Ctrl+Y` to toggle auto-approval.

### UI & Navigation

- **Background Shells**: `Ctrl+B` (Toggle visibility), `Ctrl+L` (List all), `Ctrl+K` (Kill active).
- **History & State**: `Esc (Twice)` (Session browser), `/restore` (Undo tool), `Alt+Z / Shift+Alt+Z` (Undo/Redo input).

---

## 4. Skills & Superpowers (Reference)

Specialized capabilities often triggered automatically or via `/skills`:

- **Caveman Suite**: (`/caveman`, `/caveman-review`, `/caveman-commit`, `/caveman-help`, `/caveman:compress`). Focuses on token efficiency and terse communication.
- **Superpowers**:
  - `writing-plans`: Create specs before code.
  - `systematic-debugging`: Deep dive into bugs before fixing.
  - `test-driven-development`: Writing tests before implementation.
  - `verification-before-completion`: Evidence-based task finishing.
  - `subagent-driven-development`: Parallel task execution.

---

## 5. Available Tools

- `activate_skill`: Manually trigger a skill.
- `ask_user`: Request clarification.
- `cli_help`: Access CLI documentation.
- `code_reviewer`: Perform automated reviews.
- `codebase_investigator`: Search and analyze the repository.
- `replace`: Edit file contents.
- `enter_plan_mode`: Trigger Plan Mode.
- `glob`: Find files by pattern.
- `google_web_search`: Search the live web.
- `list_background_processes`: Manage background jobs.
- `save_memory`: Persist information across sessions.
- `read_file` / `write_file`: File I/O.
- `list_directory`: View folder structures.
- `grep_search`: Text-based searching.
- `run_shell_command`: Execute system commands.
- `web_fetch`: Download content from URLs.
