# How to Run MCP Server with Claude


![[claude-settings.png]]

![[claude-settings-developer.png]]

Click `Edit Config` and open the file `claude_desktop_settings.json` in your favorite text editor. Change the `args` key value for `pizza-api` to point to wherever you cloned `mcp-server.js` on your local computer.

It should read like this

```
{
  "preferences": {
    "coworkWebSearchEnabled": true,
    "coworkScheduledTasksEnabled": false,
    "sidebarMode": "chat"
  },
  "mcpServers": {
    "pizza-api": {
      "command": "node",
      "args": ["/Users/ppham/src/bobs-react-app/mcp-server.js"],
      "env": {
        "API_BASE": "http://localhost:5000"
      }
    }
  }
}
```

Exit Claude, including the tray icon, and start it again from scratch, for the config settings to take effect.