const cityInput=document.querySelector(".city-input")
const searchButton=document.querySelector(".search-btn")
const locationButton=document.querySelector(".location-btn")
const currentWeatherDiv=document.querySelector(".current-weather")
const weatherCardsDiv=document.querySelector(".weather-cards")

const API_KEY="ddb2a288d83b41e4f661423cdee955ee"

const createWeatherCard=(cityName,weatherItem,index)=>{
    if(index === 0){
        return ` <div class="details">
                    <h2>${cityName} (${weatherItem.dt_txt.split(" ")[0]})</h2>
                    <h3>Temperature: ${(weatherItem.main.temp - 273.15).toFixed(2)}°C</h3>
                    <h4>Wind:${weatherItem.wind.speed} M/S</h4>
                    <h4>Humidity:${weatherItem.main.humidity}%</h4>
                </div>
                <div class="icon">
                    <img src="http://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@4x.png"  alt="weather-icon">
                    <h4>${weatherItem.weather[0].description}</h4>
                </div>`;
    }else{
        return `<li class="cards">
                    <h3>(${weatherItem.dt_txt.split(" ")[0]})</h3>
                    <img src="http://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@2x.png" alt="weather-icon">
                    <h4>Temp: ${(weatherItem.main.temp - 273.15).toFixed(2)}°C</h4>
                    <h4>Wind:${weatherItem.wind.speed} M/S</h4>
                    <h4>Humidity:${weatherItem.main.humidity}%</h4>
                </li>`
    }
   
}

const getWeatherDetails=(cityName,lat,lon)=>{
    const WEATHER_API_URL=`http://api.openweathermap.org/data/2.5/forecast/?lat=${lat}&lon=${lon}&appid=${API_KEY}`

    fetch(WEATHER_API_URL).then(res=>res.json()).then(data=>{
        const uniqueForecastDays=[]
        const fiveDaysForecast=data.list.filter(forecast=>{
            const forecastDate= new Date(forecast.dt_txt).getDate();
            if(!uniqueForecastDays.includes(forecastDate)){
                return uniqueForecastDays.push(forecastDate)
            }
        })

        cityInput.value="";
        weatherCardsDiv.innerHTML="";
        currentWeatherDiv.innerHTML="";

        
        fiveDaysForecast.forEach((weatherItem,index)=>{
            if(index === 0){
                currentWeatherDiv.insertAdjacentHTML("beforeend",createWeatherCard(cityName,weatherItem,index))
            }else{
                weatherCardsDiv.insertAdjacentHTML("beforeend",createWeatherCard(cityName,weatherItem,index))
            }
            
            
        })
    }).catch(()=>{
        alert("An error occured while fetching the Weather forecast")
    })
}

const getCityCoordinates=()=>{
    const cityName= cityInput.value.trim();
    if(!cityName) return;
    
    const GEOCODING_API_URL=`http://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_KEY}`;

    //get city coordinates (latitude,longitude and name) from the Api response
    fetch(GEOCODING_API_URL).then((res)=>res.json()).then((data)=>{
        if(!data.length) return  alert(`No coordinates found for ${cityName}`) 
        
        const {name,lat,lon}=data[0]
        getWeatherDetails(name,lat,lon)
    }).catch(()=>{
        alert("An error occured while fetching the coordinates")
    })
}
const getUserCoordinates=()=>{
    navigator.geolocation.getCurrentPosition(
        position=>{
            const {latitude,longitude}= position.coords;
            const REVERSE_GEOCODING_URL=`http://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}`
            fetch(REVERSE_GEOCODING_URL).then((res)=>res.json()).then((data)=>{
                const {name}=data[0]
                getWeatherDetails(name,latitude,longitude)
            }).catch(()=>{
                alert("An error occured while fetching the City!")
            })
        },
        error=>{
            if(error.code === error.PERMISSION_DENIED){
                alert("Geolocation request denied.please reset location permission to grant access again")
            }
        }
    )
}

locationButton.addEventListener("click",getUserCoordinates);
searchButton.addEventListener("click",getCityCoordinates);
cityInput.addEventListener("keyup", e => e.key === "Enter" && getCityCoordinates());
