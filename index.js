const https = require("https");
const defaultOptions = {
    hostname: "www.letras.mus.br",
    port: 443,
    method: "GET",
    headers: {
        "Host": "www.letras.mus.br",
    }
};

const getSongDocument = (artistDNS, songUrl) => {
    const options = Object.assign({}, defaultOptions);
    options.path = `/${artistDNS}/${songUrl}/`;
    return new Promise((resolve, reject) => {
        const req = https.request(options, (response) => {
            let data = "";
            response.on("data", (chunk) => {
                data += chunk;
            });
            response.on("end", () => {
                resolve(data);
            });
        }).on("error", (error) => {
            reject(error);
        }).end();
    });
};
const matchSongDataScript = (data) => {
    const regex = /<script id="head_scripts_vars">[\s\n\r]*?window.__pageArgs=([\s\S]*?);[\s\r\n]*?window.__pageArgs = window.__pageArgs \|\| {};/gm;
    const match = regex.exec(data);
    if (match) {
        return match[1];
    }
    return null;
}
const getSongMetadata = (artistDNS, songUrl) => {
    return getSongDocument(artistDNS, songUrl)
        .then((data) => {
            const jsonMetadata = matchSongDataScript(data);
            if (jsonMetadata) {
                const metadata = JSON.parse(jsonMetadata);
                return metadata;
            }
            return null;
        });
}
getSongMetadata("teto", "groupies").then((data) => {
    console.log(data);
});