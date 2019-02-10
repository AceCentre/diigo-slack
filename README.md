# Add & Search links on Diigo from Slack

Taken from the blueprint : https://glitch.com/~slack-action-and-dialog-blueprint

NB: Add your env vars - you will need your API key from DIIGo as well as all the regular stuff from Slack

#### Remix this code

[![Remix on Glitch](https://cdn.glitch.com/2703baf2-b643-4da7-ab91-7ee2a2d00b5b%2Fremix-button.svg)](https://glitch.com/edit/#!/remix/slack-clipit-simplified)

1. Get the code
    * Remix this repo at https://glitch.com/edit/#!/remix/slack-clipit-simplified
2. Set the following environment variables to `.env` with your API credentials (see `.env.sample`):
    * `SLACK_ACCESS_TOKEN`: Your app's bot token, `xoxb-` token (available on the Install App page, after you install the app to a workspace once.)
    * `SLACK_SIGNING_SECRET`: Your app's Signing Secret (available on the **Basic Information** page)to a workspace)  
3. If you're running the app locally:
    1. Start the app (`npm start`)
    1. In another window, start ngrok on the same port as your webserver
​
#### Add a Action
1. Go back to the app settings and click on **Interactive Components**.
2. Click "Enable Interactive Components" button:
    * Request URL: Your ngrok or Glitch URL + `/actions` in the end (e.g. `https://example.ngrok.io/actions`)
    * Under **Actions**, click "Create New Action" button
      * Action Name: `Clip the message`
      * Description: `Save this message to ClipIt! app`
      * Callback ID: `clipit`
3. Save
