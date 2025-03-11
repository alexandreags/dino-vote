const axios = require('axios');
require('dotenv').config();

const PEXELS_API_URL = 'https://api.pexels.com/v1/search';
const PEXELS_API_KEY = process.env.PEXELS_API_KEY;

async function fetchImages(keyword) {
    try {
        const response = await axios.get(PEXELS_API_URL, {
            headers: {
                Authorization: PEXELS_API_KEY,
            },
            params: {
                query: "dinosaur",
                per_page: 15,
            },
        });
        //console.log('Response Data PEXELS:', response.data.photos);
        return response.data.photos.map(photo => photo.src.original);

    } catch (error) {
        console.error('Error fetching images from Pexels:', error);
        throw error;
    }
}

const fetchDinosaurImages = async () => {
  const response = await axios.get('https://api.pexels.com/v1/search', {
    headers: {
      Authorization: process.env.PEXELS_API_KEY,
    },
    params: {
      query: 'dinosaur',
      per_page: 20,
    },
  });
  return response.data.photos;
};

module.exports = {
    fetchImages,
    fetchDinosaurImages,
};