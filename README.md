# web2linux
Skeleton code for converting any webapp into a linux app.

## Development Dependencies
If you don't have it already, install the latest version of node.js.

I highly reccomend you use NVM to manage all that, so get that with `curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.31.4/install.sh | bash`.

Then restart your terminal and type `nvm install v6.4.0` to install the version of node.js that this was tested with. It'll probably work with newer versions, but if it doesn't work for you use `v6.4.0`.

## Setup
```
git clone https://github.com/nikhiljha/web2linux.git && cd web2linux
npm install
npm install -g electron-prebuilt
```

Then open `index.js` in your favorite editor, and set the variables at the top. The variables are all defined very well within the code, but if you want docs here then sure.

- **webAppURL** - The URL of the web app you want to convert into a Linux app. Duh.
- **frame** - You probably should just leave this default, but if you make it false then it won't have a border so then you can't close it.
- **title** - This is what shows up in the bar at the top of the application (if the previous var is true). It will show up as <whatyouput> for Linux. If you decide to compile for other non-Linux OS, then it will show up as <whatyouput> for <Platform>.

Then save that file and head back into the command line. You can test your app to see if it works with `electron .`

Go into `package.json` and change all the values to the values you want. **BE SURE TO CHANGE APP NAME, AUTHOR, BUG REPORTS, EVERYTHING TO WHAT YOU NEED IT TO BE.**

- **appId** - Reverse domain format, similar to how you name android apps. This is very important to change. Do not leave default.
- **app-category-type** - No idea what this is for, but change it anyway.
- **iconUrl** - URL to the app icon. Also see `build/ICONS.md`

## Icons

See `ICONS.md` in the "build" folder for information on how to setup icons.

One thing I didn't mention there is that you need to change the icon URL in the `package.json` as well.

## Building

**BEFORE YOU BUILD, ENSURE ALL VALUES IN PACKAGE.JSON ARE YOUR OWN.**

```
./node_modules/.bin/build
```

Easy.

## Common Bugs

`Error: spawn icns2png ENOENT`

I can't fix that. If someone else could help then that'd be great. It should still work though, just without an icon.
