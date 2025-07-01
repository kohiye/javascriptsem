
let myScroll = document.querySelectorAll(".scrollh")
for (let el of myScroll){
    el.addEventListener("wheel", (e) => {
        e.preventDefault();
        el.scrollLeft += e.deltaY;
    })
}

let key = "d3cf127b87324f4fa40143600252305"

function createElementFromHTML(htmlString){
    let div = document.createElement('div');
    div.innerHTML = htmlString.trim();
    return div.firstChild;
}

class DayForecast {
    constructor(iconURL, temp_low, temp_high, desc, date){
        this.iconURL = iconURL;
        this.temp_low = Math.round(temp_low);
        this.temp_high = Math.round(temp_high);
        this.desc = desc;
        this.date = date;
    }
    display(box) {
        let dateItems = this.date.split("-")
        let element = createElementFromHTML(
            `
            <div class="day" data-date="${this.date}">
                <h2 class="date">${dateItems[1]}/${dateItems[2]}</h2>
                <img class="day-icon" src="https:${this.iconURL}">
                <h2 class="temp-high">${this.temp_high}°</h2>
                <h2 class="temp-low">${this.temp_low}°</h2>
                <h2 class="day-desc">${this.desc}</h2>
            </div>
            `
        );
        element.addEventListener("click", (e) => {
            e.preventDefault();
            getAllWeather(e.target.attributes["data-date"].value);
        });
        box.append(element);
    }
}

class CurrentWeather {
    constructor(temp, feelsTemp, iconURL, desc){
        this.temp = Math.round(temp);
        this.feelsTemp = Math.round(feelsTemp);
        this.iconURL = iconURL;
        this.desc = desc;
    }
    display(box){
        if (box.hasChildNodes()){
            box.removeChild(box.firstElementChild);
        }
        box.append(createElementFromHTML(
            `
            <div id="current-flex">
                <h2 id="current-desc">${this.desc}</h2>
                <dir>
                <h1 id="current-temp">${this.temp}</h1>
                <img id="current-icon" src="https:${this.iconURL}" width="80px">
                </dir>
                <h2 id="current-feel">Feels like ${this.feelsTemp}°</h2>
            </div>
            `
        ));
    }
}

class HourForecast {
    constructor(temp, iconURL, time){
        this.temp = Math.round(temp);
        this.iconURL = iconURL;
        this.time = time;
    }
    display(box){
        box.append(createElementFromHTML(
            `
            <div>
                <h3 class="hour-temp">${this.temp}°</h3>
                <img id="hour-icon" src="https:${this.iconURL}">
                <h3 class="hour-time">${this.time}</h3>
            </div>
            `
        ));
    }
}

async function getData(location) {
    const url = `http://api.weatherapi.com/v1/forecast.json?key=${key}&q=${location}&days=3&aqi=no&alerts=no`
    try {
        const response = await fetch(url);
        if (!response.ok){
            throw new Error(`Response status: ${response.status}`);
        }

    const json = await response.json();
    console.log(json);
    return json;
    } catch(error){
        console.error(error.message);
    }
}

function getDailyForecast(json){
    let daily = []
    for (let day of json.forecast.forecastday){
        daily.push(new DayForecast(day.day.condition.icon, day.day.mintemp_c, day.day.maxtemp_c, day.day.condition.text, day.date))
    }
    return daily;
}

function getHourlyForecast(json, date = null){
    if (!date){
        date = json.forecast.forecastday[0].date;
    }
    let hourly = [];
    for (let day of json.forecast.forecastday){
        if (day.date != date) continue;
        for (let hour of day.hour){
            hourly.push(new HourForecast(hour.temp_c, hour.condition.icon, hour.time.split(" ")[1]))
        }
    }
    return hourly;
}

function getCurrentWeather(json){
    return new CurrentWeather(json.current.temp_c, json.current.feelslike_c, json.current.condition.icon, json.current.condition.text);
}

function welcomeFade(){
    let username = document.getElementById("name-input").value;
    document.getElementById("header").innerHTML = `Welcome, ${username}`;
    document.getElementById("welcome-screen").style.display = "none";
}

document.getElementById("location-input").addEventListener("input", async (e) => {
    if (!e.target.value){
        return;
    }
    let datalist = document.getElementById("locations");
    let url = `http://api.weatherapi.com/v1/search.json?key=${key.replaceAll(" ", "-").toLowerCase()}&q=${e.target.value}`
    try {
        const response = await fetch(url);
        if (!response.ok){
            throw new Error(`Response status: ${response.status}`);
        }

    const json = await response.json();
    while(datalist.childElementCount > 30){
        datalist.removeChild(datalist.firstElementChild);
    }
    for(let loc of json){
        datalist.appendChild(createElementFromHTML(`<option value="${loc.name}"></option`))
    }
    } catch(error){
        console.error(error.message);
    }
});

async function getAllWeather(date = null){
    let currentBox = document.getElementById("current");
    let hoursBox = document.getElementById("hours");
    let daysBox = document.getElementById("days");
    hoursBox.innerHTML = "";
    daysBox.innerHTML = "";

    let location = document.getElementById("location-input").value;
    let json = await getData(location);

    let current = getCurrentWeather(json);
    current.display(currentBox);

    let days = getDailyForecast(json);
    for(let day of days){day.display(daysBox)};

    let hours = getHourlyForecast(json, date);
    for(let hour of hours){hour.display(hoursBox)};
};
//getHourlyForecast("Kemerovo", "2025-07-01")
//getDailyForecast("Kemerovo")

// runtime
/*

- display name entry field
- hide name entry field
- display name in the corner
- show location entry field
- on entry show forecast for days and hours of current day
    * current
    * 3 days
    * by hour
- on click change by hour forecast

*/