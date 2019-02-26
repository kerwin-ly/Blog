## react-native踩坑
#### 1.默认情况下，iOS会阻止所有非https的请求。如果你请求的接口是http协议，那么首先需要添加一个App Transport Security的例外，详细可参考
https://segmentfault.com/a/1190000002933776
#### 2.在触发动画时候，调用了setState，导致卡屏
调用InteractionManager的runAfterInteraction方法。在动画执行完成后再改吧state的值
#### 3.scrollView由于底部Tabnavigator占位，无法滑动到底部
在底部添加一个空白view占位
```
<ScrollView>
<View>
<FlatList
    data={this.state.manage}
    renderItem={this._renderIcon}
    numColumns = {3}
    keyExtractor ={(item,index) =>item.id}
    ListHeaderComponent={<Text style={[style.ListHeader]}>管理</Text>}
/>
 <View style={{height:Platform.OS == 'ios' ? 0: 30}}></View> 
</View>
</ScrollView>
```
#### 4.父子之间的传值，props的回调方法
##### 方法一：
子组件

```
import React,{ Component } from 'react';
import {
  View,Text,Button
} from 'react-native';
export default class MInventory extends Component{
  constructor(props){
    super(props)
  }
  render(){
    let son = '我是son';
    return(
      <View>
        <Button onPress={ () => this.props.handleChange('我也变成了son')} title="点击发送"/>
        <Text>子组件：{this.props.name}</Text>
      </View>
    )
  }
}
```
父组件

```
import React,{Component} from 'react';
import {
  View,
  Text
} from 'react-native';
import  MInventory  from './MInventory'
export default class Inventory extends Component{
  constructor(props){
    super(props);
    this.state = {
      name: '我是father'
    }
  }
  render(){
    return(
      <View>
        <MInventory name={this.state.name} handleChange ={ (val) =>  this.setState({name:val})}/>
        <Text>父组件：{this.state.name}</Text>
      </View>
    )
  }
}
```
##### 方法二

```
子组件向父组件通信

子组件向父组件传值
在子组件state中定义一个参数this.state = {name : '我是子组件向父组件传递的参数' };
在父组件中给子组件绑定ref,如  <Childern ref='childern'  />
在父组件中获取子组件的state,如this.refs.childern.state.name
子组件向父组件传递方法
同样通过ref来获得，前两部与传参方法相同。
获取方法的方式也同样this.refs.childern.onChildenCilck2();

```
#### 5.取消FlatList keys missing的警告

```
<FlatList
  keyExtractor={this._uniquekey}
  
/>
            
//唯一Key
  _uniquekey = ({item,index}) => {
    return 'index'+item+index
  }
```
#### 6.setState同步更新
##### 方法一：回调方法

```
this.setState({
      load: !this.state.load,
      count: this.state.count + 1
    }, () => {
      console.log(this.state.count);
      console.log('加载完成')
    });
```
##### 方法二：传入状态计算函数

```
incrementCount(){
   this.setState((prevState, props) => ({
      count: prevState.count + 1
    }));
   this.setState((prevState, props) => ({
      count: prevState.count + 1
    }));
  }
```
#### 7.签名apk
http://reactnative.cn/docs/0.47/signed-apk-android.html#content
#### 8.改变state中对象里面的值

```
this.state = {
    camera:{
            show:false,
            torch:'on'
        }
    }
}

this.setState({
    camera:{
        ...this.state.camera,
        torch:'off'
    }
})
```
#### 7.使用百度地图时，只有网格，无地图
由于百度地图必须要签名的sha1作为其安全码的一部分，所以，在注册key值时候，应选Android SDK,并且将签名的SHA1值和包名写进去，才能使用。

 查看签名：
```
keytool -printcert -file CERT.RSA
```
#### 8.react-navigation，重复跳转页面

使用延迟处理，参考链接http://www.jianshu.com/p/2f575cc35780

#### 9.mac下,连上手机后。报错。Could not install the app on the device, read the error above for details. 


