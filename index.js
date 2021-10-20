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

const getArtistDocument = (artistDNS) => {
    const options = Object.assign({}, defaultOptions);
    options.path = `/${artistDNS}/`;
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
const matchArtistDataScript = (data) => {
    const regex = /<script type="application\/ld\+json">(\{"@context":"http:\/\/schema.org\/","@id":"https:\/\/www.letras.mus.br\/[^<>]+\/","@type":"MusicGroup"[\s\S]+?\})?<\/script>/gm;
    const match = regex.exec(data);
    if (match) {
        return match[1];
    }
    return null;
}
const getArtistMetadata = (artistDNS) => {
    return getArtistDocument(artistDNS)
        .then((data) => {
            const jsonMetadata = matchArtistDataScript(data);
            if (jsonMetadata) {
                const metadata = JSON.parse(jsonMetadata);
                return metadata;
            }
            return null;
        });
}

const getArtistsByGenreDocument = (genre) => {
    const options = Object.assign({}, defaultOptions);
    options.path = `/estilos/${genre}/todosartistas.html`;
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
const parseArtistsByGenre = (document) => {
    const regex = /<a href="\/([a-z0-9A-Z/\-]+?)\/">/gm;
    var match = regex.exec(document);
    var matches = [];
    while (match) {
        matches.push(match[1]);
        match = regex.exec(document);
    }
    return matches;
};
const getArtistsByGenre = (genre) => {
    return getArtistsByGenreDocument(genre)
        .then(parseArtistsByGenre)
}

const getGenresDocument = () => {
    const options = Object.assign({}, defaultOptions);
    options.path = `/estilos/`;
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
const parseGenres = (document) => {
    const genreList = document.match(/(<ul class="cnt-list cnt-list--col2">[\s\S]+?<\/ul>)/gm);
    const regex = /<a href="\/estilos\/([a-z0-9A-Z/\-]+?)\/">/gm;
    var match = regex.exec(genreList);
    var matches = [];
    while (match) {
        matches.push(match[1]);
        match = regex.exec(genreList);
    }
    return matches;
};
const getGenres = () => {
    return getGenresDocument()
        .then(parseGenres)
}

getGenres().then(console.log)

getArtistsByGenre("rock").then(console.log)

getSongMetadata("teto", "groupies").then((data) => {
    console.log("[getSongMetadata]: ", data);
});
getArtistMetadata("teto").then((data) => {
    console.log("[getArtistMetadata]: ", data);
});

