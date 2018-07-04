var IonIcons = require('react-native-vector-icons/Ionicons')
var ImagePicker = require('NativeModules').ImagePickerManager //获取照片管理器模块
import React, { Component } from 'react';

import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  AsyncStorage,
  Dimensions//获取设备宽度
} from 'react-native';
var width = Dimensions.get('window').width
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
			title: '选择头像',
			cancelButtonTitle:'取消',
			takePhotoButtonTitle:'拍照',
			chooseFromLibraryButtonTitle:'选择相册',
			quality:0.75,
			allowsEditing:true,
			noData: false,
			storageOptions: { 
			  skipBackup: true, 
			  path: 'images'
			}
		  };
		ImagePicker.showImagePicker(options, (response) => {

			//

			var that = this
			if (response.didCancel) {
				return 
			}

			//reponse 返回的是从手机中选取的图片数据，默认是base64格式
			var avatarData = 'data:image/jpeg;base64,' + response.data
			var user = that.state.user
			user.avatar = avatarData
			that.setState({ user: user })

		  });
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