```
chmod 755 android/gradlew
react-native run-android
```

#### 10.React Native android build failed. SDK location not found

Go to the android/ directory of your react-native project
Create a file called local.properties with this line:

sdk.dir = /Users/USERNAME/Library/Android/sdk
Where USERNAME is your OSX username

https://stackoverflow.com/questions/32634352/react-native-android-build-failed-sdk-location-not-found

#### 11.SDK location not found. Define location with sdk.dir in the local.properties file or with an ANDROID_HOME environment variable.

Go to the android/ directory of your react-native project
Create a file called local.properties with this line:


```
sdk.dir = /Users/liyi/Library/Android/sdk
```

Where USERNAME is your OSX username

#### 12.安装指定版本

```
$ react-native init demo --version 0.36.1
```
#### 13.如果遇到什么依赖重复，报错。尝试清除缓存

```
yarn start --reset-cache
```
#### 14. 如果遇到自己改了图片，图片仍没响应。或者报错
```
res/drawable-mdpi-v4/src_imgs_banner.png:0: error: Resource entry src_imgs_banner is already defined.
res/drawable-mdpi-v4/src_imgs_banner.gif:0: Originally defined here.
```

解决： 去删除android/app/build/intermediates文件。这是打包自动生成的文件，build整个目录应该都是打包生成的。注意。

#### 15. 解决react-navigation,goBack()到指定页面
https://blog.csdn.net/wanshaobo888/article/details/78385152

#### 16. 解决goBack返回页面后，刷新数据，保持数据的同步。回调方法
https://www.jianshu.com/p/cafe0c6cba16

A页面跳转B页面
```
goPageB: () => {
    this.props.navigation.navigate('B',{
        callback: (data)=>{
            this.setState({
              boom:data,
            })
        }
      }
}
```
B页面回退到A页面：

```
const {navigate,goBack,state} = this.props.navigation;
state.params.callback(this.state.boom);
this.props.navigation.goBack();  
```

#### 17.重置路由栈

```
//跳转并清空路由记录
 import { NavigationActions } from 'react-navigation'
const  resetAction = NavigationActions.reset({
                index: 0,
                actions: [
                    NavigationActions.navigate({routeName:'xxx'})//要跳转到的页面名字
                ]
            });
this.props.navigation.dispatch(resetAction);

```

#### 18.SDK Build Tools revision (23.0.1) is too low for project :react-native-keychain报错

```
android/build.gradle

subprojects {
    afterEvaluate {project ->
        if (project.hasProperty("android")) {
            android {
                compileSdkVersion 25
                buildToolsVersion '25.0.0'
            }
        }
    }
}
```
#### 19. Text组件布局注意
每个Text组件会从新一行起（类似块级元素），而子组件不可换行（类似行内元素），==子组件字体，颜色可设置，宽高，margin，padding设置无效。==

所以，尽量不要Text组件嵌套Text组件

#### 20. propTypes的使用
https://www.jianshu.com/p/73bb6f75ed31

#### 21. 报错Could not connect to development server on android emulator and on real device

```
adb reverse tcp:8081 tcp:8081
```

参考链接：https://github.com/facebook/react-native/issues/15388

#### 22. 当state的数据层级，出现Array嵌套时候。（两层或多层）FlatList使用嵌套，state已经改变。页面却没有重绘。

```
// 当state内存放的数据为数组时候，实质上是一个引用，就算是state内push了一个数据，这时候是不会触发更新的

// item对应第二层的某对象

selectUser = () => {
  this.state.roleList[0].data[1].selected = true;
  let roleList = [].concat(this.state.roleList);
  this.setState({ roleList });
}

参考链接：https://segmentfault.com/a/1190000002789651

```

