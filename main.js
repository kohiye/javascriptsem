
let myScroll = document.querySelectorAll(".scrollh")
for (let el of myScroll){
    el.addEventListener("wheel", (e) => {
        e.preventDefault();
        el.scrollLeft += e.deltaY;
    })
}

let key = "d3cf127b87324f4fa40143600252305"

let forecastDays = [];

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
        box.append(createElementFromHTML(
            `
            <div>
                <div class="date">${dateItems[1]}/${dateItems[2]}</div>
                <img class="day-icon" src="https:${this.iconURL}">
                <div class="temp-high">${this.temp_high}°</div>
                <div class="temp-low">${this.temp_low}°</div>
                <div class="day-desc">${this.desc}</div>
            </div>
            `
        ));
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
        box.append(createElementFromHTML(
            `
            <div id="current-flex">
                <h2 id="current-desc">${this.desc}</h2>
                <h1 id="current-temp">${this.temp}</h1>
                <img id="current-icon" src="https:${this.iconURL}">
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
    for (let day of json.forecast.forecastday){
        forecastDays.push(new DayForecast(day.day.condition.icon, day.day.mintemp_c, day.day.maxtemp_c, day.day.condition.text, day.date))
    }
}

function getHourlyForecast(json, date){
    let hourly = [];
    for (let day of json.forecast.forecastday){
        if (day.date != date) continue;
        for (let hour of day.hour){
            hourly.push(new HourForecast(hour.temp_c, hour.condition.icon, hour.time.split(" ")[1]))
        }
    }
    console.log(hourly);
    return hourly;
}

function getCurrentWeather(json){
    return new CurrentWeather(json.current.temp_c, json.current.feelslike_c, json.current.condition.icon, json.current.condition.text);
}

let daysBox = document.getElementById("days");
let currentBox = document.getElementById("current");
let hoursBox = document.getElementById("hours");
//getData("Kemerovo").then(getDailyForecast).then(console.log(forecastDays)).then(() => {});
(async function(){
    let json = await getData("Kemerovo");
    getDailyForecast(json);
    console.log(forecastDays);
    let current = getCurrentWeather(json);
    current.display(currentBox);
    for(let day of forecastDays){day.display(daysBox)};
    let hours = getHourlyForecast(json, "2025-07-01");
    for(let hour of hours){hour.display(hoursBox)};
}());
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