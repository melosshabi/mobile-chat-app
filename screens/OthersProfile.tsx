import { Image, StyleSheet, BackHandler, Text, View } from 'react-native'
import { DrawerScreenProps } from '@react-navigation/drawer'
import colors from '../colors'
import { useNavigation } from '@react-navigation/native'

type ProfileProps = DrawerScreenProps<componentProps, 'OthersProfile'>

export default function OthersProfile({route}:ProfileProps) {

  const navigation = useNavigation()
  navigation.setOptions({title:route.params.displayName})

  BackHandler.addEventListener('hardwareBackPress', () => {
    console.log("Pressed back")
    navigation.navigate("Chats", {roomNumber: route.params.selectedRoom})
    return true
  })

  return (
    <View style={styles.wrapper}>
        <View style={styles.nameImageWrapper}>
            <Text style={styles.displayName}>{route.params.displayName}</Text>
            <Image source={{uri:route.params.pictureUrl}} style={styles.image}/>
        </View>
    </View>
  )
}

const styles = StyleSheet.create({
    wrapper:{
        height:'100%',
        backgroundColor:colors.darkGray,
        alignItems:'center',
    },
    nameImageWrapper:{
        width:'80%',
        backgroundColor:colors.lightGray,
        alignItems:'center',
        marginTop:100,
        borderRadius:8,
        elevation:4,
    },
    displayName:{
        color:'white',
        fontSize:30,
        textAlign:'center',
        marginVertical:25
    },
    image:{
        width:150,
        height:150,
        marginBottom:25,
    }
})