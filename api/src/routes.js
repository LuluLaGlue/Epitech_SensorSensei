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
        pad(tz_date.getMinutes()) +
        pad(tz_date.getSeconds());
    return tz_date;
};

const check_value = (v) => {
    return (
        v === "humidity" ||
        v === "temperature" ||
        v === "pressure" ||
        v === "pm" ||
        v === "aqi_us" ||
        v === "lat" ||
        v === "long" ||
        v === "alt"
    );
};

router
    .get("/data", async (_, res) => {
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
        const pm = [];
        const aqi_us = [];
        const id_list = [];
        const timestamp_list = [];
        const position = {
            lat: [],
            long: [],
            alt: [],
        };

        await db
            .each(
                `SELECT * FROM data WHERE timestamp > ${delta_time} ORDER BY id, timestamp DESC`,
                (_, r) => {
                    humidity.push(r.humidity);
                    temperature.push(r.temperature);
                    pressure.push(r.pressure);
                    pm.push(r.pm);
                    aqi_us.push(r.aqi_us);
                    position.lat.push(r.lat);
                    position.long.push(r.long);
                    position.alt.push(r.alt);
                    id_list.push(r.id);
                    timestamp_list.push(r.timestamp);
                },
                async (err, _) => {
                    if (err) {
                        res.status(400).send({
                            message: "Something went wrong",
                            err: err,
                        });
                        console.log(err);
                        return err;
                    }
                    let result = [];
                    if (id_list.length !== 0) {
                        let i = 0;
                        // Timestamp is returning oldest timestamp, should be newest
                        while (i < id_list.length) {
                            if (i === 0 || id_list[i - 1] !== id_list[i]) {
                                result.push({
                                    id: id_list[i],
                                    timestamp: timestamp_list[i],
                                    location: {
                                        lat: position.lat[i],
                                        long: position.long[i],
                                        alt: position.alt[i],
                                        country: "",
                                    },
                                    humidity: [humidity[i]],
                                    temperature: [temperature[i]],
                                    pressure: [pressure[i]],
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
                                result[result.length - 1].pm.push(pm[i]);
                                result[result.length - 1].aqi_us.push(
                                    aqi_us[i]
                                );
                            }
                            i++;
                        }
                        console.log(result);

                        i = 0;
                        while (i < result.length) {
                            result[i].humidity = average(result[i].humidity);
                            result[i].temperature = average(
                                result[i].temperature
                            );
                            result[i].pressure = average(result[i].pressure);
                            result[i].pm = average(result[i].pm);
                            result[i].aqi_us = average(result[i].aqi_us);
                            let api = await axios.get(
                                `http://api.geonames.org/countryCode?lat=${result[i].location.lat}&lng=${result[i].location.long}&username=lululaglue`
                            );
                            result[i].location.country =
                                api.data.split("\r")[0];
                            i++;
                        }
                        res.send(result);
                    } else {
                        res.status(404).send({ message: "Not Found" });
                    }
                }
            )
            .close((err) => {
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
    .get("/data.1h", async (_, res) => {
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
        const pm = [];
        const aqi_us = [];
        const id_list = [];
        const timestamp_list = [];
        const position = {
            lat: [],
            long: [],
            alt: [],
        };

        await db
            .each(
                `SELECT * FROM data WHERE timestamp > ${delta_time} ORDER BY id, timestamp DESC`,
                (_, r) => {
                    humidity.push(r.humidity);
                    temperature.push(r.temperature);
                    pressure.push(r.pressure);
                    pm.push(r.pm);
                    aqi_us.push(r.aqi_us);
                    position.lat.push(r.lat);
                    position.long.push(r.long);
                    position.alt.push(r.alt);
                    id_list.push(r.id);
                    timestamp_list.push(r.timestamp);
                },
                async (err, _) => {
                    if (err) {
                        res.status(400).send({
                            message: "Something went wrong",
                            err: err,
                        });
                        console.log(err);
                        return err;
                    }
                    let result = [];
                    if (id_list.length !== 0) {
                        let i = 0;

                        while (i < id_list.length) {
                            if (i === 0 || id_list[i - 1] !== id_list[i]) {
                                result.push({
                                    id: id_list[i],
                                    timestamp: timestamp_list[i],
                                    location: {
                                        lat: position.lat[i],
                                        long: position.long[i],
                                        alt: position.alt[i],
                                        country: "",
                                    },
                                    humidity: [humidity[i]],
                                    temperature: [temperature[i]],
                                    pressure: [pressure[i]],
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
                                result[result.length - 1].pm.push(pm[i]);
                                result[result.length - 1].aqi_us.push(
                                    aqi_us[i]
                                );
                            }
                            i++;
                        }

                        i = 0;
                        while (i < result.length) {
                            result[i].humidity = average(result[i].humidity);
                            result[i].temperature = average(
                                result[i].temperature
                            );
                            result[i].pressure = average(result[i].pressure);
                            result[i].pm = average(result[i].pm);
                            result[i].aqi_us = average(result[i].aqi_us);
                            let api = await axios.get(
                                `http://api.geonames.org/countryCode?lat=${result[i].location.lat}&lng=${result[i].location.long}&username=lululaglue`
                            );
                            result[i].location.country =
                                api.data.split("\r")[0];
                            i++;
                        }
                        res.send(result);
                    } else {
                        res.status(404).send({ message: "Not Found" });
                    }
                }
            )
            .close((err) => {
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
    .get("/data.24h", async (req, res) => {
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

        console.log(req.headers);

        const humidity = [];
        const temperature = [];
        const pressure = [];
        const pm = [];
        const aqi_us = [];
        const id_list = [];
        const timestamp_list = [];
        const position = {
            lat: [],
            long: [],
            alt: [],
        };

        await db
            .each(
                `SELECT * FROM data WHERE timestamp > ${delta_time} ORDER BY id, timestamp DESC`,
                (_, r) => {
                    humidity.push(r.humidity);
                    temperature.push(r.temperature);
                    pressure.push(r.pressure);
                    pm.push(r.pm);
                    aqi_us.push(r.aqi_us);
                    position.lat.push(r.lat);
                    position.long.push(r.long);
                    position.alt.push(r.alt);
                    id_list.push(r.id);
                    timestamp_list.push(r.timestamp);
                },
                async (err, _) => {
                    if (err) {
                        res.status(400).send({
                            message: "Something went wrong",
                            err: err,
                        });
                        console.log(err);
                        return err;
                    }
                    let result = [];
                    if (id_list.length !== 0) {
                        let i = 0;

                        while (i < id_list.length) {
                            if (i === 0 || id_list[i - 1] !== id_list[i]) {
                                result.push({
                                    id: id_list[i],
                                    timestamp: timestamp_list[i],
                                    location: {
                                        lat: position.lat[i],
                                        long: position.long[i],
                                        alt: position.alt[i],
                                        country: "",
                                    },
                                    humidity: [humidity[i]],
                                    temperature: [temperature[i]],
                                    pressure: [pressure[i]],
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
                                result[result.length - 1].pm.push(pm[i]);
                                result[result.length - 1].aqi_us.push(
                                    aqi_us[i]
                                );
                            }
                            i++;
                        }

                        i = 0;
                        while (i < result.length) {
                            result[i].humidity = average(result[i].humidity);
                            result[i].temperature = average(
                                result[i].temperature
                            );
                            result[i].pressure = average(result[i].pressure);
                            result[i].pm = average(result[i].pm);
                            result[i].aqi_us = average(result[i].aqi_us);
                            let api = await axios.get(
                                `http://api.geonames.org/countryCode?lat=${result[i].location.lat}&lng=${result[i].location.long}&username=lululaglue`
                            );
                            result[i].location.country =
                                api.data.split("\r")[0];
                            i++;
                        }
                        res.send(result);
                    } else {
                        res.status(404).send({ message: "Not Found" });
                    }
                }
            )
            .close((err) => {
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
    .get("/data.temp.min", async (_, res) => {
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
        const id_list = [];
        const timestamp_list = [];
        const position = {
            lat: [],
            long: [],
            alt: [],
        };

        await db
            .each(
                `SELECT * FROM data WHERE timestamp > ${delta_time} ORDER BY id, timestamp DESC`,
                (_, r) => {
                    humidity.push(r.humidity);
                    temperature.push(r.temperature);
                    pressure.push(r.pressure);
                    position.lat.push(r.lat);
                    position.long.push(r.long);
                    position.alt.push(r.alt);
                    id_list.push(r.id);
                    timestamp_list.push(r.timestamp);
                },
                async (err, _) => {
                    if (err) {
                        res.status(400).send({
                            message: "Something went wrong",
                            err: err,
                        });
                        console.log(err);
                        return err;
                    }
                    let result = [];
                    if (id_list.length !== 0) {
                        let i = 0;

                        while (i < id_list.length) {
                            if (i === 0 || id_list[i - 1] !== id_list[i]) {
                                result.push({
                                    id: id_list[i],
                                    timestamp: timestamp_list[i],
                                    location: {
                                        lat: position.lat[i],
                                        long: position.long[i],
                                        alt: position.alt[i],
                                        country: "",
                                    },
                                    humidity: [humidity[i]],
                                    temperature: [temperature[i]],
                                    pressure: [pressure[i]],
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
                            }
                            i++;
                        }

                        i = 0;
                        while (i < result.length) {
                            result[i].humidity = average(result[i].humidity);
                            result[i].temperature = average(
                                result[i].temperature
                            );
                            result[i].pressure = average(result[i].pressure);
                            let api = await axios.get(
                                `http://api.geonames.org/countryCode?lat=${result[i].location.lat}&lng=${result[i].location.long}&username=lululaglue`
                            );
                            result[i].location.country =
                                api.data.split("\r")[0];
                            i++;
                        }
                        res.send(result);
                    } else {
                        res.status(404).send({ message: "Not Found" });
                    }
                }
            )
            .close((err) => {
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
    .post("/push-sensor-data", async (req, res) => {
        const id = req.header("X-Sensor");
        const timestamp = conv("now");
        const headers = req.headers;
        const body = {
            software_version: req.body.software_version,
            location: {
                longitude: "4.835156",
                latitude: "45.746286",
                id: 231,
                country: "FR",
                indoor: 0,
                exact_location: 0,
                altitude: "180.1",
            },
            sensordatavalues: [
                {
                    value_type: "pressure",
                    value: parseFloat(req.body.pressure),
                },
                {
                    value_type: "temperature",
                    value: parseFloat(req.body.temperature),
                },
                {
                    value_type: "humidity",
                    value: parseFloat(req.body.humidity),
                },
                { value_type: "P2", value: parseFloat(req.body.pm) },
            ],
        };

        let query = `INSERT INTO data (id, timestamp, lat, long, alt, pressure, humidity, pm, temperature) VALUES ('${id}', '${timestamp}', ${
            body.location.latitude
        }, ${body.location.longitude}, ${body.location.altitude}, ${parseFloat(
            req.body.pressure
        )}, ${parseFloat(req.body.humidity)}, ${parseFloat(
            req.body.pm
        )}, ${parseFloat(req.body.temperature)})`;

        const sensor_community = await axios.post(
            "https://api.sensor.community/v1/push-sensor-data/",
            body,
            {
                headers: headers,
            }
        );

        if (sensor_community.status !== 201) {
            res.status(sensor_community.status).send({
                err: "Sensor Community Error",
                message: "Unable to send data to sensor community",
            });

            return 1;
        }

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

        db.run(query, (err) => {
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
                data: body,
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
