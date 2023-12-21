**This repo is out of date and is archived. Check out [an updated tutorial on using FusionAuth with React Native](https://fusionauth.io/docs/quickstarts/quickstart-react-native) or [the updated GitHub repository](https://github.com/FusionAuth/fusionauth-quickstart-react-native).**


# React Native FusionAuth
Repository for Tutorial How to use FusionAuth with React Native.

### Installation

React Native requires [Node.js](https://nodejs.org/) v18+ and React native CLI to run.

1. Copy `env.example` to `.env`
2. Replace environment variables with your FusionAuth settings
3. Install the dependencies and start the React Native app.

Android:
```sh
npm i
npx react-native run-android
```

iOS:
```sh
npm i
npx react-native run-ios
```

When changing the `.env` file, you need to rebuild the app on iOS:

```sh
cd ios; pod deintegrate && pod install; cd ..
npx react-native run-ios
```

License
----
Apache2


