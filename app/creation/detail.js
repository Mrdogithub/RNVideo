
// 
import React from 'react';
 
import {
  StyleSheet,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
  TextInput,
  AlertIOS,
  Modal,
  ListView,
  Image,
  View
} from 'react-native';
import Button from 'react-native-button'
var IonIcons = require('react-native-vector-icons/Ionicons')
var Video = require('react-native-video').default
// var Button = require('react-native-button')
var Request = require('../common/request')
var Config = require('../common/config')

var width = Dimensions.get('window').width
// 在状态之外管理列表里所有的数据
var cachedResult = {
    nextPage: 1,
    items: [], // 列表中所有的数据
    total: 0 // 列表长度
}

var Detail = React.createClass({
	getInitialState () {
		var data = this.props.data
		var ds = new ListView.DataSource({
            rowHasChanged: (r1, r2) => r1 !== r2
		})
		
		return {
			dataSource: ds.cloneWithRows([]), //评论的数据集
			data: data, // 当前视屏信息

			// video 加载
			videoLoaded: false,
			videoProgress: 0.01,
			videoTotal:0,
			currentTime:0,
			playing: false,
			paused: false,
			videoOk: true,

			// video 播放器
			rate: 1,
			muted: true,
			resizeMode: 'cover',			
			repeat: false,

			//modal
			animattionType: 'none',
			modalVisible: false,

			isSending: false, // 判断发送状态Flag
			content: ''
		}
	},
	componentDidMount () {
		this._fetchData(1)
	},
	_fetchData (page) {
        var that = this
        // 重置 isLoadingTail,表明正在请求
		this.setState({
			isLoadingTail: true
		})
		var url = Config.api.base + Config.api.comment
        Request.get(url,{
			accessToken: '123',
			creation: '123',
			page: page
        }).then((data) => {
			console.log("hi data")
			console.log(1,data)
            // 通过mockjs ，解析rap返回的数据
            if (data.success) {
                // clone 当前数据
                var items = cachedResult.items.slice()

				             
				// 更新缓存中的数据列表
                items = items.concat(data.data)
				cachedResult.nextPage += 1
                cachedResult.items = items
                cachedResult.total = data.total

				that.setState({
					dataSource: that.state.dataSource.cloneWithRows(cachedResult.items),
					isLoadingTail: false
				})
            }
        })
        .catch((error) => {
			console.log(1,error)
			this.setState({
				isLoadingTail: false
			})
        })
    },
    _hasMore () {
		// 将当前数据的长度 与 数据总长度进行比较,确定是否有更多数据
        return cachedResult.items.length !== cachedResult.total
    },
    _fetchMoreData () {
        // 判断当前数据是否已经加载完毕，如果没有加载完毕则在原来基础上进行累加显示
        // if (!this._hasMore() || cachedResult.isLoadingTail) {
        //     //如果没有数据，或者数据正在加载，将不会触发请求
        //     return
        // }
        
        // var page = cachedResult.nextPage;
        // this._fetchData(page)
	},
	_focus () {
		this._setModalVisible(true)
	},
	_setModalVisible (isVisible) {
		this.setState({
			modalVisible: isVisible
		})
	},
	_blur () {

	},
	_closeModal () {
		this._setModalVisible(false)
	},
	_renderHeader () {
		var data = this.state.data

		return (
			<View style = {styles.listHeader}>
				<View style = {styles.infoBox}>
					<Image style = {styles.avatar} source = {{uri:data.author.avatar}} />
					<View>
						<Text style = {styles.nickName}>{data.author.nickname}</Text>
						<Text style = {styles.title}>{data.title}</Text>
					</View>
				</View>

				<View style = {styles.commentBox}>
					<View style = {styles.comment}>
						<TextInput
							placeholder = '您此时的感受是....'
							style = {styles.content}
							multiline = {true}
							onFocus = {this._focus} // 获取焦点 显示评论弹出框
						></TextInput>
					</View>
				</View>

				<View style = {styles.commentArea}>
					<Text style = {styles.commentTitle}>精彩评论</Text>
				</View>
			</View>
		)
	},
    _renderFooter (status) {
        // 没有可加载的数据，需要提供用户提示信息
        if(!this._hasMore &&cachedResult.total !== 0) {
            return (
                <View style = {styles.loadingMore}>
                    <Text style = {styles.loadingText}>没有更多了</Text>
                </View>
            )
        }

        if (status == 'httpError') {
            return (
                <View style = {styles.loadingMore}>
                    <Text style = {styles.loadingText}>网络异常</Text>
                </View>
            )          
        }

        //数据正在加载，不会触发loading
        if (this.state.isLoadingTail) {
            return (
                <View style = {styles.loadingMore}>
                    <Text style = {styles.loadingText}></Text>
                </View>
            )
        }

        // 需要加载更多数据时，需要借助RN 组件 ActivityIndicatorIOS 显示loading状态
        return (<ActivityIndicator style = {styles.loadingMore}/>)
    },
	_pop () {
    	this.props.navigator.pop()
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
	_renderRow (row) {
		return(
		<View style = {styles.replyBox} key = {row._id}>
			<Image style = {styles.replyAvatar} source = {{uri:row.replyBy.avatar}} />
			<View style = {styles.reply}>
				<Text style = {styles.replyNickName}>{row.replyBy.nickname}</Text>
				<Text style = {styles.replyContent}>{row.replyBy.content}</Text>
			</View>
		</View>)
	},
	_submit () {
		console.log('submit')
		var that = this
		if (!this.state.content) {
			return AlertIOS.alert('评论不能为空！')
		}

		if (this.state.isSending) {
			return AlertIOS.alert('正在评论中')
		}

		this.setState({
			isSending: true
		},function(){
			var body = {
				accessToken: 'abc',
				creation: '1234',
				content: this.state.content
			}

			var url = Config.api.base + Config.api.comment

			Request.post(url,body)
				.then(function(){
					if (data && data.success) {
						var items = cachedResult.items.slice()
						var content = that.state.content
						items = [{
							content: content,
							replyBy:{
								avatar:'https://dummyimage.com/640x640/8bf70c)',
								nickname:'Hi peter'
							}
						}].concat(items)

						cachedResult.items = items
						cachedResult.total = cachedResult.total +1
						that.setState({
							content: '',
							isSending: false,
							dataSource: that.state.dataSource.cloneWithRows(cachedResult.items)
						})

						that._setModalVisible(false)
					}
				})
				.catch((error) => {
					console.log(error)
					that.setState({
						isSending: false
					})
					that._setModalVisible(false)
					AlertIOS.alert('留言失败，稍后重试')
				})
		})
	},
	render () {
		var data = this.props.data
		return (
			<View style={styles.container}>
				<View style = {styles.header}>
					<TouchableOpacity 
						style = {styles.backBox}
						onPress = {this._pop}>
						<IonIcons name = 'ios-arrow-back' style = {styles.backIcon}/>
						<Text style = {styles.backText}>返回</Text>
					</TouchableOpacity>
					<Text style = {styles.headerText} numberOflines = {1}>视屏详情页</Text>
				</View>
				<View style = {styles.video.Box}>
					<Video
						ref = 'videoPlayer'
						source = {{uri:data.url}}
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
						!this.state.videoOk && <Text color= '#EE735C' style = {styles.videoOk} > 视屏出错！ 很抱歉 </Text>
					}

					{
						!this.state.videoLoaded && <ActivityIndicator color= '#EE735C' style = {styles.loading} />
					}

					{
						this.state.videoLoaded && !this.state.playing ? <IonIcons onPress = {this._rePlay} size={48} name = 'ios-play' style = {styles.playIcon} /> : null
					}

					{
						this.state.videoLoaded && this.state.playing ? 
							<TouchableOpacity style = {styles.pauseBtn} onPress = {this._pause}>
								{this.state.paused ?
									<IonIcons 
										onPress = {this._resume} 
										size={48} 
										name = 'ios-play' 
										style = {styles.resumeIcon} 
									/> : null
								}
							</TouchableOpacity> : null
					}
					<View style = {styles.progressBox}>
						<View style = {[styles.progressBar, {width: width * this.state.videoProgress}]}>
						</View>
					</View>
				</View>

				<ListView
					dataSource={this.state.dataSource}
					renderRow={this._renderRow}
					renderHeader = {this._renderHeader}
					renderFooter = {this._renderFooter}
					onEndReached = {this._fetchMoreData}
					onEndReachedThreshold = {20}
					enableEmptySections = {true}
					showsVerticalScrollIndicator = {false}
					automaticallyAdjustContentInsets = {false}
					/>
				 <Modal
				 	animattionType = {'fade'} // modal 弹出的动画形式
					 visible = {this.state.modalVisible} // 默认状态下是否可见
					 onRequestClose = {() => {this._setModalVisible(false)}}>
					<View style = {styles.modalContainer}>
						<IonIcons
							onPress = {this._closeModal}
							name = 'ios-close-outline'
							style = {styles.closeIcon}
						/>
						<View style = {styles.commentBox}>
							<View style = {styles.comment}>
								<TextInput
									placeholder = '您此时的感受是....'
									style = {styles.content}
									multiline = {true}
									defaultValue = {this.state.content} //文本初始值
									onChangeText = {(text) => { // 输入文案的时候，触发onChangeText，实时更新状态中的content
										this.setState({
											content: text 
										})
									}}
								></TextInput>
							</View>
						</View>

						<Button style = {styles.submitBtn} onPress = {this._submit}>评论</Button>
					</View>	 
				</Modal>
			</View>
		)
	}
})

