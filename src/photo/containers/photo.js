import React, { Component } from 'react';
import {
	ActivityIndicator,
	Button,
	Clipboard,
	FlatList,
	Image,
	Share,
	StyleSheet,
	Text,
	ScrollView,
  View,
  SafeAreaView,
  Platform,
} from 'react-native';
import { ImagePicker,Constants, Location, Permissions, SQLite } from 'expo';
import uuid from 'uuid';
import firebase from '../../../config/firebase';
import Environment from '../../../config/environment';

const db = SQLite.openDatabase('db.db');



class Photo extends Component {
	state = {
		image: null,
		uploading: false,
    googleResponse: null,
    confidence: 0,
    confidence_min: 0.50,
    date: '',
    time: '',
    data_time: '',
    location: null,
    errorMessage: null,
    array: null,
    TruckPlate:'',
    TruckPlateOriginal: '',
    TruckPlateConfidence: 0,
    TruckPlateUntrusted: '',
    Kilometers: '',
    KilometersOriginal: '',
    KilometersConfidence:'',
    KilometersUntrusted: '',
    Unit: 'KMS',
    lat: '',
    long: '',
    Ubication: '',
    Type: 'start',
    Logo: 'Logo',
    addedByPhone: 'False',
    synchronized: 'False',
	};

  componentWillMount() {
    if (Platform.OS === 'android' && !Constants.isDevice) {
      this.setState({
        errorMessage: 'Oops, this will not work on Sketch in an Android emulator. Try it on your device!',
      });
    } else {
      this._getLocationAsync();
    }
  }

	async componentDidMount() {
		await Permissions.askAsync(Permissions.CAMERA_ROLL);
    await Permissions.askAsync(Permissions.CAMERA);
    
    //this.update();

    db.transaction(tx => {
      tx.executeSql(
        'create table if not exists test (id_pic integer primary key not null, DataTime text, TruckPlate text, TruckPlateOriginal text, TruckPlateConfidence text, TruckPlateUntrusted text, Kilometers text, KilometersOriginal text, KilometersConfidence text, KilometersUntrusted text, Unit text, Location text, Type text, Logo text, addedByPhone text, synchronized text);'
        //'create table if not exists pic (id integer primary key not null, done int, value text);'
      );
    });
  }
  
  _getLocationAsync = async () => {
    let { status } = await Permissions.askAsync(Permissions.LOCATION);
    if (status !== 'granted') {
      this.setState({
        errorMessage: 'Permission to access location was denied',
      });
    }

    let location = await Location.getCurrentPositionAsync({});
    this.setState({ location });
  };


	render() {
    let { image } = this.state;
    let text = 'Waiting..';

    //=====================DATA_TIME====================
    var today = new Date();
    this.state.date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
    this.state.time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    //=====================DATA_TIME====================

    if (this.state.errorMessage) {
      text = this.state.errorMessage;
    } else if (this.state.location) {
      this.state.lat = JSON.stringify(this.state.location.coords.latitude);
      this.state.long = JSON.stringify(this.state.location.coords.longitude);
    }

		return (
      <View style={styles.container}>
				<ScrollView
					style={styles.container}
					contentContainerStyle={styles.contentContainer}
				>
          <View style={styles.getStartedContainer}>
						{image ? null : (
							<Text style={styles.getStartedText}>Bienvenido!</Text>
						)}       
        </View>

          <View style={styles.helpContainer}>
            {image ? null : (
              <Button
                onPress={this._pickImage}
                title="Elegir Imagen desde galeria"
              />
            )}

            {image ? null : (
              <Button onPress={this._takePhoto} title="Iniciar viaje" />
            )}
            {this.state.confidence > this.state.confidence_min && this.state.googleResponse && (  
              <View>
                <Text>Gracias los valores de tu viaje han sido almacenados</Text>
                <Text>{this.state.date}</Text>
                <Text>{this.state.time}</Text>
                <Text>LAT: {this.state.lat}</Text>
                <Text>LONG: {this.state.long}</Text>
                <Button
                  onPress={this._pickImage}
                  title="Elegir Imagen desde galeria"
                />
                <Button onPress={this._takePhoto} title="Finalizar viaje" />
              </View>    
            )}
						{this.state.confidence > this.state.confidence_min && this.state.googleResponse && (
              <View>
                <Text>{this.state.placa}</Text>
                {/*<FlatList
                    data={this.state.googleResponse.responses[0].textAnnotations}
                    extraData={this.state}
                    keyExtractor={this._keyExtractor}
                    renderItem={
                      ({ item }) =><Text>Item: {item.description}</Text>
                    }
                  />*/}
              </View>
            )}
						{this._maybeRenderImage()}
            {this._maybeRenderUploadingOverlay()}
					</View>
        </ScrollView>
      </View>
    );
	}

