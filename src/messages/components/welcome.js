import React, { Component } from 'react'
import {
    Wiew,
    Text,
    StyleShet,
    SafeAreaView,
    StyleSheet
} from 'react-native'

class Welcome extends Component {
    render() {
        return (
            <SafeAreaView>
              <Text>Bienvenido</Text>
            </SafeAreaView>
        )
    }
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#fff',
		paddingBottom: 10
	}
});


export default Welcome;