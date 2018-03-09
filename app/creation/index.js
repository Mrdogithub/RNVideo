var IonIcons = require('react-native-vector-icons/Ionicons')
var Request = require('../common/request')
var Config = require('../common/config')
import React from 'react';

import {
     Image,
    ListView,
    TouchableHighlight,
    Dimensions,
    Text,
   
    View,
    StyleSheet
} from 'react-native';
var width = Dimensions.get('window').width
var List = React.createClass({
    getInitialState() {
        var ds = new ListView.DataSource({
            rowHasChanged: (r1, r2) => r1 !== r2
        })

        return {
            dataSource: ds.cloneWithRows([
                {
                    "_id": "320000197101165856",
                    "thumb": "https://dummyimage.com/1280x720/8ce360)",
                    "title": "测试内容55s1",
                    "url": "https://www.imooc.com/763f81b8-d1a2-494e-a954-4138eb5400dc"
                },
                {
                    "_id": "340000198104023229",
                    "thumb": "https://dummyimage.com/1280x720/8ea264)",
                    "title": "测试内容55s1",
                    "url": "https://www.imooc.com/763f81b8-d1a2-494e-a954-4138eb5400dc"
                },
                {
                    "_id": "440000201701121837",
                    "thumb": "https://dummyimage.com/1280x720/4be079)",
                    "title": "测试内容55s1",
                    "url": "https://www.imooc.com/763f81b8-d1a2-494e-a954-4138eb5400dc"
                },
                {
                    "_id": "610000201402057400",
                    "thumb": "https://dummyimage.com/1280x720/b2ff77)",
                    "title": "测试内容55s1",
                    "url": "https://www.imooc.com/763f81b8-d1a2-494e-a954-4138eb5400dc"
                },
                {
                    "_id": "230000201506238651",
                    "thumb": "http://dummyimage.com/1280x720/8bbafc)",
                    "title": "测试内容55s1",
                    "url": "https://www.imooc.com/763f81b8-d1a2-494e-a954-4138eb5400dc"
                },
                {
                    "_id": "640000199009182788",
                    "thumb": "http://dummyimage.com/1280x720/5ced03)",
                    "title": "测试内容55s1",
                    "url": "https://www.imooc.com/763f81b8-d1a2-494e-a954-4138eb5400dc"
                },
                {
                    "_id": "130000201605085079",
                    "thumb": "http://dummyimage.com/1280x720/0e9aaa)",
                    "title": "测试内容55s1",
                    "url": "https://www.imooc.com/763f81b8-d1a2-494e-a954-4138eb5400dc"
                },
            ]),
        }
    },
    componentDidMount () {
        this._fetchData()
    },
    _fetchData () {
        Request.get(Config.api.base + Config.api.creations,{
            accessToken: 'asfas'
        }).then((data) => {
            // 通过mockjs ，解析rap返回的数据
            var data = Mock.mock(responseText)
            if (data.success) {
                this.setState({
                    dataSource: this.state.dataSource.cloneWithRows(data.data)
                })
            }
            console.log(data)
        })
        .catch((error) => {
            console.warn(error)
        })
    },
    renderRow (row){
        return (
            <TouchableHighlight>
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
                                name="ios-heart-outline"
                                size={28}
                                style={styles.up}
                            />
                            <Text style={styles.handleText}>喜欢</Text>
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
    },
    render () {
      return (
        <View style={styles.tabContent}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>列表页面 </Text>
            </View>
            <ListView
                dataSource={this.state.dataSource}
                renderRow={this.renderRow}
                enableEmptySections = {true}
                automaticallyAdjustContentInsets = {false}
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
  commentIcon: {
      fontSize: 22,
      color: '#333'
  }
});

module.exports = List