import React, { Component } from 'react';
import {
	ActivityIndicator,
	Button,
  Clipboard,
  Dimensions,
  LayoutAnimation,
  StatusBar,
  TouchableOpacity,
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
    image64: null,
		uploading: false,
    googleResponse: null,
    TripCode: '',
    confidence: 0,
    confidence_min: 0.1,
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
    showImage: true,
    showData: false,
    start: true,
    repeat: 0,
    repeatKMS: 0,
    startKilometer: 0,
    endKilometer: 0,
    temporal: '',
    noSynchronized: 0,
    local: false,
  };

  baseState = {
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
    //Type: 'start',
    Logo: 'Logo',
    addedByPhone: 'False',
    synchronized: 'False',
    Kilo: '',
    lati: '',
    longi: '',
    showImage: true,
    showData: false,
    startKilometer: 0,
    endKilometer: 0,
    //start: true,
    repeat: 0,
    repeatKMS: 0,
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
    
    //Create DB
    db.transaction(tx => {
      tx.executeSql(
        'create table if not exists trip_test (id_pic integer primary key not null, TripCode text, DataTime text, TruckPlate text, TruckPlateOriginal text, TruckPlateConfidence text, TruckPlateUntrusted text, Kilometers text, KilometersOriginal text, KilometersConfidence text, KilometersUntrusted text, Unit text, Location text, Type text, Logo text, picURL text, picLocal text,  addedByPhone text, synchronized text);'
        //'create table if not exists pic (id integer primary key not null, done int, value text);'
      );
      //GET state inicial of trip
      this._getInitialstate();

      //GET no synchronized data
      this._getNoSynchronized();

    });    

    // Se crea un timer que ejecuta la sincronización con Firebase cada 4 mins.
    // this.interval = setInterval(
    //   () => {
    //     subirafirebase = submitToFirebase();
    //     //GET no synchronized data
    //     this._getNoSynchronized();
    //   },
    //   40000
    // );

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
    let { image64 } = this.state;
    let text = 'Waiting..';
    if (this.state.errorMessage) {
      text = this.state.errorMessage;
    } else if (this.state.location) {
      this.state.lat = JSON.stringify(this.state.location.coords.latitude);
      this.baseState.lati = this.state.lat;
      this.state.long = JSON.stringify(this.state.location.coords.longitude);
      this.baseState.longi = this.state.lat;
    }
    // let googleResponseV;
    // let confidenceV;
    let TripCodeV = '';
    let dateV;
    let timeV;
    let data_timeV;
    let locationV;
    let arrayV;
    let ConfidenceV;
    let TruckPlateV;
    let TruckPlateOriginalV;
    let TruckPlateConfidenceV;
    let TruckPlateUntrustedV;
    let KilometersV;
    let KilometersOriginalV;
    let KilometersConfidenceV;
    let KilometersUntrustedV;
    let UnitV;
    let latV;
    let longV;
    let UbicationV;
    let TypeV;
    let LogoV;
    let picResultV
    let picURLV;
    let picLocal;
    let addedByPhoneV;
    let synchronizedV;
    let repeatV;
    let temporalV;
    let DateTimeCreatedV;
    let DateTimeStartedV;
    let DateTimeendedV;
    let StatusV;
    let TotalKilometersV;
    let TruckPlateVR;
    let id_pic_startV;
    let id_pic_endV;
    let id_tripV;

    //=====================DATA_TIME====================
    var today = new Date();
    this.state.date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
    this.state.time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    //=====================DATA_TIME====================
  
		return (
      <View style={styles.container}>
				<ScrollView
					style={styles.container}
					contentContainerStyle={styles.contentContainer}
        >

        { this.state.noSynchronized != 0 &&(     
          <Text style={styles.noSynchronized}>Tienes { this.state.noSynchronized } viajes pendientes de sincronizar</Text>
        )}

          <View style={styles.helpContainer}>
            <View style={styles.getStartedContainer}>
              {image ? null : (
                <Text style={styles.getStartedText}>Bienvenido</Text>
              )}
            </View>
            {/*************Borrar despues******************/}
            {image ? null : (
              <Button
                onPress={this._pickImage}
                title="Elegir Imagen desde galeria"
              />
            )}
             {/*************Borrar despues******************/}
            {image ? null : (
              <Button onPress={this._takePhoto} title="Iniciar viaje" />
            )}
            { this.state.repeatKMS != 1 && this.state.googleResponse && this.baseState.repeat != 1  && this.state.showData == false &&(     
              <View style={styles.getStartedContainer}>
              <Text>Codigo del viaje: { this.state.TripCode }</Text>
                <Text style={styles.getStartedText}>Gracias los valores de tu viaje han sido almacenados</Text>
                {this.state.start &&( 
                  <Text>{this.baseState.Kilo} KMS</Text>
                )}
                {!this.state.start &&(     
                  <Text>Total { this.baseState.endKilometer - this.baseState.startKilometer } KMS</Text>
                )}
                <Text>LAT: {this.baseState.lati} LONG: {this.baseState.longi}</Text>
                <Button  
                  onPress={this._changeData}
                  title="Aceptar" />
              </View>    
            )}

						{this._maybeRenderImage()}
            {this._maybeRenderUploadingOverlay()}
          </View>
        </ScrollView>
      </View>
    );
	}


  _maybeRenderUrl = () => {
    if (!this.state.lastScannedUrl) {
      return;
    }
  }
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
		let { image64, image, googleResponse } = this.state;
		if (!image) {
			return;
		}

		return (
      <View style={styles.container}>
      {this.state.repeatKMS == 1 && (
        <View style={styles.getStartedContainer}>
            <Text style={styles.getStartedText}>Podrias tomar nuevamente la foto</Text>
            <Text>Creemos que los datos no son correctos, ¿Puedes tomar nuevamente la foto?</Text>
            {/*************Borrar despues******************/}
            {
            <Button
              onPress={this._pickImage}
              title="Elegir Imagen desde galeria"
            />
            }
            
            {/*************Borrar despues******************/}
            <Button onPress={this._takePhoto} title="Tomar Foto" />
        </View>
      )}
      {this.state.repeatKMS != 1 && this.baseState.repeat != 1 && this.state.showData == true && this.state.start == false && (  
        <View style={styles.getStartedContainer}>
          <Text>Codigo del viaje: { this.state.TripCode }</Text>
          <Text style={styles.getStartedText}>Estos son los datos de tu Viaje</Text>
          <Text>KMS: {this.baseState.Kilo} </Text>
          <Text>LAT: {this.baseState.lati} </Text>
          <Text>LONG: {this.baseState.longi}</Text>
          {/*************Borrar despues******************/}
           {<Button
            onPress={this._pickImage}
            title="Elegir Imagen desde galeria"
           />}
          {/*************Borrar despues******************/}
          <Button onPress={this._takePhoto} title="Finalizar Viaje" />
        </View>    
      )}

      <View style={styles.getStartedContainer}>
          {this.state.confidence != 0 && this.state.confidence < this.state.confidence_min && this.baseState.repeat == 1 && (
          <View>
            <Text style={styles.getStartedText}>Podrias tomar nuevamente la foto</Text>
            <Text>Creemos que los datos no son correctos, ¿Puedes tomar nuevamente la foto?</Text>
          </View>
        )}
        {/*************Borrar despues******************/}
        {this.state.confidence != 0 && this.state.confidence < this.state.confidence_min && this.baseState.repeat == 1 && (
          <Button
            onPress={this._pickImage}
            title="Elegir Imagen desde galeria"
          />
        )}
        {/*************Borrar despues******************/}
        {this.state.confidence != 0 && this.state.confidence < this.state.confidence_min && this.baseState.repeat == 1 && (
          <Button onPress={this._takePhoto} title="Tomar Foto" />
        )}
      </View>    
    </View>
      
		);
	};

	// _keyExtractor = (item, index) => item.id;

	// _renderItem = item => {
  //   <Text>response: {JSON.stringify(item)}</Text>;
  //   console.log(JSON.stringify())
  // };
  
