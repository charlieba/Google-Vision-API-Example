import React from 'react';
import {
	Text,
  View,
  StyleSheet,
  SafeAreaView
} from 'react-native';

import Home from './src/screens/containers/home';
import Photo from './src/photo/containers/photo';
import Welcome from './src/messages/components/welcome';


export default class App extends React.Component {
	render() {
		return (
      <Home>
        <Photo/>
      </Home>
    );
	}
}

