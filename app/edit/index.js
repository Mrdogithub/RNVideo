var IonIcons = require('react-native-vector-icons/Ionicons')
var ImagePicker = require('NativeModules').ImagePickerManager //获取照片管理器模块
var Video = require('react-native-video').default
var config = require('../common/config.js')
var request = require('../common/request.js')
var width = Dimensions.get('window').width
var height = Dimensions.get('window').height
var cloudinary = require('cloudinary')
var CLOUDINARY = {
	'base': 'https://res.cloudinary.com/dsf3opwhl',
	'image': 'https://api.cloudinary.com/v1_1/dsf3opwhl/image/upload',
	'video': 'https://api.cloudinary.com/v1_1/dsf3opwhl/video/upload',
	'audio': 'https://api.cloudinary.com/v1_1/dsf3opwhl/raw/upload',
	'cloud_name': 'dsf3opwhl',
	'api_key': '742529175474162'
}

import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  AlertIOS,
  TouchableOpacity,
  ProgressViewIOS,
  Dimensions
} from 'react-native';

var Edit = React.createClass({
	getInitialState(){
		var user = this.props.user || {};
		return {
			previewVideo: null,
			user: user,
			// video upload
			video: null,
			videoLoaded: false,
			videoUploading:false,
			videoUploaded: false,
			videoUploadedProgress: 0.01,

			// video loads
			videoTotal:0,
			currentTime:0,
			playing: false,
			paused: false,

			// video player
			rate: 1,
			muted: true,
			resizeMode: 'contain',			
			repeat: false,
		}
	},
	_pickVideo(){
		var options = {
			// quality: 0.5,
			// maxWidth: 300,
			// maxHeight: 300,
			// allowsEditing: false,
			// storageOptions: {
			//   skipBackup: true
			// }
			title: '选择视屏',
			cancelButtonTitle:'取消',
			takePhotoButtonTitle:'录制 10 秒视屏',
			chooseFromLibraryButtonTitle:'选择已有视屏',
			videoQuality: 'medium',
			mediaType: 'video',
			durationLimit: 10,
			// noData: false,

			// quality:0.75,
			// allowsEditing:true,
			// noData: false,
			storageOptions: { 
			  skipBackup: true, 
			  path: 'video'
			}
		  };
		ImagePicker.showImagePicker(options, (response) => {
			var that = this
			console.log('------------')
			console.log(1, response)
			console.log('------------')
			if (response.didCancel) {
				return 
			}
			if (response.error) {
				console.log('response error:'+response.error)
			}

			var videoData = response.uri
			var uri = response.uri;
			that.setState({
				previewVideo: uri
			})
			var timestamp = Date.now()
			var tags = 'app,video'
			var folder = 'video'
			var signatureUrl = config.api.base + config.api.signature
			var accessToken = this.state.user.accessToken
			request.post(signatureUrl,{
				accessToken: accessToken,
				timestamp: timestamp,
				type: 'video',
				folder: folder,
				tags: tags
			}).then((data) => {
				if (data && data.success) {
					
					var signature = data.data
					console.log(' data.data')
					console.log(1,  data)
					var body  = new FormData()
					body.append('folder', folder)
					// body.append('signature', signature)
					body.append('tags', tags)
					body.append('signature', signature)
					body.append('api_key', CLOUDINARY.api_key)
					body.append('resource_type', 'video')
					body.append('uri', videoData)
					body.append('file', '')
					body.append('timestamp', timestamp)

					that._upload(body)
				}
			})
		})
	},
	_upload (body) {

		var that = this
		//构建一个异步接口并生成一个实例
		var xhr = new XMLHttpRequest()
		var url = CLOUDINARY.video
		that.setState({
			videoUploadedProgress: 0,
			videoUploading: true,
			videoUploaded: false
		})
		console.log('url'+ url)
		xhr.open('POST', url)

		xhr.onload = () => {
			console.log('xhr')
			console.log(1, xhr)
			if (xhr.status !== 200) {
				AlertIOS.alert('请求失败')
				return
			}
			if (!xhr.responseText) {
				AlertIOS.alert('请求失败')
				return	
			}
			var response

			try {
				response = JSON.parse(xhr.response)
			} catch (e){
				console.log('parse fail')
			}

			// 如果存在public_id 说明图片已经上传完毕
			if (response && response.public_id) {
				that.setState({
					video: response,
					videoUploading: false,
					videoUploaded: true
				})

				var videoURL = config.api.base + config.api.video
				var accessToken = this.state.user.accessToken
				request.post(videoURL, {
					accessToken: accessToken,
					video: response
				})
				.catch((err)=> {
					AlertIOS.alert('视屏同步出错，请上传')
				})
			}
		}

		if (xhr.upload) {
			xhr.upload.onprogress = (event) => {
				if (event.lengthComputable) {
					var percent = Number((event.loaded / event.total).toFixed(2))
				}
				that.setState({
					videoUploadedProgress: percent
				})
			}
		}
		xhr.send(body)
	},
	_asyncUser (isAvatar) {
		var that = this
		// 获取当前状态的user （替换完头像之后的user）
		var user = that.state.user

		if (user.accessToken && user) { // 判断用户是否合法
			var url = config.api.base + config.api.update
			console.log('before update')
			console.log(1, user)
			request.post(url, user)
				.then((data) => {
					if (data && data.success) {
						console.log(1, data)
						var user  = data.data
						if (isAvatar) {
							AlertIOS.alert('更新头像成功！')
						}
						that.setState({
							user: user
						}, function() {
							that._close()
							AsyncStorage.setItem('user', JSON.stringify(user))
						})
					}
				})
		}
	},
	_onLoad () {
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
		this.setState({
			videoOk: false
		})
	},
	_rePlay () {
		this.refs.videoPlayer.seek(0)
	},
	_pause () {
		if(!this.state.paused) {
			this.setState({
				paused: true
			})
		}
	},
	_resume () {
		if(this.state.paused) {
			this.setState({
				paused: false
			})
		}
	},
    render () {
      return (
        <View style={styles.container}>
          <View style={styles.toolbar}>
			<Text style={styles.toolbarTitle}>
				{this.state.previewVideo ? '点击按钮配置' : '理解狗狗,从配音开始'}
			</Text>
			{
				this.state.previewVideo && this.state.videoUploaded 
				? <Text style={styles.toolbarExtra} onPress = {this._pickVideo}>更换视频</Text>
				: null
			}
          </View>
		  
		  <View style={styles.page}>
		  	{
				this.state.previewVideo 
				? <View style={styles.videoContainer}>
					<View style={styles.videoBox}>
						<Video
							ref = 'videoPlayer'
							source = {{uri: this.state.previewVideo}}
							style = {styles.video}

							volume = {5} // 声音放大倍数
							paused = {this.state.paused} // 是否暂停
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
							!this.state.videoUploaded && this.state.videoUploading
							? <View style={styles.progressTipBox}>
								<ProgressViewIOS style={styles.progressBar} progressTintColor='#ee735c' progress={this.state.videoUploadedProgress}/>
								<Text style={styles.progressTip}>正在生成静音视屏,已完成{(this.state.videoUploadedProgress * 100).toFixed(2)}</Text>
							</View>
							:null
						}
					</View>
				</View>
				: <TouchableOpacity style={styles.uploadContainer} onPress={this._pickVideo}>
					<View style={styles.uploadBox}>
						<Image source={require('../assets/images/record.png')} style={styles.uploadIcon}/>
						<Text style={styles.uploadTitle}>点击我上传视屏</Text>
						<Text style={styles.uploadDesc}>建议时长不超过20秒</Text>
					</View>
				</TouchableOpacity>
			}
		  </View>
        </View>
      )
	}
})

