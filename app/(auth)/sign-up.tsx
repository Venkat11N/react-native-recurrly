import { Text } from '@react-navigation/elements'
import { Link } from 'expo-router'
import React from 'react'
import { View } from 'react-native'

const SignUp = () => {
  return (
    <View>
      <Text>SignUp</Text>
      <Link href="/(auth)/sign-up">Sign In</Link>
    </View>
  )
}

export default SignUp
