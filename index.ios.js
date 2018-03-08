/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 */

var IonIcons = require('react-native-vector-icons/Ionicons')
import React, {
  Component,
} from 'react';

import {
  AppRegistry,
  StyleSheet,
  Text,
  TabBarIOS,
  View
} from 'react-native';

//创建内容子组件
var List = require('./app/creation/index')
var Edit = require('./app/edit/index')
var Account = require('./app/account/index')

var myFunReactNative = React.createClass({
  statics: {
    title: '<TabBarIOS>',
    description: 'Tab-based navigation.',
  },
  displayName: 'myFunReactNative',
  getInitialState: function() {
    return {
      selectedTab: 'redTab',
    };
  },

  _renderContent: function(color: string, pageText: string, num?: number) {
    return (
      <View style={[styles.tabContent, {backgroundColor: color}]}>
        <Text style={styles.tabText}>{pageText}</Text>
        <Text style={styles.tabText}>{num} re-renders of the {pageText}</Text>
      </View>
    );
  },

  render: function() {
    return (
      <TabBarIOS tintColor="#ee735c">
        <IonIcons.TabBarItem
          iconName="ios-videocam-outline"
          selectedIconName="ios-videocam"
          selected={this.state.selectedTab === "blueTab"}
          onPress={() => {
            this.setState({
              selectedTab: 'blueTab'
            });
          }}>
          <List />
        </IonIcons.TabBarItem>
        <IonIcons.TabBarItem
          iconName="ios-recording-outline"
          systemIcon="history"
          selectedIconName="ios-recording"
          selected={this.state.selectedTab === "redTab"}
          onPress={() => {
            this.setState({
              selectedTab: 'redTab'
            });
          }}>
		  <Edit />
        </IonIcons.TabBarItem>
        <IonIcons.TabBarItem
          iconName="ios-more-outline"
          selectedIconName="ios-more"
          selected={this.state.selectedTab === "greenTab"}
          onPress={() => {
            this.setState({
              selectedTab: 'greenTab'
            });
          }}>
          <Account />
        </IonIcons.TabBarItem>
      </TabBarIOS>
    );
  }
});

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

module.exports = myFunReactNative;

AppRegistry.registerComponent('myFunReactNative', () => myFunReactNative);