	// organize = array => {
	// 	return array.map(function(item, i) {
	// 		return (
	// 			<View key={i}>
  //         <Text>{item}</Text>
	// 			</View>
	// 		);
	// 	});
	// };

	_maybeRenderUploadingOverlay = () => {
		if (this.state.uploading) {
			return (
				<View
					style={[
						StyleSheet.absoluteFill,
						{
							backgroundColor: 'rgba(0,0,0,0.4)',
							alignItems: 'center',
							justifyContent: 'center'
						}
					]}
				>
					<ActivityIndicator color="#fff" animating size="large" />
				</View>
			);
		}
	};

	_maybeRenderImage = () => {
		let { image, googleResponse } = this.state;
		if (!image) {
			return;
		}

		return (
			<View
				style={{
					marginTop: 20,
					width: 250,
					borderRadius: 3,
					elevation: 2
				}}
      >
      <View style={styles.getStartedContainer}>
				{this.state.confidence != 0 && this.state.confidence < this.state.confidence_min && (
          <View>
            <Text style={styles.getStartedText}>Podrias tomar nuevamente la foto</Text>
            <Text>Creemos que los datos no son correctos, Puedes tomar nuevamente la foto?</Text>
          </View>
        )}
        
        {this.state.confidence != 0 && this.state.confidence < this.state.confidence_min &&(
          <Button
            onPress={this._pickImage}
            title="Elegir Imagen desde galeria"
          />
        )}

        {this.state.confidence != 0 && this.state.confidence < this.state.confidence_min && (
          <Button onPress={this._takePhoto} title="Tomar Foto" />
        )}
      </View>
          
          <Button
              style={{ marginBottom: 10 }}
              onPress={() => this.submitToGoogle()}
              title="Guardar!"
            />

            <View
              style={{
                borderTopRightRadius: 3,
                borderTopLeftRadius: 3,
                shadowColor: 'rgba(0,0,0,1)',
                shadowOpacity: 0.2,
                shadowOffset: { width: 4, height: 4 },
                shadowRadius: 5,
                overflow: 'hidden'
              }}
            >
            <Image source={{ uri: image }} style={{ width: 250, height: 250 }} />
            </View>
            <Text
              onPress={this._copyToClipboard}
              onLongPress={this._share}
              style={{ paddingVertical: 10, paddingHorizontal: 10 }}
            />
        
        <Text>{this.state.placa}</Text>
        <Text>{ this.state.confidence }</Text>
				{/*<Text>Raw JSON:</Text>

				{googleResponse && (
					<Text
						onPress={this._copyToClipboard}
						onLongPress={this._share}
						style={{ paddingVertical: 10, paddingHorizontal: 10 }}
					>
            {JSON.stringify(googleResponse.responses)}
					</Text>
        )}*/}
      </View>
      
		);
	};

	// _keyExtractor = (item, index) => item.id;

	// _renderItem = item => {
  //   <Text>response: {JSON.stringify(item)}</Text>;
  //   console.log(JSON.stringify())
	// };

	_share = () => {
		Share.share({
			message: JSON.stringify(this.state.googleResponse.responses),
			title: 'Check it out',
			url: this.state.image
		});
	};

