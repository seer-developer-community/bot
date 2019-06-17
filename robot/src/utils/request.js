import fetch from 'dva/fetch';
import qs from 'qs';
function parseJSON(response) {
    return response.json();
}

function checkStatus(response) {
    if (response.status >= 200 && response.status < 300) {
        return response;
    }

    const error = new Error(response.statusText);
    error.response = response;
    throw error;
}

/**
 * Requests a URL, returning a promise.
 *
 * @param  {string} url       The URL we want to request
 * @param  {object} [options] The options we want to pass to "fetch"
 * @return {object}           An object containing either "data" or "err"
 */
function request(url, options) {
    url = `http://localhost:4000/api/${url}`;
    options.headers = {
        'Accept': '*/*',
        // 'Content-Type': 'application/json',    
        "Content-type": "application/x-www-form-urlencoded; charset=UTF-8",
    }
    return fetch(url, options)
        .then(checkStatus)
        .then(parseJSON)
        .catch(err => ({ err }));
}

export default {
    get: (url, params) => {
        return request(`${url}?${qs.stringify(params)}`, {
            method: "get"
        });
    },
    post: (url, params) => {
        return request(url, {
            method: "post",
            body: qs.stringify(params)
        });
    }
}
