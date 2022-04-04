const sqlite3 = require("sqlite3").verbose();
const express = require("express");
const axios = require("axios");

const router = express.Router();

const average = (array) => array.reduce((a, b) => a + b) / array.length;

const conv = (date) => {
    var pad = (num) => {
        return ("00" + num).slice(-2);
    };
    var tz_date;
    tz_date = date === "now" ? new Date() : new Date(date);
    tz_date =
        tz_date.getFullYear() +
        pad(tz_date.getMonth() + 1) +
        pad(tz_date.getDate()) +
        pad(tz_date.getHours()) +
        pad(tz_date.getMinutes());
    return tz_date;
};

const reverse_conv = (date) => {
    var pad = (num) => {
        return ("00" + num).slice(-2);
    };
    var tz_date = date.toString();
    year = tz_date.substring(0, 4);
    month = tz_date.substring(4, 6);
    day = tz_date.substring(6, 8);
    hours = tz_date.substring(8, 10);
    minutes = tz_date.substring(10, 12);
    tz_date =
        year +
        "-" +
        pad(month) +
        "-" +
        pad(day) +
        " " +
        pad(hours) +
        ":" +
        pad(minutes);

    return tz_date;
};

const check_value = (v) => {
    return (
        v === "humidity" ||
        v === "temperature" ||
        v === "pressure" ||
        v === "noise" ||
        v === "pm" ||
        v === "aqi_us" ||
        v === "lat" ||
        v === "long" ||
        v === "alt"
    );
};

