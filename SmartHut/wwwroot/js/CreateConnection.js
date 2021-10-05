var user; // Den inloggades email
var url;  // Här lagras url till SignalR
var accessToken; // Här lagras accessToken

// Handskakning för att få ut url och accessToken

function createConn() {
    user = document.getElementById("User").value;

    fetch(`https://smarthut.azurewebsites.net/api/negotiate`, {
        method: 'GET',
        headers: {
            'X-MS-SIGNALR-USERID': user
        }
    })
    .then(response => response.json())
    .then(function (jsonResponse) {
        url = jsonResponse.url;
        accessToken = jsonResponse.accessToken;
    })
    .then(() => Connection())
}

// Connection till SignalR och få data i realtid med newTelemetry

function Connection() {
    const connection = new signalR.HubConnectionBuilder()
        .withUrl(url, { accessTokenFactory: () => accessToken })
        .configureLogging(signalR.LogLevel.Information)
        .build();

    var data = document.getElementById("data");

    connection.on("newTelemetry", (getData) => {
        console.log(getData);
        data.innerHTML = "DeviceId: " + getData[0].deviceId + "<br/> Värde: " + getData[0].value.toFixed(0);
    });

    async function start() {
        try {
            await connection.start();
            console.log("connected");
        } catch (err) {
            console.log(err);
            setTimeout(() => start(), 3000);
        }
    };

    connection.onclose(async () => {
        await start();
    });

    start();
}

createConn();