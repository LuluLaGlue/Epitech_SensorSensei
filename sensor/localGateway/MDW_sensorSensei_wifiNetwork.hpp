#ifndef MDW_SENSORSENSEI_WIFINETWORK_HPP
#define MDW_SENSORSENSEI_WIFINETWORK_HPP

#include <stdint.h>
#include "time.h"

class WifiNetwork
{
public:
	struct tm timeInfo;
	
	uint8_t initialize(void);
	uint8_t getTime(void);
	
private:	
	uint8_t connectingNetwork(void);
	uint8_t setTime(void);
};

#endif // MDW_SENSORSENSEI_WIFINETWORK_HPP
