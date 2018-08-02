var IonIcons = require('react-native-vector-icons/Ionicons')
var Progress = require('react-native-progress')
var ImagePicker = require('NativeModules').ImagePickerManager //获取照片管理器模块
var sha1 = require('sha1')
var request = require('../common/request.js')
var config = require('../common/config.js')
import Button from 'react-native-button';
import React, { Component } from 'react';

import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,  
  AlertIOS,
  Modal,
  TextInput,
  AsyncStorage,
  Dimensions//获取设备宽度
} from 'react-native';
var width = Dimensions.get('window').width

var CLOUDINARY = {
	'base': 'https://res.cloudinary.com/dsf3opwhl',
	'image': 'https://api.cloudinary.com/v1_1/dsf3opwhl/image/upload',
	'video': 'https://api.cloudinary.com/v1_1/dsf3opwhl/video/upload',
	'audio': 'https://api.cloudinary.com/v1_1/dsf3opwhl/raw/upload',
	'cloud_name': 'dsf3opwhl',
	'api_key': '742529175474162'
}

function avatar(id, type) {
	if (id.indexOf('http') > -1) {
		return id
	}

	if(id.indexOf('data:image') > -1) {
		return id
	}

	return CLOUDINARY.base + '/' + type + '/upload/' + id
}
var Account = React.createClass({
	getInitialState(){
		var user = this.props.user || {};
		return {
			user: user,
			avatarProgress: 0,
			avatarUploading: false,
			modalVisible: false,
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
	},
	_pickPhoto(){
		var options = {
			// quality: 0.5,
			// maxWidth: 300,
			// maxHeight: 300,
			// allowsEditing: false,
			// storageOptions: {
			//   skipBackup: true
			// }
			title: '选择头像',
			cancelButtonTitle:'取消',
			takePhotoButtonTitle:'拍照',
			chooseFromLibraryButtonTitle:'选择相册',
			// quality:0.75,
			// allowsEditing:true,
			// noData: false,
			// storageOptions: { 
			//   skipBackup: true, 
			//   path: 'images'
			// }
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
			var avatarData = 'data:image/jpeg;base64,' + response.data
			
			// var user = that.state.user
			// user.avatar = avatarData // 更新用户数据
			// that.setState({ user: user }) // 更新user 状态
			

			// 构造cloudinary 参数列表
			var timestamp = Date.now()
			// 签名如果在本地做， 显然会把serict暴露给外界，这样不安全，所以理论上应该在
			// 服务器端完成。 前端需要请求服务器来生成一个签名。
			var tags = 'app,avatar'
			var folder = 'avatar'
			var signatureUrl = config.api.base + config.api.signature
			var accessToken = this.state.user.accessToken
			request.post(signatureUrl,{
				accessToken: accessToken,
				timestamp: timestamp,
				type: 'avatar',
				folder: folder,
				tags: tags
			}).then((data) => {
				if (data && data.success) {

					var signature = data.data

					var body  = new FormData()
					body.append('folder', folder)
					// body.append('signature', signature)
					body.append('tags', tags)
					body.append('signature', signature)
					body.append('api_key', CLOUDINARY.api_key)
					body.append('resource_type', 'image')
					body.append('file', avatarData)
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
		var url = CLOUDINARY.image
		that.setState({
			avatarProgress: 0,
			avatarUploading: true
		})
		xhr.open('POST', url)

		xhr.onload = () => {
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
				var user = that.state.user
				// 生成图片的标准地址
				console.log('response.public_id')
				console.log(1, response)
				user.avatar = 'v' + response.version + '/' + response.public_id

				that.setState({
					user: user,
					avatarProgress: 0,
					avatarUploading: false
				})
				
				// 将更改后的图片地址保存到服务器端
				that._asyncUser(true)
			}
		}

		if (xhr.upload) {
			xhr.upload.onprogress = (event) => {
				if (event.lengthComputable) {
					var percent = Number((event.loaded / event.total).toFixed(2))
				}
				that.setState({
					avatarProgress: percent
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
	_edit() {
		this.setState({
			modalVisible: true
		})
	},
	_close() {
		this.setState({
			modalVisible: false
		})
	},
	_changeUserState(key, value) {
		var user = this.state.user
		user[key] = value

		this.setState({
			user: user
		})
	},
	_submit() {
		// 把用户所有的数据post到后端，通过后端更新数据库里的数据
		this._asyncUser()
	},
	_logout() {
		// 清空本地用户资料数据
		// 更新整个app 用户状态
		// 通过调用上层组件的方式，更新用户在整个app的状态

		this.props.logout()
	},
    render () {
      return (
        <View style={styles.container}>
			<View style={styles.toolbar}>
				<Text style={styles.toolbarTitle}>我的账户</Text>
				<Text style={styles.toolbarExtra} onPress = {this._edit}>编辑</Text>
			</View>
			{
				this.state.user.avatar
				?
					<TouchableOpacity style={styles.avatarContainer} onPress = {this._pickPhoto}>
						<Image 
							source={{uri: avatar(this.state.user.avatar, 'image')}}
							style={styles.avatarContainer}>
							<View style={styles.avatarBox}>
							{
								this.state.avatarUploading ? 
								<Progress.Circle
									size = {75} 
									showsText = {true}
									color = {'#ee735c'}
									progress = {this.state.avatarProgress} />
								: <Image source={{uri: avatar(this.state.user.avatar, 'image')}} style={styles.avatar}/>
							}

							</View>
							<Text style={styles.avatarTip}>更换头像</Text>
						</Image>
					</TouchableOpacity>
				:
				<TouchableOpacity style={styles.avatarContainer} onPress = {this._pickPhoto}>
					<Text style={styles.avatarTip}>添加头像</Text>
					<View style={styles.avatarBox}>
						{
							this.state.avatarUploading ? 
							<Progress.Circle
								size = {75} 
								showsText = {true}
								color = {'#ee735c'}
								progress = {this.state.avatarProgress} />
							: <IonIcons name="ios-cloud-upload-outline" style={styles.plusIcon}></IonIcons>
						}
						
					</View>
				</TouchableOpacity>
			}
			<Modal
				 animationType={"slide"}
				 visible = {this.state.modalVisible}
			>
				<View style = {styles.modalContainer}>
					<IonIcons
						name = 'ios-close-outline'
						style = {styles.closeIcon}
						onPress = {this._close}
					/>
					<View style = {styles.fieldItem}>
						<Text style = {styles.lable}>昵称</Text>
						<TextInput
							placeHolder = {'输入你的昵称'}
							style = {styles.inputField}
							autoCapitalize = {'none'}
							auto = {false}
							defaultValue = {this.state.user.nickname}
							onChangeText = {(text) => {
								this._changeUserState('nickname',text)
							}}
						/>
					</View>

					<View style = {styles.fieldItem}>
						<Text style = {styles.lable}>品种</Text>
						<TextInput
							placeHolder = {'品种'}
							style = {styles.inputField}
							autoCapitalize = {'none'}
							auto = {false}
							defaultValue = {this.state.user.breed}
							onChangeText = {(text) => {
								this._changeUserState('breed',text)
							}}
						/>
					</View>

					<View style = {styles.fieldItem}>
						<Text style = {styles.lable}>年龄</Text>
						<TextInput
							placeHolder = {'年龄'}
							style = {styles.inputField}
							autoCapitalize = {'none'}
							auto = {false}
							defaultValue = {this.state.user.age}
							onChangeText = {(text) => {
								this._changeUserState('age',text)
							}}
						/>
					</View>
					<View style = {styles.fieldItem}>
						<Text style = {styles.lable}>性别</Text>
						<IonIcons.Button
							onPress = {() => {
								this._changeUserState('gender', 'male')
							}}
							style = {
								[styles.gender,this.state.user.gender === 'male' && styles.genderChecked]
							}
							name = 'ios-hand-outline'
						>男</IonIcons.Button>
						<IonIcons.Button
							onPress = {() => {
								this._changeUserState('gender', 'female')
							}}
							style = {
								[styles.gender,this.state.user.gender === 'female' && styles.genderChecked]
							}
							name = 'ios-hand'
						>女</IonIcons.Button>
					</View>
					<Button style={styles.btn} onPress = {this._submit}>保存</Button>
				</View>
				
			</Modal>
			<Button style={styles.btn} onPress = {this._logout}>退出登录</Button>
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
	modalContainer: {
		flex:1,
		paddingTop:50,
		backgroundColor: '#fff'
	},
	fieldItem: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		height: 50,
		paddingLeft: 15,
		paddingRight: 15,
		borderColor: '#eee',
		borderBottomWidth: 1
	},
	lable: {
		color: '#eee',
		marginRight: 10
	},
	inputField: {
		height: 50,
		flex: 1,
		color: '#666',
		fontSize: 14
	},
	closeIcon: {
		position: 'absolute',
		width: 40,
		height: 40,
		fontSize: 32,
		right: 20,
		top: 30,
		color: '#ee735c'
	},
	gender: {
		backgroundColor: '#ccc'
	},
	genderChecked: {
		backgroundColor: '#ee735c'
	},
	avatarContainer:{
		width:width,
		height:140,
		alignItems:'center',
		justifyContent:'center',
		backgroundColor:'#666'
	},
	avatarTip:{
		backgroundColor:'transparent',
		color:'#fff',
		fontSize:14
	},
	avatar:{
		marginBottom:15,
		width:width * 0.2,
		height:width * 0.2,
		resizeMode:'cover',
		borderRadius:width*0.1

	},
	avatarBox:{
		marginTop:15,
		alignItems:'center',
		justifyContent:'center'
	},
	plusIcon:{
		padding:20,
		paddingRight:25,
		paddingLeft:25,
		color:'#999',
		fontSize:24,
		backgroundColor:'#fff',
		borderRadius:8
	},
	btn:{
        padding:10,
		marginTop:25,
		marginLeft:10,
		marginRight:10,
        backgroundColor:'transparent',
        borderColor:'#ee735c',
        borderWidth:1,
        borderRadius:4,
        color:'#ee735c'
    },
});

module.exports = Account