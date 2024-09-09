// API key for OpenWeatherMap
const apiKey = ""; 
// Dom elements
const form = document.getElementById('form');
const searchInput = document.getElementById('search');
const weatherContainer = document.getElementById('weather-container');
const forecastContainer = document.getElementById('forecast-container');
const detailsContainer = document.getElementById('details-container');
const geoBtn = document.getElementById('geo-btn');
const unitSelect = document.getElementById('unit');


// URLs for API reguests
const apiUrl = (city, unit = 'metric') => `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=${unit}&appid=${apiKey}`;
const forecastUrl = (city, unit = 'metric') => `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=${unit}&appid=${apiKey}`;


// Function to get weather data by city name
async function getWeatherByLocation(city, unit = 'metric') {
    try {
        // Fetch weather data from API
        const response = await fetch(apiUrl(city, unit));
        if (!response.ok) {
            throw new Error('Weather data not available');
        }
        const data = await response.json();
        displayWeather(data);
        displayDetails(data);
        getWeatherForecast(city, unit);
    } catch (error) {
        // Log error and show alert if data fetch fails
        console.error('Error fetching weather data:', error);
        alert('Failed to fetch weather data. Please try again.');
    }
}


// Function to get weather forecast data by city name
async function getWeatherForecast(city, unit = 'metric') {
    try {
        // Fetch forecast data from API
        const response = await fetch(forecastUrl(city, unit));
        if (!response.ok) {
            throw new Error('Forecast data not available');
        }
        const data = await response.json();
        displayForecast(data);
    } catch (error) {
        // Log error and show alert if data fetch fails
        console.error('Error fetching forecast data:', error);
        alert('Failed to fetch forecast data. Please try again.');
    }
}


// Function to display current weather data
function displayWeather(data) {
    const temperature = Math.round(data.main.temp);
    const weatherCondition = data.weather[0].main;
    updateBackground(weatherCondition); // Update background based on current weather

    // Generate HTML for weather display
    const weatherHtml = `
        <div class="weather">
            <h2>
                <img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" alt="${data.weather[0].description}">
                ${temperature}°${unitSelect.value === 'metric' ? 'C' : 'F'}
                <img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" alt="${data.weather[0].description}">
            </h2>
            <small>${data.weather[0].main}</small>
        </div>
    `;
    weatherContainer.innerHTML = weatherHtml;
}


// Function to display weather forecast data
function displayForecast(data) {
    // Filter for daily forecasts at noon and generate HTML for each
    const forecastHtml = data.list.filter(item => item.dt_txt.includes("12:00:00")) // Filter for daily forecasts at noon
        .map(day => {
            const date = new Date(day.dt * 1000);
            const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
            const dateStr = date.toLocaleDateString('en-US', { day: '2-digit', month: 'short' });
            return `
                <div class="forecast-item">
                    <h3>${dayName} (${dateStr})</h3>
                    <img src="https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png" alt="${day.weather[0].description}">
                    <div>${Math.round(day.main.temp)}°${unitSelect.value === 'metric' ? 'C' : 'F'}</div>
                    <small>${day.weather[0].main}</small>
                </div>
            `;
        }).join('');
    forecastContainer.innerHTML = forecastHtml;
}


// Function to display additional weather details
function displayDetails(data) {
    // Generate HTML for weather details
    const detailsHtml = `
        <div class="details">
            <p>Wind Speed: ${data.wind.speed} m/s</p>
            <p>Humidity: ${data.main.humidity}%</p>
            <p>Pressure: ${data.main.pressure} hPa</p>
        </div>
    `;
    detailsContainer.innerHTML = detailsHtml;
}


// Function to update the background image based on weather condition
function updateBackground(weatherCondition) {
    let background;
    switch (weatherCondition) {
        case 'Clear':
            background = 'url("img/pexels-tahir-shaw-50609-186980.jpg")';
            break;
        case 'Clouds':
            background = 'url("img/pexels-pixabay-209831.jpg")';
            break;
        case 'Rain':
            background = 'url("img/pexels-hikaique-125510.jpg")';
            break;
        case 'Snow':
            background = 'url("img/pexels-mudabir-clicks-1077805396-27402816.jpg")';
            break;
        default:
            background = 'linear-gradient(135deg, #667eea, #764ba2)';
    }
    document.body.style.backgroundImage = background;
}


// Function to get weather data based on current geographical location
async function getWeatherByGeoLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
            const { latitude, longitude } = position.coords;
            const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=${unitSelect.value}&appid=${apiKey}`);
            const data = await response.json();
            displayWeather(data);
            displayDetails(data);
            getWeatherForecast(data.name, unitSelect.value);
            updateBackground(data.weather[0].main);
        });
    } else {
        alert('Geolocation is not supported by this browser.');
    }
}


// Event listener for form submission
form.addEventListener('submit', (e) => {
    e.preventDefault();
    const city = searchInput.value.trim();
    if (city) {
        getWeatherByLocation(city, unitSelect.value);
    } else {
        alert('Please enter a city name.');
    }
});


// Event listener for using current location
geoBtn.addEventListener('click', () => {
    getWeatherByGeoLocation();
});


// Event listener for changing temperature unit
unitSelect.addEventListener('change', () => {
    const city = searchInput.value.trim();
    if (city) {
        getWeatherByLocation(city, unitSelect.value);
    }
});
