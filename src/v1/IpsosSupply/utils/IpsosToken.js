const axios = require('axios');
const GET_TOKEN = require('./config');

module.exports.getIpsosToken = async function () {
  try {
    const response = await axios.post(
      "https://api.sample.ipsos.com/token",
      new URLSearchParams({
        'grant_type': 'password',
        'username': 'Zamplia_API@zamplia.com',
        'password': 'Zamplia1122##'
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'UserType': '2'
        }
      }
    );
    if (response.status === 200 && response.data) {
      return {
        success: true,
        accessToken: response.data.access_token
      };
    }
    return {
      success: false
    };

  } catch (error) {
    return {
      success: false
    };
  }
}