router
    .get("/data", async (req, res) => {
        const now = new Date();
        const delta_date = new Date(now.getTime() - 5 * 60 * 1000);
        const delta_time = parseInt(conv(delta_date));

        let db = new sqlite3.Database("src/db.db", (err) => {
            if (err) {
                res.status(400).send({
                    message: "Something went wrong",
                    err: err.message,
                });
                console.log(err);
                return err.message;
            }
        });

        const humidity = [];
        const temperature = [];
        const pressure = [];
        const noise = [];
        const pm = [];
        const aqi_us = [];
        const id_list = [];
        const timestamp_list = [];
        const position = {
            lat: [],
            long: [],
            alt: [],
        };
        let id = null;
        let timestamp = null;

        db.each(
            `SELECT * FROM data WHERE timestamp > ${delta_time} ORDER BY id`,
            (e, r) => {
                humidity.push(r.humidity);
                temperature.push(r.temperature);
                pressure.push(r.pressure);
                noise.push(r.noise);
                pm.push(r.pm);
                aqi_us.push(r.aqi_us);
                position.lat.push(r.lat);
                position.long.push(r.long);
                position.alt.push(r.alt);
                // Need to use these 2 lists to have an object per sensor
                id_list.push(r.id);
                timestamp_list.push(r.timestamp);
                // These should go away
                id = r.id;
                timestamp = reverse_conv(r.timestamp);
            },
            (err, row) => {
                if (err) {
                    res.status(400).send({
                        message: "Something went wrong",
                        err: err,
                    });
                    console.log(err);
                    return err;
                }
                // Not tested might be broken as hell
                // Not optimized at all
                let result = [];
                if (id_list.length !== 0) {
                    let i = 0;

                    while (i <= id_list.length) {
                        if (i === 0 || id_list[i - 1] !== id_list[i]) {
                            result.push({
                                id: id_list[i],
                                timestamp: timestamp_list[i],
                                position: {
                                    lat: position.lat[i],
                                    long: position.long[i],
                                    alt: position.alt[i],
                                    country: "",
                                },
                                humidity: [humidity[i]],
                                temperature: [temperature[i]],
                                pressure: [pressure[i]],
                                noise: noise[noise[i]],
                                pm: [pm[i]],
                                aqi_us: [aqi_us[i]],
                            });
                        } else {
                            result[result.length - 1].humidity.push(
                                humidity[i]
                            );
                            result[result.length - 1].temperature.push(
                                temperature[i]
                            );
                            result[result.length - 1].pressure.push(
                                pressure[i]
                            );
                            result[result.length - 1].noise.push(noise[i]);
                            result[result.length - 1].pm.push(pm[i]);
                            result[result.length - 1].aqi_us.push(aqi_us[i]);
                        }
                        i++;
                    }

                    i = 0;
                    while (i <= result.length) {
                        result[i].humidity = average(result[i].humidity);
                        result[i].temperature = average(result[i].temperature);
                        result[i].pressure = average(result[i].pressure);
                        result[i].noise = average(result[i].noise);
                        result[i].pm = average(result[i].pm);
                        result[i].aqi_us = average(result[i].aqi_us);
                        let api = await axios.get(
                            `http://api.geonames.org/countryCode?lat=${result[i].position.lat}&lng=${result[i].position.long}&username=lululaglue`
                        );
                        result[i].location.country = api.data.split("\r")[0]
                        i++;
                    }
                    res.send(result)
                } else {
                    res.status(404).send({ message: "Not Found" });
                }
                // if (id !== null) {
                //     axios
                //         .get(
                //             `http://api.geonames.org/countryCode?lat=${position.lat}&lng=${position.long}&username=lululaglue`
                //         )
                //         .then((r) => {
                //             result = {
                //                 timestamp: timestamp,
                //                 id: id,
                //                 location: {
                //                     latitude: position.lat,
                //                     longitude: position.long,
                //                     altitude: position.alt,
                //                     country: r.data.split("\r")[0],
                //                 },
                //                 sensordatavalues: {
                //                     humidity: average(humidity),
                //                     temperature: average(temperature),
                //                     pressure: average(pressure),
                //                     noise: average(noise),
                //                     pm: average(pm),
                //                     aqi_us: average(aqi_us),
                //                 },
                //             };
                //             res.send(result);
                //         })
                //         .catch((error) => {
                //             console.error(error);
                //         });
                // } else {
                //     res.status(404).send({ message: "Not Found" });
                // }
            }
        ).close((err) => {
            if (err) {
                res.status(400).send({
                    message: "Something went wrong",
                    err: err.message,
                });
                console.log(err);
                return err.message;
            }
        });

        return 0;
    })
    .get("/data.1h", (req, res) => {
        const now = new Date();
        const delta_date = new Date(now.getTime() - 60 * 60 * 1000);
        const delta_time = parseInt(conv(delta_date));

        let db = new sqlite3.Database("src/db.db", (err) => {
            if (err) {
                res.status(400).send({
                    message: "Something went wrong",
                    err: err.message,
                });
                console.log(err);
                return err.message;
            }
        });

        const humidity = [];
        const temperature = [];
        const pressure = [];
        const noise = [];
        const pm = [];
        const aqi_us = [];
        const position = {
            lat: 0,
            long: 0,
            alt: 0,
        };
        let id = null;
        let timestamp = null;

        db.each(
            `SELECT * FROM data WHERE timestamp > ${delta_time} ORDER BY id`,
            (e, r) => {
                humidity.push(r.humidity);
                temperature.push(r.temperature);
                pressure.push(r.pressure);
                noise.push(r.noise);
                pm.push(r.pm);
                aqi_us.push(r.aqi_us);
                position.lat = r.lat;
                position.long = r.long;
                position.alt = r.alt;
                id = r.id;
                timestamp = reverse_conv(r.timestamp);
            },
            (err, row) => {
                if (err) {
                    res.status(400).send({
                        message: "Something went wrong",
                        err: err,
                    });
                    console.log(err);
                    return err;
                }

                if (id !== null) {
                    axios
                        .get(
                            `http://api.geonames.org/countryCode?lat=${position.lat}&lng=${position.long}&username=lululaglue`
                        )
                        .then((r) => {
                            result = {
                                timestamp: timestamp,
                                id: id,
                                location: {
                                    latitude: position.lat,
                                    longitude: position.long,
                                    altitude: position.alt,
                                    country: r.data.split("\r")[0],
                                },
                                sensordatavalues: {
                                    humidity: average(humidity),
                                    temperature: average(temperature),
                                    pressure: average(pressure),
                                    noise: average(noise),
                                    pm: average(pm),
                                    aqi_us: average(aqi_us),
                                },
                            };
                            res.send(result);
                        })
                        .catch((error) => {
                            console.error(error);
                        });
                } else {
                    res.status(404).send({ message: "Not Found" });
                }
            }
        ).close((err) => {
            if (err) {
                res.status(400).send({
                    message: "Something went wrong",
                    err: err.message,
                });
                console.log(err);
                return err.message;
            }
        });

        return 0;
    })
    .get("/data.24h", (req, res) => {
        const now = new Date();
        const delta_date = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const delta_time = parseInt(conv(delta_date));

        let db = new sqlite3.Database("src/db.db", (err) => {
            if (err) {
                res.status(400).send({
                    message: "Something went wrong",
                    err: err.message,
                });
                console.log(err);
                return err.message;
            }
        });

        const humidity = [];
        const temperature = [];
        const pressure = [];
        const noise = [];
        const pm = [];
        const aqi_us = [];
        const position = {
            lat: 0,
            long: 0,
            alt: 0,
        };
        let id = null;
        let timestamp = null;

        db.each(
            `SELECT * FROM data WHERE timestamp > ${delta_time} ORDER BY id`,
            (e, r) => {
                humidity.push(r.humidity);
                temperature.push(r.temperature);
                pressure.push(r.pressure);
                noise.push(r.noise);
                pm.push(r.pm);
                aqi_us.push(r.aqi_us);
                position.lat = r.lat;
                position.long = r.long;
                position.alt = r.alt;
                id = r.id;
                timestamp = reverse_conv(r.timestamp);
            },
            (err, row) => {
                if (err) {
                    res.status(400).send({
                        message: "Something went wrong",
                        err: err,
                    });
                    console.log(err);
                    return err;
                }

                if (id !== null) {
                    axios
                        .get(
                            `http://api.geonames.org/countryCode?lat=${position.lat}&lng=${position.long}&username=lululaglue`
                        )
                        .then((r) => {
                            result = {
                                timestamp: timestamp,
                                id: id,
                                location: {
                                    latitude: position.lat,
                                    longitude: position.long,
                                    altitude: position.alt,
                                    country: r.data.split("\r")[0],
                                },
                                sensordatavalues: {
                                    humidity: average(humidity),
                                    temperature: average(temperature),
                                    pressure: average(pressure),
                                    noise: average(noise),
                                    pm: average(pm),
                                    aqi_us: average(aqi_us),
                                },
                            };
                            res.send(result);
                        })
                        .catch((error) => {
                            console.error(error);
                        });
                } else {
                    res.status(404).send({ message: "Not Found" });
                }
            }
        ).close((err) => {
            if (err) {
                res.status(400).send({
                    message: "Something went wrong",
                    err: err.message,
                });
                console.log(err);
                return err.message;
            }
        });

        return 0;
    })
    .get("/data.temp.min", (req, res) => {
        const delta_time = parseInt(conv("now")) - 5;

        let db = new sqlite3.Database("src/db.db", (err) => {
            if (err) {
                res.status(400).send({
                    message: "Something went wrong",
                    err: err.message,
                });
                console.log(err);
                return err.message;
            }
        });

        const humidity = [];
        const temperature = [];
        const pressure = [];
        const position = {
            lat: 0,
            long: 0,
            alt: 0,
        };
        let id = null;
        let timestamp = null;

        db.each(
            `SELECT temperature, humidity, pressure, id FROM data WHERE timestamp > ${delta_time} ORDER BY id`,
            (e, r) => {
                humidity.push(r.humidity);
                temperature.push(r.temperature);
                pressure.push(r.pressure);
                position.lat = r.lat;
                position.long = r.long;
                position.alt = r.alt;
                id = r.id;
                timestamp = reverse_conv(r.timestamp);
            },
            (err, row) => {
                if (err) {
                    res.status(400).send({
                        message: "Something went wrong",
                        err: err,
                    });
                    console.log(err);
                    return err;
                }

                if (id !== null) {
                    axios
                        .get(
                            `http://api.geonames.org/countryCode?lat=${position.lat}&lng=${position.long}&username=lululaglue`
                        )
                        .then((r) => {
                            result = {
                                timestamp: timestamp,
                                id: id,
                                location: {
                                    latitude: position.lat,
                                    longitude: position.long,
                                    altitude: position.alt,
                                    country: r.data.split("\r")[0],
                                },
                                sensordatavalues: {
                                    humidity: average(humidity),
                                    temperature: average(temperature),
                                    pressure: average(pressure),
                                },
                            };
                            res.send(result);
                        })
                        .catch((error) => {
                            console.error(error);
                        });
                } else {
                    res.status(404).send({ message: "Not Found" });
                }
            }
        ).close((err) => {
            if (err) {
                res.status(400).send({
                    message: "Something went wrong",
                    err: err.message,
                });
                console.log(err);
                return err.message;
            }
        });

        return 0;
    })
    .post("/push-sensor-data", (req, res) => {
        const id = req.header("X-Sensor");
        const timestamp = conv("now");
        const sensordatavalues = req.body.sensordatavalues;

        console.log(sensordatavalues);

        let query_column = "INSERT INTO data (id, timestamp, ";
        let query_values = `) VALUES ('${id}', '${timestamp}', `;

        // const software_version = req.body.software_version;

        let error = false;

        sensordatavalues.forEach((v) => {
            console.log(v.value_type);
            console.log(check_value(v.value_type));
            if (!check_value(v.value_type)) {
                error = true;
            } else if (!error) {
                query_column += `'${v.value_type}', `;
                query_values += `${parseFloat(v.value)}, `;
            }

            return 0;
        });

        query_column = query_column.slice(0, -2);
        query_values = query_values.slice(0, -2);
        query_values += ")";

        let db = new sqlite3.Database("src/db.db", (err) => {
            if (err) {
                res.status(400).send({
                    message: "Something went wrong",
                    err: err.message,
                });
                console.log(err);
                return err.message;
            }
        });

        db.run(query_column + query_values, (err) => {
            if (err) {
                res.status(400).send({
                    message: "Something went wrong",
                    err: err.message,
                });
                console.log(err);
                return err.message;
            }
            res.status(201).send({
                message: "Data created",
                timestamp: timestamp,
                id: id,
                data: sensordatavalues,
            });
        }).close((err) => {
            if (err) {
                res.status(400).send({
                    message: "Something went wrong",
                    err: err.message,
                });
                console.log(err);
                return err.message;
            }
        });

        return 0;
    });

module.exports = router;
