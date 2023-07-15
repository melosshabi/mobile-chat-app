import { StyleSheet, Text, View } from 'react-native'
import React, { useEffect } from 'react'
import {componentProps} from '../App'
import { DrawerScreenProps } from '@react-navigation/drawer'
import Snackbar from 'react-native-snackbar'

export type HomeProps = DrawerScreenProps<componentProps, 'Home'>

export default function Home({route}: HomeProps) {

  useEffect(() => {
    if(route.params?.fromSignUp){
      Snackbar.show({
        text:"Account Created Successfully",
        duration:Snackbar.LENGTH_SHORT
      })
    }
  }, [route.params])

  return (
    <View>
      <Text>Home</Text>
    </View>
  )
}

const styles = StyleSheet.create({})