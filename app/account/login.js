import React from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  AlertIOS,
  View
} from 'react-native';
import Button from 'react-native-button';
var Request = require('../common/request');
var Config = require('../common/config');
import {CountDownText} from 'react-native-sk-countdown'
var Login = React.createClass({
    getInitialState(){
        return {
            phoneNumber:'',
            codeSent: false,
            verifyCode: '',
            countingDone:false
        }
    },
    _sendVerifyCode(){
        var _that = this;
        // 获取到phoneNumber，提交到后台
        var phoneNumber = this.state.phoneNumber;
        if(!phoneNumber) {
            return AlertIOS.alert('手机号不能为空')
        }

        var body = {
            phoneNumber:phoneNumber
        }
        var signupUrl = Config.api.base + Config.api.signup;

        Request.post(signupUrl, body).then((data) => {
                console.log(1, data)
                if(data && data.success) {
                    _that._showVerifycode()
                }
                else{
                    AlertIOS.alert('获取验证码失败，请检查手机号是否正确！')
                }
            })
            .catch((error) => {
                AlertIOS.alert('请检查网络')
            })
    },
    _showVerifycode() { //显示输入验证码的框
        this.setState({
            codeSent: true
        })
    },
    _submit(){
        var _that = this;
        // 获取到phoneNumber，提交到后台
        var phoneNumber = this.state.phoneNumber;
        var verifyCode = this.state.verifyCode
        console.log('helloooooo')
        if(!verifyCode || !phoneNumber) {
            return AlertIOS.alert('手机号和验证码不能为空！')
        }

        var body = {
            'phoneNumber':phoneNumber,
            'verifyCode': verifyCode
        }
        
        var signupUrl = Config.api.base + Config.api.verify;
        console.log('form data:' + body)
        Request.post(signupUrl, body).then((data) => {
               console.log(1,data)
                if(data && data.success) {
                    //登陆成功之后，将用户状态通知给上层组件
                    _that.props.afterLogin(data.data)
                   console.log('login ok')
                }
                else{
                    AlertIOS.alert('获取验证码失败，请检查手机号是否正确！')
                }
            })
            .catch((error) => {
                AlertIOS.alert('请检查网络')
            })  
    },
    _countingDone() {
        this.setState({
            countingDone: true
        })
    },
    render () {
      return (
        <View style={styles.container}>
            <View style={styles.signupBox}>
                <Text style={styles.title}>快速登陆</Text>
                <TextInput 
                    placeholder="输入手机号"
                    autoCaptialize={'none'} 
                    autoCorrect={false}
                    keyboardType={'number-pad'}
                    style={styles.inputField}
                    onChangeText = {(text) => {
                        this.setState({
                            phoneNumber: text
                        })
                    }}>
                </TextInput>
                
                
                {// 显示输入验证码输入框逻辑
                    this.state.codeSent
                    ? <View style={styles.verifyCodeBox}>
                         <TextInput 
                            placeholder="请输入验证码"
                            autoCaptialize={'none'} 
                            autoCorrect={false}
                            keyboardType={'number-pad'}
                            style={styles.inputField}
                            onChangeText = {(text) => {
                                this.setState({
                                    verifyCode: text
                                })
                            }}>  
                        </TextInput>
                        {// 显示倒计时
                            this.state.countingDone
                            ? <Button style={styles.countBtn} onPress={this._sendVerifyCode}>获取验证码</Button>
                            : <CountDownText style={styles.countBtn} 
                                countType='seconds' // 计时类型：seconds / date
                                auto={true} // 自动开始
                                afterEnd={this._countingDone} // 结束回调
                                timeLeft={60} // 正向计时 时间起点为0秒
                                step={-1} // 计时步长，以秒为单位，正数则为正计时，负数为倒计时
                                startText='获取验证码' // 开始的文本
                                endText='获取验证码' // 结束的文本
                                intervalText={(sec) => '剩余秒数：' + sec } // 定时的文本回调
                                />
                        }  
                    </View>
                    :  null
                }       

                {
                    this.state.codeSent
                    ? <Button style={styles.btn} onPress = {this._submit}>登陆</Button>
                    : <Button style={styles.btn} onPress = {this._sendVerifyCode}>获取验证码</Button>
                }
            </View>
        </View>
      )
    }
})

var styles = StyleSheet.create({
    container: {
        flex:1,
        padding:10,
        backgroundColor:'#f9f9f9'
    },
    signupBox:{
        marginTop:30
    },
    title:{
        marginBottom:20,
        color:'#333',
        fontSize:20,
        textAlign:'center'
    },
    inputField:{
        flex:1,
        height:40,
        padding:5,
        color:'#666',
        fontSize:15,
        backgroundColor:'#fff',
        borderRadius:4
    },
    btn:{
        padding:10,
        marginTop:10,
        backgroundColor:'transparent',
        borderColor:'#ee735c',
        borderWidth:1,
        borderRadius:4,
        color:'#ee735c'
    },
    verifyCodeBox:{
        marginTop:10,
        flexDirection:'row',
        justifyContent:'space-between'
    },
    countBtn:{
        width:110,
        height:40,
        padding:10,
        marginLeft:8,
        backgroundColor:'#ee735c',
        borderColor:'#ee735c',
        textAlign:'left',
        fontWeight:'600',
        fontSize:14,
        borderRadius:4,
        color:'#fff'
    }
});

module.exports = Login