	_copyToClipboard = () => {
		Clipboard.setString(this.state.image);
		alert('Copied to clipboard');
	};

	_takePhoto = async () => {
		let pickerResult = await ImagePicker.launchCameraAsync({
			allowsEditing: true,
			aspect: [4, 3]
		});

		this._handleImagePicked(pickerResult);
	};

	_pickImage = async () => {
		let pickerResult = await ImagePicker.launchImageLibraryAsync({
			allowsEditing: true,
			aspect: [4, 3]
		});

		this._handleImagePicked(pickerResult);
	};

	_handleImagePicked = async pickerResult => {
		try {
			this.setState({ uploading: true });

			if (!pickerResult.cancelled) {
				uploadUrl = await uploadImageAsync(pickerResult.uri);
				this.setState({ image: uploadUrl });
			}
		} catch (e) {
			console.log(e);
			alert('Upload failed, sorry :(');
		} finally {
			this.setState({ uploading: false });
		}
	};

	submitToGoogle = async () => {
		try {
			this.setState({ uploading: true });
			let { image } = this.state;
			let body = JSON.stringify({
				requests: [
					{
						features: [
							{ type: 'LABEL_DETECTION', maxResults: 10 },
							{ type: 'LANDMARK_DETECTION', maxResults: 5 },
							{ type: 'FACE_DETECTION', maxResults: 5 },
							{ type: 'LOGO_DETECTION', maxResults: 5 },
							{ type: 'TEXT_DETECTION', maxResults: 5 },
							{ type: 'DOCUMENT_TEXT_DETECTION', maxResults: 5 },
							{ type: 'SAFE_SEARCH_DETECTION', maxResults: 5 },
							{ type: 'IMAGE_PROPERTIES', maxResults: 5 },
							{ type: 'CROP_HINTS', maxResults: 5 },
							{ type: 'WEB_DETECTION', maxResults: 5 }
						],
						image: {
							source: {
								imageUri: image
							}
						}
					}
				]
			});
			let response = await fetch(
				'https://vision.googleapis.com/v1/images:annotate?key=' +
					Environment['GOOGLE_CLOUD_VISION_API_KEY'],
				{
					headers: {
						Accept: 'application/json',
						'Content-Type': 'application/json'
					},
					method: 'POST',
					body: body
				}
			);
			let responseJson = await response.json();
      //console.log(responseJson);
      //console.log(responseJson.responses[0].fullTextAnnotation.pages[0].blocks[0].confidence);
      this.setState({
				googleResponse: responseJson,
        uploading: false,
        confidence: responseJson.responses[0].fullTextAnnotation.pages[0].blocks[0].confidence,
        array: responseJson.responses[0].textAnnotations,
      });

      //=====================DATATIME================================
      this.state.data_time = this.state.data_time.concat(this.state.date,' ', this.state.time)
      console.log(this.state.data_time);
      //=====================DATATIME================================
      //=====================TruckPlateOriginal======================
      let palabra = 'PLACA'
      var arreglo = [];
      for (let i =0; i < this.state.array.length; i++ ){
        arreglo.push(this.state.array[i].description);
      }
      console.log(arreglo.indexOf(palabra));
      var positionPlaca = arreglo.indexOf(palabra);
      this.state.TruckPlateOriginal = this.state.TruckPlateOriginal.concat(arreglo[positionPlaca + 1], arreglo[positionPlaca + 2], arreglo[positionPlaca + 3]); 
      console.log(this.state.TruckPlateOriginal);
      //=====================TruckPlateOriginal========================
      //=====================TruckPlate================================
      this.state.TruckPlate = this.state.TruckPlateOriginal;
      //=====================TruckPlate================================

      //=====================TruckPlateConfidence======================
      this.state.TruckPlateConfidence = this.state.confidence;
      console.log(this.state.confidence);
      //=====================TruckPlateConfidence======================
      //=====================TruckPlateUntrusted=======================
      this.state.TruckPlateUntrusted = 'TRUE';
      console.log(this.state.TruckPlateUntrusted);
      //=====================TruckPlateUntrusted=======================

      //=====================KilometersOriginal========================
      //this.state.kms = arreglo[positionPlaca + 4]; 
      var foo = '';
      for (let j = positionPlaca + 4; j < positionPlaca + 10 ; j++)
      {
        this.state.KilometersOriginal = this.state.KilometersOriginal.concat(foo, arreglo[j]);
      }
      console.log(this.state.KilometersOriginal);
      //=====================KilometersOriginal========================
      //=====================Kilometers================================
      this.state.Kilometers = this.state.KilometersOriginal;
      console.log(this.state.Kilometers);
      //=====================Kilometers================================
      //=====================KilometersConfidence======================
      this.state.KilometersConfidence = this.state.confidence;
      console.log(this.state.KilometersConfidence);
      //=====================KilometersConfidence======================
      //=====================KilometersUntrusted=======================
      this.state.KilometersUntrusted = 'TRUE';
      console.log(this.state.KilometersUntrusted);
      //=====================KilometersUntrusted=======================
      //=====================LOCATION==================================
      this.state.Ubication = this.state.Ubication.concat(this.state.lat,', ', this.state.long)
      console.log(this.state.Ubication);
      //=====================Ubication==================================
      //=====================Type=======================================
      // if(this.state.confidence > 0 && this.state.confidence > this.state.confidence_min)
      // {
      //   this.state.type = 'end';
      // }
      // console.log(this.state.type)
      //=====================Type=======================================
    
        db.transaction(
          tx => {
            tx.executeSql('insert into test (DataTime,TruckPlate, TruckPlateOriginal, TruckPlateConfidence, TruckPlateUntrusted, Kilometers, KilometersOriginal, KilometersConfidence, KilometersUntrusted, Unit, Location, Type, Logo, addedByPhone, synchronized) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?)', [this.state.data_time, this.state.TruckPlate, this.state.TruckPlateOriginal, this.state.TruckPlateConfidence, this.state.TruckPlateUntrusted, this.state.Kilometers, this.state.KilometersOriginal, this.state.KilometersConfidence, this.state.KilometersUntrusted, this.state.Unit, this.state.Ubication, this.state.Type, this.state.Logo, this.state.addedByPhone, this.state.synchronized]);
            tx.executeSql('select * from test', [], (_, { rows }) =>
              console.log(JSON.stringify(rows))
            );
          },
         // null,
         // this.update
        );
		} catch (error) {
			console.log(error);
    }
	};
}

