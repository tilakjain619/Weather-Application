import React, { useState } from "react";
import './style.css'

const Weather = () => {
  const [search, setSearch] = useState("");
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState(null); // Add state for forecast data

  const searchWeather = async () => {
    if (search === "") {
      alert("Enter a valid city name");
    } else {
      try {
        // Current weather API call
        const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${search}&appid=${import.meta.env.VITE_OPENWEATHERMAP_API}`;
        const weatherResponse = await fetch(weatherUrl);
        const weatherData = await weatherResponse.json();

        if (weatherResponse.ok) {
          setWeather(weatherData);
          
          // Fetch 7-day forecast using coordinates from weather data
          const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${weatherData.coord.lat}&lon=${weatherData.coord.lon}&appid=${import.meta.env.VITE_OPENWEATHERMAP_API}`;
          const forecastResponse = await fetch(forecastUrl);
          const forecastData = await forecastResponse.json();
          
          if (forecastResponse.ok) {
            // Group forecast data by day
            const dailyForecast = groupForecastByDay(forecastData.list);
            setForecast(dailyForecast);
          }
        } else {
          throw new Error(weatherData.message || "City not found");
        }
      } catch (error) {
        console.error("Error:", error);
        alert(error.message);
        setWeather(null);
        setForecast(null);
      }
    }
  };

  // Helper function to group forecast data by day
  const groupForecastByDay = (forecastList) => {
    const grouped = {};
    forecastList.forEach(item => {
      const date = new Date(item.dt * 1000).toLocaleDateString();
      if (!grouped[date]) {
        grouped[date] = item;
      }
    });
    return Object.values(grouped).slice(1, 8); // Get next 7 days
  };

  return (
    <div className="container">
      <div className="container-upper">
        <div className="search">
        <input
            onChange={(e) => setSearch(e.target.value)}
            type="text"
            className="search-input"
            placeholder="Search city..."
          />
          <button className="search-btn" onClick={searchWeather}><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={20} height={20} fill={"none"}>
    <path d="M17.5 17.5L22 22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M20 11C20 6.02944 15.9706 2 11 2C6.02944 2 2 6.02944 2 11C2 15.9706 6.02944 20 11 20C15.9706 20 20 15.9706 20 11Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
</svg></button>
        </div>
      </div>
      <div className="container-lower">
        {weather ? (
          <>
            <div className="card">
                 <img
              src={`http://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
              alt={weather.weather[0].description}
            />
            <h2 className="temp">
              {Math.round(weather.main.temp - 273.15)}&deg; {/* Kelvin to Celsius */}
            </h2>
            <div className="extras">
                <span>Max: {Math.round(weather.main.temp_max - 273.15)}&deg;</span>&nbsp;
                <span>Min: {Math.round(weather.main.temp_min - 273.15)}&deg;</span>
            </div>
            <p className="desc">{weather.weather[0].description}</p>

            <div className="city-name">
                {weather.name}, {weather.sys.country}
            </div>
            </div>
            
            {forecast && (
              <div className="forecast-container">
                <h3>7-Day Forecast</h3>
                <div className="forecast-cards">
                  {forecast.map((day, index) => (
                    <div key={index} className="forecast-card">
                      <p>{new Date(day.dt * 1000).toLocaleDateString('en-US', { weekday: 'short' })}</p>
                      <img
                        src={`http://openweathermap.org/img/wn/${day.weather[0].icon}.png`}
                        alt={day.weather[0].description}
                      />
                      <p className="forecast-temp">
                        {Math.round(day.main.temp - 273.15)}°C
                      </p>
                      <p className="forecast-desc">{day.weather[0].description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <p className="search-info">Search for a city to get the weather information.</p>
        )}
      </div>
    </div>
  );
};

export default Weather;