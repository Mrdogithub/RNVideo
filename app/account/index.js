var IonIcons = require('react-native-vector-icons/Ionicons')
import React from 'react';

import {
  StyleSheet,
  Text,
  View
} from 'react-native';

var Account = React.createClass({
    render () {
      return (
        <View style={styles.container}>
          <Text>账户页面</Text>
        </View>
      )
    }
})

var styles = StyleSheet.create({
  tabContent: {
    flex: 1,
    alignItems: 'center',
  },
  tabText: {
    color: 'white',
    margin: 50,
  },
});

module.exports = Account