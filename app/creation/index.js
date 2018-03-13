var IonIcons = require('react-native-vector-icons/Ionicons')
var Request = require('../common/request')
var Config = require('../common/config')
var Detail = require('./detail')
import React from 'react';

import {
    Image,
    ListView,
    TouchableHighlight,
    ActivityIndicator,
    RefreshControl,
    AlertIOS,
    Dimensions,
    Text,
    View,
    StyleSheet
} from 'react-native';
var width = Dimensions.get('window').width

// 在状态之外管理列表里所有的数据
var cachedResult = {
    nextPage: 1,
    items: [], // 列表中所有的数据
    total: 0 // 列表长度
}

// listView 子组件
var Item = React.createClass({
    getInitialState () {
        var row = this.props.row
        return ({
            up: row.voted,
            row: row
        })
    },
    _up () {
        var up = !this.state.up
        var row = this.state.row
        var url = Config.api.base + Config.api.up
        var that = this
        AlertIOS.alert(row._id)
        var body = {
            id: row._id,
            up: up? 'yes' : 'no',
            accessToken: 'abc'
        }

        Request.post(url, body).then(function(data){
            if(data && data.success) {
                that.setState({
                    up: up
                })
            } else {
                AlertIOS.alert('点赞失败，稍后重试')
            }
        }).catch(function(error){
            AlertIOS.alert(error)
        })
    },
    render () {
        var row = this.state.row
        return (
            <TouchableHighlight onPress = {this.props.onSelect}>
                <View style={styles.item}>
                    <Text style={styles.title}>{row.title}</Text>
                    <Image
                        source={{uri: row.thumb}}
                        style={styles.thumb}>
                        <IonIcons 
                            name="ios-play"
                            size={28}
                            style={styles.play}
                        /> 
                    </Image>
                    <View style={styles.itemFooter}>
                        <View style={styles.handleBox}>
                            <IonIcons 
                                name={this.state.up? 'ios-heart' : 'ios-heart-outline'}
                                size={28}
                                style={[styles.up,this.state.up?null:styles.down]}

                                onPress = {this._up}
                            />
                            <Text style={styles.handleText} onPress = {this._up}>喜欢</Text>
                        </View>
                        <View style={styles.handleBox}>
                            <IonIcons 
                                name="ios-chatboxes-outline"
                                size={28}
                                style={styles.commentIcon}
                            />
                            <Text style={styles.handleText}>评论</Text>
                        </View>
                    </View>
                </View>
            </TouchableHighlight>
        )
    }
})
var List = React.createClass({
    getInitialState() {
        var ds = new ListView.DataSource({
            rowHasChanged: (r1, r2) => r1 !== r2
        })

        return {
            isLoadingTail: false,
            isRefreshing: false,
            dataSource: ds.cloneWithRows([
                {
                    "_id": "320000197101165856",
                    "thumb": "https://dummyimage.com/1280x720/8ce360)",
                    "title": "测试内容55s1",
                    "author": {
                        "nickname": 'nickname',
                        'avatar': 'https://dummyimage.com/640x640/8ea264)'
                    },
                    "url": "https://vz-cdn.contentabc.com/ads/bz_950x250_726015/uploadMP4.mp4"
                },
                {
                    "_id": "340000198104023229",
                    "thumb": "https://dummyimage.com/1280x720/8ea264)",
                    "title": "测试内容55s1",
                    "url": "https://vz-cdn.contentabc.com/ads/bz_950x250_726015/uploadMP4.mp4"
                },
                {
                    "_id": "440000201701121837",
                    "thumb": "https://dummyimage.com/1280x720/4be079)",
                    "title": "测试内容55s1",
                    "url": "https://vz-cdn.contentabc.com/ads/bz_950x250_726015/uploadMP4.mp4"
                },
                {
                    "_id": "610000201402057400",
                    "thumb": "https://dummyimage.com/1280x720/b2ff77)",
                    "title": "测试内容55s1",
                    "url": "https://vz-cdn.contentabc.com/ads/bz_950x250_726015/uploadMP4.mp4"
                },
                {
                    "_id": "230000201506238651",
                    "thumb": "http://dummyimage.com/1280x720/8bbafc)",
                    "title": "测试内容55s1",
                    "url": "https://vz-cdn.contentabc.com/ads/bz_950x250_726015/uploadMP4.mp4"
                },
                {
                    "_id": "640000199009182788",
                    "thumb": "http://dummyimage.com/1280x720/5ced03)",
                    "title": "测试内容55s1",
                    "url": "https://vz-cdn.contentabc.com/ads/bz_950x250_726015/uploadMP4.mp4"
                },
                {
                    "_id": "130000201605085079",
                    "thumb": "http://dummyimage.com/1280x720/0e9aaa)",
                    "title": "测试内容55s1",
                    "url": "https://vz-cdn.contentabc.com/ads/bz_950x250_726015/uploadMP4.mp4"
                },
            ]),
        }
    },
    componentDidMount () {
        this._fetchData(1)
    },
    _fetchData (page) {
        var that = this
        // 重置 isLoadingTail,表明正在请求

        if (page !== 0) {
            this.setState({
                isLoadingTail: true
            })
        } else {
            this.setState({
                isRefreshing: true
            })
        }
        Request.get(Config.api.base + Config.api.creations,{
            accessToken: 'asfas',
            page: page
        }).then((data) => {
            // 通过mockjs ，解析rap返回的数据
            var data = Mock.mock(responseText)
            if (data.success) {
                // clone 当前数据
                var items = cachedResult.items.slice()

                if (page !== 0) {
                    //将获取的新列表追加到拷贝列表中
                    items.concat(data.data)
                    cachedResult.nextPage += 1
                } else {
                    items = data.data.concat(items)
                }

                // 更新缓存中的数据列表
                cachedResult.items = items
                cachedResult.total = data.total

                setTimeout(function () {
                    if (page !== 0 ) {
                        // 用获取到新数据，重新渲染ListView
                        that.setState({
                            dataSource: that.state.dataSource.cloneWithRows(cachedResult.items),
                            isLoadingTail: false
                        })
                    } else {
                        // 用获取到新数据，重新渲染ListView
                        that.setState({
                            dataSource: that.state.dataSource.cloneWithRows(cachedResult.items),
                            isRefreshing: false
                        })
                    }
                   
                }, 2000)
            }
            console.log(data)
        })
        .catch((error) => {
            if (page !== 0) {
                this.setState({
                    isLoadingTail: false
                })
            } else {
                this.setState({
                    isRefreshing: false
                })
            }
        })
    },
    _hasMore () {
        // 将当前数据的长度 与 数据总长度进行比较,确定是否有更多数据
        return cachedResult.items.length !== cachedResult.total
    },
    _fetchMoreData () {
        // 判断当前数据是否已经加载完毕，如果没有加载完毕则在原来基础上进行累加显示
        if (!this._hasMore() || cachedResult.isLoadingTail) {
            //如果没有数据，或者数据正在加载，将不会触发请求
            return
        }
        
        var page = cachedResult.nextPage;
        this._fetchData(page)
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
    _refreshControl () {
        return (
            <RefreshControl
                refreshing = {this.state.isRefreshing}
                onRefresh = {this._onRefresh}
                tintColor = "#ff6600"
                title = '拼了命加载'
            />
        )
    },
    _onRefresh () {
        // 没有更多数据 或者正在刷新中 直接返回
        if (!this._hasMore() || this.state.isRefreshing) {
            return 
        }
        
        // 0 代表重新获取新列表
        this._fetchData(0)
    },
    _renderRow (row){
        return (
            <Item key = {row._id} row = {row} onSelect = { () => this._loadPage(row)}/>
        )
    },
    _loadPage (row) {
        this.props.navigator.push({
            name: 'detail',
            component: Detail,
            params: {
                data: row
            }
        })
    },
    render () {
      return (
        <View style={styles.tabContent}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>列表页面 </Text>
            </View>
            <ListView
                dataSource={this.state.dataSource}
                renderRow={this._renderRow}
                enableEmptySections = {true}
                automaticallyAdjustContentInsets = {false}

                onEndReached = {this._fetchMoreData}
                onEndReachedThreshold = {20}

                renderFooter = {this._renderFooter}

                showsVerticalScrollIndicator = {false}

                refreshControl = {  <RefreshControl
                    refreshing = {this.state.isRefreshing}
                    onRefresh = {this._onRefresh}
                    tintColor = "#ff6600"
                    title = '拼了命加载'
                />}
            />
            <Text></Text>
        </View>
      )
    }
})

var styles = StyleSheet.create({
  tabContent: {
    flex: 1,
    backgroundColor: '#F5FCFF'
  },
  tabText: {
    color: 'white',
    margin: 50,
  },
  header: {
    paddingTop:25,
    paddingBottom:12,
    backgroundColor: "#ee735c"
  },
  headerTitle: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '600'
  },
  item: {
      width: width,
      marginBottom: 10,
      backgroundColor: '#fff',
  },
  thumb: {
      width: width,
      height: width * 0.56,
      resizeMode: 'cover',
      backgroundColor: "#000"
  },
  title: {
      padding: 10,
      fontSize: 18,
      color: "#333"
  },
  itemFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      backgroundColor: '#eee'
  },
  handleBox: {
      padding: 10,
      flexDirection: 'row',
      width: width / 2 - 0.5,
      justifyContent: 'center',
      backgroundColor: '#fff'
  },
  play: {
      position: 'absolute',
      bottom: 14,
      right: 14,
      width: 46,
      height: 46,
      paddingTop:9,
      paddingLeft: 18,
      backgroundColor: 'transparent',
      borderColor: '#fff',
      borderWidth: 1,
      borderRadius: 23,
      color: '#ed7b66'
  },
  handleText: {
      paddingLeft: 12,
      fontSize: 18,
      color: '#333'
  },
  up: {
      fontSize: 22,
      color: '#333'
  },
  down: {
    fontSize: 22,
    color: '#ed7b66'
    },
  commentIcon: {
      fontSize: 22,
      color: '#333'
  },
  loadingMore: {
      marginVertical: 20
  },
  loadingText: {
      color: "#777",
      textAlign: 'center'
  }
});

module.exports = List