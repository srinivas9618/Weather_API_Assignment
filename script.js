import axios from 'axios' 
import env from 'dotenv'
import { readFile } from 'fs/promises'

env.config() 

const rawData = await readFile("./orders.json", "utf8") 
const ordersData = JSON.parse(rawData)


const apiKey = process.env.OPEN_WEATHER_API_KEY

const badWeatherConditions = ['Rain', 'Snow', 'Extreme']


const generateApology = (customer, city, weather) => 
    `Hi ${customer}, your order to ${city} is delayed due to ${weather.toLowerCase()}. We appreciate your patience!`;


const updatedOrdersData = await Promise.all(ordersData.map(async (order)=>{
        try{
            const {data} = await axios.get("https://api.openweathermap.org/data/2.5/weather", {params:{q:order.city, appid:apiKey}})
            const weatherCondition = data.weather[0].main
            const weatherDescription = data .weather[0].description
            if (badWeatherConditions.includes(weatherCondition)){
                    return ({
                        ...order,
                        status: "Delayed",
                        apology: generateApology(order.customer, order.city, weatherDescription)
                    })
            }

            return order
        }
        catch(error){
            console.log(`Error occured for the order: ${order.order_id}, Error: ${error.message}`)
            return order 
        }
}))

console.log(updatedOrdersData)
