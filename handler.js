const Request = require('axios');

const co2Data = {
    'small-diesel-car': 142,
    'small-petrol-car': 154,
    'small-plugin-hybrid-car': 73,
    'small-electric-car': 50,
    'medium-diesel-car': 171,
    'medium-petrol-car': 192,
    'medium-plugin-hybrid-car': 110,
    'medium-electric-car': 58,
    'large-diesel-car': 209,
    'large-petrol-car': 282,
    'large-plugin-hybrid-car': 126,
    'large-electric-car': 73,
    'bus': 27,
    'train': 6
}

async function getCoordinates(token, loc) {
    const config = {
        method: 'GET',
        url: `https://api.openrouteservice.org/geocode/search?api_key=${token}&text=${loc}&layers=locality`,
        headers: {
            'Accept': 'application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8'
        }
    };
    const data = Request(config).then(function (response) {
        const res = response.data.features[0].geometry.coordinates;
        return res;
    })
    return data;
}

function getDistance(token, lat1, long1, lat2, long2) {
    request({
        method: 'GET',
        url: `https://api.openrouteservice.org/geocode/search?api_key=${token}&text=${start}&layers=locality`,
        headers: {
            'Accept': 'application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8'
        }
    }, function (error, response, body) {
        console.log('Status:', response.statusCode);
        console.log('Headers:', JSON.stringify(response.headers));
        const coordinate = JSON.parse(response.body).features[0].geometry.coordinates;
        console.log(coordinate);
        if (response.statusCode == '200' && coordinate != undefined && coordinate.length != 0) {
            return coordinate;
        }
    })
}

function calculateConsumption(distance, mode) {
    const keys = Object.keys(co2Data);
    let co2Value;
    for (var i = 0; i < keys.length; i++) {
        if (mode == keys[i]) co2Value = co2Data[mode];
    }
    const consumption = distance * co2Value / 1000;
    return consumption;
}

const start = process.argv.slice(2);
const end = process.argv.slice(3);
const mode = process.argv.slice(4);

//check if the user inputs are valid

async function handler() {
    // store token in env variable
    const token = '5b3ce3597851110001cf6248087667c7e9d4475abc3a2ad8c91e8d9b';
    //call open route servide api to get lat, long 
    try {
        const coordinate1 = await getCoordinates(token, start);
        const long1 = coordinate1[0];
        const lat1 = coordinate1[1];
        console.log('coordinate1', lat1, long1);
        const coordinate2 = await getCoordinates(token, end);
        const long2 = coordinate2[0];
        const lat2 = coordinate2[1];
        console.log('coordinate2', lat2, long2);
        // calculate distance between two cities calling open route service api
        const distance = getDistance(token, lat1, long1, lat2, long2);
        const output = calculateConsumption(distance, mode);
        console.log(`Your trip caused ${output}kg of CO2-equivalent.`)
    } catch (e) {
        console.log(e);
    }


    

    // add check for edge cases
    // make code more beautiful
    //write unit tests
    // serverless for deployment to aws
    // es lint in npm
    // clean up
    // gitlab yml
    // upate read me
};
handler();