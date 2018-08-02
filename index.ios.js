/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 */

var IonIcons = require('react-native-vector-icons/Ionicons')
import React , { Component }from 'react';

import {
  AppRegistry,
  StyleSheet,
  Navigator,
  Text,
  TabBarIOS,
  View,
  AsyncStorage
} from 'react-native';

//创建内容子组件
var List = require('./app/creation/index')
var Edit = require('./app/edit/index')
var Login = require('./app/account/login')
var Account = require('./app/account/index')
var myFunReactNative = React.createClass({
  statics: {
    title: '<TabBarIOS>',
    description: 'Tab-based navigation.',
  },
  displayName: 'myFunReactNative',
  getInitialState () {
    return {
      selectedTab: 'Edit',
      isLogin: false,
      user:null
    };
  },

  _renderContent (color: string, pageText: string, num?: number) {
    return (
      <View style={[styles.tabContent, {backgroundColor: color}]}>
        <Text style={styles.tabText}>{pageText}</Text>
        <Text style={styles.tabText}>{num} re-renders of the {pageText}</Text>
      </View>
    );
  },

  componentDidMount() {
    this._asyncAppStatus()
  },
  _logout() {
    AsyncStorage.removeItem('user')
    this.setState({
      logined: false,
      user: null
    })
  },
  _asyncAppStatus() {
    var that = this
    console.log('get user')
    AsyncStorage.getItem('user')
    .then((data) => {
      var user
      var newState = {};
      if(data) {
        user = JSON.parse(data)
      }
      if(user && user.accessToken) {
        newState.user = user
        newState.isLogin = true
      }else{
        newState.isLogin = false
      }
      that.setState(newState)
    })
  },
  _afterLogin(user) {
    console.log('====== user ======')
    console.log(1,user)
    var that = this
    var user =JSON.stringify(user)
    //登陆成功后，更新本地存储的数据
    AsyncStorage.setItem('user',user)
    .then(()=>{
      that.setState({
        user:user,
        isLogin:true
      })
    })
  },
  render () {
    if(!this.state.isLogin) {
      return <Login afterLogin={this._afterLogin}/>
    }
    return (
      <TabBarIOS tintColor="#ee735c">
        <IonIcons.TabBarItem
          iconName="ios-videocam-outline"
          selectedIconName="ios-videocam"
          selected={this.state.selectedTab === "List"}
          onPress={() => {
            this.setState({
              selectedTab: 'List'
            });
          }}>
        <Navigator
          initialRoute = {{
            name: 'list',
            component: List
          }}

          configureScene = {(route) => {
            return Navigator.SceneConfigs.FloatFromRight
          }}

          renderScene = {(route,navigator) => {
            var Component = route.component

            return <Component {...route.params} navigator = {navigator}/>
          }}

        />
        </IonIcons.TabBarItem>
        <IonIcons.TabBarItem
          iconName="ios-recording-outline"
          systemIcon="history"
          selectedIconName="ios-recording"
          selected={this.state.selectedTab === "Edit"}
          onPress={() => {
            this.setState({
              selectedTab: 'Edit'
            });
          }}>
		      <Edit  user = {this.state.user}/>
        </IonIcons.TabBarItem>
        <IonIcons.TabBarItem
          iconName="ios-more-outline"
          selectedIconName="ios-more"
          selected={this.state.selectedTab === "Account"}
          onPress={() => {
            this.setState({
              selectedTab: 'Account'
            });
          }}>
          <Account logout = {this._logout} user = {this.state.user}/>
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
