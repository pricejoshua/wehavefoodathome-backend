// upload image first
import axios from "axios";
import veryfi from "../utils/veryfi"
import { Reciept, toReciept } from "../types/Reciept";
import aldi from "./responses/aldi.json";
 
// async function getRecieptData(imageUrl: string) {
//   const response = await veryfi.process_document_from_url(imageUrl);
//   console.log(response);
//   return response;
// }

async function getRecieptData(imageUrl: string) {
  const reciept = aldi as unknown as Reciept;
  // console.log(reciept);
  // console.log(typeof reciept);
  
  return reciept;
}

const url = "https://miro.medium.com/v2/resize:fit:640/format:webp/1*MLRlL9W69PMWAcTF-rV36Q.jpeg"

export default getRecieptData;