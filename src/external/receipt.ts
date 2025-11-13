// upload image first
import axios from 'axios';
import veryfi from '../utils/veryfi';
import { Receipt } from '../types/Receipt';
import aldi from './responses/aldi.json';

// async function getReceiptData(imageUrl: string) {
//   const response = await veryfi.process_document_from_url(imageUrl);
//   console.log(response);
//   return response;
// }

async function getReceiptData(imageUrl: string) {
  const receipt = aldi as unknown as Receipt;
  // console.log(receipt);
  // console.log(typeof receipt);

  return receipt;
}

const url = 'https://miro.medium.com/v2/resize:fit:640/format:webp/1*MLRlL9W69PMWAcTF-rV36Q.jpeg';

export default getReceiptData;