var styles = StyleSheet.create({
	container: {
		flex: 1,
  	},
	toolbar: {
		flexDirection:'row',
		paddingTop:25,
		paddingBottom:12,
		backgroundColor:'#ee735c'
	},
	toolbarTitle:{
		flex:1,
		fontSize:16,
		color:"#fff",
		textAlign:'center',
		fontWeight:'bold'
	},
	toolbarExtra: {
		position: 'absolute',
		right: 10,
		top: 26,
		color: '#fff',
		textAlign: 'right',
		fontWeight: '600',
		fontSize: 14
	},
	page: {
		flex: 1,
		alignItems: 'center'
	},
	uploadContainer: {
		marginTop: 90,
		width: width - 40,
		paddingBottom: 10,
		borderWidth: 1,
		borderColor: '#ee735c',
		justifyContent: 'center',
		borderRadius: 6,
		backgroundColor: '#fff'
	},
	uploadTitle: {
		marginBottom: 10,
		textAlign: 'center',
		fontSize: 16,
		color: '#000'
	},
	uploadDesc: {
		color: '#999',
		textAlign: 'center',
		fontSize: 12
	},
	uploadIcon: {
		width: 110,
		resizeMode: 'contain'
	},
	uploadBox: {
		flex: 1,
		flexDirection: 'column',
		justifyContent: 'center',
		alignItems: 'center'
	},
	video: {
		width: width,
		height:width * 0.56,
		backgroundColor: '#000'
	},
	videoContainer: {
		width: width,
		justifyContent: 'center',
		alignItems: 'center'
	},
	videoBox: {
		width: width,
		height: height * 0.3,
		backgroundColor: '#ccc'
	},
	progressTipBox: {
		position: 'absolute',
		left: 0,
		bottom: 0,
		width: width,
		height: 30,
		backgroundColor: 'rgba(244,244,244,0.55)'
	},
	progressTip: {
		color: '#333',
		width: width -10,
		padding: 5
	},
	progressBar: {
		width: width
	}
});

module.exports = Edit