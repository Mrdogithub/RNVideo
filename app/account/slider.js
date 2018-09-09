import React from 'react';
import {
  StyleSheet,
  Text,
  Image,
  View,
  Dimensions
} from 'react-native';
import Button from 'react-native-button';
var Request = require('../common/request');
var Config = require('../common/config');
var Swiper = require('react-native-swiper')
var width = Dimensions.get('window').width
var height = Dimensions.get('window').height
import {CountDownText} from 'react-native-sk-countdown'
var Slider = React.createClass({
    getInitialState(){
        return {
            loop: false,
            banners: [
                require('../assets/images/s1.jpg'),
                require('../assets/images/s2.jpg'),
                require('../assets/images/s3.jpg')
            ]
        }
    },
    _enter() {
        this.props.enterSlide()
    },
    render () {
      return (

        <Swiper

            dot = {<View style = {styles.dot}/>}
            activeDot = {<View style = {styles.activeDot}/>}
            style = {styles.wrapper}
            loop = {this.state.loop}
            paginationStyle = {styles.pagination}>
            <View style={styles.slide}>
                <Image style={styles.image} source = {this.state.banners[0]}/>
            </View>
            <View style={styles.slide}>
                <Image style={styles.image} source = {this.state.banners[1]}/>
            </View>
            <View style={styles.slide}>
                <Image style={styles.image} source = {this.state.banners[2]}/>
                <Button style={styles.btn} onPress = {this._enter}>马上体验</Button>
            </View>
        </Swiper>
      )
    }
})

var styles = StyleSheet.create({
    wrapper: {
    },
    slide:{
        flex:1,
        width: width
    },
    image: {
        flex: 1,
        width: width
    },
    dot: {
        width: 13,
        height: 13,
        backgroundColor: 'transparent',
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 7,
        marginLeft: 12,
        marginRight: 12
    },
    activeDot: {
        width: 15,
        height: 15,
        backgroundColor: '#ee735c',
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 7,
        marginLeft: 12,
        marginRight: 12
    },
    pagination: {
        bottom: 30
    },
    btn:{
        width: width - 20,
        position: 'absolute',
        left: 10,
        bottom: 60,
        height: 50,
        padding:10,
        marginTop:10,
        backgroundColor:'#ee735c',
        borderColor:'#ee735c',
        borderWidth:1,
        borderRadius:2,
        color: '#fff'
    }
});

module.exports = Slider