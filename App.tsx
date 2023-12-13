import { CameraRoll, PhotoIdentifier } from '@react-native-camera-roll/camera-roll';
import React, { useEffect } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  PermissionsAndroid,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Torch from 'react-native-torch';


function App(): React.JSX.Element {

  const [photos, setPhotos] = React.useState<PhotoIdentifier[]>();
  const [torchStatus, setTorchStatus] = React.useState<boolean>(false);

  async function hasAndroidPermission() {
    const getCheckPermissionPromise = () => {
      if (Platform.Version >= 33) {
        return Promise.all([
          PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES),
          PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO),
        ]).then(
          ([hasReadMediaImagesPermission, hasReadMediaVideoPermission]) =>
            hasReadMediaImagesPermission && hasReadMediaVideoPermission,
        );
      } else {
        return PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE);
      }
    };

    const hasPermission = await getCheckPermissionPromise();
    if (hasPermission) {
      return true;
    }
    const getRequestPermissionPromise = () => {
      if (Platform.Version >= 33) {
        return PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
          PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO,
        ]).then(
          (statuses) =>
            statuses[PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES] ===
            PermissionsAndroid.RESULTS.GRANTED &&
            statuses[PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO] ===
            PermissionsAndroid.RESULTS.GRANTED,
        );
      } else {
        return PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE).then((status) => status === PermissionsAndroid.RESULTS.GRANTED);
      }
    };

    return await getRequestPermissionPromise();
  }

  useEffect(() => {
    if (Platform.OS === "android" && !(hasAndroidPermission())) {
      console.log("GOT PERMISSION");
      return;
    }
  }, []);

  const getAllPhotos = () => {
    CameraRoll.getPhotos({
      first: 200,
      assetType: 'Photos',
    })
      .then(r => {
        setPhotos(r.edges);
      })
      .catch((err) => {
        //Error Loading Images
      });
  };

  const toggleFlashlight = async () => {
    try {
      // const isTorchOn = await Torch.isTorchOn();
      await Torch.switchState(!torchStatus); // Toggle based on current state
      setTorchStatus(!torchStatus);
    } catch (error) {
      console.error(error);
    }
  };

  return (

    <View style={{ flex: 1 }}>

      <View style={{ width: '100%', alignItems: 'center' }}>
        <FlatList
          data={photos}
          numColumns={2}
          renderItem={({ item, index }) => {
            return (
              <View style={{
                width: Dimensions.get("window").width / 2 - 20,
                height: 200,
                borderRadius: 10,
                backgroundColor: "#F7BBBB",
                margin: 10,
              }}>
                <Image
                  source={{ uri: item.node.image.uri }}
                  style={{
                    width: "95%",
                    height: "95%",
                    alignSelf: "center",
                  }}
                />
              </View>
            );
          }}
        />
      </View>

      <TouchableOpacity
        style={{
          width: "90%",
          height: 50,
          backgroundColor: "#4054EB",
          justifyContent: "center",
          alignItems: "center",
          alignSelf: "center",
          position: "absolute",
          bottom: 20,
          borderRadius: 100,
        }}
        onPress={() => {
          console.log("PRESSED");
          toggleFlashlight();
          getAllPhotos();
        }}
      >
        <Text style={{ color: "#fff" }}>Sync Photos & Toggle Torch</Text>
      </TouchableOpacity>

    </View>
    // </SafeAreaView>
  );
}

export default App;