//GET state inicial of trip
  _getInitialstate = () => {
    db.transaction(
      tx4 => {
        tx4.executeSql(' SELECT * FROM trip_test ORDER BY id_pic DESC LIMIT 1;', [], (_, { rows }) => 
        {
          let tempo1 = 'start' ;
          let kileterTemp = '';
          let tripCodeTemp = '';

          if(rows._array[0])
          {
            let tempo1 = rows._array[0].Type;
            let kileterTemp = rows._array[0].KilometersOriginal;
            let tripCodeTemp = rows._array[0].TripCode;
            let dateTimeTemp = rows._array[0].DataTime;
            let TruckPlateTemp = rows._array[0].TruckPlate;

            //var temporalV = JSON.stringify(rows),
            //console.log(JSON.stringify(rows._array[0].Type))
            //console.log(rows._array[0].Type)
            this.setState ({temporal: tempo1})
            //console.log(this.state.temporal)
            //console.log(JSON.stringify(rows))
            //console.log('temporalV')
            console.log(tempo1);
            console.log(this.state.temporal);
            if(this.state.temporal === 'start'){
              console.log('para terminar');
              this.setState({
                start: false,
                showData: true,
                TripCode: tripCodeTemp,
                image: 'foo',
                Type: 'end',
              });
              this.baseState.startKilometer = parseFloat(kileterTemp).toFixed(2)
              this.baseState.Kilo = parseFloat(kileterTemp).toFixed(2)
              TypeV = 'end'
              DateTimeCreatedV = dateTimeTemp
              DateTimeStartedV = dateTimeTemp
              TruckPlateVR = TruckPlateTemp
              id_pic_startV = tripCodeTemp
              id_tripV = tripCodeTemp

            }else{
              console.log('para iniciar');
              this.setState({
                start: true,
                showData: false,

              });
              console.log(this.state.start);
            }
          }
        }
        );
    });
  }

