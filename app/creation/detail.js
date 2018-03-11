
// 
import React from 'react';
 
import {
  StyleSheet,
  Text,
  ActivityIndicator,
  Dimensions,
  View
} from 'react-native';
var IonIcons = require('react-native-vector-icons/Ionicons')
var Video = require('react-native-video').default
var width = Dimensions.get('window').width

var Detail = React.createClass({
	getInitialState () {
		var data = this.props.data

		return {
			data: data,
			videoLoaded: false,
			rate: 1,
			resizeMode: 'cover',
			muted: true,
			repeat: false,

			videoProgress: 0.01,
			videoTotal:0,
			currentTime:0,
			playing: false
		}
	},
	_backToList () {
    	this.props.navigator.pop()
	},
	_onLoad () {
		console.log('_onLoad')
	},
	_onProgress (data) {
		if (!this.state.videoLoaded) {
			this.setState({
				videoLoaded: true,
				playing: true
			})
		}
		var duration = data.playableDuration
		var currentTime = data.currentTime
		var percent = Number( (currentTime / duration).toFixed(2))
		
		var newState = {
			videoTotal: duration,
			currentTime: Number( (currentTime / duration).toFixed(2)),
			videoProgress: percent
		}

		if(!this.state.videoLoaded) { // 当视屏开始播放的时候，更新loaded状态，即：加载完毕
			newState.videoLoaded = true
		}

		if(!this.state.playing) { // 当视屏开始播放的时候，更新loaded状态，即：正在播放
			newState.playing = true
		}
		this.setState(newState)
	},
	_onEnd () {
		this.setState({
			videoProgress: 1,
			playing: false
		})
	},
	_onError (e) {
		console.log(e)
		console.log('_onError')
	},
	_rePlay () {
		this.refs.videoPlayer.seek(0)
	},
	render () {
		var data = this.props.data
		return (
			<View style={styles.container}>
			<Text onPress = {this._backToList} style = {styles.center}>go back</Text>
			<View style = {styles.video.Box}>
				<Video
				ref = 'videoPlayer'
				source = {{uri: data.url}}
				style = {styles.video}

				volume = {5} // 声音放大倍数
				pause = {false} // 是否暂停
				rate = {this.state.rate} // rate 的取值是 0 和1  ， 0是暂停，1是正常
				muted = {this.state.muted} // muted 是否静音 true false
				resizeMode = {this.state.resizeMode}// 视屏拉伸方式
				repeat = {this.state.repeat}

				//配置视屏播放和在播放过程有关的回调函数

				onLoadStart = {this._onLoadStart} //视屏开始加载时的回调
				onLoad = {this._onLoad} // 视屏不断加载时的回调

				// 了解当前视屏播放的进度，同时提供用户提示 ，视屏播放的时候，每隔250毫秒，
				//调用一次onPgregress 同时将当前的已播放时间作为参数传入回调
				onProgress = {this._onProgress} 
				onEnd = {this._onEnd}
				onError = {this._onError}
				/>
				{
					!this.state.videoLoaded && <ActivityIndicator color= '#EE735C' style = {styles.loading} />
				}

				{
					this.state.videoLoaded && !this.state.playing ? <IonIcons onPress = {this._rePlay} size={48} name = 'ios-play' style = {styles.playIcon} /> : null
				}
				<View style = {styles.progressBox}>
					<View style = {[styles.progressBar, {width: width * this.state.videoProgress}]}>

					</View>
				</View>
			</View>
			</View>
		)
	}
})

var styles = StyleSheet.create({
  tabContent: {
    flex: 1,
    alignItems: 'center',
  },
  videoBox: {
	  width: width,
	  height: 360,
	  backgroundColor: '#000'
  },
  video: {
	  width: width,
	  height:360,
	  backgroundColor: '#000'
  },
  loading: {
	  position: 'absolute',
	  left:0,
	  top:140,
	  width: width,
	  alignSelf: 'center',
	  backgroundColor: 'transparent'
  },
  progressBox: {
	  width: width,
	  height: 2,
	  backgroundColor: '#ccc',
  },
  progressBar: {
	  height: 2,
	  width: 1,
	  backgroundColor: '#ff6600'

  },
  playIcon:{
   	position: 'absolute',
      top: 140,
      left: width / 2 -30,
      width: 60,
      height: 60,
      paddingTop:8,
      paddingLeft: 22,
      backgroundColor: 'transparent',
      borderColor: '#fff',
      borderWidth: 1,
      borderRadius: 30,
      color: '#ed7b66'
  }
});

module.exports = Detail