var styles = StyleSheet.create({
  	tabContent: {
    	flex: 1,
    	alignItems: 'center',
	},
	header: {
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
		width: width,
		height: 64,
		paddingTop: 20,
		paddingLeft: 10,
		paddingRight: 10,
		borderBottomWidth: 1,
		borderColor: 'rgba(0,0,0,0.1)',
		backgroundColor: '#fff'
	},
	modalContainer: {
		flex: 1,
		paddingTop: 45,
		backgroundColor: '#fff'
	},
	submitBtn: {
		width: width - 20,
		padding: 16,
		marginTop: 20,
		marginBottom: 20,
		borderWidth: 1,
		borderColor: '#ee735c',
		borderRadius: 4,
		color: '#ee753c',
		fontSize: 18
	},
	closeIcon: {
		alignSelf: 'center',
		fontSize: 30,
		color: '#ee753c'
	},
	backBox: {
		position: 'absolute',
		left: 12,
		top:32,
		width: 50,
		flexDirection: 'row',
		alignItems: 'center'
	},
	headerTitle: {
		width: width -120,
		textAlign: 'center'
	},
	backIcon: {
		color: '#999',
		fontSize: 20,
		marginRight: 5
	},
	backText: {
		color: '#999'
	},
	videoBox: {
		width: width,
		height: width * 0.56,
		backgroundColor: '#000'
	},
	video: {
		width: width,
		height:width * 0.56,
		backgroundColor: '#000'
	},
	loading: {
		position: 'absolute',
		left:0,
		top: 90,
		width: width,
		alignSelf: 'center',
		backgroundColor: 'transparent'
	},
	videoOk: {
		position: 'absolute',
		left:0,
		top: 90,
		width: width,
		textAlign: 'center',
		color: '#fff',
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
		top: 90,
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
	},
	pauseBtn: {
		position: 'absolute',
		left:0,
		top: 0,
		width: width,
		height:width * 0.56
	},
	resumeIcon:{
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
	},
	infoBox: {
		width: width,
		flexDirection: 'row',
		justifyContent: 'flex-start',
		marginTop: 10
	},
	avatar: {
		width: 60,
		height: 60,
		marginRight: 10,
		marginLeft: 10,
		borderRadius: 30
	},
	descBox: {
		flex: 1
	},
	nickname: {
		fontSize: 18
	},
	title: {
	  marginTop: 8,
	  fontSize: 16,
		color: '#666'
	},
	replyBox: {
		flexDirection: 'row',
		justifyContent: 'flex-start',
		marginTop: 10
	},
	replyAvatar: {
		width: 40,
		height: 40,
		marginRight: 10,
		marginLeft: 10,
		borderRadius: 20
	},
	replyNickName: {
		color: '#666'
	},
	replyContent: {
		marginTop: 4,
		color: '#666'
	},
	reply: {
		flex: 1
	},
	loadingMore: {
		marginVertical: 20
	},
	loadingText: {
		color: "#777",
		textAlign: 'center'
	},
	commentBox: {
		marginTop: 10,
		marginBottom: 10,
		padding: 8,
		width: width
	},
	content: {
		paddingLeft: 2,
		color: '#333',
		borderWidth: 1,
		borderColor: '#ddd',
		borderRadius: 4,
		fontSize: 14,
		height: 80
	},
	listHeader: {
		width: width,
		marginTop: 10
	},
	commentArea: {
		width: width,
		paddingBottom: 6,
		paddingLeft: 10,
		paddingRight: 10,
		borderBottomWidth: 1,
		borderBottomColor: '#eee'
	}
});

module.exports = Detail