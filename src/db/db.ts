import { connect } from "mongoose"




const connectDB = async():Promise<void> => {
    
    try {
        await connect(`${process.env.MONGO_URI}Restaurant`)
    }catch(error) {
        console.log(error)
        throw error
    }
}


export default  connectDB