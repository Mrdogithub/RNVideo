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
  ActivityIndicator,
  View,
  Dimensions,
  AsyncStorage
} from 'react-native';

//创建内容子组件
var List = require('./app/creation/index')
var Edit = require('./app/edit/index')
var Login = require('./app/account/login')
var Slider = require('./app/account/slider')
var Account = require('./app/account/index')
var width = Dimensions.get('window').width
var height = Dimensions.get('window').height
var myFunReactNative = React.createClass({
  statics: {
    title: '<TabBarIOS>',
    description: 'Tab-based navigation.',
  },
  displayName: 'myFunReactNative',
  getInitialState () {
    return {
      selectedTab: 'list',
      isLogin: false,
      entered: false, // 是否是第一次进入app的标识位
      booted: false, //启动画面结束之后，登录状态同步之前的 加载页面状态
      user:null
    };
  },

  _renderContent (color: String, pageText: string, num?: number) {
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
    AsyncStorage.multiGet(['user', 'entered'])
    .then((data) => {
      var user
      var userData = data[0][1]
      var enteredData = data[1][1]
      var newState = {
		  booted: true
	  };
      if(userData) {
        user = JSON.parse(userData)
      }
      if(user && user.accessToken) {
        newState.user = user
        newState.isLogin = true
      }else{
        newState.isLogin = false
      }

      if (enteredData === 'yes') {
        newState.entered = true
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
  _enterSlide() {
    this.setState({
      entered: true
    }, function() {
      // 存储entered 标识位，用于下一次检查 entered状态。
      AsyncStorage.setItem('entered', 'yes')
    })
  },
  render () {
    if (!this.state.booted) { // 在获取用户登录状态之前的loading效果
		return (
			<View style = { styles.bootPage}>
				<ActivityIndicator color = "#ee735c"></ActivityIndicator>
			</View>
		)
    }

    if (!this.state.entered) { // 如果用户是第一次进入app 需要提供slider
      return <Slider enterSlide = {this._enterSlide}/>
    }

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
  bootPage: {
	  width: width,
	  height: height,
	  backgroundColor: "#fff",
	  justifyContent: 'center'
  }
});

module.exports = myFunReactNative;

AppRegistry.registerComponent('myFunReactNative', () => myFunReactNative);
