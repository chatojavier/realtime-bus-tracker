//Mapbox token
mapboxgl.accessToken = 'pk.eyJ1IjoiY2hhdG9qYXZpZXIiLCJhIjoiY2twcnFxb3JtMHEzOTJwbGVseXNtZXI5cCJ9.xszgx99NJUKZEtQFthMWVA';

//create the map
var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v11',
    center: [-71.091542,42.358862],
    zoom: 12
});

counter = 0;

let busRoutes = [];
// Get routes and asign colors
let getRoutes = (bus) => {
    const route = bus.relationships.route.data.id;
    let color;
    if (!busRoutes.some(e => e.id === route)) {
        const routeOb = {
            id: route,
            color: "#" + Math.floor(Math.random()*16777215).toString(16)
        }
        color = routeOb.color
        busRoutes.push(routeOb);
    } else {
        for (let i = 0; i < busRoutes.length; i++) {
            const busroute = busRoutes[i];
            if (busroute.id === route) {
                color = busroute.color
            }
            
        }
    }
    return {id: route, color: color};
}

// Function that change the positions of buses
async function run(){
    // remove last buses list    
    if(counter !== 0) {
        markers.forEach(marker => {
            marker.remove();
        });
    }

    // get bus data
    const busData = await getBusData();

    markers = [];
    busData.forEach(bus => {
        //get routes list
        const routeData = getRoutes(bus);
        
        //latitude and longitude data
        const lat = bus.attributes.latitude;
        const lng = bus.attributes.longitude;

        //create the popup
        var popup = new mapboxgl.Popup({ offset: 25 })
        .setHTML(
        `<div>Route: ${routeData.id} </div>
        <div>Occupancy: ${bus.attributes.occupancy_status}</div>`
        );

        //Maker bus image
        const busMarker = document.createElement('div');
        busMarker.classList.add('busmarker');
        busMarker.innerHTML = `<svg id="bus-15" x="0px" y="0px" viewBox="0 0 15 15" style="enable-background:new 0 0 15 15;" xml:space="preserve">
            <style type="text/css">
                .bus02{fill:#FFFFFF;}
            </style>
            <path class="bus01" style="fill:${routeData.color};" d="M4,0C2.6,0,1,0.7,1,2.7v5.5V12c0,0,0,1,1,1v1c0,0,0,1,1,1s1-1,1-1v-1h7v1c0,0,0,1,1,1s1-1,1-1v-1c0,0,1,0,1-1V2.7
                c0-2-1.2-2.7-2.6-2.7H4z"/>
            <path class="bus02" d="M4.2,1.5h6.5c0.1,0,0.2,0.1,0.2,0.2S10.9,2,10.8,2H4.2C4.1,2,4,1.9,4,1.8S4.1,1.5,4.2,1.5z"/>
            <path class="bus02" d="M3,3h9c1,0,1,1,1,1v3c0,0,0,1-1,1H3C2,8,2,7,2,7V4C2,4,2,3,3,3z"/>
            <circle class="bus02" cx="3" cy="11" r="1"/>
            <circle class="bus02" cx="12" cy="11" r="1"/>
        </svg>`

        // create the marker
        var marker = new mapboxgl.Marker({
            element: busMarker,
        })
        .setLngLat([lng, lat])
        .setPopup(popup)
        .addTo(map);
        markers.push(marker);
    });

    // timer
    counter++;
    setTimeout(run, 15000);
}

// Request bus data from MBTA
async function getBusData(){
    const url = 'https://api-v3.mbta.com/vehicles';
    const response = await fetch(url);
    const json     = await response.json();
    return json.data;
}

run();