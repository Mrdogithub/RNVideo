var IonIcons = require('react-native-vector-icons/Ionicons')
var ImagePicker = require('NativeModules').ImagePickerManager //获取照片管理器模块
var Video = require('react-native-video').default
var config = require('../common/config.js')
var request = require('../common/request.js')
var width = Dimensions.get('window').width
var height = Dimensions.get('window').height
var CLOUDINARY = {
	'base': 'https://res.cloudinary.com/dsf3opwhl',
	'image': 'https://api.cloudinary.com/v1_1/dsf3opwhl/image/upload',
	'video': 'https://api.cloudinary.com/v1_1/dsf3opwhl/video/upload',
	'audio': 'https://api.cloudinary.com/v1_1/dsf3opwhl/raw/upload',
	'cloud_name': 'dsf3opwhl',
	'api_key': '742529175474162'
}
import {CountDownText} from 'react-native-sk-countdown'
import {AudioRecorder, AudioUtils} from 'react-native-audio'
var IonIcons = require('react-native-vector-icons/Ionicons')
import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  AlertIOS,
  TouchableOpacity,
  ProgressViewIOS,
  AsyncStorage,
  Dimensions,
  Platform
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

			// video player
			rate: 1,
			muted: true, // 将视屏设置成静音
			resizeMode: 'contain',			
			repeat: false,
			
			// count down
			counting: false,
			recording: false,

			// audio
			audioName: 'rn'
		}
	},
	_initAudio() {
		let audioPath = AudioUtils.DocumentDirectoryPath + '/' + this.state.audioName
	  
		AudioRecorder.prepareRecordingAtPath(audioPath, {
			SampleRate: 22050,
			Channels: 1,
			AudioQuality: "High",
			AudioEncoding: "aac"
		})
        AudioRecorder.onProgress = (data) => {
          this.setState({currentTime: Math.floor(data.currentTime)});
        }

        AudioRecorder.onFinished = (data) => {
			if (Platform.OS === 'ios') {
				this._finishRecording(data.status === "OK", data.audioFileURL, data.audioFileSize);
			}
        }
	},
	componentDidMount(){
		var that = this;
		// 从存储在asyncstorage中的用户信息中获取用户头像
		AsyncStorage.getItem('user') //异步读取用户信息，如果存在用户信息，更新用户状态
			.then((data)=>{
				var user
				if (data) {
					user = JSON.parse(data)
				}
				user.avatar = '';
				AsyncStorage.setItem('user',JSON.stringify(user))
				if(user && user.accessToken) {
					that.setState({ //更新用户信息状态，接着会第二次触发render，进行模版的视图更新
						user:user
					})
				}
			})
		this._initAudio()
	},
	_getQiniuTOken() {
		var accessToken = this.state.user.accessToken
		var signatureUrl = config.api.base + config.api.signature // 构建签名地址
		return request.post(signatureUrl,{
			accessToken: accessToken,
			cloud: 'qiniu',
			type: 'video'
		}).catch((err)=> {
			console.log(err)
		})
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
			noData: false,
			// quality:0.75,
			// allowsEditing:true,
			// noData: false,
			storageOptions: { 
			  skipBackup: true, 
			  path: 'images'
			}
		  };

		ImagePicker.showImagePicker(options, (response) => {
			var that = this
			console.log('avatarData:' +response)
			if (response.didCancel) {
				return 
			}
			if (response.error) {
				console.log('response error:'+response.error)
			}
			//reponse 返回的是从手机中选取的图片数据，默认是base64格式
	
			// var user = that.state.user
			// user.avatar = avatarData // 更新用户数据
			// that.setState({ user: user }) // 更新user 状态
			

			// 签名如果在本地做， 显然会把serict暴露给外界，这样不安全，所以理论上应该在
			// 服务器端完成。 前端需要请求服务器来生成一个签名。
			
			var uri = response.uri
			that.setState({
				previewVideo: uri
			})
			that._getQiniuTOken().then((data)=>{
				if (data && data.success) {
					var token = data.data.token
					var key = data.data.key
					var body = new FormData()
					console.log('getQiniuResponse')
					console.log(1,data)
					body.append('token', token)
					body.append('key', key)
					body.append('file', {
						type: 'video/mp4',
						uri: uri,
						name: key
					})
					that._upload(body)
				}
			})
		})
	},
	_upload (body) {
		// _upload 方法实现了对视屏上传进度的监控, 包括上传前和上传后的管理
		var that = this
		//构建一个异步接口并生成一个实例
		var xhr = new XMLHttpRequest()
		var url = config.qiniu.upload

		that.setState({
			videoUploadedProgress: 0,
			videoUploading: true, // 正在上传中
			videoUploaded: false // 已经上传结束
		})
		xhr.open('POST', url)
	
		xhr.onload = function() {

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
			if (response) {
			
				that.setState({
					video: response,
					videoUploading: false, // 正在上传中
					videoUploaded: true // 已经上传结束
				})

				var videoURL = config.api.base + config.api.video
				var accessToken = that.state.user.accessToken

				request.post(videoURL, {
					accessToken: accessToken,
					video: response
				})
				.catch((err) => {
					console.log(err)
					AlertIOS.alert('视屏同步错误，请重新上传')
				})
				.then((data) => {
					console.log('视屏同步')
					console.log(data)
					if (!data || !data.success) {
						AlertIOS.alert('视屏同步出错，重新上传')
					}
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
	_onLoad () {
	},
	_onProgress (data) {

		var duration = data.playableDuration
		var currentTime = data.currentTime
		var percent = Number( (currentTime / duration).toFixed(2))

		this.setState({
			videoTotal: duration,
			currentTime: Number( (currentTime / duration).toFixed(2)),
			videoProgress: percent
		})
	},
	_onEnd () {
		if (this.state.recording) {
			this.setState({
				videoProgress: 1,
				recording: false
			})
		}
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
	_counting () {
		if (!this.state.counting && !this.state.recording) {			
			this.setState({
				counting: true
			})
		}

		this.refs.videoPlayer.seek(this.state.videoTotal - 0.01)
	},
	_record () {
		this.setState({
			videoProgress: 0, // 每次录制的时候都是重新开始录制
			recording: true,
			counting: false
		})

		this.refs.videoPlayer.seek(0)
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
								<Text style={styles.progressTip}>正在生成静音视屏,已完成{(this.state.videoUploadedProgress * 100).toFixed(2)} %</Text>
							</View>
							:null
						}
						{
							this.state.recording
							?<View style={styles.progressTipBox}>
								<ProgressViewIOS style={styles.progressBar} progressTintColor='#ee735c' progress={this.state.videoProgress}/>
								<Text style={styles.progressTip}>录制声音中</Text>
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

			{
				this.state.videoUploaded
				?   <View style = {styles.recordBox}>
						<View style = {[styles.recordIconBox,this.state.recording && styles.recordOn]}>
						{
							this.state.counting && !this.state.recording
							?   <CountDownText style={styles.countBtn} 
										countType='seconds' // 计时类型：seconds / date
										auto={true} // 自动开始
										afterEnd={this._record} // 结束回调
										timeLeft={3} // 正向计时 时间起点为0秒
										step={-1} // 计时步长，以秒为单位，正数则为正计时，负数为倒计时
										startText='准备录制' // 开始的文本
										endText='Go' // 结束的文本
										intervalText={(sec) => {
											return sec === 0 ? 'Go' : sec
										}} // 定时的文本回调
										/>
							: 	<TouchableOpacity onPress = {this._counting}>
									<IonIcons name = 'ios-mic' style = {styles.recordIcon}/>
								</TouchableOpacity>
						}
						</View>
					</View>
				: null
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
	},
	recordBox: {
		width: width,
		height: 60,
		alignItems: 'center'	
	},
	recordIconBox: {
		width: 68,
		height: 68,
		borderRadius: 34,
		backgroundColor: '#ee735c',
		borderWidth: 1,
		marginTop: -30,
		borderColor: '#fff',
		alignItems: 'center',
		justifyContent: 'center'
	},
	recordIcon: {
		fontSize: 58,
		backgroundColor: 'transparent',
		color: '#fff'
	},
	countBtn: {
		fontSize: 32,
		fontWeight: '600',
		color: '#fff'
	},
	recordOn: {
		backgroundColor: '#ccc'
	}
});

module.exports = Edit