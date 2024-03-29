import 'react-native-gesture-handler'
import { Image, Pressable, StyleSheet, Text, View } from 'react-native'
import React from 'react'
// Drawer
import { NavigationContainer } from '@react-navigation/native';
import { DrawerItem, createDrawerNavigator } from '@react-navigation/drawer';
// Components
import RoomSelector from './screens/RoomSelector';
import SignIn from './screens/SignIn'
import colors from './colors';
import SignUp from './screens/SignUp';
// Firebase
import {auth} from './firebase/firebasbe-config'
import { signOut } from 'firebase/auth';
import UserProfile from './screens/UserProfile';
import Chats from './screens/Chats';
import OthersProfile from './screens/OthersProfile';

function drawerContent({navigation}: any){

  async function logOut() {
    await signOut(auth)
    navigation.closeDrawer()
    navigation.navigate("SignIn")
  }

  return (
    <View style={styles.customDrawer}>
        <View>
          {/* {selectedRoom && <DrawerItem label={`Return To Room ${selectedRoom}`} onPress={() => navigation.navigate('Chats')}/>} */}
          {auth.currentUser && <DrawerItem label="Room Selector" onPress={() => navigation.navigate('RoomSelector')} labelStyle={styles.text}/>}
        </View>
        {!auth.currentUser && 
        <View style={styles.authOptionsWrapper}>
        <DrawerItem label="Sign In" onPress={() => navigation.navigate("SignIn")} style={styles.authOptions} labelStyle={[styles.text, styles.authOptionsText]}/>
        <DrawerItem label="Sign Up" onPress={() => navigation.navigate("SignUp")} style={styles.authOptions} labelStyle={[styles.text, styles.authOptionsText]}/>
        </View>}

        {auth.currentUser && 
          <View style={styles.userOptions}>
            <View style={{flexDirection:'row', alignItems:"center"}}>
              <Pressable onPress={() => navigation.navigate("UserProfile")}><Image style={styles.profilePicture} source={{uri:auth.currentUser.photoURL as any}}/></Pressable>
              <Pressable onPress={() => navigation.navigate("UserProfile")}><Text style={styles.displayName}>{auth.currentUser.displayName}</Text></Pressable>
            </View>
            <Pressable onPress={logOut} style={({pressed}) => [styles.signOutBtn,{backgroundColor: pressed ? 'rgba(0, 0, 0, .2)' : 'transparent'}]}><Image style={styles.signOutIcon} source={require('./images/signOut.png')}/></Pressable>
          </View>
        }
    </View>
  )
}

export default function App() {
    
  const Drawer = createDrawerNavigator<componentProps>()

  return (
    <NavigationContainer>
      <Drawer.Navigator screenOptions={{drawerStyle:{backgroundColor:colors.black, shadowOffset:{width:1, height:1},shadowColor:'rgb(255, 255, 255)', shadowRadius:0, elevation:20,}, drawerActiveBackgroundColor:"rgba(255, 255, 255 .2)", headerStyle:{backgroundColor:colors.black}, headerTitleStyle:{color:"white"}, headerTintColor:'white'}} drawerContent={props => drawerContent(props)}>
        <Drawer.Screen name="RoomSelector" component={RoomSelector} initialParams={{fromSignUp: false}} options={{unmountOnBlur:true, title:"Room Selector"}}/>
        <Drawer.Screen name="SignIn" component={SignIn} options={{title:"Sign In", unmountOnBlur:true}}/>
        <Drawer.Screen name="SignUp" component={SignUp} options={{title:"Sign Up", unmountOnBlur:true}}/>
        <Drawer.Screen name="UserProfile" component={UserProfile} initialParams={{fromChats:false}} options={{title:"My Profile"}}/>
        <Drawer.Screen name="Chats" component={Chats} options={{unmountOnBlur:true}}/>
        <Drawer.Screen name="OthersProfile" component={OthersProfile} options={{unmountOnBlur:true}}/>
      </Drawer.Navigator>
    </NavigationContainer>
  )
}

const styles = StyleSheet.create({
  customDrawer:{
    height:'100%',
    justifyContent:'space-between',
  },
  text:{
    color:'white',
    fontSize:20
  },
  authOptionsText:{
    width:'150%',
    color:'white',
    fontSize:16,
    textAlign:'center'
  },
  authOptionsWrapper:{
    flexDirection:'row',
    justifyContent:'space-between',
    marginBottom:20,
  },
  authOptions:{
    width:'40%',
    marginHorizontal:10,
    borderColor:'white',
    borderWidth:1,
    textAlign:'center'
  },
  userOptions:{
    height:'10%',
    flexDirection:'row',
    alignItems:'center',
    justifyContent:'space-between',
    marginBottom:10,
  },
  profilePicture:{
    width:50,
    height:50,
    borderRadius:50,
    marginHorizontal:10
  },
  displayName:{
    fontSize:18,
    color:'white'
  },
  signOutBtn:{
    width:40,
    height:40,
    backgroundColor:'cyan',
    alignItems:'center',
    justifyContent:'center',
    marginRight:5,
    borderRadius:8
  },
  signOutIcon:{
    width:30,
    height:30,
    marginRight:20,
    marginLeft:25
  }
})