import React from 'react';
import {
  AppRegistry,
	Text,
  View,
  StyleSheet,
  SafeAreaView
} from 'react-native';

import Home from './src/screens/containers/home';
import Photo from './src/photo/containers/photo';
import Welcome from './src/messages/components/welcome';
import BackgroundJob from "react-native-background-job";

BackgroundJob.register({
  jobKey: "myJobKey",
  job: () => console.log(`Background Job fired!. Key = `)
});

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = { jobs: [] };
}

  getAll() {
    BackgroundJob.schedule({
          jobKey: "myJobKey",
          period: 10000,
              exact: true,
allowExecutionInForeground: true
    });
}

  componentDidMount() {
    this.getAll();
  }

	render() {
		return (
      <Home>
        <Photo/>
      </Home>
    );
	}
}


AppRegistry.registerComponent("App", () => App);