async function uploadImageAsync(uri) {
	const blob = await new Promise((resolve, reject) => {
		const xhr = new XMLHttpRequest();
		xhr.onload = function() {
			resolve(xhr.response);
		};
		xhr.onerror = function(e) {
			console.log(e);
			reject(new TypeError('Network request failed'));
		};
		xhr.responseType = 'blob';
		xhr.open('GET', uri, true);
		xhr.send(null);
	});

	const ref = firebase
		.storage()
		.ref()
		.child(uuid.v4());
	const snapshot = await ref.put(blob);

	blob.close();

	return await snapshot.ref.getDownloadURL();
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
    backgroundColor: '#fff',
		paddingBottom: 10
	},
	developmentModeText: {
		marginBottom: 20,
		color: 'rgba(0,0,0,0.4)',
		fontSize: 14,
		lineHeight: 19,
		textAlign: 'center'
	},
	contentContainer: {
		paddingTop: 30
	},

	getStartedContainer: {
		alignItems: 'center',
		marginHorizontal: 50
	},

	getStartedText: {
    marginTop: '100%',
		fontSize: 24,
		color: 'rgba(96,100,109, 1)',
		lineHeight: 24,
		textAlign: 'center'
	},

	helpContainer: {
		marginTop: 15,
		alignItems: 'center'
	}
});

export default Photo;
