import cors from 'cors';
import * as dotenv from 'dotenv';
import express from 'express';
import getOneTruck from './pages/location/get-one-truck.js';
import addNewParcel from './pages/parcel/add-parcel.js';
import getAllParcel from './pages/parcel/all-parcel.js';
import fetchParcelStatus from './pages/parcel/fetch-all-parcel-status.js';
import getParcelDetails from './pages/parcel/get-details.js';
import setTruckLocation from './pages/set-truck-location.js';
import getParcelsByPincode from './pages/parcel/fetch-parcel-pincode.js';

import deleteParcel from './pages/parcel/delete-parcel.js';
import parcelStatus from './pages/parcel/parcel-status.js';
import addNewPostOffice from './pages/post/add-post.js';
import getAllPost from './pages/post/allpost.js';
import deletePost from './pages/post/delete-post.js';
import addNewVehicle from './pages/vehicle/add-new.js';
import getAllVehicle from './pages/vehicle/all-vehicle.js';
import deleteVehicle from './pages/vehicle/delete-vehicle.js';
import sendToDelivery from './pages/vehicle/sendToDelivery.js';
import sendMail from './sendMail.js';

import load from './pages/parcel/parcels.js';
import fetchPostOffice from './pages/post/search-post.js';
import statistics from './pages/statistics.js';
import addNewUser from './pages/user/add-user.js';
import deleteUser from './pages/user/delete-user.js';
import getAllUser from './pages/user/get-details.js';

import generateApiKey from './pages/third-party/api-generator.js'; // Import the API key generator
import addNewParcelThird from './pages/third-party/third-party-add-parcel.js';
import viewIndividualUserOrders from './pages/third-party/third-party-individual.js';
import viewUserOrders from './pages/third-party/third-party-view-all.js';

import createTruckRoute from './pages/truck-routes/createRoute.js';
import getOneRoute from './pages/truck-routes/getOneRoute.js';
//import getAllTruckRoutes from './pages/truck-routes/viewRoutes.js';
import getallRoutes from './pages/truck-routes/getallRoutes.js';
import setTruckRoute from './pages/vehicle/set-route.js';
import addNewContractor from './pages/contractor/add-new.js';
import getAllContractor from './pages/contractor/all-contractor.js';
import getContractorsByPincode from './pages/contractor/by-pincode.js';
import loginUser from './pages/user/loginUser.js';

const app = express()
const port = 4000 || process.env.PORT
// const port = process.env.PORT

// set dotenv
dotenv.config();

// set cors
app.use(cors())

// add bodyparser
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.raw())


app.get('/', (req, res) => {
    res.send('Hello World!')
})

// ---- Truck Location ---- //
app.post('/set-truck-location', setTruckLocation)//saptarshi
app.post('/location/get-one-truck', getOneTruck) // saptarshi


// ---- Parcel ---- //
app.post('/parcel/add-new', addNewParcel) // saptarshi
app.post('/parcel/get-details', getParcelDetails) // saptarshi
app.post('/parcel/all-parcel', getAllParcel) //debajyoti
app.post('/parcel/delete-parcel', deleteParcel) // debajyoti
app.post('/parcel/parcel-status', parcelStatus) // debajyoti
app.post('/parcel/fetch-all-parcel-status', fetchParcelStatus) // debajyoti
app.post('/parcel/parcels', load)//shamba
app.post('/parcel/get-parcel-pincode', getParcelsByPincode); // debajyoti


// ---- Vehicle ---- //
app.post('/vehicle/add-new', addNewVehicle)//saptarshi
app.post('/vehicle/all-vehicle', getAllVehicle) //debajyoti
app.post('/vehicle/delete-vehicle', deleteVehicle) //debajyoti
app.post('/vehicle/set-route', setTruckRoute) // saptarshi
app.post("/vehicle/send-to-delivery", sendToDelivery);

// ----- Email ---- //
app.post('/send-mail', sendMail); //debajyoti


// ----- Statistics ---- //
app.post('/statistics', statistics); //shamba


// ---- Post Office ---- //
app.post('/post-office/add-new', addNewPostOffice)//saptarshi
app.post('/post-office/delete-post', deletePost) // debajyoti
app.post('/post/allpost', getAllPost) // shamba
app.post('/post/search-post', fetchPostOffice) // debajyoti


// ---- User ---- //
app.post('/user/get-details', getAllUser) // debajyoti
app.post('/user/add-user', addNewUser) // debajyoti
app.post('/user/delete-user', deleteUser) // debajyoti
app.post('/user/login',loginUser)


// ---- Truck Routes ---- //
app.post('/truck-routes/create-route', createTruckRoute); // saptarshi
//app.post('/truck-routes/get-all-routes', getAllTruckRoutes); // saptarshi
app.get('/truck-routes/getallRoutes', getallRoutes);
app.post('/truck-routes/get-one-route', getOneRoute); // saptarshi




// ---- 3pl integration ---- //

// Define a route to generate an API key
app.post('/third-party/api-generator', generateApiKey) // debajyoti
app.post('/third-party/third-party-add-parcel', addNewParcelThird) // debajyoti
app.post('/third-party/third-party-view-all', viewUserOrders) //debajyoti
app.post('/third-party/third-party-individual', viewIndividualUserOrders) //debajyoti


// ---- contractor ---- //
app.post('/contractor/add-new',addNewContractor) // shamba
app.post('/contractor/all-contractor',getAllContractor)
app.post('/contractor/by-pincode',getContractorsByPincode)

app.listen(port, () => {
    console.log(`Backend listening at http://localhost:${port}`)
})
