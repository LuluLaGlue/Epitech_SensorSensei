#ifndef CONFIGURATION_H
#define CONFIGURATION_H

#define LORA_FREQUENCY                      (866E6)
#define LORA_SEND_DATA_DELAY_MINUTES        (10)
#define LORA_DEVICE_ADDRESSE                (0x0E)
#define LORA_DESTINATION_ADDRESSE           (0x72)

#define DAY_LIGHT_OFFSET_SEC	              (0)
#define GMT_TIMEZONE_SEC		                (3600*2)
#define NTP_TIME_SERVER                     "de.pool.ntp.org" 

#define API_ADDRESSE                        "http://192.168.144.175:8080/static/v2/push-sensor-data"
#define X_SENSOR                            "esp32-1743927815"

#define WIFI_SSID 		                      "OnePlus"
#define WIFI_PASSWORD 	                    "bibubibibu"

#endif // CONFIGURATION_H
