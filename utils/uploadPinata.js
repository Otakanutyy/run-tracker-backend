const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

const PINATA_JWT = process.env.PINATA_JWT;

const uploadToPinata = async (filePath) => {
  const data = new FormData();
  data.append('file', fs.createReadStream(filePath));

  try {
    const res = await axios.post(
      'https://api.pinata.cloud/pinning/pinFileToIPFS',
      data,
      {
        maxContentLength: Infinity,
        headers: {
          'Authorization': `Bearer ${PINATA_JWT}`,
          ...data.getHeaders()
        }
      }
    );

    const ipfsHash = res.data.IpfsHash;
    return `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
  } catch (err) {
    console.error('Pinata upload error:', err.response?.data || err.message);
    throw err;
  }
};

module.exports = uploadToPinata;
