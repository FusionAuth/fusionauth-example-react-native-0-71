import React, {useState} from 'react';
import {
  Alert,
  Image,
  Pressable,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';
import {AuthConfiguration, authorize} from 'react-native-app-auth';
import * as Keychain from 'react-native-keychain';

import {Colors} from 'react-native/Libraries/NewAppScreen';

const configs: Record<string, AuthConfiguration> = {
  fusionauth: {
    issuer: 'https://xyz.ngrok-free.app',
    clientId: 'fc22503d-f7d2-44fc-88cd-d1660b4b5c72',
    redirectUrl: 'fusionauth.demo:/oauthredirect',
    scopes: ['offline_access'],
  },
};

const defaultAuthState = {
  hasLoggedInOnce: false,
  accessToken: '',
  accessTokenExpirationDate: '',
  refreshToken: '',
};

function UserInfo({
  text,
  value,
}: {
  text: string;
  value?: string | Date;
}): JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <View style={styles.userInfo}>
      <Text
        style={{
          ...styles.userInfoLabel,
          ...(isDarkMode ? styles.textDark : styles.textLight),
        }}>
        {text}
      </Text>
      <Text
        style={{
          ...styles.userInfoValue,
          ...(isDarkMode ? styles.textDark : styles.textLight),
        }}
        numberOfLines={1}>
        {value?.toString()}
      </Text>
    </View>
  );
}

function App(): JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
    textColor: isDarkMode ? Colors.light : Colors.dark,
  };

  const [authState, setAuthState] = useState(defaultAuthState);

  const handleAuthorize = async () => {
    try {
      const newAuthState = await authorize(configs.fusionauth);

      setAuthState({
        hasLoggedInOnce: true,
        ...newAuthState,
      });

      await Keychain.setGenericPassword(
        'accessToken',
        newAuthState.accessToken,
      );
    } catch (error) {
      Alert.alert(
        'Failed to log in',
        (error as Record<string, never>)?.message,
      );
    }
  };

  const getAccessToken = async (): Promise<string | undefined> => {
    try {
      // Retrieve the credentials
      const credentials = await Keychain.getGenericPassword();
      if (credentials) {
        return credentials.password;
      } else {
        console.log('No credentials stored');
      }
    } catch (error) {
      console.log("Keychain couldn't be accessed!", error);
    }
  };

  const [userInfo, setUserInfo] = useState<Record<string, string> | null>(null);

  const getUser = async () => {
    try {
      const access_token = await getAccessToken();
      if (access_token !== null) {
        fetch(configs.fusionauth.issuer + '/oauth2/userinfo', {
          method: 'GET',
          headers: {
            Authorization: 'Bearer ' + access_token,
          },
        })
          .then(response => response.json())
          .then(json => {
            console.log(json);
            setUserInfo(json);
          })
          .catch(error => {
            console.error(error);
          });
      }
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <SafeAreaView style={{...backgroundStyle, ...styles.safeArea}}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <View style={styles.header}>
        <Image
          source={
            isDarkMode
              ? require('./fusion_auth_logo_dark.png')
              : require('./fusion_auth_logo.png')
          }
          style={styles.headerImage}
        />
      </View>
      <View style={styles.container}>
        {authState.accessToken ? (
          <View style={styles.userInfoContainer}>
            <UserInfo text={'Access token'} value={authState.accessToken} />
            <UserInfo
              text={'Expiration'}
              value={authState.accessTokenExpirationDate}
            />
            {userInfo ? (
              <View>
                <UserInfo text={'User ID'} value={userInfo.sub} />
                <UserInfo text={'Email'} value={userInfo.email} />
                <UserInfo text={'Given Name'} value={userInfo.given_name} />
                <UserInfo text={'Family Name'} value={userInfo.family_name} />
                {userInfo.picture ? (
                  <Image
                    source={{uri: userInfo.picture}}
                    style={styles.userImage}
                  />
                ) : null}
              </View>
            ) : (
              <Pressable
                onPress={() => getUser()}
                android_ripple={{color: 'white'}}
                style={({pressed}) => [
                  styles.button,
                  pressed ? styles.buttonPressed : null,
                ]}>
                <Text>Get User</Text>
              </Pressable>
            )}
          </View>
        ) : (
          <Pressable
            onPress={() => handleAuthorize()}
            android_ripple={{color: 'white'}}
            style={({pressed}) => [
              styles.button,
              pressed ? styles.buttonPressed : null,
            ]}>
            <Text>Login with FusionAuth</Text>
          </Pressable>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 40,
  },
  headerImage: {
    width: '100%',
    resizeMode: 'contain',
  },
  container: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-evenly',
  },
  buttonPressed: {
    backgroundColor: '#FF963B',
  },
  button: {
    backgroundColor: '#f58321',
    padding: 20,
  },

  userInfoContainer: {
    padding: 20,
  },
  userInfo: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-evenly',
    gap: 10,
  },
  userInfoLabel: {
    fontWeight: 'bold',
    color: 'green',
    flex: 0,
  },
  userInfoValue: {
    textAlign: 'right',
    flex: 1,
    overflow: 'hidden',
  },
  userImage: {
    marginTop: 20,
    width: 100,
    height: 100,
    borderRadius: 50,
    alignSelf: 'center',
  },

  textLight: {
    color: Colors.darker,
  },
  textDark: {
    color: Colors.lighter,
  },
});

export default App;
