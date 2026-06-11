# Google Cloud Rapid Agent Hackathon Demo

Live Demo:

<https://demo.stateflowx.com/>

This repository contains the demo application used for the Google Cloud Rapid Agent Hackathon submission.

## Overview

This demo showcases a complete StateFlowX workflow that combines:

* HTTP service execution
* Google Gemini
* Google ADK (Agent Development Kit)
* Google Agent Registry
* MCP (Model Context Protocol)
* MongoDB Atlas

The application executes a workflow and displays execution events in real time.

## How It Works

1. The workflow executes an HTTP weather service.
2. Weather data is returned from the service.
3. StateFlowX appends the service response to the workflow prompt.
4. A Google ADK agent is executed.
5. The ADK agent discovers MCP tools through Google Agent Registry.
6. Gemini invokes MCP tools exposed by the MongoDB MCP server.
7. The workflow returns structured JSON containing weather information and MongoDB data.
8. Execution events are streamed back to the dashboard in real time.

## Example Configuration

```typescript
defineConfig({
  transport: websocket(),
  protocol: jsonRpc(),

  services: [
    {
      name: 'weather',
      type: 'http'
    }
  ],

  workflows: [
    {
      route: 'weather.execute',
      service: 'weather',
      provider: 'google-adk'
    }
  ]
});
```

## Running The Demo

Install dependencies:

```bash
npm install
```

Start the application:

```bash
npm start
```

Open:

```text
http://localhost:4200
```

To execute the workflow, provide a Gemini API key. The key is used only for the current session and is not stored by the application.

## Repositories

* Demo Application
* StateFlowX Runtime
* StateFlowX Runtime Host Example

## Notes

The runtime used for the hackathon demo contains demo-specific Google ADK, Agent Registry, MCP, and MongoDB integrations.

For a reusable runtime host implementation, see the StateFlowX Runtime Host Example repository.