```
// 官方文档：给FlatList指定extraData={this.state}属性，是为了保证state.selected变化时，能够正确触发FlatList的更新。如果不指定此属性，则FlatList不会触发更新，因为它是一个PureComponent，其props在===比较中没有变化则不会触发更新
<FlatList
  data={item.data}
  keyExtractor={(item, index) => this._subExtraUniqueKey(item, index)}
  renderItem={this._renderName}
  numColumns={3}
  extraData={this.state}
/>
```

#### 23. react-native-push-notification消息推送

git链接：https://github.com/zo0r/react-native-push-notification

#### 24. 在navigationOptions中调用内部方法

```
// 使用setParams进行参数传递，去执行内部方法
static navigationOptions = ({navigation, screenProps}) => ({
  headerTitle: '登录',
  headerLeft:(
    <Text
      onPress={()=>navigation.state.params.navigatePress()}
      style={{marginLeft:5, width:30, textAlign:"center"}}
    >
      <Icon name='ios-arrow-back' size={24} color='white' />
    </Text>
  )

_onBackAndroid = () => {
  alert('点击headerLeft');
}

componentDidMount() {
  //在static中使用this方法
  this.props.navigation.setParams({ navigatePress:this._onBackAndroid })
}


```

#### 25. style中传递参数，自定义theme
```
<Text style={StyleSheet.flatten([styles.label(theme), labelStyle])}>
233
</Text>

const styles = {
  label: theme => ({
    flexDirection: 'row',
    borderBottomWidth: 1,
    alignItems: 'center',
    borderColor: theme.colors.grey3
  })
}

```

#### 26. FlatList onEndReached触发两次解决办法
1.添加onMomentumScrollBegin属性给FlatList（onMomentumScrollBegin属性可以在ScrollView中查到,表示滚动动画开始的一个回调函数）
```
<FlatList
  data={this.props.data}
  onEndReached={...}
  onEndReachedThreshold={0.5}
  ...
  onMomentumScrollBegin={() => { this.onEndReachedCalledDuringMomentum = false; }}
/>

```
2.给onEndReached添加一个锁，只在开始滚动动画时解开。
```
onEndReached = () => {
  if (!this.onEndReachedCalledDuringMomentum) {
    this.props.fetchData();
    this.onEndReachedCalledDuringMomentum = true;
  }
};
```

#### 27. StackNavigator嵌套路由的返回处理
https://github.com/react-navigation/react-navigation/issues/335

#### 28. 自定义antd-mobile组件样式&&主题颜色

github: https://github.com/ant-design/antd-mobile-samples/tree/master/rn-custom-ui

issue: https://github.com/ant-design/ant-design-mobile/issues/1174

#### 29. FlatList中renderItem设置refs(eg: input换行获取焦点)

```
<FlatList
  ref="list"
  ...
  renderItem = {this._renderItem}
/>

_renderItem = ({ item, index }) => (
  <TextInput
    ref={(ref) => {
      this.inputRefs = {
        ...this.inputRefs,
        [`${item.itemId}-${index}`]: ref
      };
    }}
    returnKeyType="next"
    onSubmitEditing={() => this.focusNextInput(item, index)}
  />
)

focusNextInput = (item, index) => {
  this.inputRefs[Object.keys(this.inputRefs)[index + 1]].focus();
}
```

#### 30. 在某些自主研发的手机上报错`Unknown failure ([CDS]close[0])
Unable to install /path/to/project/android/app/build/outputs/apk/app-debug.apk
com.android.ddmlib.InstallException: Failed to install all`

指定手机deviceId执行
```
adb devices

react-native run-android --deviceId your-device-id

```

#### 31. 全面屏适配
在`adnroid/app/src/main/AndroidManifest.xml`中编辑
```
# 注意sdk版本需要在24或24以上
<application
  android:name=".MainApplication"
  android:allowBackup="true"
  android:label="@string/app_name"
  android:icon="@mipmap/ic_launcher"
  android:theme="@style/AppTheme"
  android:resizeableActivity="true"> // add this line
  <meta-data android:name="android.max_aspect" android:value="2.1" /> // add this line
  ...
</application>
```

