//GET no synchronized data
  _getNoSynchronized = () => {
    db.transaction(
      tx5 => {
        tx5.executeSql(' SELECT count(*) AS number FROM trip_test WHERE synchronized=?', ['False'], (_, { rows }) => 
        {
          let noSynchronizedV = rows._array[0].number;
          this.setState ({ noSynchronized: noSynchronizedV})
          console.log('no sincronizado')
          console.log(this.state.noSynchronized)
          console.log(JSON.stringify(rows))
        }
        );
    });
  }

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
    //subirafirebase = await uploadToDatabase("000001","000002");
		let pickerResult = await ImagePicker.launchCameraAsync({
      base64: true,
			allowsEditing: true,
			aspect: [4, 3]
		});

    this._handleImagePicked(pickerResult);
    //this.submitToGoogle();
	};

	_pickImage = async () => {
		let pickerResult = await ImagePicker.launchImageLibraryAsync({
      base64: true,
			allowsEditing: true,
			aspect: [4, 3]
		});

    this._handleImagePicked(pickerResult);
  };
  
  // _getGeneralData = async () => {
  //   this._changeShow()
  //   //=====================TripCode=+++==========================
  //   if(this.state.start){
  //     console.log('Entra 23');
  //     console.log('Numero aleatorio');
  //     var max = Math.round((new Date()));
  //     var min = Math.round((new Date()).getTime() / 1000);
  //     var code = this._tripCode(max, min)
  //     toStringV = code.toString();
  //     this.setState({ TripCode: toStringV,});
  //     console.log(this.state.TripCode);
  //     console.log('Numero aleatorio');
  //   }
  //   TripCodeV = this.state.TripCode;
  //   //=====================TripCode=+++==========================
  //   //=====================Coords================================
  //   //this._getLocationAsync();
  //   location = await this._getLocationAsync();
  //   this.setState({ location });
  //   if (this.state.errorMessage) {
  //     text = this.state.errorMessage;
  //     console.log('Entra 24.1');
  //   } else if (this.state.location) {
  //     console.log('Entra 24.2');
  //     this.state.lat = JSON.stringify(this.state.location.coords.latitude);
  //     this.baseState.lati = this.state.lat;
  //     this.state.long = JSON.stringify(this.state.location.coords.longitude);
  //     this.baseState.longi = this.state.long;
  //     console.log('Entra 24.3');
  //   }
  //   //=====================Coords================================
  //   //=====================LOCATION==================================
  //   this.state.Ubication = this.state.Ubication.concat(this.state.lat,', ', this.state.long)
  //   console.log(this.state.Ubication);
  //   UbicationV = this.state.Ubication;
  //   this.baseState.lati = this.state.lat;
  //   this.baseState.longi = this.state.long;
  //   console.log('Entra 25');
  //   //=====================Ubication==================================

  //   //=====================DATATIME================================
  //   this.state.data_time = this.state.data_time.concat(this.state.date,' ', this.state.time)
  //   console.log(this.state.data_time);
  //   data_timeV = this.state.data_time;
  //   console.log('Entra 26');
  //   //=====================DATATIME================================
  //   //=====================Type=======================================
  //   // if(this.state.confidence > 0 && this.state.confidence > this.state.confidence_min)
  //   // {
  //   //   this.state.type = 'end';
  //   // }
  //   // console.log(this.state.type)
  //   TypeV = this.state.Type;
  //   console.log('Entra 27');
  //   //=====================Type=======================================
  //   //conf parametros para trabajar sin red
  //   // if(!responseJson)
  //   // {
  //   //   console.log('sin red');
  //   //   this.setState({
  //   //     image: picLocalV,
  //   //     showData: true,
  //   //     start: false,
  //   //   });
  //   // }
  // }

	_handleImagePicked = async pickerResult => {
    //console.log('la url local')
    //console.log(pickerResult.base64);
    picResultV = pickerResult;
    this.setState({ 
      image64: pickerResult.base64,
      image:pickerResult.base64,
     });
    picLocalV = pickerResult.uri;
    //console.log(pickerResult.uri)
    //console.log('la url local')
    
    //this._getGeneralData();
    this.submitToGoogle();
  };
 
  //Cambia estado de contendor de image
  _changeShow = () => {
    this.setState({
      showImage: !this.state.showImage
    });
  
  }

  //Cambia estado contenedor muestra datos del viaje
  _changeData = () => {
    if (this.state.start){
      this.setState({
        showData: !this.state.showData,
        Type: 'end',
        start: false,
        //startKilometer: KilometersOriginalV
      });
      //this.baseState.startKilometer = this.state.startKilometer; 
      console.log('final')
      //console.log(this.baseState.startKilometer);
    }else if(!this.state.start){
      this.setState(this.baseState);
      this.setState({ 
        image: null,
        uploading: false,
        googleResponse: null, 
        start: true,
       // endKilometer: KilometersOriginalV
      });
      //this.baseState.endKilometer = this.state.endKilometer; 
      console.log('inicio')
      //console.log(this.baseState.startKilometer);
    }
  }

   _tripCode = (min, max) => {       
      var numPosibilidades = max - min 
      var aleat = Math.random() * numPosibilidades 
      aleat = Math.round(aleat) 
      return parseInt(min) + aleat
    }

	submitToGoogle = async () => {
		try {
      console.log('Entra 1');
			this.setState({ uploading: true,});
      let { image } = this.state;
      let { image64 } = this.state;
			let body = JSON.stringify({
				requests: [
					{
						features: [
							{ type: 'DOCUMENT_TEXT_DETECTION', maxResults: 10 },
						],
						image: {
							content: image64
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
      if(responseJson.responses[0].textAnnotations != undefined){
        try{
          //if(responseJson){
            console.log(responseJson);
            console.log('Entra 2');
            this.setState({
              googleResponse: responseJson,
              uploading: false,
              confidence: responseJson.responses[0].fullTextAnnotation.pages[0].blocks[0].confidence,
              array: responseJson.responses[0].textAnnotations,
              kilometersbegin: 0,
              kilometersend: 0
            });
          // }else{
          //   this.setState({local: true});
          //   console.log('Entra 22');
          //}
          this._changeShow()
        }catch (e){
          if(this.state.repeatKMS == 0 && this.state.repeat == 0){
            this.setState({ repeatKMS: 1,});
            this.baseState.repeatKMS = this.state.repeatKMS;
          }else if(this.state.repeatKMS == 1){
            this.setState({ repeatKMS: 2,});
            this.baseState.repeatKMS = this.state.repeatKMS;
          } 
        }
      }else{
        //this.setState(this.baseState);
        console.log('No hayy respuesta');
        this.baseState.repeatKMS = this.state.repeatKMS;
      }  


      this.setState({ 
        //repeatKMS: 1,
        lat:'',
        long:'',
        Ubication:'',
        date:'',
        time:'',
        data_time:'',
      });
    //=====================TripCode=+++==========================
    if(this.state.start){
      console.log('Entra 23');
      console.log('Numero aleatorio');
      var max = Math.round((new Date()));
      var min = Math.round((new Date()).getTime() / 1000);
      var code = this._tripCode(max, min)
      toStringV = code.toString();
      this.setState({ TripCode: toStringV,});
      console.log(this.state.TripCode);
      console.log('Numero aleatorio');
    }
    TripCodeV = this.state.TripCode;
    //=====================TripCode=+++==========================
    //=====================Coords================================
    //this._getLocationAsync();
    location = await this._getLocationAsync();
    this.setState({ location });
    if (this.state.errorMessage) {
      text = this.state.errorMessage;
      console.log('Entra 24.1');
    } else if (this.state.location) {
      console.log('Entra 24.2');
      this.state.lat = JSON.stringify(this.state.location.coords.latitude);
      this.baseState.lati = this.state.lat;
      this.state.long = JSON.stringify(this.state.location.coords.longitude);
      this.baseState.longi = this.state.long;
      console.log('Entra 24.3');
    }
    //=====================Coords================================
    //=====================LOCATION==================================
    this.state.Ubication = this.state.Ubication.concat(this.state.lat,', ', this.state.long)
    console.log(this.state.Ubication);
    UbicationV = this.state.Ubication;
    this.baseState.lati = this.state.lat;
    this.baseState.longi = this.state.long;
    console.log('Entra 25');
    //=====================Ubication==================================

    //=====================DATATIME================================
    this.state.data_time = this.state.data_time.concat(this.state.date,' ', this.state.time)
    console.log(this.state.data_time);
    data_timeV = this.state.data_time;
    console.log('Entra 26');
    //=====================DATATIME================================
    //=====================Type=======================================
    // if(this.state.confidence > 0 && this.state.confidence > this.state.confidence_min)
    // {
    //   this.state.type = 'end';
    // }
    // console.log(this.state.type)
    TypeV = this.state.Type;
    console.log('Entra 27');
       
      //=====================IF NETWOK==================================
      // if (this.state.confidence < this.state.confidence_min){
      //     if(this.state.repeat == 0){
      //       console.log('Entra 4');
      //       this.setState({ 
      //         repeat: 1,
      //         lat:'',
      //         long:'',
      //         Ubication:'',
      //         date:'',
      //         time:'',
      //         data_time:'',
      //       });
      //       repeatV = this.state.repeat;
      //       this.baseState.repeat = repeatV
      //     }else if(this.state.repeat == 1){
      //       this.setState({ repeat: 2,});
      //       repeatV = this.state.repeat;
      //       this.baseState.repeat = repeatV
      //       console.log('Entra 5');
      //     } 
      // }
        //entrithis.setState(this.baseState);
       if(responseJson.responses[0].textAnnotations != undefined && !this.state.local && this.state.repeat == 0 || this.state.repeat == 2){

        //=====================Confidence===============================
        ConfidenceV = this.state.confidence;
        //=====================Confidence===============================
        //=====================TruckPlateOriginal=======================
        let palabra = 'PLACA'
        var arreglo = [];
        var text = this.state.array[0]["description"];
        console.log("texto sin modificar: "+text);
        text=text.toLowerCase();
        text=text.replace(/ /g,"");
        text=text.replace(/\./g,"");
        text=text.replace(/,/g,"");
        text=text.replace(/ /g,'');
        text=text.replace(/\\/g,"");
        text=text.replace(/\n/g,"");
        text=text.replace(/o/g,"0");
        text=text.replace(/u/g,"0");

        console.log("texto modificado: "+text);

        var text = text.substring(
          text.lastIndexOf("-0537") + 5, 
          text.lastIndexOf("kil0meters")
        );
        var textPlateAndKms = text;
        console.log("texto modificado2: "+text);
        for (let i =0; i < this.state.array.length; i++ ){
          arreglo.push(this.state.array[i].description);
        }
        console.log(arreglo.indexOf(palabra));
        var positionPlaca = arreglo.indexOf(palabra);
        //this.state.TruckPlateOriginal = this.state.TruckPlateOriginal.concat(arreglo[positionPlaca + 1], arreglo[positionPlaca + 2], arreglo[positionPlaca + 3]); 
        this.state.TruckPlateOriginal = 'P-913CDS';
        console.log(this.state.TruckPlateOriginal);
        TruckPlateOriginalV = this.state.TruckPlateOriginal;

        //=====================TruckPlateOriginal========================
        //=====================TruckPlate================================
        this.state.TruckPlate = this.state.TruckPlateOriginal;
        TruckPlateV = this.state.TruckPlate;
        //=====================TruckPlate================================

        //=====================TruckPlateConfidence======================
        this.state.TruckPlateConfidence = this.state.confidence;
        console.log(this.state.confidence);
        TruckPlateConfidenceV = this.state.TruckPlateConfidence;
        //=====================TruckPlateConfidence======================
        //=====================TruckPlateUntrusted=======================
        this.state.TruckPlateUntrusted = 'TRUE';
        console.log(this.state.TruckPlateUntrusted);
        TruckPlateUntrustedV = this.state.TruckPlateUntrusted;
        //=====================TruckPlateUntrusted=======================

        //=====================KilometersOriginal========================
        //this.state.kms = arreglo[positionPlaca + 4]; 
        var cero = '0';
        KilometersOriginalV = 0;
        console.log("Lo primero "+textPlateAndKms);
        this.state.KilometersConfidence = 0.90;
        if(textPlateAndKms =='undefined' || textPlateAndKms == undefined) {
          this.baseState.Kilo = 0;
          //this.state.confidence = 0.10;
          this.state.KilometersConfidence = 0.10;
          //repetir foto por que no hay kms registrado
          if(this.state.repeatKMS == 0 && this.state.repeat == 0){
            this.setState({ repeatKMS: 1,});
            this.baseState.repeatKMS = this.state.repeatKMS;
          }else if(this.state.repeatKMS == 1){
            this.setState({ repeatKMS: 2,});
            this.baseState.repeatKMS = this.state.repeatKMS;
          } 
        }else{
          KilometersOriginalV = textPlateAndKms;
          KilometersOriginalV=KilometersOriginalV.replace(/i/g,'1');
          KilometersOriginalV=KilometersOriginalV.replace(/e/g,'3');
          KilometersOriginalV=KilometersOriginalV.replace(/t/g,'7');
          KilometersOriginalV=KilometersOriginalV.replace(/a/g,'4');
          KilometersOriginalV=KilometersOriginalV.replace(/s/g,'5');
          KilometersOriginalV=KilometersOriginalV.replace(/b/g,'8');
          KilometersOriginalV=KilometersOriginalV.replace(/d/g,'0');

          console.log("size2  "+KilometersOriginalV.length)
          //==============CUSTOM CONFIDENCE==========================
          if (KilometersOriginalV.length == 6){
            KilometersOriginalV = KilometersOriginalV.concat(KilometersOriginalV, cero)
          }else if(KilometersOriginalV.length != 7)
          {
            this.state.KilometersConfidence = 0.10;
            if(this.state.repeatKMS == 0 && this.state.repeat == 0){
              this.setState({ repeatKMS: 1,});
              this.baseState.repeatKMS = this.state.repeatKMS;
            }else if(this.state.repeatKMS == 1){
              this.setState({ repeatKMS: 2,});
              this.baseState.repeatKMS = this.state.repeatKMS;
            } 
            console.log(this.baseState.repeatKMS); 
            console.log('conf1'); 
          }
          
          if(KilometersOriginalV.length == 7) {
            this.state.KilometersConfidence = 0.90;
            this.setState({ repeatKMS: 0,});
            this.baseState.repeatKMS = this.state.repeatKMS;

            try {
              KilometersOriginalV = parseInt(KilometersOriginalV);
              KilometersOriginalV = KilometersOriginalV / 10 ;
                          
            }
            catch (e) {
              this.state.KilometersConfidence = 0.10;
              //repetir la foto
              if(this.state.repeatKMS == 0 && this.state.repeat == 0){
                this.setState({ repeatKMS: 1,});
                this.baseState.repeatKMS = this.state.repeatKMS;
              }else if(this.state.repeatKMS == 1){
                this.setState({ repeatKMS: 2,});
                this.baseState.repeatKMS = this.state.repeatKMS;
              } 
              console.error(e.message);
            }
          }else{
            if(this.state.repeatKMS == 0 && this.state.repeat == 0){
              this.setState({ repeatKMS: 1,});
              this.baseState.repeatKMS = this.state.repeatKMS;
            }else if(this.state.repeatKMS == 1){
              this.setState({ repeatKMS: 2,});
              this.baseState.repeatKMS = this.state.repeatKMS;
            } 
          }
          //==============CUSTOMCONFIDENCE==========================
            if(this.state.start){
              this.state.kilometersbegin = KilometersOriginalV
              this.baseState.startKilometer = this.state.kilometersbegin
            }else {
              this.state.kilometersend = KilometersOriginalV
              this.baseState.endKilometer = this.state.kilometersend
            }

            //Valida si kilimentros end es mayor a cero y si kilometros beggin es mayor repite la foto
            if(this.baseState.endKilometer > 0 && this.baseState.startKilometer > this.baseState.endKilometer){
              if(this.state.repeatKMS == 0 && this.state.repeat == 0){
                this.setState({ repeatKMS: 1,});
                this.baseState.repeatKMS = this.state.repeatKMS;
              }else if(this.state.repeatKMS == 1){
                this.setState({ repeatKMS: 2,});
                this.baseState.repeatKMS = this.state.repeatKMS;
              } 
            }else {
              this.baseState.Kilo = KilometersOriginalV;
              KilometersConfidenceV = this.state.KilometersConfidence;
            }
           //Valida si kilimentros end es mayor a cero y si kilometros beggin es mayor repite la foto
            //Valida que el total de kms recorridos no sea mayor a 500kms
            if((this.baseState.startKilometer + this.baseState.endKilometer) > 500){
              if(this.state.repeatKMS == 0 && this.state.repeat == 0){
                this.setState({ repeatKMS: 1,});
                this.baseState.repeatKMS = this.state.repeatKMS;
              }else if(this.state.repeatKMS == 1){
                this.setState({ repeatKMS: 2,});
                this.baseState.repeatKMS = this.state.repeatKMS;
              } 
            }
            //Esta variable se usa para el resumen del viaje en la funcion tripTable
            var kilo1 = parseFloat(this.baseState.startKilometer)
            var kilo2 = parseFloat(this.baseState.endKilometer)
            var kilo3 = kilo1 + kilo2
            TotalKilometersV = kilo3       
        }
        //=====================KilometersOriginal========================
        //=====================Kilometers================================
        this.state.Kilometers = this.state.KilometersOriginal;
        console.log(this.state.Kilometers);
        KilometersV = this.state.Kilometers;
        //=====================Kilometers================================
        //=====================KilometersConfidence======================
        //this.state.KilometersConfidence = this.state.confidence;
        //console.log(this.state.KilometersConfidence);
        //KilometersConfidenceV = this.state.KilometersConfidence;
        //=====================KilometersConfidence======================
        //=====================KilometersUntrusted=======================
        this.state.KilometersUntrusted = 'TRUE';
        console.log(this.state.KilometersUntrusted);
        KilometersUntrustedV = this.state.KilometersUntrusted;
        //=====================KilometersUntrusted=======================
        //=====================Unit======================================
        UnitV = this.state.Unit;
        //=====================Unit=======================================
        //=====================Logo=======================================
        LogoV = this.state.Logo;
        //=====================Logo=======================================
        //=====================picRUL=====================================
        try {
          this.setState({ uploading: true });
    
          if (!picResultV.cancelled) {
            uploadUrl = await uploadImageAsync(picResultV.uri);
            this.setState({ image: uploadUrl });
          }
        } catch (e) {
          console.log(e);
          alert('Upload failed, sorry :(');
        } finally {
          this.setState({ uploading: false });
        }
        picURLV = this.state.image;
        //=====================picRUL=======================================
        //=====================addedByPhone===============================
        addedByPhoneV = this.state.addedByPhone;
        //=====================addedByPhone===============================
        //=====================synchronized===============================
        synchronizedV = this.state.synchronized;
        //=====================synchronized===============================
        // if (this.state.confidence < this.state.confidence_min){
        //   if(this.state.repeat == 0){
        //     this.setState({ repeat: 1,});
        //     repeatV = this.state.repeat;
        //   }else if(this.state.repeat == 1){
        //     this.setState({ repeat: 2,});
        //     repeatV = this.state.repeat;
        //   } 
        // }
        this.setState(this.baseState);
        console.log('antes de insert');
        console.log(this.state.repeatKMS);
        //console.log(repeatV);
        if(this.baseState.repeatKMS == 0 || this.baseState.repeatKMS == 2){
          subirafirebase = await uploadToDatabase(TripCodeV, data_timeV, TruckPlateV, TruckPlateOriginalV, TruckPlateConfidenceV, TruckPlateUntrustedV, KilometersV, KilometersOriginalV, KilometersConfidenceV, KilometersUntrustedV, UnitV, UbicationV, TypeV, LogoV, picURLV, addedByPhoneV,);
          subiralog = await logTrip(TripCodeV, responseJson);
          this.setState({synchronized: 'true'})
          synchronizedV = this.state.synchronized;
          db.transaction(
            tx => {
              tx.executeSql('insert into trip_test (TripCode, DataTime,TruckPlate, TruckPlateOriginal, TruckPlateConfidence, TruckPlateUntrusted, Kilometers, KilometersOriginal, KilometersConfidence, KilometersUntrusted, Unit, Location, Type, Logo, picURL, picLocal, addedByPhone, synchronized) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?,?)', [TripCodeV, data_timeV, TruckPlateV, TruckPlateOriginalV, TruckPlateConfidenceV, TruckPlateUntrustedV, KilometersV, KilometersOriginalV, KilometersConfidenceV, KilometersUntrustedV, UnitV, UbicationV, TypeV, LogoV, picURLV, picLocalV, addedByPhoneV, synchronizedV]);
              tx.executeSql('select * from trip_test', [], (_, { rows }) =>
                console.log(JSON.stringify(rows))
              );
            },
          );
          //Sube data a la table viejes (trip resumen)
          if(TypeV === 'start'){
            DateTimeCreatedV = data_timeV;
            DateTimeStartedV = data_timeV;
            TruckPlateVR = TruckPlateOriginalV;
            id_pic_startV = TripCodeV;
            id_tripV = TripCodeV;
          }else{
            StatusV = 'closed';
            DateTimeendedV = data_timeV;
            //TotalKilometersV = KilometersOriginalV;
            id_pic_endV = TripCodeV;
          }
          
          if(TypeV === 'end'){
            subirtrip = await tripTable(DateTimeCreatedV, DateTimeStartedV, DateTimeendedV, StatusV, TotalKilometersV, TruckPlateVR, id_pic_startV, id_pic_endV, id_tripV,);
          }

          //Sube data a la table viejes (trip resumen)


          this.setState({ 
            repeat: 0,
            repeatKMS: 0,
          });
          this.baseState.repeat = 0;
          this.state.repeatKMS = 0;
          this.baseState.repeatKMS = 0;
          this.setState({ Type: 'start',});
          //GET no synchronized data
          this._getNoSynchronized();
        //=====================IF NETWORK===============================
        }
      }else if(this.state.local){
        this.setState(this.baseState);
        this.setState({ synchronized: 'False', })
        synchronizedV = this.state.synchronized;
        db.transaction(
          tx => {
            tx.executeSql('insert into trip_test (TripCode, DataTime, Location, Type, picLocal, synchronized) values (?, ?, ?, ?, ?, ?)', [TripCodeV, data_timeV, UbicationV, TypeV, picLocalV, synchronizedV]);
            tx.executeSql('select * from trip_test', [], (_, { rows }) =>
              console.log(JSON.stringify(rows))
            );
          },
        );
        this.setState({ repeat: 1,});
        this.setState({ Type: 'start',});
        //GET no synchronized data
        this._getNoSynchronized();
      }else{
        console.log('inicia de nuevo1');
        this.setState({ 
          repeatKMS: 1,
          lat:'',
          long:'',
          Ubication:'',
          date:'',
          time:'',
          data_time:'',
        });
        this.setState({uploading:false})
      }
      
		} catch (error) {
      console.log('inicia de nuevo');
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

async function uploadToDatabase(
  TripCode,
  DataTime,
  TruckPlate,
  TruckPlateOriginal,
  TruckPlateConfidence,
  TruckPlateUntrusted,
  Kilometers,
  KilometersOriginal,
  KilometersConfidence,
  KilometersUntrusted,
  Unit,
  Location,
  Type,
  Logo,
  picURL,
  addedByPhone,
  ) {
      firebase.database().ref('Viajes/').push({
        TripCode,
        DataTime,
        TruckPlate,
        TruckPlateOriginal,
        TruckPlateConfidence,
        TruckPlateUntrusted,
        Kilometers,
        KilometersOriginal,
        KilometersConfidence,
        KilometersUntrusted,
        Unit,
        Location,
        Type,
        Logo,
        picURL,
        addedByPhone,
    }).then((data)=>{
        //success callback
        console.log('data ' , data)
        return data;
    }).catch((error)=>{
        //error callback
        console.log('error ' , error)
        return error;
    })

}

// LOG
async function logTrip(
  TripCode,
  responseJson,
  ) {
      firebase.database().ref('Log/').push({
        TripCode,
        responseJson,
    }).then((data)=>{
        //success callback
        console.log('data ' , data)
        return data;
    }).catch((error)=>{
        //error callback
        console.log('error ' , error)
        return error;
    })

}
// LOG

// Trip_table
async function tripTable(
  DateTimeCreated,
  DateTimeStarted,
  DateTimeended,
  Status,
  TotalKilometers,
  TruckPlate,
  id_pic_start,
  id_pic_end,
  id_trip,
  ) {
      firebase.database().ref('viajes/').push({
        DateTimeCreated,
        DateTimeStarted,
        DateTimeended,
        Status,
        TotalKilometers,
        TruckPlate,
        id_pic_start,
        id_pic_end,
        id_trip,
    }).then((data)=>{
        //success callback
        console.log('data ' , data)
        return data;
    }).catch((error)=>{
        //error callback
        console.log('error ' , error)
        return error;
    })

}

// Trip_table

/**
 * Función de sincronización
 */
async function submitToFirebase() {
  var database = firebase.database();
  console.log('### EJECUTANDO SINCRONIZACIÓN ###');
  try {
    db.transaction(tx => {
      tx.executeSql('select * from trip_test WHERE synchronized=?', ['False'], (_, { rows }) =>
      {
        
        for(x=0;x<rows.length;x++)  {
          let ele = rows._array[x];
          database.ref('/Viajes').push({
            TripCode:ele.TripCode,
            DateTime:ele.DataTime,
            Kilometers:ele.Kilometers,
            KilometersConfidence:ele.KilometersConfidence,
            KilometersOriginal:ele.KilometersOriginal,
            KilometersUntrusted:ele.KilometersUntrusted,
            Location:ele.Location,
            Logo:ele.Logo,
            picURL:ele.picURL,
            TruckPlate:ele.TruckPlate,
            TruckPlateConfidence:ele.TruckPlateConfidence,
            TruckPlateOriginal:ele.TruckPlateOriginal,
            TruckPlateUntrusted:ele.TruckPlateUntrusted,
            Type:ele.Type,
            Unit:ele.Unit,
            addedByPhone:ele.addedByPhone
          }).then((data)=>{
              
              db.transaction(function (tx2) {
                tx2.executeSql('update trip_test set synchronized=\'True\' where id_pic='+ele.id_pic, [], function(tx3, rs3){
                  });
              });
              console.log('enviado registro no. '+ele.id_pic);
          }).catch((error)=>{
              //error callback
              console.log('error ' , error)
          })
        }
      }
      );
    });
  } catch (error) {
    console.log(error);
  }
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
    backgroundColor: '#fff',
		paddingBottom: 10
  },
  noSynchronized:{
    paddingTop: 45,
    textAlign: 'center'
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
		marginHorizontal: 60
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
  },
  
  url: {
    flex: 1,
  },

  urlText: {
    color: '#fff',
    fontSize: 20,
  },

  cancelButton: {
    marginLeft: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },

  cancelButtonText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 18,
  },
});


export default Photo;
