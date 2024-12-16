import Client from '@veryfi/veryfi-sdk';

const CLIENT_ID = process.env.VERYFI_CLIENT_ID as string;
const CLIENT_SECRET = process.env.VERYFI_CLIENT_SECRET as string;
const USERNAME = process.env.VERYFI_USERNAME as string;
const API_KEY = process.env.VERYFI_API_KEY as string;

console.log(CLIENT_ID, CLIENT_SECRET, USERNAME, API_KEY);
console.log(process.env);

const veryfi = new Client(CLIENT_ID, CLIENT_SECRET, USERNAME, API_KEY);

export default veryfi;