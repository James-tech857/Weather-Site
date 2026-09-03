
document.addEventListener("DOMContentLoaded", () => {
  // 1. Grab your HTML elements securely
  const inputField = document.getElementById('InputId') || document.getElementById('inputId');
  const celsusToggle = document.getElementById('celsusToggle');
  const cityElement = document.getElementById('cityForecast');
  const countryElement = document.getElementById('countryForecast');
  const deg = document.getElementById('numberDegree');
  const thunderStorm = document.getElementById('thunderStorm');
  const weatherReport = document.getElementById('weatherReport');
  const highLow = document.getElementById('highLow');
  const kilometer = document.getElementById('kilometer');
  const degPercentage = document.getElementById('degPercentage');
  const weatherDisplay = document.getElementById('weatherDisplay');
  const mod3 = document.getElementById('mod3');
  const goodElement = document.getElementById('good');
  const breathingElement = document.getElementById('breathing');


  // New Target Containers from your HTML setup
  const hourlyListWrapper = document.getElementById('hourlyListWrapper');
  const dailyListWrapper = document.getElementById('dailyListWrapper');

  // State management variables for unit toggling and dataset tracking
  let isCelsius = true; 
  let weatherTimelineRawData = []; 

  // 2. Temperature Unit Converter Function
  function convertTemp(tempC) {
    if (isCelsius) return Math.round(tempC);
    return Math.round((tempC * 9/5) + 32);
  }

  // Helper function to extract weather visual anchor icons matching raw descriptions
  function getWeatherIcon(mainDesc) {
    const desc = mainDesc.toLowerCase();
    if (desc.includes('thunderstorm')) return '⛈️';
    if (desc.includes('rain') || desc.includes('drizzle')) return '🌧️';
    if (desc.includes('clear')) return '☀️';
    if (desc.includes('cloud')) return '⛅';
    return '☁️';
  }

  // 3. UI Rendering Engine (Renders everything based on current unit state)
  function renderCompleteUI() {
    if (!weatherTimelineRawData || weatherTimelineRawData.length === 0) return;

    // A. Main Hero Spot (Index 0 is the current time bracket)
    const currentForecast = weatherTimelineRawData[0];
    
    if (deg) {
      deg.innerText = `${convertTemp(currentForecast.main.temp)}°
      `;
    }
    if (weatherReport) {
      weatherReport.innerText = `Feels like: ${convertTemp(currentForecast.main.feels_like)}°`;
    }
    if (highLow) {
      highLow.innerText = `H: ${convertTemp(currentForecast.main.temp_max)}° · L: ${convertTemp(currentForecast.main.temp_min)}°`;
      
      // Add right below highLow.innerText inside renderCompleteUI()
if (weatherDisplay) {
    weatherDisplay.innerText = getWeatherIcon(currentForecast.weather[0].main);
}

if (mod3) {
    const condition = currentForecast.weather[0].main.toLowerCase();
    let uvValue = 5; 
    let uvText = "(Mod)";
    let uvColor = "text-yellow-500";

    if (condition.includes('clear')) {
        uvValue = 8;
        uvText = "(Very High)";
        uvColor = "text-red-500";
    } else if (condition.includes('cloud')) {
        uvValue = 3;
        uvText = "(Mod)";
        uvColor = "text-yellow-500";
    } else if (condition.includes('rain') || condition.includes('thunderstorm')) {
        uvValue = 1;
        uvText = "(Low)";
        uvColor = "text-green-400";
    }

    mod3.innerHTML = `${uvValue} <span class="text-xs ${uvColor} font-normal">${uvText}</span>`;
      }
    }

    // B. Build Hourly Segment Cards (First 6 blocks from api array)
    if (hourlyListWrapper) {
      hourlyListWrapper.innerHTML = ''; 
      
      for (let i = 0; i < 6; i++) {
        const hourData = weatherTimelineRawData[i];
        if (!hourData) break;

        const hourTime = new Date(hourData.dt_txt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
        const hourTemp = convertTemp(hourData.main.temp);
        const icon = getWeatherIcon(hourData.weather[0].main);

        hourlyListWrapper.innerHTML += `
          <div class="w-20 text-center p-2 rounded-2xl hover:bg-gray-900 cursor-pointer transition">
            <p class="text-sm text-slate-400">${i === 0 ? 'Now' : hourTime}</p>
            <span class="text-2xl my-1 block">${icon}</span>
            <h3 class="font-bold">${hourTemp}°</h3>
          </div>
        `;
      }
    }
    
    // C. Build 5-Day Rows (Jumping 8 blocks = 24 Hours)
    if (dailyListWrapper) {
      dailyListWrapper.innerHTML = '';

      for (let i = 0; i < weatherTimelineRawData.length; i += 8) {
        const dayData = weatherTimelineRawData[i];
        const dayName = new Date(dayData.dt_txt).toLocaleDateString('en-US', { weekday: 'long' });
        const maxTemp = convertTemp(dayData.main.temp_max);
        const minTemp = convertTemp(dayData.main.temp_min);
        const icon = getWeatherIcon(dayData.weather[0].main);
        const conditionText = dayData.weather[0].main;

        dailyListWrapper.innerHTML += `
          <div class="flex justify-between items-center py-2 border-b border-slate-700/50 last:border-0">
            <div class="flex items-center gap-8 w-1/2">
              <p class="font-medium w-24">${dayName}</p>
              <div class="flex items-center gap-2">
                <span class="text-2xl">${icon}</span>
                <p class="text-slate-300 text-sm hidden sm:block">${conditionText}</p>
              </div>
            </div>
            <div class="flex gap-6 font-bold">
              <p class="text-white">${maxTemp}°</p>
              <p class="text-slate-400">${minTemp}°</p>
            </div>
          </div>
        `;
      }
    }
  }

  // 4. Global Unit Click Engine Toggle
  if (celsusToggle) {
    celsusToggle.addEventListener('click', () => {
      isCelsius = !isCelsius;
      celsusToggle.textContent = isCelsius ? '°C' : '°F';
      renderCompleteUI(); // Re-render instantly with converted numbers
    });
  }

  // 5. The Weather Engine Core Async Function
  async function getWeather(cityName) {
    const apiKey = '1b175cdc23f23c9788982302bcdedccf';
    const encodedCity = encodeURIComponent(cityName.trim());
    // const url = `https://openweathermap.org{encodedCity}&appid=${apiKey}&units=metric`;/
    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=${apiKey}&units=metric`;


    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`City "${cityName}" not found.`);
      }
      
      const data = await response.json();
      console.log("Success! Received API Data Object:", data);

      // Save raw dataset array reference globally so toggle access is available
      weatherTimelineRawData = data.list;

// 🟩 REPLACE THE AIR QUALITY BLOCK DIRECTLY HERE 🟩
if (data.city && data.city.coord) {
    const { lat, lon } = data.city.coord;
    const pollutionUrl = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`;
    
    try {
        const pollResponse = await fetch(pollutionUrl);
        if (pollResponse.ok) {
            const pollData = await pollResponse.json();
            
            // FIXED: Added [0] index accessor required by OpenWeather's unique payload structure
            const aqi = pollData.list[0].main.aqi; 
            
            const aqiMap = {
                1: { text: "Good", color: "text-teal-400", desc: "Optimal environment" },
                2: { text: "Fair", color: "text-green-400", desc: "Safe air quality" },
                3: { text: "Moderate", color: "text-yellow-500", desc: "Sensitive groups alert" },
                4: { text: "Poor", color: "text-orange-500", desc: "Unhealthy conditions" },
                5: { text: "Very Poor", color: "text-red-500", desc: "Hazardous environment" }
            };

            if (goodElement) {
                // Multiplies the 1-5 rating into a traditional 0-100 visual scale index value
                goodElement.innerHTML = `${aqi * 20} <span class="text-xs font-normal ${aqiMap[aqi].color}">(${aqiMap[aqi].text})</span>`;
            }
            if (breathingElement) {
                breathingElement.innerText = aqiMap[aqi].desc;
            }
        }
    } catch (e) {
        console.error("Air Quality fetch failed:", e.message);
    }
  }


      const currentForecast = weatherTimelineRawData[0];

      // Update Text Layout Nodes safely
      if (cityElement) cityElement.innerText = data.city.name;
      if (countryElement) countryElement.innerText = data.city.country;

      if (thunderStorm && currentForecast.weather.length > 0) {
        const description = currentForecast.weather[0].description;
        thunderStorm.innerText = description.charAt(0).toUpperCase() + description.slice(1);
      }

      if (kilometer && currentForecast.wind) {
        kilometer.innerText = `${Math.round(currentForecast.wind.speed * 3.6)} km/h`;
      }

      if (degPercentage) degPercentage.innerText = `${currentForecast.main.humidity}%`;

      // Trigger full layout build calculations
      renderCompleteUI();
      return data;

    } catch (error) {
      console.error("Failed to fetch weather object:", error.message);
      alert(error.message);
    }
  }

    // 5. Connect the Input Box for typing new cities
  if (inputField) {
    inputField.addEventListener('keypress', (event) => {
      if (event.key === 'Enter') {
        const targetCity = inputField.value.trim(); // 1. Grab the name FIRST
        
        if (targetCity !== "") {
          getWeather(targetCity);                 // 2. Pass it to the API
          inputField.value = "";                  // 3. Clear the box LAST
        }
      }
    });
  }

  // 7. Auto boot layout initialization on load
  getWeather('Lagos');
});
