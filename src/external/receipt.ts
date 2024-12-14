// upload image first
import axios from "axios";

let data = JSON.stringify({
  "file_url": "https://veryfi-testing-public.s3.us-west-2.amazonaws.com/receipt.jpg"
});

let config = {
  method: 'post',
  maxBodyLength: Infinity,
  url: 'https://api.veryfi.com/api/v8/partner/documents',
  headers: { 
    'Content-Type': 'application/json', 
    'Accept': 'application/json', 
    'CLIENT-ID': 'vrfC4zRDwO7SZu2R9CbFYZusd0BU3xAvrvzBISE', 
    'AUTHORIZATION': 'apikey joshuajangprice:a50546030b1eb9e80fd0ba26d04b13f2', 
  },
  data : data
};

axios(config)
.then((response) => {
  console.log(JSON.stringify(response.data));
})
.catch((error) => {
  console.log(error);
});