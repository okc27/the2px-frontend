// src/api.js
import axios from 'axios';

const API_BASE_URL = 'https://react.the2px.com/wp-json/wp/v2/';

export const fetchSvgImages = async () => {
    const response = await axios.get(`${API_BASE_URL}svg-images`);
    return response.data;
};
