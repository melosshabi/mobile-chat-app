import 'react-native-gesture-handler'
import { StyleSheet, View } from 'react-native'
import React from 'react'
// Drawer
import { NavigationContainer } from '@react-navigation/native';
import { DrawerItem, createDrawerNavigator } from '@react-navigation/drawer';
// Components
import Home from './screens/Home';
import SignIn from './screens/SignIn'
import colors from './colors';
import SignUp from './screens/SignUp';

function drawerContent({navigation}: any){
  return (
    <View style={styles.customDrawer}>
        <View style={styles.links}>
          <DrawerItem label="Home" onPress={() => navigation.navigate('Home')} labelStyle={styles.text}/>
        </View>
        <View style={styles.authOptionsWrapper}>
        {/* <Pressable onPress={() => navigation.navigate('SignIn')} style={styles.authOptions}><Text style={styles.text}>Sign In</Text></Pressable> */}
        {/* <Pressable onPress={() => navigation.navigate('SignUp')} style={styles.authOptions}><Text style={[styles.text]}>Sign Up</Text></Pressable> */}
        <DrawerItem label="Sign In" onPress={() => navigation.navigate("SignIn")} style={styles.authOptions} labelStyle={[styles.text, styles.authOptionsText]}/>
        <DrawerItem label="Sign Up" onPress={() => navigation.navigate("SignUp")} style={styles.authOptions} labelStyle={[styles.text, styles.authOptionsText]}/>
        </View>
    </View>
  )
}

export type componentProps = {
  Home:{fromSignUp:boolean} | undefined;
}

export default function App() {

  const Drawer = createDrawerNavigator()

  return (
    <NavigationContainer>
      <Drawer.Navigator defaultStatus="open" screenOptions={{drawerStyle:{backgroundColor:colors.darkGray, shadowOffset:{width:1, height:1},shadowColor:'rgb(255, 255, 255)', shadowRadius:0, elevation:20,}, drawerActiveBackgroundColor:"rgba(255, 255, 255 .2)", headerStyle:{backgroundColor:colors.lightGray}, headerTitleStyle:{color:"white"}, headerTintColor:'white'}} drawerContent={props => drawerContent(props)}>
        <Drawer.Screen name="Home" component={Home} initialParams={{fromSignUp: false}} options={{unmountOnBlur:true}}/>
        <Drawer.Screen name="SignIn" component={SignIn} options={{title:"Sign In", unmountOnBlur:true}}/>
        <Drawer.Screen name="SignUp" component={SignUp} options={{title:"Sign Up", unmountOnBlur:true}}/>
      </Drawer.Navigator>
    </NavigationContainer>
  )
}

const styles = StyleSheet.create({
  customDrawer:{
    height:'100%',
    justifyContent:'space-between',
    
  },
  links:{

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
    // padding:10,
    borderColor:'white',
    borderWidth:1,
    textAlign:'center'
  }
})