import express,{Express} from "express"
import dotenv from 'dotenv'
import cookieParser from "cookie-parser"

dotenv.config()
const app:Express = express()

app.use(express.urlencoded({ limit: "100kb", extended: true }));
app.use(express.json())
app.use(cookieParser())


import userRouter from './routes/user.routes'
import restaurantRouter from './routes/restaurant.routes'


app.use('/api/v1/users', userRouter)
app.use('/api/v1/restaurant',restaurantRouter)

export default app