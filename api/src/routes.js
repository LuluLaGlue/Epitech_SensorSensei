const sqlite3 = require("sqlite3").verbose();
const express = require("express");
const router = express.Router();

const conv = (date) => {
    var pad = (num) => {
        return ("00" + num).slice(-2);
    };
    var tz_date;
    tz_date = date === "now" ? new Date() : new Date(date);
    tz_date =
        tz_date.getFullYear() +
        "-" +
        pad(tz_date.getMonth() + 1) +
        "-" +
        pad(tz_date.getDate()) +
        " " +
        pad(tz_date.getHours()) +
        ":" +
        pad(tz_date.getMinutes()) +
        ":" +
        pad(tz_date.getSeconds());
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
    .get("/data", (req, res) => {
        res.json({ message: "Return Average Per Sensor For Last 5 Minutes" });
        return 0;
    })
    .get("/data.1h", (req, res) => {
        res.json({ message: "Return Average Per Sensor For Last 1 Hour" });
        return 0;
    })
    .get("/data.24h", (req, res) => {
        res.json({ message: "Return Average Per Sensor For Last 24 Hours" });
        return 0;
    })
    .get("/data.temp.min", (req, res) => {
        res.json({
            message:
                "Return Average Temp/Humidity/Air Pressure For Last 5 Minutes",
        });
        return 0;
    })
    .post("/push-sensor-data", (req, res) => {
        const id = Math.random().toString(36).substring(2, 12);
        const timestamp = conv("now");
        const sensordatavalues = req.body.sensordatavalues;

        let query_column = "INSERT INTO data (id, timestamp, ";
        let query_values = `) VALUES ('${id}', '${timestamp}', `;

        // const software_version = req.body.software_version;

        let error = false;

        sensordatavalues.forEach((v) => {
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
