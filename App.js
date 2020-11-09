import React ,{Component} from "react";
import * as RNLocalize from "react-native-localize";
import i18n from "i18n-js";
import memoize from "lodash.memoize"; // Use for caching/memoize for better performance

import {
  I18nManager,
  StyleSheet, Dimensions,View, Text,Image, Platform, TouchableOpacity, Linking, PermissionsAndroid ,TextInput
} from "react-native";
import SplashScreen from 'react-native-splash-screen'
import { CameraKitCameraScreen, } from 'react-native-camera-kit';
const {width, height} = Dimensions.get('window')
const translationGetters = {
  // lazy requires (metro bundler does not support symlinks)
   ar: () => require("./src/translations/ar.json"),
  de: () => require("./src/translations/de.json"),
  en: () => require("./src/translations/en.json"),
  fr: () => require("./src/translations/fr.json"),
};

const translate = memoize(
  (key, config) => i18n.t(key, config),
  (key, config) => (config ? key + JSON.stringify(config) : key)
);

const setI18nConfig = () => {
  // fallback if no available language fits
  const fallback = { languageTag: "en", isRTL: false };

  const { languageTag, isRTL } =
    RNLocalize.findBestAvailableLanguage(Object.keys(translationGetters)) ||
    fallback;

  // clear translation cache
  translate.cache.clear();
  // update layout direction
  I18nManager.forceRTL(isRTL);
  // set i18n-js config
  i18n.translations = { [languageTag]: translationGetters[languageTag]() };
  i18n.locale = languageTag;
};
export default class App extends Component {
   constructor() {
    super();
     setI18nConfig(); 
    this.state = {
      flagcountry:false,
      country:"",
      QR_Code_Value: '',
      Start_Scanner: false,
    };
  }
 
  
  componentDidMount(){
    RNLocalize.addEventListener("change", this.handleLocalizationChange);
    SplashScreen.hide();
  }
   componentWillUnmount() {
    RNLocalize.removeEventListener("change", this.handleLocalizationChange);
  }

  handleLocalizationChange = () => {
    setI18nConfig();
    this.forceUpdate();
  };
  checkcountry=(code)=> {
  code = parseInt(code.substr(0, 3), 10);

   if ((300 <= code && code <= 379)) {
  this.setState({
       country:"منتج فرنسى ",
       flagcountry:true
     })
  }
     else {
     this.setState({
       country:" منتج غير فرنسى  "
     })
  }
}
  openLink_in_browser = () => {
that.setState({ QR_Code_Value: '' ,country:"" });
    Linking.openURL(this.state.QR_Code_Value);
  }
  onQR_Code_Scan_Done = (QR_Code) => {
    this.setState({ QR_Code_Value: QR_Code });
    this.setState({ Start_Scanner: false });
    this.checkcountry(QR_Code)
  }
  open_QR_Code_Scanner=()=> {
    var that = this;
    if (Platform.OS === 'android') {
      async function requestCameraPermission() {
        try {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.CAMERA, {
              'title': 'Camera App Permission',
              'message': 'Camera App needs access to your camera '
            }
          )
          if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            that.setState({ QR_Code_Value: '' });
            that.setState({ Start_Scanner: true });
          } else {
            alert("CAMERA permission denied");
          }
        } catch (err) {
          alert("Camera permission err", err);
          console.warn(err);
        }
      }
      requestCameraPermission();
    } else {
      that.setState({ QR_Code_Value: '' });
      that.setState({ Start_Scanner: true });
    }
  }

  render() {
     if (!this.state.Start_Scanner) {
      return (
        <View style={styles.MainContainer}>
        <View>
   <TouchableOpacity
            onPress={this.open_QR_Code_Scanner}
            style={styles.button}>
            <Text style={{ color: '#FFF', fontSize: 14 }}>
              {translate("tapToScan")}
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.info}>
 <Text style={styles.QR_text}>
 
 {translate("ScannedQRCode")}
 </Text>
 {!this.state.QR_Code_Value ?
 <TextInput
      style={{ height: 40, borderColor: 'gray', borderWidth: 1 ,marginHorizontal:10 ,backgroundColor:"#13565A" ,color:"#fff" ,textAlign: 'center', fontSize:18 ,borderRadius:2 }}
      onChangeText={text => onChangeText(text)}
       value={this.state.QR_Code_Value }
      editable={false}
    />
    :
     <TextInput
      style={{ height: 40, borderColor: 'gray', borderWidth: 1 ,marginHorizontal:10 ,backgroundColor:"#13565A" ,color:"#fff" ,textAlign: 'center', fontSize:18 ,borderRadius:2 }}
      onChangeText={text => onChangeText(text)}
       value={this.state.QR_Code_Value }
      editable={false}
    />
    }
         
         {this.state.country !=="" ?
           <View style={{
             backgroundColor: "#fff",
          //  backgroundColor: "red",
          alignItems: 'center',
          // justifyContent: 'center',
           marginVertical:10,
            marginHorizontal:10 ,
            height:(height/5)+20
              ,flex:1 }}>
          { this.state.country !=="" && this.state.flagcountry ==false  ?
          <View style={{alignItems: 'center', }}> 
               <Image
        style={{ marginHorizontal:20,marginVertical:20 ,  width:(height/8) +20 , height:(height/8)+20 ,}}
        source={require('./images/accepted.png')}
resizeMode='cover'
      />
          <Text style={{textAlign: 'center', fontSize:27 ,fontWeight:"bold"}}> 
         {translate("SuccessMsg")}
           </Text>
            </View>

          :
<View style={{alignItems: 'center', paddingHorizontal: 10,}}>          
               <Image
        style={{ marginHorizontal:20,marginVertical:20 , width:(height/8 ) +20 , height:(height/8 )+20 ,}}
        source={require('./images/warning.jpg')}
resizeMode='cover'
      />
          <Text style={{textAlign: 'center', fontSize:27 ,fontWeight:"bold"}}> 
          {translate("RejectMsg")}
           </Text>
            </View>

           }
         
           </View>
           :null}
        </View>
         
        </View>
      );
    }
    return (
      <View style={{ flex: 1 }}>
        <CameraKitCameraScreen
          showFrame={true}
          scanBarcode={true}
          laserColor={'#FF3D00'}
          frameColor={'#00C853'}
          colorForScannerFrame={'black'}
          onReadCode={event =>
            this.onQR_Code_Scan_Done(event.nativeEvent.codeStringValue)
          }
        />
      </View>
    );
  }
  
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: "white",
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  },
   MainContainer: {
    flex: 1,
    paddingTop: (Platform.OS) === 'ios' ? 20 : 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: "#021921",
  },
  QR_text: {
    color: '#000',
    fontSize: 19,
    padding: 8,
    // marginTop: 12
  },
  button: {
     borderWidth: 5,
    borderColor: '#E2CFAA',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#13565F',
    alignItems: 'center',
    borderRadius: 100,
    padding: 12,
    width: 200,
    height:200,
    marginTop: 14
  },
  info:{
    marginVertical:25,
    flex: 1,
    backgroundColor: "#E2CFAA",
    // backgroundColor: "red",
    width:width-40,
    // height:height/2,
    borderBottomRightRadius: 15,
 borderTopLeftRadius: 15
  }

});