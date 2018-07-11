var IonIcons = require('react-native-vector-icons/Ionicons')
var ImagePicker = require('NativeModules').ImagePickerManager //获取照片管理器模块
var sha1 = require('sha1')
var request = require('../common/request.js')
var config = require('../common/config.js')
import React, { Component } from 'react';

import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,  
  AlertIOS,
  AsyncStorage,
  Dimensions//获取设备宽度
} from 'react-native';
import { SSL_OP_PKCS1_CHECK_1 } from 'constants';
var width = Dimensions.get('window').width

var CLOUDINARY = {
	'base': 'https://res.cloudinary.com/RNAPP',
	'image': 'https://api.cloudinary.com/v1_1/RNAPP/image/upload',
	'video': 'https://api.cloudinary.com/v1_1/RNAPP/video/upload',
	'audio': 'https://api.cloudinary.com/v1_1/RNAPP/raw/upload',
	'cloud_name': 'RNAPP',
	'api_key': '742529175474162',
	'api_secret': 'mQw7cY0UOWJnphnqgN0zv6xdnUo',
}

function avatar(id, type) {
	return CLOUDINARY.base + '/' + type + '/upload/' + id
}
var Account = React.createClass({
	getInitialState(){
		var user = this.props.user || {};
		return {
			user: user
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
		console.log(1, options)
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
					var signature = 'folder=' + folder + '&tags=' + tags + '&timestamp=' + timestamp + CLOUDINARY.api_secret

					signature = sha1(signature)
					var body = new FormData()

					body.append('folder', folder)
					body.append('signature', signature)
					body.append('tags', tags)
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

				// 生成图片的标准地址
				user.avatar = avatar(response.public_id, 'image')

				that.setState({user: user})
			}
		}

		xhr.send(body)
	},
    render () {
      return (
        <View style={styles.container}>
			<View style={styles.toolbar}>
				<Text style={styles.toolbarTitle}>我的账户</Text>
			</View>
			{
				this.state.user.avatar
				?
					<TouchableOpacity style={styles.avatarContainer} onPress = {this._pickPhoto}>
						<Image 
							source={{uri: this.state.user.avatar}}
							style={styles.avatarContainer}>
							<View style={styles.avatarBox}>
								<Image 
									source={{uri: this.state.user.avatar}}
									style={styles.avatar}/>
							</View>
							<Text style={styles.avatarTip}>更换头像</Text>
						</Image>
					</TouchableOpacity>
				:
				<TouchableOpacity style={styles.avatarContainer} onPress = {this._pickPhoto}>
					<Text style={styles.avatarTip}>添加头像</Text>
					<View style={styles.avatarBox}>
						<IonIcons name="ios-cloud-upload-outline" style={styles.plusIcon}></IonIcons>
					</View>
				</TouchableOpacity>
			}
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
	}
});

module.exports = Account