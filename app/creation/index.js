var IonIcons = require('react-native-vector-icons/Ionicons')

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
    getInitialState: function() {
        var ds = new ListView.DataSource({
            rowHasChanged: (r1, r2) => r1 !== r2
        })

        return {
            dataSource: ds.cloneWithRows([
                {
                    "_id":"340000198901093377","thumb":"https://dummyimage.com/1200x600/26b1cb)","url":"https://www.imooc.com/763f81b8-d1a2-494e-a954-4138eb5400dc"
                }
                ,
                {
                    "_id":"440000200311147754","thumb":"https://dummyimage.com/1200x600/7aa0c2)","url":"https://www.imooc.com/763f81b8-d1a2-494e-a954-4138eb5400dc"
                }
                ,
                {
                    "_id":"640000200510254488","thumb":"https://dummyimage.com/1200x600/b0f5ef)","url":"https://www.imooc.com/763f81b8-d1a2-494e-a954-4138eb5400dc"
                }
                ,
                {
                    "_id":"820000197203044885","thumb":"https://dummyimage.com/1200x600/00486c)","url":"https://www.imooc.com/763f81b8-d1a2-494e-a954-4138eb5400dc"
                }
                ,
                {
                    "_id":"410000197905264165","thumb":"https://dummyimage.com/1200x600/64fedf)","url":"https://www.imooc.com/763f81b8-d1a2-494e-a954-4138eb5400dc"
                }
            ]),
        }
    },
    renderRow: function(row){
        return (
            <TouchableHighlight>
                <View style={styles.item}>
                    <Text style={styles.title}>{row._id}</Text>
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
    render: function(){
      return (
        <View style={styles.tabContent}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>列表页面 </Text>
            </View>
            <ListView
                dataSource={this.state.dataSource}
                renderRow={this.renderRow}
                enableEmptySections = {true}
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
      height: width * 0.5,
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